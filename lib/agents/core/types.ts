export interface Agent {
    name: string
    role: string
    process(input: any): Promise<any>
}

export interface AgentResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    metadata?: {
        model: string
        tokensUsed?: number
        latency?: number
    }
}

export interface Tool {
    name: string
    description: string
    execute: (args: any) => Promise<any>
}
