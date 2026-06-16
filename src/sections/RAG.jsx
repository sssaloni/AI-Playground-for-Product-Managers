import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Database, Play, ArrowLeft, ArrowRight, ChevronRight, ChevronLeft, Info, Cpu, Search, Check, X, FileText, Scissors, Brain, MessageSquare
} from 'lucide-react'
import PMInsight from '../components/PMInsight'
import PresenterNotes from '../components/PresenterNotes'
import { useAppStore } from '../store/useAppStore'

const chunkTextSample = "Retrieval-Augmented Generation (RAG) is an architectural pattern that optimizes Large Language Model outputs. It does this by querying authoritative external databases prior to generating responses. When a user prompt enters the system, the query is converted into a vector embedding. This query vector is matched against a Vector Database of chunked document embeddings to find the most semantically relevant snippets. These snippets are then appended into the prompt context. This gives the model non-parametric factual details. Consequently, the LLM generates a grounded response with high accuracy, eliminating knowledge cutoffs and reducing hallucinations."

const vectorPointsPreset = [
  { id: 1, label: "Refund policy 14-days", x: 25, y: 30, category: "Refunds", text: "Refunds can be requested within 14 days of purchase." },
  { id: 2, label: "Refund policy annual sub", x: 30, y: 38, category: "Refunds", text: "Annual subscriptions are refundable up to 30 days." },
  { id: 3, label: "Gift cards non-refundable", x: 20, y: 22, category: "Refunds", text: "Gift cards are non-refundable." },
  { id: 4, label: "Q3 Release Aug 15th", x: 80, y: 75, category: "Roadmap", text: "Q3 Project launch date is August 15th, 2026." },
  { id: 5, label: "Q3 Budget allocation", x: 75, y: 82, category: "Roadmap", text: "Q3 budget allocation is $120k." },
  { id: 6, label: "Sarah Jenkins PM Lead", x: 88, y: 70, category: "Roadmap", text: "The Product Lead is Sarah Jenkins." },
  { id: 7, label: "Database latency risk", x: 68, y: 65, category: "Roadmap", text: "Risk: Database migration latency spikes." },
  { id: 8, label: "Server Maintenance Sun", x: 78, y: 45, category: "Schedules", text: "Server maintenance is Sunday at 3 AM." },
  { id: 9, label: "Expected downtime 15m", x: 84, y: 40, category: "Schedules", text: "Expect 15 minutes of server downtime." }
]

const presetsICL = [
  {
    title: "Executive Lounge Passcode",
    fact: "The passcode to the executive lounge is 4930. Do not share it with guests.",
    question: "What is the passcode to the executive lounge?",
    parametricAnswer: "I do not have access to private security passcodes in my training data. Please consult your administrator.",
    iclAnswer: "According to the provided context, the passcode to the executive lounge is 4930. It should not be shared with guests."
  },
  {
    title: "Project Alpha Launch",
    fact: "Project Alpha is scheduled to launch on November 12th under Code-Name: Firefly.",
    question: "When does Project Alpha launch and what is its code name?",
    parametricAnswer: "I do not have access to internal launch schedules or project code names. This information was not in my pre-training data.",
    iclAnswer: "Project Alpha is scheduled to launch on November 12th under the code name 'Firefly'."
  }
]

