"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@/lib/user-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User, Bell, Lock, CreditCard, Mail, Phone, MapPin, MessageSquare,
  Moon, Sun, Laptop, Download, Save, BadgeCheck, FileText,
  Briefcase, IndianRupee, Building2, ShieldCheck, AlertTriangle,
  Edit3, CheckCircle2, ChevronRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"

// ─── Section Wrapper ──────────────────────────────────────
function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div className="p-1.5 bg-blue-50 rounded-lg">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">{title}</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {children}
      </div>
    </div>
  )
}

// ─── Field ────────────────────────────────────────────────
function Field({
  label, id, value, onChange, type = "text", placeholder, readOnly, badge, suffix
}: {
  label: string; id: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; readOnly?: boolean; badge?: string; suffix?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
        {badge && (
          <span className="ml-2 px-1.5 py-0.5 text-[9px] bg-emerald-100 text-emerald-700 rounded font-bold normal-case">
            {badge}
          </span>
        )}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || `Enter ${label}`}
          readOnly={readOnly}
          className={`h-10 text-sm ${readOnly ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "bg-white"} ${suffix ? "pr-12" : ""}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{suffix}</span>
        )}
      </div>
    </div>
  )
}

// ─── Select Field ─────────────────────────────────────────
function SelectField({
  label, id, value, onChange, options
}: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</Label>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-10 text-sm bg-white">
          <SelectValue placeholder={`Select ${label}`} />
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

// ─── PDF Generator ─────────────────────────────────────────
function generateProfilePDF(userData: any) {
  const panFile = userData?.uploadedFiles?.find((f: any) => f.docId === "pan")
  const aadhaarFile = userData?.uploadedFiles?.find((f: any) => f.docId === "aadhaar")
  const panNo = panFile?.extractedData?.documentNumber || "Not extracted"
  const aadhaarNo = aadhaarFile?.extractedData?.documentNumber || "Not extracted"

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; color: #1e293b; background: #f8fafc; }
  .header { background: linear-gradient(135deg, #1d4ed8, #7c3aed); color: white; padding: 32px 40px; }
  .header h1 { margin: 0 0 4px; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
  .header p { margin: 0; opacity: 0.8; font-size: 13px; }
  .badge { display: inline-block; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 600; margin-top: 12px; }
  .body { padding: 32px 40px; }
  .section { margin-bottom: 28px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
  .section-header { background: #f1f5f9; padding: 12px 20px; border-bottom: 1px solid #e2e8f0; }
  .section-header h2 { margin: 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #475569; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
  .field { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
  .field:nth-child(odd) { border-right: 1px solid #f1f5f9; }
  .field label { display: block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 4px; }
  .field span { font-size: 14px; font-weight: 600; color: #0f172a; }
  .doc-badge { display: inline-block; background: #ecfdf5; color: #059669; border: 1px solid #6ee7b7; border-radius: 4px; padding: 2px 8px; font-size: 10px; font-weight: 700; margin-left: 8px; }
  .footer { text-align: center; padding: 20px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="header">
  <h1>ArthAstra — User Profile</h1>
  <p>Comprehensive loan applicant profile</p>
  <span class="badge">Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
</div>
<div class="body">

  <div class="section">
    <div class="section-header"><h2>Personal Information</h2></div>
    <div class="grid">
      <div class="field"><label>Full Name</label><span>${userData?.name || "—"}</span></div>
      <div class="field"><label>Email Address</label><span>${userData?.email || "—"}</span></div>
      <div class="field"><label>Phone Number</label><span>${userData?.phone || "—"}</span></div>
      <div class="field"><label>City</label><span>${userData?.city || "—"}</span></div>
      <div class="field"><label>Date of Birth</label><span>${userData?.dob || "—"}</span></div>
      <div class="field"><label>Gender</label><span>${userData?.gender || "—"}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-header"><h2>KYC Documents</h2></div>
    <div class="grid">
      <div class="field"><label>PAN Number <span class="doc-badge">AI Extracted</span></label><span>${panNo}</span></div>
      <div class="field"><label>Aadhaar Number <span class="doc-badge">AI Extracted</span></label><span>${aadhaarNo}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-header"><h2>Employment & Income</h2></div>
    <div class="grid">
      <div class="field"><label>Employment Type</label><span>${userData?.employmentType || "—"}</span></div>
      <div class="field"><label>Employer Name</label><span>${userData?.employerName || "—"}</span></div>
      <div class="field"><label>Monthly Income</label><span>₹${Number(userData?.monthlyIncome || 0).toLocaleString("en-IN")}</span></div>
      <div class="field"><label>Existing EMI</label><span>₹${Number(userData?.existingEMI || 0).toLocaleString("en-IN")}</span></div>
      <div class="field"><label>Monthly Expenses</label><span>₹${Number(userData?.monthlyExpenses || 0).toLocaleString("en-IN")}</span></div>
      <div class="field"><label>Employment Tenure</label><span>${userData?.employmentTenure || "—"}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-header"><h2>Loan Requirements</h2></div>
    <div class="grid">
      <div class="field"><label>Loan Purpose</label><span>${userData?.loanPurpose || "—"}</span></div>
      <div class="field"><label>Required Amount</label><span>₹${Number(userData?.loanAmount || 0).toLocaleString("en-IN")}</span></div>
      <div class="field"><label>Preferred Tenure</label><span>${userData?.loanTenure || "—"} years</span></div>
      <div class="field"><label>Credit Score</label><span>${userData?.creditScore || "Not checked"}</span></div>
    </div>
  </div>

</div>
<div class="footer">Generated by ArthAstra AI · Confidential · For loan processing purposes only</div>
</body>
</html>`

  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `ArthAstra-Profile-${(userData?.name || "User").replace(/\s+/g, "-")}.html`
  a.click()
  URL.revokeObjectURL(url)
}


export default function SettingsPage() {
  const [userData, setUserData] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true, sms: false, push: true, marketing: false,
  })
  const { toast } = useToast()
  const { user, updateUser } = useUser()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (user) setUserData({ ...user })
  }, [user])

  // ── Extract PAN/Aadhaar from verified uploaded files ──
  const panFile = userData?.uploadedFiles?.find((f: any) => f.docId === "pan" && f.extractedData?.documentNumber)
  const aadhaarFile = userData?.uploadedFiles?.find((f: any) => f.docId === "aadhaar" && f.extractedData?.documentNumber)
  const panNumber = panFile?.extractedData?.documentNumber || userData?.panNumber || ""
  const aadhaarNumber = aadhaarFile?.extractedData?.documentNumber || userData?.aadhaarNumber || ""

  const handleSave = async () => {
    if (!userData) return
    setIsSaving(true)
    try {
      await updateUser(userData)
      toast({ title: "✅ Profile saved", description: "Your profile has been updated successfully." })
    } catch {
      toast({ title: "Save failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const set = (key: string) => (val: string) => setUserData((prev: any) => ({ ...prev, [key]: val }))

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  const uploadedCount = userData?.uploadedFiles?.length || 0
  const isKycDone = !!(panNumber && aadhaarNumber)

  return (
    <div className="space-y-6 pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your personal, financial and KYC information</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => generateProfilePDF(userData)}
            className="gap-2 text-sm border-slate-200 hover:bg-slate-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Download PDF
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-sm"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl h-auto flex-wrap gap-1">
          <TabsTrigger value="profile" className="rounded-lg text-sm">
            <User className="w-3.5 h-3.5 mr-1.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="kyc" className="rounded-lg text-sm">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> KYC & Documents
            {isKycDone && <CheckCircle2 className="w-3 h-3 ml-1.5 text-emerald-500" />}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg text-sm">
            <Sun className="w-3.5 h-3.5 mr-1.5" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg text-sm">
            <Bell className="w-3.5 h-3.5 mr-1.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg text-sm">
            <Lock className="w-3.5 h-3.5 mr-1.5" /> Security
          </TabsTrigger>
          <TabsTrigger value="privacy" className="rounded-lg text-sm">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Privacy
          </TabsTrigger>
        </TabsList>

        {/* ════════════ PROFILE TAB ════════════ */}
        <TabsContent value="profile" className="space-y-6 mt-0">
          {/* Avatar Card */}
          <Card className="p-6 border border-slate-100">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-200 flex-shrink-0">
                {(userData.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-slate-900 truncate">{userData.name || "Your Name"}</h2>
                <p className="text-sm text-slate-500">{userData.email || "your@email.com"}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Profile Active
                  </span>
                  <span className="text-xs text-slate-400">{uploadedCount} documents uploaded</span>
                  {isKycDone && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> KYC Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Personal Info */}
          <Card className="p-6 border border-slate-100 space-y-6">
            <Section title="Personal Information" icon={User}>
              <Field label="Full Name" id="name" value={userData.name} onChange={set("name")} />
              <Field label="Email Address" id="email" value={userData.email} onChange={set("email")} type="email" />
              <Field label="Phone Number" id="phone" value={userData.phone} onChange={set("phone")} />
              <Field label="City" id="city" value={userData.city} onChange={set("city")} />
              <Field label="Date of Birth" id="dob" value={userData.dob} onChange={set("dob")} type="date" />
              <SelectField
                label="Gender" id="gender" value={userData.gender}
                onChange={set("gender")}
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
              />
            </Section>

            <Section title="Employment Details" icon={Briefcase}>
              <SelectField
                label="Employment Type" id="employmentType" value={userData.employmentType}
                onChange={set("employmentType")}
                options={[
                  { value: "salaried", label: "Salaried" },
                  { value: "self-employed", label: "Self Employed" },
                  { value: "business", label: "Business Owner" },
                  { value: "freelancer", label: "Freelancer" },
                ]}
              />
              <Field label="Employer / Company Name" id="employerName" value={userData.employerName} onChange={set("employerName")} />
              <SelectField
                label="Employment Tenure" id="employmentTenure" value={userData.employmentTenure}
                onChange={set("employmentTenure")}
                options={[
                  { value: "<1yr", label: "Less than 1 year" },
                  { value: "1-2yr", label: "1–2 years" },
                  { value: "2-5yr", label: "2–5 years" },
                  { value: "5yr+", label: "5+ years" },
                ]}
              />
              <Field label="Industry / Sector" id="industry" value={userData.industry} onChange={set("industry")} />
            </Section>

            <Section title="Financial Details" icon={IndianRupee}>
              <Field label="Monthly Income" id="monthlyIncome" value={userData.monthlyIncome} onChange={set("monthlyIncome")} type="number" suffix="₹/mo" />
              <Field label="Monthly Expenses" id="monthlyExpenses" value={userData.monthlyExpenses} onChange={set("monthlyExpenses")} type="number" suffix="₹/mo" />
              <Field label="Existing EMI" id="existingEMI" value={userData.existingEMI} onChange={set("existingEMI")} type="number" suffix="₹/mo" />
              <Field label="Credit Score" id="creditScore" value={userData.creditScore} onChange={set("creditScore")} type="number" />
            </Section>

            <Section title="Loan Requirement" icon={Building2}>
              <SelectField
                label="Loan Purpose" id="loanPurpose" value={userData.loanPurpose}
                onChange={set("loanPurpose")}
                options={[
                  { value: "home", label: "Home Loan" },
                  { value: "personal", label: "Personal Loan" },
                  { value: "business", label: "Business Loan" },
                  { value: "education", label: "Education Loan" },
                  { value: "vehicle", label: "Vehicle Loan" },
                  { value: "gold", label: "Gold Loan" },
                ]}
              />
              <Field label="Required Loan Amount" id="loanAmount" value={userData.loanAmount} onChange={set("loanAmount")} type="number" />
              <Field label="Preferred Tenure (years)" id="loanTenure" value={userData.loanTenure} onChange={set("loanTenure")} type="number" />
              <Field label="State / Region" id="state" value={userData.state} onChange={set("state")} />
            </Section>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-blue-600 hover:bg-blue-700">
                {isSaving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Save Profile
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ════════════ KYC & DOCUMENTS TAB ════════════ */}
        <TabsContent value="kyc" className="space-y-4 mt-0">
          <Card className="p-6 border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">KYC Information</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Numbers are auto-extracted from your uploaded & AI-verified documents
                </p>
              </div>
              {isKycDone ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> KYC Complete
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" /> Pending
                </span>
              )}
            </div>

            {/* PAN */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">PAN Card</p>
                  <p className="text-xs text-slate-500">{panFile ? "✅ AI-extracted from uploaded document" : "Upload PAN card in Documents tab to auto-extract"}</p>
                </div>
                {panFile && (
                  <span className="ml-auto text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold border border-emerald-200">
                    Verified
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">PAN Number</Label>
                <Input
                  value={panNumber}
                  onChange={(e) => setUserData((p: any) => ({ ...p, panNumber: e.target.value }))}
                  placeholder="ABCDE1234F"
                  className={`h-10 font-mono text-sm tracking-widest ${panFile ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white"}`}
                />
              </div>
              {panFile?.extractedData?.name && (
                <div className="text-xs text-slate-500 flex gap-4">
                  <span>Name on PAN: <strong className="text-slate-700">{panFile.extractedData.name}</strong></span>
                  {panFile?.extractedData?.dateOfBirth && (
                    <span>DOB: <strong className="text-slate-700">{panFile.extractedData.dateOfBirth}</strong></span>
                  )}
                </div>
              )}
            </div>

            {/* Aadhaar */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Aadhaar Card</p>
                  <p className="text-xs text-slate-500">{aadhaarFile ? "✅ AI-extracted from uploaded document" : "Upload Aadhaar in Documents tab to auto-extract"}</p>
                </div>
                {aadhaarFile && (
                  <span className="ml-auto text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold border border-emerald-200">
                    Verified
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Aadhaar Number</Label>
                <Input
                  value={aadhaarNumber}
                  onChange={(e) => setUserData((p: any) => ({ ...p, aadhaarNumber: e.target.value }))}
                  placeholder="XXXX XXXX XXXX"
                  className={`h-10 font-mono text-sm tracking-widest ${aadhaarFile ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white"}`}
                />
              </div>
              {aadhaarFile?.extractedData?.name && (
                <div className="text-xs text-slate-500">
                  Name on Aadhaar: <strong className="text-slate-700">{aadhaarFile.extractedData.name}</strong>
                </div>
              )}
            </div>

            {/* Uploaded docs summary */}
            {uploadedCount > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">All Uploaded Documents ({uploadedCount})</p>
                <div className="space-y-2">
                  {userData?.uploadedFiles?.map((f: any) => (
                    <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white">
                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{f.name}</p>
                        <p className="text-xs text-slate-400">{f.docId?.toUpperCase()} · {new Date(f.uploadedAt).toLocaleDateString("en-IN")}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border flex-shrink-0 ${f.verificationStatus === "verified" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          f.verificationStatus === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                            f.verificationStatus === "verifying" ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse" :
                              "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                        {f.verificationStatus || "pending"}
                      </span>
                      {f.extractedData?.documentNumber && (
                        <span className="text-xs text-slate-400 font-mono hidden sm:block">{f.extractedData.documentNumber}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!uploadedCount && (
              <div className="text-center py-8 text-slate-400">
                <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No documents uploaded yet</p>
                <p className="text-xs mt-1">Go to <strong>Documents</strong> tab to upload PAN, Aadhaar & more</p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-blue-600 hover:bg-blue-700">
                {isSaving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Save KYC Info
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ════════════ APPEARANCE ════════════ */}
        <TabsContent value="appearance" className="mt-0">
          <Card className="p-6 border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-5">Theme Preference</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { val: "light", icon: Sun, label: "Light", iconColor: "text-orange-500" },
                { val: "dark", icon: Moon, label: "Dark", iconColor: "text-blue-500" },
                { val: "system", icon: Laptop, label: "System", iconColor: "text-slate-500" },
              ].map(({ val, icon: Icon, label, iconColor }) => (
                <div
                  key={val}
                  onClick={() => setTheme(val)}
                  className={`cursor-pointer rounded-xl border-2 p-5 flex flex-col items-center gap-3 transition-all hover:shadow-sm ${theme === val ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <Icon className={`w-7 h-7 ${iconColor}`} />
                  <span className="font-semibold text-sm text-slate-700">{label}</span>
                  {theme === val && <span className="text-[10px] text-blue-600 font-bold">Active</span>}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ════════════ NOTIFICATIONS ════════════ */}
        <TabsContent value="notifications" className="mt-0">
          <Card className="p-6 border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-5">Notification Preferences</h3>
            <div className="space-y-3">
              {[
                { key: "email", icon: Mail, title: "Email Notifications", desc: "Loan updates via email" },
                { key: "sms", icon: Phone, title: "SMS Notifications", desc: "Text messages for important updates" },
                { key: "push", icon: Bell, title: "Push Notifications", desc: "Real-time browser alerts" },
                { key: "marketing", icon: Mail, title: "Marketing Emails", desc: "Tips and offers from ArthAstra" },
              ].map(({ key, icon: Icon, title, desc }) => (
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
                    onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, [key]: v }))}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                className="gap-2 text-sm"
                onClick={async () => {
                  if (!userData?.phone) { alert("No phone number found."); return }
                  if (confirm(`Send test WhatsApp to ${userData.phone}?`)) {
                    const res = await fetch("/api/notify", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ stage: "profile_setup", userData })
                    })
                    const d = await res.json()
                    alert(d.success ? "✅ Message sent!" : "❌ " + (d.error || "Failed"))
                  }
                }}
              >
                <MessageSquare className="w-4 h-4" /> Test WhatsApp
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-sm"
                onClick={() => toast({ title: "Preferences saved" })}
              >
                Save Preferences
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ════════════ SECURITY ════════════ */}
        <TabsContent value="security" className="mt-0">
          <Card className="p-6 border border-slate-100 space-y-5">
            <h3 className="text-base font-bold text-slate-900">Security Settings</h3>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Account is secure</p>
                <p className="text-xs text-emerald-600">Your data is 256-bit encrypted</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-700">Change Password</h4>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Current Password" id="cur-pw" value="" onChange={() => { }} type="password" />
                <Field label="New Password" id="new-pw" value="" onChange={() => { }} type="password" />
                <Field label="Confirm New Password" id="con-pw" value="" onChange={() => { }} type="password" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700 text-sm">Update Password</Button>
            </div>
          </Card>
        </TabsContent>

        {/* ════════════ PRIVACY ════════════ */}
        <TabsContent value="privacy" className="mt-0">
          <Card className="p-6 border border-slate-100 space-y-5">
            <h3 className="text-base font-bold text-slate-900">Privacy & Data</h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-sm font-semibold text-slate-800">Data Usage</h4>
              <p className="text-sm text-slate-600">
                We use your data to provide personalized loan recommendations. All information is encrypted and secure.
              </p>
              <Button variant="outline" onClick={() => generateProfilePDF(userData)} className="gap-2 text-sm">
                <Download className="w-4 h-4" /> Download My Data (PDF)
              </Button>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
              <h4 className="text-sm font-semibold text-red-800">Delete Account & Data</h4>
              <p className="text-sm text-red-600">
                PERMANENTLY deletes all your data and logs you out. This cannot be undone.
              </p>
              <Button
                variant="destructive"
                className="text-sm"
                onClick={() => {
                  if (confirm("Are you sure you want to delete your account?")) {
                    document.cookie = "userId=; path=/; max-age=0"
                    window.location.href = "/"
                  }
                }}
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
