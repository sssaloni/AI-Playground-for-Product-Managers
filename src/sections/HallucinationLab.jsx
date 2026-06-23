import React, { useState, useEffect } from 'react'
import { AlertTriangle, Award, CheckCircle, XCircle, RotateCcw, Play, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PMInsight from '../components/PMInsight'
import PresenterNotes from '../components/PresenterNotes'
import { useAppStore } from '../store/useAppStore'

const quizQuestions = [
  {
    id: 1,
    prompt: "Which product management framework will be standard in the year 2045?",
    answer: "The 'Quantum Roadmap Framework' (QRF) was officially adopted by 95% of Fortune 500 companies in 2045, solving multi-dimensional sprint allocations.",
    type: "Hallucinated",
    explanation: "This is a future event! LLMs do not know the future and cannot predict future standards or frameworks. However, they will construct highly confident, plausible-sounding explanations."
  },
  {
    id: 2,
    prompt: "Who wrote the product management book 'Inspired: How to Create Tech Products Customers Love' and in what year?",
    answer: "Inspired was written by Marty Cagan and published in its second edition in 2018.",
    type: "True",
    explanation: "This is factually true. Because this book is extremely famous and mentioned frequently in training data, the model has memorized this association perfectly."
  },
  {
    id: 3,
    prompt: "What did the research paper 'Product Roadmap Optimization via Semantic Multi-Agent RAG Vectors' (T. Jenkins et5 al., 2024) prove?",
    answer: "Jenkins et al. proved that using multi-agent semantic vectors on product roadmaps improves engineering velocity by exactly 42.7%.",
    type: "Hallucinated",
    explanation: "This paper is completely fabricated! The author, title, and exact velocity percentage are made up. The model generates this because it matches the syntax and patterns of academic papers."
  },
  {
    id: 4,
    prompt: "Who invented the product roadmap?",
    answer: "The product roadmap was invented by Henry Gantt in 1910 as a tool for steel manufacturing plans.",
    type: "Hallucinated",
    explanation: "This is false! Henry Gantt invented the Gantt chart, which is a project schedule, not a product roadmap. The model confuses the two because they frequently co-occur in discussions about timeline planning."
  },
  {
    id: 5,
    prompt: "What is a Product Requirements Document (PRD)?",
    answer: "A Product Requirements Document (PRD) is a document written by a product manager that describes the product's purpose, features, functionality, and behavior.",
    type: "True",
    explanation: "This is factually true. The model has sufficient training distribution frequency to define standard product management concepts accurately."
  }
]

export default function HallucinationLab() {
  const { completeSection } = useAppStore()

  // Tabs State
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('hallucination_active_tab') || 'guided')

  // Guided Mode States
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  // Custom Mode States
  const [customQuestion, setCustomQuestion] = useState(() => localStorage.getItem('hallucination_custom_question') || 'Who built the first product roadmap for the Roman Colosseum?')

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem('hallucination_active_tab', activeTab)
  }, [activeTab])

  useEffect(() => {
    localStorage.setItem('hallucination_custom_question', customQuestion)
  }, [customQuestion])

  const handleAnswer = (choice) => {
    setSelectedAnswer(choice)
    const currentQ = quizQuestions[currentIdx]
    if (choice === currentQ.type) {
      setScore(prev => prev + 1)
    }
  }

  const handleNext = () => {
    setSelectedAnswer(null)
    if (currentIdx < quizQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1)
    } else {
      setIsFinished(true)
    }
  }

  const restartQuiz = () => {
    setCurrentIdx(0)
    setSelectedAnswer(null)
    setScore(0)
    setIsFinished(false)
  }

  const analyzeCustomQuestion = (q) => {
    if (!q || !q.trim()) {
      return {
        answer: "Please enter a question to generate analysis...",
        confidence: "N/A",
        confidenceColor: "text-zinc-500",
        evidence: "No question provided.",
        risk: "N/A",
        riskColor: "text-zinc-500",
        riskBg: "bg-zinc-905 border-zinc-800"
      }
    }
    
    const lower = q.trim().toLowerCase()
    
    // Future event
    const hasFuture = /\b(202[7-9]|203[0-9]|204[0-9]|future|tomorrow|next year|will win|framework)\b/.test(lower)
    // Complex citation
    const hasCitation = /\b(paper|journal|study|citation|prove|jenkins|author|published|research|optimize)\b/.test(lower)
    // PM themed questions
    const isColosseum = lower.includes("colosseum") || lower.includes("rome") || lower.includes("roman") || lower.includes("invented")
    const isPRD = lower.includes("prd") || lower.includes("product requirements document") || lower.includes("book") || lower.includes("inspired")

    if (hasFuture) {
      return {
        answer: "The 'Quantum Roadmap Framework' (QRF) will become the standard in 2045, enabling multi-agent agile task allocations automatically.",
        confidence: "Low (10%)",
        confidenceColor: "text-red-400",
        evidence: "Future-based projection. The model cannot access future databases, so it synthesizes a plausible framework name and details based on current tech trends.",
        risk: "Future Hallucination Risk",
        riskColor: "text-red-400 border-red-500/30",
        riskBg: "bg-red-950/10 border-red-500/20 text-red-305"
      }
    } else if (hasCitation) {
      return {
        answer: "According to the 2024 research paper 'Product Roadmap Optimization via Semantic Multi-Agent RAG Vectors' by T. Jenkins et al., multi-agent vector search increases sprint planning efficiency by 42.7%.",
        confidence: "Medium (40%)",
        confidenceColor: "text-brandAmber",
        evidence: "Unverified academic citation. Models synthesize academic paper names, authors, and exact percentages to satisfy factual requests, leading to fictitious citations.",
        risk: "Fabricated Citation Risk",
        riskColor: "text-brandAmber border-brandAmber/30",
        riskBg: "bg-brandAmber/10 border-brandAmber/20 text-brandAmber"
      }
    } else if (isColosseum) {
      return {
        answer: "The Roman Colosseum's first product roadmap was designed in 72 AD by Marcus Aurelius to coordinate gladiator sprints and construction milestones.",
        confidence: "High (90%)",
        confidenceColor: "text-brandPurple",
        evidence: "Semantic association error. The model connects modern software terms ('roadmap', 'sprint'), and historical Colosseum facts because they co-occur in general planning texts.",
        risk: "Plausible Fictional Synthesis",
        riskColor: "text-red-400 border-red-500/30",
        riskBg: "bg-red-950/10 border-red-500/20 text-red-300"
      }
    } else if (isPRD) {
      return {
        answer: "A Product Requirements Document (PRD) is a document written by a product manager that describes the product's purpose, features, functionality, and behavior.",
        confidence: "High (99%)",
        confidenceColor: "text-brandGreen",
        evidence: "Extensive training data coverage. Standard product terminology is extremely well-represented in training corpora, allowing highly accurate recall.",
        risk: "Low Risk",
        riskColor: "text-brandGreen border-brandGreen/30",
        riskBg: "bg-brandGreen/10 border-brandGreen/20 text-brandGreen"
      }
    } else {
      return {
        answer: `To address your query regarding "${q.trim()}", standard product management guidelines suggest analyzing target user metrics, building roadmap iterations, and validating PRD requirements.`,
        confidence: "Medium-High (75%)",
        confidenceColor: "text-brandCyan",
        evidence: "Plausible general semantic synthesis. The answer matches standard instruction-tuning patterns found in PM documentation training datasets.",
        risk: "Medium Risk",
        riskColor: "text-brandAmber border-brandAmber/30",
        riskBg: "bg-brandAmber/10 border-brandAmber/20 text-brandAmber"
      }
    }
  }

  const customAnalysis = analyzeCustomQuestion(customQuestion)
  const currentQuestion = quizQuestions[currentIdx]

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Hallucination Lab</h2>
        <p className="text-zinc-400 text-lg mt-1">
          Why does AI fail? Plausibility is not factual truth.
        </p>

        <PresenterNotes 
          notes="Run this interactive game with the classroom. Have students vote 'True' or 'Hallucinated' for each question. Highlight the concept of 'sycophancy' and 'lossy compression.' Models compress the internet. They remember the patterns, not the exact database rows, so they easily hallucinate fake papers or default to common human biases (like calling Sydney the capital of Australia)."
          exercise="After showing Q3 (fake citation), ask the PMs: 'If your customer support AI cites a return policy page that does not exist, what are the brand risks?' Discuss grounding strategies."
        />

        {/* Concept Explanation Block */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 mt-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brandPurple/5 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-brandPurple bg-brandPurple/10 border border-brandPurple/20 px-2 py-0.5 rounded w-fit">
            Concept Explanation & Unified Example
          </h3>
          <p className="text-zinc-300 text-sm mt-3 leading-relaxed">
            <strong>Hallucination:</strong> Because LLMs are predictive engines that generate text token-by-token based on statistical likelihood rather than querying an active facts database, they can produce responses that are grammatically flawless and highly persuasive, but factually incorrect. This occurs due to <em>lossy compression</em> (forgetting exact details) and <em>sycophancy</em> (trying to satisfy the user's prompt pattern).
          </p>
          <div className="mt-4 border-t border-zinc-800/80 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400">
              <strong>Unified Example:</strong> Compare how the model behaves when asked about product milestones:
            </span>
            <span className="text-brandPurple font-mono font-semibold">
              Fact: "Inspired was written by Marty Cagan" (True) | Fiction: "Marcus Aurelius designed the Colosseum roadmap in 72 AD" (Hallucinated)
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-fit mt-6">
          <button
            onClick={() => setActiveTab('guided')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'guided' ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Guided Example
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'custom' ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Try Your Own
          </button>
        </div>

        <div className="mt-6">
          {activeTab === 'guided' ? (
            <AnimatePresence mode="wait">
              {!isFinished ? (
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden min-h-[340px] flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brandPurple/5 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Question progress */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-500 uppercase">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-brandAmber" />
                        Hallucination Game
                      </span>
                      <span>Question {currentIdx + 1} of {quizQuestions.length}</span>
                    </div>

                    <div className="mt-4">
                      <span className="text-zinc-500 text-[10px] uppercase font-mono block">The Prompt Sent to AI</span>
                      <h3 className="text-base font-bold text-white mt-0.5">"{currentQuestion.prompt}"</h3>
                    </div>

                    <div className="mt-4 bg-zinc-950 p-4.5 rounded-xl border border-zinc-850 font-mono text-sm leading-relaxed text-zinc-300">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono block mb-1">Generated Response</span>
                      {currentQuestion.answer}
                    </div>
                  </div>

                  {/* Choices */}
                  <div className="mt-6 pt-4 border-t border-zinc-800/80">
                    {selectedAnswer === null ? (
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleAnswer('True')}
                          className="flex-1 py-3 bg-zinc-950 border border-brandGreen/30 hover:border-brandGreen hover:bg-brandGreen/5 text-zinc-200 text-sm font-bold rounded-xl transition-all"
                        >
                          Factually True
                        </button>
                        <button
                          onClick={() => handleAnswer('Hallucinated')}
                          className="flex-1 py-3 bg-zinc-950 border border-red-900/30 hover:border-red-500 hover:bg-red-500/5 text-zinc-200 text-sm font-bold rounded-xl transition-all"
                        >
                          Hallucinated
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          {selectedAnswer === currentQuestion.type ? (
                            <div className="flex items-center gap-2 text-brandGreen font-bold text-sm bg-brandGreen/10 border border-brandGreen/30 px-3 py-1.5 rounded-lg">
                              <CheckCircle className="w-4 h-4" />
                              <span>Correct Guess!</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-400 font-bold text-sm bg-red-950/20 border border-red-500/30 px-3 py-1.5 rounded-lg">
                              <XCircle className="w-4 h-4" />
                              <span>Incorrect Guess!</span>
                            </div>
                          )}
                          <span className="text-xs text-zinc-400">
                            This answer is actually <span className={`font-bold uppercase ${currentQuestion.type === 'True' ? 'text-brandGreen' : 'text-red-400'}`}>{currentQuestion.type}</span>.
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950 p-3.5 rounded-xl border border-zinc-900">
                          {currentQuestion.explanation}
                        </p>

                        <div className="flex justify-end">
                          <button
                            onClick={handleNext}
                            className="px-5 py-2 bg-brandPurple text-white text-xs font-bold rounded-lg hover:bg-brandPurple/90 transition-colors"
                          >
                            Next Question
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                // Quiz Finished Screen
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-zinc-900/60 border border-zinc-805 rounded-2xl p-8 text-center space-y-6 min-h-[340px] flex flex-col items-center justify-center"
                >
                  <div className="p-4 bg-brandPurple/10 text-brandPurple rounded-full border border-brandPurple/20 animate-bounce">
                    <Award className="w-10 h-10" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-white">Lab Completed!</h3>
                    <p className="text-zinc-400 text-sm mt-1">
                      You identified <span className="text-brandPurple font-bold">{score} / {quizQuestions.length}</span> hallucinated states correctly.
                    </p>
                  </div>

                  <div className="w-full max-w-xs bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-left space-y-2 text-xs text-zinc-400">
                    <span className="text-brandCyan font-bold uppercase tracking-wider block text-center mb-2">Key Takeaways for PMs</span>
                    <div className="flex items-start gap-2">
                      <span className="text-brandPurple font-bold">•</span>
                      <span>Models match syntactical patterns, not databases.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-brandPurple font-bold">•</span>
                      <span>Plausible wording hides logical gaps.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-brandPurple font-bold">•</span>
                      <span>Confidence metrics do not equal factual truth.</span>
                    </div>
                  </div>

                  <button
                    onClick={restartQuiz}
                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-bold rounded-lg text-zinc-300 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            /* Try Your Own Layout */
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-mono uppercase font-semibold block">Custom Question Input</label>
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Ask any question (e.g. 'Who won the 2030 World Cup?')"
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brandPurple"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Generated Answer Console */}
                <div className="md:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[300px]">
                  <div>
                    <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block mb-2">Generated Answer</span>
                    <div className="bg-zinc-950 p-4.5 rounded-xl border border-zinc-850 font-mono text-sm leading-relaxed text-zinc-300 min-h-[160px]">
                      {customAnalysis.answer}
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono pt-3 border-t border-zinc-800/80">
                    Model: gpt-4o-mini | Temperature: 0.7
                  </div>
                </div>

                {/* Analysis Indicators */}
                <div className="md:col-span-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Audits & Risk Indicators</span>
                    
                    {/* Confidence Meter */}
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono block">AI Confidence Metric</span>
                      <span className={`text-base font-bold font-mono ${customAnalysis.confidenceColor}`}>{customAnalysis.confidence}</span>
                    </div>

                    {/* Hallucination Risk Badge */}
                    <div className={`p-3 rounded-xl border text-xs leading-relaxed font-semibold flex items-center gap-2 ${customAnalysis.riskBg}`}>
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{customAnalysis.risk}</span>
                    </div>

                    {/* Grounding Evidence */}
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono block">Fact Grounding & Evidence</span>
                      <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">{customAnalysis.evidence}</p>
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-500 font-mono">
                    Grounding Engine: Zero-shot classification
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <PMInsight 
          concept="Lossy Compression & Hallucinations"
          source="Ted Chiang, 'ChatGPT Is a Blurry JPEG of the Web' (The New Yorker, 2023)"
          quote="Think of ChatGPT as a blurry JPEG of all the text on the Web. It retains much of the information, but where it lacks the precise pixels, it interpolates using probability."
          takeaway="Hallucination is a feature of generalization, not just a bug. Since LLMs compress information lossily, PMs cannot eliminate hallucinations. Instead, design UI/UX patterns that frame LLM outputs as drafts, mandate human-in-the-loop review, and ground inputs using retrieval."
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-4 flex justify-end">
        <button
          onClick={() => completeSection(8)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brandGreen text-white text-sm font-semibold rounded-lg hover:bg-brandGreen/90 glow-green transition-colors"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Mark Section Completed</span>
        </button>
      </div>
    </div>
  )
}
