import dotenv from 'dotenv';
import { askGemini } from './gemini.js';
dotenv.config();

const GROQ_API_KEY           = process.env.GROQ_API_KEY;
const GROQ_BASE_URL          = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
const GROQ_MODEL             = process.env.GROQ_MODEL             || 'llama-3.3-70b-versatile';
const GROQ_CONVERSATION_MODEL = process.env.GROQ_CONVERSATION_MODEL || GROQ_MODEL;

if (!GROQ_API_KEY) {
  throw new Error('Missing GROQ_API_KEY in .env — get a free key at https://console.groq.com');
}

/**
 * Call the standard OpenAI-compatible /chat/completions endpoint.
 * Works with every model available on Groq.
 */
async function groqChat(model, messages, temperature = 0.2, purpose = 'request') {
  console.log(`[groq] ${purpose} → ${model}`);
  let response;
  try {
    response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, temperature }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    const cause = error?.cause;
    const detail = cause?.code || cause?.message || error?.name || 'unknown network error';
    throw new Error(`Unable to reach Groq at ${GROQ_BASE_URL} (${detail}). Check your internet connection, proxy, or firewall.`);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API error (${response.status}): ${text}`);
  }

  const data = await response.json();

  // Standard OpenAI-compatible response shape:
  // { choices: [{ message: { content: "..." } }] }
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error(`Unexpected Groq response shape: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return content.trim();
}

/**
 * Single-turn prompt → text.
 * Used for structured JSON retrieval (scheme search).
 */
export async function askGroq(prompt) {
  return groqChat(GROQ_MODEL, [
    {
      role: 'system',
      content:
        'You are a government scheme research assistant. ' +
        'You ALWAYS respond with valid JSON only — no markdown, no prose, no code fences.',
    },
    { role: 'user', content: prompt },
  ], 0.2, 'scheme retrieval');
}

/**
 * Single-turn conversational prompt → text.
 * Used for eligibility chat answers and contextual suggestions.
 */
export async function askGroqConversation(prompt) {
  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful government scheme assistant for Indian citizens. ' +
        'Answer in clear, simple language. ' +
        'When asked for JSON, respond with valid JSON only.',
    },
    { role: 'user', content: prompt },
  ];

  try {
    // Send to both configured providers and use the first valid response.
    // This prevents one unavailable provider from blocking the conversation.
    return await Promise.any([
      groqChat(GROQ_CONVERSATION_MODEL, messages, 0.2, 'conversation'),
      askGemini(
      `You are a helpful government scheme assistant for Indian citizens. Answer in clear, simple language. When the request asks for JSON, return valid JSON only.\n\n${prompt}`,
      { temperature: 0.2 },
      'conversation'
      ),
    ]);
  } catch (error) {
    console.warn('[conversation] Groq and Gemini failed:', error?.message || error);
    throw new Error('Both AI conversation providers are unavailable.');
  }
}
