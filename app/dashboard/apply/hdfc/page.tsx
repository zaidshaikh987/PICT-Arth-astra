"use client"

import { useEffect, useState, useRef } from "react"
import { useUser } from "@/lib/user-context"
import Link from "next/link"
import {
    ArrowLeft, Download, CheckCircle2, AlertCircle, User,
    Briefcase, MapPin, Lock, FileCheck, Phone, Loader2
} from "lucide-react"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const REQUIRED_DOCS = ["pan", "aadhaar", "salary-slip", "bank-statement"]

const DOC_LABELS: Record<string, string> = {
    "pan": "PAN Card",
    "aadhaar": "Aadhaar Card",
    "salary-slip": "Salary Slip",
    "bank-statement": "Bank Statement (Last 3 Months)",
}

const fmt = (n: number | undefined) =>
    n ? `₹${n.toLocaleString("en-IN")}` : "—"

const tenureLabel: Record<string, string> = {
    none: "Not Applicable",
    "<6_months": "Less than 6 months",
    "6m-1yr": "6 Months – 1 Year",
    "1-2yr": "1–2 Years",
    "2-5yr": "2–5 Years",
    "5+yr": "5+ Years",
}

const purposeLabel: Record<string, string> = {
    education: "Education Loan", personal: "Personal Loan", business: "Business Loan",
    home: "Home Loan", car: "Car Loan", medical: "Medical Loan",
    wedding: "Wedding Loan", travel: "Travel Loan",
}

const empLabel: Record<string, string> = {
    salaried: "Salaried Employee", self_employed: "Self-Employed",
    freelancer: "Freelancer / Consultant", student: "Student",
    unemployed: "Currently Unemployed",
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className={`grid grid-cols-5 border-b border-[#c8d6e5] text-[12.5px] ${highlight ? "bg-[#eef4fc]" : "bg-white"}`}>
            <div className="col-span-2 py-2 px-3 font-semibold text-[#1a3a6c] border-r border-[#c8d6e5]">{label}</div>
            <div className="col-span-3 py-2 px-3 text-[#1a1a1a] font-medium uppercase tracking-wide">{value || "—"}</div>
        </div>
    )
}

function Section({ title, icon }: { title: string; icon?: React.ReactNode }) {
    return (
        <div className="bg-[#1a3a6c] text-white px-4 py-2.5 flex items-center gap-2 mt-5">
            {icon && <span>{icon}</span>}
            <span className="text-[11px] font-bold tracking-widest uppercase">{title}</span>
        </div>
    )
}

async function triggerTwilio(stage: string, user: any, extraData?: any) {
    try {
        await fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                stage,
                userData: { name: user.name, phone: user.phone, creditScore: user.creditScore, amount: user.loanAmount, ...extraData }
            })
        })
    } catch (e) {
        console.error("[Twilio] Failed to send:", e)
    }
}

// ─── Document Gate Component ──────────────────────────────────────────────────

