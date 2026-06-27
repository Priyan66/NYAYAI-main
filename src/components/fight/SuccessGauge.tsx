'use client';

import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/shared/AnimatedCounter';

interface SuccessGaugeProps {
  probability: number;
  size?: number;
}

function getPath() {
  return 'M 10 110 A 90 90 0 0 1 190 110';
}

export default function SuccessGauge({ probability, size = 300 }: SuccessGaugeProps) {
  const clamped = Math.min(100, Math.max(0, probability));
  const radius = 90;
  const circumference = Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;
  const color = clamped > 65 ? '#2DD4BF' : clamped >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ width: size, maxWidth: '100%', display: 'grid', placeItems: 'center' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
        <svg viewBox="0 0 200 120" width="100%" height="auto">
          <path d={getPath()} stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
          <motion.path
            d={getPath()}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '58%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <AnimatedCounter
            target={clamped}
            suffix="%"
            className="mono"
            style={{ color, fontSize: '36px', lineHeight: 1, fontWeight: 500 }}
          />
          <p
            style={{
              margin: '8px 0 0',
              color: '#A0A0A0',
              fontFamily: 'Barlow, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontSize: '9px',
            }}
          >
            Win Probability
          </p>
        </div>
      </div>
    </div>
  );
}
