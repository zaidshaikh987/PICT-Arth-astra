# ArthAstra Finance 🚀  
*The Intelligent, Voice‑First Financial Companion*

ArthAstra is a voice‑first, agentic‑AI powered financial companion for Indian borrowers.  
It uses Google’s Agent Development Kit (ADK), Gemini 2.5 Flash, forensic document vision and deterministic financial tools to turn confusing loan journeys (and rejections) into clear, actionable roadmaps.

---

## 🧭 Overview

- **Audience:** Indian borrowers who want to understand eligibility, compare offers, and recover from rejections.  
- **Core idea:** Combine **structured calculators** (DTI, EMI, eligibility) with **multi‑agent AI** and **bilingual voice** so users get both hard numbers and human‑like guidance.  
- **Form factor:** Responsive **Next.js 16** app with a deep **dashboard + sidebar** UX and always‑available AI assistant.

---

## 🏆 Key Features

### 1. End‑to‑End Borrower Experience

| Feature | Where | What it does |
| :-- | :-- | :-- |
| **Smart Onboarding** | `/onboarding` | 5‑step, bilingual (En/Hi/Mr) profile wizard with voice‑guided fields, autosave to MongoDB. |
| **Phone Login** | `/login` | One‑field login using mobile number; restores session via secure cookie. |
| **Dashboard Overview** | `/dashboard` | Single view of eligibility, documentation progress, approval odds, alerts and AI council. |
| **Application Timeline** | `/dashboard/timeline` | Pulse‑like view of the loan journey with simulated stages and estimated completion windows. |
| **Document Vault** | `/dashboard/documents` | Upload + checklist for PAN, Aadhaar, income proofs, bank statements, with AI‑based document analysis. |

### 2. Dashboard Sidebar & Modules

The left sidebar in the dashboard is the main navigation surface. It is grouped into sections:

| Section | Item | Route | Summary |
| :-- | :-- | :-- | :-- |
| **OVERVIEW** | Dashboard | `/dashboard` | Eligibility snapshot, DTI gauge, EMI capacity, alerts, and AI council visualization. |
|  | Timeline | `/dashboard/timeline` | Visual heartbeat of the application process over time. |
| **APPLICATION** | Documents | `/dashboard/documents` | Document checklist and upload center powered by AI doc analyzer. |
|  | Eligibility | `/dashboard/eligibility` | Detailed eligibility report using deterministic calculators + AI explanation. |
|  | Loan Offers | `/dashboard/loans` | Comparison of loan scenarios with EMI, rates, total cost and approval odds. |
| **LEARN** | Knowledge Hub | `/dashboard/learn` | Curated RAG knowledge from company brain (RBI rules, documentation best‑practices, etc.). |
|  | Finance Quiz | `/dashboard/quiz` | Gamified financial literacy quiz with explanations. |
| **AI TOOLS** | Credit Optimizer | `/dashboard/optimizer` | “What‑if” simulator to tweak debt, income, score and see impact on eligibility. |
|  | Goal Planner | `/dashboard/multi-goal` | Multi‑goal (home, car, travel, etc.) planner sequencing goals into one financial path. |
|  | Recovery Agent | `/dashboard/rejection-recovery` | ADK pipeline that diagnoses rejection, designs strategy and roadmap. |
| **ACCOUNT** | Settings | `/dashboard/settings` | Update profile, preferences and language. |
|  | Logout | — | Ends session by clearing `userId` cookie and returning to landing page. |

Cross‑cutting UX:

- **Top bar:** breadcrumb (Dashboard → Page), AI status pill, notification bell, language switcher (EN/HI/MR), compact user avatar.  
- **Education Policy Bar:** bottom‑anchored contextual “Did you know?” strip with RBI/policy facts based on current route.  
- **Notification Center:** fetches and displays alerts (drop‑offs, credit score changes, EMI reminders, etc.).

### 3. AI & Agentic Intelligence

ArthAstra’s intelligence is implemented in layers, backed by deterministic math:

1. **Perception & Knowledge (Vision + RAG)**  
   - Forensic document vision with `gemini-2.5-flash` to inspect Aadhaar/PAN/bank statements.  
   - RAG over `lib/knowledge/company-brain.ts` (RBI rules, documentation requirements, agentic architecture).

2. **Collaborative Planning – Recovery Squad (ADK pipeline)**  
   - **🕵️ Investigator:** analyzes root causes with tools like `calculateDTI`, credit simulators and CIBIL fetcher.  
   - **🐺 Negotiator:** constructs negotiation scripts and lender‑friendly narratives.  
   - **🏗️ Architect:** builds a stepwise, time‑bound recovery roadmap.