function DocumentGate({ user, uploadedDocIds }: { user: any; uploadedDocIds: string[] }) {
    const missingDocs = REQUIRED_DOCS.filter(id => !uploadedDocIds.includes(id))
    const uploaded = REQUIRED_DOCS.filter(id => uploadedDocIds.includes(id))

    return (
        <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-4 py-10">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border-t-4 border-[#d41e29]">
                {/* HDFC Header */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#d41e29] rounded-sm flex items-center justify-center">
                        <span className="text-white font-black text-lg">H</span>
                    </div>
                    <div>
                        <div className="text-[#1a3a6c] font-black text-lg leading-none">HDFC BANK</div>
                        <div className="text-[#1a3a6c] text-xs font-semibold leading-none text-center">Loan Portal</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#fff3f3] rounded-full flex items-center justify-center flex-shrink-0">
                        <Lock className="w-6 h-6 text-[#d41e29]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#1a3a6c]">Documents Required</h2>
                        <p className="text-sm text-gray-500">You need to upload all required documents before applying.</p>
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    {REQUIRED_DOCS.map(id => {
                        const done = uploadedDocIds.includes(id)
                        return (
                            <div key={id} className={`flex items-center gap-3 p-3 rounded-xl border ${done ? "border-green-200 bg-green-50" : "border-red-100 bg-red-50"}`}>
                                {done
                                    ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    : <AlertCircle className="w-5 h-5 text-[#d41e29] flex-shrink-0" />
                                }
                                <div className="flex-1">
                                    <p className={`text-sm font-semibold ${done ? "text-green-700" : "text-[#d41e29]"}`}>{DOC_LABELS[id]}</p>
                                    <p className="text-xs text-gray-500">{done ? "Uploaded ✓" : "Missing — required for HDFC application"}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="text-center mb-5">
                    <p className="text-sm text-gray-500">
                        <span className="font-bold text-[#1a3a6c]">{uploaded.length} of {REQUIRED_DOCS.length}</span> documents uploaded
                    </p>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                        <div
                            className="bg-[#1a3a6c] h-2 rounded-full transition-all duration-700"
                            style={{ width: `${(uploaded.length / REQUIRED_DOCS.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link href="/dashboard/loans"
                        className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-center hover:bg-gray-50 transition-colors text-sm">
                        ← Back
                    </Link>
                    <Link href="/dashboard/documents"
                        className="flex-1 bg-[#1a3a6c] text-white py-3 rounded-xl font-bold text-center hover:bg-[#0d2447] transition-colors text-sm flex items-center justify-center gap-2">
                        <FileCheck className="w-4 h-4" />
                        Upload Documents
                    </Link>
                </div>
            </div>
        </div>
    )
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ appId, user }: { appId: string; user: any }) {
    return (
        <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center border-t-4 border-[#1a3a6c]">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <div className="flex justify-center mb-4 gap-2">
                    <div className="w-9 h-9 bg-[#d41e29] rounded-sm flex items-center justify-center">
                        <span className="text-white text-sm font-black">H</span>
                    </div>
                    <div className="text-left">
                        <div className="text-[#1a3a6c] font-black leading-none">HDFC</div>
                        <div className="text-[#1a3a6c] text-sm font-semibold leading-none">BANK</div>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-[#1a3a6c] mb-2">Application Submitted!</h2>
                <p className="text-gray-600 mb-4">Your loan application has been sent to HDFC Bank.</p>

                <div className="bg-[#eef4fc] border border-[#c8d6e5] rounded-xl p-4 mb-4">
                    <p className="text-xs text-gray-500 mb-1">Reference Number</p>
                    <p className="text-xl font-bold text-[#1a3a6c] font-mono tracking-wider">{appId}</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-left">
                    <p className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4" /> WhatsApp Notification Sent!
                    </p>
                    <p className="text-xs text-amber-700">
                        A confirmation has been sent to <strong>{user.phone}</strong> via WhatsApp. HDFC Bank will contact you within <strong>2 business days</strong>.
                    </p>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <p>📋 Processing time: <strong>2–5 working days</strong></p>
                    <p>📞 HDFC helpline: <strong>1800-202-6161</strong></p>
                </div>

                <div className="flex gap-3">
                    <Link href="/dashboard" className="flex-1 bg-[#1a3a6c] text-white py-3 rounded-xl font-semibold text-center hover:bg-[#0d2447] transition-colors">
                        Dashboard
                    </Link>
                    <Link href="/dashboard/timeline" className="flex-1 border-2 border-[#1a3a6c] text-[#1a3a6c] py-3 rounded-xl font-semibold text-center hover:bg-[#eef4fc] transition-colors">
                        Track Status
                    </Link>
                </div>
            </div>
        </div>
    )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function HDFCApplicationPage() {
    const { user, loading, updateUser } = useUser()
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const appId = useRef(`HDFC-AA-${Date.now().toString(36).toUpperCase()}`)

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#1a3a6c] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#1a3a6c] font-semibold">Loading your application...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
                <p className="text-red-600 font-semibold">Please log in first.</p>
            </div>
        )
    }

    const uploadedFiles: any[] = user.uploadedFiles || []
    const uploadedDocIds = [...new Set(uploadedFiles.map((f: any) => f.docId))] as string[]
    const allDocsUploaded = REQUIRED_DOCS.every(id => uploadedDocIds.includes(id))

    // GATE: block access if docs not ready
    if (!allDocsUploaded) {
        return <DocumentGate user={user} uploadedDocIds={uploadedDocIds} />
    }

    if (submitted) {
        return <SuccessScreen appId={appId.current} user={user} />
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            // 1. Update timeline simulation
            await updateUser({
                selectedLoan: user.selectedLoan,
                timelineSimulation: {
                    ...(user.timelineSimulation || {}),
                    appSubmitStatus: "completed",
                    appSubmittedAt: Date.now(),
                    approvalStatus: "pending",
                    approvedAt: undefined,
                }
            })

            // 2. Fire Twilio WhatsApp message
            await triggerTwilio("application_submitted", user, {
                amount: user.loanAmount,
                bankName: "HDFC Bank",
            })
        } catch (e) {
            console.error("Submission error:", e)
        } finally {
            setSubmitting(false)
            setSubmitted(true)
        }
    }

    return (
        <div className="min-h-screen bg-[#f0f4f8]">
            {/* HDFC Top Bar */}
            <div className="bg-[#1a3a6c] text-white print:hidden">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/dashboard/loans" className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Loan Offers
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[#d41e29] rounded-sm flex items-center justify-center">
                            <span className="text-white font-black text-sm">H</span>
                        </div>
                        <div>
                            <div className="text-white font-black text-sm leading-none">HDFC BANK</div>
                            <div className="text-white/60 text-xs leading-none">Loan Application Portal</div>
                        </div>
                    </div>
                    <button onClick={() => window.print()} className="flex items-center gap-2 text-sm text-white/80 hover:text-white border border-white/30 rounded px-3 py-1.5 hover:bg-white/10">
                        <Download className="w-3.5 h-3.5" /> Print
                    </button>
                </div>
            </div>

            {/* Doc Status Banner */}
            <div className="bg-green-600 text-white print:hidden">
                <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold">All {REQUIRED_DOCS.length} required documents verified</span>
                    <span className="text-green-100 ml-1">— You are cleared to apply!</span>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="bg-white border-b border-gray-200 print:hidden">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 text-xs">
                    {[
                        { n: 1, label: "Documents Verified", done: true },
                        { n: 2, label: "Review Form", done: false, active: true },
                        { n: 3, label: "Submit", done: false },
                    ].map(s => (
                        <div key={s.n} className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${s.done ? "bg-green-600 text-white" : s.active ? "bg-[#d41e29] text-white" : "bg-gray-200 text-gray-500"}`}>
                                {s.done ? <CheckCircle2 className="w-4 h-4" /> : s.n}
                            </div>
                            <span className={s.done ? "text-green-700 font-semibold" : s.active ? "text-[#d41e29] font-semibold" : "text-gray-400"}>{s.label}</span>
                            {s.n < 3 && <div className="w-8 h-0.5 bg-gray-200" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Pre-fill notice */}
            <div className="max-w-5xl mx-auto px-4 pt-5 print:hidden">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3 mb-4 text-sm">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-amber-800">Pre-filled from your ArthAstra profile</p>
                        <p className="text-xs text-amber-700 mt-0.5">Review your details carefully before submitting. Reference: <strong>{appId.current}</strong></p>
                    </div>
                </div>
            </div>

            {/* ─── APPLICATION FORM ─── */}
            <div className="max-w-5xl mx-auto px-4 pb-10">
                <div className="bg-white shadow-lg border border-[#c8d6e5]">

                    {/* PART A — Personal */}
                    <div className="p-6 border-b-2 border-[#c8d6e5]">
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h1 className="text-sm font-bold text-[#1a3a6c] uppercase tracking-wide">Individual Loan Application Form</h1>
                                <p className="text-[11px] text-[#d41e29] font-semibold mt-0.5">FILL ALL FIELDS IN CAPITAL LETTERS</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-[#1a3a6c] text-white text-xs font-bold px-3 py-1 rounded">PART A ①</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-7 h-7 bg-[#d41e29] rounded-sm flex items-center justify-center"><span className="text-white font-black text-sm">H</span></div>
                                    <div><div className="text-[#1a3a6c] text-xs font-black">HDFC</div><div className="text-[#1a3a6c] text-[10px] font-semibold">BANK</div></div>
                                </div>
                            </div>
                        </div>

                        {/* Photo Box */}
                        <div className="flex gap-4 mb-4">
                            <div className="w-24 h-32 border-2 border-dashed border-[#1a3a6c] flex items-center justify-center text-center p-2 bg-gray-50 flex-shrink-0">
                                <div><User className="w-7 h-7 text-[#1a3a6c] mx-auto mb-1" /><p className="text-[9px] text-[#1a3a6c] font-semibold">PASSPORT SIZE PHOTOGRAPH</p></div>
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="bg-[#eef4fc] border border-[#c8d6e5] rounded p-2">
                                    <p className="text-[10px] text-[#1a3a6c] font-bold uppercase mb-1">HDFC Bank Customer ID</p>
                                    <div className="flex gap-1">{Array(10).fill(0).map((_, i) => <div key={i} className="w-7 h-6 border border-[#1a3a6c] text-[10px] flex items-center justify-center" />)}</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded p-2">
                                    <p className="text-[11px] text-green-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> All documents verified • Application cleared</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Ref: {appId.current}</p>
                                </div>
                            </div>
                        </div>

                        <Section title="Personal Details" icon={<User className="w-3.5 h-3.5" />} />
                        <div className="border border-[#c8d6e5]">
                            <div className="grid grid-cols-5 bg-[#1a3a6c] text-white text-[10px] font-bold"><div className="col-span-2 py-1.5 px-3 border-r border-[#2a5a9c]">FIELD</div><div className="col-span-3 py-1.5 px-3">APPLICANT DETAILS</div></div>
                            <Field label="Full Name" value={user.name || ""} />
                            <Field label="Mobile No." value={user.phone || ""} highlight />
                            <Field label="Age" value={user.age ? `${user.age} Years` : ""} />
                            <Field label="City / Town" value={user.city || ""} highlight />
                            <Field label="State" value={user.state || ""} />
                            <Field label="Preferred Language" value={({ en: "English", hi: "Hindi", mr: "Marathi", ta: "Tamil", bn: "Bengali" }[user.language || "en"] || "English")} highlight />
                        </div>
                    </div>

                    {/* PART B — Employment */}
                    <div className="p-6 border-b-2 border-[#c8d6e5]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-[#1a3a6c] uppercase">Employment & Financial Details</h2>
                            <span className="bg-[#1a3a6c] text-white text-xs font-bold px-3 py-1 rounded">PART B ②</span>
                        </div>

                        <Section title="Employment Information" icon={<Briefcase className="w-3.5 h-3.5" />} />
                        <div className="border border-[#c8d6e5] mb-4">
                            <div className="grid grid-cols-5 bg-[#1a3a6c] text-white text-[10px] font-bold"><div className="col-span-2 py-1.5 px-3 border-r border-[#2a5a9c]">FIELD</div><div className="col-span-3 py-1.5 px-3">DETAILS</div></div>
                            <Field label="Employment Type" value={empLabel[user.employmentType] || user.employmentType || ""} />
                            <Field label="Employer / Company" value={user.companyName || "Not Provided"} highlight />
                            <Field label="Employment Tenure" value={tenureLabel[user.employmentTenure] || user.employmentTenure || ""} />
                            <Field label="Monthly Income (Gross)" value={fmt(user.monthlyIncome)} highlight />
                            <Field label="Existing Monthly EMI" value={fmt(user.existingEMI) || "NIL"} />
                            <Field label="Monthly Expenses" value={fmt(user.monthlyExpenses) || "NIL"} highlight />
                            <Field label="Net Disposable Income" value={user.monthlyIncome ? fmt(user.monthlyIncome - (user.existingEMI || 0) - (user.monthlyExpenses || 0)) : "—"} />
                            <Field label="Savings Range" value={user.savingsRange || "Not Provided"} highlight />
                        </div>

                        <Section title="Address" icon={<MapPin className="w-3.5 h-3.5" />} />
                        <div className="border border-[#c8d6e5]">
                            <div className="grid grid-cols-5 bg-[#1a3a6c] text-white text-[10px] font-bold"><div className="col-span-2 py-1.5 px-3 border-r border-[#2a5a9c]">FIELD</div><div className="col-span-3 py-1.5 px-3">DETAILS</div></div>
                            <Field label="Town / City" value={user.city || ""} />
                            <Field label="State" value={user.state || ""} highlight />
                            <Field label="Contact No." value={user.phone || ""} />
                        </div>
                    </div>

                    {/* PART C — Loan */}
                    <div className="p-6 border-b-2 border-[#c8d6e5]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-[#1a3a6c] uppercase">Loan Requirement</h2>
                            <span className="bg-[#1a3a6c] text-white text-xs font-bold px-3 py-1 rounded">PART C ③</span>
                        </div>

                        <Section title="Loan Details" />
                        <div className="border border-[#c8d6e5] mb-4">
                            <div className="grid grid-cols-5 bg-[#1a3a6c] text-white text-[10px] font-bold"><div className="col-span-2 py-1.5 px-3 border-r border-[#2a5a9c]">FIELD</div><div className="col-span-3 py-1.5 px-3">DETAILS</div></div>
                            <Field label="Purpose of Loan" value={purposeLabel[user.loanPurpose] || user.loanPurpose || "Personal Loan"} />
                            <Field label="Loan Amount (₹)" value={fmt(user.loanAmount)} highlight />
                            <Field label="Preferred Tenure (Years)" value={user.tenure ? `${user.tenure} Years` : "—"} />
                            <Field label="Preferred Max EMI" value={fmt(user.preferredEMI)} highlight />
                            <Field label="Rate Option" value="Floating (linked to HRBLR)" />
                        </div>

                        <Section title="Credit Information" />
                        <div className="border border-[#c8d6e5]">
                            <div className="grid grid-cols-5 bg-[#1a3a6c] text-white text-[10px] font-bold"><div className="col-span-2 py-1.5 px-3 border-r border-[#2a5a9c]">FIELD</div><div className="col-span-3 py-1.5 px-3">DETAILS</div></div>
                            <Field label="Credit History Exists?" value={user.hasCreditHistory ? "Yes" : "No"} />
                            <Field label="CIBIL Score (Approximate)" value={user.creditScore ? String(user.creditScore) : "Not Provided"} highlight />
                            <Field label="Credit Band" value={
                                !user.creditScore ? "—" :
                                    user.creditScore >= 750 ? "EXCELLENT (750+)" :
                                        user.creditScore >= 700 ? "GOOD (700–749)" :
                                            user.creditScore >= 650 ? "FAIR (650–699)" : "BELOW AVERAGE"
                            } />
                        </div>
                    </div>

                    {/* PART D — Declaration */}
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-[#1a3a6c] uppercase">Declaration & Signature</h2>
                            <span className="bg-[#1a3a6c] text-white text-xs font-bold px-3 py-1 rounded">PART D ④</span>
                        </div>

                        <div className="bg-gray-50 border border-[#c8d6e5] rounded p-4 mb-5">
                            <h4 className="text-[10px] font-bold text-[#1a3a6c] uppercase mb-3 tracking-wider">Declaration</h4>
                            <ol className="space-y-1.5 text-[11px] text-gray-700 list-decimal pl-4">
                                <li>I/We declare that all particulars and information given in this form are true, correct and complete.</li>
                                <li>I/We confirm that funds shall be used for the stated purpose only and not for speculative purposes.</li>
                                <li>I/We authorise HDFC Bank to make any enquiries regarding my/our application with credit bureaus.</li>
                                <li>I/We have read and understood all terms and conditions of availing finance from HDFC Bank.</li>
                                <li>I/We authorise HDFC Bank to conduct such credit checks as considered necessary.</li>
                                <li>HDFC Bank reserves the right to retain photographs and documents submitted with this application.</li>
                            </ol>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mt-6">
                            <div>
                                <div className="border-b-2 border-[#1a3a6c] pb-1 mb-1">&nbsp;</div>
                                <p className="text-xs text-gray-600 text-center">Applicant's Signature</p>
                                <p className="text-[11px] text-[#1a3a6c] font-semibold text-center mt-1">{user.name || "Applicant"}</p>
                            </div>
                            <div>
                                <div className="border-b-2 border-[#c8d6e5] pb-1 mb-1">&nbsp;</div>
                                <p className="text-xs text-gray-500 text-center">Co-applicant's Signature (if applicable)</p>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-[11px]">
                            <div className="bg-[#eef4fc] border border-[#c8d6e5] rounded p-3">
                                <p className="text-[#1a3a6c] font-bold mb-1">Date:</p>
                                <p className="text-gray-700 font-mono">{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}</p>
                            </div>
                            <div className="bg-[#eef4fc] border border-[#c8d6e5] rounded p-3">
                                <p className="text-[#1a3a6c] font-bold mb-1">Place:</p>
                                <p className="text-gray-700">{user.city || "—"}</p>
                            </div>
                        </div>

                        <p className="text-center text-[10px] text-gray-400 mt-4 border-t pt-3">
                            Do not Sign this Form if it is Blank. Please ensure all sections are filled before signing.
                        </p>
                    </div>
                </div>

                {/* ─── Action Buttons ─── */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4 print:hidden">
                    <Link href="/dashboard/loans" className="flex items-center justify-center gap-2 flex-1 border-2 border-[#1a3a6c] text-[#1a3a6c] py-3.5 rounded-xl font-semibold hover:bg-[#eef4fc] transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Offers
                    </Link>
                    <button onClick={() => window.print()} className="flex items-center justify-center gap-2 flex-1 border-2 border-gray-300 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" /> Download / Print
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center justify-center gap-2 flex-1 bg-[#d41e29] hover:bg-[#b01520] text-white py-3.5 px-8 rounded-xl font-bold text-base shadow-xl shadow-[#d41e29]/30 transition-all disabled:opacity-60"
                    >
                        {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting to HDFC...</> : <><CheckCircle2 className="w-5 h-5" /> Submit Application</>}
                    </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-3 print:hidden">
                    A WhatsApp confirmation will be sent to <strong>{user.phone}</strong> upon submission via Twilio.
                </p>
            </div>
        </div>
    )
}
