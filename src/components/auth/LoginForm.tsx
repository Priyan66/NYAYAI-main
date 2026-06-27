'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { LogIn } from 'lucide-react';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type Values = z.infer<typeof schema>;

export default function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: Values) => {
    setServerError(null);
    const result = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl: '/dashboard',
    });
    if (result?.error) { setServerError('Invalid email or password'); return; }
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div style={{
      width: '100%', maxWidth: 400,
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius)',
      padding: 'var(--space-10)',
    }}>
      {/* Logo */}
      <p style={{
        margin: '0 0 var(--space-2)', textAlign: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 700,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--accent)', fontSize: 13,
      }}>
        NYAY.AI
      </p>
      <h1 style={{
        margin: '0 0 var(--space-6)', textAlign: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 22, color: 'var(--text-primary)',
      }}>
        Welcome back
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <div>
          <label className="label">Email</label>
          <input type="email" placeholder="you@example.com" {...register('email')} className="input" />
          {errors.email && <p style={{ color: 'var(--danger)', fontSize: 12, margin: '4px 0 0' }}>{errors.email.message}</p>}
        </div>

        <div>
          <label className="label">Password</label>
          <input type="password" placeholder="••••••••" {...register('password')} className="input" />
          {errors.password && <p style={{ color: 'var(--danger)', fontSize: 12, margin: '4px 0 0' }}>{errors.password.message}</p>}
        </div>

        {serverError && (
          <p style={{
            margin: 0, padding: '10px 12px',
            background: 'var(--danger-dim)', border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 13,
          }}>
            {serverError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className="btn btn-primary"
          style={{ width: '100%', marginTop: 'var(--space-1)' }}>
          <LogIn size={14} />
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {googleEnabled && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            margin: 'var(--space-4) 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <button
            onClick={() => void signIn('google', { callbackUrl: '/dashboard' })}
            className="btn btn-ghost"
            style={{ width: '100%' }}
          >
            Continue with Google
          </button>
        </>
      )}

      <p style={{ marginTop: 'var(--space-5)', color: 'var(--text-secondary)', textAlign: 'center', fontSize: 13 }}>
        No account?{' '}
        <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
      </p>
    </div>
  );
}
