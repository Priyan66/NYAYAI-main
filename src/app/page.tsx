'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, ArrowRight, Shield, Activity, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import StarfieldCanvas from '@/components/shared/StarfieldCanvas';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import ThemeToggle from '@/components/shared/ThemeToggle';

const PRODUCTS = [
  {
    badge: 'Court Pipeline',
    title: 'Nyay Fight',
    subtitle: 'Turn your story into a court-ready case file in under 8 minutes.',
    icon: Shield,
    iconColor: 'var(--accent)',
    iconBg: 'var(--accent-dim)',
    features: ['Legal notice in 8 minutes', 'Forum complaint ready', 'Evidence checklist', 'Coaching in your language', 'Adversarial strength test'],
    href: '/fight',
    cta: 'Start Fighting',
  },
  {
    badge: 'Preventive Layer',
    title: 'Nyay Score',
    subtitle: 'Map your legal vulnerability before a dispute becomes expensive.',
    icon: Activity,
    iconColor: 'var(--success)',
    iconBg: 'var(--success-dim)',
    features: ['Score 0–500 across 6 dimensions', 'Contract clause analysis', "Rights you haven't used", '3 actions to improve this week', 'Legal vulnerability map'],
    href: '/score',
    cta: 'Check Score',
  },
];

const PERSONAS = [
  {
    name: 'Meena',
    role: 'Domestic Worker, Mumbai',
    text: "Employer hasn't paid ₹32,000 in salary for 4 months. Has salary slips and WhatsApp messages.",
    product: 'Nyay Fight',
    color: 'var(--accent)',
  },
  {
    name: 'Arjun',
    role: 'Software Engineer, Bangalore',
    text: 'About to sign a contract with a 12-month non-compete clause. Needs to know what is dangerous before signing.',
    product: 'Nyay Score',
    color: 'var(--success)',
  },
  {
    name: 'Razia',
    role: 'Shop Owner, Hyderabad',
    text: "Refrigerator under warranty not repaired for 3 months. Doesn't know she has a clear consumer case.",
    product: 'Both',
    color: 'var(--warning)',
  },
];

const STATS = [
  { n: 13,  suffix: 'B', label: 'Indians without legal access' },
  { n: 60,  suffix: '%', label: 'Disputes resolved by legal notice alone' },
  { n: 0,   prefix: '₹', label: 'Cost to you. Always.' },
];

const HOW = [
  { step: '01', title: 'Tell your story', body: 'Describe what happened in any language — Hindi, Tamil, Telugu, Kannada, or English. No legal jargon needed.' },
  { step: '02', title: 'AI builds your case', body: 'Four specialised agents analyse your situation, map applicable law, draft documents, and stress-test them against defence arguments.' },
  { step: '03', title: 'Download and act', body: 'Get a court-ready legal notice, forum complaint, evidence checklist, and coaching summary. In minutes, not months.' },
];

