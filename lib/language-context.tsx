"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { Language } from "./i18n"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language
    if (saved) {
      setLanguageState(saved)
      return
    }

    const detect = async () => {
      try {
        if (typeof window === "undefined") return
        const res = await fetch("https://ipapi.co/json/")
        if (!res.ok) return
        const json = await res.json()
        const langsRaw = ((json as any).languages as string | undefined) || ""
        const langs = langsRaw.toLowerCase()
        const cityFromIp = (json as any).city as string | undefined
        const regionFromIp = (json as any).region as string | undefined
        const regionLower = (regionFromIp || "").toLowerCase()

        let lang: Language = "en"

        if (regionLower.includes("maharashtra")) {
          lang = "mr"
        } else if (langs.includes("hi")) {
          lang = "hi"
        } else if (langs.includes("mr")) {
          lang = "mr"
        } else if (langs.includes("ta")) {
          lang = "ta"
        } else if (langs.includes("bn")) {
          lang = "bn"
        }

        setLanguageState(lang)
        localStorage.setItem("language", lang)
        if (cityFromIp) localStorage.setItem("detectedCity", cityFromIp)
        if (regionFromIp) localStorage.setItem("detectedRegion", regionFromIp)
        if (langsRaw) localStorage.setItem("detectedLanguages", langsRaw)
      } catch {
      }
    }

    detect()
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
