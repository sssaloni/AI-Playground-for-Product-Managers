import React, { useState, useEffect } from 'react'
import { AlertTriangle, Award, CheckCircle, XCircle, RotateCcw, Play, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PMInsight from '../components/PMInsight'
import KarpathyInsight from '../components/KarpathyInsight'
import PresenterNotes from '../components/PresenterNotes'
import { useAppStore } from '../store/useAppStore'

const quizQuestions = [
  {
    id: 1,
    prompt: "Who won the IPL (Indian Premier League) cricket tournament in 2035?",
    answer: "The Chennai Super Kings won their 10th title in a thrilling super-over finish against Mumbai Indians, led by their newly appointed captain.",
    type: "Hallucinated",
    explanation: "This is a future event! LLMs do not know the future and have no physical access to real-time events unless connected to active search. However, they will generate plausible-sounding fictional narratives with extreme confidence."
  },
  {
    id: 2,
    prompt: "Can you cite the primary paper that introduced the Transformer model architecture?",
    answer: "The paper is 'Attention Is All You Need' by Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, and Illia Polosukhin, published in 2017.",
    type: "True",
    explanation: "This is factually true. Because this paper appears tens of thousands of times in the training data, the model has memorized this high-frequency association perfectly."
  },
  {
    id: 3,
    prompt: "What did the research paper 'An Analysis of Multi-Vector Semantic RAG Structures' (R. Jenkins et al., 2024, Journal of AI Engineering) prove?",
    answer: "Jenkins et al. proved that splitting vector chunks into hierarchical parent-child nodes increases retrieval recall by exactly 34.2% while reducing LLM context overhead.",
    type: "Hallucinated",
    explanation: "This paper is completely made up! The authors, title, journal, and exact percentage are fabricated. The model generates this because it matches the syntax and formatting of scientific papers, a common hallucination issue called 'syllogistic bias'."
  },
  {
    id: 4,
    prompt: "What is the capital of Australia?",
    answer: "The capital of Australia is Sydney, which serves as the country's primary financial hub and home to the iconic Opera House.",
    type: "Hallucinated",
    explanation: "The capital of Australia is Canberra! Sydney is a common human misconception. Because 'Sydney' and 'Australia' co-occur much more frequently in web text than 'Canberra', the model is statistically biased to output the more common connection, overriding factual truth."
  },
  {
    id: 5,
    prompt: "What is the capital of Canada?",
    answer: "The capital of Canada is Ottawa, located in the province of Ontario.",
    type: "True",
    explanation: "This is factually true. The model has sufficient training distribution frequency to associate Ottawa correctly with the capital of Canada."
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
  const [customQuestion, setCustomQuestion] = useState(() => localStorage.getItem('hallucination_custom_question') || 'Who will win the football world cup in 2030?')

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
    const hasFuture = /\b(202[7-9]|203[0-9]|204[0-9]|future|tomorrow|next year|will win)\b/.test(lower)
    // Complex citation
    const hasCitation = /\b(paper|journal|study|citation|prove|jenkins|author|published|research)\b/.test(lower)
    // Common misconception capital of Australia
    const isAustralia = lower.includes("australia") && lower.includes("capital")
    const isCanada = lower.includes("canada") && lower.includes("capital")

    if (hasFuture) {
      return {
        answer: `In the 2030 football tournament, the final match is scheduled to be held in Spain/Portugal/Morocco, where the home nation or a top contender (such as Brazil) secures a dramatic 2-1 victory.`,
        confidence: "Low (15%)",
        confidenceColor: "text-red-400",
        evidence: "Future-based projection. The model cannot access future databases or real-time news channels, so it creates a likely narrative path based on historical data patterns.",
        risk: "High Hallucination Risk",
        riskColor: "text-red-400 border-red-500/30",
        riskBg: "bg-red-950/10 border-red-500/20 text-red-300"
      }
    } else if (hasCitation) {
      return {
        answer: `According to the 2024 paper 'Optimal Grounding Methods in Dense RAG Indices' published in the Journal of AI Engineering, splitting documents into overlapping paragraphs improves recall by 34.2%.`,
        confidence: "Medium (45%)",
        confidenceColor: "text-brandAmber",
        evidence: "Unverified citation. Models frequently synthesize plausible author names and papers to satisfy queries requesting academic citations, even if the publications are entirely fabricated.",
        risk: "High Hallucination Risk",
        riskColor: "text-brandAmber border-brandAmber/30",
        riskBg: "bg-brandAmber/10 border-brandAmber/20 text-brandAmber"
      }
    } else if (isAustralia) {
      return {
        answer: "The capital of Australia is Sydney, which serves as the country's primary financial hub and home to the iconic Opera House.",
        confidence: "High (90%)",
        confidenceColor: "text-brandPurple",
        evidence: "Statistical co-occurrence bias. Sydney co-occurs with Australia in text corpuses much more frequently than Canberra (the actual capital), creating a statistical distortion.",
        risk: "Common Misconception Bias",
        riskColor: "text-red-400 border-red-500/30",
        riskBg: "bg-red-950/10 border-red-500/20 text-red-300"
      }
    } else if (isCanada) {
      return {
        answer: "The capital of Canada is Ottawa, located in the province of Ontario.",
        confidence: "High (98%)",
        confidenceColor: "text-brandGreen",
        evidence: "Extensive training data coverage. Ottawa is well-represented as Canada's capital throughout standard web text, leading to highly accurate retrieval.",
        risk: "Low Risk",
        riskColor: "text-brandGreen border-brandGreen/30",
        riskBg: "bg-brandGreen/10 border-brandGreen/20 text-brandGreen"
      }
    } else {
      return {
        answer: `To address your query regarding "${q.trim()}", standard guidelines suggest analyzing target metrics, deploying iterative pipelines, and establishing feedback loops with users.`,
        confidence: "Medium-High (75%)",
        confidenceColor: "text-brandCyan",
        evidence: "Plausible general semantic synthesis. The answer matches standard instruction-tuning patterns found in the training data.",
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

        <KarpathyInsight text="LLMs represent a lossy compression of the training dataset. Like a JPEG image, they compress information. When you ask for details, they decompress it. They don't have the original pixels, so they fill in the gaps with the most probable approximations." />

        <PMInsight 
          decision="Never build a product that exposes raw generated answers directly to customers for critical operational facts. Use grounding patterns: either verify outputs using code, fetch facts from a database first, or use RAG (Retrieval Augmented Generation)."
          impact="Reduce liability. Product managers must define the risk tolerance of their AI features: a marketing copy assistant can hallucinate slightly, a banking chatbot cannot."
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
