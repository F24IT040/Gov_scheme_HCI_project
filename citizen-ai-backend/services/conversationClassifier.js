function normalize(value = '') {
  return String(value || '').toLowerCase().trim();
}

export function isConversationalEligibilityQuestion(message = '') {
  const query = normalize(message);

  if (!query) return false;

  const eligibilityPatterns = [
    /\b(can|could|may|will|am|is|do|does|should)\b/i,
    /\b(apply|eligible|eligibility|qualify|qualify for|get|receive|availed|benefit|join)\b/i,
    /\b(if|when|while|provided|given|since|because|due to)\b/i,
    /\b(obc|sc|st|general|ews|student|farmer|women|woman|minority|disabled|pensioner)\b/i
  ];

  const directSearchPatterns = [
    /\b(show|find|search|list|give me|tell me about|get me|recommend|browse)\b/i,
    /\b(schemes?|programs?|yojana|portal|benefits?)\b/i
  ];

  const hasEligibilityPattern = eligibilityPatterns.some((pattern) => pattern.test(query));
  const hasDirectSearchPattern = directSearchPatterns.some((pattern) => pattern.test(query));

  if (!hasEligibilityPattern) return false;

  if (hasDirectSearchPattern && !/\b(if|eligible|apply|qualify|can i|am i|could i|should i)\b/i.test(query)) {
    return false;
  }

  return true;
}
