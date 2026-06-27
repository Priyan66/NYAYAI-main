export default function LoadingSkeleton({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '14px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '2px',
            width: i === lines - 1 ? '60%' : '100%',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      ))}
    </div>
  );
}
