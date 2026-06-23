import React, { useState, useEffect } from 'react'
import { Map, Info, Database, Play, ToggleLeft, ToggleRight, ArrowDown, Upload, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PMInsight from '../components/PMInsight'
import PresenterNotes from '../components/PresenterNotes'
import { useAppStore } from '../store/useAppStore'
import SectionCompleteButton from '../components/SectionCompleteButton'

const presetKnowledge = {
  roadmap: {
    title: "Q3 Roadmap Document (Internal)",
    text: "Q3 Project launch date is August 15th, 2026. The key milestone is the release of PetCare Subscription Tier. Budget allocation is $120k. Product Lead is Sarah Jenkins. Risk: Database migration latency spikes.",
    chunks: [
      { id: 1, content: "Q3 Project launch date is August 15th, 2026. The key milestone is the release of PetCare Subscription Tier.", score: 0.89 },
      { id: 2, content: "Budget allocation is $120k. Product Lead is Sarah Jenkins.", score: 0.72 },
      { id: 3, content: "Risk: Database migration latency spikes.", score: 0.45 }
    ]
  },
  policy: {
    title: "Refund Policy (v4.2)",
    text: "Customers can request a full refund within 14 days of purchase. Annual subscriptions are non-refundable after 30 days. Gift cards are completely non-refundable. Support email is refunds@startup.com.",
    chunks: [
      { id: 1, content: "Customers can request a full refund within 14 days of purchase.", score: 0.92 },
      { id: 2, content: "Annual subscriptions are non-refundable after 30 days.", score: 0.68 },
      { id: 3, content: "Gift cards are completely non-refundable. Support email is refunds@startup.com.", score: 0.51 }
    ]
  }
}

const queries = {
  roadmap: "When is the Q3 project launch and who leads it?",
  policy: "Can I get a refund on my annual subscription after 3 weeks?"
}

const answers = {
  roadmap: {
    withoutRag: "I am sorry, but I do not have access to your internal company roadmap documents in my training data. Please upload the document or input the details.",
    withRag: "Based on the retrieved Q3 Roadmap, the project is scheduled to launch on August 15th, 2026. Sarah Jenkins is the designated Product Lead."
  },
  policy: {
    withoutRag: "Usually, companies allow refunds within 14 to 30 days, but refund policies vary. I do not have access to your specific store's refund guidelines.",
    withRag: "Yes, you can request a refund. According to the refund policy, annual subscriptions remain refundable up to 30 days after purchase (you are at 21 days)."
  }
}

export default function RAGSimulator() {
  const { completeSection } = useAppStore()

  // Tabs State
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('rag_active_tab') || 'guided')

  // Guided Mode States
  const [docType, setDocType] = useState('roadmap') // 'roadmap' | 'policy'
  const [useRag, setUseRag] = useState(true)
  const [pipelineStep, setPipelineStep] = useState(0) // 0: Idle, 1-4: Simulation Steps

  // Custom Mode States
  const [customDocText, setCustomDocText] = useState(() => localStorage.getItem('rag_custom_doc_text') || 'Q4 security compliance audit is scheduled for October 12th, 2026. The technical lead is David Miller. Budget cap is $250k. Risk: firewall configurations.')
  const [customQuestion, setCustomQuestion] = useState(() => localStorage.getItem('rag_custom_question') || 'Who is the lead for the Q4 compliance audit?')
  const [customFileName, setCustomFileName] = useState(() => localStorage.getItem('rag_custom_file_name') || '')
  const [customUseRag, setCustomUseRag] = useState(true)
  const [customPipelineStep, setCustomPipelineStep] = useState(0)

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem('rag_active_tab', activeTab)
  }, [activeTab])

  useEffect(() => {
    localStorage.setItem('rag_custom_doc_text', customDocText)
  }, [customDocText])

  useEffect(() => {
    localStorage.setItem('rag_custom_question', customQuestion)
  }, [customQuestion])

  useEffect(() => {
    localStorage.setItem('rag_custom_file_name', customFileName)
  }, [customFileName])

  const currentDoc = presetKnowledge[docType]
  const currentQuery = queries[docType]
  const currentAnswer = useRag ? answers[docType].withRag : answers[docType].withoutRag

  const triggerSimulation = () => {
    if (activeTab === 'guided') {
      setPipelineStep(1)
      setTimeout(() => setPipelineStep(2), 1200)
      setTimeout(() => setPipelineStep(3), 2400)
      setTimeout(() => setPipelineStep(4), 3600)
    } else {
      setCustomPipelineStep(1)
      setTimeout(() => setCustomPipelineStep(2), 1200)
      setTimeout(() => setCustomPipelineStep(3), 2400)
      setTimeout(() => setCustomPipelineStep(4), 3600)
    }
  }

  const resetPipeline = () => {
    setPipelineStep(0)
    setCustomPipelineStep(0)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCustomFileName(file.name)
    resetPipeline()
    if (file.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCustomDocText(event.target.result)
      }
      reader.readAsText(file)
    } else {
      // PDF/DOCX mock
      setCustomDocText(`[Extracted from ${file.name} - Size: ${Math.round(file.size / 1024)} KB]\nThis document outlines security compliance guidelines and deployment milestones. The audit date is set for October 12th, 2026. The technical lead is David Miller. Budget cap is $250k. Risk: firewall configurations.`)
    }
  }

  // Calculate similarity based on word overlap (Jaccard variant)
  const calculateSimilarity = (query, chunkText) => {
    const qWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 3)
    if (qWords.length === 0) return 0.15
    const cWords = chunkText.toLowerCase().split(/\W+/)
    let matches = 0
    qWords.forEach(qw => {
      if (cWords.includes(qw)) matches++
    })
    const overlapRatio = matches / qWords.length
    return parseFloat((0.2 + overlapRatio * 0.75).toFixed(2))
  }

  // Segment custom text into chunks
  const getCustomChunks = () => {
    if (!customDocText.trim()) return []
    // Split by sentence
    const sentences = customDocText.match(/[^.!?]+[.!?]+/g) || [customDocText]
    return sentences
      .map((sentence, idx) => {
        const text = sentence.trim()
        const score = calculateSimilarity(customQuestion, text)
        return { id: idx + 1, content: text, score }
      })
      .filter(c => c.content.length > 6)
      .sort((a, b) => b.score - a.score)
  }

  const customChunks = getCustomChunks()
  const customTopChunks = customChunks.filter(c => c.score > 0.35).slice(0, 2)

  // Assembled Custom Prompt
  const customAssembledPrompt = `System Context:\nYou are a helpful product assistant. Use the following retrieved document chunks to answer the user's question. If the answer cannot be found in the context, explain that clearly.\n\nRetrieved Chunks:\n${customTopChunks.map(c => `[Chunk #${c.id}]: ${c.content}`).join('\n')}\n\nUser Question:\n${customQuestion}`

  // Synthesize Custom Answer
  const generateCustomAnswer = () => {
    if (!customUseRag) {
      return `I am sorry, but I do not have access to your internal document "${customFileName || 'custom upload'}" in my parametric training data. Please enable RAG to retrieve the correct context.`
    }
    if (customTopChunks.length === 0) {
      return "I cannot find any relevant information in the uploaded document to answer your question."
    }
    // Simple synthesis
    const synthesis = customTopChunks.map(c => c.content).join(' ')
    return `According to the retrieved document: ${synthesis}`
  }

  const activePipelineStep = activeTab === 'guided' ? pipelineStep : customPipelineStep
  const activeUseRag = activeTab === 'guided' ? useRag : customUseRag
  const activeQuery = activeTab === 'guided' ? currentQuery : customQuestion
  const activeAnswer = activeTab === 'guided' ? currentAnswer : generateCustomAnswer()

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">RAG Simulator</h2>
        <p className="text-zinc-400 text-lg mt-1">
          How do we give AI knowledge it never learned? Connecting external databases.
        </p>

        <PresenterNotes 
          notes="RAG is the most important concept in modern AI application design. Explain the difference between parametric memory (weights learned during training) and non-parametric memory (retrieved document chunks). Compare RAG to an open-book exam: the model doesn't need to memorize, it just reads the provided cheat sheet."
          exercise="Toggle 'Without RAG' and press play. Note the generic fallback answer. Then toggle 'With RAG' and show the retrieval process. Highlight the similarity score: only high-scoring chunks are injected."
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

        {activeTab === 'guided' ? (
          /* Configurations (Guided) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Document selection */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">Step 1: Select Knowledge Source</span>
              <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-850 mt-2">
                <button
                  onClick={() => { setDocType('roadmap'); resetPipeline(); }}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold ${docType === 'roadmap' ? 'bg-brandPurple text-white' : 'text-zinc-400'}`}
                >
                  Q3 Internal Roadmap
                </button>
                <button
                  onClick={() => { setDocType('policy'); resetPipeline(); }}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold ${docType === 'policy' ? 'bg-brandPurple text-white' : 'text-zinc-400'}`}
                >
                  Store Refund Policy
                </button>
              </div>
              <div className="mt-3 text-xs bg-zinc-950 p-2.5 rounded border border-zinc-850 text-zinc-400 italic">
                "{currentDoc.text}"
              </div>
            </div>

            {/* RAG Toggle & Simulation Controls */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-mono block">Step 2: Toggle RAG Pipeline</span>
                <div className="flex items-center justify-between mt-2.5 bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                  <span className="text-xs font-bold text-zinc-300">RAG Vector Retrieval</span>
                  <button onClick={() => { setUseRag(!useRag); resetPipeline(); }}>
                    {useRag ? (
                      <ToggleRight className="w-9 h-9 text-brandGreen" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-zinc-600" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={triggerSimulation}
                className="w-full mt-4 py-2.5 bg-brandPurple text-white text-xs font-bold rounded-lg hover:bg-brandPurple/90 glow-purple transition-all"
              >
                Run Pipeline Simulation
              </button>
            </div>
          </div>
        ) : (
          /* Configurations (Custom) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            {/* Custom file & text details */}
            <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Custom Document Source</span>
              
              {/* File Uploader */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-4 text-center flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-950/20">
                  <input
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-5 h-5 text-zinc-500 mb-1.5" />
                  <span className="text-[11px] font-bold text-zinc-300">Select PDF/TXT/DOCX</span>
                  <span className="text-[9px] text-zinc-500 mt-0.5">Drag & drop to parse</span>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex flex-col justify-center">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Status</span>
                  {customFileName ? (
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-brandGreen font-semibold">
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="truncate">{customFileName}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 mt-1.5 italic">No custom file uploaded (pasted input active).</span>
                  )}
                </div>
              </div>

              {/* Paste Text Area */}
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300 font-bold block">Or Paste Document Content</label>
                <textarea
                  value={customDocText}
                  onChange={(e) => { setCustomDocText(e.target.value); resetPipeline(); }}
                  rows={4}
                  placeholder="Paste context guidelines here..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brandPurple resize-none"
                />
              </div>

              {/* Custom question input */}
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300 font-bold block">Custom Question Input</label>
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => { setCustomQuestion(e.target.value); resetPipeline(); }}
                  placeholder="Ask a question about the document above..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-brandPurple"
                />
              </div>
            </div>

            {/* Pipeline toggles & execute */}
            <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Pipeline Control</span>
                
                <div className="flex items-center justify-between mt-4 bg-zinc-950 p-3.5 rounded-xl border border-zinc-850">
                  <span className="text-xs font-bold text-zinc-300">RAG Vector Retrieval</span>
                  <button onClick={() => { setCustomUseRag(!customUseRag); resetPipeline(); }}>
                    {customUseRag ? (
                      <ToggleRight className="w-9 h-9 text-brandGreen" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-zinc-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 mt-6 lg:mt-0">
                <button
                  onClick={triggerSimulation}
                  disabled={!customDocText.trim() || !customQuestion.trim()}
                  className="w-full py-3 bg-brandPurple text-white text-xs font-bold rounded-xl hover:bg-brandPurple/90 glow-purple transition-all disabled:bg-zinc-800 disabled:text-zinc-600"
                >
                  Run Custom Pipeline
                </button>
                
                <button
                  onClick={resetPipeline}
                  className="w-full py-2 bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 text-xs font-bold rounded-xl transition-colors"
                >
                  Reset Output
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pipeline Map */}
        {activePipelineStep > 0 && (
          <div className="mt-6 bg-zinc-900/40 border border-zinc-805 rounded-2xl p-5 space-y-4">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
              Live RAG Flow Execution
            </span>

            {/* Pipeline Steps Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs font-mono">
              <div className={`p-3 rounded-xl border transition-all ${activePipelineStep >= 1 ? 'border-brandPurple bg-brandPurple/5 text-white' : 'border-zinc-800 text-zinc-500'}`}>
                <div className="font-bold">1. Query</div>
                <div className="text-[10px] opacity-75 mt-1 truncate">"{activeQuery}"</div>
              </div>

              <div className={`p-3 rounded-xl border transition-all ${activePipelineStep >= 2 ? 'border-brandCyan bg-brandCyan/5 text-white' : 'border-zinc-800 text-zinc-500'}`}>
                <div className="font-bold">2. Embed Query</div>
                <div className="text-[10px] opacity-75 mt-1">Convert text to vector</div>
              </div>

              <div className={`p-3 rounded-xl border transition-all ${activePipelineStep >= 3 ? 'border-brandAmber bg-brandAmber/5 text-white' : 'border-zinc-800 text-zinc-500'}`}>
                <div className="font-bold">3. Retrieve Chunks</div>
                <div className="text-[10px] opacity-75 mt-1">Vector DB lookup</div>
              </div>

              <div className={`p-3 rounded-xl border transition-all ${activePipelineStep >= 3 ? 'border-brandPurple bg-brandPurple/5 text-white' : 'border-zinc-800 text-zinc-500'}`}>
                <div className="font-bold">4. Augment Prompt</div>
                <div className="text-[10px] opacity-75 mt-1">Inject facts</div>
              </div>

              <div className={`p-3 rounded-xl border transition-all ${activePipelineStep >= 4 ? 'border-brandGreen bg-brandGreen/5 text-white' : 'border-zinc-800 text-zinc-500'}`}>
                <div className="font-bold">5. LLM Answer</div>
                <div className="text-[10px] opacity-75 mt-1">Grounded output</div>
              </div>
            </div>

            {/* Step-by-step Visual Arena */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800/80">
              {/* Retrievals visualization (only if activeUseRag is true) */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 min-h-[220px] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Context Retrieval Database Results</span>
                  {activeUseRag ? (
                    activeTab === 'guided' ? (
                      <div className="space-y-2 mt-2">
                        {currentDoc.chunks.map((c) => (
                          <div key={c.id} className={`p-2 rounded border text-[11px] ${c.score > 0.7 ? 'border-brandGreen/30 bg-brandGreen/5 text-zinc-200' : 'border-zinc-800 text-zinc-500'}`}>
                            <div className="flex justify-between font-mono text-[9px] mb-1">
                              <span>Chunk #{c.id}</span>
                              <span className={c.score > 0.7 ? 'text-brandGreen' : ''}>Similarity: {c.score}</span>
                            </div>
                            <p>{c.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 mt-2 max-h-[160px] overflow-y-auto pr-1">
                        {customChunks.map((c) => (
                          <div key={c.id} className={`p-2 rounded border text-[11px] ${c.score > 0.35 ? 'border-brandGreen/30 bg-brandGreen/5 text-zinc-200' : 'border-zinc-800 text-zinc-500'}`}>
                            <div className="flex justify-between font-mono text-[9px] mb-1">
                              <span>Chunk #{c.id}</span>
                              <span className={c.score > 0.35 ? 'text-brandGreen' : ''}>Similarity Score: {c.score}</span>
                            </div>
                            <p>{c.content}</p>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="text-zinc-600 text-xs py-12 text-center font-mono">
                      [RAG is OFF] - Vector Database search is bypassed. No chunks retrieved.
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-3">
                  Vector index: HNSW Cosine distance
                </div>
              </div>

              {/* LLM Final Response */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 min-h-[220px] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Model Answer Generation</span>
                  <AnimatePresence mode="wait">
                    {activePipelineStep >= 4 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-xs font-mono text-white leading-relaxed bg-zinc-900/50 p-3.5 rounded border border-zinc-800 glow-purple whitespace-pre-wrap"
                      >
                        {activeAnswer}
                      </motion.div>
                    ) : (
                      <div className="text-zinc-600 text-xs py-12 text-center font-mono animate-pulse">
                        [Awaiting simulation execution...]
                      </div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-3">
                  Model: gpt-4o-mini
                </div>
              </div>
            </div>

            {/* Assembled prompt visualization (only in custom mode tab) */}
            {activeTab === 'custom' && activePipelineStep >= 3 && (
              <div className="mt-4 pt-4 border-t border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block mb-1.5">Live Compiled LLM Prompt</span>
                <pre className="bg-zinc-950 p-4 rounded-xl border border-zinc-855 text-[10px] font-mono text-zinc-400 overflow-y-auto max-h-[140px] whitespace-pre-wrap leading-relaxed">
                  {customAssembledPrompt}
                </pre>
              </div>
            )}
          </div>
        )}

        <PMInsight 
          concept="Parametric vs Non-Parametric Memory"
          source="Lewis et al., 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks' (NeurIPS 2020)"
          quote="RAG combines pre-trained parametric memory with non-parametric external memory. It allows the model to access external document stores to generate grounded, factually correct responses."
          takeaway="RAG is the most cost-effective way to ground a model. Unlike fine-tuning which edits weights (the model's 'skills'), RAG provides context (the model's 'textbook'). PMs should use RAG when documents update hourly, require strict source citations, or must respect user access permissions."
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-4 flex justify-end">
        <SectionCompleteButton sectionId={10} />
      </div>
    </div>
  )
}
