"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Loader2, Bot, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/language-context"

type Message = {
  role: "user" | "assistant"
  content: string
  agent?: string
}

export default function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { language } = useLanguage()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting =
        language === "hi"
          ? "नमस्ते! मैं ArthAstra का AI असिस्टेंट हूं। लोन, पात्रता, EMI, या किसी भी वित्तीय सवाल में मैं आपकी मदद कर सकता हूं। आज मैं आपकी क्या मदद कर सकता हूं?"
          : "Hello! I'm ArthAstra's AI assistant. I can help you with loans, eligibility, EMI calculations, or any financial questions. How can I help you today?"
      setMessages([{ role: "assistant", content: greeting }])
    }
  }, [isOpen, language, messages.length])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      // Get user profile for context
      let userContext = null
      try {
        const data = localStorage.getItem("onboardingData")
        if (data) userContext = JSON.parse(data)
      } catch (e) { }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage, context: userContext }],
          language,
        }),
      })

      const data = await response.json()
      const assistantMessage = data.error || data.response
      const agentName = data.agent || "GENERAL"

      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage, agent: agentName }])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            language === "hi"
              ? "क्षमा करें, कुछ गड़बड़ हुई। कृपया पुनः प्रयास करें।"
              : "Sorry, something went wrong. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Quick questions
  const quickQuestions =
    language === "hi"
      ? ["मेरी EMI कितनी होगी?", "लोन पात्रता कैसे बढ़ाएं?", "कौन सा बैंक बेहतर है?", "क्रेडिट स्कोर कैसे सुधारें?"]
      : ["What will be my EMI?", "How to improve eligibility?", "Which bank is better?", "How to improve credit score?"]

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-all ${isOpen ? "scale-0" : "scale-100"
          }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      ArthAstra AI
                      <Sparkles className="w-4 h-4" />
                    </h3>
                    <p className="text-white/80 text-xs">
                      {language === "hi" ? "जेमिनी द्वारा संचालित" : "Powered by Gemini"}
                    </p>
                  </div>
                </div>
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${message.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
                      }`}
                  >
                    {message.content}
                    {message.role === "assistant" && message.agent && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${message.agent === "GENERAL"
                            ? "bg-gray-100 text-gray-600 border-gray-200"
                            : "bg-emerald-100 text-emerald-700 border-emerald-200"
                          }`}>
                          {message.agent.replace("_", " ")} AGENT
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 rounded-bl-md">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span className="text-sm text-gray-600">
                        {language === "hi" ? "सोच रहा हूं..." : "Thinking..."}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 mb-2">{language === "hi" ? "जल्दी पूछें:" : "Quick questions:"}</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(q)
                        setTimeout(() => handleSend(), 100)
                      }}
                      className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder={language === "hi" ? "अपना सवाल लिखें..." : "Type your question..."}
                  className="flex-1 h-11 rounded-xl"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 h-11 w-11 rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
