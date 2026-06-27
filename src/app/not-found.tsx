import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        color: '#FFFFFF',
        gap: '20px',
        padding: '24px',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
          color: '#00B4D8',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        Navigation Error
      </p>
      <h1
        style={{
          margin: 0,
          fontFamily: 'Barlow, sans-serif',
          fontWeight: 700,
          fontSize: '40px',
          textTransform: 'uppercase',
        }}
      >
        404 - CASE NOT FOUND
      </h1>
      <p style={{ margin: 0, color: '#A0A0A0', textAlign: 'center' }}>
        The page you requested does not exist.
      </p>
      <Link
        href="/"
        style={{
          padding: '10px 22px',
          background: '#00B4D8',
          color: '#000',
          textDecoration: 'none',
          borderRadius: '2px',
          fontFamily: 'Barlow, sans-serif',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Back To Home
      </Link>
    </div>
  );
}
