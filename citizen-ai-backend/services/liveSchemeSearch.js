import { askGroq } from './groq.js';
import { normalizeSchemeForCache } from './schemeCache.js';

function toArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\n|\.|\u2022|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function extractJsonPayload(text) {
  const cleaned = String(text || '').trim();
  const withoutFences = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(withoutFences);
  } catch {
    const firstObject = withoutFences.match(/\{[\s\S]*\}/);
    if (firstObject) {
      return JSON.parse(firstObject[0]);
    }

    const firstArray = withoutFences.match(/\[[\s\S]*\]/);
    if (firstArray) {
      return JSON.parse(firstArray[0]);
    }

    throw new Error('Groq response did not contain valid JSON');
  }
}

function isFollowUpQuery(message = '') {
  const normalized = String(message || '').toLowerCase();
  return /\b(?:more|another|related|similar|also|other|additional|still|again|show me|tell me|find me|give me)\b/.test(normalized)
    && /\b(?:scheme|schemes|this|that|these|those|similar)\b/.test(normalized);
}

function getFollowUpHistory(message = '', history = []) {
  if (!isFollowUpQuery(message)) {
    return [];
  }

  return Array.isArray(history) ? history.slice(-2) : [];
}

function buildSearchPrompt(message, history = []) {
  const includeHistory = isFollowUpQuery(message);
  const conversationText = includeHistory
    ? getFollowUpHistory(message, history).map((turn) => `${turn?.role || 'user'}: ${turn?.content || ''}`).join('\n')
    : '';

  return `
You are a government scheme research assistant.
Search only official government sources and portals.
Prefer central and state government domains such as .gov.in, .nic.in, and official scheme portals.

Return ONLY valid JSON as an array of objects with this exact schema:
[
  {
    "scheme_name": "string",
    "eligibility": ["string"],
    "required_documents": ["string"],
    "timeline": ["string"],
    "process_steps": ["string"],
    "application_process": ["string"],
    "dos_and_donts": ["string"],
    "benefits": ["string"],
    "confidence_score": 0,
    "official_url": "string"
  }
]

Return all relevant schemes you can find for the given query.
If the user is asking for a need or category, provide multiple alternative scheme options.
Do not return only the single best match unless the query is explicitly narrow.
Do not force a fixed number like 5, 10, or 20.
If there are only a few relevant schemes, return only those.
If there are many, return as many as are clearly relevant and supported by official sources.
Do not include markdown, commentary, code fences, or any extra fields.

Rules:
- Use only verified official sources.
- If you are uncertain, lower confidence_score.
- Prefer central and state government portals, not third-party blogs.

User query: ${message}
Conversation context: ${conversationText || 'none'}
`.trim();
}

function normalizePayload(payload, message) {
  return normalizeSchemeForCache(
    {
      scheme_name: payload?.scheme_name,
      eligibility: toArray(payload?.eligibility),
      required_documents: toArray(payload?.required_documents),
      timeline: toArray(payload?.timeline),
      process_steps: toArray(payload?.process_steps),
      application_process: toArray(payload?.application_process),
      dos_and_donts: toArray(payload?.dos_and_donts),
      benefits: toArray(payload?.benefits),
      confidence_score: Number(payload?.confidence_score) || 70,
      official_url: payload?.official_url,
      source: 'groq_live'
    },
    message
  );
}

export async function fetchLiveSchemeData(message, history = []) {
  const prompt = buildSearchPrompt(message, history);
  const responseText = await askGroq(prompt);
  const payload = extractJsonPayload(responseText);
  const records = Array.isArray(payload) ? payload : [payload];

  if (records.length === 0) {
    throw new Error('No valid scheme records found in Groq response');
  }

  return records.map((record) => ({
    ...normalizePayload(record, message),
    source: 'groq_live'
  }));
}
