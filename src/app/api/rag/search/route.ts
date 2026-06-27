import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateQueryEmbedding } from '@/lib/embeddings';
import { ragSearch, keywordSearch } from '@/lib/rag';
import { DisputeCategory } from '@/types';
import { checkRateLimit } from '@/lib/rate-limiter';

const allowedCategories: DisputeCategory[] = [
  'consumer',
  'tenancy',
  'employment',
  'property',
  'family',
  'contract',
  'debt_recovery',
  'harassment',
];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  if (!checkRateLimit(ip)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') as DisputeCategory;
  const query = searchParams.get('query') ?? '';
  const useKeywords = searchParams.get('keywords') === '1';

  if (!category || !allowedCategories.includes(category)) {
    return NextResponse.json({ error: 'Category required' }, { status: 400 });
  }

  try {
    let cases;

    if (useKeywords) {
      cases = await keywordSearch(query, category, 5);
    } else {
      const queryVector = await generateQueryEmbedding(query);
      cases = await ragSearch(queryVector, category, 5);
    }

    return NextResponse.json({
      cases,
      method: useKeywords ? 'keyword' : 'vector',
      count: cases.length,
    });
  } catch (error) {
    console.error('RAG search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
