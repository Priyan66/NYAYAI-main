const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATASET_PATH = path.join(ROOT, 'src', 'data', 'legal-cases.json');

const TARGET_PER_CATEGORY = 25;

const CATEGORY_PREFIX = {
  employment: 'EMP',
  consumer: 'CON',
  tenancy: 'TEN',
  property: 'PRO',
  family: 'FAM',
  contract: 'CTR',
  debt_recovery: 'DEB',
  harassment: 'HAR',
};

const CATEGORY_QUERIES = {
  employment: [
    'industrial disputes act retrenchment wages',
    'payment of wages act salary withheld',
    'labour court reinstatement back wages',
    'termination without notice employment',
  ],
  consumer: [
    'consumer protection act deficiency service',
    'builder delay refund consumer commission',
    'insurance claim repudiation consumer',
    'warranty defect consumer dispute',
  ],
  tenancy: [
    'rent control tenant eviction',
    'security deposit tenant landlord dispute',
    'lease termination tenancy rights',
    'tenant unlawful dispossession',
  ],
  property: [
    'specific performance sale deed property',
    'title dispute transfer of property act',
    'gpa sale property title',
    'co owner sale without consent property',
  ],
  family: [
    'hindu marriage act divorce maintenance custody',
    'domestic violence maintenance matrimonial',
    'child custody visitation rights family court',
    'section 125 crpc maintenance wife',
  ],
  contract: [
    'indian contract act breach damages',
    'specific performance contract dispute',
    'arbitration contract enforcement',
    'liquidated damages section 74 contract act',
  ],
  debt_recovery: [
    'debt recovery tribunal drt bank loan recovery',
    'sarfaesi secured creditor enforcement',
    'cheque dishonour section 138 debt',
    'loan default recovery suit',
  ],
  harassment: [
    'ipc 354 509 harassment woman',
    'sexual harassment workplace vishaka',
    'stalking outraging modesty conviction',
    'criminal intimidation section 506 harassment',
  ],
};

const CATEGORY_FALLBACK_HOLDING = {
  employment:
    'The judgment addresses employer-employee rights, wage compliance, and procedural fairness under labour law.',
  consumer:
    'The judgment addresses deficiency in service and consumer remedies including refund or compensation.',
  tenancy:
    'The judgment addresses tenant-landlord rights, possession, rent obligations, or lawful eviction process.',
  property:
    'The judgment addresses title, transfer, or enforceability of property rights and related civil remedies.',
  family:
    'The judgment addresses matrimonial or family rights including maintenance, custody, or marital reliefs.',
  contract:
    'The judgment addresses contractual obligations, breach, and enforceability of contractual remedies.',
  debt_recovery:
    'The judgment addresses recovery of debt obligations and procedural remedies available to creditors/debtors.',
  harassment:
    'The judgment addresses harassment-related allegations and the applicable criminal law safeguards and standards.',
};

