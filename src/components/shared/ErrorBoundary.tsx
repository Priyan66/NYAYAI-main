'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            maxWidth: '500px',
            margin: '80px auto',
            padding: '32px',
            textAlign: 'center',
            background: '#080808',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'grid',
              placeItems: 'center',
              fontSize: '20px',
            }}
          >
            ⚠
          </div>
          <h2
            style={{
              margin: '0 0 8px',
              fontFamily: 'Barlow, sans-serif',
              fontWeight: 700,
              fontSize: '18px',
              color: '#FFFFFF',
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              margin: '0 0 20px',
              color: '#A0A0A0',
              fontSize: '14px',
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred. Your data is safe.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre
              style={{
                margin: '0 0 16px',
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#EF4444',
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: '120px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error.message}
            </pre>
          )}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '10px 20px',
                background: '#00B4D8',
                border: 'none',
                borderRadius: '6px',
                color: '#000',
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = '/dashboard')}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                color: '#A0A0A0',
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 600,
                fontSize: '13px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
