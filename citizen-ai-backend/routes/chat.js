import express from 'express';

import { appendSchemeToCache, buildSchemeResponse } from '../services/schemeCache.js';
import { fetchLiveSchemeData } from '../services/liveSchemeSearch.js';
import { isConversationalEligibilityQuestion } from '../services/conversationClassifier.js';
import { askGroqConversation } from '../services/groq.js';

const router = express.Router();

function normalize(value) {
  return String(value || '').toLowerCase();
}

function isBroadUserRequest(message = '') {
  const normalized = normalize(message);
  const broadTriggers = [
    'student', 'farmer', 'housewife', 'self employed', 'unemployed',
    'looking for schemes', 'need schemes', 'help me', 'show me', 'give me',
    'finding schemes', 'i want more', 'related schemes', 'support', 'loan',
    'scholarship', 'accommodation', 'housing', 'travel',
    'women', 'woman', 'empower', 'empowerment', 'mahila', 'nari', 'self help group', 'shg'
  ];
  const specificTriggers = [
    'pm-kisan', 'pmkisan', 'pmmy', 'pm-egp', 'pm svanidhi', 'stand-up india',
    'scheme name', 'official portal', 'how to apply', 'eligibility', 'documents',
    'state', 'category', 'email', 'phone', 'bank', 'account'
  ];

  const hasBroad = broadTriggers.some((term) => normalized.includes(term));
  const hasSpecific = specificTriggers.some((term) => normalized.includes(term));

  return hasBroad && !hasSpecific;
}

function shouldUseLiveSupplement(message, cacheMatches) {
  if (!cacheMatches || cacheMatches.length === 0) return true;
  if (isBroadUserRequest(message) && cacheMatches.length < 8) return true;

  return false;
}

function mergeSchemeResponses(primary = [], secondary = []) {
  const normalizedKey = (item) => normalize(item.official_url || item.title || item.scheme_name || '');
  const seen = new Set(primary.map(normalizedKey));
  const merged = [...primary];

  for (const scheme of secondary) {
    const key = normalizedKey(scheme);
    if (key && !seen.has(key)) {
      seen.add(key);
      merged.push(scheme);
    }
  }

  return merged;
}

function buildFollowUpSuggestions(message) {
  const normalized = normalize(message);
  const studentKeywords = ['student', 'scholarship', 'education', 'college', 'school', 'tution', 'degree'];
  const farmerKeywords = ['farmer', 'kisan', 'agriculture', 'farm', 'cultivator', 'rural'];
  const housingKeywords = ['housing', 'home', 'accommodation', 'stay', 'rent'];

  if (studentKeywords.some((term) => normalized.includes(term))) {
    return ['Scholarship schemes', 'Student loan schemes', 'Student housing support', 'Skill training for students'];
  }

  if (farmerKeywords.some((term) => normalized.includes(term))) {
    return ['Crop loan schemes', 'Farm equipment subsidies', 'Irrigation support schemes', 'Farmer welfare pensions'];
  }

  if (housingKeywords.some((term) => normalized.includes(term))) {
    return ['Affordable housing schemes', 'Rental support schemes', 'Home renovation subsidies', 'Housing loan schemes'];
  }

  return ['Scholarship schemes', 'Loan schemes', 'Housing support', 'Skill training schemes'];
}

