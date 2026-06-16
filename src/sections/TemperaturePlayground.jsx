import React, { useState, useEffect } from 'react'
import { Sliders, RefreshCw, Play, ShieldAlert, Sparkles } from 'lucide-react'
import PMInsight from '../components/PMInsight'
import KarpathyInsight from '../components/KarpathyInsight'
import PresenterNotes from '../components/PresenterNotes'
import { useAppStore } from '../store/useAppStore'

const tempOutputs = {
  0: {
    description: "Low Temperature (T = 0.0) - Completely deterministic. The model always chooses the highest probability token. No variation.",
    idea: "A subscription-based SaaS platform that automates invoice reconciliation for mid-sized accounting firms. It integrates directly with QuickBooks and matches bank feeds to outstanding receipts, reducing manual entry by 80%.",
    reliability: 100,
    creativity: 5,
    tag: "Predictable / Boring"
  },
  0.3: {
    description: "Low-Med Temperature (T = 0.3) - High consistency with minimal variation. Useful for structured data outputs and APIs.",
    idea: "An automated billing platform designed specifically for freelance contractors. The system analyzes client communication to draft invoices, sets up automatic payment reminders, and predicts cash flow bottlenecks.",
    reliability: 90,
    creativity: 25,
    tag: "Structured Business"
  },
  0.7: {
    description: "Medium Temperature (T = 0.7) - Balance of consistency and creativity. Standard setting for general chat and blogging assistants.",
    idea: "An AI-powered interior design assistant. Users upload a photo of a room and a link to their Pinterest board; the tool generates a 3D shoppable render using furniture items that are currently in stock at local retail stores.",
    reliability: 65,
    creativity: 60,
    tag: "Balanced / Practical"
  },
  1.0: {
    description: "High Temperature (T = 1.0) - High variety and creative risk. Good for brainstorming, creative writing, and synonyms.",
    idea: "A virtual reality networking workspace where remote teams collaborate inside simulated historical eras. Conduct your stand-ups in a 1920s jazz club or write product requirements on a virtual scroll in ancient Rome.",
    reliability: 35,
    creativity: 85,
    tag: "Highly Creative"
  },
  1.5: {
    description: "Extreme Temperature (T = 1.5) - Wildly random. Often returns nonsensical concepts, grammar errors, or bizarre combinations.",
    idea: "A decentralized hyper-local tokenized delivery service that leases trained carrier pigeons to transport organic, blockchain-verified tea leaves to users living in remote architectural treehouses in Northern Iceland.",
    reliability: 5,
    creativity: 100,
    tag: "Chaotic / Hallucinating"
  }
}

