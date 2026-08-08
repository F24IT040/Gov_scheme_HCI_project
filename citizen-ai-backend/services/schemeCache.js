import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const CACHE_FILE_PATH = fileURLToPath(new URL('../data/schemes.json', import.meta.url));

let writeQueue = Promise.resolve();

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value) {
  return [...new Set(normalize(value).split(/[^a-z0-9]+/).filter((token) => token.length > 2))];
}

function uniqueList(values) {
  return [...new Set((Array.isArray(values) ? values : []).flat().map((item) => String(item || '').trim()).filter(Boolean))];
}

function isFollowUpQuery(message = '') {
  const normalized = String(message || '').toLowerCase();
  return /\b(?:more|another|related|similar|also|other|additional|still|again|show me|tell me|find me|give me)\b/.test(normalized)
    && /\b(?:scheme|schemes|this|that|these|those|similar)\b/.test(normalized);
}

function getFollowUpHistory(message = '', history = []) {
  if (!isFollowUpQuery(message)) {
    return [];
  }

  return Array.isArray(history) ? history.slice(-2) : [];
}

function confidenceLabel(score) {
  if (score >= 80) return 'High';
  if (score >= 55) return 'Medium';
  return 'Low';
}

function inferUiCategory(record, query) {
  const normalizedText = normalize([
    record?.category,
    record?.scheme_name,
    record?.name,
    record?.eligibility,
    record?.benefits,
    query
  ].flat().join(' '));

  if (normalizedText.includes('student') || normalizedText.includes('scholar') || normalizedText.includes('education')) {
    return 'scholarship';
  }

  if (normalizedText.includes('farmer') || normalizedText.includes('kisan') || normalizedText.includes('agri')) {
    return 'farming';
  }

  return 'scheme';
}

function inferIcon(category) {
  return category === 'scholarship' ? 'Award' : 'Sprout';
}

function inferIconPalette(category) {
  return category === 'scholarship'
    ? {
        iconBg: 'rgb(234, 241, 255)',
        iconColor: 'rgb(0, 74, 198)',
        tagBg: 'rgb(234, 241, 255)',
        tagColor: 'rgb(0, 74, 198)'
      }
    : {
        iconBg: 'rgb(230, 248, 244)',
        iconColor: 'rgb(0, 107, 95)',
        tagBg: 'rgb(230, 248, 244)',
        tagColor: 'rgb(0, 107, 95)'
      };
}