3. **Adversarial Judgment – Financial Council (ADK debate)**  
   - **⚡ Optimist:** argues for approval based on strengths and future potential.  
   - **🔒 Pessimist:** argues for rejection based on risk policies.  
   - **⚖️ Judge:** weighs both sides and outputs a binding verdict (JSON‑like structure used by UI).

4. **Global Chat Orchestrator**  
   - `/api/chat` uses an Orchestrator Agent to route each user message to:  
     `ONBOARDING`, `LOAN_OFFICER`, `RECOVERY` or `GENERAL` based on intent.  
   - Responses are short, RAG‑grounded, and aware of the user profile when available.

### 4. Voice & Accessibility

**Bilingual Voice Assistant 2.0**

- Embedded voice assistant orchestrated via `lib/voice-assistant-context.tsx`.  
- Registration of form fields (id, label, question) enables fully voice‑driven onboarding.  
- Navigation commands (e.g. "open eligibility", "show documents") map to dashboard routes.

Hybrid flow:

1. **Continuous feedback:** browser Speech API for instant on‑screen transcription while speaking.  
2. **High‑accuracy finalization:** `/api/voice-transcribe` sends audio blobs to Gemini 2.5 Flash for accurate text (Hindi/English mix, numeric strings, names).

---

## 🧰 Tech Stack

- **Framework:** Next.js **16** (App Router), React **19**.  
- **Styling:** Tailwind CSS 4, Radix UI primitives, custom component library under `components/ui`.  
- **State & Context:** React Context for user, language and voice assistant state.  
- **Database:** MongoDB via Mongoose (`lib/db.ts`, `lib/models/*`).  
- **AI / LLM:** Google GenAI SDK + Google ADK (`@google/genai`, `@google/adk`) with key rotation.  
- **Observability:** OpenTelemetry exporters for traces/metrics/logs (optional).  
- **Comms:** Twilio WhatsApp/SMS for notifications and recovery nudges.  
- **Charts & UX:** Recharts, Framer Motion, embla‑carousel, Lucide icons.

---

## 🧱 Architecture & Data Flow

High‑level lifecycle:

1. **Onboarding & Registration**
   - User completes steps 1–5 in `/onboarding`.  
   - Frontend posts to `/api/user/register`.  
   - Backend:
     - connects to MongoDB (`connectDB()`),  
     - normalizes phone, initializes `creditScoreHistory`, sample `emiSchedule`, `spendingCategories`,  
     - persists `User`, creates welcome alerts, sets `userId` httpOnly cookie.

2. **Login & Session**
   - `/login` posts to `/api/user/login`.  
   - If phone exists, `sessionTs` updated and `userId` cookie is set.  
   - `UserProvider` fetches `/api/user/me` on mount and provides `user`, `updateUser`, `refreshUser`.

3. **Dashboard Rendering**
   - Layout: `DashboardLayout` wraps all `/dashboard/*` pages.  
   - `DashboardOverview` pulls `user` and runs `calculateDetailedEligibility`, `calculateDTI`, `analyzeEmploymentRisk`.  
   - UI cards (eligibility gauge, docs progress, approval odds) are derived purely from stored user + calculator outputs.

4. **AI Calls**
   - Frontend widgets call APIs:
     - `/api/eligibility-insights` → specialist loan officer agent over deterministic stats.  
     - `/api/rejection-recovery` → ADK Recovery Squad pipeline.  
     - `/api/council-meeting` → ADK Financial Council debate.  
     - `/api/document-analyzer` → Gemini Vision doc analysis.  
     - `/api/chat` → orchestrated chatbot with RAG and tools.

5. **Alerts & Notifications**
   - `Alert` model stores user‑level alerts.  
   - `/api/alerts` exposes fetch + mark‑read.  
   - `/api/alerts/generate` and `/api/cron/process-dropoffs` create alerts and optional WhatsApp nudges for drop‑offs or credit changes.  
   - `/api/notify` formats Twilio WhatsApp/SMS messages for key stages (docs uploaded, credit check started/completed, lender matches).

---

## 📂 Project Structure (High‑Level)

At `arthastra/`:

| Path | Description |
| :-- | :-- |
| `app/` | Next.js App Router tree (routing, pages, API routes). |
| `app/page.tsx` | Public landing page + marketing sections. |
| `app/login/` | Phone‑based login page. |
| `app/onboarding/` | Entry for multi‑step onboarding wizard. |
| `app/dashboard/` | Dashboard shell and feature pages (documents, eligibility, loans, quiz, etc.). |
| `app/api/` | All API routes (user, chat, agents, documents, alerts, cron, voice). |
| `components/landing/` | Hero, how‑it‑works, features, social proof, CTA. |
| `components/onboarding/` | Wizard shell + per‑step forms + shared types. |
| `components/dashboard/` | Dashboard layout, cards, council visualizer, charts, quiz, optimizers, notifications. |
| `components/ui/` | Reusable UI primitives (button, card, input, select, switch, tabs, toast, etc.). |
| `components/global-chatbot.tsx` | Floating AI chatbot that calls `/api/chat`. |
| `components/voice-assistant-button.tsx` | Launcher for the voice assistant panel. |
| `lib/ai/` | Gemini client, key rotation, embeddings, vector store for RAG, document vision. |
| `lib/agents/` | Core/ADK agent orchestration (orchestrator, recovery squad, council, prompts). |
| `lib/tools/` | Deterministic financial tools (eligibility calculator, EMI calculators, DTI, credit simulation). |
| `lib/models/` | Mongoose models (User, Alert, etc.). |
| `lib/knowledge/` | Domain knowledge “company brain” used for RAG. |
| `lib/user-context.tsx` | Client‑side user context that fetches and updates profile. |
| `lib/language-context.tsx` & `lib/i18n.ts` | Multi‑language UI copy (EN/HI/MR). |
| `lib/voice-assistant-context.tsx` | Voice assistant logic, navigation, and form‑filling. |
| `scripts/test-db.ts` | Helper script to test `MONGODB_URI` connectivity. |
| `docs/*.md` | Architecture and deployment deep‑dives (AI models, ADK, GCP deployment). |

For a deeper dive into the AI side, see:

- `docs/AI_MODELS_ARCHITECTURE.md`  
- `docs/AGENTIC_AI_WORKFLOW.md`  
- `docs/GOOGLE_ADK.md`  
- `docs/DEPLOYMENT_GUIDE_GCP.md`

---

## 🛠️ Getting Started (Local)

### 1. Clone & Install

```bash
git clone https://github.com/zaidshaikh987/PICT-Arth-astra.git
cd PICT-Arth-astra/arthastra
npm install
```

### 2. Environment Variables

Create `.env.local` in `arthastra/`:

```env
# Core
GOOGLE_GENERATIVE_AI_API_KEY=your_primary_gemini_key
# Optional: comma‑separated list for key rotation
GOOGLE_API_KEYS=key1,key2,key3

MONGODB_URI=your_mongodb_connection_string

# Optional: Twilio for WhatsApp/SMS notifications
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

At minimum you need `GOOGLE_GENERATIVE_AI_API_KEY` and `MONGODB_URI`; Twilio is optional.

### 3. Run Dev Server

```bash
npm run dev
```

The app starts on `http://localhost:3000`.  
Use `/onboarding` to create a profile, then `/login` to access the dashboard.

### 4. Helpful Scripts

```bash
# Run type‑aware Next.js build
npm run build

# Lint the project
npm run lint

# Start production server (after build)
npm start

# Test MongoDB connectivity using .env.local
npx ts-node scripts/test-db.ts
```

---

## ☁️ Deployment Notes

- Container‑friendly: Dockerfile produces a compact standalone Next.js 16 image with `server.js`.  
- Verified on Google Cloud Run (see `docs/DEPLOYMENT_GUIDE_GCP.md`) using:
  - `GOOGLE_GENERATIVE_AI_API_KEY` for Gemini.  
  - `MONGODB_URI` for hosted MongoDB (e.g. Atlas).  
- Any platform that supports Node 22 + Docker (Vercel, Render, etc.) can run this image with the same env vars.

---

## 🤝 Contributing / Extending

Ideas for extension:

- Add more dashboards or calculators under `components/dashboard`.  
- Add new specialist agents in `lib/agents/specialists` wired through `/api/*` routes.  
- Expand RAG knowledge in `lib/knowledge/company-brain.ts` for more domains (SME loans, home loans, etc.).  
- Enhance accessibility and regionalization (more languages, fonts, contrast modes).

If you plan to contribute, keep these conventions in mind:

- Reuse existing `components/ui` primitives and follow Tailwind class patterns already used.  
- Add new APIs under `app/api/feature/route.ts` using the same error‑handling style.  
- Keep AI flows grounded in deterministic tools first, LLM analysis second.

---

## 📜 License

This repository currently does not declare an explicit open‑source license.  
Treat it as private/internal unless a LICENSE file is added.

---

*> Built with ❤️ for the Techfiesta Hackathon by Team Pravantak.*