export default function Home() {
  const router = useRouter();
  const { setDemoMode } = useUIStore();

  const startDemo = () => { setDemoMode(true); router.push('/fight?demo=1'); };

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--nav-bg)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          maxWidth: 1160, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px var(--space-5)',
        }}>
          <Link href="/" style={{
            color: 'var(--text-primary)', textDecoration: 'none',
            fontFamily: 'var(--font-display)', fontWeight: 700,
            letterSpacing: '0.14em', fontSize: 20, textTransform: 'uppercase',
          }}>
            NYAY.AI
          </Link>

          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 'var(--space-2)' }}>
            <ThemeToggle size="sm" />
            <Link href="/login" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Log In</Link>
            <Link href="/register" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Get Started</Link>
          </div>

          <button className="md:hidden btn btn-ghost btn-sm" style={{ width: 34, height: 34, padding: 0 }} aria-label="Menu">
            <Menu size={15} />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <StarfieldCanvas />
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 1160, margin: '0 auto', padding: 'var(--space-12) var(--space-5)' }}>

          <motion.p className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ margin: '0 0 var(--space-4)' }}>
            Legal Aid · For Everyone
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}
            style={{
              margin: '0 0 var(--space-5)',
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'clamp(38px, 8vw, 84px)', lineHeight: 1,
              textTransform: 'uppercase', letterSpacing: '-0.01em',
            }}
          >
            Your Legal<br />Identity.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.16 }}
            style={{ margin: '0 0 var(--space-8)', maxWidth: 560, color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1.7 }}
          >
            Court-ready legal notices in 8 minutes. Your legal health score in 60 seconds.
            For 1.4 billion Indians who were told the law is not for them.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.24 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}
          >
            <Link href="/fight" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              Fight for Your Rights <ArrowRight size={15} />
            </Link>
            <Link href="/score" className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
              Check Your Score
            </Link>
            <button
              onClick={startDemo}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--accent)', fontFamily: 'var(--font-display)',
                fontWeight: 600, fontSize: 13, letterSpacing: '0.08em',
                textTransform: 'uppercase', textDecoration: 'underline',
                textUnderlineOffset: 4,
              }}
            >
              Try Demo →
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          maxWidth: 1160, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: 'var(--space-8) var(--space-10)',
              borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, color: 'var(--accent)' }}>
                <AnimatedCounter target={s.n} prefix={s.prefix ?? ''} suffix={s.suffix ?? ''} />
              </div>
              <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: 'var(--space-12) var(--space-5)' }}>
        <p className="eyebrow" style={{ margin: '0 0 var(--space-4)' }}>How It Works</p>
        <h2 style={{ margin: '0 0 var(--space-8)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(24px, 4vw, 36px)' }}>
          From story to court file in minutes.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-5)' }}>
          {HOW.map((h, i) => (
            <motion.div key={h.step}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="card"
            >
              <p style={{ margin: '0 0 var(--space-3)', fontFamily: 'var(--font-mono)', fontSize: 40, color: 'var(--border-strong)', lineHeight: 1 }}>{h.step}</p>
              <h3 style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{h.title}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{h.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: '0 var(--space-5) var(--space-12)' }}>
        <p className="eyebrow" style={{ margin: '0 0 var(--space-4)' }}>Two Products. One Mission.</p>
        <h2 style={{ margin: '0 0 var(--space-8)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(24px, 4vw, 36px)' }}>
          Built for every legal situation.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          {PRODUCTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div key={p.title}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: 'var(--space-6)',
                  display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
                  transition: 'border-color var(--transition)',
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 'var(--radius-sm)',
                  background: p.iconBg, display: 'grid', placeItems: 'center',
                }}>
                  <Icon size={20} color={p.iconColor} />
                </div>
                <div>
                  <p className="eyebrow" style={{ margin: '0 0 var(--space-1)', color: p.iconColor }}>{p.badge}</p>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24 }}>{p.title}</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{p.subtitle}</p>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--space-2)' }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 13, color: 'var(--text-primary)' }}>
                      <Zap size={11} color={p.iconColor} style={{ flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={p.href} className="btn btn-primary" style={{ textDecoration: 'none', marginTop: 'auto', width: 'fit-content' }}>
                  {p.cta} <ArrowRight size={13} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── PERSONAS ── */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: '0 var(--space-5) var(--space-12)' }}>
        <p className="eyebrow" style={{ margin: '0 0 var(--space-4)' }}>Real People. Real Problems.</p>
        <h2 style={{ margin: '0 0 var(--space-8)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(24px, 4vw, 36px)' }}>
          Built for 1.4 billion real people.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          {PERSONAS.map((p, i) => (
            <motion.article key={p.name}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `color-mix(in srgb, ${p.color} 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${p.color} 30%, transparent)`,
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                  color: p.color,
                }}>
                  {p.name[0]}
                </div>
                <div>
                  <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{p.name}</p>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 12 }}>{p.role}</p>
                </div>
              </div>
              <p style={{ margin: '0 0 var(--space-3)', color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.7 }}>{p.text}</p>
              <span className="badge" style={{ background: 'transparent', border: `1px solid ${p.color}`, color: p.color }}>
                {p.product}
              </span>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-5)', borderTop: '1px solid var(--border)' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{
            margin: '0 0 var(--space-5)',
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'clamp(28px, 5vw, 52px)', lineHeight: 1.1,
          }}>
            1.4 billion Indians.<br />Zero legal access.<br />Until now.
          </h2>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              Get Started Free <ArrowRight size={15} />
            </Link>
            <button onClick={startDemo} className="btn btn-ghost btn-lg">Try Demo</button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{
          maxWidth: 1160, margin: '0 auto',
          padding: 'var(--space-4) var(--space-5)',
          display: 'flex', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 14 }}>NYAY.AI</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Built for the 1.4 billion.</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>© 2025 NYAY.AI</span>
        </div>
      </footer>
    </div>
  );
}
