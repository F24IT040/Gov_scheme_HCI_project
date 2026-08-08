import { askGroq } from './groq.js';
import { askGemini } from './gemini.js';
import { normalizeSchemeForCache } from './schemeCache.js';

/* ── helpers ──────────────────────────────────────────────────────── */
function toArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(/\n|\.|\u2022|;/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function extractJsonPayload(text) {
  const cleaned = String(text || '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  // Try direct parse first
  try { return JSON.parse(cleaned); } catch { /* fall through */ }

  // Try pulling the first [...] or {...} block
  const arrMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrMatch) { try { return JSON.parse(arrMatch[0]); } catch { /* fall through */ } }

  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) { try { return JSON.parse(objMatch[0]); } catch { /* fall through */ } }

  throw new Error(`Groq did not return valid JSON. Raw response (first 500 chars):\n${cleaned.slice(0, 500)}`);
}

/**
 * Detect whether the message is in Hindi (Devanagari script).
 * We also check common Hindi romanised words used by the app.
 */
function detectHindi(message = '') {
  const devanagariRange = /[\u0900-\u097F]/;
  if (devanagariRange.test(message)) return true;

  // Common romanised Hindi / Indian language keywords
  const hindiRomanised = [
    'yojana', 'kisan', 'sarkar', 'sarkari', 'labh', 'paisa', 'rupaye',
    'awas', 'bima', 'swasthya', 'rozgar', 'krishi', 'mahila', 'nari',
    'chaiye', 'chahiye', 'batao', 'bataiye', 'mujhe', 'mera', 'meri',
    'hoon', 'hai', 'kya', 'kaise', 'kitna', 'kab',
  ];
  const lower = message.toLowerCase();
  return hindiRomanised.some((w) => lower.includes(w));
}

function buildSearchPrompt(message, history = [], language = 'en') {
  const isHindi = language === 'hi' || detectHindi(message);
  const languageNote = isHindi
    ? 'The app is set to Hindi. Return every user-facing value, including scheme_name, eligibility, benefits, documents, dates, and application steps, in clear Hindi (Devanagari). Keep official URLs unchanged.'
    : 'The app is set to English. Return every user-facing value in clear English.';

  // Include last 2 turns only for follow-up context
  const conversationText = Array.isArray(history) && history.length > 0
    ? history.slice(-2).map((t) => `${t?.role || 'user'}: ${t?.content || ''}`).join('\n')
    : 'none';

  return `You are an expert on Indian government welfare schemes.
${languageNote}

The user is asking: "${message}"
Conversation context: ${conversationText}

Find ALL relevant Indian central and state government schemes for this request.
Return ONLY a valid JSON array — no markdown, no prose, no code fences.

Schema for each object:
{
  "scheme_name": "full official scheme name",
  "eligibility": ["criterion 1", "criterion 2"],
  "required_documents": ["doc 1", "doc 2"],
  "benefits": ["benefit description"],
  "process_steps": ["Step 1: short title — detailed action", "Step 2: short title — detailed action", "Step 3: short title — detailed action", "Step 4: short title — detailed action", "Step 5: short title — detailed action"],
  "application_process": ["Step 1: short title — detailed action", "Step 2: short title — detailed action", "Step 3: short title — detailed action", "Step 4: short title — detailed action", "Step 5: short title — detailed action"],
  "timeline": ["timeline info"],
  "dos_and_donts": ["do this", "don't do that"],
  "confidence_score": 85,
  "official_url": "https://..."
}

Rules:
- Follow the selected app language instruction above for scheme_name and every field value.
- Return 1–8 schemes depending on how many are genuinely relevant.
- If the query is very specific (one scheme name), return just that one with full details.
- If the query is broad (category / occupation / need), return multiple options.
- Only include schemes with a real official Indian government portal URL (.gov.in / .nic.in preferred).
- Set confidence_score 85–95 for well-known central schemes, 65–80 for state/less-known ones.
- Never return empty arrays.
- application_process MUST contain 5–7 numbered, practical steps. Each step must say what the citizen should do, where to do it, and what to keep or verify. Do not use vague labels such as "Submit form" without explanation.
- If a field has no data, omit that key.
- Do NOT wrap the array in any object — respond with [ ... ] at the top level.`;
}

function normalizePayload(payload, message, source) {
  return normalizeSchemeForCache(
    {
      scheme_name:         payload?.scheme_name,
      eligibility:         toArray(payload?.eligibility),
      required_documents:  toArray(payload?.required_documents),
      timeline:            toArray(payload?.timeline),
      process_steps:       toArray(payload?.process_steps),
      application_process: toArray(payload?.application_process),
      dos_and_donts:       toArray(payload?.dos_and_donts),
      benefits:            toArray(payload?.benefits),
      confidence_score:    Number(payload?.confidence_score) || 70,
      official_url:        payload?.official_url,
      source,
    },
    message
  );
}

export async function fetchLiveSchemeData(message, history = [], language = 'en') {
  const prompt = buildSearchPrompt(message, history, language);
  let responseText;
  let source;

  // Gemini handles scheme retrieval. Groq remains the fallback here and is
  // also used by the conversational-answer path in routes/chat.js.
  try {
    responseText = await askGemini(prompt, {
      responseMimeType: 'application/json',
      temperature: 0.2,
    });
    source = 'gemini_live';
  } catch (geminiError) {
    console.warn('[gemini] retrieval failed; falling back to Groq:', geminiError.message);
    responseText = await askGroq(prompt);
    source = 'groq_live';
  }

  const payload      = extractJsonPayload(responseText);
  const records      = Array.isArray(payload) ? payload : [payload];

  if (records.length === 0) {
    throw new Error('No valid scheme records returned by the AI provider');
  }

  return records
    .filter((r) => r && typeof r === 'object' && r.scheme_name)
    .map((record) => ({ ...normalizePayload(record, message, source), source }));
}
