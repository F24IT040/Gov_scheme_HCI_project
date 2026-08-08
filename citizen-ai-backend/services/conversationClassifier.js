/**
 * Decides whether an incoming message is a conversational eligibility question
 * (needs a chat answer) vs. a scheme-search request (needs live retrieval).
 *
 * The key insight: almost everything a user types is a search request.
 * Only flag as conversational when the message is CLEARLY asking "am I eligible?"
 * or "can I apply?" — and has NO search intent at all.
 *
 * Hindi / Devanagari messages are ALWAYS treated as search requests because
 * the old regex patterns never matched them, silently blocking retrieval.
 */

function normalize(value = '') {
  return String(value || '').toLowerCase().trim();
}

function containsDevanagari(text = '') {
  return /[\u0900-\u097F]/.test(text);
}

export function isConversationalEligibilityQuestion(message = '') {
  const query = normalize(message);
  if (!query) return false;

  // 1. Hindi / Devanagari script → always search, never conversational
  if (containsDevanagari(message)) return false;

  // 2. A direct personal eligibility check is conversational, even when it
  // names a scheme or benefit (for example, "Can I get a scholarship?").
  // This must run before the broad keyword checks below.
  const hasPersonalQuestion =
    /\b(can i|could i|am i|will i|should i|would i)\b/i.test(query) ||
    /^do i\b/i.test(query);
  const isPersonalEligibilityCheck =
    hasPersonalQuestion &&
    /\b(eligible|qualify|apply|get|receive|avail|benefit)\b/i.test(query) &&
    !/\b(show|find|search|list|recommend|suggest|what schemes?|which schemes?|give me)\b/i.test(query);

  if (isPersonalEligibilityCheck) return true;

  // 3. Definition and explanation questions need a direct chat answer, not
  // a list of schemes. Check these before category keywords such as
  // "scholarship" or "loan" are treated as a search request.
  const isExplanationQuestion =
    /^(what is|what are|define|explain|tell me about|how does|how do|why is|why do)\b/i.test(query) &&
    !/\b(show|find|search|list|recommend|suggest|schemes?\s+for|schemes?\s+available)\b/i.test(query);

  if (isExplanationQuestion) return true;

  // 4. Explicit scheme-search phrases → always search
  const searchPhrases = [
    /\b(show|find|search|list|get|give me|tell me about|recommend|suggest|what are|which)\b.*\b(scheme|schemes|yojana|program|benefit|subsidy)\b/i,
    /\b(scheme|schemes|yojana|program|portal)\b.*\b(for|related|about|regarding)\b/i,
    /\b(i (am|want|need)|i'm|i am)\b.*\b(student|farmer|woman|worker|unemployed|disabled|senior|widow|pregnant)\b/i,
    /\bpm[ -]?(kisan|awas|mudra|svamitva|ujjwala|jandhan|fasal)\b/i,
    /\bayushman\b/i,
    /\b(scholarship|loan|housing|health|pension|insurance|subsidy|ration)\b/i,
    // Hinglish search patterns
    /\b(kisan|mahila|yojana|labh|paisa|awas|bima|rozgar|krishi)\b/i,
    /\b(chahiye|chaiye|batao|bataiye)\b/i,
  ];

  if (searchPhrases.some((p) => p.test(query))) return false;

  return false;
}
