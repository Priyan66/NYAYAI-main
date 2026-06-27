'use client';

import { useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, X, Upload } from 'lucide-react';

type Questionnaire = Record<string, boolean>;

interface DocumentUploadProps {
  onSubmit: (files: File[], questionnaire: Questionnaire | null) => Promise<void>;
  isSubmitting?: boolean;
}

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

const QUESTIONS: [string, string][] = [
  ['hasWill',                      'Do you have a Will?'],
  ['hasNominee',                   'Are nominees updated on all your accounts?'],
  ['hasHealthPOA',                 'Do you have a Health Power of Attorney?'],
  ['hasGuardianship',              'Do you have guardianship planning in place?'],
  ['hasUnresolvedPurchase',        'Unresolved purchase complaints over ₹5,000?'],
  ['hasUnresolvedService',         'Unresolved service complaints over ₹5,000?'],
  ['appsWithExcessivePermissions', 'Apps with permissions you did not consciously grant?'],
];

export default function DocumentUpload({ onSubmit, isSubmitting = false }: DocumentUploadProps) {
  const [files, setFiles]                   = useState<File[]>([]);
  const [useQuestionnaire, setUseQuestionnaire] = useState(false);
  const [questionnaire, setQuestionnaire]   = useState<Questionnaire>(
    Object.fromEntries(QUESTIONS.map(([k]) => [k, false]))
  );

  const onDrop = (dropped: File[]) => {
    setFiles(prev => [...prev, ...dropped.filter(f => f.size <= 10 * 1024 * 1024)].slice(0, 5));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED, maxFiles: 5, maxSize: 10 * 1024 * 1024,
    disabled: isSubmitting || useQuestionnaire,
  });

  const canSubmit = useMemo(() => useQuestionnaire || files.length > 0, [files.length, useQuestionnaire]);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>

      {/* Drop zone */}
      <div {...getRootProps()} style={{
        border: `1px dashed ${isDragActive ? 'var(--accent)' : 'var(--border-strong)'}`,
        background: isDragActive ? 'var(--accent-dim)' : 'var(--bg-surface)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-10) var(--space-5)',
        textAlign: 'center',
        cursor: useQuestionnaire || isSubmitting ? 'not-allowed' : 'pointer',
        opacity: useQuestionnaire ? 0.45 : 1,
        transition: 'all var(--transition)',
      }}>
        <input {...getInputProps()} />
        <Upload size={24} color={isDragActive ? 'var(--accent)' : 'var(--text-muted)'}
          style={{ margin: '0 auto var(--space-3)' }} />
        <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
          {isDragActive ? 'Drop files here' : 'Drop files or click to upload'}
        </p>
        <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--text-secondary)', fontSize: 12 }}>
          PDF, DOC, DOCX, JPG, PNG · Max 5 files · 10 MB each
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {files.map(file => (
            <div key={file.name} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              position: 'relative', overflow: 'hidden',
            }}>
              {isSubmitting && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, transparent 0%, var(--accent-dim) 50%, transparent 100%)',
                  animation: 'pulse-border 1.5s ease-in-out infinite',
                }} />
              )}
              <FileText size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button type="button" onClick={() => setFiles(p => p.filter(f => f.name !== file.name))}
                style={{
                  width: 26, height: 26, border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)', background: 'transparent',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Questionnaire toggle */}
      <div className="card">
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
          <input type="checkbox" checked={useQuestionnaire}
            onChange={e => setUseQuestionnaire(e.target.checked)}
            style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
          />
          <span style={{ color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font-body)' }}>
            I don&apos;t have documents — answer questions instead
          </span>
        </label>

        {useQuestionnaire && (
          <div style={{ marginTop: 'var(--space-4)', display: 'grid', gap: 'var(--space-3)' }}>
            {QUESTIONS.map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', cursor: 'pointer' }}>
                <input type="checkbox" checked={Boolean(questionnaire[key])}
                  onChange={e => setQuestionnaire(p => ({ ...p, [key]: e.target.checked }))}
                  style={{ accentColor: 'var(--accent)', width: 15, height: 15, marginTop: 2, flexShrink: 0 }}
                />
                <span style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button type="button" className="btn btn-primary btn-lg"
        disabled={!canSubmit || isSubmitting}
        onClick={() => void onSubmit(files, useQuestionnaire ? questionnaire : null)}
        style={{ width: '100%' }}
      >
        <Upload size={15} />
        {isSubmitting ? 'Scanning…' : 'Scan Documents'}
      </button>
    </div>
  );
}
