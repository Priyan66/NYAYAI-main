import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = 10;
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;

  const [rows, total] = await Promise.all([
    prisma.dispute.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.dispute.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({
    rows,
    page: safePage,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}
