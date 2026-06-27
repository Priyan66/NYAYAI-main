'use client';

import { useEffect, useRef, useState } from 'react';

interface StreamingTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export default function StreamingText({
  text,
  speed = 12,
  onComplete,
  className = '',
}: StreamingTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed('');
    setIsComplete(false);

    timerRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        const chunkSize = Math.min(3, text.length - indexRef.current);
        setDisplayed(text.slice(0, indexRef.current + chunkSize));
        indexRef.current += chunkSize;
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed, onComplete]);

  return (
    <span className={className}>
      <span style={{ whiteSpace: 'pre-wrap' }}>{displayed}</span>
      {!isComplete && (
        <span
          style={{
            display: 'inline-block',
            width: '2px',
            height: '1em',
            background: '#00B4D8',
            marginLeft: '1px',
            animation: 'pulse 1s step-start infinite',
          }}
        />
      )}
    </span>
  );
}
