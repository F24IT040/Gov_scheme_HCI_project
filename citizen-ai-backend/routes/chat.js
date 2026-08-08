import { appendSchemeToCache, buildSchemeResponse, findCachedMatches } from '../services/schemeCache.js';
import { fetchLiveSchemeData } from '../services/liveSchemeSearch.js';
import { isConversationalEligibilityQuestion } from '../services/conversationClassifier.js';
import { askGroqConversation } from '../services/groq.js';

/* ── helpers ─────────────────────────────────────────────────────── */
function lo(v) { return String(v || '').toLowerCase(); }
function isHindi(t) { return /[\u0900-\u097F]/.test(t); }

function parseProfile(history, message, language = 'en') {
  const combined = [...(history || []).map(t => lo(t?.content)), lo(message)].join(' ');
  const hindi = language === 'hi' || isHindi(message);
  let intent = null;

  if (/student|scholar|school|college|padhna|vidyarthi|chhatra/.test(combined)) intent = 'student';
  else if (/farmer|kisan|farm|agriculture|krishi|kheti/.test(combined)) intent = 'farming';
  else if (/\b(women|woman|mahila|nari)\b/.test(combined)) intent = 'women';
  else if (/\b(housing|home|awas|ghar|makaan)\b/.test(combined)) intent = 'housing';

  const state = ['maharashtra','bihar','uttar pradesh','rajasthan','gujarat','karnataka',
    'tamil nadu','kerala','andhra pradesh','telangana','madhya pradesh','west bengal',
    'delhi','punjab','haryana','jharkhand','odisha'].find(s => combined.includes(s)) || null;

  return { intent, state, hindi };
}

function fallbackSuggestions(profile) {
  const h = profile.hindi;
  const map = {
    student:  h ? ['छात्रवृत्ति योजनाएँ','छात्र ऋण','कौशल प्रशिक्षण'] : ['Scholarship schemes','Student loans','Skill training'],
    farming:  h ? ['फसल बीमा','कृषि सब्सिडी','किसान पेंशन']          : ['Crop insurance','Farm subsidies','Farmer pension'],
    women:    h ? ['महिला सशक्तिकरण','महिला ऋण']                      : ['Women empowerment','Women self-employment'],
    housing:  h ? ['पीएम आवास योजना','किफायती आवास']                   : ['PM Awas Yojana','Affordable housing'],
  };
  return map[profile.intent] || (h
    ? ['छात्रवृत्ति','किसान योजना','आवास योजना','स्वास्थ्य']
    : ['Scholarship','Farmer schemes','Housing','Health schemes']);
}

function noMatchCard(profile, query) {
  const h = profile.hindi;
  return {
    id: '__no_match__',
    isNoMatch: true,
    kicker:    h ? 'कोई मिलान नहीं' : 'No match',
    title:     h ? 'कोई सटीक मिलान नहीं' : 'No exact match found',
    fullTitle: h ? 'कोई सटीक मिलान नहीं' : 'No exact match found',
    copy:      h ? 'योजना का नाम या अपनी श्रेणी बताएँ।' : 'Try a scheme name or describe your need.',
    summary:   h ? `"${query}" के लिए कोई योजना नहीं मिली।` : `No scheme found for: "${query}"`,
    benefit: '', eligibility: [], documents: [], process_steps: [], application_process: [],
    website: '', official_url: '', confidence: 'Low', confidence_score: 0,
    icon: 'Award', iconBg: 'rgb(245,245,245)', iconColor: 'rgb(160,160,160)',
    tag: h ? 'कोई मिलान नहीं' : 'No match',
    tagBg: 'rgb(245,245,245)', tagColor: 'rgb(160,160,160)',
    category: '', isSingleResult: true, benefitsSection: '',
    eligibilityCriteria: [], importantDates: [], rejectionReasons: [],
    personalizedEligibility: null,
  };
}

async function getSuggestions(message, history, profile, schemeNames) {
  const h = profile.hindi;
  const hist = (history || []).slice(-4).map(t => `${t?.role}: ${t?.content}`).join('\n') || 'none';
  const hint = schemeNames.length ? `Found: ${schemeNames.join(', ')}.` : '';
  const prompt = `Government scheme assistant for Indian citizens.
User: ${message}
History: ${hist}
${hint}
Return ONLY a JSON array of 3-5 short follow-up suggestions.
${h ? 'Write in Hindi.' : 'Write in English.'}
Example: ["What documents needed?","How to apply?"]`;

  const text = await askGroqConversation(prompt);
  const cleaned = text.replace(/```[a-z]*/gi,'').replace(/```/g,'').trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) return [];
  const arr = JSON.parse(match[0]);
  return Array.isArray(arr) ? arr.filter(s => typeof s === 'string').slice(0,5) : [];
}

