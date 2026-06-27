<div align="center">

# NYAY.AI

### India's First Legal Identity Engine

**Court-ready legal notices in 8 minutes. Your legal health score in 60 seconds.**
Built for the 1.4 billion Indians who were told the law is not for them.

[Live Demo](#-demo)  ·  [Architecture](#-architecture)  ·  [Quick Start](#-quick-start)  ·  [Deploy to Vercel](#-deploy-to-production)

![Next.js](https://img.shields.io/badge/Next.js-14-000?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-F55036?style=flat-square)
![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?style=flat-square&logo=prisma&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)

</div>

---

## The Problem

> Meena is a domestic worker in Mumbai. Her employer hasn't paid ₹32,000 in salary for four months.
> She has the WhatsApp messages. She has the salary slips. She has a textbook case under Indian law.
>
> Her options today:
> 1. Hire a lawyer for ₹15,000 — half of what she's owed.
> 2. Visit a legal aid clinic and wait six months.
> 3. Do nothing.
>
> **Sixty percent of Indians choose option three.**

India does not have a *law* problem. It has an **access** problem — the gulf between a citizen's story in Hindi, Tamil, or Telugu and a court-ready document in English legalese. NYAY.AI closes that gulf.

---

## What NYAY.AI Does

Two products. One mission.

### ⚖️ Nyay Fight — *Court Pipeline*
Turn any citizen's story into a complete, court-ready case file in under eight minutes.

- **Legal Notice** drafted under the correct Act and Sections
- **Forum Complaint** ready to file at the right forum
- **Evidence Checklist** tailored to the case category
- **Coaching Summary** in the user's language explaining what to expect
- **Adversarial Strength Test** — the document is attacked and revised before you ever see it

### 📊 Nyay Score — *Preventive Layer*
Map your legal vulnerability **before** a dispute becomes expensive.

- Score 0–500 across 6 dimensions (Contract Safety, Tenancy, Employment, Consumer, Digital, Family)
- Contract clause analysis from PDF uploads
- Rights you haven't used
- Three concrete actions to improve this week

---

## Why It's Different

Most "legal AI" today is a ChatGPT wrapper that hallucinates Section numbers. NYAY.AI is engineered to be trustworthy:

| Property | How we achieve it |
|---|---|
| **No hallucinated citations** | Deterministic statute lookup + local RAG over 200 hand-curated Indian cases. Citations are *retrieved*, not generated. |
| **Adversarial self-review** | Agent 4 attacks Agent 3's draft like a defending lawyer, then Agent 3 revises. Documents survive a cross-examination before you do. |
| **Language-native, not translation-native** | Hindi/Tamil/Telugu/Kannada/English travel through the **entire** pipeline. No silent English mid-step. |
| **Honest case assessment** | Strength labels are *strong / moderate / challenging* — backed by evidence, statute fit, and limitation period. We refuse to over-promise. |
| **Zero per-query infra cost** | RAG runs locally with on-device embeddings. No vector-DB bill. No rate limits. No user data leaving the box. |

---

## 🏗️ Architecture

A four-agent pipeline orchestrated end-to-end:

```mermaid
flowchart TD
    A["User Input<br/>Hindi · Tamil · Telugu · Kannada · English"] --> B
    B["<b>Agent 1 — Intake Parser</b><br/>Groq LLaMA 3.3 70B<br/>• Detects language (franc-min)<br/>• Extracts DisputeRecord<br/>• Asks ≤ 2 clarifying questions if unclear"] --> C
    C["<b>Agent 2 — Legal Intelligence</b><br/>Deterministic + local RAG<br/>• Statute lookup (curated table)<br/>• Vector RAG over 200 cases<br/>• Honest case-strength assessment<br/>• Landmine detection"] --> D
    D["<b>Agent 3 — Document Drafter</b><br/>Groq LLaMA 3.3 70B (streaming)<br/>• Legal Notice<br/>• Forum Complaint<br/>• Evidence Checklist<br/>• Coaching Summary"] --> E
    E["<b>Agent 4 — Adversarial Reviewer</b><br/>Groq LLaMA 3.3 70B<br/>Finds: wrong citations, procedural gaps,<br/>factual holes, counter-narratives"] --> F
    F["<b>Agent 3 Revision Loop</b><br/>Patches every weakness Agent 4 found"] --> G
    G["📄 Final Document Set<br/>Notice + Complaint + Checklist + Coaching"]
```

### Agent responsibilities

| Agent | Role | Engine | Key output |
|---|---|---|---|
| **1. Intake Parser** | Turn unstructured citizen story into structured `DisputeRecord` | LLaMA 3.3 70B | Typed JSON: parties, category, amount, evidence, language |
| **2. Legal Intelligence** | Map the case to law and precedent without hallucinating | Deterministic + RAG | Applicable Act/Sections, top-5 precedent cases, strength label, landmines |
| **3. Document Drafter** | Produce four documents in the user's language | LLaMA 3.3 70B, streaming | Markdown documents ready for PDF/DOCX export |
| **4. Adversarial Reviewer** | Attack the draft as if defending the respondent | LLaMA 3.3 70B | Structured critique → feeds Agent 3 revision pass |

---

## 🔎 Retrieval (Local RAG)

NYAY.AI ships a **fully local** Retrieval-Augmented Generation pipeline. No external vector API. No key. No leak.

1. **Corpus** — 200 landmark Indian cases curated in `src/data/legal-cases.json` with a rich `searchText` field tuned for semantic similarity.
2. **Embeddings** — each case is encoded into a 384-dimensional vector by **`Xenova/all-MiniLM-L6-v2`** (`@xenova/transformers`).
3. **Index** — vectors live in `src/data/case-embeddings.json` (committed; production never re-embeds).
4. **Query** — user dispute is embedded → cosine similarity → top-5 cases returned.
5. **Boosts** — same-category cases get a +0.15 relevance bonus.
6. **Fallback** — a BM25-inspired keyword search kicks in if the embedding model is unavailable.

**Why this beats a hosted vector DB for our use case**
- Free forever, no rate limits, no API key
- Semantic across languages: *"malik ne paisa nahi diya"* retrieves the same context as *"employer withheld wages"*
- Works offline after a one-time 23 MB model cache
- Every citation in a document traces back to a real case in the corpus

---

## 🧱 Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14** (App Router) + **TypeScript strict** | Server actions, streaming, modern DX |
| LLM | **Groq API** — LLaMA 3.3 70B | Fastest tokens/sec for streaming UX |
| Retrieval | **`@xenova/transformers`** (MiniLM-L6) | On-device embeddings, zero infra cost |
| Database | **Prisma ORM** + **PostgreSQL** | Production-ready, Vercel-friendly |
| Auth | **NextAuth.js v5** (credentials + optional Google) | Session-based, edge-compatible |
| UI | Token-driven design system in `globals.css` + **Tailwind** + **Framer Motion** | Single source of truth for theming |
| Forms | **react-hook-form** + **Zod** | Typed validation end-to-end |
| Documents | **`@react-pdf/renderer`**, **`docx`** | Court-grade PDF + Word export |
| State | **Zustand** (persisted) | Tiny, no boilerplate |
| i18n | **next-intl** + **franc-min** | Five Indian languages, statistical detection |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+**
- **PostgreSQL** running locally (or a free Neon / Supabase / Vercel Postgres URL)
- A free **Groq API key** from [console.groq.com](https://console.groq.com)

### Install & run

```bash
# 1. Clone
git clone https://gitlab.com/sahupriyanshu1920-group/NYAYAI.git
cd NYAYAI

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env.local
# Then edit .env.local — see "Environment variables" below

# 4. Initialise database (creates tables in Postgres)
npx prisma generate
npm run db:push
npm run db:seed

# 5. Build the local RAG index (one-time, ~2–3 min, downloads a 23 MB model)
npm run generate-embeddings
# Commit the resulting src/data/case-embeddings.json so prod skips this step

# 6. Launch
npm run dev
```

Open <http://localhost:3000>.

### Environment variables

| Variable | Required | Example |
|---|---|---|
| `GROQ_API_KEY` | ✅ | `gsk_...` (free at console.groq.com) |
| `NEXTAUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | `http://localhost:3000` (dev) / your domain (prod) |
| `DATABASE_URL` | ✅ | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `GOOGLE_CLIENT_ID` | Optional | Only if using Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Optional | Only if using Google OAuth |

---

## 🌍 Deploy to Production

NYAY.AI is built for one-click deployment on **Vercel**.

1. **Provision Postgres** — any of:
   - Vercel Postgres (Storage → Create → Postgres) — *easiest, auto-injects `DATABASE_URL`*
   - [Neon](https://neon.tech) (free tier)
   - [Supabase](https://supabase.com) (free tier)
2. **Import the repo** into Vercel.
3. **Set environment variables** in Vercel → Project → Settings → Environment Variables:
   - `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GROQ_API_KEY`
4. **Deploy.** Vercel auto-detects Next.js; the build runs `prisma generate` then `next build`.
5. **Create tables in production:**
   ```bash
   # Locally, point Prisma at your production DB once
   DATABASE_URL="<prod-url>" npx prisma db push
   ```
6. Visit your URL — you're live.

---

## 🎨 Design System

NYAY.AI ships a token-driven design system: every colour, radius, space, and font lives in CSS variables in `src/app/globals.css`. Components never hardcode values — they read from `var(--accent)`, `var(--bg-secondary)`, etc.

- **Dark theme** (default) — pure black canvas, cyan accent (`#00B4D8`), Barlow display + JetBrains Mono, subtle CRT scanline texture.
- **Light theme** (optional) — layered slate surfaces, royal blue accent (`#2563EB`), soft shadows in place of borders.
- **One toggle** in the landing nav and dashboard header — no flash, no layout shift, persisted in localStorage.

Adding a new component? Read the tokens. Don't invent values.

---

## 📁 Project Structure

```
NYAYAI/
├── prisma/
│   └── schema.prisma           # User · Dispute · NyayScore models (PostgreSQL)
├── src/
│   ├── agents/                 # The four orchestration agents
│   │   ├── agent1-intake.ts
│   │   ├── agent2-intelligence.ts
│   │   ├── agent3-drafter.ts
│   │   └── agent4-adversarial.ts
│   ├── app/
│   │   ├── (auth)/             # Login · Register
│   │   ├── (dashboard)/        # Dashboard · Fight · Score · History · Settings
│   │   ├── api/                # All server routes (intake, generate, review, RAG)
│   │   ├── globals.css         # Design tokens + utility classes
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── auth/               # Login & Register forms
│   │   ├── fight/              # Intake, streaming, adversarial UI
│   │   ├── score/              # Legal health score UI
│   │   ├── layout/             # Sidebar · Header
│   │   └── shared/             # ThemeToggle, StarfieldCanvas, AnimatedCounter …
│   ├── data/                   # legal-cases.json · case-embeddings.json · statutes.json
│   ├── lib/                    # groq, embeddings, rag, scoring, prompts, language, utils
│   ├── store/                  # Zustand: ui · dispute · score (persisted)
│   └── types/                  # Shared TypeScript types
├── scripts/
│   ├── generate-embeddings.ts  # One-time RAG indexer
│   └── curate-legal-cases.js   # Dataset hygiene
└── .gitlab-ci.yml              # lint · typecheck · build
```

---

## 🎬 Demo

Click **TRY DEMO →** on the landing page to run the entire pipeline against Meena's pre-filled unpaid-salary case. You'll see all four agents execute live, with the legal notice streaming character-by-character as Agent 3 writes it.

What to look for:
- The **Agent Progress Tracker** at the top — each agent lights up as it runs.
- **Precedent Cases** retrieved by RAG — these are real Indian cases from the local corpus.
- The **Success Gauge** and **Landmine Alerts** — Agent 2's honest assessment.
- The **Adversarial Stream** — watch Agent 4 critique the draft in real time, then Agent 3 revise.

---

## 🛡️ Security & Trust

- **No legal advice claim.** Every document is labelled as a draft requiring user review. We give people the first 80% they couldn't afford.
- **No PII to third parties.** Embeddings run on-device. Only sanitised, structured fields reach the LLM.
- **Honest assessments.** Case strength is *strong / moderate / challenging* — we refuse to inflate weak cases.
- **Traceable citations.** Every Act/Section comes from a curated table; every case from a vetted corpus.
- **Auth + session control.** NextAuth v5, hashed passwords, no plaintext storage.
- **User data deletion.** `DELETE /api/settings/delete-data` removes all user-owned records.

---

## 🗺️ Roadmap

- [ ] Voice intake (Whisper) for users who can't type
- [ ] WhatsApp bot — the most accessible Indian surface
- [ ] Expand corpus from 200 → 1,000 landmark cases
- [ ] Coverage for Family Law (divorce, maintenance) and Cheque Bounce (NI Act 138)
- [ ] State legal aid authority integrations
- [ ] Offline-first PWA for low-connectivity regions

---

## ❓ FAQ

**Is this legal advice?**
No. NYAY.AI produces *draft* documents and educational summaries. Users are explicitly directed to have documents reviewed before filing.

**How accurate are the citations?**
Statute citations are deterministic lookups against a curated table (`src/data/statutes.json`). Case citations are retrieved — not generated — from a hand-vetted 200-case corpus. Agent 4 flags any citation in the draft that isn't in the retrieved context.

**Why Groq and not OpenAI / Anthropic?**
Latency. The streaming UX ("watch your notice being written") is only believable at Groq's tokens-per-second. Pricing also makes a free tier sustainable.

**Can I run this without an internet connection?**
The RAG retrieval works offline after the one-time model cache. The LLM calls require Groq, which needs the network. A future offline LLM path is on the roadmap.

**How do I add a new dispute category?**
1. Add the category to `src/types/` enums.
2. Add the statute entry to `src/data/statutes.json`.
3. Add ~20 landmark cases to `src/data/legal-cases.json`.
4. Re-run `npm run generate-embeddings`.
5. Commit the updated `case-embeddings.json`.

---

## 🤝 Contributing

Issues and merge requests welcome. If you're contributing legal content, please cite the source (`indiacode.nic.in`, `indiankanoon.org`, or an official court order URL).

---

## 📜 License

MIT. Use it. Fork it. Help build legal access for 1.4 billion people.

---

<div align="center">

**1.4 billion Indians. Zero legal access. Until now.**

Built for the people who were told the law is not for them.

</div>
