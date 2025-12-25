import { BaseAgent } from "../core/base-agent"
import { AgentResponse } from "../core/types"
import { LOAN_OFFICER_PROMPTS } from "../prompts"
import { simulateOptimization } from "@/lib/tools/credit-simulator"
import { fetchUserCIBIL } from "@/lib/tools/cibil-fetcher"

export class RecoveryAgent extends BaseAgent {
    constructor() {
        super("RecoveryAgent", "Specialist in credit rehabilitation and rejection recovery")
    }

    async process(input: any): Promise<AgentResponse> {
        return this.generateRecoveryPlan(input)
    }

    async generateRecoveryPlan(userData: any): Promise<AgentResponse> {
        try {
            const dti = userData.monthlyIncome > 0
                ? Math.round((userData.existingEMI / userData.monthlyIncome) * 100)
                : 0

            // 1. TOOL EXECUTION: "Fetch" CIBIL Report & Run Simulation
            const cibilReport = fetchUserCIBIL(userData)

            const simulationScenario = {
                payOffDebt: userData.existingEMI ? Math.round(userData.existingEMI * 3) : 0,
                increaseIncome: 0,
                improveScore: 30,
                waitMonths: 3,
                jointApplication: false
            }
            const simulationResult = simulateOptimization(userData, simulationScenario)

            // 2. AGENT ANALYSIS: Feed Report + ROI to LLM
            const prompt = LOAN_OFFICER_PROMPTS.RECOVERY
                .replace("{{monthlyIncome}}", userData.monthlyIncome)
                .replace("{{existingEMI}}", userData.existingEMI)
                .replace("{{creditScore}}", userData.creditScore || "No History")
                .replace("{{employmentType}}", userData.employmentType)
                .replace("{{dti}}", dti.toString())
                .replace("{{simulation}}", JSON.stringify({
                    cibilReport: cibilReport.data,
                    simulationResult: {
                        potentialMaxLoan: simulationResult.projected.maxAmount,
                        potentialApprovalOdds: simulationResult.projected.approvalOdds
                    }
                }))

            const responseText = await this.generate(prompt)
            const data = this.parseJson(responseText)

            return { success: true, data }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }
}
