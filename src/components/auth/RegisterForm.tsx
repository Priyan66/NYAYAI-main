'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { UserPlus } from 'lucide-react';

const schema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Enter a valid email'),
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm your password'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type Values = z.infer<typeof schema>;

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: Values) => {
    setServerError(null);
    const res  = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: values.name, email: values.email, password: values.password }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) { setServerError(body.error ?? 'Registration failed'); return; }

    const login = await signIn('credentials', {
      redirect: false, email: values.email, password: values.password, callbackUrl: '/dashboard',
    });
    if (login?.error) { setServerError('Account created but login failed. Please sign in manually.'); return; }
    router.push('/dashboard');
    router.refresh();
  };

  const FIELDS = [
    { name: 'name'            as const, type: 'text',     label: 'Full Name',       placeholder: 'Priya Sharma' },
    { name: 'email'           as const, type: 'email',    label: 'Email',           placeholder: 'you@example.com' },
    { name: 'password'        as const, type: 'password', label: 'Password',        placeholder: '••••••••' },
    { name: 'confirmPassword' as const, type: 'password', label: 'Confirm Password', placeholder: '••••••••' },
  ];

  return (
    <div style={{
      width: '100%', maxWidth: 400,
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius)',
      padding: 'var(--space-10)',
    }}>
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
        Create account
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 'var(--space-3)' }}>
        {FIELDS.map(f => (
          <div key={f.name}>
            <label className="label">{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} {...register(f.name)} className="input" />
            {errors[f.name] && (
              <p style={{ color: 'var(--danger)', fontSize: 12, margin: '4px 0 0' }}>
                {errors[f.name]?.message}
              </p>
            )}
          </div>
        ))}

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
          <UserPlus size={14} />
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p style={{ marginTop: 'var(--space-5)', color: 'var(--text-secondary)', textAlign: 'center', fontSize: 13 }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  );
}
