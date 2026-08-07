import express from 'express';

import { appendSchemeToCache, buildSchemeResponse, findCachedMatches } from '../services/schemeCache.js';
import { fetchLiveSchemeData } from '../services/liveSchemeSearch.js';

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
  const ewsKeywords = ['ews', 'economically weaker section', 'economically weaker'];

  if (ewsKeywords.some((term) => normalized.includes(term))) {
    return ['Show EWS-related schemes', 'Check EWS income eligibility', 'Search broader welfare schemes'];
  }

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

function isConversationalEligibilityQuery(message, profile) {
  const normalized = normalize(message);
  const eligibilityKeywords = ['eligible', 'eligibility', 'can i', 'could i', 'am i eligible', 'would i', 'if my income', 'income above', 'income below', 'income is above', 'income is below'];
  const ewsKeywords = ['ews', 'economically weaker section', 'economically weaker', 'ews scheme'];
  const hasEligibility = eligibilityKeywords.some((term) => normalized.includes(term));
  const hasEws = profile?.caste === 'ews' || ewsKeywords.some((term) => normalized.includes(term));

  return hasEligibility && hasEws;
}

function buildConversationalEligibilityResponse(profile, message) {
  const income = profile.income;
  const incomeText = income ? `You mentioned income around ₹${income.toLocaleString()}.` : 'You mentioned income details.';
  const eligibilityNote = 'EWS eligibility is usually based on a family income threshold and caste category.';

  return {
    summary: `I’m treating this as an eligibility check first. ${eligibilityNote} ${incomeText} If you want, I can suggest related schemes next.`,
    schemes: [],
    suggestions: [
      'Show EWS-related schemes',
      'Ask about income-based eligibility',
      'Search broader welfare schemes'
    ],
    isSingle: false,
    isEmpty: false,
    source: 'conversation'
  };
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

router.post('/', async (req, res) => {
  const message = String(req.body.message || '');
  const history = Array.isArray(req.body.history) ? req.body.history : [];
  const profile = parseConversationProfile(history, message);
  const isConversationalEligibility = isConversationalEligibilityQuery(message, profile);

  if (isConversationalEligibility) {
    res.json(buildConversationalEligibilityResponse(profile, message));
    return;
  }

  try {
    const cacheMatches = await findCachedMatches(message, history);
    const useLive = shouldUseLiveSupplement(message, cacheMatches);

    const followUpSuggestions = buildFollowUpSuggestions(message);

    if (!useLive && cacheMatches.length > 0) {
      console.log(`Cache Hit: Found ${cacheMatches.length} local match(es)`);

      res.json({
        summary: `Found ${cacheMatches.length} matching scheme${cacheMatches.length === 1 ? '' : 's'} in local cache.`,
        schemes: cacheMatches,
        suggestions: followUpSuggestions,
        isSingle: cacheMatches.length === 1,
        isEmpty: false,
        source: 'local_cache'
      });
      return;
    }

    console.log('Triggering GROQ Live Retrieval to supplement local cache');
    let liveSchemes = [];
    try {
      liveSchemes = await fetchLiveSchemeData(message, history);
      await Promise.all(liveSchemes.map((scheme) => appendSchemeToCache(scheme, message)));
    } catch (liveError) {
      console.error('Live retrieval failed:', liveError?.message || liveError);
      if (cacheMatches.length > 0) {
        res.json({
          summary: `Found ${cacheMatches.length} matching scheme${cacheMatches.length === 1 ? '' : 's'} in local cache.`,
          schemes: cacheMatches,
          isSingle: cacheMatches.length === 1,
          isEmpty: false,
          source: 'local_cache',
          warning: 'Live retrieval failed. Showing cached results only.'
        });
        return;
      }

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

    const mergedSchemes = mergeSchemeResponses(cacheMatches, responseSchemes);

    if (mergedSchemes.length > 0) {
      res.json({
        summary: `Found ${mergedSchemes.length} matching scheme${mergedSchemes.length === 1 ? '' : 's'} from local and live retrieval.`,
        schemes: mergedSchemes,
        suggestions: followUpSuggestions,
        isSingle: mergedSchemes.length === 1,
        isEmpty: false,
        source: 'local_and_live'
      });
      return;
    }

    res.json({
      summary: 'No exact match was found in the current dataset.',
      schemes: [buildNoMatchResponse(profile, message)],
      suggestions: buildFollowUpSuggestions(message),
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
