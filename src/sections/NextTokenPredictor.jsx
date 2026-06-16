import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, ArrowRight, Binary } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import PMInsight from '../components/PMInsight'
import KarpathyInsight from '../components/KarpathyInsight'
import PresenterNotes from '../components/PresenterNotes'
import { useAppStore } from '../store/useAppStore'

const presetPrompts = {
  "The capital of France is": [
    { token: " Paris", prob: 92 },
    { token: " London", prob: 4 },
    { token: " Berlin", prob: 2 },
    { token: " Other", prob: 2 }
  ],
  "Where there's a will, there's a": [
    { token: " way", prob: 95 },
    { token: " lawyer", prob: 3 },
    { token: " chance", prob: 1 },
    { token: " solution", prob: 1 }
  ],
  "Once upon a time": [
    { token: " there", prob: 88 },
    { token: " a", prob: 8 },
    { token: " in", prob: 3 },
    { token: " upon", prob: 1 }
  ]
}

// Sequence generation mocks
const generationSequences = {
  "The capital of France is": [
    { text: "The capital of France is Paris", nextProbs: [{ token: ".", prob: 95 }, { token: " which", prob: 3 }, { token: " and", prob: 2 }] },
    { text: "The capital of France is Paris.", nextProbs: [{ token: " It", prob: 60 }, { token: " The", prob: 30 }, { token: " Located", prob: 10 }] },
    { text: "The capital of France is Paris. It", nextProbs: [{ token: " is", prob: 90 }, { token: " has", prob: 7 }, { token: " hosts", prob: 3 }] },
    { text: "The capital of France is Paris. It is", nextProbs: [{ token: " one", prob: 45 }, { token: " the", prob: 40 }, { token: " famous", prob: 15 }] }
  ],
  "Where there's a will, there's a": [
    { text: "Where there's a will, there's a way", nextProbs: [{ token: ".", prob: 98 }, { token: " to", prob: 1 }, { token: " and", prob: 1 }] },
    { text: "Where there's a will, there's a way.", nextProbs: [{ token: " This", prob: 80 }, { token: " It", prob: 15 }, { token: " Proverbs", prob: 5 }] },
    { text: "Where there's a will, there's a way. This", nextProbs: [{ token: " means", prob: 90 }, { token: " proverb", prob: 8 }, { token: " simple", prob: 2 }] },
    { text: "Where there's a will, there's a way. This means", nextProbs: [{ token: " that", prob: 95 }, { token: " humans", prob: 3 }, { token: " determination", prob: 2 }] }
  ],
  "Once upon a time": [
    { text: "Once upon a time there", nextProbs: [{ token: " was", prob: 95 }, { token: " lived", prob: 4 }, { token: " existed", prob: 1 }] },
    { text: "Once upon a time there was", nextProbs: [{ token: " a", prob: 90 }, { token: " an", prob: 8 }, { token: " some", prob: 2 }] },
    { text: "Once upon a time there was a", nextProbs: [{ token: " king", prob: 40 }, { token: " beautiful", prob: 30 }, { token: " little", prob: 20 }, { token: " princess", prob: 10 }] },
    { text: "Once upon a time there was a beautiful", nextProbs: [{ token: " princess", prob: 60 }, { token: " queen", prob: 20 }, { token: " castle", prob: 15 }, { token: " forest", prob: 5 }] }
  ]
}

