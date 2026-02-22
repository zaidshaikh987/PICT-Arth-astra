"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/user-context"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  FileCheck,
  CheckCircle2,
  Circle,
  Upload,
  FileText,
  Building2,
  CreditCard,
  User,
  Download,
  AlertCircle,
  Eye,
  Trash2,
  Lock,
  ShieldCheck,
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"

type Document = {
  id: string
  name: string
  nameHi: string
  category: string
  required: boolean
  description: string
  descriptionHi: string
}

type UploadedFile = {
  id: string
  docId: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
  verificationStatus?: "verifying" | "verified" | "rejected" | "pending"
  verificationIssues?: string[]
  confidence?: number
  extractedData?: any
}

const documentCategories = [
  { id: "identity", name: "Identity Proof", nameHi: "पहचान प्रमाण", icon: User },
  { id: "address", name: "Address Proof", nameHi: "पता प्रमाण", icon: Building2 },
  { id: "income", name: "Income Proof", nameHi: "आय प्रमाण", icon: CreditCard },
  { id: "property", name: "Property Documents", nameHi: "संपत्ति दस्तावेज़", icon: FileText },
]

const documents: Document[] = [
  // Identity
  {
    id: "pan",
    name: "PAN Card",
    nameHi: "पैन कार्ड",
    category: "identity",
    required: true,
    description: "Required for all loan applications",
    descriptionHi: "सभी ऋण आवेदनों के लिए आवश्यक",
  },
  {
    id: "aadhaar",
    name: "Aadhaar Card",
    nameHi: "आधार कार्ड",
    category: "identity",
    required: true,
    description: "Government ID proof",
    descriptionHi: "सरकारी पहचान प्रमाण",
  },
  {
    id: "passport",
    name: "Passport",
    nameHi: "पासपोर्ट",
    category: "identity",
    required: false,
    description: "Optional additional ID",
    descriptionHi: "वैकल्पिक अतिरिक्त पहचान",
  },
  // Address
  {
    id: "utility",
    name: "Utility Bill",
    nameHi: "बिजली/पानी बिल",
    category: "address",
    required: true,
    description: "Not older than 3 months",
    descriptionHi: "3 महीने से अधिक पुराना नहीं",
  },
  {
    id: "rent",
    name: "Rent Agreement",
    nameHi: "किराया समझौता",
    category: "address",
    required: false,
    description: "If living on rent",
    descriptionHi: "यदि किराए पर रह रहे हैं",
  },
  // Income
  {
    id: "salary-slip",
    name: "Salary Slips (3 months)",
    nameHi: "वेतन पर्ची (3 महीने)",
    category: "income",
    required: true,
    description: "Latest 3 months salary slips",
    descriptionHi: "नवीनतम 3 महीने की वेतन पर्चियां",
  },
  {
    id: "bank-statement",
    name: "Bank Statement (6 months)",
    nameHi: "बैंक स्टेटमेंट (6 महीने)",
    category: "income",
    required: true,
    description: "Salary account statement",
    descriptionHi: "वेतन खाता विवरण",
  },
  {
    id: "form16",
    name: "Form 16 / ITR",
    nameHi: "फॉर्म 16 / ITR",
    category: "income",
    required: true,
    description: "Last 2 years tax returns",
    descriptionHi: "पिछले 2 वर्षों का टैक्स रिटर्न",
  },
  // Property (for home loan)
  {
    id: "property-docs",
    name: "Property Papers",
    nameHi: "संपत्ति कागजात",
    category: "property",
    required: false,
    description: "Sale deed, title documents",
    descriptionHi: "बिक्री विलेख, शीर्षक दस्तावेज़",
  },
  {
    id: "noc",
    name: "NOC from Society",
    nameHi: "सोसायटी से NOC",
    category: "property",
    required: false,
    description: "For apartment/flat purchase",
    descriptionHi: "अपार्टमेंट/फ्लैट खरीद के लिए",
  },
]

