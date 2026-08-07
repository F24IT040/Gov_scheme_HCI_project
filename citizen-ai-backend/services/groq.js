import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_CONVERSATION_MODEL = process.env.GROQ_CONVERSATION_MODEL || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

if (!GROQ_API_KEY) {
  throw new Error('Missing GROQ_API_KEY in .env. Set GROQ_API_KEY to use the Groq OpenAI-compatible endpoint.');
}

async function groqFetch(endpoint, body = {}) {
  const response = await fetch(`${GROQ_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API request failed (${response.status}): ${text}`);
  }

  return response.json();
}

function parseGroqResponseBody(body) {
  if (!body) return '';

  const outputs = Array.isArray(body.output) ? body.output : [];
  const texts = outputs.flatMap((item) => {
    if (!item || !Array.isArray(item.content)) return [];
    return item.content
      .filter((content) => content?.type === 'output_text' && typeof content.text === 'string')
      .map((content) => content.text);
  });

  if (texts.length > 0) {
    return texts.join('');
  }

  if (typeof body.output_text === 'string') {
    return body.output_text;
  }

  return '';
}

export async function askGroq(prompt) {
  const requestBody = {
    model: GROQ_MODEL,
    input: prompt
  };

  const body = await groqFetch('/responses', requestBody);
  return parseGroqResponseBody(body);
}

export async function askGroqConversation(prompt) {
  const requestBody = {
    model: GROQ_CONVERSATION_MODEL,
    input: prompt
  };

  const body = await groqFetch('/responses', requestBody);
  return parseGroqResponseBody(body);
}
