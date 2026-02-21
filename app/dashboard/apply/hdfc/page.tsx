"use client"

import { useUser } from "@/lib/user-context"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, CheckCircle2, Download, Send, ShieldCheck, Clock } from "lucide-react"
import Link from "next/link"

/* ─────────────────────────────── helpers ─────────────────── */
function fmt(n?: number | null, prefix = "₹") {
    if (n == null) return "—"
    return `${prefix}${n.toLocaleString("en-IN")}`
}
function cap(s?: string) {
    if (!s) return "—"
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}
function tenureLabel(t?: string) {
    const map: Record<string, string> = {
        none: "Not Applicable",
        "<6_months": "< 6 Months",
        "6m-1yr": "6 Months – 1 Year",
        "1-2yr": "1 – 2 Years",
        "2-5yr": "2 – 5 Years",
        "5+yr": "5+ Years",
    }
    return t ? (map[t] ?? t) : "—"
}
function savingsLabel(s?: string) {
    const map: Record<string, string> = {
        "0-50k": "₹0 – ₹50,000",
        "50k-1L": "₹50,000 – ₹1 Lakh",
        "1L-5L": "₹1 Lakh – ₹5 Lakh",
        "5L+": "₹5 Lakh+",
    }
    return s ? (map[s] ?? s) : "—"
}

