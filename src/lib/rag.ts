import { DisputeCategory, PrecedentCase } from '@/types';

interface StoredEmbedding {
  id: string;
  vector: number[];
}

interface LegalCaseData {
  id: string;
  category: DisputeCategory;
  caseName: string;
  citation: string;
  court: string;
  year: number;
  outcome: 'plaintiff_won' | 'defendant_won' | 'settled' | 'unknown';
  keyHolding: string;
  facts: string;
  legalPrinciples: string[];
  relevantStatutes: string[];
  searchText: string;
}

let casesCache: LegalCaseData[] | null = null;
let embeddingsCache: StoredEmbedding[] | null = null;

async function loadData(): Promise<{ cases: LegalCaseData[]; embeddings: StoredEmbedding[] }> {
  if (casesCache && embeddingsCache) {
    return { cases: casesCache, embeddings: embeddingsCache };
  }

  const [casesModule, embeddingsModule] = await Promise.all([
    import('@/data/legal-cases.json'),
    import('@/data/case-embeddings.json'),
  ]);

  casesCache = casesModule.default as LegalCaseData[];
  embeddingsCache = embeddingsModule.default as StoredEmbedding[];

  return { cases: casesCache, embeddings: embeddingsCache };
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export interface RAGSearchResult extends PrecedentCase {
  relevanceScore: number;
  facts: string;
  legalPrinciples: string[];
}

export async function ragSearch(
  queryVector: number[],
  category: DisputeCategory,
  topK = 5
): Promise<RAGSearchResult[]> {
  const { cases, embeddings } = await loadData();
  const caseMap = new Map(cases.map((c) => [c.id, c]));

  const scored = embeddings.map((emb) => ({
    id: emb.id,
    score: cosineSimilarity(queryVector, emb.vector),
  }));

  const boosted = scored.map(({ id, score }) => {
    const caseData = caseMap.get(id);
    const categoryBonus = caseData?.category === category ? 0.15 : 0;
    return { id, score: score + categoryBonus };
  });

  boosted.sort((a, b) => b.score - a.score);

  const results: RAGSearchResult[] = [];
  const seen = new Set<string>();

  for (const { id, score } of boosted) {
    const caseData = caseMap.get(id);
    if (!caseData) continue;

    const dedupeKey = `${caseData.caseName}|${caseData.citation}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    results.push({
      caseName: caseData.caseName,
      citation: caseData.citation,
      court: caseData.court,
      year: caseData.year,
      outcome: caseData.outcome,
      filingFee: null,
      keyHolding: caseData.keyHolding,
      relevanceScore: Math.round(score * 100) / 100,
      facts: caseData.facts,
      legalPrinciples: caseData.legalPrinciples,
    });

    if (results.length >= topK) break;
  }

  return results;
}

export async function keywordSearch(
  queryText: string,
  category: DisputeCategory,
  topK = 5
): Promise<RAGSearchResult[]> {
  const { cases } = await loadData();

  const queryWords = queryText
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const scored = cases.map((c) => {
    const text = c.searchText.toLowerCase();
    let score = 0;

    if (c.category === category) score += 10;

    for (const word of queryWords) {
      const occurrences = (text.match(new RegExp(word, 'g')) ?? []).length;
      score += occurrences * (1 + 1 / (c.searchText.length / 1000));
    }

    return { case: c, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const results: RAGSearchResult[] = [];
  const seen = new Set<string>();

  for (const { case: c, score } of scored) {
    const dedupeKey = `${c.caseName}|${c.citation}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    results.push({
      caseName: c.caseName,
      citation: c.citation,
      court: c.court,
      year: c.year,
      outcome: c.outcome,
      filingFee: null,
      keyHolding: c.keyHolding,
      relevanceScore: score / 100,
      facts: c.facts,
      legalPrinciples: c.legalPrinciples,
    });

    if (results.length >= topK) break;
  }

  return results;
}
