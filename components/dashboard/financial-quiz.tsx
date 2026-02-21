"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, Trophy, RotateCcw, Lightbulb, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const quizQuestions = [
    {
        id: 1,
        question: "What is a good credit score range in India?",
        options: ["300-500", "500-650", "750-900", "100-200"],
        correct: 2,
        explanation: "A credit score of 750-900 is considered excellent in India. Most lenders prefer scores above 750 for loan approvals with better interest rates."
    },
    {
        id: 2,
        question: "What does DTI ratio stand for?",
        options: ["Daily Transaction Index", "Debt-to-Income Ratio", "Digital Transfer Indicator", "Deferred Tax Interest"],
        correct: 1,
        explanation: "DTI (Debt-to-Income) ratio measures your monthly debt payments against your gross monthly income. Banks prefer DTI below 40%."
    },
    {
        id: 3,
        question: "Which organization maintains credit scores in India?",
        options: ["RBI", "SEBI", "CIBIL", "IRDA"],
        correct: 2,
        explanation: "CIBIL (Credit Information Bureau India Limited) is the primary credit bureau in India that maintains credit scores and reports."
    },
    {
        id: 4,
        question: "What is the ideal credit utilization ratio?",
        options: ["Below 30%", "50-70%", "Above 80%", "100%"],
        correct: 0,
        explanation: "Keeping credit utilization below 30% shows responsible credit behavior and positively impacts your credit score."
    },
    {
        id: 5,
        question: "What happens if you miss an EMI payment?",
        options: ["Nothing happens", "Only late fee charged", "Credit score drops + late fee", "Loan gets cancelled"],
        correct: 2,
        explanation: "Missing EMI payments results in late fees AND negatively impacts your credit score. One missed payment can drop your score by 50-100 points."
    },
    {
        id: 6,
        question: "What is the 50-30-20 budgeting rule?",
        options: [
            "50% savings, 30% needs, 20% wants",
            "50% needs, 30% wants, 20% savings",
            "50% wants, 30% savings, 20% needs",
            "50% EMI, 30% rent, 20% food"
        ],
        correct: 1,
        explanation: "The 50-30-20 rule suggests: 50% on needs (rent, food), 30% on wants (entertainment), and 20% on savings/debt repayment."
    },
    {
        id: 7,
        question: "What is compound interest?",
        options: [
            "Interest on principal only",
            "Interest on interest + principal",
            "Fixed interest rate",
            "Government subsidy"
        ],
        correct: 1,
        explanation: "Compound interest is 'interest on interest' - your earnings generate their own earnings over time, making early investing powerful."
    },
    {
        id: 8,
        question: "How long does negative information stay on credit report?",
        options: ["1 year", "3 years", "7 years", "Forever"],
        correct: 2,
        explanation: "Negative information like defaults and late payments typically stay on your credit report for 7 years in India."
    },
    {
        id: 9,
        question: "What is an emergency fund?",
        options: [
            "Money for shopping",
            "3-6 months of expenses saved",
            "Investment in stocks",
            "Credit card limit"
        ],
        correct: 1,
        explanation: "An emergency fund is savings worth 3-6 months of living expenses, kept in a liquid account for unexpected situations."
    },
    {
        id: 10,
        question: "What affects loan interest rates?",
        options: [
            "Only bank policy",
            "Only RBI rates",
            "Credit score + RBI rates + bank policy",
            "Only your salary"
        ],
        correct: 2,
        explanation: "Loan interest rates depend on your credit score, RBI repo rates, bank's lending policies, loan amount, and tenure."
    }
]

