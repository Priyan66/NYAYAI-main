import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const allowed = ['en', 'hi', 'ta', 'te', 'kn'];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { language } = (await req.json()) as { language: string };
  if (!allowed.includes(language)) {
    return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { language },
  });

  return NextResponse.json({ success: true });
}
