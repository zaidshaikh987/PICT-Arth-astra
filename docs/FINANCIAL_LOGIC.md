# 🏦 ArthAstra Financial Logic & Formulas Documentation

This document provides a comprehensive breakdown of every calculation, formula, and logic gate used across the ArthAstra platform.

---

## 1. Core Lending Calculations

### 1.1 Equated Monthly Installment (EMI)
**File:** `lib/tools/calculator.ts` (Function: `calculateEMI`)
Used for all loan calculations.

**Formula:**
$$EMI = \frac{P \times r \times (1+r)^n}{(1+r)^n - 1}$$
*   $P$ = Principal Loan Amount
*   $r$ = Monthly Interest Rate (Annual Rate / 12 / 100)
*   $n$ = Tenure in Months

---

### 1.2 Debt-to-Income Ratio (DTI / FOIR)
**File:** `lib/tools/eligibility-calculator.ts`
Banking standard "Fixed Obligation to Income Ratio".

**Formula:**
$$DTI = \left( \frac{\text{Existing EMIs}}{\text{Total Monthly Income}} \right) \times 100$$
*   **Thresholds:**
    *   $< 40\%$: Healthy (Green)
    *   $40\% - 50\%$: Moderate Risk (Yellow)
    *   $> 50\%$: High Risk (Red)

---

### 1.3 Maximum Loan Eligibility (Reverse EMI)
**File:** `lib/tools/eligibility-calculator.ts`
Determines how much a user can borrow based on their repayment capacity.

**Step 1: EMI Capacity**
$$\text{Available for EMI} = (\text{Total Income} \times 0.5) - \text{Existing EMIs}$$
*Note: Most banks cap total EMI at 50% of monthly income.*

**Step 2: Max Principal Calculation**
Using the reverse EMI formula to find $P$ given a target $EMI$:
$$P = \text{Available for EMI} \times \frac{(1+r)^n - 1}{r \times (1+r)^n}$$

---

## 2. Eligibility & Approval Scoring

### 2.1 Approval Odds Calculation
**File:** `lib/tools/eligibility-calculator.ts`
Approval Odds (0–100%) are determined by the average of 4 weighted factors:

| Factor | Calculation | Pass Criteria |
| :--- | :--- | :--- |
| **Income Level** | `(Income / 1,00,000) * 100` (capped at 100) | $\ge ₹25,000$ |
| **DTI Ratio** | `100 - (DTI * 1.5)` | $\le 40\%$ |
| **Credit Score** | `(Score - 300) / 6` | $\ge 750$ |
| **Stability** | Salaried (75-100) vs Freelance/Self-Employed (65) | $\ge 2$ years |

**Final Adjustments:**
*   **No Credit History:** -10%
*   **DTI > 50%:** -15%
*   **Joint App:** +10%

---

### 2.2 Credit Readiness Score
**File:** `components/dashboard/dashboard-overview.tsx`
The big circular number on the Dashboard Hero.

**Formula:**
$$\text{Readiness Score} = \text{Average of all 4 Eligibility Factor Scores}$$

---

## 3. Specialist Agent Tools

### 3.1 Employment Risk Analysis
**File:** `lib/tools/agent-tools.ts`
Used by the Investigator Agent to flag risky profiles.

*   **Student:** +70 Risk Points
*   **Freelancer:** +50 Risk Points
*   **Self-Employed:** +30 Risk Points
*   **Tenure < 6 months:** +30 Risk Points

---

### 3.2 Credit Score Simulator
**File:** `lib/tools/agent-tools.ts`
Predicts score movement based on actions.

*   **Pay off Debt:** +25 points
*   **Reduce Utilization:** +20 points
*   **Dispute Error:** +15 points
*   **New Credit Line:** -5 points

---

### 3.3 Recovery Timeline (Architect)
**File:** `lib/tools/agent-tools.ts`
Calculates how long until a user is "Loan Ready".

**Formula:**
$$\text{Months to Target} = \frac{\text{Target Savings} - \text{Current Savings}}{\text{Monthly Savings Rate}}$$
*   **Target Savings:** 20% of requested loan amount (down payment buffer).
*   **Savings Rate:** `Monthly Income - EMIs - Expenses`.

---

## 4. Optimization & Projections

### 4.1 Credit Optimizer Calculations
**File:** `lib/tools/credit-simulator.ts`
Shows the "What If" scenarios for eligibility.

*   **Income Projected:** `Current + Increase + (Joint ? ₹40k : 0)`
*   **DTI Projected:** `(Reduced EMI / Projected Income) * 100`
*   **Max Amount Multipliers:**
    *   Score $\ge 750$: **1.15x** Eligibility Boost
    *   Waiting 6 months: **1.05x** Eligibility Boost (Stability)

---

## 5. CIBIL Bureau Logic (Mock)

**File:** `lib/tools/cibil-fetcher.ts`
Simulates bureau data extraction.

*   **Score Banding:**
    *   $750+$: Excellent
    *   $700 - 749$: Good
    *   $650 - 699$: Fair
    *   Below $650$: Poor
*   **NH Error:** Returns `-1` if `hasCreditHistory` is false.

---

## 6. AI Agentic Reasoning

While the mathematical tools provide the "raw data", the AI Agents apply symbolic logic to interpret results.

### 6.1 Recovery Agent Impact Weights
**File:** `lib/agents/prompts.ts`
When generating a credit rehabilitation plan, the agent estimates "Credit Impact":

*   **Pay Off Debt:** +15–30 points impact.
*   **Fix Errors:** +10–20 points impact.
*   **Add Joint Applicant:** +20–40 points impact.

### 6.2 Financial Council Rules
**File:** `lib/agents/adk-council.ts` & `app/api/council-meeting/route.ts`

**The Deliberation Flow:**
1.  **Optimist:** Filters for factor scores where `status === "pass"`.
2.  **Pessimist:** Filters for factor scores where `status === "fail"` or `"warning"`.
3.  **Judge:** Reconciles the debate using a deterministic threshold:
    *   **Approved:** If `Approval Odds > 60%`.
    *   **Rejected:** If `Approval Odds < 40%`.
    *   **Review Required:** Between 40% and 60%.

### 6.3 Orchestration Logic
**File:** `lib/agents/core/orchestrator.ts`
Determines which agent handles the request:
*   **"application rejected"** $\rightarrow$ RECOVERY Agent
*   **"need a loan"** $\rightarrow$ LOAN_OFFICER Agent
*   **"greeting/name"** $\rightarrow$ ONBOARDING Agent
