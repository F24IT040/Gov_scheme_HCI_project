// Tests the full chat route logic directly without HTTP
import { fetchLiveSchemeData } from './services/liveSchemeSearch.js';
import { isConversationalEligibilityQuestion } from './services/conversationClassifier.js';

const queries = [
  'PM Kisan for farmers',
  'scholarship for students',
  'मुझे छात्रवृत्ति चाहिए',
  'Ayushman Bharat health scheme',
];

for (const q of queries) {
  console.log(`\n─── Query: "${q}" ───`);
  console.log('  isConversational:', isConversationalEligibilityQuestion(q));
  try {
    const schemes = await fetchLiveSchemeData(q);
    console.log(`  Schemes returned: ${schemes.length}`);
    schemes.forEach((s, i) => console.log(`  [${i+1}] ${s.scheme_name} | url: ${s.official_url}`));
  } catch (e) {
    console.error('  FETCH ERROR:', e.message);
    console.error('  Stack:', e.stack?.split('\n').slice(0,4).join('\n'));
  }
}
