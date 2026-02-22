"use client"

import { useUser } from "@/lib/user-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle2, Download, Send, ShieldCheck, Clock, Save, Edit3 } from "lucide-react"
import Link from "next/link"

/* ─── helpers ──────────────────────────────────────────── */
function fmtMoney(n?: number | null) {
    if (n == null) return "—"
    return `₹${n.toLocaleString("en-IN")}`
}
function cap(s?: string) {
    if (!s) return "—"
    return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}
const tenureLabel: Record<string, string> = {
    none: "Not Applicable", "<6_months": "< 6 Months", "6m-1yr": "6 Months – 1 Year",
    "1-2yr": "1 – 2 Years", "2-5yr": "2 – 5 Years", "5+yr": "5+ Years",
}

/* ─── print-to-PDF helper ──────────────────────────────── */
function printApplication(data: Record<string, any>) {
    const w = window.open("", "_blank", "width=960,height=720")
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8"/>
<title>HDFC Bank — Loan Application</title>
<style>
  @media print { body{-webkit-print-color-adjust:exact;} .noprint{display:none!important;} }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Segoe UI',sans-serif;font-size:12px;color:#1e293b;background:#F0F6FF;}
  .hdr{background:linear-gradient(to right,#004C8F,#0060B3);color:#fff;padding:18px 32px;}
  .hdr-top{display:flex;align-items:center;gap:16px;}
  .logo{background:#fff;border-radius:4px;padding:4px 10px;font-weight:900;color:#004C8F;font-size:18px;letter-spacing:-1px;}
  .hdr h1{font-size:17px;font-weight:800;}
  .hdr p{font-size:10px;color:#bfdbfe;margin-top:2px;}
  .redbar{background:#E31837;padding:5px 32px;font-size:9px;font-weight:700;color:#fff;letter-spacing:.8px;display:flex;justify-content:space-between;}
  .body{padding:20px 32px;}
  .offer{background:#004C8F;color:#fff;border-radius:10px;padding:18px 24px;margin-bottom:20px;}
  .offer-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:8px;}
  .offer-item p:first-child{font-size:9px;color:#bfdbfe;margin-bottom:2px;}
  .offer-item p:last-child{font-size:20px;font-weight:900;}
  .section{background:#fff;border:1px solid #B8D4EE;border-radius:8px;overflow:hidden;margin-bottom:16px;}
  .sh{background:#004C8F;color:#fff;font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:6px 16px;}
  table{width:100%;border-collapse:collapse;}
  tr{border-bottom:1px solid #D0E4F5;}
  tr:nth-child(even){background:#F4F9FF;}
  td{padding:7px 14px;}
  td:first-child{font-size:9px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.4px;width:34%;}
  td:last-child{font-size:12px;font-weight:700;color:#0f172a;}
  .hl td:last-child{color:#004C8F;}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:0;}
  .cell{padding:10px 14px;border-bottom:1px solid #f1f5f9;}
  .cell:nth-child(odd){border-right:1px solid #f1f5f9;}
  .cell label{display:block;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;margin-bottom:3px;}
  .cell span{font-size:12px;font-weight:700;color:#0f172a;}
  .ai{background:#ecfdf5;color:#059669;border:1px solid #6ee7b7;border-radius:3px;padding:1px 5px;font-size:7px;font-weight:800;margin-left:4px;}
  .footer{text-align:center;font-size:9px;color:#94a3b8;margin:16px 0 4px;}
  .print-btn{display:block;margin:20px auto;background:#004C8F;color:#fff;border:none;padding:10px 28px;border-radius:7px;font-size:13px;font-weight:700;cursor:pointer;}
</style></head><body>
<div class="hdr">
  <div class="hdr-top">
    <span class="logo">H</span>
    <div><h1>HDFC Bank · Personal Loan Application</h1><p>Pre-filled from ArthAstra AI Profile · Generated ${new Date().toLocaleString("en-IN")}</p></div>
  </div>
</div>
<div class="redbar"><span>INDIVIDUAL LOAN APPLICATION FORM — PART A</span><span>Ref: ${data.refId}</span></div>
<div class="body">
<div class="offer">
  <p style="font-size:10px;color:#bfdbfe">Your Personalised Offer</p>
  <div class="offer-grid">
    <div class="offer-item"><p>Loan Amount</p><p>${fmtMoney(data.loanAmount)}</p></div>
    <div class="offer-item"><p>Interest Rate</p><p>${data.rate}% <span style="font-size:11px;opacity:.7">p.a.</span></p></div>
    <div class="offer-item"><p>Monthly EMI</p><p>${fmtMoney(data.emi)}</p></div>
    <div class="offer-item"><p>Tenure</p><p>${data.tenure} <span style="font-size:11px;opacity:.7">yrs</span></p></div>
    <div class="offer-item"><p>Processing Fee</p><p>${fmtMoney(data.processingFee)}</p></div>
  </div>
</div>

<div class="section">
  <div class="sh">Part A — Personal Details</div>
  <div class="grid2">
    <div class="cell"><label>Full Name</label><span>${data.name || "—"}</span></div>
    <div class="cell"><label>Phone</label><span>${data.phone || "—"}</span></div>
    <div class="cell"><label>Email</label><span>${data.email || "—"}</span></div>
    <div class="cell"><label>City</label><span>${data.city || "—"}</span></div>
    <div class="cell"><label>State</label><span>${data.state || "—"}</span></div>
    <div class="cell"><label>Gender</label><span>${data.gender || "—"}</span></div>
    <div class="cell"><label>PAN Number <span class="ai">AI Extracted</span></label><span>${data.panNumber || "—"}</span></div>
    <div class="cell"><label>Aadhaar Number <span class="ai">AI Extracted</span></label><span>${data.aadhaarNumber || "—"}</span></div>
  </div>
</div>

<div class="section">
  <div class="sh">Part B — Employment & Income</div>
  <table>
    <tr><td>Employment Type</td><td>${cap(data.employmentType)}</td></tr>
    <tr class="hl"><td>Monthly Income</td><td>${fmtMoney(data.monthlyIncome)}</td></tr>
    <tr><td>Company / Employer</td><td>${data.companyName || "—"}</td></tr>
    <tr><td>Employment Tenure</td><td>${tenureLabel[data.employmentTenure] || data.employmentTenure || "—"}</td></tr>
  </table>
</div>

<div class="section">
  <div class="sh">Part C — Financial Information</div>
  <table>
    <tr><td>Monthly Expenses</td><td>${fmtMoney(data.monthlyExpenses)}</td></tr>
    <tr><td>Existing EMI Obligations</td><td>${fmtMoney(data.existingEMI)}</td></tr>
    <tr class="hl"><td>Credit Score (CIBIL)</td><td>${data.creditScore || "—"}</td></tr>
    <tr><td>Has Credit History</td><td>${data.hasCreditHistory === true ? "Yes" : data.hasCreditHistory === false ? "No" : "—"}</td></tr>
  </table>
</div>

<div class="section">
  <div class="sh">Part D — Loan Requested</div>
  <table>
    <tr class="hl"><td>Purpose</td><td>${cap(data.loanPurpose)}</td></tr>
    <tr class="hl"><td>Amount (₹)</td><td>${fmtMoney(data.loanAmount)}</td></tr>
    <tr class="hl"><td>Preferred Tenure</td><td>${data.tenure} Years</td></tr>
    <tr><td>Interest Rate (HDFC)</td><td>${data.rate}% per annum</td></tr>
    <tr class="hl"><td>Monthly EMI (₹)</td><td>${fmtMoney(data.emi)}</td></tr>
    <tr><td>Processing Fee</td><td>${fmtMoney(data.processingFee)}</td></tr>
    <tr><td>Total Repayment</td><td>${fmtMoney(data.emi * data.tenure * 12)}</td></tr>
    <tr><td>Total Interest Payable</td><td>${fmtMoney(data.emi * data.tenure * 12 - data.loanAmount)}</td></tr>
  </table>
</div>

</div>
<div class="footer">HDFC Bank Ltd · CIN: L65920MH1994PLC080618 · Generated by ArthAstra AI · For loan processing only</div>
<button class="print-btn noprint" onclick="window.print()">🖨️ Print / Save as PDF</button>
</body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 700)
}

/* ─── editable form field ──────────────────────────────── */
function EditField({
    label, value, onChange, type = "text", mono, suffix, wide
}: {
    label: string; value: string | number | undefined; onChange: (v: string) => void;
    type?: string; mono?: boolean; suffix?: string; wide?: boolean
}) {
    return (
        <div className={`flex flex-col gap-1 ${wide ? "col-span-2" : ""}`}>
            <label className="text-[9px] text-gray-500 uppercase tracking-wide font-bold">{label}</label>
            <div className="relative">
                <input
                    type={type}
                    value={value ?? ""}
                    onChange={e => onChange(e.target.value)}
                    className={[
                        "w-full border border-[#B8D4EE] bg-white rounded px-3 py-2 text-[13px] font-semibold text-gray-900",
                        "focus:outline-none focus:border-[#004C8F] focus:ring-1 focus:ring-[#004C8F]/30 transition",
                        mono ? "font-mono tracking-widest" : "",
                        suffix ? "pr-10" : ""
                    ].join(" ")}
                />
                {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{suffix}</span>
                )}
            </div>
        </div>
    )
}

function EditSelect({
    label, value, onChange, options, wide
}: {
    label: string; value: string | undefined; onChange: (v: string) => void;
    options: { value: string; label: string }[]; wide?: boolean
}) {
    return (
        <div className={`flex flex-col gap-1 ${wide ? "col-span-2" : ""}`}>
            <label className="text-[9px] text-gray-500 uppercase tracking-wide font-bold">{label}</label>
            <select
                value={value ?? ""}
                onChange={e => onChange(e.target.value)}
                className="border border-[#B8D4EE] bg-white rounded px-3 py-2 text-[13px] font-semibold text-gray-900 focus:outline-none focus:border-[#004C8F] focus:ring-1 focus:ring-[#004C8F]/30 transition"
            >
                <option value="">— Select —</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-[#004C8F] text-white font-bold text-[11px] px-4 py-2 uppercase tracking-widest">
            {children}
        </div>
    )
}

/* ─── main component ───────────────────────────────────── */
export default function HDFCApplyPage() {
    const { user, loading, updateUser } = useUser()
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // local editable copy
    const [form, setForm] = useState<any>(null)
    useEffect(() => { if (user && !form) setForm({ ...user }) }, [user])

    const set = (key: string) => (val: string) => setForm((p: any) => ({ ...p, [key]: val }))

    if (loading || !form) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#004C8F] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600 text-sm">Loading your application…</p>
                </div>
            </div>
        )
    }

    // ── extract PAN / Aadhaar from uploaded & verified docs ──
    const panFile = form?.uploadedFiles?.find((f: any) => f.docId === "pan" && f.extractedData?.documentNumber)
    const aadhaarFile = form?.uploadedFiles?.find((f: any) => f.docId === "aadhaar" && f.extractedData?.documentNumber)
    const panNumber = panFile?.extractedData?.documentNumber || form?.panNumber || ""
    const aadhaarNumber = aadhaarFile?.extractedData?.documentNumber || form?.aadhaarNumber || ""

    // ── loan calc ──
    const loanAmount = Number(form.loanAmount) || 500000
    const tenure = Number(form.loanTenure || form.tenure) || 3
    const rate = 10.5
    const monthlyRate = rate / 12 / 100
    const months = tenure * 12
    const emi = months > 0
        ? Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1))
        : 0
    const processingFee = Math.round(loanAmount * 0.015)
    const refId = `HDFC-${(form._id || Math.random().toString(36)).substr(2, 8).toUpperCase()}`

    async function notify(stage: string) {
        try {
            await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage, userData: { name: form.name, phone: form.phone, creditScore: form.creditScore, amount: loanAmount.toLocaleString("en-IN") } }) })
        } catch { }
    }

    async function handleSubmit() {
        setSubmitting(true)
        await updateUser({ ...form, selectedLoan: { bankName: "HDFC Bank", productName: "Personal Loan – Premium", rate, emi, tenure, principal: loanAmount, processingFee, referenceId: refId }, timelineSimulation: { ...(form.timelineSimulation || {}), appSubmitStatus: "completed", appSubmittedAt: Date.now(), approvalStatus: "pending" } })
        await notify("application_submitted")
        await new Promise(res => setTimeout(res, 4000))
        await updateUser({ timelineSimulation: { ...(form.timelineSimulation || {}), appSubmitStatus: "completed", appSubmittedAt: Date.now(), approvalStatus: "approved", approvedAt: Date.now() } })
        await notify("loan_approved")
        setSubmitting(false)
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EBF4FF] to-white px-4">
                <div className="text-center max-w-lg">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </div>
                        <span className="absolute -top-1 -right-1 text-2xl animate-bounce">🎊</span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Congratulations!</h2>
                    <p className="text-gray-600 mb-1 text-lg font-semibold">Your Loan is <span className="text-green-600">APPROVED</span></p>
                    <p className="text-sm text-gray-500 mb-6">Reference ID: <strong className="text-[#004C8F] font-mono">{refId}</strong></p>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 text-left shadow-sm">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wide">Application Stages</p>
                        {["Profile Setup", "Documentation", "Credit Check", "Lender Matching", "Application Submitted to HDFC Bank", "Approval & Disbursal"].map(s => (
                            <div key={s} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm font-semibold text-gray-800">{s}</span>
                            </div>
                        ))}
                    </div>
                    <div className="bg-[#EBF4FF] rounded-xl px-5 py-4 mb-8">
                        <p className="text-sm font-bold text-[#004C8F] mb-1">Loan Amount: {fmtMoney(loanAmount)}</p>
                        <p className="text-xs text-gray-600">Disbursal in 1–2 business days. EMI of <strong>{fmtMoney(emi)}/month</strong> from next cycle.</p>
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
                            <div className="bg-white rounded px-3 py-1 flex items-center gap-2">
                                <span className="text-[#004C8F] font-black text-lg tracking-tighter">H</span>
                                <div className="h-5 w-px bg-gray-300" />
                                <span className="text-[#E31837] font-black text-xs tracking-widest">HDFC</span>
                                <span className="text-[#004C8F] font-bold text-xs">BANK</span>
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg leading-none">Personal Loan — Premium</p>
                                <p className="text-blue-200 text-xs mt-0.5">Editable Application · 10.5% p.a. · All fields can be modified</p>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-green-300">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="font-medium">Secure & Encrypted</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-200">
                            <Clock className="w-4 h-4" />
                            <span>2-day approval</span>
                        </div>
                    </div>
                </div>
                <div className="bg-[#E31837] px-4 py-2">
                    <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-white font-medium">
                        <span>INDIVIDUAL LOAN APPLICATION FORM — PRE-FILLED FROM YOUR ArthAstra PROFILE</span>
                        <span>PART-A · Ref: {refId}</span>
                    </div>
                </div>
            </div>

            {/* ── Edit hint banner ── */}
            <div className="max-w-5xl mx-auto px-4 mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-blue-800">
                    <Edit3 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>All fields below are editable. Make any corrections before submitting.</span>
                </div>
            </div>

            {/* ── Offer Summary ── */}
            <div className="max-w-5xl mx-auto px-4 mt-4">
                <div className="bg-white rounded-2xl shadow-lg border border-[#B8D4EE] overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-[#004C8F] to-[#0073CF] p-5 text-white">
                        <p className="text-sm text-blue-200 mb-2">Your Personalised Offer</p>
                        <div className="flex flex-wrap gap-8 items-end">
                            <div>
                                <p className="text-xs text-blue-200">Loan Amount</p>
                                <p className="text-3xl font-black">{fmtMoney(loanAmount)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-200">Interest Rate</p>
                                <p className="text-3xl font-black">{rate}% <span className="text-base font-semibold opacity-80">p.a.</span></p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-200">Monthly EMI</p>
                                <p className="text-3xl font-black">{fmtMoney(emi)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-200">Tenure</p>
                                <p className="text-3xl font-black">{tenure} <span className="text-base font-semibold opacity-80">yrs</span></p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-200">Processing Fee</p>
                                <p className="text-2xl font-black">{fmtMoney(processingFee)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-5 py-3 bg-green-50 border-t border-green-100 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <p className="text-sm text-green-800 font-medium">AI Recommended · Highest approval odds based on your financial profile</p>
                    </div>
                </div>
            </div>

            {/* ── Application Form ── */}
            <div className="max-w-5xl mx-auto px-4 pb-16 space-y-6">

                {/* PART A: Personal Details */}
                <div className="bg-white rounded-2xl shadow border border-[#B8D4EE] overflow-hidden">
                    <SectionHeader>Part A — Personal Details</SectionHeader>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditField label="Full Name" value={form.name} onChange={set("name")} wide />
                        <EditField label="Phone Number" value={form.phone} onChange={set("phone")} />
                        <EditField label="Email Address" value={form.email} onChange={set("email")} />
                        <EditField label="City" value={form.city} onChange={set("city")} />
                        <EditField label="State / Union Territory" value={form.state} onChange={set("state")} />
                        <EditSelect
                            label="Gender"
                            value={form.gender}
                            onChange={set("gender")}
                            options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]}
                        />
                    </div>

                    {/* KYC row */}
                    <div className="border-t border-[#D0E4F5]">
                        <SectionHeader>KYC — Identity Numbers (Auto-extracted from Verified Documents)</SectionHeader>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-gray-500 uppercase tracking-wide font-bold flex items-center gap-2">
                                    PAN Number
                                    {panFile && <span className="px-1.5 py-0.5 text-[8px] bg-emerald-100 text-emerald-700 rounded font-bold normal-case border border-emerald-200">✓ AI Extracted</span>}
                                </label>
                                <input
                                    type="text"
                                    value={panNumber}
                                    onChange={e => setForm((p: any) => ({ ...p, panNumber: e.target.value }))}
                                    placeholder="ABCDE1234F"
                                    className={`border rounded px-3 py-2 text-[13px] font-bold font-mono tracking-widest uppercase focus:outline-none focus:ring-1 transition ${panFile ? "border-emerald-300 bg-emerald-50 text-emerald-800 focus:ring-emerald-300" : "border-[#B8D4EE] bg-white text-gray-900 focus:border-[#004C8F] focus:ring-[#004C8F]/30"}`}
                                />
                                {panFile?.extractedData?.name && (
                                    <p className="text-[10px] text-slate-500">Name on PAN: <strong>{panFile.extractedData.name}</strong></p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-gray-500 uppercase tracking-wide font-bold flex items-center gap-2">
                                    Aadhaar Number
                                    {aadhaarFile && <span className="px-1.5 py-0.5 text-[8px] bg-emerald-100 text-emerald-700 rounded font-bold normal-case border border-emerald-200">✓ AI Extracted</span>}
                                </label>
                                <input
                                    type="text"
                                    value={aadhaarNumber}
                                    onChange={e => setForm((p: any) => ({ ...p, aadhaarNumber: e.target.value }))}
                                    placeholder="XXXX XXXX XXXX"
                                    className={`border rounded px-3 py-2 text-[13px] font-bold font-mono tracking-widest focus:outline-none focus:ring-1 transition ${aadhaarFile ? "border-emerald-300 bg-emerald-50 text-emerald-800 focus:ring-emerald-300" : "border-[#B8D4EE] bg-white text-gray-900 focus:border-[#004C8F] focus:ring-[#004C8F]/30"}`}
                                />
                                {aadhaarFile?.extractedData?.name && (
                                    <p className="text-[10px] text-slate-500">Name on Aadhaar: <strong>{aadhaarFile.extractedData.name}</strong></p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* PART B: Employment */}
                <div className="bg-white rounded-2xl shadow border border-[#B8D4EE] overflow-hidden">
                    <SectionHeader>Part B — Employment & Income Details</SectionHeader>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditSelect
                            label="Employment Type"
                            value={form.employmentType}
                            onChange={set("employmentType")}
                            options={[
                                { value: "salaried", label: "Salaried" },
                                { value: "self-employed", label: "Self Employed" },
                                { value: "business", label: "Business Owner" },
                                { value: "freelancer", label: "Freelancer" },
                            ]}
                        />
                        <EditField label="Company / Business Name" value={form.companyName || form.employerName} onChange={v => setForm((p: any) => ({ ...p, companyName: v, employerName: v }))} />
                        <EditField label="Monthly Income (₹)" value={form.monthlyIncome} onChange={v => set("monthlyIncome")(v)} type="number" />
                        <EditSelect
                            label="Employment Tenure"
                            value={form.employmentTenure}
                            onChange={set("employmentTenure")}
                            options={[
                                { value: "<6_months", label: "< 6 Months" },
                                { value: "6m-1yr", label: "6 Months – 1 Year" },
                                { value: "1-2yr", label: "1 – 2 Years" },
                                { value: "2-5yr", label: "2 – 5 Years" },
                                { value: "5+yr", label: "5+ Years" },
                            ]}
                        />
                    </div>
                </div>

                {/* PART C: Financial */}
                <div className="bg-white rounded-2xl shadow border border-[#B8D4EE] overflow-hidden">
                    <SectionHeader>Part C — Financial Information</SectionHeader>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditField label="Monthly Living Expenses (₹)" value={form.monthlyExpenses} onChange={v => set("monthlyExpenses")(v)} type="number" />
                        <EditField label="Existing Monthly EMI (₹)" value={form.existingEMI} onChange={v => set("existingEMI")(v)} type="number" />
                        <EditField label="Approximate Credit Score (CIBIL)" value={form.creditScore} onChange={v => set("creditScore")(v)} type="number" />
                        <EditSelect
                            label="Has Credit History?"
                            value={form.hasCreditHistory === true ? "yes" : form.hasCreditHistory === false ? "no" : ""}
                            onChange={v => setForm((p: any) => ({ ...p, hasCreditHistory: v === "yes" }))}
                            options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
                        />
                    </div>
                </div>

                {/* PART D: Loan */}
                <div className="bg-white rounded-2xl shadow border border-[#B8D4EE] overflow-hidden">
                    <SectionHeader>Part D — Loan Requested</SectionHeader>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditSelect
                            label="Purpose of Loan"
                            value={form.loanPurpose}
                            onChange={set("loanPurpose")}
                            options={[
                                { value: "personal", label: "Personal" },
                                { value: "home", label: "Home" },
                                { value: "education", label: "Education" },
                                { value: "vehicle", label: "Vehicle / Car" },
                                { value: "business", label: "Business" },
                                { value: "medical", label: "Medical" },
                                { value: "wedding", label: "Wedding" },
                                { value: "travel", label: "Travel" },
                            ]}
                        />
                        <EditField label="Loan Amount Requested (₹)" value={form.loanAmount} onChange={v => set("loanAmount")(v)} type="number" />
                        <EditField label="Preferred Tenure (years)" value={form.loanTenure || form.tenure} onChange={v => setForm((p: any) => ({ ...p, loanTenure: v, tenure: Number(v) }))} type="number" />
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-gray-500 uppercase tracking-wide font-bold">Calculated EMI (₹)</label>
                            <div className="border border-[#B8D4EE] bg-[#EBF4FF] rounded px-3 py-2 text-[15px] font-black text-[#004C8F]">
                                {fmtMoney(emi)} / month
                            </div>
                        </div>
                    </div>

                    {/* Loan type chips */}
                    <div className="border-t border-[#D0E4F5]">
                        <SectionHeader>Type of Loan Selected</SectionHeader>
                        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {["Personal", "Home", "Education", "Vehicle", "Business", "Medical", "Wedding", "Travel"].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setForm((p: any) => ({ ...p, loanPurpose: t.toLowerCase() }))}
                                    className={`border-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${(form.loanPurpose || "").toLowerCase() === t.toLowerCase() ? "border-[#004C8F] bg-[#EBF4FF] text-[#004C8F]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                                >
                                    {(form.loanPurpose || "").toLowerCase() === t.toLowerCase() && <span className="mr-1">✓</span>}
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* PART E: Documents */}
                <div className="bg-white rounded-2xl shadow border border-[#B8D4EE] overflow-hidden">
                    <SectionHeader>Part E — Documents Submitted</SectionHeader>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-bold text-[#004C8F] mb-3 uppercase tracking-wide">Identity & Address</p>
                            <div className="space-y-2">
                                {[
                                    { label: "PAN Card", docId: "pan" },
                                    { label: "Aadhaar / UID", docId: "aadhaar" },
                                    { label: "Proof of Address (Utility Bill)", docId: "utility" },
                                ].map(d => {
                                    const uploaded = form?.uploadedFiles?.find((f: any) => f.docId === d.docId)
                                    return (
                                        <div key={d.label} className="flex items-center justify-between border border-dashed border-[#B8D4EE] rounded-lg px-3 py-2">
                                            <span className="text-xs text-gray-700">{d.label}</span>
                                            <span className={`text-xs font-semibold ${uploaded?.verificationStatus === "verified" ? "text-green-600" : uploaded ? "text-blue-600" : "text-amber-600"}`}>
                                                {uploaded?.verificationStatus === "verified" ? "✅ Verified" : uploaded ? "📋 Uploaded" : "⏳ Pending"}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#004C8F] mb-3 uppercase tracking-wide">Income & Employment</p>
                            <div className="space-y-2">
                                {[
                                    { label: "Salary Slip (last 3 months)", docId: "salary-slip" },
                                    { label: "Bank Statement (6 months)", docId: "bank-statement" },
                                    { label: "Form 16 / IT Returns", docId: "form16" },
                                ].map(d => {
                                    const uploaded = form?.uploadedFiles?.find((f: any) => f.docId === d.docId)
                                    return (
                                        <div key={d.label} className="flex items-center justify-between border border-dashed border-[#B8D4EE] rounded-lg px-3 py-2">
                                            <span className="text-xs text-gray-700">{d.label}</span>
                                            <span className={`text-xs font-semibold ${uploaded?.verificationStatus === "verified" ? "text-green-600" : uploaded ? "text-blue-600" : "text-amber-600"}`}>
                                                {uploaded?.verificationStatus === "verified" ? "✅ Verified" : uploaded ? "📋 Uploaded" : "⏳ Pending"}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Declaration */}
                <div className="bg-white rounded-2xl shadow border border-[#B8D4EE] overflow-hidden">
                    <SectionHeader>Declaration by Applicant</SectionHeader>
                    <div className="p-5 space-y-3">
                        <div className="bg-[#FFF8EC] border border-amber-200 rounded-lg p-4">
                            <p className="text-xs text-gray-700 leading-relaxed">
                                I/We declare that we are citizens of India and all particulars given are true and complete.
                                I/We authorise HDFC Bank to make enquiries regarding our application with registered credit bureaus.
                            </p>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 accent-[#004C8F]" defaultChecked />
                            <span className="text-xs text-gray-700 font-medium">I agree and authorise HDFC Bank to process my application.</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 accent-[#004C8F]" defaultChecked />
                            <span className="text-xs text-gray-700 font-medium">I consent to receiving information via Central KYC Registry.</span>
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-2xl shadow border border-[#B8D4EE] p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span>256-bit SSL encrypted · Your data is safe with HDFC Bank</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => printApplication({ ...form, loanAmount, tenure, rate, emi, processingFee, refId, panNumber, aadhaarNumber })}
                                className="flex items-center justify-center gap-2 border-2 border-[#004C8F] text-[#004C8F] font-semibold px-6 py-3 rounded-xl hover:bg-[#EBF4FF] transition-colors text-sm"
                            >
                                <Download className="w-4 h-4" /> Download / Print PDF
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center justify-center gap-2 bg-[#E31837] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#B8102C] transition-colors text-sm shadow-lg shadow-red-200 disabled:opacity-70"
                            >
                                {submitting ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                                ) : (
                                    <><Send className="w-4 h-4" /> Submit Application to HDFC Bank</>
                                )}
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-4">
                        HDFC Bank will contact you at <strong>{form.phone || "your registered number"}</strong> within 2 business days.
                    </p>
                </div>
            </div>
        </div>
    )
}
