'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, FileText } from 'lucide-react';

interface DocumentViewerProps {
  content: string;
  isRewriting?: boolean;
}

// NOTE: CITATION_RE must NOT have the g flag here — it is used in split() AND test().
// Using g flag causes lastIndex to advance and alternates true/false on repeated .test() calls.
const CITATION_SPLIT_RE = /(Section\s\d+[A-Za-z()\-]*(?:\s+of\s+[A-Za-z\s]+Act)?)/;
const CITATION_TEST_RE  = /Section\s\d+[A-Za-z()\-]*(?:\s+of\s+[A-Za-z\s]+Act)?/;
const HEADING_RE = /^(SUBJECT|TO|FROM|DATE|RE:|THROUGH|VIA|BEFORE|IN THE MATTER|WHEREAS|THEREFORE|PRAYER|RELIEF|ANNEXURE|ENCLOSURE)/i;
const SECTION_HEADER_RE = /^(\d+\.\s+[A-Z][A-Z\s]+:|[A-Z][A-Z\s]{4,}:)$/;
const NUMBERED_RE = /^(\d+\.\s|[a-z]\)\s|•\s|-\s)/;

function detectDocType(content: string): string {
  const upper = content.slice(0, 400).toUpperCase();
  if (upper.includes('LEGAL NOTICE') || upper.includes('NOTICE UNDER')) return 'Legal Notice';
  if (upper.includes('COMPLAINT') || upper.includes('COMPLAINANT')) return 'Forum Complaint';
  if (upper.includes('CHECKLIST') || upper.includes('EVIDENCE')) return 'Evidence Checklist';
  if (upper.includes('COACHING') || upper.includes('NEXT STEPS')) return 'Coaching Summary';
  return 'Document';
}

function renderChunks(line: string) {
  const parts = line.split(CITATION_SPLIT_RE);
  return parts.map((part, i) =>
    CITATION_TEST_RE.test(part) ? (
      <mark
        key={i}
        style={{
          background: 'rgba(0,180,216,0.12)',
          color: 'var(--accent)',
          padding: '1px 4px',
          borderRadius: '3px',
          fontWeight: 600,
          fontStyle: 'normal',
        }}
      >
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function renderLine(line: string, index: number) {
  const trimmed = line.trim();

  if (trimmed === '' || trimmed === '---') {
    return trimmed === '---' ? (
      <div
        key={index}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '8px 0',
          color: 'var(--text-ghost)',
          fontSize: '10px',
          fontFamily: 'Barlow, sans-serif',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <span>§</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
      </div>
    ) : (
      <div key={index} style={{ height: '8px' }} />
    );
  }

  // SUBJECT / TO / FROM / DATE lines — bold label
  const colonIdx = trimmed.indexOf(':');
  if (HEADING_RE.test(trimmed) && colonIdx > 0) {
    const label = trimmed.slice(0, colonIdx);
    const value = trimmed.slice(colonIdx + 1).trim();
    return (
      <p key={index} style={{ margin: '2px 0', fontSize: '13px', lineHeight: 1.7 }}>
        <span
          style={{
            fontFamily: 'Barlow, sans-serif',
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginRight: '8px',
          }}
        >
          {label}:
        </span>
        <span style={{ color: 'var(--text-primary)' }}>{renderChunks(value)}</span>
      </p>
    );
  }

  // ALL-CAPS section headers
  if (SECTION_HEADER_RE.test(trimmed)) {
    return (
      <p
        key={index}
        style={{
          margin: '16px 0 4px',
          fontFamily: 'Barlow, sans-serif',
          fontWeight: 700,
          fontSize: '11px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
        }}
      >
        {trimmed}
      </p>
    );
  }

  // Numbered / bulleted list items
  if (NUMBERED_RE.test(trimmed)) {
    return (
      <p
        key={index}
        style={{
          margin: '3px 0',
          paddingLeft: '16px',
          fontSize: '13px',
          lineHeight: 1.75,
          color: 'var(--text-primary)',
          borderLeft: '2px solid rgba(0,180,216,0.2)',
        }}
      >
        {renderChunks(trimmed)}
      </p>
    );
  }

  // Default body line
  return (
    <p
      key={index}
      style={{
        margin: '3px 0',
        fontSize: '14px',
        lineHeight: 1.8,
        color: 'var(--text-primary)',
      }}
    >
      {renderChunks(trimmed)}
    </p>
  );
}

export default function DocumentViewer({ content, isRewriting = false }: DocumentViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }, [content]);

  const docType = detectDocType(content);
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const lines = content.split('\n');

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: `1px solid ${
          isRewriting ? 'var(--border-active)' : 'var(--border)'
        }`,
        borderRadius: '6px',
        overflow: 'hidden',
        animation: isRewriting ? 'pulse-border 1.5s ease-in-out infinite' : 'none',
      }}
    >
      {/* Document header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={13} color="var(--accent)" />
          <span
            style={{
              fontFamily: 'Barlow, sans-serif',
              fontWeight: 700,
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
            }}
          >
            {docType}
          </span>
          {isRewriting && (
            <span
              style={{
                padding: '2px 8px',
                background: 'var(--accent-dim)',
                border: '1px solid var(--border-active)',
                borderRadius: '3px',
                color: 'var(--accent)',
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 700,
                fontSize: '9px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Rewriting
            </span>
          )}
        </div>
        <button
          onClick={() => void handleCopy()}
          title="Copy to clipboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            background: copied ? 'var(--success-dim)' : 'transparent',
            border: `1px solid ${
              copied ? 'rgba(45,212,191,0.3)' : 'var(--border)'
            }`,
            borderRadius: '4px',
            color: copied ? 'var(--success)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontFamily: 'Barlow, sans-serif',
            fontWeight: 600,
            fontSize: '10px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            transition: 'all 200ms',
          }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Document body */}
      <div
        style={{
          padding: '28px 32px',
          fontFamily: 'Noto Sans, sans-serif',
          maxHeight: '520px',
          overflowY: 'auto',
        }}
      >
        {lines.map((line, i) => renderLine(line, i))}
      </div>

      {/* Document footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '16px',
          padding: '8px 16px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
        }}
      >
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '10px',
            color: 'var(--text-ghost)',
          }}
        >
          {wordCount} words · ~{readMinutes} min read
        </span>
      </div>
    </div>
  );
}
