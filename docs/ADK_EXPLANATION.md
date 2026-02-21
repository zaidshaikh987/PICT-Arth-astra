# Technical Deep-Dive: Google ADK in ArthAstra

To explain ArthAstra's **Recovery Agent** to a judge, you can describe it as a **"Multi-Agent Orchestration Engine"** built on the **Google Agent Development Kit (ADK)** and powered by **Gemini 2.5 Flash**.

## 1. The Multi-Agent Pipeline
Unlike a simple chatbot, ArthAstra uses a **sequential agentic workflow**. We deploy three specialized AI agents, each with its own persona, strict instructions, and private toolset.

### 🕵️ Agent 1: The Investigator (Risk Analysis)
*   **Role**: Deep-dives into why a loan was rejected.
*   **Tools**: Calls `calculateDTI` (Debt-to-Income), `analyzeEmploymentRisk`, and `detectFinancialAnomalies`.
*   **Output**: A structured JSON detailing the "Root Cause" and "Risk Severity".

### ⚖️ Agent 2: The Negotiator (Strategy)
*   **Role**: Takes the Investigator's findings and builds a counter-strategy.
*   **Tools**: Uses `simulateCreditScore` to predict how specific actions will improve the user's profile.
*   **Output**: A professional "Bank Negotiation Script" and a "Counter-Offer Strategy".

### 🏗️ Agent 3: The Architect (Roadmap)
*   **Role**: Converts the strategy into a time-bound execution plan.
*   **Tools**: Uses `calculateSavingsTimeline` to set realistic milestones (Week 1, Month 1, Month 3).
*   **Output**: A "Recovery Roadmap" with an estimated time-to-reapply.

---

## 2. The Google ADK Framework (Levels 1–4)
We implemented the official **ADK 4-Level Architecture** to ensure production-grade reliability:

| Level | Feature | Implementation in ArthAstra |
| :--- | :--- | :--- |
| **Level 1** | **Agent Configuration** | Defined `LlmAgent` objects with specific system instructions for each persona. |
| **Level 2** | **Agent Execution** | Used the ADK `Runner` to execute agents asynchronously and handle streaming responses. |
| **Level 3** | **Tool Calling** | Wrapped our complex financial logic into `FunctionTool` objects with **Zod Schemas** for type-safe validation. |
| **Level 4** | **Memory & Planning** | Utilized `InMemorySessionService` to maintain context between the different agents in the pipeline. |

---

## 3. Why this "Wows" the Judge:
1.  **Cyborg-AI Interaction**: The AI doesn't "hallucinate" math. It takes user data, feeds it into real TypeScript financial calculators (Tools), and interprets the results.
2.  **Autonomous Collaboration**: The Negotiator *reads* the Investigator's report and the Architect *reads* the Negotiator's strategy—true multi-agent collaboration.
3.  **Gemini 2.5 Flash**: We leverage the long-context and high reasoning speed of Gemini to process these multi-stage thoughts in under 90 seconds.
4.  **Type Safety**: Every tool call is validated by Zod schemas, ensuring the AI never sends malformed data to our banking logic.

---

### Pro-Tip for Presentation:
Tell the judge: *"We didn't just build a chatbot; we built a Financial Council. Using the Google ADK, we've automated the work of a financial investigator, a credit counselor, and a wealth manager into a single, seamless recovery pipeline."*
