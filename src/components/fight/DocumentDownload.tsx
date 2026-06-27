'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface DocumentDownloadProps {
  disputeId: string;
  legalNotice: string;
  forumComplaint: string;
  evidenceChecklist: string;
  coachingSummary: string;
}

async function downloadPdf(filename: string, title: string, content: string) {
  const { pdf, Document, Page, Text, StyleSheet } = await import('@react-pdf/renderer');
  const styles = StyleSheet.create({
    page:  { padding: 28, fontSize: 11, lineHeight: 1.6 },
    title: { fontSize: 14, marginBottom: 12, fontWeight: 700 },
  });
  const Doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text>{content}</Text>
      </Page>
    </Document>
  );
  const blob = await pdf(Doc).toBlob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function DocumentDownload({ disputeId, legalNotice, forumComplaint, evidenceChecklist, coachingSummary }: DocumentDownloadProps) {
  const [downloadingWord, setDownloadingWord] = useState(false);

  const downloadWord = async () => {
    setDownloadingWord(true);
    try {
      const res = await fetch('/api/fight/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeId }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `nyay-case-${disputeId}.docx`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Word document downloaded');
    } catch {
      toast.error('Failed to download Word document');
    } finally {
      setDownloadingWord(false);
    }
  };

  const fullContent = [legalNotice, '---', forumComplaint, '---', evidenceChecklist, '---', coachingSummary].join('\n\n');

  return (
    <div style={{
      position: 'sticky', bottom: 0,
      background: 'rgba(0,0,0,0.96)',
      borderTop: '1px solid var(--border)',
      backdropFilter: 'blur(8px)',
      padding: 'var(--space-3) var(--space-4)',
      marginTop: 'var(--space-6)',
    }}>
      <div style={{
        display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center',
        justifyContent: 'flex-end',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginRight: 'auto' }}>
          Download Case File
        </span>

        <button className="btn btn-ghost btn-sm"
          onClick={() => void downloadPdf('legal-notice.pdf', 'Legal Notice', legalNotice)}
        >
          <Download size={11} /> Notice PDF
        </button>

        <button className="btn btn-ghost btn-sm"
          onClick={() => void downloadPdf('nyay-case-file.pdf', 'Full Case File', fullContent)}
        >
          <Download size={11} /> Full Case PDF
        </button>

        <button className="btn btn-primary btn-sm"
          onClick={() => void downloadWord()}
          disabled={downloadingWord}
        >
          <Download size={11} />
          {downloadingWord ? 'Preparing…' : 'Word Document'}
        </button>
      </div>
    </div>
  );
}
