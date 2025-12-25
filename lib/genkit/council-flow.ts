import { genkit, z } from "genkit";
import { googleAI, gemini15Flash } from "@genkit-ai/googleai";

// Initialize Genkit with Google AI
const ai = genkit({
    plugins: [googleAI()],
    model: gemini15Flash,
});

// Define the input schema for the council
const CouncilInputSchema = z.object({
    monthlyIncome: z.number(),
    existingEMI: z.number(),
    creditScore: z.number().optional(),
    loanAmount: z.number(),
    tenure: z.number(),
    employmentType: z.string(),
});

// Define the output schema for the council
const CouncilOutputSchema = z.object({
    optimistArgument: z.string(),
    pessimistArgument: z.string(),
    judgeVerdict: z.string(),
    approved: z.boolean(),
});

// 1. The Optimist Agent (Sales)
const optimistAgent = ai.defineTool(
    {
        name: "optimistAgent",
        description: "Argues FOR the loan approval, focusing on strengths.",
        inputSchema: CouncilInputSchema,
        outputSchema: z.string(),
    },
    async (input) => {
        const { text } = await ai.generate({
            prompt: `
        You are 'The Optimist', a sales-driven loan officer.
        Your goal is to APPROVE this loan. Find every possible reason to say YES.
        Focus on: Potential income growth, stability, asset creation.
        Ignore the risks or downplay them.
        
        User Data: ${JSON.stringify(input)}
        
        Write a short, punchy argument (2-3 sentences) supporting this user.
      `,
        });
        return text;
    }
);

// 2. The Pessimist Agent (Risk)
const pessimistAgent = ai.defineTool(
    {
        name: "pessimistAgent",
        description: "Argues AGAINST the loan approval, focusing on risks.",
        inputSchema: CouncilInputSchema,
        outputSchema: z.string(),
    },
    async (input) => {
        const { text } = await ai.generate({
            prompt: `
        You are 'The Pessimist', a strict risk underwriter.
        Your goal is to REJECT this loan to protect the bank.
        Focus on: High DTI, credit score gaps, economic downturns.
        Be skeptical and harsh.
        
        User Data: ${JSON.stringify(input)}
        
        Write a short, punchy argument (2-3 sentences) rejecting this user.
      `,
        });
        return text;
    }
);

// 3. The Judge Agent (Compliance)
const judgeAgent = ai.defineTool(
    {
        name: "judgeAgent",
        description: "Weighs arguments and makes the final decision.",
        inputSchema: z.object({
            ...CouncilInputSchema.shape,
            optimistArg: z.string(),
            pessimistArg: z.string()
        }),
        outputSchema: z.object({
            verdict: z.string(),
            approved: z.boolean()
        }),
    },
    async (input) => {
        const { output } = await ai.generate({
            prompt: `
        You are 'The Judge', an impartial finalized compliance officer.
        
        The Optimist said: "${input.optimistArg}"
        The Pessimist said: "${input.pessimistArg}"
        
        User Financials:
        - Income: ${input.monthlyIncome}
        - Loan: ${input.loanAmount}
        - Score: ${input.creditScore || 'N/A'}
        
        Make a final binding decision.
        1. Give a 'Verdict' explaining who you agree with and why.
        2. Set 'Approved' to true or false.
      `,
            output: {
                schema: z.object({
                    verdict: z.string(),
                    approved: z.boolean()
                })
            }
        });
        return output!;
    }
);

// Main Orchestrator Flow
export const councilFlow = ai.defineFlow(
    {
        name: "councilFlow",
        inputSchema: CouncilInputSchema,
        outputSchema: CouncilOutputSchema,
    },
    async (input) => {
        // Parallel Execution: Let them argue at the same time
        const [optimistArg, pessimistArg] = await Promise.all([
            optimistAgent(input),
            pessimistAgent(input),
        ]);

        // Sequential Execution: Judge decides after hearing them
        const judgment = await judgeAgent({
            ...input,
            optimistArg,
            pessimistArg
        });

        return {
            optimistArgument: optimistArg,
            pessimistArgument: pessimistArg,
            judgeVerdict: judgment.verdict,
            approved: judgment.approved,
        };
    }
);