export default function DocumentChecklist() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [viewingFile, setViewingFile] = useState<UploadedFile | null>(null)
  const { language } = useLanguage()
  const { user, updateUser } = useUser()

  useEffect(() => {
    if (user?.uploadedFiles) {
      setUploadedFiles(user.uploadedFiles)
    }
  }, [user])

  const handleFileUpload = async (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, JPEG, and PNG files are allowed")
      return
    }

    // Convert to base64 for storage and verification
    const reader = new FileReader()
    reader.onload = async () => {
      const base64Data = reader.result as string
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        docId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: base64Data,
        uploadedAt: new Date().toISOString(),
        verificationStatus: "verifying" // Initial status
      }

      // Optimistic update
      const updatedFiles = [...uploadedFiles, newFile]
      setUploadedFiles(updatedFiles)

      try {
        // Call Vertex AI Vision API
        const response = await fetch("/api/verify-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageData: base64Data,
            documentType: docId === "pan" ? "pan" :
              docId === "aadhaar" ? "aadhaar" :
                docId === "salary-slip" ? "salary_slip" :
                  docId === "passport" ? "passport" : "bank_statement"
          })
        })

        const result = await response.json()

        // Update file with verification result
        const status: "verified" | "rejected" = result.verification?.isValid ? "verified" : "rejected"

        const verifiedFile: UploadedFile = {
          ...newFile,
          verificationStatus: status,
          verificationIssues: (result.verification?.issues as string[]) || [],
          confidence: result.verification?.confidence as number,
          extractedData: result.verification?.extractedData
        }

        setUploadedFiles(prev => {
          const updated = prev.map(f => f.id === newFile.id ? verifiedFile : f)
          updateUser({ uploadedFiles: updated })
          return updated
        })

      } catch (error) {
        console.error("Verification failed", error)
        // Mark as pending if API fails (don't block user)
        setUploadedFiles(prev => prev.map(f => f.id === newFile.id ? { ...f, verificationStatus: "pending" } : f))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter((f) => f.id !== fileId)
    setUploadedFiles(updatedFiles)
    updateUser({ uploadedFiles: updatedFiles })
  }

  const handleViewFile = (file: UploadedFile) => {
    setViewingFile(file)
  }

  const getUploadedFilesForDoc = (docId: string) => {
    return uploadedFiles.filter((f) => f.docId === docId)
  }

  const requiredDocs = documents.filter((d) => d.required)
  const uploadedRequiredDocs = requiredDocs.filter((d) => getUploadedFilesForDoc(d.id).length > 0)
  const progress = (uploadedRequiredDocs.length / requiredDocs.length) * 100

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-blue-600" />
            {language === "hi" ? "दस्तावेज़ चेकलिस्ट" : "Document Checklist"}
          </h1>
          <p className="text-gray-600 mt-2">
            {language === "hi"
              ? "अपने ऋण आवेदन के लिए आवश्यक सभी दस्तावेज़ तैयार करें"
              : "Prepare all documents required for your loan application"}
          </p>
        </div>

        {/* Secure Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm text-blue-700 font-medium">
          <Lock className="w-4 h-4" />
          Your data is 256-bit encrypted & secure
        </div>
      </div>

      {/* Progress Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">
              {language === "hi" ? "दस्तावेज़ तैयारी प्रगति" : "Document Preparation Progress"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {uploadedRequiredDocs.length} / {requiredDocs.length}{" "}
              {language === "hi" ? "आवश्यक दस्तावेज़ तैयार" : "required documents uploaded"}
            </p>
          </div>
          <div className="text-3xl font-bold text-blue-600">{Math.round(progress)}%</div>
        </div>
        <Progress value={progress} className="h-3" />

        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700 font-medium">
              {language === "hi" ? "सभी आवश्यक दस्तावेज़ तैयार!" : "All required documents uploaded!"}
            </span>
          </motion.div>
        )}
      </Card>

      {/* Document Categories */}
      <div className="space-y-6">
        {documentCategories.map((category) => {
          const categoryDocs = documents.filter((d) => d.category === category.id)
          const uploadedCount = categoryDocs.filter((d) => getUploadedFilesForDoc(d.id).length > 0).length
          const CategoryIcon = category.icon

          return (
            <Card key={category.id} className="p-6 transition-all hover:shadow-md border-gray-100/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CategoryIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{language === "hi" ? category.nameHi : category.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">
                      {uploadedCount} / {categoryDocs.length} {language === "hi" ? "तैयार" : "uploaded"}
                    </p>
                    {uploadedCount === categoryDocs.length && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {categoryDocs.map((doc, idx) => {
                  const docFiles = getUploadedFilesForDoc(doc.id)
                  const isUploaded = docFiles.length > 0

                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 rounded-xl border transition-all ${isUploaded
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm"
                        : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isUploaded ? "bg-blue-500 text-white shadow-blue-200 shadow-md" : "bg-gray-100 text-gray-400"
                            }`}
                        >
                          {isUploaded ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium ${isUploaded ? "text-blue-700" : "text-gray-900"}`}>
                              {language === "hi" ? doc.nameHi : doc.name}
                            </span>
                            {doc.required && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                                {language === "hi" ? "आवश्यक" : "Required"}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            {language === "hi" ? doc.descriptionHi : doc.description}
                          </p>

                          {docFiles.length > 0 && (
                            <div className="space-y-2 mt-3">
                              {docFiles.map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-200"
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {(file.size / 1024).toFixed(1)} KB •{" "}
                                        {new Date(file.uploadedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Verification Badge */}
                                  {file.verificationStatus === "verifying" && (
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1 animate-pulse">
                                      <Eye className="w-3 h-3" /> Verifying...
                                    </span>
                                  )}
                                  {file.verificationStatus === "verified" && (
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3" /> Verified ({file.confidence}%)
                                    </span>
                                  )}
                                  {file.verificationStatus === "rejected" && (
                                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" /> Issues Found
                                    </span>
                                  )}

                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleViewFile(file)}
                                      className="h-8 px-2"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteFile(file.id)}
                                      className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  {/* 🔴 Validation Errors */}
                                  {file.verificationStatus === "rejected" && file.verificationIssues && file.verificationIssues.length > 0 && (
                                    <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 w-full">
                                      <strong>⚠️ Validation Failed:</strong>
                                      <ul className="list-disc list-inside mt-1">
                                        {file.verificationIssues.map((issue, i) => (
                                          <li key={i}>{issue}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* 🟢 Extracted Data */}
                                  {file.extractedData && (
                                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 w-full">
                                      <strong>📋 Extracted Details:</strong>
                                      <div className="grid grid-cols-2 gap-1 mt-1">
                                        {Object.entries(file.extractedData || {}).map(([key, value]) => {
                                          if (!value) return null;
                                          return (
                                            <div key={key}>
                                              <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {String(value)}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <input
                            type="file"
                            id={`upload-${doc.id}`}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(doc.id, e)}
                            aria-label={`Upload ${language === "hi" ? doc.nameHi : doc.name}`}
                          />
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => document.getElementById(`upload-${doc.id}`)?.click()}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            {language === "hi" ? "अपलोड" : "Upload"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>

      {viewingFile && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingFile(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{viewingFile.name}</h3>
                <p className="text-sm text-gray-500">
                  {(viewingFile.size / 1024).toFixed(1)} KB • Uploaded{" "}
                  {new Date(viewingFile.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewingFile(null)}>
                Close
              </Button>
            </div>
            <div className="p-4">
              {viewingFile.type.startsWith("image/") ? (
                <img src={viewingFile.url || "/placeholder.svg"} alt={viewingFile.name} className="max-w-full h-auto" />
              ) : (
                <iframe src={viewingFile.url} className="w-full h-[600px] border-0" title={viewingFile.name} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tips Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-800">{language === "hi" ? "दस्तावेज़ टिप्स" : "Document Tips"}</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>
                •{" "}
                {language === "hi"
                  ? "सभी दस्तावेज़ स्पष्ट और पठनीय होने चाहिए"
                  : "All documents should be clear and readable"}
              </li>
              <li>• {language === "hi" ? "PDF या JPEG प्रारूप में अपलोड करें" : "Upload in PDF, JPEG, or PNG format"}</li>
              <li>• {language === "hi" ? "फ़ाइल का आकार 5MB से कम होना चाहिए" : "File size should be less than 5MB"}</li>
              <li>
                •{" "}
                {language === "hi"
                  ? "सुनिश्चित करें कि नाम सभी दस्तावेज़ों में मेल खाता है"
                  : "Ensure name matches across all documents"}
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Download Checklist */}
      <div className="flex justify-center">
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          {language === "hi" ? "चेकलिस्ट डाउनलोड करें" : "Download Checklist PDF"}
        </Button>
      </div>
    </div>
  )
}
