import { Scale } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        textAlign: 'center',
        gap: '16px',
      }}
    >
      <Scale size={48} color="rgba(255,255,255,0.1)" />
      <h3
        style={{
          fontFamily: 'Barlow, sans-serif',
          fontWeight: 600,
          fontSize: '20px',
          color: '#FFFFFF',
          margin: 0,
        }}
      >
        {title}
      </h3>
      <p style={{ color: '#A0A0A0', fontSize: '14px', maxWidth: '320px', margin: 0 }}>
        {description}
      </p>
      {action}
    </div>
  );
}
