import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const score = await prisma.nyayScore.findUnique({ where: { id: params.id } });
  if (!score) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(score);
}