const CATEGORY_STATUTES = {
  employment: [
    'Payment of Wages Act 1936',
    'Industrial Disputes Act 1947',
  ],
  consumer: [
    'Consumer Protection Act 2019',
  ],
  tenancy: [
    'Transfer of Property Act 1882',
    'State Rent Control Law',
  ],
  property: [
    'Transfer of Property Act 1882',
    'Registration Act 1908',
  ],
  family: [
    'Hindu Marriage Act 1955',
    'Code of Criminal Procedure Section 125',
  ],
  contract: [
    'Indian Contract Act 1872',
    'Specific Relief Act 1963',
  ],
  debt_recovery: [
    'Recovery of Debts and Bankruptcy Act 1993',
    'SARFAESI Act 2002',
  ],
  harassment: [
    'Indian Penal Code / Bharatiya Nyaya Sanhita',
    'Code of Criminal Procedure',
  ],
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtmlEntities(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchText(url) {
  let lastError = null;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          accept: 'text/html,application/xhtml+xml',
        },
      });

      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          await sleep(300 * attempt);
          continue;
        }
        throw new Error(`HTTP ${response.status} for ${url}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
      await sleep(300 * attempt);
    }
  }

  throw lastError;
}

function extractDocIds(searchHtml) {
  const ids = new Set();
  const re = /href="\/doc\/(\d+)\//g;
  let match;
  while ((match = re.exec(searchHtml)) !== null) {
    ids.add(match[1]);
  }
  return [...ids];
}

function parseTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!match) return null;
  return decodeHtmlEntities(match[1]);
}

function parseCaseNameAndYearFromTitle(title) {
  if (!title) {
    return { caseName: null, year: null };
  }

  let normalized = title.replace(/\s*-\s*Indian Kanoon.*$/i, '').trim();
  let year = null;

  const onDateMatch = normalized.match(/\s+on\s+\d{1,2}\s+[A-Za-z]+,?\s*(\d{4})$/i);
  if (onDateMatch) {
    year = Number(onDateMatch[1]);
    normalized = normalized.slice(0, onDateMatch.index).trim();
  }

  if (!year) {
    const genericYear = normalized.match(/\b(19|20)\d{2}\b/);
    if (genericYear) year = Number(genericYear[0]);
  }

  return {
    caseName: decodeHtmlEntities(normalized),
    year,
  };
}

function sanitizeCitation(rawCitation) {
  const cleaned = decodeHtmlEntities(rawCitation)
    .replace(/^[:\-\s]+/, '')
    .replace(/[|]+/g, ',')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

function extractCitationFromHtml(html) {
  const patterns = [
    /Equivalent citations?:\s*([^<\n]+)/i,
    /Equivalent Citation:\s*([^<\n]+)/i,
    /Citations?:\s*([^<\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match) continue;

    const candidate = sanitizeCitation(match[1]);
    if (candidate.length >= 6) {
      return candidate;
    }
  }

  return null;
}

function extractCourt(html) {
  const courtPatterns = [
    /Supreme Court of India/i,
    /National Consumer Disputes Redressal Commission/i,
    /Delhi High Court/i,
    /Bombay High Court/i,
    /Madras High Court/i,
    /Calcutta High Court/i,
    /Karnataka High Court/i,
    /Kerala High Court/i,
    /Allahabad High Court/i,
    /Punjab and Haryana High Court/i,
    /High Court/i,
    /Tribunal/i,
  ];

  const plainText = decodeHtmlEntities(html.replace(/<[^>]+>/g, ' '));

  for (const pattern of courtPatterns) {
    const match = plainText.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return 'Indian Court';
}

function normalizeCaseKey(caseName, citation) {
  return `${(caseName || '').toLowerCase().trim()}|${(citation || '').toLowerCase().trim()}`;
}

function makeSearchText(category, caseName, citation, court, year) {
  const categoryTerms = {
    employment: 'salary not paid, wrongful termination, labour dispute, wage claim',
    consumer: 'consumer complaint, deficiency in service, refund, compensation',
    tenancy: 'landlord tenant dispute, eviction, rent, security deposit',
    property: 'title dispute, sale deed, possession, specific performance',
    family: 'divorce, maintenance, child custody, domestic relationship',
    contract: 'breach of contract, damages, specific performance, arbitration',
    debt_recovery: 'loan default, debt recovery, SARFAESI, DRT',
    harassment: 'harassment complaint, criminal intimidation, modesty, stalking',
  };

  return `${caseName} (${citation}) ${court} ${year ?? ''}. ${categoryTerms[category]}.`;
}

function createFallbackEntry(category, docId, caseName, citation, court, year) {
  return {
    id: '',
    category,
    caseName,
    citation,
    court,
    year: year || 2000,
    outcome: 'unknown',
    keyHolding: CATEGORY_FALLBACK_HOLDING[category],
    facts: `Citation verified from Indian Kanoon source document ID ${docId}.`,
    legalPrinciples: [
      'Case citation verified from public legal source',
      'Use full judgment text for detailed ratio extraction',
    ],
    relevantStatutes: CATEGORY_STATUTES[category],
    searchText: makeSearchText(category, caseName, citation, court, year),
  };
}

function ensureSchema(entry) {
  return (
    entry &&
    typeof entry.caseName === 'string' &&
    typeof entry.citation === 'string' &&
    typeof entry.court === 'string' &&
    typeof entry.year === 'number' &&
    Array.isArray(entry.legalPrinciples) &&
    Array.isArray(entry.relevantStatutes) &&
    typeof entry.searchText === 'string'
  );
}

async function buildCurationPoolForCategory(category, alreadySeenKeys) {
  const results = [];
  const seenDocIds = new Set();
  const queries = CATEGORY_QUERIES[category];

  for (const query of queries) {
    if (results.length >= TARGET_PER_CATEGORY) break;

    for (let page = 0; page < 40; page += 1) {
      if (results.length >= TARGET_PER_CATEGORY) break;

      const fullQuery = `${query} doctypes:supremecourt,highcourts`;
      const searchUrl =
        `https://indiankanoon.org/search/?formInput=${encodeURIComponent(fullQuery)}` +
        `&pagenum=${page}`;

      let searchHtml;
      try {
        searchHtml = await fetchText(searchUrl);
      } catch (error) {
        continue;
      }

      const docIds = extractDocIds(searchHtml);
      if (docIds.length === 0) break;

      for (const docId of docIds) {
        if (results.length >= TARGET_PER_CATEGORY) break;
        if (seenDocIds.has(docId)) continue;
        seenDocIds.add(docId);

        const docUrl = `https://indiankanoon.org/doc/${docId}/`;

        let docHtml;
        try {
          docHtml = await fetchText(docUrl);
        } catch (error) {
          continue;
        }

        const title = parseTitle(docHtml);
        const parsed = parseCaseNameAndYearFromTitle(title);
        if (!parsed.caseName || parsed.caseName.length < 8) continue;

        const citationFromPage = extractCitationFromHtml(docHtml);
        const citation = citationFromPage || `IK-${docId}`;

        const key = normalizeCaseKey(parsed.caseName, citation);
        if (alreadySeenKeys.has(key)) continue;

        alreadySeenKeys.add(key);

        const court = extractCourt(docHtml);
        const entry = createFallbackEntry(
          category,
          docId,
          parsed.caseName,
          citation,
          court,
          parsed.year
        );

        if (!ensureSchema(entry)) continue;

        results.push(entry);

        await sleep(120);
      }
    }
  }

  return results;
}

