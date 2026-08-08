/**
 * Directly invokes the route handler logic (no HTTP) so we see the real error.
 */
import { fetchLiveSchemeData } from './services/liveSchemeSearch.js';
import { isConversationalEligibilityQuestion } from './services/conversationClassifier.js';
import { buildSchemeResponse } from './services/schemeCache.js';

const message = 'scholarship for students';

console.log('--- isConversational:', isConversationalEligibilityQuestion(message));

try {
  console.log('--- Calling fetchLiveSchemeData...');
  const liveSchemes = await fetchLiveSchemeData(message, []);
  console.log('--- Raw liveSchemes count:', liveSchemes.length);
  console.log('--- First raw:', JSON.stringify(liveSchemes[0], null, 2).slice(0, 400));

  const built = liveSchemes.map(s => buildSchemeResponse(s, { query: message, source: 'groq_live', isSingleResult: false }));
  console.log('--- Built schemes count:', built.length);
  console.log('--- First built title:', built[0]?.title);
  console.log('--- First built official_url:', built[0]?.official_url);
} catch (e) {
  console.error('--- FULL ERROR:', e.message);
  console.error(e.stack);
}