/* ── main handler — exported as plain async function ─────────────── */
export default async function chatHandler(req, res) {
  const message = String(req.body?.message || '').trim();
  const history = Array.isArray(req.body?.history) ? req.body.history : [];
  const language = req.body?.language === 'hi' ? 'hi' : 'en';
  const profile = parseProfile(history, message, language);

  console.log(`\n[chat] "${message}" | hindi:${profile.hindi} | intent:${profile.intent}`);

  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    /* ── Conversational branch ── */
    if (isConversationalEligibilityQuestion(message)) {
      console.log('[chat] → conversational branch');
      let answer = profile.hindi
        ? 'अपनी राज्य, श्रेणी और आय बताएँ ताकि मैं बेहतर मार्गदर्शन कर सकूँ।'
        : 'Please share your state, category, and income for a precise answer.';

      try {
        const hist = history.slice(-6).map(t => t?.content || '').filter(Boolean).join('\n');
        answer = await askGroqConversation(
          `Government scheme assistant. ${profile.hindi ? 'Reply in Hindi.' : 'Reply in English.'}
History:\n${hist || 'none'}
Message: ${message}
Profile: ${JSON.stringify(profile)}
Answer the user's question directly and clearly. Do not list or recommend schemes unless the user explicitly asks for schemes.`
        );
      } catch (e) { console.warn('[chat] conversational Groq failed:', e.message); }

      let suggestions = fallbackSuggestions(profile);
      try { suggestions = await getSuggestions(message, history, profile, []); } catch {}

      return res.json({ summary: answer, answer, schemes: [], suggestions, isSingle: false, isEmpty: true, source: 'conversation' });
    }

    /* ── Live retrieval branch ── */
    console.log('[chat] → live retrieval branch');
    let liveSchemes = [];
    try {
      liveSchemes = await fetchLiveSchemeData(message, history, language);
      Promise.all(liveSchemes.map(s => appendSchemeToCache(s, message))).catch(() => {});
    } catch (e) {
      console.error('[chat] fetchLiveSchemeData error:', e.message);
      // Cached results remain useful if the AI provider is unavailable.
      try {
        const cachedSchemes = await findCachedMatches(message, history);
        if (cachedSchemes.length > 0) {
          return res.json({
            summary: 'Live AI search is unavailable. Showing matching saved results.',
            schemes: cachedSchemes,
            suggestions: fallbackSuggestions(profile),
            isSingle: cachedSchemes.length === 1,
            isEmpty: false,
            source: 'cache_fallback'
          });
        }
      } catch (cacheError) {
        console.error('[chat] cache fallback error:', cacheError.message);
      }

      return res.status(503).json({
        error: 'The AI service cannot be reached. Please check your internet connection, proxy, or firewall and try again.',
        source: 'live_unreachable'
      });
    }

    const schemes = liveSchemes.map(s => buildSchemeResponse(s, { query: message, source: s.source, isSingleResult: false }));
    console.log(`[chat] built ${schemes.length} scheme(s)`);

    if (schemes.length === 0) {
      const nm = noMatchCard(profile, message);
      return res.json({ summary: nm.summary, schemes: [nm], suggestions: fallbackSuggestions(profile), isSingle: true, isEmpty: true, source: 'live_empty' });
    }

    let suggestions = fallbackSuggestions(profile);
    try { suggestions = await getSuggestions(message, history, profile, schemes.map(s => s.title).filter(Boolean)); } catch {}

    const summary = profile.hindi
      ? `${schemes.length} योजना${schemes.length === 1 ? '' : 'एँ'} मिलीं।`
      : `Found ${schemes.length} scheme${schemes.length === 1 ? '' : 's'}.`;

    return res.json({ summary, schemes, suggestions, isSingle: schemes.length === 1, isEmpty: false, source: 'live_only' });

  } catch (e) {
    console.error('[chat] unhandled:', e.message);
    const nm = noMatchCard(profile, message);
    return res.json({ summary: nm.summary, schemes: [nm], suggestions: fallbackSuggestions(profile), isSingle: true, isEmpty: true, source: 'error' });
  }
}