function parseConversationProfile(history, message) {
  const combined = [
    ...(Array.isArray(history) ? history : []).map((turn) => normalize(turn?.content)),
    normalize(message)
  ].join(' ');

  const profile = {
    intent: null,
    state: null,
    caste: null,
    income: null,
    education: null,
    occupation: null,
    needsScholarship: false,
    needsFarmerSupport: false
  };

  if (combined.includes('student') || combined.includes('scholar') || combined.includes('school') || combined.includes('college')) {
    profile.intent = 'student';
    profile.needsScholarship = true;
  }

  if (combined.includes('farmer') || combined.includes('kisan') || combined.includes('farm') || combined.includes('agriculture')) {
    profile.intent = 'farming';
    profile.needsFarmerSupport = true;
  }

  const stateMatches = [
    'maharashtra', 'bihar', 'uttar pradesh', 'rajasthan', 'gujarat', 'karnataka',
    'tamil nadu', 'kerala', 'andhra pradesh', 'telangana', 'madhya pradesh', 'west bengal'
  ];
  profile.state = stateMatches.find((state) => combined.includes(state)) || null;

  const casteMatches = ['obc', 'sc', 'st', 'general', 'ews'];
  profile.caste = casteMatches.find((caste) => combined.includes(caste)) || null;

  const incomeMatch = combined.match(/(?:income|family income|annual income)\s*(?:is|=|:)?\s*(?:around|about|approx(?:\.)?)?\s*(\d{4,9})/);
  profile.income = incomeMatch ? Number(incomeMatch[1]) : null;

  const educationMatches = ['school', 'class 8', 'class 10', 'class 12', 'college', 'diploma', 'degree', 'post-matric'];
  profile.education = educationMatches.find((item) => combined.includes(item)) || null;

  const occupationMatches = ['farmer', 'cultivator', 'student', 'self employed', 'unemployed'];
  profile.occupation = occupationMatches.find((item) => combined.includes(item)) || null;

  return profile;
}
function buildConversationalAnswer(message, profile) {
  const normalized = normalize(message);
  const categoryHint = profile.caste || profile.intent || 'your background';

  if (profile.intent === 'farming') {
    return `Based on your message, you may be looking for farming-related support. Eligibility usually depends on your landholding status, state rules, and the latest scheme conditions. Share your state and land details if you want a more precise answer.`;
  }

  if (profile.intent === 'student' || normalized.includes('student') || normalized.includes('scholarship')) {
    return `Based on your message, you may be asking about student or scholarship eligibility. Many schemes depend on your category, income, course, and state. Share your state, course level, and family income for a more precise answer.`;
  }

  if (profile.caste) {
    return `Your ${profile.caste.toUpperCase()} category may be relevant for many government schemes, but eligibility still depends on your state, income, and the specific scheme rules. Share a bit more context so I can guide you better.`;
  }

  return `You may be asking about eligibility rather than a specific scheme list. I can help explain whether a scheme is likely relevant, but I need a little more detail like your state, category, income, and purpose to give a precise answer.`;
}

function buildNoMatchResponse(profile, query) {
  const intentText = profile.intent === 'farming' ? 'farming' : profile.intent === 'student' ? 'student' : 'scheme';

  return {
    id: '',
    kicker: 'No exact match',
    title: 'No exact match found',
    fullTitle: 'No exact match found',
    copy: '',
    summary: `No exact ${intentText} scheme was found in the current dataset for: ${query}`,
    benefit: '',
    eligibilityText: 'No exact match is available in the dataset, so I cannot confirm a specific scheme.',
    eligibility: [],
    documents: [],
    steps: ['Check the official portal', 'Share more details like state, category, or income', 'Try a broader query if needed'],
    website: '',
    confidence: 'Low',
    icon: 'Award',
    iconBg: 'rgb(250, 250, 250)',
    iconColor: 'rgb(92, 99, 112)',
    tag: 'No exact match',
    tagBg: 'rgb(250, 250, 250)',
    tagColor: 'rgb(92, 99, 112)',
    category: '',
    isSingleResult: true,
    benefitsSection: 'No exact dataset match available.',
    eligibilityCriteria: [],
    importantDates: [],
    rejectionReasons: [],
    personalizedEligibility: {
      status: 'Unknown',
      why: 'The current dataset does not contain a strict match for your query.',
      missing: 'Share your state, category, income, and purpose so I can narrow it down.',
      nextSteps: 'Provide more context or check the official portal for the latest scheme list.'
    }
  };
}

function extractJsonArray(text) {
  const cleaned = String(text || '')
    .replace(/```(?:json)?/gi, '')
    .replace(/```/g, '')
    .trim();

  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) {
    throw new Error('No JSON array found in Groq response');
  }

  return JSON.parse(match[0]);
}

async function generateContextualSuggestions(message, history = [], profile = {}, schemeNames = []) {
  const conversationHistory = Array.isArray(history)
    ? history.map((turn) => `${turn?.role || 'user'}: ${turn?.content || ''}`).filter(Boolean).join('\n')
    : '';

  const schemeHint = Array.isArray(schemeNames) && schemeNames.length > 0
    ? `Relevant schemes found: ${schemeNames.join(', ')}.`
    : '';

  const prompt = `You are a contextual government-scheme assistant.

The user query is: ${message}

Conversation history:
${conversationHistory || 'none'}

${schemeHint}

Based on the current context, return a JSON array of 3 to 5 short follow-up suggestions the user can click or ask next. Use phrases that are relevant to the query and the evolving conversation. Do not include markdown, explanation, or any extra text.

Example output:
["Share my category details", "Show schemes for students", "Explain eligibility for OBC"]`;

  const responseText = await askGroqConversation(prompt);
  const suggestions = extractJsonArray(responseText);

  if (!Array.isArray(suggestions)) {
    return [];
  }

  return suggestions
    .filter((item) => typeof item === 'string' && item.trim())
    .slice(0, 5)
    .map((item) => item.trim());
}

