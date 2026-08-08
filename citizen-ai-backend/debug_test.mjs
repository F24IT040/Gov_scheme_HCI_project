// Quick debug script — run with: node debug_test.mjs
import { askGroq, askGroqConversation } from './services/groq.js';
import { fetchLiveSchemeData } from './services/liveSchemeSearch.js';

async function run() {
  console.log('\n=== 1. Testing raw Groq connection ===');
  try {
    const ping = await askGroqConversation('Say "hello" in one word.');
    console.log('Groq ping OK:', ping);
  } catch (e) {
    console.error('Groq ping FAILED:', e.message);
    process.exit(1);
  }

  console.log('\n=== 2. Testing JSON scheme retrieval (English) ===');
  try {
    const schemes = await fetchLiveSchemeData('PM Kisan scheme for farmers');
    console.log(`Got ${schemes.length} scheme(s)`);
    console.log('First scheme name:', schemes[0]?.scheme_name);
    console.log('First scheme URL :', schemes[0]?.official_url);
  } catch (e) {
    console.error('Scheme retrieval FAILED:', e.message);
  }

  console.log('\n=== 3. Testing JSON scheme retrieval (Hindi) ===');
  try {
    const schemes = await fetchLiveSchemeData('मुझे किसान योजना चाहिए');
    console.log(`Got ${schemes.length} scheme(s)`);
    console.log('First scheme name:', schemes[0]?.scheme_name);
  } catch (e) {
    console.error('Hindi scheme retrieval FAILED:', e.message);
  }

  console.log('\n=== 4. Testing conversational suggestions ===');
  try {
    const resp = await askGroqConversation(
      'Return a JSON array of 3 suggestions for a farmer asking about schemes. Only JSON array, no extra text.'
    );
    console.log('Suggestions raw:', resp.slice(0, 200));
  } catch (e) {
    console.error('Suggestions FAILED:', e.message);
  }

  console.log('\n=== Done ===');
}

run();
