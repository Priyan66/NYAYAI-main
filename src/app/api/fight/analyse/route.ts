import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { runAgent2 } from '@/agents/agent2-intelligence';
import { DisputeRecord } from '@/types';
import { checkRateLimit } from '@/lib/rate-limiter';

function getIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (!xff) return '127.0.0.1';
  return xff.split(',')[0]?.trim() || '127.0.0.1';
}

export async function POST(req: NextRequest) {
  const { allowed } = checkRateLimit(getIp(req));
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { disputeId } = (await req.json()) as { disputeId: string };
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });

    const record = JSON.parse(dispute.disputeRecord) as DisputeRecord;
    const enriched = await runAgent2(record);

    await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: 'analysed',
        disputeRecord: JSON.stringify(enriched),
        successProbability: enriched.successProbability ?? null,
      },
    });

    return NextResponse.json({ status: 'success', disputeRecord: enriched });
  } catch (error) {
    console.error('Analyse error:', error);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
