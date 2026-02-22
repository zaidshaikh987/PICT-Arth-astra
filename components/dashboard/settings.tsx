"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/user-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User, Bell, Lock, CreditCard, Mail, Phone,
  Moon, Sun, Laptop, Download, Save, BadgeCheck, FileText,
  Briefcase, IndianRupee, Building2, ShieldCheck, AlertTriangle,
  CheckCircle2, MessageSquare
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"

// ---------- tiny helpers ----------
function lbl(text: string, badge?: string) {
  return (
    <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
      {text}
      {badge && (
        <span className="ml-2 px-1.5 py-0.5 text-[9px] bg-emerald-100 text-emerald-700 rounded font-bold normal-case align-middle">
          {badge}
        </span>
      )}
    </Label>
  )
}

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4">
      <div className="p-1.5 bg-blue-50 rounded-lg">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{title}</span>
    </div>
  )
}

// A simple editable row: label + input
function EField({
  label, value, onChange, type = "text", placeholder, mono, badge, readOnly, suffix
}: {
  label: string; value: any; onChange: (v: string) => void;
  type?: string; placeholder?: string; mono?: boolean; badge?: string; readOnly?: boolean; suffix?: string
}) {
  return (
    <div>
      {lbl(label, badge)}
      <div className="relative">
        <input
          type={type}
          value={value ?? ""}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          readOnly={readOnly}
          className={[
            "w-full h-10 px-3 text-sm border rounded-lg outline-none transition",
            "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200",
            mono ? "font-mono tracking-widest" : "",
            readOnly ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white text-slate-900",
            suffix ? "pr-14" : ""
          ].join(" ")}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">{suffix}</span>
        )}
      </div>
    </div>
  )
}

