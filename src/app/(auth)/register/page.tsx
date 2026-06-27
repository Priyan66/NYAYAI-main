import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';
import StarfieldCanvas from '@/components/shared/StarfieldCanvas';

export default function RegisterPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <StarfieldCanvas />
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 400 }}>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <Link href="/" style={{
            color: '#444444', fontSize: 12,
            fontFamily: 'Barlow, sans-serif', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            textDecoration: 'none',
          }}>
            ← NYAY.AI
          </Link>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
