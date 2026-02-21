"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, X, Globe, Volume2, VolumeX, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useVoiceAssistant } from "@/lib/voice-assistant-context"

export default function VoiceAssistantButton() {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    isListening,
    isSpeaking,
    language,
    voiceEnabled,
    transcript,
    isFormMode,
    registeredFields,
    currentFieldIndex,
    chatMessages,
    isOpen,
    setLanguage,
    setVoiceEnabled,
    startListening,
    stopListening,
    stopSpeaking,
    startFormFilling,
    stopFormFilling,
    setIsOpen,
  } = useVoiceAssistant()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const handleMicClick = () => {
    if (isListening) {
      stopListening()
      setIsOpen(false)
    } else {
      if (isSpeaking) stopSpeaking()
      startListening()
      setIsOpen(true)
    }
  }

  const handleStartFilling = () => {
    if (!isFormMode && registeredFields.length > 0) {
      setIsOpen(true)
      startFormFilling()
    } else if (isFormMode) {
      stopFormFilling()
    }
  }

  // --- MINIMAL UI (Navigation Mode) ---
  if (!isFormMode) {
    return (
      <>
        {/* Transcript / Response Pill */}
        <AnimatePresence>
          {(isListening || isSpeaking || transcript) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="fixed bottom-24 right-24 z-50 mb-2 max-w-xs pointer-events-none"
            >
              <div className="bg-gray-900/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-xl border border-white/10 flex items-center gap-3">
                {isSpeaking ? (
                  <Volume2 className="w-4 h-4 text-blue-400 animate-pulse" />
                ) : (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
                <span className="text-sm font-medium">
                  {transcript || (isSpeaking ? "Speaking..." : (language === "en" ? "Listening..." : "सुन रहा हूं..."))}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Mic Button */}
        <motion.button
          onClick={handleMicClick}
          className={`fixed bottom-6 right-24 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all bg-gradient-to-br ${isListening
              ? "from-red-500 to-rose-600 ring-4 ring-red-200"
              : "from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </motion.button>
      </>
    )
  }

  // --- EXTENDED UI (Form Mode - Keep existing Card) ---
  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-24 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mic className="w-6 h-6 text-white" />
            <span className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-50" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-24 z-50 w-[360px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
                    <Mic className="w-5 h-5 text-white" />
                    {isListening && (
                      <span className="absolute inset-0 rounded-full border-2 border-white animate-ping" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      {language === "en" ? "Voice Form Assistant" : "वॉइस फॉर्म असिस्टेंट"}
                    </h3>
                    <p className="text-white/80 text-xs">
                      {currentFieldIndex + 1}/{registeredFields.length} {language === "en" ? "fields" : "फील्ड"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                    className="text-white hover:bg-white/20 h-8 w-8"
                  >
                    <Globe className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages - Compact view */}
            <div className="flex-1 max-h-[300px] overflow-y-auto p-3 space-y-2 bg-gray-50">
              {chatMessages.slice(-8).map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${message.role === "user"
                      ? "bg-violet-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
                      }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                onClick={handleStartFilling}
                className="w-full mb-3 rounded-xl p-3 flex items-center justify-center gap-2 transition-all bg-red-50 hover:bg-red-100 border border-red-200"
              >
                <Sparkles className="w-4 h-4 text-red-600" />
                <span className="font-medium text-sm text-red-700">
                  {language === "en" ? "Stop Voice Filling" : "वॉइस भरना बंद करें"}
                </span>
              </button>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMicClick}
                  className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all flex-shrink-0 ${isListening
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                    }`}
                >
                  {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                </motion.button>

                <div className="flex-1 text-center">
                  <p className="text-sm text-gray-600">
                    {isListening ? (language === "en" ? "Speak now..." : "अब बोलें...") : (language === "en" ? "Click to speak" : "बोलने के लिए दबाएं")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
