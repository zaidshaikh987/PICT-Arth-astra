"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/user-context"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Goal, Plus, Trash2, Home, Car, GraduationCap, Briefcase, Heart, TrendingUp, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/i18n"
import { calculateDetailedEligibility } from "@/lib/tools/eligibility-calculator"

type LoanGoal = {
  id: string
  type: string
  amount: number
  timeline: number
  priority: "high" | "medium" | "low"
}

const goalTypes = [
  { id: "home", name: "Home Loan", nameHi: "गृह ऋण", nameMr: "गृह कर्ज", icon: Home, color: "from-blue-500 to-blue-600" },
  { id: "car", name: "Car Loan", nameHi: "कार ऋण", nameMr: "कार कर्ज", icon: Car, color: "from-blue-500 to-blue-600" },
  {
    id: "education",
    name: "Education Loan",
    nameHi: "शिक्षा ऋण",
    nameMr: "शिक्षा कर्ज",
    icon: GraduationCap,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "business",
    name: "Business Loan",
    nameHi: "व्यापार ऋण",
    nameMr: "व्यापार कर्ज",
    icon: Briefcase,
    color: "from-orange-500 to-orange-600",
  },
  { id: "personal", name: "Personal Loan", nameHi: "व्यक्तिगत ऋण", nameMr: "वैयक्तिक कर्ज", icon: Heart, color: "from-pink-500 to-pink-600" },
]

function getGoalName(goal: typeof goalTypes[0], language: string) {
  if (language === "mr") return goal.nameMr || goal.name
  if (language === "hi") return goal.nameHi
  return goal.name
}

