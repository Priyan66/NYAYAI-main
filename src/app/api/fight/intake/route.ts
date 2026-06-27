import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { runAgent1 } from '@/agents/agent1-intake';
import { checkRateLimit } from '@/lib/rate-limiter';

function getIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (!xff) return '127.0.0.1';
  return xff.split(',')[0]?.trim() || '127.0.0.1';
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      input: string;
      evidenceItems: string[];
      amountInvolved?: number;
      incidentDate?: string;
    };

    const result = await runAgent1({
      text: body.input,
      evidenceItems: body.evidenceItems ?? [],
      amountInvolved: body.amountInvolved ?? null,
      incidentDate: body.incidentDate ?? null,
    });

    if (result.status === 'needs_clarification') {
      return NextResponse.json({
        status: 'needs_clarification',
        clarifyingQuestions: result.clarifyingQuestions,
      });
    }

    const userId = session.user.id;
    const dispute = await prisma.dispute.create({
      data: {
        userId,
        status: 'intake',
        originalInput: body.input,
        originalLanguage: result.disputeRecord!.originalLanguage,
        disputeRecord: JSON.stringify(result.disputeRecord),
      },
    });

    return NextResponse.json({
      status: 'success',
      disputeId: dispute.id,
      disputeRecord: result.disputeRecord,
    });
  } catch (error) {
    console.error('Intake error:', error);
    return NextResponse.json(
      { error: 'Failed to process intake. Please try again.' },
      { status: 500 }
    );
  }
}
