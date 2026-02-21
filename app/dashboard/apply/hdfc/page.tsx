"use client"

import { useEffect, useState, useRef } from "react"
import { useUser } from "@/lib/user-context"
import Link from "next/link"
import { ArrowLeft, Download, CheckCircle2, AlertCircle, Phone, Mail, MapPin, Briefcase, User } from "lucide-react"

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    education: "Education Loan",
    personal: "Personal Loan",
    business: "Business Loan",
    home: "Home Loan",
    car: "Car Loan",
    medical: "Medical Loan",
    wedding: "Wedding Loan",
    travel: "Travel Loan",
}

const empLabel: Record<string, string> = {
    salaried: "Salaried Employee",
    self_employed: "Self-Employed",
    freelancer: "Freelancer / Consultant",
    student: "Student",
    unemployed: "Currently Unemployed",
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className={`grid grid-cols-5 border-b border-[#c8d6e5] text-[12.5px] ${highlight ? "bg-[#eef4fc]" : ""}`}>
            <div className="col-span-2 py-2 px-3 font-semibold text-[#1a3a6c] border-r border-[#c8d6e5]">{label}</div>
            <div className="col-span-3 py-2 px-3 text-[#333] tracking-wide font-medium uppercase">
                {value || "—"}
            </div>
        </div>
    )
}

function SectionHeader({ title, icon }: { title: string; icon?: React.ReactNode }) {
    return (
        <div className="bg-[#1a3a6c] text-white px-4 py-2.5 flex items-center gap-2 mt-6 first:mt-0">
            {icon}
            <span className="text-sm font-bold tracking-widest uppercase">{title}</span>
        </div>
    )
}

