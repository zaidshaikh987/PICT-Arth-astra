"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { Language } from "./i18n"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Indian states/regions → most spoken language mapping
const REGION_LANGUAGE_MAP: Record<string, Language> = {
  // Marathi-speaking
  maharashtra: "mr",
  goa: "mr",
  // Hindi belt
  "uttar pradesh": "hi",
  "madhya pradesh": "hi",
  rajasthan: "hi",
  bihar: "hi",
  jharkhand: "hi",
  chhattisgarh: "hi",
  haryana: "hi",
  "himachal pradesh": "hi",
  uttarakhand: "hi",
  delhi: "hi",
  "new delhi": "hi",
  chandigarh: "hi",
}

/** Detect language from an IP geolocation response */
function detectLangFromGeo(region: string, languages?: string): Language {
  const regionLower = (region || "").toLowerCase()

  // 1. Try exact region match
  for (const [key, lang] of Object.entries(REGION_LANGUAGE_MAP)) {
    if (regionLower.includes(key)) return lang
  }

  // 2. Fall back to languages string from API (e.g. "hi,en-US,mr")
  if (languages) {
    const langs = languages.toLowerCase()
    if (langs.startsWith("mr") || langs.includes(",mr")) return "mr"
    if (langs.startsWith("hi") || langs.includes(",hi")) return "hi"
  }

  // 3. Default to English
  return "en"
}

const CACHE_KEY = "lang_detect_cache"
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface LangCache {
  language: Language
  city?: string
  region?: string
  ts: number
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    if (typeof window === "undefined") return

    // Check cached detection (re-detect after 7 days)
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const cached: LangCache = JSON.parse(raw)
        if (Date.now() - cached.ts < CACHE_MAX_AGE_MS) {
          setLanguageState(cached.language)
          return
        }
      }
    } catch { /* corrupt cache, re-detect */ }

    const detect = async () => {
      let region = ""
      let city = ""
      let languages = ""

      // Try primary API: ipapi.co
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) })
        if (res.ok) {
          const json = await res.json()
          region = json.region || ""
          city = json.city || ""
          languages = json.languages || ""
        }
      } catch { /* try fallback */ }

      // Fallback API: ip-api.com (if primary failed)
      if (!region) {
        try {
          const res = await fetch("http://ip-api.com/json/?fields=regionName,city", { signal: AbortSignal.timeout(4000) })
          if (res.ok) {
            const json = await res.json()
            region = json.regionName || ""
            city = json.city || ""
          }
        } catch { /* detection failed, stay English */ }
      }

      const lang = detectLangFromGeo(region, languages)
      setLanguageState(lang)

      // Cache the result
      try {
        const cache: LangCache = { language: lang, city, region, ts: Date.now() }
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
        if (city) localStorage.setItem("detectedCity", city)
        if (region) localStorage.setItem("detectedRegion", region)
      } catch { /* localStorage full or unavailable */ }
    }

    detect()
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      const cache: LangCache = { language: lang, ts: Date.now() }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch { /* ignore */ }
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
