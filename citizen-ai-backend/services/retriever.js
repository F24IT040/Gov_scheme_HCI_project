const intentMatchers = [
  {
    intent: 'farming',
    keywords: ['farmer', 'farm', 'kisan', 'agriculture', 'agri', 'cultivator', 'rural']
  },
  {
    intent: 'student',
    keywords: ['student', 'scholarship', 'education', 'school', 'college', 'college student', 'scholar']
  }
];

function normalize(value) {
  return String(value || '').toLowerCase();
}

function detectIntent(query) {
  for (const matcher of intentMatchers) {
    if (matcher.keywords.some((keyword) => query.includes(keyword))) {
      return matcher.intent;
    }
  }

  return null;
}

export function retrieveSchemes(message, schemes, history = []) {
  const query = normalize(message);
  const contextText = [query, ...history.map((turn) => normalize(turn?.content))].join(' ');
  const intent = detectIntent(contextText);

  if (intent) {
    const intentMatches = schemes.filter((scheme) => normalize(scheme.category) === intent);

    return {
      intent,
      matchedSchemes: intentMatches,
      exactMatches: intentMatches,
      hasBroadIntent: true,
      contextText
    };
  }

  const exactMatches = schemes.filter((scheme) => {
    return (
      query.includes(normalize(scheme.category)) ||
      query.includes(normalize(scheme.state)) ||
      query.includes(normalize(scheme.name))
    );
  });

  return {
    intent: null,
    matchedSchemes: exactMatches,
    exactMatches,
    hasBroadIntent: false,
    contextText
  };
}