export default function RAG() {
  const { completeSection } = useAppStore()
  const [activeSlide, setActiveSlide] = useState(0)
  const [isIndexCollapsed, setIsIndexCollapsed] = useState(false)
  const [expandedQA, setExpandedQA] = useState({})

  const toggleQA = (id) => {
    setExpandedQA(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Slide 3: Parametric vs RAG Route Toggle
  const [routeMode, setRouteMode] = useState('parametric') // 'parametric' | 'rag'

  // Slide 4: Problem 1 Refund Toggle
  const [prob1UseRag, setProb1UseRag] = useState(false)

  // Slide 5: Problem 2 Cutoff Date Slider
  const [cutoffYear, setCutoffYear] = useState(2023)

  // Slide 7: ICL Playground States
  const [selectedICLPreset, setSelectedICLPreset] = useState(0)
  const [iclCustomFact, setIclCustomFact] = useState("")
  const [iclCustomQuestion, setIclCustomQuestion] = useState("")
  const [iclUseContext, setIclUseContext] = useState(true)
  const [iclOutput, setIclOutput] = useState("")
  const [iclSimulating, setIclSimulating] = useState(false)

  // Slide 8: Few-shot Mode
  const [fewShotMode, setFewShotMode] = useState('zero') // 'zero' | 'few'

  // Slide 10: RAG Architecture active node details
  const [selectedArchNode, setSelectedArchNode] = useState('loader')

  // Slide 11: Text Chunking Slider States
  const [chunkSize, setChunkSize] = useState(120)
  const [chunkOverlap, setChunkOverlap] = useState(25)

  // Slide 12: 2D Vector Space Query Plotting
  const [vectorQuery, setVectorQuery] = useState("")
  const [activeVectorPlot, setActiveVectorPlot] = useState(null) // {x, y, query, matches: []}

  // Slide 13: Retrieval Simulator Search
  const [retrievalQuery, setRetrievalQuery] = useState("")

  // Slide keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        nextSlide()
      } else if (e.key === 'ArrowLeft') {
        prevSlide()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeSlide])

  const nextSlide = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide(activeSlide + 1)
    }
  }

  const prevSlide = () => {
    if (activeSlide > 0) {
      setActiveSlide(activeSlide - 1)
    }
  }

  // Computed chunks for Slide 11 Chunker
  const calculatedChunks = useMemo(() => {
    const chunks = []
    let start = 0
    const text = chunkTextSample
    const size = Math.max(20, chunkSize)
    const overlap = Math.max(0, Math.min(chunkOverlap, size - 10))

    while (start < text.length) {
      const end = Math.min(start + size, text.length)
      chunks.push({
        id: chunks.length + 1,
        text: text.substring(start, end),
        start,
        end
      })
      if (end >= text.length) break
      start = end - overlap
    }
    return chunks
  }, [chunkSize, chunkOverlap])

  // Simulated 2D Vector Search matching for Slide 12
  const queryPoints = useMemo(() => {
    if (!vectorQuery) return null

    let targetX = 50
    let targetY = 50
    const qLower = vectorQuery.toLowerCase()

    if (qLower.includes("refund") || qLower.includes("return") || qLower.includes("card")) {
      targetX = 25
      targetY = 32
    } else if (qLower.includes("sarah") || qLower.includes("roadmap") || qLower.includes("budget") || qLower.includes("pm")) {
      targetX = 80
      targetY = 74
    } else if (qLower.includes("server") || qLower.includes("downtime") || qLower.includes("maintenance")) {
      targetX = 80
      targetY = 42
    }

    // Find closest items
    const matches = vectorPointsPreset.map(p => {
      const dist = Math.sqrt(Math.pow(p.x - targetX, 2) + Math.pow(p.y - targetY, 2))
      return { ...p, dist }
    }).sort((a, b) => a.dist - b.dist).slice(0, 3)

    return { x: targetX, y: targetY, matches }
  }, [vectorQuery])

  // Slide 13 Similarity Rankings
  const rankedChunks = useMemo(() => {
    const q = retrievalQuery.toLowerCase().trim()
    if (!q) return vectorPointsPreset.map(p => ({ ...p, score: 0.1 }))

    return vectorPointsPreset.map(p => {
      const pText = p.text.toLowerCase()
      const qWords = q.split(/\W+/).filter(w => w.length > 2)
      if (qWords.length === 0) return { ...p, score: 0.1 }

      let matches = 0
      qWords.forEach(w => {
        if (pText.includes(w)) matches++
      })

      const score = Math.min(0.99, parseFloat((0.15 + (matches / qWords.length) * 0.8).toFixed(2)))
      return { ...p, score }
    }).sort((a, b) => b.score - a.score)
  }, [retrievalQuery])

  // Simulate ICL execution
  const runICLSimulation = () => {
    setIclSimulating(true)
    setIclOutput("")
    let progressText = ""
    const fact = iclCustomFact || presetsICL[selectedICLPreset].fact
    const q = iclCustomQuestion || presetsICL[selectedICLPreset].question
    const answerText = iclUseContext 
      ? (iclCustomFact ? `Based on the provided context: ${fact}` : presetsICL[selectedICLPreset].iclAnswer)
      : (iclCustomFact ? "I'm sorry, I don't have access to this information in my training data." : presetsICL[selectedICLPreset].parametricAnswer)

    setTimeout(() => {
      setIclSimulating(false)
      setIclOutput(answerText)
    }, 1200)
  }

  // Pre-fill custom text box in ICL when preset changes
  useEffect(() => {
    setIclCustomFact("")
    setIclCustomQuestion("")
    setIclOutput("")
  }, [selectedICLPreset])

  const slides = [
    // Slide 1: Welcome
    {
      title: "Retrieval-Augmented Generation",
      subtitle: "Making LLMs Smarter with External Knowledge",
      notes: "RAG is the primary engineering pattern for adding domain knowledge to models without re-training. Start by welcoming the PMs to the RAG Deep Dive.",
      render: () => (
        <div className="flex flex-col items-center justify-center text-center py-12 relative overflow-hidden min-h-[500px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brandPurple/10 rounded-full blur-3xl" />
          <span className="bg-brandPurple/15 text-brandPurple text-xs font-bold font-mono tracking-widest px-4.5 py-1.5 rounded-full uppercase border border-brandPurple/30 mb-6 relative">
            Module 16: RAG Session
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-brandPurple via-brandCyan to-brandPurple bg-clip-text text-transparent leading-tight max-w-3xl">
            Retrieval-Augmented Generation
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl mt-4 max-w-xl">
            How we bridge the gap between static LLM weights and dynamic, real-world private data.
          </p>
          <div className="mt-10 flex gap-4 relative">
            <button 
              onClick={nextSlide}
              className="flex items-center gap-2.5 px-6 py-3 bg-brandPurple text-white text-sm font-semibold rounded-xl hover:bg-brandPurple/90 glow-purple transition-all cursor-pointer"
            >
              <span>Begin Deep Dive</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    },

    // Slide 2: Agenda
    {
      title: "What We'll Cover Today",
      subtitle: "A Complete Journey: From Limitations to Ingestion, Indexing, and Retrieval",
      notes: "Walk through the agenda. Highlight that we start with the 'Why' (problems with LLMs) to make it obvious why search engines are required.",
      render: () => {
        const agendaItems = [
          { label: "Why RAG?", desc: "The 3 critical limitations of parametric memory in LLMs.", slide: 2 },
          { label: "Fine-Tuning vs. In-Context Learning", desc: "Why prompt injection beats retraining for factual queries.", slide: 5 },
          { label: "In-Context Learning & Few-Shot Prompting", desc: "Injecting facts and showing examples in action.", slide: 6 },
          { label: "RAG Architecture", desc: "The offline indexing vs. online retrieval & generation pipelines.", slide: 9 },
          { label: "Ingestion, Chunking & Embeddings", desc: "How text is parsed, segmented, and vectorized.", slide: 10 },
          { label: "Semantic Search & Vector Retrieval", desc: "Finding the needle in the haystack via similarity metrics.", slide: 12 },
          { label: "Augmentation & Real-world Q&A", desc: "Real production scenarios and PM decision checklists.", slide: 14 },
        ]
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            <div className="space-y-4">
              <p className="text-zinc-300 leading-relaxed text-sm">
                RAG is not just a coding technique; it is a product design pattern. 
                By separating **reasoning** (the LLM) from **knowledge** (the Vector DB), we build scalable AI products.
              </p>
              <div className="bg-brandPurple/5 border border-brandPurple/20 p-4 rounded-xl">
                <h4 className="text-xs uppercase font-bold text-brandPurple font-mono">Session Core Objective</h4>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Understand how text chunking, overlap size, and cosine similarity affect prompt contexts, accuracy, and latency in production applications.
                </p>
              </div>
            </div>
            <div className="space-y-2.5">
              {agendaItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(item.slide)}
                  className="w-full flex items-center justify-between p-3 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/80 rounded-xl text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-300 text-xs font-mono font-bold flex items-center justify-center group-hover:bg-brandPurple group-hover:text-white transition-colors">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white">{item.label}</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-brandPurple" />
                </button>
              ))}
            </div>
          </div>
        )
      }
    },

    // Slide 3: Parametric vs Non-Parametric Memory
    {
      title: "How LLMs Store & Access Knowledge",
      subtitle: "Parametric vs. Non-Parametric Memory",
      notes: "This slide sets the foundation. Emphasize that parametric memory is compressed, fixed, and hard to update, while non-parametric memory is database-backed and instant.",
      render: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Parametric */}
            <button 
              onClick={() => setRouteMode('parametric')}
              className={`p-4 rounded-xl border text-left transition-all ${
                routeMode === 'parametric' 
                  ? 'border-brandAmber bg-brandAmber/5 glow-amber ring-1 ring-brandAmber/30' 
                  : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Cpu className={`w-4 h-4 ${routeMode === 'parametric' ? 'text-brandAmber' : 'text-zinc-500'}`} />
                <span className="text-xs font-bold text-zinc-200">Parametric Memory</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                Knowledge compressed directly inside the model's weights and biases during pre-training. It is static, slow to update, and fuzzy.
              </p>
            </button>

            {/* Non-Parametric */}
            <button 
              onClick={() => setRouteMode('rag')}
              className={`p-4 rounded-xl border text-left transition-all ${
                routeMode === 'rag' 
                  ? 'border-brandCyan bg-brandCyan/5 glow-cyan ring-1 ring-brandCyan/30' 
                  : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className={`w-4 h-4 ${routeMode === 'rag' ? 'text-brandCyan' : 'text-zinc-500'}`} />
                <span className="text-xs font-bold text-zinc-200">Non-Parametric Memory</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                Knowledge retrieved on-the-fly from external databases and appended directly to the input prompt. It is accurate, dynamic, and citation-backed.
              </p>
            </button>
          </div>

          {/* Interactive Routing Flow Visual */}
          <div className="bg-zinc-900/50 border border-zinc-805 rounded-xl p-5 relative">
            <span className="text-[9px] uppercase font-mono text-zinc-500 block mb-3">Live Path Simulation</span>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs font-mono text-center w-full md:w-36">
                User Question
              </div>

              {/* Arrow */}
              <div className="hidden md:block text-zinc-600 font-bold">➡️</div>

              {routeMode === 'parametric' ? (
                <motion.div 
                  initial={{ scale: 0.98 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center gap-2 p-3 bg-brandAmber/5 border border-brandAmber/30 rounded-lg text-center w-full md:w-48"
                >
                  <Cpu className="w-5 h-5 text-brandAmber animate-pulse" />
                  <span className="text-[10px] font-mono text-zinc-300">Queries LLM Parameters</span>
                  <span className="text-[8px] bg-brandAmber/20 text-brandAmber font-bold px-2 py-0.5 rounded font-mono">STATIC WEIGHTS ONLY</span>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.98 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center gap-2 p-3 bg-brandCyan/5 border border-brandCyan/30 rounded-lg text-center w-full md:w-48"
                >
                  <div className="flex gap-2.5">
                    <Search className="w-4 h-4 text-brandCyan" />
                    <Database className="w-4 h-4 text-brandCyan" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-300">Searches External DB</span>
                  <span className="text-[8px] bg-brandCyan/20 text-brandCyan font-bold px-2 py-0.5 rounded font-mono">RAG ROUTE ACTIVE</span>
                </motion.div>
              )}

              {/* Arrow */}
              <div className="hidden md:block text-zinc-600 font-bold">➡️</div>

              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded text-xs font-mono text-center w-full md:w-44 min-h-[50px] flex flex-col justify-center">
                {routeMode === 'parametric' ? (
                  <span className="text-zinc-500 italic text-[11px]">Guesses answer from parameters (Prone to cutoff / ignorance)</span>
                ) : (
                  <span className="text-brandCyan text-[11px] font-semibold">Retrieves latest context chunks + synthesizes with LLM</span>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-800/80 mt-4 pt-3 flex justify-between items-center text-xs">
              <span className="text-zinc-500">How facts are fetched:</span>
              <span className="font-mono font-bold text-zinc-300">
                {routeMode === 'parametric' ? "Weights calculation" : "Vector embedding lookup + prompt augmentation"}
              </span>
            </div>
          </div>

          <div className="bg-brandAmber/5 border border-brandAmber/20 p-4 rounded-xl text-xs text-zinc-300">
            <strong>CRITICAL TAKEAWAY:</strong> Large models like Llama-3 (70B) or GPT-4 know a lot, but their parametric memory cannot access your database, your calendar, or what happened 5 minutes ago. **RAG is the solution.**
          </div>
        </div>
      )
    },

    // Slide 4: Problem 1 - Private Data
    {
      title: "Problem 1: LLMs Don't Know Your Private Data",
      subtitle: "Why training datasets block internal enterprise query capability",
      notes: "Click the 'RAG Toggle' to show the contrast in real-time. Make sure to stress that no company can upload their client databases into pre-training sets because of security, cost, and time.",
      render: () => (
        <div className="space-y-5">
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4.5 rounded-xl">
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Scenario: Enterprise Customer Query</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">Testing internal refund policies for custom SLA clients</p>
            </div>

            <div className="flex items-center gap-3 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
              <span className="text-[11px] font-bold text-zinc-400">RAG System Context:</span>
              <button 
                onClick={() => setProb1UseRag(!prob1UseRag)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  prob1UseRag 
                    ? 'bg-brandGreen/20 text-brandGreen border border-brandGreen/40' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {prob1UseRag ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>{prob1UseRag ? "Enabled (RAG)" : "Disabled (No RAG)"}</span>
              </button>
            </div>
          </div>

          {/* Chat Mock */}
          <div className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden text-xs">
            <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>SIMULATED CHAT WINDOW</span>
              <span>Model: Llama-3-70b-instruct</span>
            </div>
            
            <div className="p-4 space-y-4">
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-zinc-800 text-zinc-100 rounded-2xl rounded-tr-none px-4 py-2.5 max-w-md">
                  <strong>User:</strong> What is our company's refund policy for enterprise clients?
                </div>
              </div>

              {/* Bot response */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={prob1UseRag ? 'rag' : 'no-rag'}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex justify-start"
                >
                  {prob1UseRag ? (
                    <div className="bg-brandGreen/5 border border-brandGreen/20 text-zinc-200 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-md">
                      <strong>AI Co-Pilot (with RAG):</strong> 
                      <p className="mt-1 leading-relaxed text-zinc-300">
                        Based on the retrieved **Enterprise Agreement SLA Doc (Section 4.2)**: 
                        Enterprise clients are eligible for a full refund if service downtime exceeds 99.9% in a billing cycle. Refund requests must be filed within **30 days** of the outage event.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-red-500/5 border border-red-500/10 text-zinc-200 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-md">
                      <strong>AI (without RAG):</strong>
                      <p className="mt-1 leading-relaxed text-red-400">
                        ❌ I do not have access to your company's internal policies. I can only answer based on generic web-scraped public data up to my training cutoff.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl text-xs space-y-2">
            <h5 className="font-bold text-zinc-200 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-brandPurple" />
              Why this requires RAG:
            </h5>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Private internal documents (wikis, Notion docs, PDF specs) are never leaked to public training datasets. The model simply does not have the variables in its weights. RAG retrieves the text block on-the-fly and drops it directly into the prompt context.
            </p>
          </div>
        </div>
      )
    },

    // Slide 5: Problem 2 - Knowledge Cutoff
    {
      title: "Problem 2: LLMs Have a Knowledge Cutoff Date",
      subtitle: "The temporal barrier of parametric memory",
      notes: "Guide the PMs through the date slider. Highlight how the model fails for events that happened in 2024 or 2026 because the weights were compiled in late 2023.",
      render: () => {
        const events = {
          2023: { title: "GPT-4 Released", desc: "Model has parametric details inside weights.", known: true },
          2024: { title: "Llama-3 Launch", desc: "Launched after training cutoff. Model is ignorant.", known: false },
          2025: { title: "World AI Treaty Signed", desc: "Historical event occurring post-cutoff.", known: false },
          2026: { title: "Your Project Launch Today", desc: "Real-time query of today's event.", known: false }
        }

        const currentEvent = events[cutoffYear]

        return (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Drag to change event year:</span>
                <span className="font-bold text-brandPurple font-mono text-sm">{cutoffYear}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-zinc-500 font-mono">2023</span>
                <input 
                  type="range" 
                  min="2023" 
                  max="2026" 
                  step="1"
                  value={cutoffYear}
                  onChange={(e) => setCutoffYear(parseInt(e.target.value))}
                  className="flex-1 accent-brandPurple cursor-pointer h-1 bg-zinc-800 rounded-lg"
                />
                <span className="text-[10px] text-zinc-500 font-mono">2026</span>
              </div>

              {/* Visual timeline */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px] font-mono">
                {Object.keys(events).map(y => (
                  <div key={y} className={`p-2 rounded border ${cutoffYear === parseInt(y) ? 'border-brandPurple bg-brandPurple/5 text-white font-bold' : 'border-zinc-800 text-zinc-500'}`}>
                    {y}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-mono text-zinc-500 block">Event Queried</span>
                  <h4 className="text-sm font-bold text-zinc-200 mt-1">{currentEvent.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{currentEvent.desc}</p>
                </div>
                <div className="mt-4 flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-zinc-400">Parametric Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${currentEvent.known ? 'bg-brandGreen/20 text-brandGreen' : 'bg-brandAmber/20 text-brandAmber'}`}>
                    {currentEvent.known ? "Weights Contain Fact" : "Post-Cutoff (Ignored)"}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                <span className="text-[9px] uppercase font-mono text-zinc-500 block">LLM Answer Comparison</span>
                
                <div className="space-y-2 text-[11px] leading-relaxed">
                  <div className="bg-red-500/5 p-2.5 rounded border border-red-500/10">
                    <span className="text-red-400 font-bold block">❌ Parametric Response:</span>
                    <span className="text-zinc-400">
                      {cutoffYear === 2023 
                        ? "GPT-4 is OpenAI's state-of-the-art model released in March 2023..." 
                        : `I do not have factual details about ${cutoffYear} events as my knowledge cutoff is January 2024.`}
                    </span>
                  </div>

                  <div className="bg-brandCyan/5 p-2.5 rounded border border-brandCyan/20">
                    <span className="text-brandCyan font-bold block">⚡ RAG (Google Search/Web-Index) Response:</span>
                    <span className="text-zinc-300">
                      {cutoffYear === 2023 
                        ? "GPT-4 is OpenAI's model..." 
                        : `Retrieved facts show: ${currentEvent.title} occurred in ${cutoffYear}. Details: ${currentEvent.desc}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brandPurple/5 border border-brandPurple/20 p-4 rounded-xl text-xs text-zinc-300">
              <strong>SUMMARY: WHY RAG IS NEEDED AT THE BEGINNING</strong>
              <p className="mt-1 leading-relaxed text-[11px] text-zinc-400">
                LLMs suffer from three core flaws: **Private Data ignorance**, **Knowledge Cutoffs**, and **Hallucination** (fabricating answers when ignorant). RAG is needed right at the start of the architecture because it transforms the LLM from a closed-book system guessing facts to an open-book system reading verified database chunks.
              </p>
            </div>
          </div>
        )
      }
    },

    // Slide 6: Fine-Tuning vs RAG
    {
      title: "Fine-Tuning vs. RAG: Which to Use?",
      subtitle: "Retraining model weights vs. Injecting prompt context",
      notes: "Compare the two strategies. Emphasize that fine-tuning is for teaching the model style, behavior, or formatting (how to speak), while RAG is for facts (what to say).",
      render: () => {
        const metrics = [
          { label: "Update Latency", ft: "Hours to Days (Retraining)", rag: "Real-time (Update Vector Index in ms)" },
          { label: "Factual Accuracy", ft: "Prone to hallucinations", rag: "Highly grounded (Reference links)" },
          { label: "Training Costs", ft: "High (GPU instances, compute time)", rag: "Low (Small database query cost)" },
          { label: "Access Control", ft: "Impossible (All or nothing)", rag: "Easy (Filter document permissions)" },
          { label: "Tone/Style Alignment", ft: "Excellent (Customized output form)", rag: "Average (Rely on prompt instructions)" }
        ]

        return (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Fine-tuning is like **memorizing** a medical textbook for a license exam. RAG is like taking the exam with **open book access** to the latest medical database.
            </p>

            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-bold">
                    <th className="p-3">Requirement</th>
                    <th className="p-3 text-brandAmber">Fine-Tuning (Model Weights)</th>
                    <th className="p-3 text-brandCyan">RAG (Prompt Injection)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {metrics.map((m, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="p-3 font-semibold text-zinc-200">{m.label}</td>
                      <td className="p-3 text-zinc-400">{m.ft}</td>
                      <td className="p-3 text-zinc-300">{m.rag}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-850">
                <span className="text-[10px] uppercase font-mono text-brandPurple font-bold block mb-1">When to Fine-Tune:</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  You need the model to output a custom JSON scheme, align to a strict brand voice, speak a specific programming language, or operate on low-resource hardware.
                </p>
              </div>
              <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-850">
                <span className="text-[10px] uppercase font-mono text-brandCyan font-bold block mb-1">When to use RAG:</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Your knowledge base changes frequently, you need zero hallucinations, you require citations/links to sources, or you have strict data permissions.
                </p>
              </div>
            </div>
          </div>
        )
      }
    },

    // Slide 7: In-Context Learning (ICL) in Action
    {
      title: "In-Context Learning (ICL) in Action",
      subtitle: "Teaching the model facts dynamically inside the prompt context",
      notes: "This is a key interactive playground! Let the user select a preset or type a private secret and see the compiled prompt.",
      render: () => (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Presets */}
            <div className="md:col-span-1 space-y-2">
              <span className="text-[9px] uppercase font-mono text-zinc-500 block">Select Demo Scenario</span>
              {presetsICL.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedICLPreset(idx); }}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer block ${
                    selectedICLPreset === idx && !iclCustomFact
                      ? 'border-brandPurple bg-brandPurple/5 text-white' 
                      : 'border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {preset.title}
                </button>
              ))}
              <div className="border-t border-zinc-800/80 my-3 pt-3">
                <span className="text-[9px] uppercase font-mono text-zinc-500 block mb-1">Or Paste Custom Fact</span>
                <textarea 
                  value={iclCustomFact}
                  onChange={(e) => setIclCustomFact(e.target.value)}
                  placeholder="e.g. Saloni's dog is named Pixel."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-[11px] font-mono text-zinc-200 focus:outline-none"
                />
                <input 
                  type="text" 
                  value={iclCustomQuestion}
                  onChange={(e) => setIclCustomQuestion(e.target.value)}
                  placeholder="e.g. What is the dog's name?"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-[11px] font-mono text-zinc-200 mt-2 focus:outline-none"
                />
              </div>
            </div>

            {/* Prompt compilation view */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-mono text-zinc-500">Live Compiled Prompt</span>
                <label className="flex items-center gap-2 text-[11px] text-zinc-300 font-semibold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={iclUseContext} 
                    onChange={(e) => setIclUseContext(e.target.checked)} 
                    className="rounded accent-brandPurple"
                  />
                  Inject Context
                </label>
              </div>

              <div className="bg-zinc-950 border border-zinc-850 p-4.5 rounded-xl font-mono text-[10px] text-zinc-400 space-y-2 leading-relaxed">
                <div>
                  <span className="text-brandPurple font-semibold">{"// System Prompt Context"}</span>
                  <p className="text-zinc-500 italic">"Answer the user query using only the documents below..."</p>
                </div>
                {iclUseContext && (
                  <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300">
                    <span className="text-brandGreen font-bold">[CONTEXT DOC]: </span>
                    {iclCustomFact || presetsICL[selectedICLPreset].fact}
                  </div>
                )}
                <div className="border-t border-zinc-850 pt-2">
                  <span className="text-brandCyan font-semibold">{"// User Query"}</span>
                  <p className="text-zinc-200">
                    {iclCustomQuestion || presetsICL[selectedICLPreset].question}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={runICLSimulation}
                  disabled={iclSimulating}
                  className="flex-1 py-2.5 bg-brandPurple text-white text-xs font-bold rounded-lg hover:bg-brandPurple/90 glow-purple disabled:bg-zinc-800 disabled:text-zinc-600 transition-all cursor-pointer"
                >
                  {iclSimulating ? "Simulating Inference..." : "Simulate LLM Output"}
                </button>
              </div>

              {/* simulated output */}
              <AnimatePresence>
                {iclOutput && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border text-xs font-mono leading-relaxed ${
                      iclUseContext ? 'border-brandGreen/30 bg-brandGreen/5 text-zinc-300' : 'border-red-500/20 bg-red-500/5 text-red-400'
                    }`}
                  >
                    <strong>Output:</strong> {iclOutput}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )
    },

    // Slide 8: Few-Shot Prompting
    {
      title: "Few-Shot Prompting",
      subtitle: "Teaching patterns and schemas by providing quick examples in context",
      notes: "Contrast Zero-Shot vs Few-Shot prompting. Stress that Few-Shot is great for formatting constraints (like outputting markdown tables or JSON tags).",
      render: () => {
        const prompts = {
          zero: {
            title: "Zero-Shot Prompt (No examples)",
            text: `System Context: Classify the sentiment of the text. Output JSON only.

User Query: "I bought this app and it crashes my phone every 10 minutes!"
LLM Output: "The sentiment is very negative because crashing the phone is a major usability issue..." (Hallucinates response shape - not pure JSON)`
          },
          few: {
            title: "Few-Shot Prompt (With 2 examples)",
            text: `System Context: Classify the sentiment of the text. Output JSON only.
---
Examples:
Input: "The delivery arrived early and the product works great!"
Output: { "sentiment": "positive", "score": 0.95 }

Input: "This camera lens is fine, but the autofocus is sluggish."
Output: { "sentiment": "neutral", "score": 0.52 }
---
User Query: "I bought this app and it crashes my phone every 10 minutes!"
LLM Output: { "sentiment": "negative", "score": 0.12 } (Perfect match to format!)`
          }
        }

        return (
          <div className="space-y-4">
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-fit">
              <button
                onClick={() => setFewShotMode('zero')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  fewShotMode === 'zero' ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Zero-Shot
              </button>
              <button
                onClick={() => setFewShotMode('few')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  fewShotMode === 'few' ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Few-Shot
              </button>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">
                {prompts[fewShotMode].title}
              </span>
              <pre className="bg-zinc-950 p-4.5 rounded-xl border border-zinc-850 font-mono text-[10px] text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-[220px] overflow-y-auto">
                {prompts[fewShotMode].text}
              </pre>
            </div>

            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 text-xs text-zinc-400 leading-relaxed">
              <strong>Why this connects to RAG:</strong> Sometimes in RAG, we don't just inject facts. We inject a *Few-shot Template* along with the facts so the model knows exactly how to format the retrieved documents.
            </div>
          </div>
        )
      }
    },

    // Slide 9: Segue into RAG (Limits of ICL)
    {
      title: "The Limits of ICL & The Segue into RAG",
      subtitle: "Why we can't just paste the whole internet in the prompt",
      notes: "Explain context limits. Talk about token pricing (money) and latency (speed), and the 'Lost in the Middle' cognitive limit of neural nets.",
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2 text-xs">
          {/* Box 1 */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-4.5 rounded-xl space-y-2">
            <div className="w-8 h-8 bg-brandPurple/10 text-brandPurple rounded-lg flex items-center justify-center font-bold">
              💰
            </div>
            <h4 className="font-bold text-zinc-200">Token Costs</h4>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Prompt costs scale linearly with character size. Feeding a 500-page manual on every query leads to unsustainable API bills in production.
            </p>
          </div>

          {/* Box 2 */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-4.5 rounded-xl space-y-2">
            <div className="w-8 h-8 bg-brandCyan/10 text-brandCyan rounded-lg flex items-center justify-center font-bold">
              ⏱️
            </div>
            <h4 className="font-bold text-zinc-200">Latency spikes</h4>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Processing huge context blocks forces the model to calculate attention matrices across massive vectors. Output Time-to-First-Token (TTFT) balloons.
            </p>
          </div>

          {/* Box 3 */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-4.5 rounded-xl space-y-2">
            <div className="w-8 h-8 bg-brandAmber/10 text-brandAmber rounded-lg flex items-center justify-center font-bold">
              🧠
            </div>
            <h4 className="font-bold text-zinc-200">Lost In The Middle</h4>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Research shows LLMs focus on the beginning and end of prompts, completely ignoring details hidden in the middle of long instructions.
            </p>
          </div>
        </div>
      )
    },

    // Slide 10: RAG Architecture
    {
      title: "The RAG Architecture Diagram",
      subtitle: "Understanding Ingestion (Offline) vs. Retrieval & Generation (Online)",
      notes: "This slide explains the architecture. Click on the nodes to show specific steps. Emphasize that indexing is done ahead of time, while retrieval is dynamic.",
      render: () => {
        const nodeDetails = {
          loader: {
            title: "1. Document Ingestion",
            system: "LangChain (Document Loaders)",
            appSim: "FileReader API (custom uploads) & Presets",
            desc: "Extracts text from raw data sources (PDFs, Markdown, Web Pages) and formats it into standard LangChain Document objects containing page content and metadata.",
            details: [
              "Extracts text from PDFs, HTML, or cloud APIs",
              "Stores source metadata (filename, page, section)",
              "Airtribe Sim: Loads preset arrays or parses files locally via FileReader"
            ]
          },
          splitter: {
            title: "2. Text Splitting & Chunking",
            system: "LangChain (RecursiveCharacterTextSplitter)",
            appSim: "Regex sentence match & sliding character offsets",
            desc: "Segments long text blocks into smaller pieces (chunks). It maintains a sliding overlap to ensure terms located at chunk boundaries aren't split in half.",
            details: [
              "Chunk Size: Limits maximum characters/tokens per block",
              "Chunk Overlap: Retains sliding content to preserve context",
              "Airtribe Sim: Sentence splitter regex and sliding character windows"
            ]
          },
          embedder: {
            title: "3. Text Embedding",
            system: "OpenAI API (text-embedding-3-small)",
            appSim: "2D coordinate mapper based on keywords",
            desc: "Translates human-readable text chunks into high-dimensional numerical vectors. Words with similar meanings are mapped to adjacent coordinate values.",
            details: [
              "Converts variable text to fixed-size vectors (e.g., 1536 dims)",
              "Forces semantic alignment across multi-lingual concepts",
              "Airtribe Sim: Heuristic coordinate mapping based on categories"
            ]
          },
          vectordb: {
            title: "4. Vector Index Storage",
            system: "ChromaDB / Pinecone / pgvector",
            appSim: "In-memory array state of coordinate objects",
            desc: "Stores and indexes the float vector arrays alongside their text payloads and source metadata. Provides indexing for ultra-fast distance search queries.",
            details: [
              "Builds navigable graphs (HNSW) for quick nearest-neighbor lookups",
              "Supports metadata filtering (e.g., category, version)",
              "Airtribe Sim: React state list mapping vector coordinates"
            ]
          },
          query: {
            title: "1. User Query Entry",
            system: "Client Application Form",
            appSim: "Preset selectors & custom text input states",
            desc: "The entry point of the online pipeline. The user submits a natural language prompt, question, or document search phrase.",
            details: [
              "Accepts raw user prompt input strings",
              "Airtribe Sim: Custom question box or preset list selections"
            ]
          },
          query_embed: {
            title: "2. Query Vectorization",
            system: "OpenAI API (text-embedding-3-small)",
            appSim: "Same 2D coordinate heuristic map",
            desc: "Converts the query prompt into a semantic vector using the exact same embedding model used during index creation.",
            details: [
              "Creates a vector of matching coordinates for the prompt",
              "Must match the dimension sizes and model of the vector index",
              "Airtribe Sim: Identical 2D coordinate mapping rules"
            ]
          },
          sim_search: {
            title: "3. Semantic Vector Search",
            system: "ChromaDB (Query Retrieval Engine)",
            appSim: "Word overlap ratio + Euclidean distance",
            desc: "Searches the database to find vectors that are geometrically closest to the query vector, using metrics like Cosine Similarity or Dot Product.",
            details: [
              "Calculates cosine distances across all chunks",
              "Applies scoring thresholds to filter out low-confidence matches",
              "Airtribe Sim: Word overlap calculations and 2D coordinate distances"
            ]
          },
          prompt_builder: {
            title: "4. Prompt Augmentation",
            system: "LangChain (Prompt Templates)",
            appSim: "ES6 Template Literal concatenation",
            desc: "Retrieves the highest-ranked text chunks and injects them directly into the context window of a system prompt template, augmenting the query.",
            details: [
              "Compiles instructions: 'Answer using only the retrieved context...'",
              "Protects model from guessing or referencing outdated data",
              "Airtribe Sim: Combines chunks and instructions into one string"
            ]
          },
          llm: {
            title: "5. Grounded Generation",
            system: "OpenAI (gpt-4o / gpt-4o-mini)",
            appSim: "Mock string synthesis + response timeout delay",
            desc: "The augmented prompt is passed to the LLM. The model reads the context chunks to synthesize a grounded, accurate answer.",
            details: [
              "Low temperature (e.g., 0.1) enforces factual grounding",
              "Significantly reduces hallucination by providing facts directly",
              "Airtribe Sim: Text-join mock output generation"
            ]
          }
        }

        const isIngestion = ['loader', 'splitter', 'embedder', 'vectordb'].includes(selectedArchNode)

        return (
          <div className="space-y-4">
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-fit">
              <button
                onClick={() => setSelectedArchNode('loader')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isIngestion ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Offline Ingestion (LangChain + ChromaDB)
              </button>
              <button
                onClick={() => setSelectedArchNode('query')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isIngestion ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Online Retrieval & Gen (LangChain + OpenAI)
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Diagram graphic */}
              <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col justify-center min-h-[300px]">
                {isIngestion ? (
                  <div className="space-y-4">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-center">
                      Offline Ingestion Flow
                    </div>
                    <div className="flex flex-col gap-3">
                      {/* Loader Node */}
                      <button
                        onClick={() => setSelectedArchNode('loader')}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedArchNode === 'loader' 
                            ? 'border-brandPurple bg-brandPurple/10 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-white font-semibold' 
                            : 'border-zinc-850 bg-zinc-900/40 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-brandPurple" />
                            <span className="text-xs">1. Document Loader</span>
                          </div>
                          <span className="text-[9px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 border border-zinc-700">LangChain</span>
                        </div>
                      </button>

                      {/* Splitter Node */}
                      <button
                        onClick={() => setSelectedArchNode('splitter')}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedArchNode === 'splitter' 
                            ? 'border-brandPurple bg-brandPurple/10 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-white font-semibold' 
                            : 'border-zinc-850 bg-zinc-900/40 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Scissors className="w-4 h-4 text-brandCyan" />
                            <span className="text-xs">2. Text Splitter & Chunker</span>
                          </div>
                          <span className="text-[9px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 border border-zinc-700">LangChain</span>
                        </div>
                      </button>

                      {/* Embedder Node */}
                      <button
                        onClick={() => setSelectedArchNode('embedder')}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedArchNode === 'embedder' 
                            ? 'border-brandPurple bg-brandPurple/10 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-white font-semibold' 
                            : 'border-zinc-850 bg-zinc-900/40 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Cpu className="w-4 h-4 text-brandAmber" />
                            <span className="text-xs">3. Embedding Model</span>
                          </div>
                          <span className="text-[9px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 border border-zinc-700">OpenAI</span>
                        </div>
                      </button>

                      {/* Vector DB Node */}
                      <button
                        onClick={() => setSelectedArchNode('vectordb')}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedArchNode === 'vectordb' 
                            ? 'border-brandPurple bg-brandPurple/10 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-white font-semibold' 
                            : 'border-zinc-850 bg-zinc-900/40 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Database className="w-4 h-4 text-brandGreen" />
                            <span className="text-xs">4. Vector DB Index</span>
                          </div>
                          <span className="text-[9px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 border border-zinc-700">ChromaDB</span>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-center">
                      Online Inference Flow
                    </div>
                    <div className="flex flex-col gap-2">
                      {/* Query */}
                      <button
                        onClick={() => setSelectedArchNode('query')}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          selectedArchNode === 'query' 
                            ? 'border-brandPurple bg-brandPurple/10 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-white font-semibold' 
                            : 'border-zinc-850 bg-zinc-900/40 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-brandPurple" />
                            <span className="text-[11px]">1. User Query Entry</span>
                          </div>
                          <span className="text-[8px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">UI Input</span>
                        </div>
                      </button>

                      {/* Query Embed */}
                      <button
                        onClick={() => setSelectedArchNode('query_embed')}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          selectedArchNode === 'query_embed' 
                            ? 'border-brandPurple bg-brandPurple/10 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-white font-semibold' 
                            : 'border-zinc-850 bg-zinc-900/40 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-3.5 h-3.5 text-brandCyan" />
                            <span className="text-[11px]">2. Vectorize Query</span>
                          </div>
                          <span className="text-[8px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">OpenAI</span>
                        </div>
                      </button>

                      {/* Semantic Search */}
                      <button
                        onClick={() => setSelectedArchNode('sim_search')}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          selectedArchNode === 'sim_search' 
                            ? 'border-brandPurple bg-brandPurple/10 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-white font-semibold' 
                            : 'border-zinc-850 bg-zinc-900/40 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-brandAmber" />
                            <span className="text-[11px]">3. Semantic Search</span>
                          </div>
                          <span className="text-[8px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">ChromaDB</span>
                        </div>
                      </button>

                      {/* Augment */}
                      <button
                        onClick={() => setSelectedArchNode('prompt_builder')}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          selectedArchNode === 'prompt_builder' 
                            ? 'border-brandPurple bg-brandPurple/10 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-white font-semibold' 
                            : 'border-zinc-850 bg-zinc-900/40 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Database className="w-3.5 h-3.5 text-brandGreen" />
                            <span className="text-[11px]">4. Prompt Augmentation</span>
                          </div>
                          <span className="text-[8px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">LangChain</span>
                        </div>
                      </button>

                      {/* LLM Response */}
                      <button
                        onClick={() => setSelectedArchNode('llm')}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          selectedArchNode === 'llm' 
                            ? 'border-brandPurple bg-brandPurple/10 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-white font-semibold' 
                            : 'border-zinc-850 bg-zinc-900/40 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Brain className="w-3.5 h-3.5 text-brandPurple" />
                            <span className="text-[11px]">5. Grounded Generation</span>
                          </div>
                          <span className="text-[8px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">OpenAI</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Node Details */}
              <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4.5 space-y-3 flex flex-col justify-between min-h-[300px]">
                {nodeDetails[selectedArchNode] ? (
                  <div className="space-y-3.5">
                    <div>
                      <span className="text-[9px] uppercase font-mono bg-zinc-800 text-zinc-300 font-bold px-2 py-0.5 rounded border border-zinc-700">
                        TECH: {nodeDetails[selectedArchNode].system}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-200 mt-2.5">
                        {nodeDetails[selectedArchNode].title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {nodeDetails[selectedArchNode].desc}
                    </p>
                    
                    <div className="bg-zinc-950/80 border border-zinc-850 rounded p-2.5 space-y-1">
                      <span className="text-[9px] uppercase font-mono text-brandPurple font-bold block">
                        Codebase Simulation Match:
                      </span>
                      <span className="text-[10px] text-zinc-300 leading-relaxed font-mono block">
                        {nodeDetails[selectedArchNode].appSim}
                      </span>
                    </div>

                    <div className="space-y-1.5 border-t border-zinc-800/80 pt-2.5">
                      <span className="text-[9px] uppercase font-mono text-zinc-500 block">Workflow Checklist:</span>
                      {nodeDetails[selectedArchNode].details.map((s, idx) => (
                        <div key={idx} className="text-[10px] text-zinc-300 flex items-start gap-1.5 leading-tight">
                          <span className="text-brandPurple font-bold">✓</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs italic">
                    Select a pipeline node to view details
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
    },

    // Slide 11: Chunking & Text Segmentation
    {
      title: "Real-time Ingestion & Text Chunking",
      subtitle: "Adjust size and overlap to see text boundaries change instantly",
      notes: "This is a super popular visual demonstration! Explain chunk overlap: it ensures that details at the borders of chunks are not lost during retrieval.",
      render: () => (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            {/* Slider 1 */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-semibold">Chunk Size (Characters):</span>
                <span className="text-brandPurple font-bold font-mono">{chunkSize}</span>
              </div>
              <input 
                type="range" 
                min="40" 
                max="250" 
                step="5"
                value={chunkSize}
                onChange={(e) => setChunkSize(parseInt(e.target.value))}
                className="w-full accent-brandPurple cursor-pointer h-1.5 bg-zinc-950 rounded-lg"
              />
            </div>

            {/* Slider 2 */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-semibold">Chunk Overlap:</span>
                <span className="text-brandCyan font-bold font-mono">{chunkOverlap}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="80" 
                step="5"
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(parseInt(e.target.value))}
                className="w-full accent-brandCyan cursor-pointer h-1.5 bg-zinc-950 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Visual Highlights */}
            <div className="lg:col-span-8 bg-zinc-950 p-4.5 rounded-xl border border-zinc-850 min-h-[160px] flex flex-col justify-between">
              <div>
                <span className="text-[9px] uppercase font-mono text-zinc-500 block mb-2">Segmented Output Preview</span>
                <div className="text-[11px] leading-relaxed font-mono whitespace-pre-wrap max-h-[160px] overflow-y-auto pr-1">
                  {calculatedChunks.map((chunk, idx) => {
                    const colors = [
                      'bg-emerald-950/20 text-emerald-300 border-emerald-800/40',
                      'bg-indigo-950/20 text-indigo-300 border-indigo-800/40',
                      'bg-violet-950/20 text-violet-300 border-violet-800/40',
                      'bg-purple-950/20 text-purple-300 border-purple-800/40',
                      'bg-amber-950/20 text-amber-300 border-amber-800/40'
                    ]
                    const colorClass = colors[idx % colors.length]
                    return (
                      <span 
                        key={chunk.id}
                        className={`inline-block px-1.5 py-0.5 rounded border m-0.5 ${colorClass}`}
                        title={`Chunk #${chunk.id} (Len: ${chunk.text.length})`}
                      >
                        {chunk.text}
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="text-[9px] text-zinc-500 font-mono mt-3 border-t border-zinc-900 pt-2 flex justify-between">
                <span>Total Chunks: {calculatedChunks.length}</span>
                <span>Algorithm: Fixed Character Sliding Window</span>
              </div>
            </div>

            {/* PM Guidelines box */}
            <div className="lg:col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2.5 text-xs text-zinc-400">
              <h5 className="font-bold text-zinc-200">PM Chunk Strategy Rules:</h5>
              <div className="space-y-1.5 leading-relaxed text-[11px]">
                <p><strong>Small Chunks (e.g. 100 chars):</strong> Captures highly specific sentences, but risks losing the broader context.</p>
                <p><strong>Large Chunks (e.g. 1000 chars):</strong> Captures overall context, but introduces noise/filler text to the prompt.</p>
                <p><strong>Overlap (e.g. 10-20%):</strong> Crucial to prevent splitting key facts in half across chunks.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },

  // Slide 12: Embeddings & Vector Space
  {
    title: "Vector Space & Text Proximity",
    subtitle: "How RAG translates text strings into coordinates to measure meaning",
    notes: "Explain semantic closeness. Clicking words draws proximity lines. User can type a search query to plot and see the closest 3 chunks light up.",
    render: () => (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Controls */}
          <div className="md:col-span-4 space-y-3.5">
            <span className="text-[9px] uppercase font-mono text-zinc-500 block">Embed Query</span>
            <div className="space-y-1.5">
              <input 
                type="text" 
                value={vectorQuery}
                onChange={(e) => setVectorQuery(e.target.value)}
                placeholder="Type 'refund', 'sarah', or 'server'..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
              <span className="text-[9px] text-zinc-500 block leading-relaxed">
                Matches are highlighted in real-time based on calculated distance.
              </span>
            </div>

            {queryPoints && (
              <div className="bg-brandPurple/5 border border-brandPurple/20 p-3 rounded-xl text-xs space-y-2">
                <span className="text-xs font-bold text-zinc-300">Closest Chunks (Top-3):</span>
                <div className="space-y-1 text-[10px] font-mono">
                  {queryPoints.matches.map((m, idx) => (
                    <div key={idx} className="flex justify-between text-zinc-400">
                      <span className="truncate max-w-[140px]">{m.label}</span>
                      <span className="text-brandCyan">{(100 - m.dist.toFixed(0))}% match</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Canvas Plot */}
          <div className="md:col-span-8 bg-zinc-950 border border-zinc-800 rounded-xl p-4 relative min-h-[240px] flex flex-col justify-between overflow-hidden select-none">
            
            {/* Grid Map */}
            <div className="relative w-full h-44 border border-zinc-900 rounded bg-zinc-900/20">
              {/* Plot preset points */}
              {vectorPointsPreset.map(p => {
                const isClosest = queryPoints && queryPoints.matches.some(m => m.id === p.id)
                return (
                  <div 
                    key={p.id}
                    className="absolute"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                    <div 
                      className={`w-2 h-2 rounded-full cursor-help -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                        isClosest 
                          ? 'bg-brandCyan scale-[1.7] ring-4 ring-brandCyan/20 z-10' 
                          : p.category === 'Refunds' ? 'bg-red-500/70' : p.category === 'Roadmap' ? 'bg-violet-500/70' : 'bg-emerald-500/70'
                      }`}
                      title={`${p.label}: "${p.text}"`}
                    />
                    <span className={`absolute top-2 left-2 text-[8px] font-mono whitespace-nowrap bg-zinc-900/80 px-1 py-0.5 rounded pointer-events-none border border-zinc-850 transition-colors ${
                      isClosest ? 'text-brandCyan border-brandCyan/40 font-bold' : 'text-zinc-500'
                    }`}>
                      {p.label}
                    </span>
                  </div>
                )
              })}

              {/* Plot query point */}
              {queryPoints && (
                <div 
                  className="absolute"
                  style={{ left: `${queryPoints.x}%`, top: `${queryPoints.y}%` }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-brandAmber border border-white -translate-x-1/2 -translate-y-1/2 animate-ping absolute" />
                  <div className="w-3.5 h-3.5 rounded-full bg-brandAmber border border-white -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center text-[7px] text-black font-bold">
                    Q
                  </div>
                  <span className="absolute -top-5 -left-8 text-[9px] font-mono bg-brandAmber text-black px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                    Query Embedding
                  </span>

                  {/* Draw connecting lines to top matches */}
                  <svg className="absolute top-0 left-0 w-80 h-44 overflow-visible pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0">
                    {queryPoints.matches.map((m, idx) => (
                      <line 
                        key={idx}
                        x1="0" 
                        y1="0" 
                        x2={`${(m.x - queryPoints.x) * 4.5}px`} 
                        y2={`${(m.y - queryPoints.y) * 2.5}px`} 
                        stroke="rgba(6, 182, 212, 0.4)" 
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                        className="transition-all duration-300"
                      />
                    ))}
                  </svg>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono mt-3 border-t border-zinc-900 pt-2">
              <div className="flex gap-3">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Refunds</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-violet-500 rounded-full" /> Roadmap</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Schedules</span>
              </div>
              <span>Distance Metric: Cosine Similarity</span>
            </div>
          </div>
        </div>
      </div>
    )
  },

  // Slide 13: Retrieval in Action
  {
    title: "Vector DB Search & Retrieval",
    subtitle: "Type queries to search facts in real-time. Only scores above thresholds pass to LLM.",
    notes: "Demonstrate threshold logic. Emphasize that in production, you filter out low-scoring chunks (e.g. similarity < 0.4) to avoid prompt pollution.",
    render: () => (
      <div className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex gap-3 items-center">
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <input 
            type="text" 
            value={retrievalQuery}
            onChange={(e) => setRetrievalQuery(e.target.value)}
            placeholder="Type 'When is launch?' or 'How long is server down?'..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-brandPurple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Ranked list */}
          <div className="lg:col-span-8 space-y-2">
            <span className="text-[9px] uppercase font-mono text-zinc-500 block">Ranked Database Results</span>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {rankedChunks.map((c, idx) => {
                const passes = c.score > 0.4
                return (
                  <div 
                    key={c.id} 
                    className={`p-2.5 rounded-lg border text-xs leading-relaxed transition-all ${
                      passes 
                        ? 'border-brandGreen/30 bg-brandGreen/5 text-zinc-200' 
                        : 'border-zinc-800 text-zinc-500 bg-zinc-900/10'
                    }`}
                  >
                    <div className="flex justify-between font-mono text-[9px] mb-1">
                      <span className="font-bold">Chunk #{c.id} ({c.category})</span>
                      <span className={passes ? 'text-brandGreen font-bold' : 'text-zinc-600'}>
                        Similarity: {c.score.toFixed(2)} {passes ? '[PASSED]' : '[FILTERED OUT]'}
                      </span>
                    </div>
                    <p>{c.text}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* PM Advice on thresholds */}
          <div className="lg:col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4.5 space-y-3 text-xs text-zinc-400">
            <h5 className="font-bold text-zinc-200">The Relevance Threshold</h5>
            <p className="leading-relaxed text-[11px]">
              If similarity scores are low (e.g. below 0.35), it means the Vector DB failed to find relevant facts. 
            </p>
            <p className="leading-relaxed text-[11px]">
              <strong>PM Decision:</strong> Reject low-score chunks. When no chunks pass, instruct the model: <em>"Explain that the answer isn't in your document base."</em> This blocks hallucinations.
            </p>
          </div>
        </div>
      </div>
    )
  },

  // Slide 14: Prompt Augmentation
  {
    title: "Step 4: Prompt Augmentation & Compiling",
    subtitle: "Injecting the retrieved context chunks into the LLM system prompt context",
    notes: "Show the raw template structure. Explain that the LLM has no idea RAG occurred; it just gets a normal prompt with facts pasted into it.",
    render: () => {
      const topChs = rankedChunks.filter(c => c.score > 0.4).slice(0, 2)
      
      return (
        <div className="space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            The LLM doesn't search databases. The **RAG Middleware** performs the search, formats the retrieved texts, and injects them into a system context placeholder before invoking the LLM API.
          </p>

          <div className="bg-zinc-950 border border-zinc-850 p-4.5 rounded-xl font-mono text-[10px] text-zinc-400 space-y-3 leading-relaxed">
            <div>
              <span className="text-zinc-500 font-bold">{"# SYSTEM INSTRUCTIONS"}</span>
              <p className="text-zinc-300">
                You are a grounded support agent. Use ONLY the reference context chunks below to answer. If the context does not contain the answer, say "I don't have access to this information."
              </p>
            </div>

            <div className="bg-brandPurple/5 border border-brandPurple/20 p-3 rounded space-y-2 text-zinc-300">
              <span className="text-brandPurple font-bold">{"# REFERENCE CONTEXT CHUNKS"}</span>
              {topChs.length > 0 ? (
                topChs.map((c, idx) => (
                  <div key={idx} className="border-b border-zinc-800 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-brandCyan font-semibold text-[9px] block">Chunk #{c.id} (Score: {c.score.toFixed(2)})</span>
                    <span>{c.text}</span>
                  </div>
                ))
              ) : (
                <span className="text-red-400 italic text-[9px] block">
                  [No Chunks Passed Threshold. Prompt remains un-augmented]
                </span>
              )}
            </div>

            <div>
              <span className="text-zinc-500 font-bold">{"# USER QUESTION"}</span>
              <p className="text-zinc-200">
                {retrievalQuery || "When is the launch date?"}
              </p>
            </div>
          </div>
        </div>
      )
    }
  },

  // Slide 15: Key Takeaways
  {
    title: "Key Takeaways",
    subtitle: "Summary of Module 16: Retrieval-Augmented Generation",
    notes: "Summarize the key points of the RAG session. Remind the group of the fundamental trade-offs between parameters and external database context.",
    render: () => {
      const takeaways = [
        "LLMs store knowledge in parameters (parametric knowledge) — but this has limits",
        "Three core problems: private data access, knowledge cutoff, hallucination",
        "Fine-tuning can help but is expensive, complex, and hard to keep updated",
        "In-Context Learning is an emergent ability — models learn from prompt examples",
        "RAG extends ICL by injecting relevant CONTEXT instead of just examples",
        "RAG has 4 steps: Indexing → Retrieval → Augmentation → Generation",
        "RAG is cheaper, simpler, and more maintainable than fine-tuning for knowledge tasks"
      ]
      return (
        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {takeaways.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 bg-zinc-900/30 border border-zinc-800/60 p-3 rounded-xl hover:bg-zinc-900/50 transition-colors">
              <div className="w-6 h-6 rounded-full bg-brandPurple/15 text-brandPurple flex items-center justify-center font-bold text-xs shrink-0 select-none">
                {idx + 1}
              </div>
              <p className="text-zinc-200 text-xs leading-relaxed font-medium">
                {item}
              </p>
            </div>
          ))}
        </div>
      )
    }
  },

  // Slide 16: Q&A - Foundational & Critical Thinking
  {
    title: "Q&A — Foundational & Critical Thinking",
    subtitle: "Click any question to reveal the answer",
    notes: "Discuss basic questions on model scaling vs retrieval needs. Explain the limits of scaling parameter size.",
    render: () => {
      const questions = [
        {
          id: "q1",
          q: "Q1: If an LLM has 405B parameters, why do we still need RAG?",
          a: "Even a 405B parameter model cannot access your private enterprise data (security/privacy limits) or know real-time events that occurred after its training cutoff date. RAG acts as an 'open-book' search mechanism, supplying the latest, proprietary data directly in the prompt context."
        },
        {
          id: "q2",
          q: "Q2: What happens if chunking is too small (~50 words) vs too large (~5000 words)?",
          a: "If chunking is too small, you lose critical context and semantic meaning surrounding the matched phrase. If chunking is too large, you introduce irrelevant noise/filler text, dilute the query signal, waste prompt tokens, and run into context window limits."
        },
        {
          id: "q3",
          q: "Q3: Can RAG work without embeddings — just keyword search?",
          a: "Yes, this is called lexical/keyword RAG (using algorithms like BM25). However, it struggles with synonyms, intent, and semantic meaning. The industry standard is hybrid search, combining keyword search (lexical match) with embeddings (semantic match) for optimal relevance."
        },
        {
          id: "q4",
          q: "Q4: If the vector store returns irrelevant chunks and the LLM answers from them — is that hallucination?",
          a: "Yes. If the retriever fetches irrelevant data and the LLM synthesizes an incorrect response based on that wrong context, it is called a 'retrieval-induced hallucination.' Proper filtering thresholds must be set to ignore low-score chunks."
        },
        {
          id: "q5",
          q: "Q5: What if the vector store has contradictory info (old policy vs new policy)?",
          a: "The retriever will fetch both chunks. The LLM will either get confused or try to merge them. To fix this, you must implement metadata filtering (e.g., filtering by active status or version) and clean outdated records from your database."
        }
      ]
      return (
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {questions.map((item) => {
            const isExpanded = expandedQA[item.id]
            return (
              <div key={item.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden text-xs">
                <button 
                  onClick={() => toggleQA(item.id)}
                  className="w-full px-4.5 py-3 flex justify-between items-center text-left hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-zinc-200">{item.q}</span>
                  <span className="text-brandPurple font-bold font-mono text-[10px] shrink-0 ml-3">
                    {isExpanded ? "Collapse ▴" : "Reveal Answer ▾"}
                  </span>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-zinc-850"
                    >
                      <div className="p-4 bg-zinc-950/60 text-zinc-300 leading-relaxed text-[11px] font-mono">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )
    }
  },

  // Slide 17: Q&A - Critical Thinking (cont.)
  {
    title: "Q&A — Critical Thinking (cont.)",
    subtitle: "Click any question to reveal the answer",
    notes: "Explore system failures and design questions like outdated vectors or identical embeddings.",
    render: () => {
      const questions = [
        {
          id: "q6",
          q: "Q6: Data is updated in the vector store but answers are still outdated. What went wrong?",
          a: "Check if: (1) your ingestion pipeline failed to overwrite the old vector IDs, (2) the similarity score for the new chunks is too low to pass the threshold, or (3) client-side caching or model temperature settings are interfering with output generation."
        },
        {
          id: "q7",
          q: "Q7: Can RAG completely eliminate hallucination?",
          a: "No. RAG reduces hallucination by 50-80% but can't eliminate it. Reasons: incomplete context, LLM blending its own knowledge, source errors, reasoning failures. Further reduce with: citations, chain-of-thought, verification steps."
        },
        {
          id: "q8",
          q: "Q8: Hospital RAG — one vector store or two for doctors and patients?",
          a: "Use separate indexes or strict metadata-based RBAC (Role-Based Access Control) filters. Doctors need medical jargon and full histories; patients need layperson explanations and restricted access to raw diagnoses to avoid panic or unauthorized data leaks."
        },
        {
          id: "q9",
          q: "Q9: Why must we use the SAME embedding model for indexing and querying?",
          a: "Embedding models map text to distinct multi-dimensional vector spaces. If you index with one model (e.g., OpenAI) and query with another (e.g., Cohere), their coordinate systems are completely incompatible, making semantic distance calculations meaningless."
        },
        {
          id: "q10",
          q: "Q10: 1 million documents — retrieval is slow. How to speed it up?",
          a: "Use HNSW (Hierarchical Navigable Small World) indices or IVFFlat (Inverted File Index) for approximate nearest neighbor (ANN) search instead of exhaustive brute-force flat search. Also, scale your database vertically, partition your collections, or cache frequent query results."
        }
      ]
      return (
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {questions.map((item) => {
            const isExpanded = expandedQA[item.id]
            return (
              <div key={item.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden text-xs">
                <button 
                  onClick={() => toggleQA(item.id)}
                  className="w-full px-4.5 py-3 flex justify-between items-center text-left hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-zinc-200">{item.q}</span>
                  <span className="text-brandPurple font-bold font-mono text-[10px] shrink-0 ml-3">
                    {isExpanded ? "Collapse ▴" : "Reveal Answer ▾"}
                  </span>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-zinc-850"
                    >
                      <div className="p-4 bg-zinc-950/60 text-zinc-300 leading-relaxed text-[11px] font-mono">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )
    }
  },

  // Slide 18: Q&A - RAG vs Fine-Tuning & Real-World
  {
    title: "Q&A — RAG vs Fine-Tuning & Real-World",
    subtitle: "Click any question to reveal the answer. Conclude the masterclass when finished.",
    notes: "Conclude the RAG Masterclass session. Address advanced architectural and language issues like Hindi token inflation.",
    render: () => {
      const questions = [
        {
          id: "q11",
          q: "Q11: Formal Hindi chatbot — RAG or fine-tuning?",
          a: "Both. Use fine-tuning to teach the model how to speak formal Hindi (behavior/tone alignment), and use RAG to retrieve the correct database information (factual grounding) to answer the query."
        },
        {
          id: "q12",
          q: "Q12: Can you use RAG and fine-tuning together?",
          a: "Absolutely. This is a common pattern: Fine-tune the model to understand domain jargon, formatting, or specific APIs, and then use RAG to feed it real-time factual documents so it never acts on outdated information."
        },
        {
          id: "q13",
          q: "Q13: RAG for real-time news (last 1 hour) — is it suitable?",
          a: "Yes, but you need a high-frequency stream-ingestion pipeline. New articles must be scraped, chunked, embedded, and added to the vector index in near-real-time (seconds/minutes) so the retriever can immediately fetch them."
        },
        {
          id: "q14",
          q: "Q14: RAG over 500 PDFs gives partially correct answers. What's wrong?",
          a: "Likely issues: (1) poor document layout parsing (tables/images read as gibberish), (2) chunk size too small, cutting facts in half, (3) weak embedding model failing to capture domain jargon, or (4) the LLM context length was exceeded."
        },
        {
          id: "q15",
          q: "Q15: RAG works in English but fails in Hindi. Why?",
          a: "Most embedding models are trained heavily on English corpora and have poorer vector alignment for low-resource languages like Hindi. Also, Hindi text requires more tokens (token inflation), which can truncate the retrieved context."
        }
      ]
      return (
        <div className="space-y-4">
          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {questions.map((item) => {
              const isExpanded = expandedQA[item.id]
              return (
                <div key={item.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden text-xs">
                  <button 
                    onClick={() => toggleQA(item.id)}
                    className="w-full px-4.5 py-3 flex justify-between items-center text-left hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-zinc-200">{item.q}</span>
                    <span className="text-brandPurple font-bold font-mono text-[10px] shrink-0 ml-3">
                      {isExpanded ? "Collapse ▴" : "Reveal Answer ▾"}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-zinc-850"
                      >
                        <div className="p-4 bg-zinc-950/60 text-zinc-300 leading-relaxed text-[11px] font-mono">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          <div className="border-t border-zinc-800 pt-4 flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
            <span className="text-zinc-500">Completed RAG Deep-Dive Session?</span>
            <button
              onClick={() => { completeSection(16); }}
              className="flex items-center gap-2 px-5 py-2 bg-brandGreen text-white text-xs font-semibold rounded-lg hover:bg-brandGreen/90 glow-green transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Mark Session Completed</span>
            </button>
          </div>
        </div>
      )
    }
  }
]

  const currentSlide = slides[activeSlide]

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-3">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">RAG Masterclass</h2>
          </div>

          {/* Slide Deck Index Selector */}
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Slide Selector:</span>
            <select
              value={activeSlide}
              onChange={(e) => setActiveSlide(parseInt(e.target.value))}
              className="bg-zinc-950 text-zinc-300 border border-zinc-800 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-brandPurple"
            >
              {slides.map((s, idx) => (
                <option key={idx} value={idx}>
                  Slide {idx + 1}: {s.title.substring(0, 24)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Presenter Notes */}
        <PresenterNotes 
          notes={currentSlide.notes}
          exercise="Navigate through the interactive widgets on this slide to demonstrate RAG principles directly to the PM workshop."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* LEFT SLIDE INDEX BAR */}
          {!isIndexCollapsed && (
            <div className="lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-xl p-3 max-h-[580px] overflow-y-auto space-y-1">
              <div className="flex justify-between items-center px-1 mb-2">
                <span className="text-[9px] uppercase font-mono text-zinc-500">Slides Index</span>
                <button 
                  onClick={() => setIsIndexCollapsed(true)} 
                  className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer" 
                  title="Collapse Index"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] transition-colors block cursor-pointer ${
                    activeSlide === idx 
                      ? 'bg-brandPurple text-white font-bold' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="truncate">{idx + 1}. {s.title}</div>
                </button>
              ))}
            </div>
          )}

          {/* MAIN SLIDE STAGE */}
          <div className={`${isIndexCollapsed ? 'lg:col-span-12' : 'lg:col-span-9'} bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[540px]`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-brandPurple/5 rounded-full blur-2xl pointer-events-none" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] uppercase font-mono bg-brandPurple/20 text-brandPurple font-bold px-2.5 py-0.5 rounded-full border border-brandPurple/30">
                      Slide {activeSlide + 1} of {slides.length}
                    </span>
                    {isIndexCollapsed && (
                      <button
                        onClick={() => setIsIndexCollapsed(false)}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 transition-colors text-[10px] font-semibold cursor-pointer"
                        title="Show Slides Index"
                      >
                        <ChevronRight className="w-3 h-3" />
                        <span>Show Index</span>
                      </button>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2.5">{currentSlide.title}</h3>
                  <p className="text-zinc-400 text-xs mt-0.5">{currentSlide.subtitle}</p>
                </div>

                <div className="py-2">
                  {currentSlide.render()}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide footer navigator */}
            <div className="border-t border-zinc-800/80 pt-4 mt-6 flex justify-between items-center text-xs">
              <button
                onClick={prevSlide}
                disabled={activeSlide === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex gap-1">
                {slides.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 h-1.5 rounded-full transition-colors ${idx === activeSlide ? 'bg-brandPurple w-3.5' : 'bg-zinc-800'}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                disabled={activeSlide === slides.length - 1}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <PMInsight 
          decision="RAG systems decouple the model logic from the truth dataset. You can swap document files or refresh vector indices in real-time, instantly updating what your AI product knows without retraining fees."
          impact="Zero retraining costs, easy data citation links, custom permission filtering, and drastically reduced hallucination rates for business applications."
        />
      </div>
    </div>
  )
}