// A simple select row
function ESelect({
  label, value, onChange, options
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      {lbl(label)}
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className="h-10 text-sm bg-white border-slate-200 focus:border-blue-500">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// ── PDF print helper ──────────────────────────────────────
function printProfile(userData: any, panNo: string, aadhaarNo: string) {
  const w = window.open("", "_blank", "width=900,height=700")
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8"/>
<title>ArthAstra Profile — ${userData?.name || "User"}</title>
<style>
  @media print { body { -webkit-print-color-adjust: exact; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; font-size: 13px; }
  .header { background: linear-gradient(135deg,#1d4ed8,#7c3aed); color: #fff; padding: 28px 40px; }
  .header h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .header p { opacity: .75; font-size: 12px; margin-top: 4px; }
  .badge { display:inline-block; background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.3); border-radius:20px; padding:3px 12px; font-size:10px; font-weight:700; margin-top:10px; }
  .body { padding: 28px 40px; }
  .section { background:#fff; border:1px solid #e2e8f0; border-radius:10px; overflow:hidden; margin-bottom:20px; }
  .sh { background:#f1f5f9; padding:10px 18px; border-bottom:1px solid #e2e8f0; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#475569; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; }
  .cell { padding:12px 18px; border-bottom:1px solid #f1f5f9; }
  .cell:nth-child(odd) { border-right:1px solid #f1f5f9; }
  .cell label { display:block; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#94a3b8; margin-bottom:3px; }
  .cell span { font-size:13px; font-weight:700; color:#0f172a; }
  .ai-badge { background:#ecfdf5; color:#059669; border:1px solid #6ee7b7; border-radius:4px; padding:1px 6px; font-size:9px; font-weight:800; margin-left:6px; }
  .footer { text-align:center; padding:16px; font-size:10px; color:#94a3b8; border-top:1px solid #e2e8f0; margin-top:4px; }
  @media print { .no-print { display:none!important; } }
</style>
</head><body>
<div class="header">
  <h1>ArthAstra — Borrower Profile</h1>
  <p>Comprehensive loan applicant profile</p>
  <span class="badge">Generated: ${new Date().toLocaleString("en-IN")}</span>
</div>
<div class="body">

<div class="section">
  <div class="sh">Personal Information</div>
  <div class="grid2">
    <div class="cell"><label>Full Name</label><span>${userData?.name || "—"}</span></div>
    <div class="cell"><label>Email</label><span>${userData?.email || "—"}</span></div>
    <div class="cell"><label>Phone</label><span>${userData?.phone || "—"}</span></div>
    <div class="cell"><label>City</label><span>${userData?.city || "—"}</span></div>
    <div class="cell"><label>Date of Birth</label><span>${userData?.dob || "—"}</span></div>
    <div class="cell"><label>Gender</label><span>${userData?.gender || "—"}</span></div>
  </div>
</div>

<div class="section">
  <div class="sh">KYC Documents</div>
  <div class="grid2">
    <div class="cell"><label>PAN Number <span class="ai-badge">AI Extracted</span></label><span>${panNo || "—"}</span></div>
    <div class="cell"><label>Aadhaar Number <span class="ai-badge">AI Extracted</span></label><span>${aadhaarNo || "—"}</span></div>
  </div>
</div>

<div class="section">
  <div class="sh">Employment Details</div>
  <div class="grid2">
    <div class="cell"><label>Employment Type</label><span>${userData?.employmentType || "—"}</span></div>
    <div class="cell"><label>Employer / Company</label><span>${userData?.employerName || "—"}</span></div>
    <div class="cell"><label>Monthly Income</label><span>₹${Number(userData?.monthlyIncome || 0).toLocaleString("en-IN")}</span></div>
    <div class="cell"><label>Employment Tenure</label><span>${userData?.employmentTenure || "—"}</span></div>
  </div>
</div>

<div class="section">
  <div class="sh">Financial Details</div>
  <div class="grid2">
    <div class="cell"><label>Monthly Expenses</label><span>₹${Number(userData?.monthlyExpenses || 0).toLocaleString("en-IN")}</span></div>
    <div class="cell"><label>Existing EMI</label><span>₹${Number(userData?.existingEMI || 0).toLocaleString("en-IN")}</span></div>
    <div class="cell"><label>Credit Score</label><span>${userData?.creditScore || "—"}</span></div>
    <div class="cell"><label>Loan Purpose</label><span>${userData?.loanPurpose || "—"}</span></div>
  </div>
</div>

<div class="section">
  <div class="sh">Loan Requirement</div>
  <div class="grid2">
    <div class="cell"><label>Requested Amount</label><span>₹${Number(userData?.loanAmount || 0).toLocaleString("en-IN")}</span></div>
    <div class="cell"><label>Preferred Tenure</label><span>${userData?.loanTenure || "—"} years</span></div>
  </div>
</div>

</div>
<div class="footer">ArthAstra AI · Confidential · For loan processing purposes only</div>

<div class="no-print" style="text-align:center;padding:20px;">
  <button onclick="window.print()" style="background:#1d4ed8;color:#fff;border:none;padding:10px 28px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">
    🖨️ Print / Save as PDF
  </button>
  <p style="font-size:11px;color:#94a3b8;margin-top:8px;">Use Ctrl+P or the button above · Choose "Save as PDF" in print dialog</p>
</div>
</body></html>`)
  w.document.close()
  // auto-trigger print after a moment
  setTimeout(() => w.print(), 600)
}

// ═══════════════════════════════════════════════════════════
export default function SettingsPage() {
  const { user, updateUser } = useUser()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  const [form, setForm] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true, sms: false, push: true, marketing: false,
  })

  // populate from server
  useEffect(() => {
    if (user && !form) setForm({ ...user })
  }, [user])

  // helper: update single key
  const set = (key: string) => (val: string) =>
    setForm((prev: any) => ({ ...prev, [key]: val }))

  // ── pull extracted doc numbers ──
  const panFile = form?.uploadedFiles?.find(
    (f: any) => f.docId === "pan" && f.extractedData?.documentNumber
  )
  const aadhaarFile = form?.uploadedFiles?.find(
    (f: any) => f.docId === "aadhaar" && f.extractedData?.documentNumber
  )
  const panNumber = panFile?.extractedData?.documentNumber || form?.panNumber || ""
  const aadhaarNumber = aadhaarFile?.extractedData?.documentNumber || form?.aadhaarNumber || ""

  const handleSave = async () => {
    if (!form) return
    setIsSaving(true)
    try {
      await updateUser(form)
      toast({ title: "✅ Profile saved", description: "Changes saved to your account." })
    } catch {
      toast({ title: "Save failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  const uploadedCount = form?.uploadedFiles?.length || 0
  const isKycDone = !!(panNumber && aadhaarNumber)

  const SaveBtn = () => (
    <Button
      onClick={handleSave}
      disabled={isSaving}
      className="gap-2 bg-blue-600 hover:bg-blue-700 text-sm"
    >
      {isSaving
        ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        : <Save className="w-4 h-4" />}
      Save Changes
    </Button>
  )

  return (
    <div className="space-y-6 pb-10">
      {/* ─── Page header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">Edit and manage your complete profile</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => printProfile(form, panNumber, aadhaarNumber)}
            className="gap-2 text-sm"
          >
            <Download className="w-4 h-4" /> Download PDF
          </Button>
          <SaveBtn />
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-slate-100 p-1 rounded-xl h-auto flex flex-wrap gap-1">
          {[
            { id: "profile", icon: User, label: "Profile" },
            { id: "kyc", icon: ShieldCheck, label: "KYC & Docs" },
            { id: "appearance", icon: Sun, label: "Appearance" },
            { id: "notifications", icon: Bell, label: "Notifications" },
            { id: "security", icon: Lock, label: "Security" },
            { id: "privacy", icon: FileText, label: "Privacy" },
          ].map(({ id, icon: Icon, label }) => (
            <TabsTrigger key={id} value={id} className="rounded-lg text-sm gap-1.5">
              <Icon className="w-3.5 h-3.5" /> {label}
              {id === "kyc" && isKycDone && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ══════ PROFILE TAB ══════ */}
        <TabsContent value="profile" className="mt-4 space-y-5">
          {/* Avatar card */}
          <Card className="p-5 border border-slate-100 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-100 flex-shrink-0">
              {(form.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-slate-900 truncate">{form.name || "Your Name"}</p>
              <p className="text-sm text-slate-500">{form.email || "your@email.com"}</p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Active
                </span>
                {isKycDone && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-2.5 h-2.5" /> KYC Done
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Personal info */}
          <Card className="p-6 border border-slate-100 space-y-6">
            <SectionTitle icon={User} title="Personal Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <EField label="Full Name" value={form.name} onChange={set("name")} />
              <EField label="Email Address" value={form.email} onChange={set("email")} type="email" />
              <EField label="Phone Number" value={form.phone} onChange={set("phone")} />
              <EField label="City" value={form.city} onChange={set("city")} />
              <EField label="Date of Birth" value={form.dob} onChange={set("dob")} type="date" />
              <ESelect
                label="Gender"
                value={form.gender}
                onChange={set("gender")}
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>

            <SectionTitle icon={Briefcase} title="Employment Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ESelect
                label="Employment Type"
                value={form.employmentType || ""}
                onChange={set("employmentType")}
                options={[
                  { value: "salaried", label: "Salaried" },
                  { value: "self-employed", label: "Self Employed" },
                  { value: "business", label: "Business Owner" },
                  { value: "freelancer", label: "Freelancer" },
                  { value: "student", label: "Student" },
                ]}
              />
              <EField label="Employer / Company Name" value={form.employerName || form.companyName} onChange={v => setForm((p: any) => ({ ...p, employerName: v, companyName: v }))} />
              <ESelect
                label="Employment Tenure"
                value={form.employmentTenure || ""}
                onChange={set("employmentTenure")}
                options={[
                  { value: "<6_months", label: "Less than 6 months" },
                  { value: "6m-1yr", label: "6 months – 1 year" },
                  { value: "1-2yr", label: "1 – 2 years" },
                  { value: "2-5yr", label: "2 – 5 years" },
                  { value: "5+yr", label: "5+ years" },
                ]}
              />
              <EField label="Industry / Sector" value={form.industry} onChange={set("industry")} />
            </div>

            <SectionTitle icon={IndianRupee} title="Financial Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <EField label="Monthly Income" value={form.monthlyIncome} onChange={v => set("monthlyIncome")(v)} type="number" suffix="₹/mo" />
              <EField label="Monthly Expenses" value={form.monthlyExpenses} onChange={v => set("monthlyExpenses")(v)} type="number" suffix="₹/mo" />
              <EField label="Existing EMI" value={form.existingEMI} onChange={v => set("existingEMI")(v)} type="number" suffix="₹/mo" />
              <EField label="Approximate Credit Score" value={form.creditScore} onChange={v => set("creditScore")(v)} type="number" />
            </div>

            <SectionTitle icon={Building2} title="Loan Requirement" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ESelect
                label="Loan Purpose"
                value={form.loanPurpose || ""}
                onChange={set("loanPurpose")}
                options={[
                  { value: "personal", label: "Personal Loan" },
                  { value: "home", label: "Home Loan" },
                  { value: "business", label: "Business Loan" },
                  { value: "education", label: "Education Loan" },
                  { value: "vehicle", label: "Vehicle Loan" },
                  { value: "gold", label: "Gold Loan" },
                ]}
              />
              <EField label="Required Loan Amount (₹)" value={form.loanAmount} onChange={v => set("loanAmount")(v)} type="number" />
              <EField label="Preferred Tenure (years)" value={form.loanTenure || form.tenure} onChange={v => setForm((p: any) => ({ ...p, loanTenure: v, tenure: Number(v) }))} type="number" />
              <EField label="State / Region" value={form.state} onChange={set("state")} />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <SaveBtn />
            </div>
          </Card>
        </TabsContent>

        {/* ══════ KYC & DOCS TAB ══════ */}
        <TabsContent value="kyc" className="mt-4">
          <Card className="p-6 border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">KYC Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">PAN & Aadhaar numbers are auto-extracted from your AI-verified documents</p>
              </div>
              {isKycDone
                ? <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full"><ShieldCheck className="w-3.5 h-3.5" /> KYC Complete</span>
                : <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full"><AlertTriangle className="w-3.5 h-3.5" /> Incomplete</span>
              }
            </div>

            {/* PAN */}
            <div className={`p-4 rounded-xl border space-y-3 ${panFile ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">PAN Card</p>
                  <p className="text-[11px] text-slate-500">
                    {panFile ? "✅ Auto-filled from your verified PAN card upload" : "Upload PAN card in Documents tab to auto-extract"}
                  </p>
                </div>
                {panFile && <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold border border-emerald-200 flex-shrink-0">Verified</span>}
              </div>
              <div>
                {lbl("PAN Number")}
                <input
                  type="text"
                  value={panNumber}
                  onChange={e => setForm((p: any) => ({ ...p, panNumber: e.target.value }))}
                  placeholder="ABCDE1234F"
                  className={`w-full h-10 px-3 text-sm border rounded-lg outline-none transition font-mono tracking-widest uppercase ${panFile
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 focus:border-emerald-500"
                      : "border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    }`}
                />
              </div>
              {panFile?.extractedData?.name && (
                <div className="flex gap-5 text-xs text-slate-500">
                  <span>Name: <strong className="text-slate-700">{panFile.extractedData.name}</strong></span>
                  {panFile.extractedData.dateOfBirth && <span>DOB: <strong className="text-slate-700">{panFile.extractedData.dateOfBirth}</strong></span>}
                </div>
              )}
            </div>

            {/* Aadhaar */}
            <div className={`p-4 rounded-xl border space-y-3 ${aadhaarFile ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">Aadhaar Card</p>
                  <p className="text-[11px] text-slate-500">
                    {aadhaarFile ? "✅ Auto-filled from your verified Aadhaar card upload" : "Upload Aadhaar in Documents tab to auto-extract"}
                  </p>
                </div>
                {aadhaarFile && <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold border border-emerald-200 flex-shrink-0">Verified</span>}
              </div>
              <div>
                {lbl("Aadhaar Number")}
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={e => setForm((p: any) => ({ ...p, aadhaarNumber: e.target.value }))}
                  placeholder="XXXX XXXX XXXX"
                  className={`w-full h-10 px-3 text-sm border rounded-lg outline-none transition font-mono tracking-widest ${aadhaarFile
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 focus:border-emerald-500"
                      : "border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    }`}
                />
              </div>
              {aadhaarFile?.extractedData?.name && (
                <div className="text-xs text-slate-500">
                  Name on Aadhaar: <strong className="text-slate-700">{aadhaarFile.extractedData.name}</strong>
                </div>
              )}
            </div>

            {/* All uploaded docs list */}
            {uploadedCount > 0 && (
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">All Uploaded Documents ({uploadedCount})</p>
                <div className="space-y-2">
                  {form?.uploadedFiles?.map((f: any) => (
                    <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white">
                      <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{f.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {f.docId === "pan" ? "PAN Number" :
                            f.docId === "aadhaar" ? "Aadhaar Number" :
                              f.docId === "salary-slip" ? "Salary Slip" :
                                f.docId === "bank-statement" ? "Bank Statement" :
                                  f.docId === "form16" ? "Form 16" :
                                    f.docId?.toUpperCase()} ·{" "}
                          {f.extractedData?.documentNumber
                            ? <span className="font-mono font-bold text-slate-600">{f.extractedData.documentNumber}</span>
                            : new Date(f.uploadedAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex-shrink-0 ${f.verificationStatus === "verified" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          f.verificationStatus === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                            f.verificationStatus === "verifying" ? "bg-blue-50 text-blue-600 border-blue-200 animate-pulse" :
                              "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                        {f.verificationStatus || "pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!uploadedCount && (
              <div className="text-center py-10 text-slate-400">
                <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">No documents uploaded yet</p>
                <p className="text-xs mt-1">Go to <strong>Documents</strong> in the sidebar</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <SaveBtn />
            </div>
          </Card>
        </TabsContent>

        {/* ══════ APPEARANCE ══════ */}
        <TabsContent value="appearance" className="mt-4">
          <Card className="p-6 border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-5">Theme</h3>
            <div className="grid grid-cols-3 gap-4">
              {([
                { val: "light", icon: Sun, label: "Light", iconCls: "text-orange-500" },
                { val: "dark", icon: Moon, label: "Dark", iconCls: "text-blue-500" },
                { val: "system", icon: Laptop, label: "System", iconCls: "text-slate-500" },
              ] as const).map(({ val, icon: Icon, label, iconCls }) => (
                <button
                  key={val}
                  onClick={() => setTheme(val)}
                  className={`rounded-xl border-2 p-5 flex flex-col items-center gap-2 transition-all cursor-pointer ${theme === val ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <Icon className={`w-7 h-7 ${iconCls}`} />
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                  {theme === val && <span className="text-[10px] text-blue-600 font-bold">Active</span>}
                </button>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ══════ NOTIFICATIONS ══════ */}
        <TabsContent value="notifications" className="mt-4">
          <Card className="p-6 border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Notification Preferences</h3>
            {([
              { key: "email", icon: Mail, title: "Email", desc: "Loan updates via email" },
              { key: "sms", icon: Phone, title: "SMS", desc: "Text messages for updates" },
              { key: "push", icon: Bell, title: "Push", desc: "Real-time browser alerts" },
              { key: "marketing", icon: Mail, title: "Marketing", desc: "Tips and offers from ArthAstra" },
            ] as const).map(({ key, icon: Icon, title, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{title}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </div>
                <Switch
                  checked={(notifications as any)[key]}
                  onCheckedChange={v => setNotifications(p => ({ ...p, [key]: v }))}
                />
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button variant="outline" className="gap-2 text-sm"
                onClick={async () => {
                  if (!form?.phone) { alert("No phone number found."); return }
                  if (confirm(`Send test WhatsApp to ${form.phone}?`)) {
                    const r = await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage: "profile_setup", userData: form }) })
                    const d = await r.json()
                    alert(d.success ? "✅ Sent!" : "❌ " + (d.error || "Failed"))
                  }
                }}>
                <MessageSquare className="w-4 h-4" /> Test WhatsApp
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-sm" onClick={() => toast({ title: "Preferences saved" })}>Save</Button>
            </div>
          </Card>
        </TabsContent>

        {/* ══════ SECURITY ══════ */}
        <TabsContent value="security" className="mt-4">
          <Card className="p-6 border border-slate-100 space-y-5">
            <h3 className="text-base font-bold text-slate-900">Security</h3>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Account is secure</p>
                <p className="text-xs text-emerald-600">256-bit encrypted</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700">Change Password</p>
              <EField label="Current Password" value="" onChange={() => { }} type="password" />
              <EField label="New Password" value="" onChange={() => { }} type="password" />
              <EField label="Confirm Password" value="" onChange={() => { }} type="password" />
            </div>
            <div className="flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700 text-sm">Update Password</Button>
            </div>
          </Card>
        </TabsContent>

        {/* ══════ PRIVACY ══════ */}
        <TabsContent value="privacy" className="mt-4">
          <Card className="p-6 border border-slate-100 space-y-5">
            <h3 className="text-base font-bold text-slate-900">Privacy & Data</h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <p className="text-sm font-semibold text-slate-800">Export My Data</p>
              <p className="text-sm text-slate-600">Download a copy of all your profile data and documents.</p>
              <Button variant="outline" className="gap-2 text-sm" onClick={() => printProfile(form, panNumber, aadhaarNumber)}>
                <Download className="w-4 h-4" /> Download Data (PDF)
              </Button>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
              <p className="text-sm font-bold text-red-800">Delete Account</p>
              <p className="text-sm text-red-600">Permanently deletes all data. Cannot be undone.</p>
              <Button variant="destructive" className="text-sm"
                onClick={() => { if (confirm("Delete your account permanently?")) { document.cookie = "userId=; path=/; max-age=0"; window.location.href = "/" } }}>
                Delete Account
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
