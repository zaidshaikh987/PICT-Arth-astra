import { calculateDetailedEligibility } from "./eligibility-calculator";

/**
 * Agent Tool: Calculate Debt-to-Income Ratio (Banking Standard FOIR)
 * Used by: Investigator Agent
 * DTI = Fixed Obligations (EMIs/Loans) / Gross Income × 100
 * Note: Living expenses are NOT included in DTI per banking standards
 */
export function calculateDTI(monthlyIncome: number, existingEMI: number, _monthlyExpenses?: number): number {
    // Banking-standard DTI uses ONLY debt obligations (EMIs), not living expenses
    const dti = monthlyIncome > 0 ? (existingEMI / monthlyIncome) * 100 : 0;
    return Math.round(dti * 10) / 10;
}

/**
 * Agent Tool: Analyze Employment Risk Score
 * Used by: Investigator Agent
 * Returns: Risk score (0-100, higher = more risky)
 */
export function analyzeEmploymentRisk(employmentType: string, tenure: string): {
    riskScore: number;
    riskLevel: "Low" | "Medium" | "High" | "Critical";
    reason: string;
} {
    let riskScore = 0;
    let reason = "";

    // Base risk by employment type
    if (employmentType === "student") {
        riskScore += 70;
        reason = "Student employment is typically temporary and unverified.";
    } else if (employmentType === "freelancer") {
        riskScore += 50;
        reason = "Freelance income lacks stability and documentation.";
    } else if (employmentType === "self_employed") {
        riskScore += 30;
        reason = "Self-employed income requires ITR verification.";
    } else {
        riskScore += 10;
        reason = "Salaried employment is stable and verifiable.";
    }

    // Tenure risk
    if (tenure === "<6_months") {
        riskScore += 30;
        reason += " Less than 6 months tenure shows no track record.";
    } else if (tenure === "6m-1yr") {
        riskScore += 15;
    } else if (tenure === "1-2yr") {
        riskScore += 5;
    }

    riskScore = Math.min(100, riskScore);

    const riskLevel =
        riskScore >= 75 ? "Critical" : riskScore >= 50 ? "High" : riskScore >= 25 ? "Medium" : "Low";

    return { riskScore, riskLevel, reason };
}

/**
 * Agent Tool: Detect Financial Anomalies
 * Used by: Investigator Agent
 * Flags inconsistencies in user data
 */
export function detectFinancialAnomalies(userData: any): {
    hasAnomaly: boolean;
    anomalies: string[];
} {
    const anomalies: string[] = [];
    const monthlyIncome = Number(userData.monthlyIncome) || 0;
    const savings = userData.savings || "0-50k";
    const monthlyExpenses = Number(userData.monthlyExpenses) || 0;
    const existingEMI = Number(userData.existingEMI) || 0;

    // Anomaly 1: High income but low savings
    if (monthlyIncome > 100000 && savings.includes("0-50k")) {
        anomalies.push(
            `High income (₹${monthlyIncome.toLocaleString()}) with minimal savings (${savings}) suggests income is recent or not fully disposable.`
        );
    }

    // Anomaly 2: Expenses + EMI > Income
    if (monthlyExpenses + existingEMI > monthlyIncome * 0.8) {
        anomalies.push(
            `Declared expenses (₹${(monthlyExpenses + existingEMI).toLocaleString()}) consume ${Math.round(((monthlyExpenses + existingEMI) / monthlyIncome) * 100)}% of income, leaving minimal buffer.`
        );
    }

    // Anomaly 3: Student with very high income
    if (userData.employmentType === "student" && monthlyIncome > 50000) {
        anomalies.push(
            `Student status with ₹${monthlyIncome.toLocaleString()}/month income is uncommon and may indicate stipend or freelance work.`
        );
    }

    return {
        hasAnomaly: anomalies.length > 0,
        anomalies,
    };
}

/**
 * Agent Tool: Simulate Credit Score Impact
 * Used by: Negotiator Agent
 * Shows how different actions affect credit score
 */
export function simulateCreditScoreImpact(currentScore: number, actions: string[]): {
    projectedScore: number;
    changes: { action: string; impact: number }[];
} {
    let projectedScore = currentScore;
    const changes: { action: string; impact: number }[] = [];

    const actionImpacts: Record<string, number> = {
        "pay_off_debt": +25,
        "reduce_utilization": +20,
        "dispute_error": +15,
        "add_credit_line": -5,
        "freeze_repayment": -10,
    };

    actions.forEach((action) => {
        const impact = actionImpacts[action] || 0;
        projectedScore += impact;
        changes.push({ action, impact });
    });

    projectedScore = Math.min(900, Math.max(300, projectedScore));

    return { projectedScore, changes };
}

/**
 * Agent Tool: Generate Amortization Schedule (First 3 months)
 * Used by: Architect Agent
 */
export function generateAmortizationSchedule(
    principal: number,
    annualRate: number,
    tenureYears: number
): {
    month: number;
    emi: number;
    principalPaid: number;
    interestPaid: number;
    balance: number;
}[] {
    const monthlyRate = annualRate / 12 / 100;
    const months = tenureYears * 12;
    const factor = Math.pow(1 + monthlyRate, months);
    const emi = Math.round((principal * monthlyRate * factor) / (factor - 1));

    let balance = principal;
    const schedule = [];

    for (let month = 1; month <= Math.min(3, months); month++) {
        const interestPaid = Math.round(balance * monthlyRate);
        const principalPaid = emi - interestPaid;
        balance -= principalPaid;

        schedule.push({
            month,
            emi,
            principalPaid,
            interestPaid,
            balance: Math.max(0, balance),
        });
    }

    return schedule;
}

/**
 * Agent Tool: Calculate Savings Timeline
 * Used by: Architect Agent
 * Shows how long it takes to reach a savings goal
 */
export function calculateSavingsTimeline(
    currentSavings: number,
    targetSavings: number,
    monthlySavingsRate: number
): {
    months: number;
    milestones: { month: number; amount: number }[];
} {
    const deficit = targetSavings - currentSavings;
    const months = Math.ceil(deficit / monthlySavingsRate);

    const milestones = [];
    for (let i = 1; i <= Math.min(months, 6); i++) {
        milestones.push({
            month: i,
            amount: Math.min(targetSavings, currentSavings + i * monthlySavingsRate),
        });
    }

    return { months, milestones };
}
