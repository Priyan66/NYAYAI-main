import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  const [totalDisputes, activeCases, recentDisputes, latestScore] = await Promise.all([
    prisma.dispute.count({ where: { userId: session.user.id } }),
    prisma.dispute.count({ where: { userId: session.user.id, status: { not: 'complete' } } }),
    prisma.dispute.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.nyayScore.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({
    totalDisputes,
    activeCases,
    recentDisputes,
    latestScore,
    user: {
      name: user?.name ?? session.user.name,
      email: user?.email ?? session.user.email,
      language: user?.language ?? 'en',
      createdAt: user?.createdAt ?? null,
    },
  });
}