/* ─────────────────────────────── sub-components ───────────── */
function SectionHeader({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-[#004C8F] text-white font-bold text-sm px-4 py-2 uppercase tracking-wide">
            {children}
        </div>
    )
}

function Row({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) {
    return (
        <tr className="border-b border-[#D0E4F5] even:bg-[#F4F9FF]">
            <td className="text-[11px] text-gray-600 font-medium py-2 px-4 w-1/3">{label}</td>
            <td className={`py-2 px-4 text-[13px] font-semibold ${highlight ? "text-[#004C8F]" : "text-gray-900"}`}>
                {value || "—"}
            </td>
        </tr>
    )
}

function FormField({ label, value, wide }: { label: string; value?: string; wide?: boolean }) {
    return (
        <div className={`flex flex-col gap-1 ${wide ? "col-span-2" : ""}`}>
            <label className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">{label}</label>
            <div className="border border-[#B8D4EE] bg-[#F4F9FF] rounded px-3 py-2 text-[13px] font-semibold text-gray-900 min-h-[36px]">
                {value || (
                    <span className="text-gray-400 font-normal italic text-xs">Not provided</span>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────── main page ────────────────── */
export default function HDFCApplyPage() {
    const { user, loading, updateUser } = useUser()
    const router = useRouter()
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#004C8F] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600 text-sm">Loading your application…</p>
                </div>
            </div>
        )
    }

    const u = user || {}

    // Computed loan details
    const loanAmount = u.loanAmount || 500000
    const tenure = u.tenure || 3
    const rate = 10.5
    const monthlyRate = rate / 12 / 100
    const months = tenure * 12
    const emi =
        months > 0
            ? Math.round(
                (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
                (Math.pow(1 + monthlyRate, months) - 1)
            )
            : 0
    const processingFee = Math.round(loanAmount * 0.015)

    const refId = `HDFC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`

    async function notify(stage: string) {
        try {
            await fetch("/api/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stage,
                    userData: {
                        name: u.name || "Customer",
                        phone: u.phone,
                        creditScore: u.creditScore,
                        amount: loanAmount?.toLocaleString("en-IN"),
                    },
                }),
            })
        } catch { /* non-blocking */ }
    }

    async function handleSubmit() {
        setSubmitting(true)

        // Step 1: Mark as submitted + send WhatsApp
        await updateUser({
            selectedLoan: {
                bankName: "HDFC Bank",
                productName: "Personal Loan – Premium",
                rate,
                emi,
                tenure,
                principal: loanAmount,
                processingFee,
                referenceId: refId,
            },
            timelineSimulation: {
                ...(u.timelineSimulation || {}),
                appSubmitStatus: "completed",
                appSubmittedAt: Date.now(),
                approvalStatus: "pending",
            },
        })
        await notify("application_submitted")

        // Step 2: Simulate HDFC processing (4s), then auto-approve
        await new Promise((res) => setTimeout(res, 4000))

        await updateUser({
            timelineSimulation: {
                ...(u.timelineSimulation || {}),
                appSubmitStatus: "completed",
                appSubmittedAt: Date.now(),
                approvalStatus: "approved",
                approvedAt: Date.now(),
            },
        })
        await notify("loan_approved")

        setSubmitting(false)
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EBF4FF] to-white px-4">
                <div className="text-center max-w-lg">
                    {/* Big success tick */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </div>
                        <span className="absolute -top-1 -right-1 text-2xl animate-bounce">🎊</span>
                    </div>

                    <h2 className="text-3xl font-black text-gray-900 mb-2">Congratulations!</h2>
                    <p className="text-gray-600 mb-1 text-lg font-semibold">Your Loan is <span className="text-green-600">APPROVED</span></p>
                    <p className="text-sm text-gray-500 mb-6">
                        Reference ID: <strong className="text-[#004C8F] font-mono">{refId}</strong>
                    </p>

                    {/* Stage ticks */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 text-left shadow-sm">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wide">Application Stages</p>
                        {[
                            { label: "Profile Setup", done: true },
                            { label: "Documentation", done: true },
                            { label: "Credit Check", done: true },
                            { label: "Lender Matching", done: true },
                            { label: "Application Submitted to HDFC Bank", done: true },
                            { label: "Approval & Disbursal", done: true },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm font-semibold text-gray-800">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* WhatsApp badge */}
                    <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl px-4 py-3 flex items-center gap-3 mb-6 text-left">
                        <div className="w-9 h-9 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">W</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-green-800">WhatsApp Notifications Sent</p>
                            <p className="text-xs text-green-700">
                                Approval confirmation sent to <strong>{u.phone || "your number"}</strong>
                            </p>
                        </div>
                    </div>

                    {/* Disbursal info */}
                    <div className="bg-[#EBF4FF] rounded-xl px-5 py-4 mb-8">
                        <p className="text-sm font-bold text-[#004C8F] mb-1">Loan Amount: {fmt(loanAmount)}</p>
                        <p className="text-xs text-gray-600">Disbursal to your bank account in 1–2 business days.</p>
                        <p className="text-xs text-gray-600">EMI of <strong>{fmt(emi)}/month</strong> begins from next billing cycle.</p>
                    </div>

                    <Link href="/dashboard/timeline">
                        <button className="w-full bg-[#004C8F] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#00396E] transition-colors">
                            View Application Timeline →
                        </button>
                    </Link>
                </div>
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-[#F0F6FF]">
            {/* ── HDFC Header ── */}
            <div className="bg-gradient-to-r from-[#004C8F] to-[#0060B3] text-white shadow-xl">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/loans" className="text-white/80 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            {/* HDFC Logo-style badge */}
                            <div className="bg-white rounded px-3 py-1 flex items-center gap-2">
                                <span className="text-[#004C8F] font-black text-lg tracking-tighter">H</span>
                                <div className="h-5 w-px bg-gray-300" />
                                <span className="text-[#E31837] font-black text-xs tracking-widest">HDFC</span>
                                <span className="text-[#004C8F] font-bold text-xs">BANK</span>
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg leading-none">Personal Loan — Premium</p>
                                <p className="text-blue-200 text-xs mt-0.5">Pre-filled Application · 10.5% p.a.</p>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-green-300">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="font-medium">Secure &amp; Encrypted</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-200">
                            <Clock className="w-4 h-4" />
                            <span>2-day approval</span>
                        </div>
                    </div>
                </div>

                {/* Info bar */}
                <div className="bg-[#E31837] px-4 py-2">
                    <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-white font-medium">
                        <span>INDIVIDUAL HOUSING AND LOAN APPLICATION FORM — PRE-FILLED FROM YOUR ArthAstra PROFILE</span>
                        <span>PART-A</span>
                    </div>
                </div>
            </div>

            {/* ── Offer Summary Strip ── */}
            <div className="max-w-5xl mx-auto px-4 mt-6">
                <div className="bg-white rounded-2xl shadow-lg border border-[#B8D4EE] overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-[#004C8F] to-[#0073CF] p-5 text-white">
                        <p className="text-sm text-blue-200 mb-1">Your Personalised Offer</p>
                        <div className="flex flex-wrap gap-8 items-end">
                            <div>
                                <p className="text-xs text-blue-200">Loan Amount</p>
                                <p className="text-3xl font-black">{fmt(loanAmount)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-200">Interest Rate</p>
                                <p className="text-3xl font-black">{rate}% <span className="text-base font-semibold opacity-80">p.a.</span></p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-200">Monthly EMI</p>
                                <p className="text-3xl font-black">{fmt(emi)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-200">Tenure</p>
                                <p className="text-3xl font-black">{tenure} <span className="text-base font-semibold opacity-80">yrs</span></p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-200">Processing Fee</p>
                                <p className="text-2xl font-black">{fmt(processingFee)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-5 py-3 bg-green-50 border-t border-green-100 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <p className="text-sm text-green-800 font-medium">
                            AI Recommended · Highest approval odds based on your financial profile
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Application Form ── */}
            <div className="max-w-5xl mx-auto px-4 pb-16 space-y-6">

                {/* ── PART A: Personal Details ── */}
                <div className="bg-white rounded-2xl shadow border border-[#B8D4EE] overflow-hidden">
                    <SectionHeader>Part A — Personal Details</SectionHeader>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Full Name" value={u.name} wide />
                        <FormField label="Age" value={u.age ? `${u.age} years` : undefined} />
                        <FormField label="Mobile Number" value={u.phone} />
                        <FormField label="Email ID" value={u.email} />
                        <FormField label="City" value={cap(u.city)} />
                        <FormField label="State / Union Territory" value={cap(u.state)} />
                        <FormField label="Aadhaar / UID No." value="XXXX XXXX XXXX (masked)" />
                        <FormField label="PAN No." value="Awaiting upload" />
                    </div>

                    {/* Address table */}
                    <div className="border-t border-[#D0E4F5]">
                        <SectionHeader>Permanent Address</SectionHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#D0E4F5]">
                                        <th className="text-left py-2 px-4 text-[11px] font-bold text-[#004C8F] uppercase">Field</th>
                                        <th className="text-left py-2 px-4 text-[11px] font-bold text-[#004C8F] uppercase">Applicant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <Row label="Full Name" value={u.name} />
                                    <Row label="Town / City / Village" value={cap(u.city)} />
                                    <Row label="State / Union Territory" value={cap(u.state)} />
                                    <Row label="Contact No." value={u.phone} />
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── PART B: Employment & Income Details ── */}
                <div className="bg-white rounded-2xl shadow border border-[#B8D4EE] overflow-hidden">
                    <SectionHeader>Part B — Employment &amp; Income Details</SectionHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <tbody>
                                <Row label="Employment Type" value={cap(u.employmentType)} highlight />
                                <Row label="Company / Business Name" value={u.companyName || "—"} />
                                <Row label="Monthly Income" value={fmt(u.monthlyIncome)} highlight />
                                <Row label="Employment Tenure" value={tenureLabel(u.employmentTenure)} />
                                <Row label="Occupation" value={cap(u.employmentType)} />
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-[#D0E4F5]">
                        <SectionHeader>Past Employment / Business Details</SectionHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#D0E4F5]">
                                        <th className="py-2 px-4 text-left text-[11px] font-bold text-[#004C8F] uppercase">Employer / Business</th>
                                        <th className="py-2 px-4 text-left text-[11px] font-bold text-[#004C8F] uppercase">Designation</th>
                                        <th className="py-2 px-4 text-left text-[11px] font-bold text-[#004C8F] uppercase">Tenure</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-[#D0E4F5]">
                                        <td className="py-3 px-4 text-gray-900 font-medium">{u.companyName || "—"}</td>
                                        <td className="py-3 px-4 text-gray-700">{cap(u.employmentType)}</td>
                                        <td className="py-3 px-4 text-gray-700">{tenureLabel(u.employmentTenure)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── PART C: Financial Information ── */}
                <div className="bg-white rounded-2xl shadow border border-[#B8D4EE] overflow-hidden">
                    <SectionHeader>Part C — Financial Information (Savings &amp; Investments)</SectionHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#D0E4F5]">
                                    <th className="py-2 px-4 text-left text-[11px] font-bold text-[#004C8F] uppercase">Particulars</th>
                                    <th className="py-2 px-4 text-left text-[11px] font-bold text-[#004C8F] uppercase">Applicant (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <Row label="Savings Range" value={savingsLabel(u.savingsRange)} />
                                <Row label="Monthly Income" value={fmt(u.monthlyIncome)} highlight />
                                <Row label="Existing Monthly EMI Obligations" value={fmt(u.existingEMI)} />
                                <Row label="Monthly Living Expenses" value={fmt(u.monthlyExpenses)} />
                                <Row label="Has Credit History" value={u.hasCreditHistory === true ? "Yes" : u.hasCreditHistory === false ? "No" : "—"} />
                                <Row label="Approximate Credit Score" value={u.creditScore ? `${u.creditScore}` : "—"} highlight />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── PART D: Loan Requested ── */}
                <div className="bg-white rounded-2xl shadow border border-[#B8D4EE] overflow-hidden">
                    <SectionHeader>Part D — Loan Requested</SectionHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <tbody>
                                <Row label="Purpose of Loan" value={cap(u.loanPurpose)} highlight />
                                <Row label="Amount Requested (₹)" value={fmt(loanAmount)} highlight />
                                <Row label="Preferred Tenure" value={tenure ? `${tenure} Years` : "—"} highlight />
                                <Row label="Your Preferred Max EMI (₹)" value={fmt(u.preferredEMI)} />
                                <Row label="HDFC Offered Rate of Interest" value={`${rate}% per annum`} highlight />
                                <Row label="Calculated Monthly EMI (₹)" value={fmt(emi)} highlight />
                                <Row label="Processing Fee (1.5%)" value={fmt(processingFee)} />
                                <Row label="Total Repayment Amount (₹)" value={fmt(emi * months)} />
                                <Row label="Total Interest Payable (₹)" value={fmt(emi * months - loanAmount)} />
                            </tbody>
                        </table>
                    </div>

                    {/* Type of Loan */}
                    <div className="border-t border-[#D0E4F5]">
                        <SectionHeader>Type of Loan</SectionHeader>
                        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {["Personal", "Home", "Education", "Car", "Business", "Medical", "Wedding", "Travel"].map((t) => (
                                <div
                                    key={t}
                                    className={`border-2 rounded-lg px-3 py-2 text-center text-xs font-semibold transition-all ${cap(u.loanPurpose) === t
                                        ? "border-[#004C8F] bg-[#EBF4FF] text-[#004C8F]"
                                        : "border-gray-200 text-gray-500"
                                        }`}
                                >
                                    {t === cap(u.loanPurpose) && <span className="mr-1">✓</span>}
                                    {t}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── PART E: Document Checklist ── */}
                <div className="bg-white rounded-2xl shadow border border-[#B8D4EE] overflow-hidden">
                    <SectionHeader>Part E — Documents Submitted</SectionHeader>
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-bold text-[#004C8F] mb-3 uppercase tracking-wide">Applicant — Identity &amp; Address</p>
                                <div className="space-y-2">
                                    {[
                                        { doc: "Proof of Identity (Aadhaar)", status: "Pending Upload" },
                                        { doc: "PAN Card", status: "Pending Upload" },
                                        { doc: "Proof of Address", status: "Pending Upload" },
                                        { doc: "Latest Passport Size Photo", status: "Pending Upload" },
                                    ].map((d) => (
                                        <div key={d.doc} className="flex items-center justify-between border border-dashed border-[#B8D4EE] rounded-lg px-3 py-2">
                                            <span className="text-xs text-gray-700">{d.doc}</span>
                                            <span className="text-xs text-amber-600 font-semibold">{d.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#004C8F] mb-3 uppercase tracking-wide">Income &amp; Employment Proof</p>
                                <div className="space-y-2">
                                    {[
                                        { doc: "Last 3 Months Salary Slips", status: u.employmentType === "salaried" ? "Required" : "N/A" },
                                        { doc: "Bank Statement (6 months)", status: "Required" },
                                        { doc: "IT Returns / Form 16", status: u.employmentType !== "student" && u.employmentType !== "unemployed" ? "Required" : "N/A" },
                                        { doc: "Business Registration (if self-employed)", status: u.employmentType === "self_employed" ? "Required" : "N/A" },
                                    ].map((d) => (
                                        <div key={d.doc} className={`flex items-center justify-between border rounded-lg px-3 py-2 ${d.status === "N/A" ? "border-gray-100 opacity-50" : "border-dashed border-[#B8D4EE]"}`}>
                                            <span className="text-xs text-gray-700">{d.doc}</span>
                                            <span className={`text-xs font-semibold ${d.status === "N/A" ? "text-gray-400" : "text-amber-600"}`}>{d.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Declaration ── */}
                <div className="bg-white rounded-2xl shadow border border-[#B8D4EE] overflow-hidden">
                    <SectionHeader>Declaration by Applicant</SectionHeader>
                    <div className="p-5 space-y-3">
                        <div className="bg-[#FFF8EC] border border-amber-200 rounded-lg p-4">
                            <p className="text-xs text-gray-700 leading-relaxed">
                                I/We declare that we are citizens of India and all the particulars and information given in the application form
                                are true, correct, and complete. I/We confirm that the funds shall be used for the stated purpose and will not be
                                used for speculative or anti-social purposes. I/We authorise HDFC Bank to make any enquiries regarding my/our
                                application, including with other finance companies/registered credit bureaus.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="declare" className="w-4 h-4 accent-[#004C8F]" defaultChecked />
                            <label htmlFor="declare" className="text-xs text-gray-700 font-medium">
                                I agree to the above declaration and authorise HDFC Bank to process my application.
                            </label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="kyc" className="w-4 h-4 accent-[#004C8F]" defaultChecked />
                            <label htmlFor="kyc" className="text-xs text-gray-700 font-medium">
                                I consent to receiving information from HDFC Bank through Central KYC Registry via SMS/email.
                            </label>
                        </div>
                    </div>
                </div>

                {/* ── Action Buttons ── */}
                <div className="bg-white rounded-2xl shadow border border-[#B8D4EE] p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span>256-bit SSL encrypted · Your data is safe with HDFC Bank</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => { }}
                                className="flex items-center justify-center gap-2 border-2 border-[#004C8F] text-[#004C8F] font-semibold px-6 py-3 rounded-xl hover:bg-[#EBF4FF] transition-colors text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center justify-center gap-2 bg-[#E31837] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#B8102C] transition-colors text-sm shadow-lg shadow-red-200 disabled:opacity-70"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Submitting…
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Submit Application to HDFC Bank
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-4">
                        Do not sign this form if blank. Ensure all relevant sections and documents are completely filled before submitting.<br />
                        HDFC Bank will contact you at <strong>{u.phone || "your registered number"}</strong> within 2 business days.
                    </p>
                </div>

            </div>
        </div>
    )
}
