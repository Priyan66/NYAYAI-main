import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateWordDocument } from '@/lib/document-generator';
import { checkRateLimit } from '@/lib/rate-limiter';

function getIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (!xff) return '127.0.0.1';
  return xff.split(',')[0]?.trim() || '127.0.0.1';
}

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req), 10)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { disputeId } = (await req.json()) as { disputeId: string };
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const notice = dispute.revisedNotice ?? dispute.legalNotice ?? '';
  const complaint = dispute.revisedComplaint ?? dispute.forumComplaint ?? '';
  const caseName = `NYAY.AI Case - ${dispute.id}`;

  const buffer = await generateWordDocument(notice, complaint, caseName);
  const bytes = new Uint8Array(buffer);

  return new NextResponse(bytes, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="nyay-case-${disputeId}.docx"`,
    },
  });
}
