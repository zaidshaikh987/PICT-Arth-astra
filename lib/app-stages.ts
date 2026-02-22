/**
 * Shared Application Stage Progress Logic
 *
 * This is the single source of truth for whether each stage is complete.
 * Both loan-comparison (gate) and application-timeline (display) use this.
 */

export type StageStatus = "completed" | "in-progress" | "locked"

export interface AppStage {
    key: string
    label: string
    description: string
    cta?: { label: string; href: string }
}

export const APP_STAGES: AppStage[] = [
    {
        key: "profile",
        label: "Profile Setup",
        description: "Basic profile and loan requirements submitted",
    },
    {
        key: "documentation",
        label: "Documentation",
        description: "Required documents uploaded and verified",
        cta: { label: "Upload Documents", href: "/dashboard/documents" },
    },
    {
        key: "credit_check",
        label: "Credit Check",
        description: "Soft credit check performed using your CIBIL score",
        cta: { label: "Check Credit Score", href: "/dashboard/eligibility" },
    },
    {
        key: "lender_matching",
        label: "Lender Matching",
        description: "AI matched you with the best loan offers",
        cta: { label: "View Loan Offers", href: "/dashboard/loans" },
    },
    {
        key: "application",
        label: "Application Submission",
        description: "Application submitted to selected lender",
    },
    {
        key: "approval",
        label: "Approval & Disbursal",
        description: "Final approval and loan amount transfer",
    },
]

/**
 * Calculate each stage's completion status from user + localStorage data.
 * Returns a map of stageKey → boolean (completed)
 */
export function computeStageCompletion(user: any): Record<string, boolean> {
    // ──── Read uploaded docs from user context (MongoDB) ────
    // document-checklist saves via updateUser({ uploadedFiles }), not localStorage
    let uploadedDocIds: string[] = []
    try {
        // Primary source: user.uploadedFiles from MongoDB
        if (user?.uploadedFiles && Array.isArray(user.uploadedFiles)) {
            uploadedDocIds = [...new Set(user.uploadedFiles.map((f: any) => f.docId as string))]
        }
    } catch { }

    const requiredDocs = ["pan", "aadhaar", "utility", "salary-slip", "bank-statement", "form16"]
    const docsComplete = requiredDocs.every((d) => uploadedDocIds.includes(d))


    // ──── Profile: user must exist and have filled onboarding ────
    const profileComplete = !!(user && (user.phone || user.name) && user.loanPurpose)

    // ──── Docs: all required docs uploaded ────
    const documentationComplete = docsComplete

    // ──── Credit check: user has credit score filled (or opted out) ────
    const creditComplete = documentationComplete && (user?.creditScore != null || user?.hasCreditHistory === false)

    // ──── Lender matching: user has visited loans page (stored as flag) ────
    let lenderMatchComplete = false
    try {
        lenderMatchComplete = creditComplete &&
            (typeof window !== "undefined" ? localStorage.getItem("lenderMatchViewed") === "1" : false)
    } catch { }

    // ──── Application submission ────
    const applicationComplete = !!(user?.timelineSimulation?.appSubmitStatus === "completed")

    // ──── Approval ────
    const approvalComplete = !!(user?.timelineSimulation?.approvalStatus === "approved")

    return {
        profile: profileComplete,
        documentation: documentationComplete,
        credit_check: creditComplete,
        lender_matching: lenderMatchComplete,
        application: applicationComplete,
        approval: approvalComplete,
    }
}

/**
 * Returns true ONLY if all pre-apply stages are done.
 */
export function canApplyNow(user: any): boolean {
    const c = computeStageCompletion(user)
    return c.profile && c.documentation && c.credit_check && c.lender_matching
}
