import React, { useState, useEffect } from 'react'
import { Sliders, Play, RotateCcw, ArrowRight, Sparkles, Binary, Check } from 'lucide-react'
import PMInsight from '../components/PMInsight'
import KarpathyInsight from '../components/KarpathyInsight'
import PresenterNotes from '../components/PresenterNotes'
import { useAppStore } from '../store/useAppStore'

const presetPrompts = {
  "What is product management?": [
    "Product", " manage", "ment", " is", " the", " pract", "ice", " of", " guid", "ing", " a", " product"
  ],
  "Explain machine learning simply.": [
    "Machine", " learning", " is", " teaching", " computers", " to", " learn", " from", " examples", " instead", " of", " code"
  ],
  "What does a product manager do?": [
    "A", " PM", " defines", " the", " product", " strategy", ",", " aligns", " teams", ",", " and", " ships", " value"
  ]
}

export default function ResponseGenerator() {
  const { completeSection } = useAppStore()

  // Generation Controls States
  const [temperature, setTemperature] = useState(0.7)
  const [topK, setTopK] = useState(50)
  const [topP, setTopP] = useState(0.9)
  const [maxTokens, setMaxTokens] = useState(12)

  // Prompt States
  const [currentPrompt, setCurrentPrompt] = useState("What is product management?")
  const [customPrompt, setCustomPrompt] = useState("")
  const [isCustomActive, setIsCustomActive] = useState(false)

  // Playback States
  const [generatedTokens, setGeneratedTokens] = useState([])
  const [activePass, setActivePass] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Heuristic token generator for custom prompts
  const getCustomTokens = (prompt) => {
    if (!prompt.trim()) return []
    
    // Generate a reasonable definition based on keyword search
    const clean = prompt.toLowerCase()
    let responseText = "Artificial intelligence processes patterns to generate human-like contextual outputs."
    
    if (clean.includes("product") || clean.includes("pm")) {
      responseText = "Product management drives the design, development, and launch of valuable features."
    } else if (clean.includes("code") || clean.includes("program")) {
      responseText = "Coding translates logic into instructions that software executes to solve problems."
    } else if (clean.includes("design") || clean.includes("ux")) {
      responseText = "User experience design focuses on making product interactions intuitive and useful."
    } else if (clean.includes("hello") || clean.includes("hi")) {
      responseText = "Hello! I am an assistant ready to help explain LLM response generation."
    }
    
    // Segment responseText into mock BPE subwords
    const rawWords = responseText.split(/\s+/)
    const tokensList = []
    rawWords.forEach((word) => {
      // Split words to look like subword tokenization
      if (word.length > 7) {
        const mid = Math.floor(word.length / 2)
        tokensList.push(word.substring(0, mid))
        tokensList.push(word.substring(mid))
      } else {
        tokensList.push(word)
      }
    })
    
    // Add spaces in front of tokens (except first one) to simulate real BPE tokens
    return tokensList.map((t, idx) => (idx > 0 ? " " : "") + t)
  }

  const activeTokensList = isCustomActive ? getCustomTokens(customPrompt) : (presetPrompts[currentPrompt] || [])

  // Auto-cap tokens list based on maxTokens slider
  const displayTokens = activeTokensList.slice(0, maxTokens)

  useEffect(() => {
    handleReset()
  }, [currentPrompt, customPrompt, isCustomActive, maxTokens])

  // Timer loop for Run All
  useEffect(() => {
    let timer = null
    if (isPlaying) {
      timer = setInterval(() => {
        setActivePass((prev) => {
          if (prev >= displayTokens.length) {
            setIsPlaying(false)
            return displayTokens.length
          }
          return prev + 1
        })
      }, 350)
    }
    return () => clearInterval(timer)
  }, [isPlaying, displayTokens])

  const handleNextPass = () => {
    if (activePass < displayTokens.length) {
      setActivePass(prev => prev + 1)
    }
  }

  const handleRunAll = () => {
    if (activePass >= displayTokens.length) {
      setActivePass(0)
    }
    setIsPlaying(true)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setActivePass(0)
  }

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Response Generator</h2>
        <p className="text-zinc-400 text-lg mt-1">
          How does an LLM compile its final answer? Trace response generation token-by-token.
        </p>

        <PresenterNotes 
          notes="Explain autoregressive generation: the model does not generate a response all at once. It predicts the very next token, appends it to the context window, and then feeds the whole expanded text back into itself to predict the subsequent token. Adjusting top-k and top-p limits the selection pool to guarantee context-appropriate phrasing."
          exercise="Select 'What is product management?'. Drag Temperature to 2.0 (chaotic) to show students how higher temperatures increase randomness. Click 'Next Pass' or 'Run All' and watch the text build up line-by-line."
        />

        {/* Input prompt selectors */}
        <div className="mt-6 space-y-4">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
            Select or Write a Prompt:
          </span>

          <div className="flex flex-wrap gap-2">
            {Object.keys(presetPrompts).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setIsCustomActive(false)
                  setCurrentPrompt(p)
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  !isCustomActive && currentPrompt === p
                    ? 'border-brandPurple bg-brandPurple text-white'
                    : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                "{p}"
              </button>
            ))}
            <button
              onClick={() => setIsCustomActive(true)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isCustomActive
                  ? 'border-brandPurple bg-brandPurple text-white'
                  : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Write Custom Prompt...
            </button>
          </div>

          {isCustomActive && (
            <div className="space-y-2 max-w-2xl">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Explain machine learning simply."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brandPurple"
              />
            </div>
          )}
        </div>

        {/* Generation Controls Sliders Grid */}
        <div className="mt-8">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block mb-4">
            Generation Controls
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Temperature Slider */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-zinc-300 font-mono">Temperature</span>
                  <span className="text-xs font-bold text-brandRed font-mono">{temperature.toFixed(2)}</span>
                </div>
                <span className="text-[10px] text-zinc-500 block mb-3">Creativity vs. Predictability</span>
              </div>
              
              <div className="space-y-2">
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-brandPurple cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                  <span>Lower = Focused</span>
                  <span>Higher = Creative</span>
                </div>
              </div>
            </div>

            {/* Top-k Slider */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-zinc-300 font-mono">Top-k</span>
                  <span className="text-xs font-bold text-brandCyan font-mono">{topK} tokens</span>
                </div>
                <span className="text-[10px] text-zinc-500 block mb-3">Limit candidate pool</span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                  className="w-full accent-brandCyan cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                  <span>Only consider top {topK} most probable tokens</span>
                </div>
              </div>
            </div>

            {/* Top-p Slider */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-zinc-300 font-mono">% Top-p (Nucleus)</span>
                  <span className="text-xs font-bold text-brandPurple font-mono">{Math.round(topP * 100)}%</span>
                </div>
                <span className="text-[10px] text-zinc-500 block mb-3">Cumulative probability cutoff</span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full accent-brandPurple cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                  <span>Consider tokens until cumulative probability reaches {Math.round(topP * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Max Tokens Slider */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-zinc-300 font-mono">Max Tokens</span>
                  <span className="text-xs font-bold text-brandGreen font-mono">{maxTokens} tokens</span>
                </div>
                <span className="text-[10px] text-zinc-500 block mb-3">Limit sequence length</span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min="5"
                  max="15"
                  step="1"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full accent-brandGreen cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                  <span>Stop generating after {maxTokens} tokens</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Interactive Response Generation Board */}
        <div className="mt-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brandPurple/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-850 pb-4 mb-5 gap-3">
            <div>
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">User asks:</span>
              <strong className="text-sm font-semibold text-zinc-200 block mt-0.5">
                "{isCustomActive ? (customPrompt || 'Custom Prompt') : currentPrompt}"
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              
              <button
                onClick={handleNextPass}
                disabled={activePass >= displayTokens.length || isPlaying}
                className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Next Pass</span>
              </button>

              <button
                onClick={handleRunAll}
                disabled={isPlaying || displayTokens.length === 0}
                className="px-4 py-1.5 bg-brandPurple text-white text-xs font-bold rounded-lg hover:bg-brandPurple/90 glow-purple transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>Run All</span>
              </button>
            </div>
          </div>

          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block mb-3">
            LLM Response Generation
          </span>

          {/* Pass Table */}
          <div className="overflow-x-auto w-full border border-zinc-850 rounded-xl bg-zinc-950">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-500 text-[10px] uppercase">
                  <th className="p-3 text-center w-16">Pass</th>
                  <th className="p-3">Generated Text</th>
                  <th className="p-3 text-right w-24">New Token</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {Array.from({ length: activePass }).map((_, passIdx) => {
                  const runningText = displayTokens.slice(0, passIdx + 1).join("")
                  const currentToken = displayTokens[passIdx]
                  const isLast = passIdx === activePass - 1
                  
                  return (
                    <tr key={passIdx} className={`hover:bg-zinc-900/40 transition-colors ${isLast ? 'bg-brandPurple/5' : ''}`}>
                      <td className="p-3 text-center">
                        <span className="w-5 h-5 rounded-full bg-brandPurple/10 text-brandPurple font-bold flex items-center justify-center mx-auto">
                          {passIdx + 1}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-200 font-semibold truncate max-w-lg">
                        {runningText}
                        {isLast && <span className="w-1.5 h-3.5 bg-brandPurple inline-block ml-0.5 animate-pulse" />}
                      </td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          isLast 
                            ? 'bg-brandPurple/20 border-brandPurple/30 text-brandPurple' 
                            : 'bg-zinc-900 border-zinc-850 text-zinc-400'
                        }`}>
                          {currentToken}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {activePass === 0 && (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-zinc-600 italic text-xs">
                      Click "Next Pass" or "Run All" to begin generating response...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Progress footer */}
          <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1">
            <span>Progress:</span>
            <span>{activePass} / {displayTokens.length} tokens generated</span>
          </div>
        </div>

        <KarpathyInsight text="LLMs are auto-regressive next-token generators. The output of pass N becomes part of the input context for pass N+1. This is why generation speed depends directly on output token count, not input prompt size." />

        <PMInsight 
          decision="Response generation is sequential. When designing user experiences, always stream the response chunk-by-chunk (using Server-Sent Events). Waiting for the full generation blocks the UI and increases perceived latency by 10x."
          impact="Set max_tokens caps defensively on model calls. A rogue generation loop can multiply your API costs and time out client sockets."
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-4 flex justify-end">
        <button
          onClick={() => completeSection(15)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brandGreen text-white text-sm font-semibold rounded-lg hover:bg-brandGreen/90 glow-green transition-colors cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Mark Section Completed</span>
        </button>
      </div>
    </div>
  )
}
