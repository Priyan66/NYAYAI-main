import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { oldPassword, newPassword } = (await req.json()) as {
    oldPassword: string;
    newPassword: string;
  };

  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: 'All password fields are required' }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash) {
    return NextResponse.json({ error: 'Password account not found' }, { status: 400 });
  }

  if (hashPassword(oldPassword) !== user.passwordHash) {
    return NextResponse.json({ error: 'Old password is incorrect' }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: hashPassword(newPassword) },
  });

  return NextResponse.json({ success: true });
}