export default function NextTokenPredictor() {
  const { completeSection } = useAppStore()

  // Tab State
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('next_token_active_tab') || 'guided')

  // Guided state
  const [selectedPrompt, setSelectedPrompt] = useState(Object.keys(presetPrompts)[0])
  const [currentText, setCurrentText] = useState(selectedPrompt)
  const [stepIndex, setStepIndex] = useState(-1)

  // Custom state
  const [customInput, setCustomInput] = useState(() => localStorage.getItem('next_token_custom_input') || '')
  const [customTextBuffer, setCustomTextBuffer] = useState(() => localStorage.getItem('next_token_custom_buffer') || '')
  const [customProbs, setCustomProbs] = useState([])

  // Save tab and custom input to localStorage
  useEffect(() => {
    localStorage.setItem('next_token_active_tab', activeTab)
  }, [activeTab])

  useEffect(() => {
    localStorage.setItem('next_token_custom_input', customInput)
  }, [customInput])

  useEffect(() => {
    localStorage.setItem('next_token_custom_buffer', customTextBuffer)
  }, [customTextBuffer])

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt)
    setCurrentText(prompt)
    setStepIndex(-1)
  }

  const handleNextStep = () => {
    const sequence = generationSequences[selectedPrompt]
    if (stepIndex < sequence.length - 1) {
      const nextStep = stepIndex + 1
      setStepIndex(nextStep)
      setCurrentText(sequence[nextStep].text)
    }
  }

  const handleReset = () => {
    setCurrentText(selectedPrompt)
    setStepIndex(-1)
  }

  // Get probability data for guided state
  const getCurrentProbs = () => {
    if (stepIndex === -1) {
      return presetPrompts[selectedPrompt]
    }
    const sequence = generationSequences[selectedPrompt]
    if (stepIndex < sequence.length) {
      return sequence[stepIndex].nextProbs
    }
    return []
  }

  // Dynamic Generator for Custom Input
  const generateDynamicNextTokens = (text) => {
    if (!text.trim()) return []
    const words = text.trim().split(/\s+/)
    const lastWord = words[words.length - 1].toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"")

    const wordDatabase = {
      "is": [
        { token: " a", prob: 45 },
        { token: " the", prob: 25 },
        { token: " not", prob: 15 },
        { token: " Paris", prob: 15 }
      ],
      "the": [
        { token: " model", prob: 35 },
        { token: " system", prob: 25 },
        { token: " users", prob: 20 },
        { token: " data", prob: 20 }
      ],
      "a": [
        { token: " product", prob: 30 },
        { token: " manager", prob: 25 },
        { token: " great", prob: 20 },
        { token: " solution", prob: 25 }
      ],
      "will": [
        { token: " be", prob: 50 },
        { token: " have", prob: 20 },
        { token: " run", prob: 15 },
        { token: " fail", prob: 15 }
      ],
      "time": [
        { token: " there", prob: 60 },
        { token: " to", prob: 20 },
        { token: " when", prob: 10 },
        { token: " has", prob: 10 }
      ]
    }

    if (wordDatabase[lastWord]) {
      return wordDatabase[lastWord]
    }

    // Heuristic fallback generator
    const length = lastWord.length || 5
    const seed = lastWord.charCodeAt(0) || 100
    const t1 = " " + (length % 2 === 0 ? "model" : "process")
    const t2 = " " + (seed % 3 === 0 ? "system" : "strategy")
    const t3 = " " + (length > 4 ? "leads" : "data")
    const t4 = " details"

    return [
      { token: t1, prob: 55 },
      { token: t2, prob: 25 },
      { token: t3, prob: 15 },
      { token: t4, prob: 5 }
    ]
  }

  // Update probabilities whenever custom text changes
  useEffect(() => {
    if (activeTab === 'custom') {
      const probs = generateDynamicNextTokens(customTextBuffer || customInput)
      setCustomProbs(probs)
    }
  }, [customTextBuffer, customInput, activeTab])

  const handleCustomPredict = () => {
    const currentProbsList = customProbs.length > 0 ? customProbs : generateDynamicNextTokens(customTextBuffer || customInput)
    if (currentProbsList.length > 0) {
      const bestToken = currentProbsList[0].token
      const newText = (customTextBuffer || customInput) + bestToken
      setCustomTextBuffer(newText)
    }
  }

  const handleCustomReset = () => {
    setCustomTextBuffer(customInput)
  }

  // Determine active parameters based on tab
  const activePromptString = activeTab === 'guided' ? selectedPrompt : customInput
  const textToShow = activeTab === 'guided' ? currentText : (customTextBuffer || customInput)
  const chartData = activeTab === 'guided' ? getCurrentProbs() : customProbs
  const isFinished = activeTab === 'guided' 
    ? (stepIndex >= (generationSequences[selectedPrompt]?.length || 1) - 1)
    : (!customInput.trim())

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Next Token Predictor</h2>
        <p className="text-zinc-400 text-lg mt-1">
          How does an LLM generate text? Step inside the core generation loop.
        </p>

        <PresenterNotes 
          notes="Explain the fundamental truth of LLMs: they have no concept of 'facts' or 'truth.' They are statistical autocomplete on steroids. By showing the probability distribution of words, help PMs understand that the LLM is picking the most mathematically likely next word. When it hallucinated, it didn't lie; it just picked a likely word that was factually incorrect."
          exercise="Select 'The capital of France is'. Show how Paris is 92%. Ask the classroom: 'What happens if we select London (4%)? It starts building a false narrative.' (e.g. 'The capital of France is London. This city...'). The model will keep generating based on the new context."
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
          /* Guided Example Layout selectors */
          <div className="flex flex-wrap gap-3 mt-6">
            {Object.keys(presetPrompts).map((prompt) => (
              <button
                key={prompt}
                onClick={() => handlePromptSelect(prompt)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-200 ${
                  selectedPrompt === prompt 
                    ? 'border-brandPurple bg-brandPurple text-white' 
                    : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                "{prompt}"
              </button>
            ))}
          </div>
        ) : (
          /* Custom Sentence Input */
          <div className="mt-6 space-y-3">
            <label className="text-xs text-zinc-400 font-mono uppercase font-semibold block">Custom Sentence Input</label>
            <input
              type="text"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value)
                setCustomTextBuffer(e.target.value)
              }}
              placeholder="Enter any partial sentence (e.g. 'To build a great product, you need...')"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brandPurple"
            />
          </div>
        )}

        {/* Visual Arena */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Generation console */}
          <div className="md:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[320px]">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
                <Binary className="w-4 h-4 text-brandPurple" />
                <span>Text Generation Buffer</span>
              </div>
              
              <div className="mt-4 bg-zinc-950 border border-zinc-800 p-5 rounded-xl min-h-[160px] font-mono text-lg text-white leading-relaxed flex flex-wrap gap-1 items-start content-start">
                {textToShow ? (
                  textToShow.split(' ').map((word, idx) => {
                    const presetLen = activePromptString.split(' ').length
                    const isGenerated = idx >= presetLen
                    return (
                      <motion.span 
                        key={idx}
                        initial={isGenerated ? { scale: 0.8, color: '#8b5cf6' } : {}}
                        animate={isGenerated ? { scale: 1, color: 'var(--text-main, #ffffff)' } : {}}
                        transition={{ duration: 0.3 }}
                        className={`${isGenerated ? 'text-brandPurple bg-brandPurple/5 border border-brandPurple/20 px-1 rounded' : ''}`}
                      >
                        {word}{' '}
                      </motion.span>
                    )
                  })
                ) : (
                  <span className="text-zinc-600 text-sm italic font-sans">Awaiting prompt text...</span>
                )}
                {textToShow.trim().length > 0 && (
                  <span className="w-2.5 h-6 bg-brandPurple animate-pulse ml-0.5 mt-0.5 block" />
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 border-t border-zinc-800 pt-4">
              {activeTab === 'guided' ? (
                <button
                  onClick={handleNextStep}
                  disabled={isFinished}
                  className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all ${
                    isFinished 
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                      : 'bg-brandPurple hover:bg-brandPurple/90 glow-purple'
                  }`}
                >
                  <span>Predict Next Token</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCustomPredict}
                  disabled={!customInput.trim()}
                  className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all ${
                    !customInput.trim()
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                      : 'bg-brandPurple hover:bg-brandPurple/90 glow-purple'
                  }`}
                >
                  <span>Predict Next Token</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={activeTab === 'guided' ? handleReset : handleCustomReset}
                className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl transition-colors"
                title="Reset generation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Probability graph */}
          <div className="md:col-span-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[320px]">
            <div>
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                Next Token Probability Output
              </span>
              
              <div className="mt-4 h-48 w-full">
                {chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={chartData} 
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
                    >
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis dataKey="token" type="category" stroke="#a1a1aa" fontSize={11} width={80} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                        labelStyle={{ color: '#a1a1aa' }}
                      />
                      <Bar dataKey="prob" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-600 text-xs italic">
                    Enter text to visualize probabilities
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-3 text-xs text-zinc-400 flex items-center justify-between">
              <span>Entropy State:</span>
              <span className="font-semibold text-brandCyan">Low (High Confidence)</span>
            </div>
          </div>
        </div>

        <KarpathyInsight text="LLMs are next-token predictors. They don't copy-paste facts; they learn a high-dimensional probability model of the internet and generate text one word at a time based on those weights." />

        <PMInsight 
          decision="Hallucinations are not bugs; they are the natural state of LLMs. When you build features requiring exact data matching (e.g., balance verification), do not let the LLM generate the values. Retrieve the data from a database and inject it as context."
          impact="Establish guardrails. Use structured output models or API tools to bypass natural text generation when factual accuracy is absolute."
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-4 flex justify-end">
        <button
          onClick={() => completeSection(3)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brandGreen text-white text-sm font-semibold rounded-lg hover:bg-brandGreen/90 glow-green transition-colors"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Mark Section Completed</span>
        </button>
      </div>
    </div>
  )
}