export default function FinancialQuiz() {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [showResult, setShowResult] = useState(false)
    const [score, setScore] = useState(0)
    const [answers, setAnswers] = useState<boolean[]>([])
    const [quizCompleted, setQuizCompleted] = useState(false)

    const handleAnswer = (optionIndex: number) => {
        if (selectedAnswer !== null) return // Already answered

        setSelectedAnswer(optionIndex)
        const isCorrect = optionIndex === quizQuestions[currentQuestion].correct

        if (isCorrect) {
            setScore(score + 1)
        }
        setAnswers([...answers, isCorrect])
        setShowResult(true)
    }

    const nextQuestion = () => {
        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
            setSelectedAnswer(null)
            setShowResult(false)
        } else {
            setQuizCompleted(true)
        }
    }

    const resetQuiz = () => {
        setCurrentQuestion(0)
        setSelectedAnswer(null)
        setShowResult(false)
        setScore(0)
        setAnswers([])
        setQuizCompleted(false)
    }

    const getScoreMessage = () => {
        const percentage = (score / quizQuestions.length) * 100
        if (percentage >= 80) return { text: "Excellent! You're a Financial Expert! 🏆", color: "text-emerald-600" }
        if (percentage >= 60) return { text: "Good Job! You know your finances well! 📈", color: "text-blue-600" }
        if (percentage >= 40) return { text: "Not bad! Keep learning about finance! 📚", color: "text-yellow-600" }
        return { text: "Time to brush up on financial literacy! 💡", color: "text-red-600" }
    }

    const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

    if (quizCompleted) {
        const scoreMessage = getScoreMessage()
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quiz Complete!</h1>
                        <p className="text-gray-500">See how well you did</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-8 text-center text-white">
                            <div className="text-7xl font-bold mb-2">{score}/{quizQuestions.length}</div>
                            <div className="text-xl opacity-90">Questions Correct</div>
                        </div>
                        <CardContent className="p-6">
                            <div className={`text-xl font-semibold text-center mb-6 ${scoreMessage.color}`}>
                                {scoreMessage.text}
                            </div>

                            <div className="grid grid-cols-5 gap-2 mb-6">
                                {answers.map((correct, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-3 rounded-full ${correct ? 'bg-emerald-500' : 'bg-red-400'}`}
                                    />
                                ))}
                            </div>

                            <div className="space-y-3">
                                <Button onClick={resetQuiz} className="w-full" variant="outline">
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Take Quiz Again
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Learning Tips */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            Key Takeaways
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                            <span className="font-medium text-emerald-700">💳 Credit Score:</span>
                            <span className="text-gray-600 ml-2">Aim for 750+ for best loan rates</span>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <span className="font-medium text-blue-700">📊 DTI Ratio:</span>
                            <span className="text-gray-600 ml-2">Keep total EMIs below 40% of income</span>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <span className="font-medium text-purple-700">💰 50-30-20 Rule:</span>
                            <span className="text-gray-600 ml-2">Needs 50%, Wants 30%, Savings 20%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const question = quizQuestions[currentQuestion]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Literacy Quiz</h1>
                    <p className="text-gray-500">Test your knowledge about loans, credit & money management</p>
                </div>
            </div>

            {/* Progress */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                        <span>Score: {score}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </CardContent>
            </Card>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">{question.question}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {question.options.map((option, idx) => {
                                const isSelected = selectedAnswer === idx
                                const isCorrect = idx === question.correct
                                const showCorrect = showResult && isCorrect
                                const showWrong = showResult && isSelected && !isCorrect

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        disabled={showResult}
                                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${showCorrect
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                            : showWrong
                                                ? 'bg-red-50 border-red-500 text-red-700'
                                                : isSelected
                                                    ? 'bg-purple-50 border-purple-500'
                                                    : 'bg-gray-50 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{option}</span>
                                            {showCorrect && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                            {showWrong && <XCircle className="w-5 h-5 text-red-500" />}
                                        </div>
                                    </button>
                                )
                            })}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

            {/* Explanation */}
            {showResult && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className={selectedAnswer === question.correct ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}>
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedAnswer === question.correct ? 'bg-emerald-500' : 'bg-red-500'
                                    }`}>
                                    {selectedAnswer === question.correct
                                        ? <CheckCircle className="w-5 h-5 text-white" />
                                        : <XCircle className="w-5 h-5 text-white" />
                                    }
                                </div>
                                <div>
                                    <div className={`font-semibold ${selectedAnswer === question.correct ? 'text-emerald-700' : 'text-red-700'}`}>
                                        {selectedAnswer === question.correct ? 'Correct!' : 'Incorrect'}
                                    </div>
                                    <p className="text-gray-600 mt-1">{question.explanation}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button onClick={nextQuestion} className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                        {currentQuestion < quizQuestions.length - 1 ? (
                            <>Next Question <ArrowRight className="w-4 h-4 ml-2" /></>
                        ) : (
                            <>See Results <Trophy className="w-4 h-4 ml-2" /></>
                        )}
                    </Button>
                </motion.div>
            )}
        </div>
    )
}