function trimAndDeduplicateExisting(entries) {
  const byCategory = {
    employment: [],
    consumer: [],
    tenancy: [],
    property: [],
    family: [],
    contract: [],
    debt_recovery: [],
    harassment: [],
  };

  const seen = new Set();

  for (const entry of entries) {
    if (!entry || !entry.category || !byCategory[entry.category]) continue;
    if (!ensureSchema(entry)) continue;

    const key = normalizeCaseKey(entry.caseName, entry.citation);
    if (seen.has(key)) continue;
    seen.add(key);

    byCategory[entry.category].push({
      ...entry,
      citation: sanitizeCitation(entry.citation),
      caseName: decodeHtmlEntities(entry.caseName),
      court: decodeHtmlEntities(entry.court),
      searchText: entry.searchText || makeSearchText(entry.category, entry.caseName, entry.citation, entry.court, entry.year),
      legalPrinciples: Array.isArray(entry.legalPrinciples) && entry.legalPrinciples.length > 0
        ? entry.legalPrinciples
        : ['Refer to judgment text for full legal principles'],
      relevantStatutes: Array.isArray(entry.relevantStatutes) && entry.relevantStatutes.length > 0
        ? entry.relevantStatutes
        : CATEGORY_STATUTES[entry.category],
      keyHolding: entry.keyHolding || CATEGORY_FALLBACK_HOLDING[entry.category],
      facts: entry.facts || 'Case facts available in the cited judgment text.',
      outcome: ['plaintiff_won', 'defendant_won', 'settled', 'unknown'].includes(entry.outcome)
        ? entry.outcome
        : 'unknown',
      year: Number(entry.year) || 2000,
    });
  }

  for (const category of Object.keys(byCategory)) {
    byCategory[category] = byCategory[category].slice(0, TARGET_PER_CATEGORY);
  }

  return byCategory;
}

function assignStableIds(byCategory) {
  const merged = [];

  for (const category of Object.keys(byCategory)) {
    const prefix = CATEGORY_PREFIX[category];
    byCategory[category].forEach((entry, idx) => {
      merged.push({
        ...entry,
        id: `${prefix}-${String(idx + 1).padStart(3, '0')}`,
      });
    });
  }

  return merged;
}

function validateFinalDataset(entries) {
  if (entries.length !== 200) {
    throw new Error(`Expected 200 entries, got ${entries.length}`);
  }

  const idSet = new Set();
  const caseSet = new Set();

  for (const entry of entries) {
    if (idSet.has(entry.id)) throw new Error(`Duplicate id detected: ${entry.id}`);
    idSet.add(entry.id);

    const key = normalizeCaseKey(entry.caseName, entry.citation);
    if (caseSet.has(key)) throw new Error(`Duplicate case+citation detected: ${entry.caseName} | ${entry.citation}`);
    caseSet.add(key);

    if (!ensureSchema(entry)) {
      throw new Error(`Schema validation failed for ${entry.id}`);
    }
  }
}

async function main() {
  const raw = fs.readFileSync(DATASET_PATH, 'utf8');
  const existing = JSON.parse(raw);

  const byCategory = trimAndDeduplicateExisting(existing);

  const seenKeys = new Set();
  for (const category of Object.keys(byCategory)) {
    for (const entry of byCategory[category]) {
      seenKeys.add(normalizeCaseKey(entry.caseName, entry.citation));
    }
  }

  for (const category of Object.keys(byCategory)) {
    const missing = TARGET_PER_CATEGORY - byCategory[category].length;
    if (missing <= 0) continue;

    console.log(`Filling ${category}: need ${missing} more entries...`);
    const fetched = await buildCurationPoolForCategory(category, seenKeys);

    for (const entry of fetched) {
      if (byCategory[category].length >= TARGET_PER_CATEGORY) break;
      byCategory[category].push(entry);
    }

    if (byCategory[category].length < TARGET_PER_CATEGORY) {
      throw new Error(
        `Unable to reach ${TARGET_PER_CATEGORY} entries for ${category}. ` +
        `Only ${byCategory[category].length} available after strict dedupe.`
      );
    }
  }

  const merged = assignStableIds(byCategory);
  validateFinalDataset(merged);

  fs.writeFileSync(DATASET_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf8');

  const byCatCount = {};
  for (const entry of merged) {
    byCatCount[entry.category] = (byCatCount[entry.category] || 0) + 1;
  }

  const ikCitationCount = merged.filter((e) => /^IK-\d+$/i.test(e.citation)).length;

  console.log('Curation complete.');
  console.log('Category counts:', byCatCount);
  console.log('Total entries:', merged.length);
  console.log('IK fallback citations:', ikCitationCount);
}

main().catch((error) => {
  console.error('Curation failed:', error.message);
  process.exit(1);
});
