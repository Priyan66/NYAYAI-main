import { DisputeCategory, DisputeRecord, StatuteInfo } from '@/types';
import statutes from '@/data/statutes.json';
import { generateQueryEmbedding } from '@/lib/embeddings';
import { ragSearch, keywordSearch } from '@/lib/rag';
import { assessCaseStrength, detectLandmines } from '@/lib/scoring';

export async function runAgent2(record: DisputeRecord): Promise<DisputeRecord> {
  const statuteMap = statutes as unknown as Record<DisputeCategory, StatuteInfo>;
  const statuteInfo = statuteMap[record.disputeCategory];
  if (!statuteInfo) throw new Error(`No statute found for category: ${record.disputeCategory}`);

  const enriched: DisputeRecord = { ...record, statuteInfo };

  const precedentCases = await retrieveRelevantCases(record);
  enriched.precedentCases = precedentCases;

  // Replace fake probability with honest assessment
  enriched.caseAssessment = assessCaseStrength(enriched);
  enriched.landmines = detectLandmines(enriched);

  // Keep backward compat for DB column (will remove after migration)
  const strengthToNumber: Record<string, number> = {
    strong: 75,
    moderate: 50,
    challenging: 30,
  };
  enriched.successProbability = strengthToNumber[enriched.caseAssessment.strength] ?? 50;

  return enriched;
}

async function retrieveRelevantCases(record: DisputeRecord) {
  const queryText = buildQueryText(record);

  try {
    const queryVector = await generateQueryEmbedding(queryText);
    const results = await ragSearch(queryVector, record.disputeCategory, 5);
    console.log(`RAG retrieved ${results.length} cases via vector search for category: ${record.disputeCategory}`);
    return results;
  } catch (embeddingError) {
    console.warn('Embedding model unavailable, falling back to keyword search:', embeddingError);

    try {
      const results = await keywordSearch(queryText, record.disputeCategory, 5);
      console.log(`RAG retrieved ${results.length} cases via keyword fallback`);
      return results;
    } catch (keywordError) {
      console.error('Both search methods failed:', keywordError);
      return [];
    }
  }
}

function buildQueryText(record: DisputeRecord): string {
  const parts = [
    record.rawInputTranslated,
    record.summary,
    `Category: ${record.disputeCategory}`,
    record.evidenceItems.length > 0 ? `Evidence: ${record.evidenceItems.join(', ')}` : '',
    record.amountInvolved ? `Amount: ${record.amountInvolved} rupees` : '',
    record.respondentName ? `Against: ${record.respondentName}` : '',
  ].filter(Boolean);

  return parts.join('. ');
}