router.post('/', async (req, res) => {
  const message = String(req.body.message || '');
  const history = Array.isArray(req.body.history) ? req.body.history : [];
  const profile = parseConversationProfile(history, message);

  try {
    const isConversational = isConversationalEligibilityQuestion(message);

    if (isConversational) {
      const profileAnswer = buildConversationalAnswer(message, profile);
      let aiAnswer = profileAnswer;
      let suggestions = [];

      try {
        const conversationHistory = Array.isArray(history) ? history.map((turn) => turn?.content || '').filter(Boolean) : [];
        const prompt = `You are a contextual government-scheme assistant for conversational support.
Your job is to answer eligibility or general questions like a normal chatbot.
Use the conversation history and current message to stay consistent.
Do not list schemes unless the user explicitly asks for them.

Conversation history:
${conversationHistory.slice(-6).join('\n')}

Current user message: ${message}

User profile context: ${JSON.stringify(profile)}

Answer briefly, clearly, and helpfully in plain conversational language.`;
        aiAnswer = await askGroqConversation(prompt);
      } catch (aiError) {
        console.warn('Conversational Groq answer generation failed, using fallback conversational response:', aiError?.message || aiError);
      }

      try {
        suggestions = await generateContextualSuggestions(message, history, profile, []);
      } catch (suggestionError) {
        console.warn('Suggestion generation failed, using static fallback:', suggestionError?.message || suggestionError);
        suggestions = buildFollowUpSuggestions(message);
      }

      res.json({
        summary: aiAnswer,
        answer: aiAnswer,
        schemes: [],
        suggestions,
        isSingle: false,
        isEmpty: true,
        source: 'conversation'
      });
      return;
    }

    console.log('Triggering GROQ Live Retrieval only');
    let liveSchemes = [];
    try {
      liveSchemes = await fetchLiveSchemeData(message, history);
      await Promise.all(liveSchemes.map((scheme) => appendSchemeToCache(scheme, message)));
    } catch (liveError) {
      console.error('Live retrieval failed:', liveError?.message || liveError);
      res.json({
        summary: 'No exact match was found in the current dataset.',
        schemes: [buildNoMatchResponse(profile, message)],
        isSingle: true,
        isEmpty: false,
        source: 'live_failed',
        error: 'Unable to retrieve live scheme data at this time.'
      });
      return;
    }

    const responseSchemes = liveSchemes.map((scheme) =>
      buildSchemeResponse(scheme, {
        query: message,
        source: 'groq_live',
        isSingleResult: false
      })
    );

    let suggestions = [];
    try {
      suggestions = await generateContextualSuggestions(
        message,
        history,
        profile,
        responseSchemes.map((scheme) => scheme.scheme_name).filter(Boolean)
      );
    } catch (suggestionError) {
      console.warn('Suggestion generation failed, using static fallback:', suggestionError?.message || suggestionError);
      suggestions = buildFollowUpSuggestions(message);
    }

    if (responseSchemes.length > 0) {
      res.json({
        summary: `Found ${responseSchemes.length} matching scheme${responseSchemes.length === 1 ? '' : 's'} from live retrieval.`,
        schemes: responseSchemes,
        suggestions,
        isSingle: responseSchemes.length === 1,
        isEmpty: false,
        source: 'live_only'
      });
      return;
    }

    res.json({
      summary: 'No exact match was found in the current dataset.',
      schemes: [buildNoMatchResponse(profile, message)],
      suggestions: suggestions.length > 0 ? suggestions : buildFollowUpSuggestions(message),
      isSingle: true,
      isEmpty: false,
      source: 'live_failed'
    });
  } catch (error) {
    console.error('Chat request failed:', error?.message || error);

    res.json({
      summary: 'No exact match was found in the current dataset.',
      schemes: [buildNoMatchResponse(profile, message)],
      isSingle: true,
      isEmpty: false,
      source: 'error',
      error: 'Unable to process your request at this time.'
    });
  }
});

export default router;
