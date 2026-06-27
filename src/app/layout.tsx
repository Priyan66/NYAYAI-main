import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import SessionWrapper from '@/components/shared/SessionWrapper';

export const metadata: Metadata = {
  title: "NYAY.AI - India's First Legal Identity Engine",
  description:
    "Court-ready legal notices in 8 minutes. Your legal health score in 60 seconds. For 1.4 billion Indians.",
  keywords: 'legal aid India, consumer complaint, legal notice, employment rights',
};

/* Inline script: read persisted theme from localStorage BEFORE first paint to
   avoid a flash of dark content for light-theme users. Dark remains default. */
const noFlashThemeScript = `
(function(){
  try {
    var raw = localStorage.getItem('nyay-ui-store');
    var theme = 'dark';
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.state && parsed.state.theme === 'light') theme = 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body suppressHydrationWarning>
        <SessionWrapper>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--toast-border)',
                borderRadius: '2px',
                fontFamily: 'Noto Sans, sans-serif',
              },
            }}
          />
        </SessionWrapper>
      </body>
    </html>
  );
}