function PartLabel({ part, title }: { part: string; title: string }) {
    return (
        <div className="flex items-start justify-between mb-6">
            <div>
                <h1 className="text-base font-bold text-[#1a3a6c] uppercase tracking-wide">{title}</h1>
                <p className="text-xs text-[#d41e29] font-semibold mt-0.5">FILL ALL THE FIELDS IN CAPITAL LETTERS</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="bg-[#1a3a6c] text-white text-xs font-bold px-3 py-1.5 rounded">
                    {part}
                </div>
                {/* HDFC Logo */}
                <div className="flex items-center gap-1">
                    <div className="w-8 h-8 bg-[#d41e29] rounded-sm flex items-center justify-center">
                        <span className="text-white text-[10px] font-black">H</span>
                    </div>
                    <div>
                        <div className="text-[#1a3a6c] text-xs font-black leading-none">HDFC</div>
                        <div className="text-[#1a3a6c] text-[10px] font-semibold leading-none">BANK</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function HDFCApplicationPage() {
    const { user, loading } = useUser()
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const printRef = useRef<HTMLDivElement>(null)
    const appId = `HDFC-AA-${Date.now().toString(36).toUpperCase()}`

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
                <div className="text-center text-red-600">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                    <p>Please log in to view your application.</p>
                </div>
            </div>
        )
    }

    const handleSubmitApplication = () => {
        setSubmitting(true)
        setTimeout(() => {
            setSubmitting(false)
            setSubmitted(true)
        }, 2000)
    }

    const handlePrint = () => {
        window.print()
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center border-t-4 border-[#1a3a6c]">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="flex justify-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-[#d41e29] rounded-sm flex items-center justify-center">
                                <span className="text-white text-sm font-black">H</span>
                            </div>
                            <div className="text-left">
                                <div className="text-[#1a3a6c] font-black leading-none">HDFC</div>
                                <div className="text-[#1a3a6c] text-sm font-semibold leading-none">BANK</div>
                            </div>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-[#1a3a6c] mb-2">Application Submitted!</h2>
                    <p className="text-gray-600 mb-4">Your HDFC Bank loan application has been received.</p>
                    <div className="bg-[#eef4fc] border border-[#c8d6e5] rounded-lg p-4 mb-6">
                        <p className="text-xs text-gray-500 mb-1">Application Reference Number</p>
                        <p className="text-xl font-bold text-[#1a3a6c] font-mono tracking-wider">{appId}</p>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                        <p>📧 Confirmation sent to your registered contact</p>
                        <p>📞 HDFC will call within <strong>2 business days</strong></p>
                        <p>⏱ Processing time: <strong>2–5 working days</strong></p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/dashboard"
                            className="flex-1 bg-[#1a3a6c] text-white py-3 rounded-lg font-semibold hover:bg-[#0d2447] transition-colors text-center"
                        >
                            Go to Dashboard
                        </Link>
                        <Link
                            href="/dashboard/timeline"
                            className="flex-1 bg-white border-2 border-[#1a3a6c] text-[#1a3a6c] py-3 rounded-lg font-semibold hover:bg-[#eef4fc] transition-colors text-center"
                        >
                            Track Application
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f0f4f8]">
            {/* ─── HDFC Top Header Bar ─── */}
            <div className="bg-[#1a3a6c] text-white print:hidden">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/dashboard/loans" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Loan Offers
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#d41e29] rounded-sm flex items-center justify-center">
                            <span className="text-white text-sm font-black">H</span>
                        </div>
                        <div>
                            <div className="text-white font-black text-sm leading-none">HDFC BANK</div>
                            <div className="text-white/60 text-xs leading-none">Loan Application Portal</div>
                        </div>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 text-sm text-white/80 hover:text-white border border-white/30 rounded px-3 py-1.5 hover:bg-white/10 transition-all"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Print / Save
                    </button>
                </div>
            </div>

            {/* ─── Progress indicator ─── */}
            <div className="bg-white border-b border-gray-200 print:hidden">
                <div className="max-w-5xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-green-700">Profile Verified</span>
                        </div>
                        <div className="w-8 h-0.5 bg-[#1a3a6c]" />
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-[#d41e29] rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">2</span>
                            </div>
                            <span className="text-xs font-semibold text-[#d41e29]">Review Application</span>
                        </div>
                        <div className="w-8 h-0.5 bg-gray-300" />
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-500 text-xs font-bold">3</span>
                            </div>
                            <span className="text-xs text-gray-400 font-medium">Submit</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Notice banner ─── */}
            <div className="max-w-5xl mx-auto px-4 pt-6 print:hidden">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800">Pre-filled from your ArthAstra profile</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                            All your details from onboarding have been carried forward. Review carefully before submitting — your application is ready in seconds!
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── APPLICATION FORM ─── */}
            <div ref={printRef} className="max-w-5xl mx-auto px-4 pb-10">
                <div className="bg-white shadow-lg border border-[#c8d6e5] rounded-sm">

                    {/* ─── PAGE 1: Personal Details ─── */}
                    <div className="p-6 border-b-4 border-[#1a3a6c]">
                        <PartLabel part="PART A  ①" title="Individual Housing and Mortgage Application Form" />

                        {/* Photo placeholder area */}
                        <div className="flex gap-4 mb-4">
                            <div className="w-28 h-36 border-2 border-dashed border-[#1a3a6c] flex items-center justify-center text-center p-2">
                                <div>
                                    <User className="w-8 h-8 text-[#1a3a6c] mx-auto mb-1" />
                                    <p className="text-[10px] text-[#1a3a6c] font-semibold">PASTE LATEST PASSPORT SIZE COLOUR PHOTOGRAPH WITH SIGNATURE</p>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="bg-[#eef4fc] border border-[#c8d6e5] rounded p-3 mb-3">
                                    <p className="text-xs text-[#1a3a6c] font-semibold uppercase mb-1">HDFC Bank Customer ID</p>
                                    <div className="grid grid-cols-12 gap-1">
                                        {Array(12).fill(0).map((_, i) => (
                                            <div key={i} className="h-6 border border-[#1a3a6c] text-center text-xs flex items-center justify-center font-mono">
                                                {i === 0 && "A"}{i === 1 && "A"}{i === 2 && "-"}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-[#fff3f3] border border-[#d41e29]/30 rounded p-2">
                                    <p className="text-[11px] text-[#d41e29] font-semibold uppercase flex items-center gap-1">
                                        <span>⚡</span> Application Pre-filled via ArthAstra AI
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Reference: {appId}</p>
                                </div>
                            </div>
                        </div>

                        <SectionHeader title="Personal Details" icon={<User className="w-4 h-4" />} />

                        <div className="border border-[#c8d6e5]">
                            <div className="grid grid-cols-5 bg-[#1a3a6c] text-white text-[11px] font-bold">
                                <div className="col-span-2 py-2 px-3 border-r border-[#2a5a9c]">FIELD</div>
                                <div className="col-span-3 py-2 px-3">APPLICANT (AUTO-FILLED)</div>
                            </div>
                            <InfoRow label="Full Name" value={user.name || "—"} />
                            <InfoRow label="Mobile No." value={user.phone || "—"} highlight />
                            <InfoRow label="Date of Birth / Age" value={user.age ? `${user.age} Years` : "—"} />
                            <InfoRow label="City / Town" value={user.city || "—"} highlight />
                            <InfoRow label="State / Union Territory" value={user.state || "—"} />
                            <InfoRow label="Preferred Language" value={({ en: "English", hi: "Hindi", mr: "Marathi", ta: "Tamil", bn: "Bengali" }[user.language || "en"] || "English")} highlight />
                            <InfoRow label="Occupation" value={empLabel[user.employmentType] || user.employmentType || "—"} />
                            <InfoRow label="Monthly Income" value={fmt(user.monthlyIncome)} highlight />
                        </div>
                    </div>

                    {/* ─── PAGE 2: Employment Details ─── */}
                    <div className="p-6 border-b-4 border-[#1a3a6c]">
                        <PartLabel part="PART B  ②" title="Employment and Business Details" />

                        <SectionHeader title="Employment Information" icon={<Briefcase className="w-4 h-4" />} />
                        <div className="border border-[#c8d6e5] mb-4">
                            <div className="grid grid-cols-5 bg-[#1a3a6c] text-white text-[11px] font-bold">
                                <div className="col-span-2 py-2 px-3 border-r border-[#2a5a9c]">FIELD</div>
                                <div className="col-span-3 py-2 px-3">APPLICANT DETAILS</div>
                            </div>
                            <InfoRow label="Employment Type" value={empLabel[user.employmentType] || user.employmentType || "—"} />
                            <InfoRow label="Employer / Company Name" value={user.companyName || "Not Provided"} highlight />
                            <InfoRow label="Employment Tenure" value={tenureLabel[user.employmentTenure] || user.employmentTenure || "—"} />
                            <InfoRow label="Monthly Income (Gross)" value={fmt(user.monthlyIncome)} highlight />
                            <InfoRow label="Existing Monthly EMI" value={fmt(user.existingEMI)} />
                            <InfoRow label="Monthly Expenses" value={fmt(user.monthlyExpenses)} highlight />
                            <InfoRow label="Savings / Investments (Range)" value={user.savingsRange?.replace("k", "K").replace("+", "+ Lakhs").replace("0-", "₹0 – ₹").replace("50k", "₹50K") || "—"} />
                        </div>

                        <SectionHeader title="Current Address" icon={<MapPin className="w-4 h-4" />} />
                        <div className="border border-[#c8d6e5]">
                            <div className="grid grid-cols-5 bg-[#1a3a6c] text-white text-[11px] font-bold">
                                <div className="col-span-2 py-2 px-3 border-r border-[#2a5a9c]">FIELD</div>
                                <div className="col-span-3 py-2 px-3">APPLICANT ADDRESS</div>
                            </div>
                            <InfoRow label="Town / City / Village" value={user.city || "—"} />
                            <InfoRow label="State / Union Territory" value={user.state || "—"} highlight />
                            <InfoRow label="Contact No." value={user.phone || "—"} />
                        </div>
                    </div>

                    {/* ─── PAGE 3: Loan Details ─── */}
                    <div className="p-6 border-b-4 border-[#1a3a6c]">
                        <PartLabel part="PART C  ③" title="Loan Requirement Details" />

                        <SectionHeader title="Loan Requested" />
                        <div className="border border-[#c8d6e5] mb-4">
                            <div className="grid grid-cols-5 bg-[#1a3a6c] text-white text-[11px] font-bold">
                                <div className="col-span-2 py-2 px-3 border-r border-[#2a5a9c]">FIELD</div>
                                <div className="col-span-3 py-2 px-3">DETAILS</div>
                            </div>
                            <InfoRow label="Purpose of Loan" value={purposeLabel[user.loanPurpose] || user.loanPurpose || "Personal Loan"} />
                            <InfoRow label="Loan Amount Requested (₹)" value={fmt(user.loanAmount)} highlight />
                            <InfoRow label="Preferred Loan Tenure (Years)" value={user.tenure ? `${user.tenure} Years` : "—"} />
                            <InfoRow label="Preferred Max EMI / Month" value={fmt(user.preferredEMI)} highlight />
                            <InfoRow label="Rate Option" value="Floating (linked to HRBLR)" />
                            <InfoRow label="Type of Loan" value={purposeLabel[user.loanPurpose] || "Personal Loan"} highlight />
                        </div>

                        <SectionHeader title="Financial Information" />
                        <div className="border border-[#c8d6e5] mb-4">
                            <div className="grid grid-cols-5 bg-[#1a3a6c] text-white text-[11px] font-bold">
                                <div className="col-span-2 py-2 px-3 border-r border-[#2a5a9c]">PARTICULARS</div>
                                <div className="col-span-3 py-2 px-3">APPLICANT (₹)</div>
                            </div>
                            <InfoRow label="Savings in Bank" value={user.savingsRange || "—"} />
                            <InfoRow label="Monthly Income" value={fmt(user.monthlyIncome)} highlight />
                            <InfoRow label="Existing Liabilities (EMI)" value={fmt(user.existingEMI)} />
                            <InfoRow label="Monthly Living Expenses" value={fmt(user.monthlyExpenses)} highlight />
                            <InfoRow label="Net Disposable Income" value={
                                user.monthlyIncome
                                    ? fmt(user.monthlyIncome - (user.existingEMI || 0) - (user.monthlyExpenses || 0))
                                    : "—"
                            } />
                        </div>

                        <SectionHeader title="Credit Information" />
                        <div className="border border-[#c8d6e5]">
                            <div className="grid grid-cols-5 bg-[#1a3a6c] text-white text-[11px] font-bold">
                                <div className="col-span-2 py-2 px-3 border-r border-[#2a5a9c]">FIELD</div>
                                <div className="col-span-3 py-2 px-3">DETAILS</div>
                            </div>
                            <InfoRow label="Does Applicant have Credit History?" value={user.hasCreditHistory ? "Yes" : "No"} />
                            <InfoRow label="CIBIL / Credit Score (Approximate)" value={user.creditScore ? `${user.creditScore}` : "Not Provided"} highlight />
                            <InfoRow label="Credit Score Band" value={
                                !user.creditScore ? "—" :
                                    user.creditScore >= 750 ? "Excellent (750+)" :
                                        user.creditScore >= 700 ? "Good (700–749)" :
                                            user.creditScore >= 650 ? "Fair (650–699)" : "Below Average (<650)"
                            } />
                        </div>
                    </div>

                    {/* ─── PAGE 4: Declaration ─── */}
                    <div className="p-6">
                        <PartLabel part="PART D  ④" title="Declaration and Signature" />

                        <div className="bg-[#f9f9f9] border border-[#c8d6e5] rounded p-4 mb-5">
                            <h4 className="text-[11px] font-bold text-[#1a3a6c] uppercase mb-3 tracking-wider">Declaration</h4>
                            <ol className="space-y-1.5 text-[11px] text-gray-700 list-decimal pl-4">
                                <li>I/We declare that I/We am/are citizens of India and all the particulars and information given in the application form is true, correct and complete.</li>
                                <li>I/We confirm that the funds shall be used for the stated purpose and shall not be used for speculative or anti-social purposes.</li>
                                <li>I/We declare that I/We have not been in violation and shall not violate any provisions of the Prevention of Money Laundering Act, 2002.</li>
                                <li>I/We authorise HDFC Bank to make any enquiries regarding my/our application, including with other finance companies/registered credit bureau.</li>
                                <li>HDFC Bank reserves the right to retain the photographs and documents submitted and will not return the same to the applicant/s.</li>
                                <li>I/We authorise HDFC Bank to conduct such credit checks as it considers necessary for the purpose of credit appraisal/sharing.</li>
                                <li>I/We understand that there are no insolvency proceedings initiated/pending against me/us nor have I/we ever been adjudicated insolvent.</li>
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

                        <div className="mt-5 grid grid-cols-2 gap-4 text-[11px]">
                            <div className="bg-[#eef4fc] border border-[#c8d6e5] rounded p-3">
                                <p className="text-[#1a3a6c] font-bold mb-1">Date:</p>
                                <p className="text-gray-700 font-mono">
                                    {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                </p>
                            </div>
                            <div className="bg-[#eef4fc] border border-[#c8d6e5] rounded p-3">
                                <p className="text-[#1a3a6c] font-bold mb-1">Place:</p>
                                <p className="text-gray-700">{user.city || "—"}</p>
                            </div>
                        </div>

                        <p className="text-center text-[10px] text-gray-500 mt-4 border-t pt-3">
                            Do not Sign this Form if it is Blank. Please ensure all relevant sections and documents are completely filled to your satisfaction and then only sign the form.
                        </p>
                    </div>
                </div>

                {/* ─── Action buttons ─── */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4 print:hidden">
                    <Link
                        href="/dashboard/loans"
                        className="flex items-center justify-center gap-2 flex-1 border-2 border-[#1a3a6c] text-[#1a3a6c] py-3.5 rounded-xl font-semibold hover:bg-[#eef4fc] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Offers
                    </Link>
                    <button
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-2 flex-1 border-2 border-gray-300 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download / Print
                    </button>
                    <button
                        onClick={handleSubmitApplication}
                        disabled={submitting}
                        className="flex items-center justify-center gap-2 flex-2 min-w-[220px] bg-[#d41e29] hover:bg-[#b01520] text-white py-3.5 px-8 rounded-xl font-bold text-base shadow-xl shadow-[#d41e29]/30 transition-all disabled:opacity-60"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Submit Application to HDFC Bank
                            </>
                        )}
                    </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-3 print:hidden">
                    Your data is secure. HDFC Bank will contact you at <strong>{user.phone}</strong> within 2 business days.
                </p>
            </div>
        </div>
    )
}
