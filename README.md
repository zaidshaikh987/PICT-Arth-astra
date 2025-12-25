# ArthAstra (LoanSaathi) 🚀

> **"Borrow Smarter, Not Harder."**

ArthAstra is a **Next-Gen Financial Wellness Platform** designed to democratize access to credit for the "Next Billion Users" in India. It goes beyond simple loan aggregation by acting as an **Intelligent Financial Companion** that guides users through eligibility, documentation, and financial planning using Voice AI and Agentic Workflows.

---

## 🏗️ Technical Requirements Specification

This project utilizes a modern, enterprise-grade stack optimized for **Speed**, **Aesthetics**, and **Intelligence**.

### 1. Core Framework & Architecture ⚙️
*   **Framework:** [Next.js 16 (App Router)](https://nextjs.org) - Utilizing the latest React Server Components (RSC) for hybrid rendering.
*   **Language:** [TypeScript](https://www.typescriptlang.org) - Strictly typed JavaScript ensuring type safety across the entire application.
*   **Runtime:** Node.js (v22 compatible).

### 2. Frontend Layer (UI/UX) 🎨
*   **Styling Engine:**
    *   **Tailwind CSS v4:** Utility-first CSS framework for rapid UI development.
    *   `tailwind-merge` & `clsx`: Intelligent handling of dynamic class names.
    *   `tailwindcss-animate`: Dedicated plugin for animation primitives.
*   **Component Library:**
    *   **Radix UI:** Headless, accessible primitives (Dialog, Select, Slider, Switch, Accordion) ensuring WAI-ARIA compliance.
    *   `lucide-react`: Modern, consistent SVG icon set.
*   **Animations:**
    *   **Framer Motion:** Powering complex orchestrations (Step transitions, Pulse effects, Voice Assistant entry animations).
*   **Data Visualization:**
    *   **Recharts:** Responsive, composable charting library for "Financial Health" and "Peer Insights" modules.
*   **Form Handling:**
    *   `react-hook-form`: Performant, unstructured form state management.
    *   **Zod:** Schema-first validation for robust inputs (Phone numbers, Income ranges, EMI math).

### 3. Backend & API Layer 🔌
*   **API Routes:** Next.js Server Functions (`app/api/*`) handling secure server-side logic.
*   **Voice Processing:**
    *   **Web Speech API:** Native Browser API used for distinct Speech-to-Text (STT) and Text-to-Speech (TTS) capabilities without external latency.
*   **AI Integration:**
    *   **Google Gemini 1.5 Flash:** The high-speed "Brain" powering the agentic reasoning.
    *   `@google/genai` SDK: Direct interface for AI model communication.
*   **Notifications:**
    *   **Twilio SDK:** (`twilio`) Integrated for real-time WhatsApp and SMS status updates to the user's registered phone number.

### 4. Logical & Agentic Layers 🧠
*   **Agent Architecture:**
    *   **BaseAgent Class:** Abstract foundation handling model fallback, rate-limiting, and error resilience.
    *   **Specialist Agents:**
        *   `LoanOfficerAgent`: Merges deterministic math (Calculators) with probabilistic LLM reasoning to explain eligibility.
        *   `RecoveryAgent`: Diagnoses rejection reasons (e.g., High DTI) and generates "chemically actionable" recovery plans.
*   **Simulation Engines (Local Logic):**
    *   `calculator.ts`: Pure functions for EMI, Eligibility ratios, and Amortization schedules.
    *   `voice-assistant-context.tsx`: Client-side NLU state machine managing voice commands (`"Go to dashboard"`, `"Check eligibility"`).

### 5. Storage & State Management 💾
*   **Client-Side Persistence:**
    *   **LocalStorage:** Acts as the primary "Local-First" database, persisting sensitive user data (`onboardingData`, `loanProfile`, `authSession`) on the client device for privacy.
*   **State Management:**
    *   **React Context API:** Used for `VoiceAssistantProvider` and `LanguageProvider` to broadcast global state without the overhead of Redux.

### 6. Development Tools 🛠️
*   **Linting:** ESLint configured for Next.js best practices.
*   **Formatting:** Prettier (implied standard).
*   **Bundler:** Turbopack (via Next.js 16) for instant HMR updates.

---

## 🌟 Key Features Deep Dive

### 🎙️ Bilingual Voice AI (Mic Integration)
We leverage the **Web Speech API** to create a hands-free banking experience.
-   **Microphone Access:** One-click activation via the floating "Mic" button.
-   **Speech-to-Intent:** The system parses natural language like *"Mera naam Rahul hai"* (My name is Rahul) or *"5 Lakh ka loan chahiye"* (I need a 5 Lakh loan) and auto-fills the corresponding form fields.
-   **Voice Navigation:** Users can jump between modules just by saying *"Open Document Checklist"* or *"Show me the Loan Comparison"*.

### � Intelligent Agents
-   **Loan Officer:** It doesn’t just show a table of loans. It analyzes your *Credit Score + Income - Obligations* to recommend the single best offer (marked with an "AI Recommended" ribbon).
-   **Rejection Recovery:** If a user doesn't qualify, this agent steps in. It simulates "What-If" scenarios (e.g., increasing tenure, reducing loan amount) to find a passing combination.

### 📲 Real-Time Updates (Twilio)
-   **WhatsApp Integration:** Users receive instant notifications for:
    -   Application Submission 📝
    -   Document Verification ✅
    -   Loan Disbursement 💰

---

## 🛠️ Installation & Setup

### Prerequisites
-   Node.js v22 or higher
-   Google Cloud API Key (for Gemini)
-   Twilio Account (Optional, for WhatsApp features)

### 1. Environment Variables
Create a `.env.local` file in the root directory:

```env
# AI Intelligence
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key_here

# Notifications (Optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=your_number
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🚀 Deployment

The project is configured for cloud deployment (e.g., Google Cloud Run, Vercel).

### Docker Support
A `Dockerfile` is included to containerize the application for Google Cloud Run.
1.  **Build:** `docker build -t arthastra .`
2.  **Run:** `docker run -p 3000:3000 arthastra`

---

**© 2025 ArthAstra Financial Services.** Built with ❤️ for India.
