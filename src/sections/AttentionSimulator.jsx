import React, { useState, useEffect } from 'react'
import { Eye, Info, Sparkles, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import PMInsight from '../components/PMInsight'
import PresenterNotes from '../components/PresenterNotes'
import { useAppStore } from '../store/useAppStore'
import SectionCompleteButton from '../components/SectionCompleteButton'

const sentenceData = {
  large: {
    words: ["A", "product", "manager", "builds", "the", "roadmap", "because", "it", "is", "essential."],
    attentionFromIt: {
      "roadmap": 85,
      "product": 5,
      "manager": 4,
      "essential.": 6
    },
    explanation: "Because it is 'essential', the model correctly associates the pronoun 'it' with the 'roadmap'. Roadmaps are essential artifacts in building products."
  },
  small: {
    words: ["A", "product", "manager", "builds", "the", "roadmap", "because", "she", "is", "capable."],
    attentionFromIt: {
      "manager": 80,
      "product": 10,
      "roadmap": 4,
      "capable.": 6
    },
    explanation: "Because she is 'capable', the model shifts its attention! The pronoun 'she' connects back to the subject 'manager' who drives the product creation."
  }
}

export default function AttentionSimulator() {
  const { completeSection } = useAppStore()

  // Tabs State
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('attention_active_tab') || 'guided')

  // Guided Mode State
  const [clause, setClause] = useState('large') // 'large' | 'small'
  const [hoveredWord, setHoveredWord] = useState(null)

  // Custom Mode State
  const [customSentence, setCustomSentence] = useState(() => localStorage.getItem('attention_custom_sentence') || 'The PM reviewed the PRD because it had crucial milestones.')

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem('attention_active_tab', activeTab)
  }, [activeTab])

  useEffect(() => {
    localStorage.setItem('attention_custom_sentence', customSentence)
  }, [customSentence])

  const currentData = sentenceData[clause]

  // Parse custom words
  const parsedCustomWords = customSentence.split(/\s+/).filter(w => w.length > 0)

  // Dynamic custom attention weights generator
  const getCustomAttentionWeights = (words, targetWord) => {
    if (!targetWord) return {}
    const cleanHovered = targetWord.toLowerCase().replace(/[.,'"]/g, "")
    const weights = {}
    
    // Heuristic: identify nouns
    const nouns = words.map(w => w.replace(/[.,'"]/g, "")).filter(w => {
      if (w.length === 0) return false
      if (w[0] === w[0].toUpperCase() && w !== words[0]) return true
      const commonNouns = ["pm", "prd", "roadmap", "milestone", "ticket", "user", "developer", "designer", "trophy", "suitcase", "dog", "cat", "capital", "france", "paris", "slogan", "milestones"]
      return commonNouns.includes(w.toLowerCase())
    })
    
    const cleanNouns = nouns.map(n => n.toLowerCase())
    const hoveredIdx = words.findIndex(w => w.replace(/[.,'"]/g, "") === targetWord)
    
    words.forEach((word, idx) => {
      const cleanWord = word.replace(/[.,'"]/g, "")
      let score = 0
      if (cleanWord === targetWord) {
        score = 50
      } else {
        const isConnector = ["it", "he", "she", "they", "because", "who", "which"].includes(cleanHovered)
        const isTargetNoun = cleanNouns.includes(cleanWord.toLowerCase())
        
        if (isConnector && isTargetNoun) {
          score = 30 / (1 + Math.abs(idx - hoveredIdx))
        } else {
          score = 10 / (1 + Math.abs(idx - hoveredIdx))
        }
      }
      weights[cleanWord] = score
    })

    const sum = Object.values(weights).reduce((a, b) => a + b, 0)
    const normalized = {}
    Object.entries(weights).forEach(([w, val]) => {
      normalized[w] = Math.round((val / (sum || 1)) * 100)
    })

    return normalized
  }

  // Get attention weight between current word and hovered word
  const getAttentionWeight = (targetWord) => {
    if (activeTab === 'guided') {
      if (hoveredWord === "it" || hoveredWord === "she") {
        return currentData.attentionFromIt[targetWord] || 0
      }
      if (hoveredWord === targetWord) return 100
      return 0
    } else {
      // Custom Tab attention weights
      if (!hoveredWord) return 0
      const weights = getCustomAttentionWeights(parsedCustomWords, hoveredWord)
      return weights[targetWord] || 0
    }
  }

  const activeWords = activeTab === 'guided' ? currentData.words : parsedCustomWords
  const activeAttentionMap = activeTab === 'guided' 
    ? (hoveredWord === "it" || hoveredWord === "she" ? currentData.attentionFromIt : {})
    : (hoveredWord ? getCustomAttentionWeights(parsedCustomWords, hoveredWord) : {})

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Attention Simulator</h2>
        <p className="text-zinc-400 text-lg mt-1">
          How does AI know what matters? The self-attention matrix in action.
        </p>

        <PresenterNotes 
          notes="Explain the concept of 'Self-Attention' (from the seminal 2017 paper 'Attention Is All You Need'). This solves the memory issue of RNNs. In a sentence, every word looks at every other word to update its contextual meaning. Toggling between 'large' and 'small' demonstrates how the embedding for the word 'it' changes based on the adjective at the end."
          exercise="Ask PMs: Hover over 'it' on both sentences. Point out how the thickest connection changes. Why is this hard for older software? It requires a deep world model (physics of boxes and trophies)."
        />

        {/* Concept Explanation Block */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 mt-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brandPurple/5 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-brandPurple bg-brandPurple/10 border border-brandPurple/20 px-2 py-0.5 rounded w-fit">
            Concept Explanation & Unified Example
          </h3>
          <p className="text-zinc-300 text-sm mt-3 leading-relaxed">
            <strong>Self-Attention:</strong> The breakthrough mechanism (introduced in the 2017 paper <em>"Attention Is All You Need"</em>) that allows models to process word dependencies in parallel. In any sentence, each word evaluates and "pays attention" to every other word to build its contextual meaning. This enables the model to resolve ambiguous pronouns (like linking "it" to "roadmap" or "she" to "manager").
          </p>
          <div className="mt-4 border-t border-zinc-800/80 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400">
              <strong>Unified Example:</strong> Compare how pronouns shift attention focus based on adjectives:
            </span>
            <span className="text-brandPurple font-mono font-semibold">
              "it" → roadmap (85%) | "she" → manager (80%)
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

        {activeTab === 'guided' ? (
          /* Clause selector */
          <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 w-fit mt-6">
            <button
              onClick={() => setClause('large')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                clause === 'large' ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              "...because it is essential."
            </button>
            <button
              onClick={() => setClause('small')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                clause === 'small' ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              "...because she is capable."
            </button>
          </div>
        ) : (
          /* Custom Sentence Input */
          <div className="mt-6 space-y-2">
            <label className="text-xs text-zinc-400 font-mono uppercase font-semibold block">Custom Sentence Input</label>
            <input
              type="text"
              value={customSentence}
              onChange={(e) => setCustomSentence(e.target.value)}
              placeholder="Enter a custom sentence..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brandPurple"
            />
          </div>
        )}

        {/* Visual Arena */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Attention Node Graph */}
          <div className="md:col-span-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                  Interactive Attention Links
                </span>
                <span className="text-[10px] text-brandCyan bg-brandCyan/10 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                  {activeTab === 'guided' ? 'Hover over the word "it" or "she"' : 'Hover over ANY word below'}
                </span>
              </div>

              {/* Sentences Node Row */}
              <div className="mt-8 flex flex-wrap gap-2.5 items-center justify-center p-6 bg-zinc-950 rounded-xl border border-zinc-850 relative min-h-[140px]">
                {activeWords.map((word, idx) => {
                  const cleanWord = word.replace(/[.,'"]/g, "")
                  const attentionVal = getAttentionWeight(cleanWord)
                  const isHovered = hoveredWord === cleanWord
                  const isIt = activeTab === 'guided' ? (cleanWord === 'it' || cleanWord === 'she') : isHovered
                  
                  return (
                    <div 
                      key={idx}
                      onMouseEnter={() => setHoveredWord(cleanWord)}
                      onMouseLeave={() => setHoveredWord(null)}
                      className={`relative px-3 py-2 rounded-lg border text-sm font-semibold cursor-pointer transition-all duration-200 ${
                        isIt 
                          ? 'bg-brandPurple border-brandPurple text-white scale-[1.05]'
                          : attentionVal > 20
                            ? 'bg-brandCyan/20 border-brandCyan/50 text-brandCyan scale-[1.03]'
                            : attentionVal > 0
                              ? 'bg-brandCyan/5 border-brandCyan/20 text-zinc-300'
                              : 'bg-zinc-900 border-zinc-805 text-zinc-400'
                      }`}
                    >
                      {word}

                      {/* Display Attention Weight % */}
                      {hoveredWord && attentionVal > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] bg-zinc-900 text-brandCyan border border-brandCyan/30 px-1 py-0.5 rounded font-mono font-bold">
                          {attentionVal}%
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="border-t border-zinc-850 pt-4 mt-6 text-xs text-zinc-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-brandPurple" />
              <span>
                {activeTab === 'guided' 
                  ? currentData.explanation 
                  : "Attention blocks process dependencies simultaneously. Hovering over a token exposes which neighboring elements the model focuses on to form its high-dimensional representation."
                }
              </span>
            </div>
          </div>

          {/* Attention Weights Breakdown */}
          <div className="md:col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                Attention Matrix Weights
              </span>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {hoveredWord ? (
                  Object.entries(activeAttentionMap).map(([word, weight]) => (
                    <div key={word} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-zinc-300">"{hoveredWord}" → "{word}"</span>
                        <span className="text-brandCyan font-mono">{weight}% weight</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-brandCyan h-full transition-all duration-300"
                          style={{ width: `${weight}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-zinc-500 italic">
                    Hover over a word to inspect weights.
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-850 pt-3 text-[10px] text-zinc-500 font-mono">
              Attention block: Multi-Head Self-Attention Layer 12
            </div>
          </div>
        </div>

        <PMInsight 
          concept="Self-Attention Mechanism"
          source="Jay Alammar, 'The Illustrated Transformer' (2018)"
          quote="Attention allows the model to focus on other words in the input sequence that help compile a better encoding for the word it is currently processing."
          takeaway="The quadratic cost of self-attention is the primary driver of context window limits. For PMs, this means longer conversations or uploaded documents exponentially increase latency and cost. Understanding newer architectures like FlashAttention or linear attention is vital for long-context products."
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-4 flex justify-end">
        <SectionCompleteButton sectionId={7} />
      </div>
    </div>
  )
}
