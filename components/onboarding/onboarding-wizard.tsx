"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Mic, MicOff, Volume2 } from "lucide-react"
import Step1BasicProfile from "./steps/step-1-basic-profile"
import Step2Employment from "./steps/step-2-employment"
import Step3Financial from "./steps/step-3-financial"
import Step4LoanRequirement from "./steps/step-4-loan-requirement"
import Step5Enhancements from "./steps/step-5-enhancements"
import { useVoiceAssistant } from "@/lib/voice-assistant-context"

const onboardingImages = [
  "/indian-couple-planning-home-loan-together.jpg",
  "/young-indian-professional-using-loan-calculator.jpg",
  "/indian-family-happy-after-loan-approval.jpg",
  "/indian-businessman-reviewing-loan-documents.jpg",
]

import type { OnboardingData } from "./types"

const stepFields = {
  1: [
    {
      id: "name",
      name: "Full Name",
      type: "text" as const,
      question: { en: "What is your full name?", hi: "आपका पूरा नाम क्या है?" },
    },
    {
      id: "age",
      name: "Age",
      type: "number" as const,
      question: { en: "How old are you?", hi: "आपकी उम्र क्या है?" },
      min: 18,
      max: 100,
    },
    {
      id: "phone",
      name: "Phone Number",
      type: "text" as const,
      question: { en: "What is your phone number?", hi: "आपका फोन नंबर क्या है?" },
    },
    {
      id: "city",
      name: "City",
      type: "text" as const,
      question: { en: "Which city do you live in?", hi: "आप किस शहर में रहते हैं?" },
    },
    {
      id: "state",
      name: "State",
      type: "select" as const,
      question: { en: "Which state are you from?", hi: "आप किस राज्य से हैं?" },
      options: [
        { value: "Maharashtra", label: "Maharashtra" },
        { value: "Karnataka", label: "Karnataka" },
        { value: "Delhi", label: "Delhi" },
        { value: "Tamil Nadu", label: "Tamil Nadu" },
        { value: "Gujarat", label: "Gujarat" },
        { value: "West Bengal", label: "West Bengal" },
        { value: "Rajasthan", label: "Rajasthan" },
        { value: "Uttar Pradesh", label: "Uttar Pradesh" },
      ],
    },
  ],
  2: [
    {
      id: "employmentType",
      name: "Employment Type",
      type: "select" as const,
      question: { en: "What is your employment type?", hi: "आपका रोजगार प्रकार क्या है?" },
      options: [
        { value: "salaried", label: "Salaried" },
        { value: "self_employed", label: "Self Employed" },
        { value: "freelancer", label: "Freelancer" },
        { value: "student", label: "Student" },
      ],
    },
    {
      id: "monthlyIncome",
      name: "Monthly Income",
      type: "number" as const,
      question: { en: "What is your monthly income in rupees?", hi: "आपकी मासिक आय कितनी है?" },
      min: 10000,
      max: 500000,
    },
    {
      id: "employmentTenure",
      name: "Employment Tenure",
      type: "select" as const,
      question: { en: "How long have you been employed?", hi: "आप कितने समय से कार्यरत हैं?" },
      options: [
        { value: "<6_months", label: "Less than 6 months" },
        { value: "6m-1yr", label: "6 months to 1 year" },
        { value: "1-2yr", label: "1 to 2 years" },
        { value: "2-5yr", label: "2 to 5 years" },
        { value: "5+yr", label: "More than 5 years" },
      ],
    },
    {
      id: "companyName",
      name: "Company Name",
      type: "text" as const,
      question: { en: "What is your company name?", hi: "आपकी कंपनी का नाम क्या है?" },
    },
  ],
  3: [
    {
      id: "existingEMI",
      name: "Existing EMI",
      type: "number" as const,
      question: { en: "What is your existing monthly EMI amount?", hi: "आपकी मौजूदा मासिक EMI कितनी है?" },
      min: 0,
      max: 100000,
    },
    {
      id: "monthlyExpenses",
      name: "Monthly Expenses",
      type: "number" as const,
      question: { en: "What are your monthly expenses?", hi: "आपका मासिक खर्च कितना है?" },
      min: 0,
      max: 100000,
    },
    {
      id: "savingsRange",
      name: "Savings Range",
      type: "select" as const,
      question: { en: "What is your savings range?", hi: "आपकी बचत कितनी है?" },
      options: [
        { value: "0-50k", label: "0 to 50 thousand" },
        { value: "50k-1L", label: "50 thousand to 1 lakh" },
        { value: "1L-5L", label: "1 to 5 lakh" },
        { value: "5L+", label: "More than 5 lakh" },
      ],
    },
    {
      id: "hasCreditHistory",
      name: "Credit History",
      type: "switch" as const,
      question: {
        en: "Do you have any credit history? Say yes or no.",
        hi: "क्या आपका कोई क्रेडिट इतिहास है? हां या नहीं बोलें।",
      },
    },
    {
      id: "creditScore",
      name: "Credit Score",
      type: "number" as const,
      question: { en: "What is your approximate credit score?", hi: "आपका अनुमानित क्रेडिट स्कोर क्या है?" },
      min: 300,
      max: 900,
    },
  ],
  4: [
    {
      id: "loanPurpose",
      name: "Loan Purpose",
      type: "select" as const,
      question: { en: "What is the purpose of your loan?", hi: "आपके लोन का उद्देश्य क्या है?" },
      options: [
        { value: "education", label: "Education" },
        { value: "personal", label: "Personal" },
        { value: "business", label: "Business" },
        { value: "home", label: "Home" },
        { value: "car", label: "Car" },
        { value: "medical", label: "Medical" },
        { value: "wedding", label: "Wedding" },
        { value: "travel", label: "Travel" },
      ],
    },
    {
      id: "loanAmount",
      name: "Loan Amount",
      type: "number" as const,
      question: { en: "How much loan amount do you need?", hi: "आपको कितनी लोन राशि चाहिए?" },
      min: 10000,
      max: 5000000,
    },
    {
      id: "preferredEMI",
      name: "Preferred EMI",
      type: "number" as const,
      question: { en: "What is your preferred maximum monthly EMI?", hi: "आपकी पसंदीदा अधिकतम मासिक EMI क्या है?" },
      min: 1000,
      max: 100000,
    },
    {
      id: "tenure",
      name: "Tenure",
      type: "number" as const,
      question: { en: "What tenure do you prefer in years?", hi: "आप कितने साल की अवधि पसंद करते हैं?" },
      min: 1,
      max: 10,
    },
  ],
  5: [
    {
      id: "isJointApplication",
      name: "Joint Application",
      type: "switch" as const,
      question: { en: "Is this a joint application? Say yes or no.", hi: "क्या यह संयुक्त आवेदन है? हां या नहीं बोलें।" },
    },
    {
      id: "coborrowerIncome",
      name: "Co-borrower Income",
      type: "number" as const,
      question: { en: "What is your co-borrower's monthly income?", hi: "आपके सह-उधारकर्ता की मासिक आय कितनी है?" },
      min: 0,
      max: 500000,
    },
    {
      id: "coborrowerRelationship",
      name: "Relationship",
      type: "select" as const,
      question: { en: "What is your relationship with the co-borrower?", hi: "सह-उधारकर्ता से आपका क्या संबंध है?" },
      options: [
        { value: "spouse", label: "Spouse" },
        { value: "parent", label: "Parent" },
        { value: "sibling", label: "Sibling" },
        { value: "friend", label: "Friend" },
      ],
    },
  ],
}

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<OnboardingData>({})
  const [currentImage, setCurrentImage] = useState(0)

  const {
    isListening,
    isFormMode,
    isSpeaking,
    language: voiceLanguage,
    registeredFields,
    currentFieldIndex,
    registerFields,
    unregisterFields,
    setOnFieldUpdate,
    setOnStepChange,
    startListening,
    stopListening,
    startFormFilling,
    stopFormFilling,
    speak,
    setIsOpen,
  } = useVoiceAssistant()

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  // Image carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % onboardingImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Register fields for current step
  useEffect(() => {
    const fields = stepFields[currentStep as keyof typeof stepFields] || []
    registerFields(fields)

    return () => {
      unregisterFields()
    }
  }, [currentStep, registerFields, unregisterFields])

  // Handle voice field updates
  const handleVoiceFieldUpdate = useCallback((fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }, [])

  useEffect(() => {
    setOnFieldUpdate(handleVoiceFieldUpdate)
  }, [setOnFieldUpdate, handleVoiceFieldUpdate])

  const handleStepChange = useCallback(
    (direction: "next" | "back") => {
      if (direction === "next") {
        handleNext()
      } else {
        handleBack()
      }
    },
    [currentStep],
  )

  useEffect(() => {
    setOnStepChange(handleStepChange)
  }, [setOnStepChange, handleStepChange])

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })

      // If in form mode, restart for new step
      if (isFormMode) {
        stopFormFilling()
        setTimeout(() => {
          startFormFilling()
        }, 1000)
      }
    } else {
      localStorage.setItem("onboardingData", JSON.stringify(formData))
      localStorage.setItem("loanProfile", JSON.stringify(formData))
      window.location.href = "/dashboard"
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSave = () => {
    localStorage.setItem("onboardingData", JSON.stringify(formData))
    localStorage.setItem("onboardingStep", currentStep.toString())
    // Ensure session is active if they are deep in the process
    if (currentStep > 1) {
      localStorage.setItem("arthAstraSession", "true")
    }
    alert("Progress saved! You can continue later.")
  }

  const handleVoiceFill = () => {
    setIsOpen(true)
    setTimeout(() => {
      startFormFilling()
    }, 500)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicProfile data={formData} updateData={updateFormData} onNext={handleNext} />
      case 2:
        return <Step2Employment data={formData} updateData={updateFormData} onNext={handleNext} />
      case 3:
        return <Step3Financial data={formData} updateData={updateFormData} onNext={handleNext} />
      case 4:
        return <Step4LoanRequirement data={formData} updateData={updateFormData} onNext={handleNext} />
      case 5:
        return <Step5Enhancements data={formData} updateData={updateFormData} onNext={handleNext} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Image Carousel */}
          <div className="hidden lg:block sticky top-8">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  src={onboardingImages[currentImage]}
                  alt="ArthAstra onboarding"
                  className="w-full aspect-[4/3] object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>

              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {onboardingImages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImage ? "bg-white w-6" : "bg-white/50"
                      }`}
                  />
                ))}
              </div>

              {/* Overlay text */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h3 className="text-white text-xl font-semibold">ArthAstra</h3>
                <p className="text-white/80 text-sm">Borrow Smarter, Not Harder</p>
              </div>
            </div>

            <div className="mt-6 p-5 bg-white rounded-xl shadow-md border border-gray-100">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isFormMode ? "bg-emerald-500" : "bg-gradient-to-br from-emerald-100 to-teal-100"
                    }`}
                >
                  {isFormMode ? (
                    <Volume2 className="w-6 h-6 text-white animate-pulse" />
                  ) : (
                    <Mic className="w-6 h-6 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {isFormMode
                      ? voiceLanguage === "en"
                        ? "Voice Mode Active"
                        : "वॉइस मोड चालू"
                      : voiceLanguage === "en"
                        ? "Fill Form by Voice"
                        : "वॉइस से फॉर्म भरें"}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {isFormMode
                      ? voiceLanguage === "en"
                        ? `Answering question ${currentFieldIndex + 1} of ${registeredFields.length}`
                        : `प्रश्न ${currentFieldIndex + 1} / ${registeredFields.length} का जवाब दे रहे हैं`
                      : voiceLanguage === "en"
                        ? "Let our assistant guide you through the form"
                        : "हमारा असिस्टेंट फॉर्म में आपकी मदद करेगा"}
                  </p>

                  {!isFormMode && (
                    <Button
                      onClick={handleVoiceFill}
                      className="mt-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2"
                      size="sm"
                    >
                      <Mic className="w-4 h-4" />
                      {voiceLanguage === "en" ? "Start Voice Filling" : "वॉइस भरना शुरू करें"}
                    </Button>
                  )}

                  {isFormMode && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex gap-1">
                        <span
                          className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <span className="text-sm text-emerald-600 font-medium">
                        {isSpeaking
                          ? voiceLanguage === "en"
                            ? "Speaking..."
                            : "बोल रहा हूं..."
                          : isListening
                            ? voiceLanguage === "en"
                              ? "Listening..."
                              : "सुन रहा हूं..."
                            : voiceLanguage === "en"
                              ? "Processing..."
                              : "प्रोसेसिंग..."}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Voice commands hint */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {voiceLanguage === "en"
                    ? 'Voice commands: "next step", "go back", "help"'
                    : 'वॉइस कमांड: "अगला चरण", "वापस जाओ", "मदद"'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            {/* Progress Bar */}
            <div className="mb-8 bg-white rounded-2xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-sm font-semibold text-emerald-700">
                    Step {currentStep} of {totalSteps}
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 mt-1">
                    {currentStep === 1 && "Basic Profile"}
                    {currentStep === 2 && "Employment Details"}
                    {currentStep === 3 && "Financial Information"}
                    {currentStep === 4 && "Loan Requirements"}
                    {currentStep === 5 && "Enhancements"}
                  </h2>
                </div>
                <span className="text-2xl font-bold text-emerald-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <div className="mb-4 flex justify-end lg:hidden">
              <Button
                variant={isFormMode ? "destructive" : "default"}
                size="sm"
                onClick={isFormMode ? stopFormFilling : handleVoiceFill}
                className={`gap-2 ${!isFormMode && "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                {isFormMode ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    {voiceLanguage === "en" ? "Stop Voice" : "वॉइस बंद"}
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    {voiceLanguage === "en" ? "Fill with Voice" : "वॉइस से भरें"}
                  </>
                )}
              </Button>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center">
              {currentStep > 1 ? (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="border-2 border-emerald-200 hover:bg-emerald-50 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              <Button onClick={handleSave} variant="ghost" className="text-gray-600 hover:text-emerald-700">
                <Save className="w-4 h-4 mr-2" />
                Save & Continue Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
