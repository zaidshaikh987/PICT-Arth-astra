"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"

type Language = "en" | "hi"



interface FormField {
  id: string
  name: string
  type: "text" | "number" | "select" | "slider" | "switch"
  question: {
    en: string
    hi: string
  }
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  type?: "question" | "confirmation" | "navigation" | "info" | "error"
}

interface VoiceAssistantContextType {
  isListening: boolean
  isSpeaking: boolean
  language: Language
  voiceEnabled: boolean
  transcript: string
  currentFieldIndex: number
  isFormMode: boolean
  registeredFields: FormField[]
  chatMessages: ChatMessage[]
  isOpen: boolean
  isAutoMode: boolean

  setLanguage: (lang: Language) => void
  setVoiceEnabled: (enabled: boolean) => void
  startListening: () => void
  stopListening: () => void
  speak: (text: string, lang?: Language) => Promise<void>
  stopSpeaking: () => void
  registerFields: (fields: FormField[]) => void
  unregisterFields: () => void
  startFormFilling: () => void
  stopFormFilling: () => void
  processVoiceInput: (input: string) => void
  onFieldUpdate?: (fieldId: string, value: any) => void
  setOnFieldUpdate: (callback: (fieldId: string, value: any) => void) => void
  goToNextField: () => void
  goToPrevField: () => void
  navigateTo: (path: string) => void
  setIsOpen: (open: boolean) => void
  addChatMessage: (message: ChatMessage) => void
  clearChat: () => void
  setIsAutoMode: (auto: boolean) => void
  onStepChange?: (direction: "next" | "back") => void
  setOnStepChange: (callback: (direction: "next" | "back") => void) => void
  guideDashboard: () => void
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined)

const navigationCommands: Record<string, { paths: string[]; keywords: { en: string[]; hi: string[] } }> = {
  eligibility: {
    paths: ["/dashboard/eligibility"],
    keywords: { en: ["eligibility", "check eligibility", "eligibility report", "am i eligible"], hi: ["पात्रता", "योग्यता"] },
  },
  loans: {
    paths: ["/dashboard/loans"],
    keywords: { en: ["loans", "loan comparison", "compare loans", "loan options", "find loan", "best loan", "lender"], hi: ["ऋण", "लोन", "तुलना", "सर्वोत्तम ऋण"] },
  },
  optimizer: {
    paths: ["/dashboard/optimizer"],
    keywords: { en: ["optimizer", "credit optimizer", "credit path", "improve score", "fix credit", "credit score"], hi: ["ऑप्टिमाइज़र", "क्रेडिट", "स्कोर सुधारें"] },
  },
  timeline: {
    paths: ["/dashboard/timeline"],
    keywords: {
      en: ["timeline", "application timeline", "track application", "my application", "application status"],
      hi: ["टाइमलाइन", "आवेदन स्थिति", "मेरा आवेदन"],
    },
  },
  documents: {
    paths: ["/dashboard/documents"],
    keywords: { en: ["documents", "document checklist", "upload documents", "checklist", "upload"], hi: ["दस्तावेज़", "डॉक्युमेंट", "चेकलिस्ट", "अपलोड"] },
  },
  rejection: {
    paths: ["/dashboard/rejection-recovery"],
    keywords: { en: ["rejection", "recovery", "rejection recovery", "rejected", "why rejected"], hi: ["अस्वीकृति", "रिकवरी", "अस्वीकार"] },
  },
  onboarding: {
    paths: ["/onboarding"],
    keywords: {
      en: ["onboarding", "start application", "apply", "new application", "fill form", "get started"],
      hi: ["आवेदन", "नया आवेदन", "फॉर्म भरो", "शुरू करें"],
    },
  },
  settings: {
    paths: ["/dashboard/settings"],
    keywords: { en: ["settings", "profile", "account", "preferences"], hi: ["सेटिंग्स", "प्रोफाइल", "खाता"] },
  },
  learn: {
    paths: ["/dashboard/learn"],
    keywords: { en: ["learn", "learning center", "knowledge", "tutorials", "education", "modules"], hi: ["सीखें", "ज्ञान", "ट्यूटोरियल", "शिक्षा"] },
  },
  quiz: {
    paths: ["/dashboard/quiz"],
    keywords: { en: ["quiz", "test", "financial quiz", "exam", "assessment"], hi: ["क्विज़", "परीक्षा", "टेस्ट"] },
  },
  multigoal: {
    paths: ["/dashboard/multi-goal"],
    keywords: { en: ["multi-goal", "planner", "goal planner", "future plan", "goals", "planning"], hi: ["लक्ष्य", "प्लानर", "भविष्य", "योजना"] },
  },
  peers: {
    paths: ["/dashboard/peers"],
    keywords: { en: ["peers", "community", "insights", "peer insights", "others", "compare with others"], hi: ["समुदाय", "साथी", "इनसाइट्स"] },
  },
  chat: {
    paths: ["/dashboard/chat"],
    keywords: { en: ["chat", "ai chat", "assistant", "talk", "ask question", "ai assistant"], hi: ["चैट", "बातचीत", "सहायक", "सवाल पूछें"] },
  },
  applyLoan: {
    paths: ["/dashboard/apply"],
    keywords: { en: ["apply loan", "apply now", "submit application", "apply for loan"], hi: ["आवेदन करें", "अभी आवेदन", "लोन के लिए आवेदन"] },
  },
  login: {
    paths: ["/login"],
    keywords: { en: ["login", "sign in", "log in"], hi: ["लॉगइन", "साइन इन"] },
  },
  // "dashboard" must be LAST — it has generic keywords like "home"/"main"
  // that could shadow more specific routes if checked first.
  dashboard: {
    paths: ["/dashboard"],
    keywords: { en: ["dashboard", "home", "main", "overview"], hi: ["डैशबोर्ड", "होम", "मुख्य"] },
  },
}

