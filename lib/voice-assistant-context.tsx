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
  dashboard: {
    paths: ["/dashboard"],
    keywords: { en: ["dashboard", "home", "main", "overview"], hi: ["डैशबोर्ड", "होम", "मुख्य"] },
  },
  eligibility: {
    paths: ["/dashboard/eligibility"],
    keywords: { en: ["eligibility", "check eligibility", "eligibility report"], hi: ["पात्रता", "योग्यता"] },
  },
  loans: {
    paths: ["/dashboard/loans"],
    keywords: { en: ["loans", "loan comparison", "compare loans", "loan options"], hi: ["ऋण", "लोन", "तुलना"] },
  },
  optimizer: {
    paths: ["/dashboard/optimizer"],
    keywords: { en: ["optimizer", "credit optimizer", "credit path"], hi: ["ऑप्टिमाइज़र", "क्रेडिट"] },
  },
  timeline: {
    paths: ["/dashboard/timeline"],
    keywords: { en: ["timeline", "application timeline", "track application"], hi: ["टाइमलाइन", "आवेदन"] },
  },
  documents: {
    paths: ["/dashboard/documents"],
    keywords: { en: ["documents", "document checklist", "upload documents"], hi: ["दस्तावेज़", "डॉक्युमेंट"] },
  },
  rejection: {
    paths: ["/dashboard/rejection-recovery"],
    keywords: { en: ["rejection", "recovery", "rejection recovery"], hi: ["अस्वीकृति"] },
  },
  onboarding: {
    paths: ["/onboarding"],
    keywords: {
      en: ["onboarding", "start application", "apply", "new application", "fill form"],
      hi: ["आवेदन", "नया", "फॉर्म भरो"],
    },
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
  const useGeminiRef = useRef(true) // Use Gemini 2.5 Flash for transcription
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

        // Auto-restart if in form mode
        if (isFormModeRef.current && isAutoModeRef.current) {
          autoListenTimeoutRef.current = setTimeout(() => {
            startListeningInternal()
          }, 500)
        }
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

    // Use Gemini-based transcription with MediaRecorder
    if (useGeminiRef.current && typeof navigator !== "undefined" && navigator.mediaDevices) {
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
        isRecognitionActiveRef.current = true
        setIsListening(true)
        setTranscript("")

        // Auto-stop after 5 seconds
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop()
          }
        }, 5000)

        return
      } catch (error) {
        console.log("[Gemini] MediaRecorder not available, falling back to Web Speech API")
      }
    }

    // Fallback to Web Speech API
    if (!recognitionRef.current) return

    try {
      recognitionRef.current.stop()
    } catch (e) { }

    setTimeout(() => {
      if (!recognitionRef.current || isRecognitionActiveRef.current) return

      try {
        recognitionRef.current.start()
        isRecognitionActiveRef.current = true
        setIsListening(true)
        setTranscript("")
      } catch (e: any) {
        if (!e.message?.includes("already started")) {
          console.log("[v0] Recognition start error:", e.message)
        }
        isRecognitionActiveRef.current = false
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

          if (isFormModeRef.current && isAutoModeRef.current) {
            autoListenTimeoutRef.current = setTimeout(() => {
              startListeningInternal()
            }, 200)
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
      await speak(question)
    } else {
      const completeMsg =
        language === "en"
          ? "All fields completed! Say 'next' to continue to the next step."
          : "सभी फ़ील्ड पूर्ण हो गए! अगले चरण पर जाने के लिए 'अगला' कहें।"
      addChatMessage({ role: "assistant", content: completeMsg, type: "info" })
      await speak(completeMsg)
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

      if (
        lowerInput.includes("go to") ||
        lowerInput.includes("open") ||
        lowerInput.includes("navigate") ||
        lowerInput.includes("show") ||
        lowerInput.includes("जाओ") ||
        lowerInput.includes("खोलो")
      ) {
        for (const [key, cmd] of Object.entries(navigationCommands)) {
          const keywords = [...cmd.keywords.en, ...cmd.keywords.hi]
          if (keywords.some((kw) => lowerInput.includes(kw.toLowerCase()))) {
            const path = cmd.paths[0]
            const msg = language === "en" ? `Opening ${key}...` : `${key} खोल रहे हैं...`
            addChatMessage({ role: "assistant", content: msg, type: "navigation" })
            await speak(msg)
            router.push(path)
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
          let numValue = 0

          const croreMatch = lowerInput.match(/(\d+\.?\d*)\s*(crore|cr|करोड़)/i)
          const lakhMatch = lowerInput.match(/(\d+\.?\d*)\s*(lakh|lac|लाख|l)/i)
          const thousandMatch = lowerInput.match(/(\d+\.?\d*)\s*(thousand|हजार|k|th)/i)
          const hundredMatch = lowerInput.match(/(\d+\.?\d*)\s*(hundred|सौ)/i)
          const directMatch = input.match(/[\d,]+\.?\d*/)

          const wordNumbers: Record<string, number> = {
            one: 1,
            two: 2,
            three: 3,
            four: 4,
            five: 5,
            six: 6,
            seven: 7,
            eight: 8,
            nine: 9,
            ten: 10,
            fifteen: 15,
            twenty: 20,
            "twenty five": 25,
            thirty: 30,
            forty: 40,
            fifty: 50,
            sixty: 60,
            seventy: 70,
            eighty: 80,
            ninety: 90,
            hundred: 100,
            एक: 1,
            दो: 2,
            तीन: 3,
            चार: 4,
            पांच: 5,
            दस: 10,
            बीस: 20,
            पचास: 50,
          }

          for (const [word, num] of Object.entries(wordNumbers)) {
            if (lowerInput.includes(word)) {
              numValue = num
              break
            }
          }

          if (numValue === 0) {
            if (croreMatch) {
              numValue = Number.parseFloat(croreMatch[1]) * 10000000
            } else if (lakhMatch) {
              numValue = Number.parseFloat(lakhMatch[1]) * 100000
            } else if (thousandMatch) {
              numValue = Number.parseFloat(thousandMatch[1]) * 1000
            } else if (hundredMatch) {
              numValue = Number.parseFloat(hundredMatch[1]) * 100
            } else if (directMatch) {
              numValue = Number.parseFloat(directMatch[0].replace(/,/g, ""))
            }
          }

          if (numValue > 0) {
            processedValue = Math.round(numValue)
            valueForDisplay = numValue.toLocaleString("en-IN")
          } else {
            const hintMsg =
              language === "en"
                ? `I heard "${input}". Please say a number like "50 thousand" or "5 lakh". Or say "skip" to move on.`
                : `मैंने "${input}" सुना। कृपया एक संख्या बोलें जैसे "50 हजार" या "5 लाख"। या "छोड़ो" बोलें।`
            addChatMessage({ role: "assistant", content: hintMsg, type: "info" })
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
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = language === "hi" ? "hi-IN" : "en-IN"
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        isRecognitionActiveRef.current = true
        setIsListening(true)
      }

      recognition.onend = () => {
        isRecognitionActiveRef.current = false
        setIsListening(false)

        if (isFormModeRef.current && isAutoModeRef.current && !isSpeaking) {
          autoListenTimeoutRef.current = setTimeout(() => {
            startListeningInternal()
          }, 200)
        }
      }

      recognition.onerror = (event: any) => {
        isRecognitionActiveRef.current = false
        setIsListening(false)

        if (event.error === "no-speech" || event.error === "audio-capture") {
          if (isFormModeRef.current && isAutoModeRef.current) {
            autoListenTimeoutRef.current = setTimeout(() => {
              startListeningInternal()
            }, 500)
          }
        } else if (event.error !== "aborted") {
          console.log("[v0] Speech error:", event.error)
        }
      }

      recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript
        setTranscript(result)
        if (processVoiceInputRef.current) {
          processVoiceInputRef.current(result)
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