export default function TemperaturePlayground() {
  const { completeSection } = useAppStore()

  // Tabs State
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('temp_active_tab') || 'guided')

  // Guided Mode State
  const [temperature, setTemperature] = useState(0.7)

  // Custom Mode State
  const [customPrompt, setCustomPrompt] = useState(() => localStorage.getItem('temp_custom_prompt') || 'Suggest a product marketing slogan for our new pet app.')

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem('temp_active_tab', activeTab)
  }, [activeTab])

  useEffect(() => {
    localStorage.setItem('temp_custom_prompt', customPrompt)
  }, [customPrompt])

  // Snap to closest key
  const tempKeys = [0, 0.3, 0.7, 1.0, 1.5]
  const getClosestTemp = (val) => {
    return tempKeys.reduce((prev, curr) => 
      Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
    )
  }

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value)
    setTemperature(getClosestTemp(val))
  }

  const generateResponseForTemp = (prompt, temp) => {
    if (!prompt || !prompt.trim()) return "Please enter a prompt above to generate output..."
    const p = prompt.trim()
    
    if (temp === 0.0) {
      return `[Deterministic Choice (T=0.0)]\nFor prompt: "${p}"\n\nOptimal logical path selection:\n1. Execute query matching on "${p}".\n2. Output standard structured analysis.\n3. Complete process execution. (Zero variance, highest probability tokens selected).`
    } else if (temp === 0.7) {
      return `[Balanced Path (T=0.7)]\nHere's a standard response for: "${p}"\n\nWe could approach this by designing a system that handles "${p}" in a modular way. This balances predictable features with a slight variety in language formatting, making it ideal for standard conversational assistants.`
    } else { // 1.5
      return `[Chaotic Softmax (T=1.5)]\nWhoa! "${p}" meets carrier-pigeon blockchain consensus! 🚀\n\nWe shall route "${p.split(' ').reverse().join(' ')}" through a hyper-localized treehouse network in Northern Iceland. Expected entropic outcome: 99.8% wild hallucination state! 🌌`
    }
  }

  const currentData = tempOutputs[temperature]

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Temperature Playground</h2>
        <p className="text-zinc-400 text-lg mt-1">
          Why does the same prompt yield different answers? Adjust the randomness filter.
        </p>

        <PresenterNotes 
          notes="Explain that Temperature alters the shape of the token probability distribution. At Temp=0, we perform 'greedy decoding' (always picking the top word). As temperature increases, the model flattens the distribution, giving lower-probability words a statistical chance of being chosen. Highlight that Temp > 1.2 is rarely useful in production."
          exercise="Ask a student to pick temperature 0 and generate a startup idea twice. Note that it will be EXACTLY the same. Then change it to 1.0 and show how it changes every time."
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
          /* Guided Layout */
          <>
            {/* Prompt Header */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-mono text-xs uppercase">Prompt:</span>
                  <span className="text-zinc-200 font-semibold">"Give me a startup idea."</span>
                </div>
                <span className="text-brandPurple text-xs uppercase font-mono bg-brandPurple/15 px-2 py-0.5 rounded font-bold">
                  {currentData.tag}
                </span>
              </div>
            </div>

            {/* Temperature slider container */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-bold text-sm">Set LLM Temperature: <span className="text-brandCyan font-mono">{temperature.toFixed(1)}</span></span>
                <div className="flex gap-4 text-xs font-mono text-zinc-500">
                  <span>0.0 (Deterministic)</span>
                  <span>1.5 (Creative Chaos)</span>
                </div>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.1"
                  value={temperature}
                  onChange={handleSliderChange}
                  className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brandPurple"
                />
                {/* Tick marks */}
                <div className="w-full flex justify-between text-[10px] text-zinc-600 px-1.5 font-mono pt-1">
                  <span>0.0</span>
                  <span>0.3</span>
                  <span>0.7</span>
                  <span>1.0</span>
                  <span>1.5</span>
                </div>
              </div>
            </div>

            {/* Content Box with Output */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Main generated text */}
              <div className="md:col-span-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 min-h-[260px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 uppercase font-mono">
                    <Sliders className="w-4 h-4 text-brandPurple" />
                    <span>Model Output Generation</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 italic leading-relaxed">
                    {currentData.description}
                  </p>
                  
                  <div className="mt-4 bg-zinc-950 p-5 rounded-xl border border-zinc-850 font-mono text-zinc-200 leading-relaxed text-sm min-h-[120px] glow-purple">
                    {currentData.idea}
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-3 text-[10px] text-zinc-500 font-mono">
                  Sampling algorithm: Top-P / Top-K / Temperature Softmax
                </div>
              </div>

              {/* Metric Meters */}
              <div className="md:col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-6">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                  Temperature Dynamics
                </span>

                {/* Reliability meter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-brandGreen" />
                      Reliability / Consistency
                    </span>
                    <span className="text-zinc-200">{currentData.reliability}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-brandGreen h-full transition-all duration-300"
                      style={{ width: `${currentData.reliability}%` }}
                    />
                  </div>
                </div>

                {/* Creativity meter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-brandPurple animate-pulse" />
                      Creativity / Variety
                    </span>
                    <span className="text-zinc-200">{currentData.creativity}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-brandPurple h-full transition-all duration-300 glow-purple"
                      style={{ width: `${currentData.creativity}%` }}
                    />
                  </div>
                </div>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/60 text-[11px] text-zinc-400 leading-relaxed">
                  <span className="text-brandCyan font-semibold uppercase tracking-wider block mb-1">PM GUIDELINE</span>
                  Use <span className="font-bold text-zinc-200">T=0</span> for SQL, JSON pipelines, code tasks. Use <span className="font-bold text-zinc-200">T=0.7</span> for chat assistance. Use <span className="font-bold text-zinc-200">T=1.0+</span> only for brainstorming names.
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Custom Layout (Side-by-side comparison) */
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-mono uppercase font-semibold block">Custom Prompt Input</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Type your prompt here..."
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brandPurple resize-none"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* T = 0.0 */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                    <span className="text-xs font-bold text-brandGreen">Deterministic</span>
                    <span className="text-[10px] font-mono bg-brandGreen/10 text-brandGreen px-2 py-0.5 rounded">T = 0.0</span>
                  </div>
                  <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {generateResponseForTemp(customPrompt, 0.0)}
                  </pre>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-4 pt-2 border-t border-zinc-850">
                  Reliability: 100% | Creativity: 5%
                </div>
              </div>

              {/* T = 0.7 */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                    <span className="text-xs font-bold text-brandCyan">Balanced / Standard</span>
                    <span className="text-[10px] font-mono bg-brandCyan/10 text-brandCyan px-2 py-0.5 rounded">T = 0.7</span>
                  </div>
                  <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {generateResponseForTemp(customPrompt, 0.7)}
                  </pre>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-4 pt-2 border-t border-zinc-850">
                  Reliability: 65% | Creativity: 60%
                </div>
              </div>

              {/* T = 1.5 */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                    <span className="text-xs font-bold text-brandPurple">Creative Chaos</span>
                    <span className="text-[10px] font-mono bg-brandPurple/10 text-brandPurple px-2 py-0.5 rounded">T = 1.5</span>
                  </div>
                  <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {generateResponseForTemp(customPrompt, 1.5)}
                  </pre>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-4 pt-2 border-t border-zinc-850">
                  Reliability: 5% | Creativity: 100%
                </div>
              </div>
            </div>
          </div>
        )}

        <KarpathyInsight text="Temperature simply scales the logits (raw logs of predictions) before they pass through the softmax layer. Dividing by a low number accentuates the peaks (making outputs highly predictable); dividing by a high number flattens the peaks (inducing random word choices)." />

        <PMInsight 
          decision="Temperature is a critical product decision. Never leave it at the model default without testing. High temperature creates delightful creative content but will break JSON schemas and structured outputs in production."
          impact="Reduce temperature to 0 when building API integrations, data parsing, or strict automation workflows. Set it between 0.5 and 0.8 for marketing copywriting or interactive chat features."
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-4 flex justify-end">
        <button
          onClick={() => completeSection(6)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brandGreen text-white text-sm font-semibold rounded-lg hover:bg-brandGreen/90 glow-green transition-colors"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Mark Section Completed</span>
        </button>
      </div>
    </div>
  )
}
