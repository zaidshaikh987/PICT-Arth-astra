/**
 * ArthAstra Knowledge Base
 * 
 * This is the "Company Brain" - a comprehensive knowledge base about ArthAstra features,
 * agent logic, and financial rules. This will be vectorized for RAG semantic search.
 */

export const COMPANY_KNOWLEDGE = [
    {
        id: "recovery-squad-overview",
        category: "agents",
        content: `
The Rejection Recovery Squad is a 3-agent sequential pipeline that helps users recover from loan rejections.
Agent 1: The Investigator - Analyzes the loan application using tools like calculateDTI, analyzeEmploymentRisk, and detectFinancialAnomalies.
Agent 2: The Negotiator - Creates recovery strategies using simulateCreditScoreImpact to show potential improvements.
Agent 3: The Architect - Builds a timeline using calculateSavingsTimeline to create a step-by-step recovery plan.
The pipeline runs sequentially: Investigator -> Negotiator -> Architect.
        `
    },
    {
        id: "financial-council-overview",
        category: "agents",
        content: `
The Financial Council is a multi-agent debate system that simulates a bank credit committee.
It consists of 3 agents: The Optimist (finds reasons to approve), The Pessimist (finds reasons to reject), and The Judge (makes final decision).
The Optimist and Pessimist run in parallel to provide balanced perspectives.
The Judge synthesizes both arguments and provides a final verdict with approval status.
This pattern is called "Parallel Debate" and ensures balanced decision-making.
        `
    },
    {
        id: "dti-calculator",
        category: "tools",
        content: `
The DTI (Debt-to-Income) calculator is a crucial financial tool.
Formula: DTI = ((Existing EMI + Monthly Expenses) / Monthly Income) * 100
Interpretation: DTI below 40% is SAFE, 40-50% is MODERATE risk, above 50% is HIGH risk.
Banks typically reject applications if DTI exceeds 40%.
This tool is used by the Investigator agent to identify rejection reasons.
        `
    },
    {
        id: "employment-risk",
        category: "tools",
        content: `
Employment risk analysis evaluates job stability based on type and tenure.
Risk Scores: Salaried with 5+ years = 0 (Safe), Student with <6 months = 100 (Critical).
Employment types ranked by stability: Salaried > Self-Employed > Freelancer > Student.
Tenure categories: <6 months (New), 6m-1yr (Establishing), 1-2yr (Developing), 2-5yr (Stable), 5+yr (Veteran).
Critical risk means income is considered unverifiable and unstable by banks.
        `
    },
    {
        id: "credit-score-simulation",
        category: "tools",
        content: `
The credit score simulator predicts CIBIL score changes based on proposed actions.
Common actions and impacts: Pay down debt (+10-15 points), Dispute errors (+15-20 points), Reduce utilization (+20-25 points).
Current score + impact = Projected score.
Used by the Negotiator agent to show users how specific actions can improve their creditworthiness.
        `
    },
    {
        id: "savings-timeline",
        category: "tools",
        content: `
The savings timeline calculator determines months needed to reach a savings goal.
Formula: Months = (Target Savings - Current Savings) / Monthly Savings Rate
It also generates monthly milestones showing progressive savings accumulation.
Used by the Architect agent to create realistic, time-bound recovery plans.
        `
    },
    {
        id: "loan-eligibility-rules",
        category: "business-logic",
        content: `
Loan eligibility in India follows these rules:
Minimum credit score: 650 for secured loans, 700 for unsecured loans.
Maximum DTI: 40% for most banks, some allow up to 50% with strong credit.
Minimum employment tenure: 6 months for salaried, 2 years for self-employed.
Income verification: Salaried needs salary slips, self-employed needs IT returns.
Age limits: 21-60 years for most loan products.
        `
    },
    {
        id: "recovery-strategies",
        category: "strategies",
        content: `
Common loan rejection recovery strategies include:
1. The Proprietor Pivot: Convert student/freelancer status to registered business for income verification.
2. Credit Command: Focus on improving credit score through dispute errors and reduce utilization.
3. The 6-Month Wait: Build bank statement history to prove income stability.
4. Co-applicant Strategy: Add a family member with stable income and good credit.
5. Secured Loan Alternative: Offer collateral to reduce lender risk.
        `
    },
    {
        id: "agentic-architecture",
        category: "technical",
        content: `
ArthAstra uses a hybrid ADK/SDK architecture for agentic AI.
Conceptual framework: Google Agent Development Kit (ADK) for agent patterns.
Production execution: Google GenAI SDK (Gemini 2.5 Flash) for stability.
Agent orchestration patterns: Sequential Pipeline (Recovery Squad), Parallel Debate (Financial Council).
Tool Registry: All agents have access to deterministic financial calculation tools.
This ensures AI reasoning is grounded in mathematical facts, not hallucinations.
        `
    },
    {
        id: "document-requirements",
        category: "compliance",
        content: `
Required documents for loan applications in India:
Identity: Aadhaar Card, PAN Card (mandatory).
Address: Utility bills, Rental agreement, Passport.
Income: Last 3 months salary slips (salaried), Last 2 years IT returns (self-employed).
Banking: Last 6 months bank statements showing salary credits.
Employment: Employment letter, offer letter, experience certificate.
All documents must be clear, unedited, and match the applicant's declared information.
        `
    }
];

export function getKnowledgeByCategory(category: string) {
    return COMPANY_KNOWLEDGE.filter(item => item.category === category);
}

export function getAllKnowledgeText(): string {
    return COMPANY_KNOWLEDGE.map(item => item.content).join('\n\n');
}