function normalizeArrayField(value) {
  if (Array.isArray(value)) {
    return uniqueList(value);
  }

  if (typeof value === 'string') {
    return value
      .split(/\n|\.|\u2022|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeStructuredRecord(record, query = '') {
  const schemeName = String(record?.scheme_name || record?.name || 'Unknown scheme').trim();
  const officialUrl = String(record?.official_url || record?.website || '').trim();
  const eligibility = normalizeArrayField(record?.eligibility);
  const requiredDocuments = normalizeArrayField(record?.required_documents || record?.documents);
  const timeline = normalizeArrayField(record?.timeline);
  const processSteps = normalizeArrayField(record?.process_steps || record?.steps);
  const applicationProcess = normalizeArrayField(record?.application_process || record?.application_process_steps || record?.process);
  const dosAndDonts = normalizeArrayField(record?.dos_and_donts);
  const benefits = normalizeArrayField(record?.benefits);
  const searchTerms = uniqueList([
    ...(Array.isArray(record?.search_terms) ? record.search_terms : []),
    ...(Array.isArray(record?.keywords) ? record.keywords : []),
    schemeName,
    officialUrl,
    query,
    record?.summary,
    record?.benefit,
    record?.eligibilityText,
    record?.category,
    record?.state,
    ...eligibility,
    ...requiredDocuments,
    ...timeline,
    ...processSteps,
    ...dosAndDonts,
    ...benefits
  ].filter(Boolean));

  const confidenceScore = Number.isFinite(Number(record?.confidence_score))
    ? Number(record.confidence_score)
    : (searchTerms.length > 0 ? 70 : 45);

  return {
    id: record?.id || `cache_${Date.now()}`,
    scheme_name: schemeName,
    eligibility,
    required_documents: requiredDocuments,
    timeline,
    process_steps: processSteps,
    application_process: applicationProcess,
    dos_and_donts: dosAndDonts,
    benefits,
    confidence_score: confidenceScore,
    official_url: officialUrl,
    search_terms: searchTerms,
    source_query: record?.source_query || query,
    source: record?.source || (record?.scheme_name ? 'live_cache' : 'legacy_cache'),
    cached_at: record?.cached_at || new Date().toISOString(),
    state: record?.state || '',
    category: record?.category || ''
  };
}

function scoreCacheRecord(record, query, history = []) {
  const queryText = normalize([query, ...history.map((turn) => turn?.content)].join(' '));
  const queryTokens = tokenize(queryText);
  const corpus = normalize([
    record?.scheme_name,
    record?.name,
    record?.state,
    record?.category,
    record?.official_url,
    record?.website,
    record?.summary,
    record?.benefit,
    record?.eligibilityText,
    record?.benefits,
    record?.eligibility,
    record?.required_documents,
    record?.documents,
    record?.timeline,
    record?.process_steps,
    record?.steps,
    record?.search_terms,
    record?.keywords
  ].flat().join(' '));

  let score = 0;

  if (queryText && corpus.includes(queryText) && queryText.length > 3) {
    score += 80;
  }

  for (const token of queryTokens) {
    if (corpus.includes(token)) {
      score += token.length >= 6 ? 12 : 8;
    }
  }

  const searchTerms = Array.isArray(record?.search_terms) ? record.search_terms : [];
  for (const term of searchTerms) {
    if (queryText.includes(normalize(term))) {
      score += 18;
    }
  }

  const exactFields = [record?.scheme_name, record?.name, record?.state, record?.category].filter(Boolean).map(normalize);
  for (const field of exactFields) {
    if (queryText.includes(field)) {
      score += 14;
    }
  }

  return score;
}

function buildStructuredSummary(record) {
  const benefitsText = record.benefits.length > 0 ? record.benefits[0] : '';
  if (benefitsText) {
    return benefitsText;
  }

  if (record.scheme_name) {
    return `${record.scheme_name} matched your search.`;
  }

  return 'Cached scheme result.';
}

function buildEligibilityCriteria(record) {
  const criteria = [];

  if (record.eligibility.length > 0) {
    criteria.push(...record.eligibility.map((item, index) => ({ label: `Eligibility ${index + 1}`, value: item })));
  }

  if (record.required_documents.length > 0) {
    criteria.push({ label: 'Documents', value: record.required_documents.join(', ') });
  }

  if (record.official_url) {
    criteria.push({ label: 'Official URL', value: record.official_url });
  }

  return criteria;
}

function buildImportantDates(record) {
  return record.timeline.map((item, index) => ({
    label: `Timeline ${index + 1}`,
    value: item
  }));
}

function buildRejectionReasons(record) {
  const reasons = record.dos_and_donts.filter((item) => /don't|avoid|must not|do not|not/i.test(item));

  if (reasons.length > 0) {
    return reasons;
  }

  return [
    'Incomplete application',
    'Missing or invalid documents',
    'Not meeting the latest eligibility rules'
  ];
}

function buildPersonalizedEligibility(record) {
  return {
    status: record.confidence_score >= 70 ? 'Likely Eligible' : 'Possibly Eligible',
    why: record.eligibility.length > 0
      ? record.eligibility[0]
      : 'The cache entry was matched using the local search index.',
    missing: record.required_documents.slice(0, 3).join(', ') || 'Review the official portal for the latest document list.',
    nextSteps: 'Open the official portal, verify the latest rules, and apply with the required documents.'
  };
}

export function normalizeSchemeForCache(record, query = '') {
  return normalizeStructuredRecord(record, query);
}

export function buildSchemeResponse(record, options = {}) {
  const structured = normalizeStructuredRecord(record, options.query || '');
  const uiCategory = inferUiCategory(record, options.query || structured.source_query || '');
  const palette = inferIconPalette(uiCategory);

  return {
    id: String(record?.id || structured.id || structured.scheme_name),
    kicker: record?.category || uiCategory,
    title: structured.scheme_name,
    fullTitle: structured.scheme_name,
    copy: structured.official_url ? `Official portal: ${structured.official_url}` : 'Cached result from local JSON.',
    summary: buildStructuredSummary(structured),
    benefit: structured.benefits.join(' | ') || 'Cached result available locally.',
    eligibilityText: structured.eligibility[0] || 'See the local cache and official portal for the full eligibility rule set.',
    eligibility: structured.eligibility,
    documents: structured.required_documents,
    steps: structured.process_steps,
    website: structured.official_url,
    confidence: confidenceLabel(structured.confidence_score),
    icon: inferIcon(uiCategory),
    iconBg: palette.iconBg,
    iconColor: palette.iconColor,
    tag: record?.category || uiCategory,
    tagBg: palette.tagBg,
    tagColor: palette.tagColor,
    category: uiCategory,
    isSingleResult: options.isSingleResult ?? true,
    benefitsSection: structured.benefits.join(' | ') || 'Cached result available locally.',
    eligibilityCriteria: buildEligibilityCriteria(structured),
    importantDates: buildImportantDates(structured),
    applicationProcess: structured.application_process,
    rejectionReasons: buildRejectionReasons(structured),
    personalizedEligibility: buildPersonalizedEligibility(structured),
    scheme_name: structured.scheme_name,
    required_documents: structured.required_documents,
    timeline: structured.timeline,
    process_steps: structured.process_steps,
    application_process: structured.application_process,
    dos_and_donts: structured.dos_and_donts,
    benefits: structured.benefits,
    confidence_score: structured.confidence_score,
    official_url: structured.official_url,
    search_terms: structured.search_terms,
    source_query: structured.source_query,
    source: options.source || structured.source || 'local_cache'
  };
}

export async function findCachedMatches(message, history = []) {
  const cachedSchemes = await loadCachedSchemes();
  const searchHistory = getFollowUpHistory(message, history);
  const scored = cachedSchemes
    .map((scheme) => ({
      scheme,
      score: scoreCacheRecord(scheme, message, searchHistory)
    }))
    .filter((item) => item.score >= 18)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  return scored.map(({ scheme }) => buildSchemeResponse(scheme, {
    query: message,
    source: scheme?.source || 'local_cache',
    isSingleResult: false
  }));
}

export async function findBestCachedScheme(message, history = []) {
  const matches = await findCachedMatches(message, history);
  return matches.length > 0 ? matches[0] : null;
}

export async function loadCachedSchemes() {
  try {
    const raw = await fs.readFile(CACHE_FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function writeCacheFile(nextSchemes) {
  const directory = path.dirname(CACHE_FILE_PATH);
  const tempFilePath = path.join(
    directory,
    `${path.basename(CACHE_FILE_PATH)}.${process.pid}.${Date.now()}.tmp`
  );

  await fs.writeFile(tempFilePath, `${JSON.stringify(nextSchemes, null, 2)}\n`, 'utf8');
  await fs.rm(CACHE_FILE_PATH, { force: true });
  await fs.rename(tempFilePath, CACHE_FILE_PATH);
}

function enqueueWrite(task) {
  const next = writeQueue.then(task, task);
  writeQueue = next.then(() => undefined, () => undefined);
  return next;
}

function isDuplicateRecord(existing, candidate) {
  const existingUrl = normalize(existing?.official_url || existing?.website);
  const candidateUrl = normalize(candidate?.official_url || candidate?.website);
  const existingName = normalize(existing?.scheme_name || existing?.name);
  const candidateName = normalize(candidate?.scheme_name || candidate?.name);

  return (
    (existingUrl && candidateUrl && existingUrl === candidateUrl) ||
    (existingName && candidateName && existingName === candidateName && existingUrl === candidateUrl)
  );
}

export async function appendSchemeToCache(record, query = '') {
  return enqueueWrite(async () => {
    const cachedSchemes = await loadCachedSchemes();
    const nextRecord = normalizeStructuredRecord(record, query);
    const nextSchemes = [...cachedSchemes];
    const duplicateIndex = nextSchemes.findIndex((existing) => isDuplicateRecord(existing, nextRecord));

    if (duplicateIndex >= 0) {
      nextSchemes[duplicateIndex] = {
        ...nextSchemes[duplicateIndex],
        ...nextRecord,
        cached_at: new Date().toISOString(),
        source: nextRecord.source || 'live_cache'
      };
    } else {
      nextSchemes.push({
        ...nextRecord,
        id: nextRecord.id || `cache_${Date.now()}`,
        cached_at: new Date().toISOString(),
        source: nextRecord.source || 'live_cache'
      });
    }

    await writeCacheFile(nextSchemes);

    return nextRecord;
  });
}
