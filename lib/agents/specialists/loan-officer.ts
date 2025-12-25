import { BaseAgent } from "../core/base-agent"
import { AgentResponse } from "../core/types"
import { LOAN_OFFICER_PROMPTS } from "../prompts"
import { generateLoanOffers } from "@/lib/tools/calculator"
import { calculateDetailedEligibility } from "@/lib/tools/eligibility-calculator"

export class LoanOfficerAgent extends BaseAgent {
    constructor() {
        super("LoanOfficer", "Specialist in loan eligibility and bank recommendations")
    }

    async process(input: any): Promise<AgentResponse> {
        // Default processing if generic call is made
        return { success: false, error: "Use specific methods: recommendLoans or analyzeEligibility" }
    }

    async recommendLoans(userData: any): Promise<AgentResponse> {
        try {
            // 1. TOOL EXECUTION: Get real calculations
            const realOffers = generateLoanOffers(userData)

            // 2. AGENT ANALYSIS: Feed real data to LLM
            const prompt = LOAN_OFFICER_PROMPTS.RECOMMENDATION
                .replace("{{monthlyIncome}}", userData.monthlyIncome)
                .replace("{{existingEMI}}", userData.existingEMI)
                .replace("{{creditScore}}", userData.creditScore || "Not available")
                .replace("{{employmentType}}", userData.employmentType)
                .replace("{{loanAmount}}", userData.loanAmount)
                .replace("{{tenure}}", userData.tenure)
                .replace("{{availableOffers}}", JSON.stringify(realOffers.slice(0, 3))) // Feed top 3 offers

            const responseText = await this.generate(prompt)
            const analysis = this.parseJson(responseText)

            // 3. MERGE: Return real data + AI insights
            return {
                success: true,
                data: {
                    offers: realOffers,
                    analysis: analysis
                }
            }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    async analyzeEligibility(userData: any): Promise<AgentResponse> {
        try {
            // 1. TOOL EXECUTION: Get real eligibility calculations
            const analysis = calculateDetailedEligibility(userData)

            // 2. AGENT ANALYSIS: Feed real results to LLM
            const prompt = LOAN_OFFICER_PROMPTS.ELIGIBILITY
                .replace("{{monthlyIncome}}", userData.monthlyIncome)
                .replace("{{existingEMI}}", userData.existingEMI)
                .replace("{{creditScore}}", userData.creditScore || "Not provided")
                .replace("{{employmentType}}", userData.employmentType)
                .replace("{{yearsWithEmployer}}", userData.yearsWithEmployer)
                .replace("{{dti}}", analysis.financials.dti.toFixed(2))
                .replace("{{toolResult}}", JSON.stringify(analysis))

            const responseText = await this.generate(prompt)
            const data = this.parseJson(responseText)

            // 3. MERGE
            return {
                success: true,
                data: {
                    report: analysis, // The structured data for the UI
                    insights: data // The textual insights from the AI
                }
            }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }
}
