import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limiter';

function getIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (!xff) return '127.0.0.1';
  return xff.split(',')[0]?.trim() || '127.0.0.1';
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkRateLimit(getIp(req), 20)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dispute = await prisma.dispute.findUnique({ where: { id: params.id } });
  if (!dispute) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(dispute);
}