const dashboardFeatures = {
  en: [
    "Your dashboard has several features to help you with your loan application.",
    "You can check your eligibility report to see which loans you qualify for.",
    "Compare different loan options to find the best interest rates.",
    "Track your application timeline and upload required documents.",
    "Use the credit path optimizer to improve your loan approval chances.",
    "Say 'open eligibility' or 'check loans' to navigate to any feature.",
  ],
  hi: [
    "आपके डैशबोर्ड में ऋण आवेदन के लिए कई सुविधाएं हैं।",
    "आप अपनी पात्रता रिपोर्ट देख सकते हैं कि आप किन ऋणों के लिए योग्य हैं।",
    "सर्वोत्तम ब्याज दरें खोजने के लिए विभिन्न ऋण विकल्पों की तुलना करें।",
    "अपनी आवेदन स्थिति ट्रैक करें और आवश्यक दस्तावेज़ अपलोड करें।",
    "अपनी ऋण स्वीकृति की संभावना बढ़ाने के लिए क्रेडिट पाथ ऑप्टिमाइज़र का उपयोग करें।",
    "किसी भी सुविधा पर जाने के लिए 'पात्रता खोलें' या 'ऋण जांचें' कहें।",
  ],
}

export function VoiceAssistantProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [language, setLanguageState] = useState<Language>("en")
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [transcript, setTranscript] = useState("")
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0)
  const [isFormMode, setIsFormMode] = useState(false)
  const [registeredFields, setRegisteredFields] = useState<FormField[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isAutoMode, setIsAutoMode] = useState(false)

  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const useGeminiRef = useRef(true) // Set to true for higher accuracy (uses /api/voice-transcribe)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const onFieldUpdateRef = useRef<((fieldId: string, value: any) => void) | null>(null)
  const onStepChangeRef = useRef<((direction: "next" | "back") => void) | null>(null)
  const isInitializedRef = useRef(false)
  const autoListenTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isFormModeRef = useRef(false)
  const isAutoModeRef = useRef(false)
  const currentFieldIndexRef = useRef(0)
  const registeredFieldsRef = useRef<FormField[]>([])
  const isRecognitionActiveRef = useRef(false)
  const processVoiceInputRef = useRef<((input: string) => Promise<void>) | null>(null)
  // Guard: prevents double-processing when Web Speech API already handled navigation
  const hasProcessedCurrentInputRef = useRef(false)
  // Guard: only auto-listen after speaking a QUESTION, not after errors/hints/completion
  const shouldAutoListenRef = useRef(false)

  useEffect(() => {
    isFormModeRef.current = isFormMode
  }, [isFormMode])

  useEffect(() => {
    isAutoModeRef.current = isAutoMode
  }, [isAutoMode])

  useEffect(() => {
    currentFieldIndexRef.current = currentFieldIndex
  }, [currentFieldIndex])

  useEffect(() => {
    registeredFieldsRef.current = registeredFields
  }, [registeredFields])

  const addChatMessage = useCallback((message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message])
  }, [])

  const clearChat = useCallback(() => {
    setChatMessages([])
  }, [])

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }, [])

  // Gemini-based transcription using MediaRecorder
  const transcribeWithGemini = useCallback(async (audioBlob: Blob) => {
    // Skip if already processed by Web Speech API (e.g. navigation commands)
    if (hasProcessedCurrentInputRef.current) {
      setIsListening(false)
      isRecognitionActiveRef.current = false
      return
    }
    try {
      // Convert blob to base64
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)

      reader.onloadend = async () => {
        const base64Audio = reader.result as string

        try {
          const response = await fetch("/api/voice-transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audioData: base64Audio,
              language: language
            })
          })

          const result = await response.json()

          if (result.success && result.transcription && result.transcription !== "[unclear]") {
            setTranscript(result.transcription)
            if (processVoiceInputRef.current) {
              await processVoiceInputRef.current(result.transcription)
            }
          } else {
            console.log("[Gemini] No clear transcription received")
          }
        } catch (error) {
          console.error("[Gemini] Transcription error:", error)
        }

        setIsListening(false)
        isRecognitionActiveRef.current = false
        // Do NOT auto-restart here — let processVoiceInput → speak() handle the flow
      }
    } catch (error) {
      console.error("[Gemini] Audio processing error:", error)
      setIsListening(false)
      isRecognitionActiveRef.current = false
    }
  }, [language])

  const startListeningInternal = useCallback(async () => {
    if (autoListenTimeoutRef.current) {
      clearTimeout(autoListenTimeoutRef.current)
      autoListenTimeoutRef.current = null
    }

    if (isRecognitionActiveRef.current) {
      return
    }

    setIsListening(true)
    setTranscript("")
    isRecognitionActiveRef.current = true
    hasProcessedCurrentInputRef.current = false

    // 1. Start Gemini Recorder (ONLY in form mode for accuracy)
    // In navigation mode, SpeechRecognition needs exclusive mic access on Windows
    if (useGeminiRef.current && isFormModeRef.current && typeof navigator !== "undefined" && navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
          stream.getTracks().forEach(track => track.stop())
          transcribeWithGemini(audioBlob)
        }

        mediaRecorder.start()

        // Auto-stop after 10 seconds (gives user enough time to speak)
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop()
          }
        }, 10000)
      } catch (error) {
        console.log("[Gemini] MediaRecorder error:", error)
      }
    }

    // 2. Start Web Speech API (for Continuous Life Feedback)
    if (!recognitionRef.current) return

    try {
      recognitionRef.current.stop()
    } catch (e) { }

    setTimeout(() => {
      if (!recognitionRef.current) return
      try {
        recognitionRef.current.start()
      } catch (e: any) {
        if (!e.message?.includes("already started")) {
          console.log("[v0] Recognition start error:", e.message)
        }
      }
    }, 150)
  }, [transcribeWithGemini])

  const speak = useCallback(
    async (text: string, lang?: Language): Promise<void> => {
      if (!synthRef.current || !voiceEnabled) return

      return new Promise((resolve) => {
        synthRef.current?.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = (lang || language) === "hi" ? "hi-IN" : "en-IN"
        utterance.rate = 1.2
        utterance.pitch = 1

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => {
          setIsSpeaking(false)
          resolve()

          // Only auto-listen after speaking a QUESTION prompt, not after errors/hints/completion
          if (isFormModeRef.current && isAutoModeRef.current && shouldAutoListenRef.current) {
            shouldAutoListenRef.current = false // reset the flag
            autoListenTimeoutRef.current = setTimeout(() => {
              startListeningInternal()
            }, 300)
          }
        }

        utterance.onerror = () => {
          setIsSpeaking(false)
          resolve()
        }

        synthRef.current?.speak(utterance)
      })
    },
    [language, voiceEnabled, startListeningInternal],
  )

  const navigateTo = useCallback(
    (path: string) => {
      router.push(path)
    },
    [router],
  )

  const askCurrentQuestion = useCallback(
    (index: number) => {
      const fields = registeredFieldsRef.current
      if (fields.length > 0 && index < fields.length) {
        const field = fields[index]
        const question = field.question[language]

        let fullQuestion = question
        if (field.type === "select" && field.options) {
          const optionsList = field.options.map((o) => o.label).join(", ")
          fullQuestion =
            language === "en" ? `${question} Options are: ${optionsList}` : `${question} विकल्प हैं: ${optionsList}`
        }

        addChatMessage({
          role: "assistant",
          content: fullQuestion,
          type: "question",
        })

        shouldAutoListenRef.current = true
        speak(fullQuestion)
      }
    },
    [language, speak, addChatMessage],
  )

  const goToNextField = useCallback(async () => {
    const nextIndex = currentFieldIndex + 1
    if (nextIndex < registeredFields.length) {
      setCurrentFieldIndex(nextIndex)

      await new Promise((resolve) => setTimeout(resolve, 100))

      const nextField = registeredFields[nextIndex]
      const question = nextField.question[language]

      addChatMessage({ role: "assistant", content: question, type: "question" })
      // Mark that auto-listen should happen after this question
      shouldAutoListenRef.current = true
      await speak(question)
    } else {
      // ALL FIELDS DONE — stop form mode to prevent infinite loop
      const completeMsg =
        language === "en"
          ? "All fields completed! Click 'Next' to continue to the next step."
          : "सभी फ़ील्ड पूर्ण हो गए! अगले चरण पर जाने के लिए 'Next' बटन दबाएं।"
      addChatMessage({ role: "assistant", content: completeMsg, type: "info" })
      shouldAutoListenRef.current = false // do NOT auto-listen after completion
      await speak(completeMsg)
      // Stop form mode — this step's fields are exhausted (inline to avoid circular dep)
      setIsFormMode(false)
      isFormModeRef.current = false
      setIsAutoMode(false)
      isAutoModeRef.current = false
      // Inline stop: clear timeouts, stop recorder/recognition
      if (autoListenTimeoutRef.current) {
        clearTimeout(autoListenTimeoutRef.current)
        autoListenTimeoutRef.current = null
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        try { mediaRecorderRef.current.stop() } catch (e) { }
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (e) { }
      }
      isRecognitionActiveRef.current = false
      setIsListening(false)
    }
  }, [currentFieldIndex, registeredFields, language, speak, addChatMessage])

  const goToPrevField = useCallback(() => {
    if (currentFieldIndexRef.current > 0) {
      const newIndex = currentFieldIndexRef.current - 1
      setCurrentFieldIndex(newIndex)
      currentFieldIndexRef.current = newIndex
      setTimeout(() => askCurrentQuestion(newIndex), 200)
    }
  }, [askCurrentQuestion])

  const stopListening = useCallback(() => {
    if (autoListenTimeoutRef.current) {
      clearTimeout(autoListenTimeoutRef.current)
      autoListenTimeoutRef.current = null
    }

    // Stop MediaRecorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) { }
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        isRecognitionActiveRef.current = false
        setIsListening(false)
      } catch (e) { }
    }

    isRecognitionActiveRef.current = false
    setIsListening(false)
  }, [])

  const stopFormFilling = useCallback(() => {
    setIsFormMode(false)
    setIsAutoMode(false)
    stopListening()
    stopSpeaking()

    if (autoListenTimeoutRef.current) {
      clearTimeout(autoListenTimeoutRef.current)
      autoListenTimeoutRef.current = null
    }
  }, [stopListening, stopSpeaking])

  const processVoiceInput = useCallback(
    async (input: string) => {
      if (!input.trim()) return

      const lowerInput = input.toLowerCase().trim()
      addChatMessage({ role: "user", content: input })

      if (
        pathname === "/dashboard" &&
        (lowerInput.includes("guide") ||
          lowerInput.includes("help") ||
          lowerInput.includes("tour") ||
          lowerInput.includes("मदद") ||
          lowerInput.includes("गाइड"))
      ) {
        const guide = dashboardFeatures[language].join(" ")
        addChatMessage({ role: "assistant", content: guide, type: "info" })
        await speak(guide)
        return
      }

      // ── Helper: navigate and clean up mic ──
      const doNavigate = async (key: string, path: string) => {
        const msg = language === "en" ? `Opening ${key}...` : `${key} खोल रहे हैं...`
        addChatMessage({ role: "assistant", content: msg, type: "navigation" })
        // Stop mic before navigating to avoid stale listeners on new page
        if (recognitionRef.current) {
          try { recognitionRef.current.stop() } catch (e) { }
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          try { mediaRecorderRef.current.stop() } catch (e) { }
        }
        isRecognitionActiveRef.current = false
        setIsListening(false)
        // Speak and navigate (don't await speak — navigate immediately)
        speak(msg)
        router.push(path)
      }

      // ── Navigation: explicit prefix commands ──
      // e.g. "go to eligibility", "open loans", "navigate to settings"
      if (
        lowerInput.includes("go to") ||
        lowerInput.includes("open") ||
        lowerInput.includes("navigate") ||
        lowerInput.includes("show") ||
        lowerInput.includes("take me") ||
        lowerInput.includes("switch to") ||
        lowerInput.includes("जाओ") ||
        lowerInput.includes("खोलो") ||
        lowerInput.includes("दिखाओ")
      ) {
        for (const [key, cmd] of Object.entries(navigationCommands)) {
          const keywords = [...cmd.keywords.en, ...cmd.keywords.hi]
          if (keywords.some((kw) => lowerInput.includes(kw.toLowerCase()))) {
            await doNavigate(key, cmd.paths[0])
            return
          }
        }
      }

      // ── Navigation: keyword-only fallback (no prefix required) ──
      // If user just says "eligibility" or "loans", still navigate.
      // Check longer keywords first to avoid "dashboard" shadowing specific routes.
      if (!isFormMode) {
        for (const [key, cmd] of Object.entries(navigationCommands)) {
          const keywords = [...cmd.keywords.en, ...cmd.keywords.hi]
          if (keywords.some((kw) => kw.toLowerCase().split(" ").length > 1 && lowerInput.includes(kw.toLowerCase()))) {
            await doNavigate(key, cmd.paths[0])
            return
          }
        }
        // Then try single-word keyword matches
        for (const [key, cmd] of Object.entries(navigationCommands)) {
          const keywords = [...cmd.keywords.en, ...cmd.keywords.hi]
          if (keywords.some((kw) => lowerInput.includes(kw.toLowerCase()))) {
            await doNavigate(key, cmd.paths[0])
            return
          }
        }
      }

      if (isFormMode) {
        if (
          lowerInput.includes("stop") ||
          lowerInput.includes("cancel") ||
          lowerInput.includes("quit") ||
          lowerInput.includes("रोको") ||
          lowerInput.includes("बंद")
        ) {
          stopFormFilling()
          const msg = language === "en" ? "Voice filling stopped." : "आवाज भरना बंद हो गया।"
          addChatMessage({ role: "assistant", content: msg, type: "info" })
          await speak(msg)
          return
        }

        if (
          lowerInput.includes("next") ||
          lowerInput.includes("skip") ||
          lowerInput.includes("continue") ||
          lowerInput.includes("अगला") ||
          lowerInput.includes("छोड़ो")
        ) {
          await goToNextField()
          return
        }

        if (lowerInput.includes("back") || lowerInput.includes("previous") || lowerInput.includes("पिछला")) {
          goToPrevField()
          return
        }

        const currentField = registeredFields[currentFieldIndex]
        if (!currentField) return

        let processedValue: any = input
        let valueForDisplay: string = input
        const isValid = true

        if (currentField.type === "number" || currentField.type === "slider") {
          // Enhanced Number Extraction Logic
          let caughtDigits = input.match(/\d+/) ? Number.parseInt(input.match(/\d+/)![0]) : 0

          // Word-to-Number Parsing (handles "twenty seven", etc.)
          const units: Record<string, number> = {
            zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
            eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
            एक: 1, दो: 2, तीन: 3, चार: 4, पांच: 5, छह: 6, सात: 7, आठ: 8, नौ: 9, दस: 10
          }
          const tens: Record<string, number> = {
            twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
            बीस: 20, तीस: 30, चालीस: 40, पचास: 50
          }

          let wordVal = 0
          const words = lowerInput.split(/\s+/)
          for (let i = 0; i < words.length; i++) {
            const word = words[i]
            const nextWord = words[i + 1]

            if (tens[word]) {
              wordVal += tens[word]
              if (nextWord && units[nextWord]) {
                wordVal += units[nextWord]
                i++ // skip next
              }
            } else if (units[word]) {
              wordVal += units[word]
            }
          }

          // Pick the best match
          let numValue = wordVal > 0 ? wordVal : caughtDigits

          // Multipliers (Lakh, Crore, etc.) - apply to whatever we found
          const croreMatch = lowerInput.match(/(\d+\.?\d*)\s*(crore|cr|करोड़)/i)
          const lakhMatch = lowerInput.match(/(\d+\.?\d*)\s*(lakh|lac|लाख|l)/i)
          const thousandMatch = lowerInput.match(/(\d+\.?\d*)\s*(thousand|हजार|k|th)/i)

          if (croreMatch) numValue = Number.parseFloat(croreMatch[1]) * 10000000
          else if (lakhMatch) numValue = Number.parseFloat(lakhMatch[1]) * 100000
          else if (thousandMatch) numValue = Number.parseFloat(thousandMatch[1]) * 1000

          if (numValue > 0) {
            processedValue = Math.round(numValue)
            valueForDisplay = numValue.toLocaleString("en-IN")
          } else {
            const hintMsg =
              language === "en"
                ? `I caught "${input}". Please say your age clearly, like "twenty five" or "25".`
                : `मैंने "${input}" सुना। कृपया अपनी उम्र स्पष्ट रूप से कहें, जैसे "पच्चीस" या "25"।`
            addChatMessage({ role: "assistant", content: hintMsg, type: "info" })
            shouldAutoListenRef.current = true
            await speak(hintMsg)
            return
          }
        } else if (currentField.type === "select" && currentField.options) {
          let matchedOption = currentField.options.find((opt) => {
            const optValue = opt.value.toLowerCase()
            const optLabel = opt.label.toLowerCase()
            return lowerInput.includes(optValue) || lowerInput.includes(optLabel)
          })

          if (!matchedOption && currentField.id === "savingsRange") {
            if (
              lowerInput.includes("0") ||
              lowerInput.includes("zero") ||
              lowerInput.includes("less") ||
              lowerInput.includes("शून्य")
            ) {
              matchedOption = currentField.options[0]
            } else if (lowerInput.includes("50") && (lowerInput.includes("thousand") || lowerInput.includes("हजार"))) {
              matchedOption = currentField.options[1]
            } else if (lowerInput.includes("lakh") || lowerInput.includes("लाख") || lowerInput.includes("lac")) {
              if (lowerInput.includes("1") || lowerInput.includes("one")) {
                matchedOption = currentField.options[2]
              } else if (
                lowerInput.includes("5") ||
                lowerInput.includes("five") ||
                lowerInput.includes("more") ||
                lowerInput.includes("above")
              ) {
                matchedOption = currentField.options[3]
              }
            }
          }

          if (!matchedOption) {
            matchedOption = currentField.options.find((opt) => {
              const words = opt.label.toLowerCase().split(" ")
              return words.some((word) => word.length > 2 && lowerInput.includes(word))
            })
          }

          if (!matchedOption) {
            const indexWords = ["first", "second", "third", "fourth", "1st", "2nd", "3rd", "4th", "पहला", "दूसरा"]
            const matchedIndex = indexWords.findIndex((w) => lowerInput.includes(w))
            if (matchedIndex !== -1 && matchedIndex < currentField.options.length) {
              matchedOption = currentField.options[matchedIndex % currentField.options.length]
            }
          }

          if (matchedOption) {
            processedValue = matchedOption.value
            valueForDisplay = matchedOption.label
          } else {
            const optionsList = currentField.options.map((o) => o.label).join(", ")
            const errorMsg =
              language === "en"
                ? `Please choose one: ${optionsList}. Or say "skip".`
                : `कृपया चुनें: ${optionsList}। या "छोड़ो" बोलें।`
            addChatMessage({ role: "assistant", content: errorMsg, type: "info" })
            // Re-enable auto-listen so user can retry
            shouldAutoListenRef.current = true
            await speak(errorMsg)
            return
          }
        } else if (currentField.type === "switch") {
          const yesWords = ["yes", "yeah", "yep", "sure", "ok", "okay", "हां", "हाँ", "जी", "ठीक"]
          const noWords = ["no", "nope", "nah", "नहीं", "ना"]

          if (yesWords.some((w) => lowerInput.includes(w))) {
            processedValue = true
            valueForDisplay = language === "en" ? "Yes" : "हां"
          } else if (noWords.some((w) => lowerInput.includes(w))) {
            processedValue = false
            valueForDisplay = language === "en" ? "No" : "नहीं"
          } else {
            const errorMsg = language === "en" ? "Please say 'yes' or 'no'." : "कृपया 'हां' या 'नहीं' बोलें।"
            addChatMessage({ role: "assistant", content: errorMsg, type: "info" })
            // Re-enable auto-listen so user can retry
            shouldAutoListenRef.current = true
            await speak(errorMsg)
            return
          }
        } else {
          processedValue = input.trim()
          valueForDisplay = input.trim()

          if (currentField.id === "name" || currentField.id === "city" || currentField.id === "companyName") {
            processedValue = input
              .trim()
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ")
            valueForDisplay = processedValue
          }
        }

        if (onFieldUpdateRef.current && isValid) {
          onFieldUpdateRef.current(currentField.id, processedValue)

          const confirmMsg =
            language === "en"
              ? `Got it, ${valueForDisplay}. Moving forward.`
              : `समझ गया, ${valueForDisplay}। आगे बढ़ रहे हैं।`
          addChatMessage({ role: "assistant", content: confirmMsg, type: "confirmation" })
          await speak(confirmMsg)

          await new Promise((resolve) => setTimeout(resolve, 300))
          await goToNextField()
        }
      }
    },
    [
      isFormMode,
      currentFieldIndex,
      registeredFields,
      language,
      speak,
      addChatMessage,
      router,
      pathname,
      goToNextField,
      goToPrevField,
      stopFormFilling,
    ],
  )

  useEffect(() => {
    processVoiceInputRef.current = processVoiceInput
  }, [processVoiceInput])

  useEffect(() => {
    if (typeof window === "undefined" || isInitializedRef.current) return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = language === "hi" ? "hi-IN" : "en-IN"
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        isRecognitionActiveRef.current = true
        setIsListening(true)
      }

      recognition.onend = () => {
        isRecognitionActiveRef.current = false
        setIsListening(false)
        // Do NOT auto-restart here — let the speak() → shouldAutoListenRef flow handle it
      }

      recognition.onerror = (event: any) => {
        isRecognitionActiveRef.current = false
        setIsListening(false)

        if (event.error === "no-speech" || event.error === "audio-capture") {
          // Only retry if we are actively waiting for a question answer
          if (isFormModeRef.current && isAutoModeRef.current && shouldAutoListenRef.current) {
            autoListenTimeoutRef.current = setTimeout(() => {
              startListeningInternal()
            }, 800)
          }
        } else if (event.error !== "aborted") {
          console.log("[v0] Speech error:", event.error)
        }
      }

      // Debounce timer for interim transcript fallback
      let interimDebounceTimer: ReturnType<typeof setTimeout> | null = null

      recognition.onresult = (event: any) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        const currentTranscript = finalTranscript || interimTranscript
        if (currentTranscript) {
          setTranscript(currentTranscript)
        }

        // Clear any pending interim debounce
        if (interimDebounceTimer) {
          clearTimeout(interimDebounceTimer)
          interimDebounceTimer = null
        }

        // FINAL transcript — process immediately
        if (finalTranscript && processVoiceInputRef.current && !hasProcessedCurrentInputRef.current) {
          hasProcessedCurrentInputRef.current = true
          // Stop MediaRecorder if running (form mode) to avoid double-processing
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            try { mediaRecorderRef.current.stop() } catch (e) { }
          }
          processVoiceInputRef.current(finalTranscript)
          return
        }

        // INTERIM fallback — if no final result within 2s of stable interim, process it anyway
        if (interimTranscript && !hasProcessedCurrentInputRef.current && !isFormModeRef.current) {
          const stableTranscript = interimTranscript
          interimDebounceTimer = setTimeout(() => {
            if (!hasProcessedCurrentInputRef.current && processVoiceInputRef.current && stableTranscript) {
              hasProcessedCurrentInputRef.current = true
              processVoiceInputRef.current(stableTranscript)
            }
          }, 2000)
        }
      }

      recognitionRef.current = recognition
    }

    synthRef.current = window.speechSynthesis
    isInitializedRef.current = true

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) { }
      }
      if (autoListenTimeoutRef.current) {
        clearTimeout(autoListenTimeoutRef.current)
      }
    }
  }, [language, startListeningInternal, isSpeaking])

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-IN"
    }
  }, [language])

  const startListening = useCallback(() => {
    startListeningInternal()
  }, [startListeningInternal])

  const registerFields = useCallback((fields: FormField[]) => {
    setRegisteredFields(fields)
    registeredFieldsRef.current = fields
  }, [])

  const unregisterFields = useCallback(() => {
    setRegisteredFields([])
    registeredFieldsRef.current = []
    setCurrentFieldIndex(0)
    currentFieldIndexRef.current = 0
  }, [])

  const startFormFilling = useCallback(async () => {
    if (registeredFields.length === 0) {
      const errorMsg =
        language === "en"
          ? "No form fields registered. Please make sure you're on the onboarding page."
          : "कोई फॉर्म नहीं मिला।"
      addChatMessage({ role: "assistant", content: errorMsg, type: "error" })
      await speak(errorMsg)
      return
    }

    setIsFormMode(true)
    setIsAutoMode(true)
    setCurrentFieldIndex(0)
    clearChat()

    const welcomeMsg =
      language === "en"
        ? "Starting voice form filling. I'll ask you questions one by one. Say 'skip' to move to the next field, or 'stop' to exit."
        : "आवाज़ द्वारा फॉर्म भरना शुरू कर रहे हैं। मैं आपसे एक-एक करके सवाल पूछूंगा।"

    addChatMessage({ role: "assistant", content: welcomeMsg, type: "info" })
    await speak(welcomeMsg)

    await new Promise((resolve) => setTimeout(resolve, 200))

    const firstField = registeredFields[0]
    const question = firstField.question[language]
    addChatMessage({ role: "assistant", content: question, type: "question" })
    shouldAutoListenRef.current = true
    await speak(question)
  }, [registeredFields, language, speak, addChatMessage, clearChat])

  const setOnFieldUpdate = useCallback((callback: (fieldId: string, value: any) => void) => {
    onFieldUpdateRef.current = callback
  }, [])

  const setOnStepChange = useCallback((callback: (direction: "next" | "back") => void) => {
    onStepChangeRef.current = callback
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang === "hi" ? "hi-IN" : "en-IN"
    }
  }, [])

  const guideDashboard = useCallback(async () => {
    const guide = dashboardFeatures[language].join(" ")
    addChatMessage({ role: "assistant", content: guide, type: "info" })
    await speak(guide)
  }, [language, speak, addChatMessage])

  const value: VoiceAssistantContextType = {
    isListening,
    isSpeaking,
    language,
    voiceEnabled,
    transcript,
    currentFieldIndex,
    isFormMode,
    registeredFields,
    chatMessages,
    isOpen,
    isAutoMode,
    setLanguage: setLanguageState,
    setVoiceEnabled,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    registerFields: setRegisteredFields,
    unregisterFields: () => setRegisteredFields([]),
    startFormFilling,
    stopFormFilling,
    processVoiceInput,
    setOnFieldUpdate: (cb) => {
      onFieldUpdateRef.current = cb
    },
    goToNextField,
    goToPrevField,
    navigateTo: (path: string) => router.push(path),
    setIsOpen,
    addChatMessage,
    clearChat,
    setIsAutoMode,
    setOnStepChange: (cb) => {
      onStepChangeRef.current = cb
    },
    guideDashboard,
  }

  return <VoiceAssistantContext.Provider value={value}>{children}</VoiceAssistantContext.Provider>
}

export function useVoiceAssistant() {
  const context = useContext(VoiceAssistantContext)
  if (!context) {
    throw new Error("useVoiceAssistant must be used within VoiceAssistantProvider")
  }
  return context
}
