'use client';

import { useEffect, useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Profile {
  name: string | null;
  email: string | null;
  language: string;
  createdAt: string | null;
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
  { value: 'ta', label: 'தமிழ்' },
  { value: 'te', label: 'తెలుగు' },
  { value: 'kn', label: 'ಕನ್ನಡ' },
];

export default function SettingsPage() {
  const [profile, setProfile]           = useState<Profile | null>(null);
  const [language, setLanguage]         = useState('en');
  const [oldPw, setOldPw]               = useState('');
  const [newPw, setNewPw]               = useState('');
  const [confirmPw, setConfirmPw]       = useState('');
  const [savingLang, setSavingLang]     = useState(false);
  const [savingPw, setSavingPw]         = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const run = async () => {
      const res  = await fetch('/api/dashboard/summary');
      const data = (await res.json()) as { user: Profile };
      if (res.ok && data.user) { setProfile(data.user); setLanguage(data.user.language ?? 'en'); }
    };
    void run();
  }, []);

  const saveLanguage = async () => {
    setSavingLang(true);
    try {
      const res = await fetch('/api/settings/language', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language }) });
      if (!res.ok) throw new Error();
      toast.success('Language updated');
    } catch { toast.error('Failed to update language'); }
    finally { setSavingLang(false); }
  };

  const changePassword = async () => {
    if (!oldPw || !newPw || !confirmPw) { toast.error('All fields required'); return; }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      const res  = await fetch('/api/settings/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }) });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? 'Failed');
      setOldPw(''); setNewPw(''); setConfirmPw('');
      toast.success('Password updated');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setSavingPw(false); }
  };

  const deleteData = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/settings/delete-data', { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('All case data deleted');
      setConfirmDelete(false);
    } catch { toast.error('Failed to delete data'); }
    finally { setDeleting(false); }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', display: 'grid', gap: 'var(--space-4)' }}>
      <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>
        Settings
      </h1>

      {/* Account info */}
      <section className="card">
        <h2 style={{ margin: '0 0 var(--space-4)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
          Account
        </h2>
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', width: 80, flexShrink: 0 }}>Email</span>
            <span style={{ color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{profile?.email ?? '—'}</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', width: 80, flexShrink: 0 }}>Member</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN') : '—'}
            </span>
          </div>
        </div>
      </section>

      {/* Language */}
      <section className="card">
        <h2 style={{ margin: '0 0 var(--space-4)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
          Language
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={language} onChange={e => setLanguage(e.target.value)}
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
              height: 36, padding: '0 10px', fontFamily: 'var(--font-body)', fontSize: 14,
            }}
          >
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => void saveLanguage()} disabled={savingLang}>
            <Save size={12} /> {savingLang ? 'Saving…' : 'Save'}
          </button>
        </div>
      </section>

      {/* Password */}
      <section className="card">
        <h2 style={{ margin: '0 0 var(--space-4)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
          Change Password
        </h2>
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {[
            { placeholder: 'Current password', value: oldPw,     set: setOldPw },
            { placeholder: 'New password',      value: newPw,     set: setNewPw },
            { placeholder: 'Confirm password',  value: confirmPw, set: setConfirmPw },
          ].map(f => (
            <input key={f.placeholder} type="password" placeholder={f.placeholder}
              value={f.value} onChange={e => f.set(e.target.value)}
              className="input"
            />
          ))}
          <button className="btn btn-primary btn-sm" style={{ width: 'fit-content' }}
            onClick={() => void changePassword()} disabled={savingPw}>
            <Save size={12} /> {savingPw ? 'Saving…' : 'Update Password'}
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <section style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--danger-border)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-5)',
      }}>
        <h2 style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--danger)' }}>
          Danger Zone
        </h2>
        <p style={{ margin: '0 0 var(--space-4)', color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
          Permanently delete all your disputes and legal score records. This cannot be undone.
        </p>
        <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
          <Trash2 size={12} /> Delete All My Data
        </button>
      </section>

      {/* Confirm modal */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          zIndex: 110, display: 'grid', placeItems: 'center', padding: 'var(--space-5)',
        }}>
          <div className="card" style={{ width: 'min(400px, 100%)', border: '1px solid var(--danger-border)' }}>
            <h3 style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              Confirm deletion
            </h3>
            <p style={{ margin: '0 0 var(--space-5)', color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
              This will permanently delete all disputes and legal score records. There is no undo.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff', border: 'none' }}
                onClick={() => void deleteData()} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
