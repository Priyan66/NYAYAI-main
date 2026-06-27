export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
      }}
    >
      {children}
    </div>
  );
}
