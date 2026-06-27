//test
export const runtime = 'nodejs';   
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string, stored: string): boolean {
  return bcrypt.compareSync(password, stored);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase().trim() },
        });
        if (!user || !user.passwordHash) return null;

        const isValid = verifyPassword(credentials.password as string, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    authorized({ auth, request }) {
      const isProtectedRoute =
        request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/fight') ||
        request.nextUrl.pathname.startsWith('/score') ||
        request.nextUrl.pathname.startsWith('/history') ||
        request.nextUrl.pathname.startsWith('/settings');

      if (isProtectedRoute && !auth?.user) {
        return Response.redirect(new URL('/login', request.url));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: { name: user.name, googleId: account.providerAccountId },
          create: {
            email: user.email,
            name: user.name ?? 'User',
            googleId: account.providerAccountId,
          },
        });
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
