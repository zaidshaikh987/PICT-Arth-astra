"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/user-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, TrendingUp, Calendar, Sparkles, RotateCcw } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { calculateDetailedEligibility } from "@/lib/tools/eligibility-calculator"

export default function CreditPathOptimizer() {
  const { user, updateUser } = useUser()
  const [userData, setUserData] = useState<any>(null)
  const [simulation, setSimulation] = useState({
    payOffDebt: 0,
    increaseIncome: 0,
    improveScore: 0,
    waitMonths: 0,
    jointApplication: false,
  })
  const [results, setResults] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setUserData(user)
    }
  }, [user])

  useEffect(() => {
    if (userData) {
      const optimized = simulateOptimization(userData, simulation)
      setResults(optimized)
    }
  }, [userData, simulation])

  const resetSimulation = () => {
    setSimulation({
      payOffDebt: 0,
      increaseIncome: 0,
      improveScore: 0,
      waitMonths: 0,
      jointApplication: false,
    })
  }

  const saveScenario = async () => {
    if (!user) return
    const newScenario = {
      id: Date.now(),
      name: `Plan ${new Date().toLocaleDateString()}`,
      simulation,
      results,
      createdAt: new Date()
    }
    const currentScenarios = user.savedScenarios || []
    try {
      await updateUser({ savedScenarios: [...currentScenarios, newScenario] })
      toast({
        title: "Scenario Saved",
        description: "Your optimization plan has been saved to your dashboard."
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save scenario.",
        variant: "destructive"
      })
    }
  }

  if (!userData || !results) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Credit Path Optimizer</h1>
          <p className="text-gray-600">Simulate scenarios to maximize your loan eligibility</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={resetSimulation} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveScenario} className="bg-blue-600 hover:bg-blue-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Save Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-2 border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Current Eligibility</h3>
            <Target className="w-6 h-6 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-600 mb-2">
            ₹{results.current.maxAmount.toLocaleString("en-IN")}
          </div>
          <p className="text-sm text-gray-500">{results.current.approvalOdds}% approval odds</p>
        </Card>

        <Card className="p-6 border-2 border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Projected Eligibility</h3>
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-indigo-600 mb-2">
            ₹{results.projected.maxAmount.toLocaleString("en-IN")}
          </div>
          <p className="text-sm text-indigo-700">{results.projected.approvalOdds}% approval odds</p>
        </Card>

        <Card className="p-6 border-2 border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Improvement</h3>
            <Sparkles className="w-6 h-6 text-cyan-600" />
          </div>
          <div className="text-3xl font-bold text-cyan-600 mb-2">
            +₹{results.improvement.amount.toLocaleString("en-IN")}
          </div>
          <p className="text-sm text-cyan-700">+{results.improvement.percentage.toFixed(0)}% increase</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Optimization Controls</h3>

          <Tabs defaultValue="debt" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="debt">Debt</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="credit">Credit</TabsTrigger>
            </TabsList>

            <TabsContent value="debt" className="space-y-6 pt-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Pay Off Existing Debt</Label>
                  <span className="text-sm font-bold text-blue-600">
                    ₹{simulation.payOffDebt.toLocaleString("en-IN")}
                  </span>
                </div>
                <Slider
                  value={[simulation.payOffDebt]}
                  onValueChange={([value]) => setSimulation({ ...simulation, payOffDebt: value })}
                  max={userData.existingEMI * 12 || 50000}
                  step={5000}
                  className="mb-2"
                />
                <p className="text-xs text-gray-600">Reduce your monthly EMI burden by paying off loans</p>
              </div>
            </TabsContent>

            <TabsContent value="income" className="space-y-6 pt-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Increase Monthly Income</Label>
                  <span className="text-sm font-bold text-blue-600">
                    +₹{simulation.increaseIncome.toLocaleString("en-IN")}
                  </span>
                </div>
                <Slider
                  value={[simulation.increaseIncome]}
                  onValueChange={([value]) => setSimulation({ ...simulation, increaseIncome: value })}
                  max={50000}
                  step={5000}
                  className="mb-2"
                />
                <p className="text-xs text-gray-600">Expected income increase in coming months</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <Label>Add Joint Applicant</Label>
                  <p className="text-xs text-gray-600 mt-1">Combine income with co-borrower</p>
                </div>
                <Switch
                  checked={simulation.jointApplication}
                  onCheckedChange={(checked) => setSimulation({ ...simulation, jointApplication: checked })}
                />
              </div>
            </TabsContent>

            <TabsContent value="credit" className="space-y-6 pt-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Improve Credit Score</Label>
                  <span className="text-sm font-bold text-blue-600">+{simulation.improveScore} points</span>
                </div>
                <Slider
                  value={[simulation.improveScore]}
                  onValueChange={([value]) => setSimulation({ ...simulation, improveScore: value })}
                  max={100}
                  step={10}
                  className="mb-2"
                />
                <p className="text-xs text-gray-600">Expected credit score improvement</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Wait Before Applying</Label>
                  <span className="text-sm font-bold text-blue-600">{simulation.waitMonths} months</span>
                </div>
                <Slider
                  value={[simulation.waitMonths]}
                  onValueChange={([value]) => setSimulation({ ...simulation, waitMonths: value })}
                  max={12}
                  step={1}
                  className="mb-2"
                />
                <p className="text-xs text-gray-600">Build credit history and savings</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Impact Analysis</h3>
          <div className="space-y-6">
            {results.impacts.map((impact: any, index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{impact.factor}</span>
                  <span className={`text-sm font-bold ${impact.change > 0 ? "text-green-600" : "text-gray-400"}`}>
                    {impact.change > 0 ? "+" : ""}
                    {impact.change}%
                  </span>
                </div>
                <Progress value={Math.abs(impact.change)} className="h-2 mb-1" />
                <p className="text-xs text-gray-600">{impact.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-100">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">AI Recommendation</h4>
                <p className="text-sm text-gray-700 mb-3">{results.aiRecommendation}</p>
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <Calendar className="w-4 h-4" />
                  <span>Estimated timeline: {results.timeline}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function simulateOptimization(userData: any, sim: any) {
  // 1. Calculate Current State using Source of Truth
  const currentEligibility = calculateDetailedEligibility(userData)

  // 2. Prepare Projected User Data
  const projectedIncome = (userData.monthlyIncome || 0) + sim.increaseIncome + (sim.jointApplication ? 40000 : 0)
  const currentEMI = userData.existingEMI || 0

  // Calculate reduced EMI based on payoff (assuming 18% interest rate for savings on debt)
  // If paying off X, we assume it reduces monthly burden approx X/36 (3 year loan) or just clear specific EMIs
  // Simple heuristic: Paying off debt reduces EMI by ~1.5% of the paid amount per month
  const emiReduction = sim.payOffDebt * 0.02
  const projectedEMI = Math.max(0, currentEMI - emiReduction)

  const projectedScore = Math.min(900, (userData.creditScore || 650) + sim.improveScore)

  const projectedUserData = {
    ...userData,
    monthlyIncome: projectedIncome,
    existingEMI: projectedEMI,
    creditScore: projectedScore,
    employmentType: userData.employmentType // Assume same for now unless joint changes it
  }

  // 3. Calculate Projected State using Source of Truth
  const projectedEligibility = calculateDetailedEligibility(projectedUserData)

  // Apply "Wait Months" bonus manually as it's not in the core calculator yet
  // Waiting > 6 months implies better history/stability
  let projectedMax = projectedEligibility.maxAmount
  if (sim.waitMonths >= 6) projectedMax *= 1.05

  const improvement = {
    amount: Math.floor(projectedMax - currentEligibility.maxAmount),
    percentage: currentEligibility.maxAmount > 0
      ? ((projectedMax - currentEligibility.maxAmount) / currentEligibility.maxAmount) * 100
      : 0,
  }

  const impacts = [
    {
      factor: "Debt Reduction",
      change: sim.payOffDebt > 0 ? Math.min(20, (sim.payOffDebt / 100000) * 10) : 0,
      description:
        sim.payOffDebt > 0 ? `Reduces EMI to ₹${Math.round(projectedEMI)}/mo` : "No change",
    },
    {
      factor: "Income Growth",
      change: sim.increaseIncome > 0 ? Math.min(25, (sim.increaseIncome / 10000) * 5) : 0,
      description:
        sim.increaseIncome > 0
          ? `New Income: ₹${projectedIncome.toLocaleString("en-IN")}`
          : "No change",
    },
    {
      factor: "Credit Score",
      change: sim.improveScore > 0 ? Math.min(15, sim.improveScore / 5) : 0,
      description: sim.improveScore > 0 ? `Score: ${projectedScore}` : "No change",
    },
    {
      factor: "Joint Application",
      change: sim.jointApplication ? 30 : 0,
      description: sim.jointApplication ? "Joint Income Boost" : "Single applicant",
    },
  ]

  const aiRecommendation = generateRecommendation(sim, impacts)
  const timeline = calculateTimeline(sim)

  return {
    current: {
      maxAmount: currentEligibility.maxAmount,
      approvalOdds: currentEligibility.approvalOdds,
    },
    projected: {
      maxAmount: Math.floor(projectedMax),
      approvalOdds: Math.min(98, projectedEligibility.approvalOdds + (sim.waitMonths > 6 ? 5 : 0)),
    },
    improvement,
    impacts: impacts.filter((i) => i.change > 0),
    aiRecommendation,
    timeline,
  }
}

function generateRecommendation(sim: any, impacts: any[]) {
  const maxImpact = impacts.reduce((max, i) => (i.change > max.change ? i : max), impacts[0])

  if (sim.jointApplication) {
    return "Adding a joint applicant has the highest impact. Consider applying with a spouse or family member with stable income."
  } else if (maxImpact?.factor === "Debt Reduction") {
    return "Focus on paying off existing high-interest loans first. This will significantly improve your DTI ratio and eligibility."
  } else if (maxImpact?.factor === "Income Growth") {
    return "Negotiate a raise or consider additional income sources. Higher income directly increases your loan eligibility."
  } else if (maxImpact?.factor === "Credit Score") {
    return "Work on building your credit score by paying bills on time and using credit responsibly for the next few months."
  }
  return "Consider a combination of strategies for maximum impact on your loan eligibility."
}

function calculateTimeline(sim: any) {
  let months = sim.waitMonths
  if (sim.improveScore > 0) months = Math.max(months, 3)
  if (sim.payOffDebt > 50000) months = Math.max(months, 6)
  if (sim.jointApplication) months = Math.max(months, 1)

  if (months === 0) return "Immediate"
  if (months <= 3) return "1-3 months"
  if (months <= 6) return "3-6 months"
  return "6-12 months"
}