export default function MultiGoalPlanner() {
  const [goals, setGoals] = useState<LoanGoal[]>([])
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState<Partial<LoanGoal>>({})
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [maxEligible, setMaxEligible] = useState(0)
  const { language } = useLanguage()
  const { user, updateUser } = useUser()

  useEffect(() => {
    if (user) {
      if (user.loanGoals) setGoals(user.loanGoals)

      // Calculate max eligibility for feasibility checks
      const eligible = calculateDetailedEligibility(user)
      setMaxEligible(eligible.maxAmount)
    }
  }, [user])

  const saveGoals = (newGoals: LoanGoal[]) => {
    setGoals(newGoals)
    updateUser({ loanGoals: newGoals })
  }

  const addGoal = () => {
    if (newGoal.type && newGoal.amount && newGoal.timeline) {
      const goal: LoanGoal = {
        id: Date.now().toString(),
        type: newGoal.type,
        amount: newGoal.amount,
        timeline: newGoal.timeline,
        priority: newGoal.priority || "medium",
      }
      saveGoals([...goals, goal])
      setNewGoal({})
      setShowAddGoal(false)
    }
  }

  const removeGoal = (id: string) => {
    saveGoals(goals.filter((g) => g.id !== id))
  }

  const getFeasibility = (amount: number, timeline: number) => {
    // Simple logic: If current max + assumption of 10% growth per year > amount needed
    const projectedGrowth = Math.pow(1.10, timeline) // 10% assumed income growth/capacity growth
    const projectedCapacity = maxEligible * projectedGrowth

    if (amount <= maxEligible) return { label: "Feasible Now", color: "text-green-600 bg-green-50", icon: CheckCircle2 }
    if (amount <= projectedCapacity) return { label: "Feasible in Future", color: "text-blue-600 bg-blue-50", icon: TrendingUp }
    return { label: "Stretch Goal", color: "text-orange-600 bg-orange-50", icon: AlertTriangle }
  }

  const getAISuggestion = async () => {
    if (goals.length === 0) return

    setIsLoadingAI(true)
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `I have multiple loan goals: ${goals
                .map((g) => {
                  const type = goalTypes.find((t) => t.id === g.type)
                  return `${type?.name}: ₹${g.amount.toLocaleString()} in ${g.timeline} years (${g.priority} priority)`
                })
                .join(
                  ", ",
                )}. Please suggest the best order to apply for these loans, considering my financial situation and Indian lending practices. Keep the response brief (2-3 sentences).`,
            },
          ],
          language,
        }),
      })
      const data = await response.json()
      setAiSuggestion(data.response || data.error)
    } catch (error) {
      setAiSuggestion(language === "hi" ? "सुझाव प्राप्त करने में त्रुटि हुई।" : "Error getting suggestion.")
    } finally {
      setIsLoadingAI(false)
    }
  }

  const totalAmount = goals.reduce((sum, g) => sum + g.amount, 0)
  const getGoalType = (typeId: string) => goalTypes.find((t) => t.id === typeId)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Goal className="w-8 h-8 text-blue-600" />
          {language === "hi" ? "बहु-लक्ष्य ऋण योजनाकार" : "Multi-Goal Loan Planner"}
        </h1>
        <p className="text-gray-600 mt-2">
          {language === "hi"
            ? "अपने सभी ऋण लक्ष्यों की योजना बनाएं और सर्वोत्तम रणनीति प्राप्त करें"
            : "Plan all your loan goals and get the best strategy"}
        </p>
      </div>

      {/* Summary Card */}
      {goals.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {language === "hi" ? "कुल ऋण लक्ष्य" : "Total Loan Goals"}
              </h3>
              <div className="text-3xl font-bold text-blue-600 mt-1">₹{totalAmount.toLocaleString("en-IN")}</div>
              <p className="text-gray-600 text-sm mt-1">
                {goals.length} {language === "hi" ? "लक्ष्य" : "goals"} {language === "hi" ? "योजनाबद्ध" : "planned"}
              </p>
            </div>
            <Button onClick={getAISuggestion} disabled={isLoadingAI} className="bg-blue-600 hover:bg-blue-700">
              <Sparkles className="w-4 h-4 mr-2" />
              {isLoadingAI
                ? language === "hi"
                  ? "विश्लेषण..."
                  : "Analyzing..."
                : language === "hi"
                  ? "AI सुझाव प्राप्त करें"
                  : "Get AI Suggestion"}
            </Button>
          </div>

          {/* AI Suggestion */}
          {aiSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-white rounded-xl border border-blue-200"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{aiSuggestion}</p>
              </div>
            </motion.div>
          )}
        </Card>
      )}

      {/* Goals List */}
      <div className="grid md:grid-cols-2 gap-4">
        {goals.map((goal, idx) => {
          const goalType = getGoalType(goal.type)
          if (!goalType) return null
          const GoalIcon = goalType.icon
          const feasibility = getFeasibility(goal.amount, goal.timeline)
          const FeasIcon = feasibility.icon

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-6 hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goalType.color} flex items-center justify-center`}
                    >
                      <GoalIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {language === "hi" ? goalType.nameHi : goalType.name}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide ${goal.priority === "high"
                            ? "bg-red-100 text-red-600"
                            : goal.priority === "medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                            }`}
                        >
                          {goal.priority}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${feasibility.color}`}>
                          <FeasIcon className="w-3 h-3" />
                          {feasibility.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeGoal(goal.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{language === "hi" ? "लक्ष्य राशि" : "Target Amount"}</span>
                    <span className="font-semibold text-gray-900">₹{goal.amount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{language === "hi" ? "समयरेखा" : "Timeline"}</span>
                    <span className="font-semibold text-gray-900">
                      {goal.timeline} {language === "hi" ? "वर्ष" : "years"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{language === "hi" ? "अनुमानित EMI" : "Est. EMI"}</span>
                    <span className="font-semibold text-blue-600">
                      ₹{Math.round(goal.amount * 0.009).toLocaleString("en-IN")}/mo
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}

        {/* Add Goal Card */}
        {!showAddGoal ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card
              className="p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px]"
              onClick={() => setShowAddGoal(true)}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-700">{language === "hi" ? "नया लक्ष्य जोड़ें" : "Add New Goal"}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {language === "hi" ? "अपने अगले ऋण की योजना बनाएं" : "Plan your next loan"}
              </p>
            </Card>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {language === "hi" ? "नया लक्ष्य जोड़ें" : "Add New Goal"}
              </h3>

              <div className="space-y-4">
                {/* Goal Type Selection */}
                <div>
                  <Label>{language === "hi" ? "ऋण प्रकार" : "Loan Type"}</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {goalTypes.map((type) => {
                      const TypeIcon = type.icon
                      return (
                        <button
                          key={type.id}
                          onClick={() => setNewGoal((prev) => ({ ...prev, type: type.id }))}
                          className={`p-3 rounded-xl border-2 transition-all text-center ${newGoal.type === type.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                            }`}
                        >
                          <TypeIcon
                            className={`w-5 h-5 mx-auto ${newGoal.type === type.id ? "text-blue-600" : "text-gray-500"
                              }`}
                          />
                          <span className="text-xs mt-1 block">{language === "hi" ? type.nameHi : type.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <Label>{language === "hi" ? "राशि (₹)" : "Amount (₹)"}</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 5000000"
                    value={newGoal.amount || ""}
                    onChange={(e) => setNewGoal((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                    className="mt-1"
                  />
                </div>

                {/* Timeline */}
                <div>
                  <Label>{language === "hi" ? "समयरेखा (वर्ष)" : "Timeline (years)"}</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 5"
                    value={newGoal.timeline || ""}
                    onChange={(e) => setNewGoal((prev) => ({ ...prev, timeline: Number(e.target.value) }))}
                    className="mt-1"
                  />
                </div>

                {/* Priority */}
                <div>
                  <Label>{language === "hi" ? "प्राथमिकता" : "Priority"}</Label>
                  <div className="flex gap-2 mt-2">
                    {(["high", "medium", "low"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setNewGoal((prev) => ({ ...prev, priority: p }))}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${newGoal.priority === p
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                          }`}
                      >
                        {p === "high"
                          ? language === "hi"
                            ? "उच्च"
                            : "High"
                          : p === "medium"
                            ? language === "hi"
                              ? "मध्यम"
                              : "Medium"
                            : language === "hi"
                              ? "निम्न"
                              : "Low"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setShowAddGoal(false)
                      setNewGoal({})
                    }}
                  >
                    {language === "hi" ? "रद्द करें" : "Cancel"}
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={addGoal}
                    disabled={!newGoal.type || !newGoal.amount || !newGoal.timeline}
                  >
                    {language === "hi" ? "जोड़ें" : "Add Goal"}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Empty State */}
      {goals.length === 0 && !showAddGoal && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">{language === "hi" ? "कोई लक्ष्य नहीं" : "No Goals Yet"}</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">
            {language === "hi"
              ? "अपने ऋण लक्ष्यों की योजना बनाना शुरू करें और सर्वोत्तम रणनीति प्राप्त करें।"
              : "Start planning your loan goals and get the best strategy for achieving them."}
          </p>
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddGoal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {language === "hi" ? "पहला लक्ष्य जोड़ें" : "Add First Goal"}
          </Button>
        </Card>
      )}
    </div>
  )
}
