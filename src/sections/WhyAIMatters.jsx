import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Cpu, Settings, MessageSquare, Terminal, Play } from 'lucide-react'
import KarpathyInsight from '../components/KarpathyInsight'
import PMInsight from '../components/PMInsight'
import PresenterNotes from '../components/PresenterNotes'
import { useAppStore } from '../store/useAppStore'

const eras = [
  {
    id: 'rules',
    title: 'Rules-Based Software',
    era: 'Pre-2010s',
    icon: Settings,
    color: 'border-zinc-700 text-zinc-400 bg-zinc-900/40',
    howItWorked: 'Programmers wrote explicit, hardcoded logic (IF/THEN statements). If a scenario wasn\'t explicitly coded, the system couldn\'t handle it.',
    whatChanged: 'Deterministic outputs. Highly predictable, but completely unscalable for complex real-world variables like recognizing a face or translating languages.',
    exampleProducts: 'Microsoft Excel, Early tax software, simple database triggers.',
    impact: 'Software was a calculator. Very efficient for arithmetic, completely blind to context.'
  },
  {
    id: 'ml',
    title: 'Machine Learning',
    era: '2010 - 2015',
    icon: Cpu,
    color: 'border-blue-900/60 text-blue-400 bg-blue-950/10',
    howItWorked: 'Instead of writing code, engineers fed labeled datasets into algorithms. The computer learned the statistical correlations to predict values.',
    whatChanged: 'Instead of coding rules, we coded the framework to learn the rules. Required massive engineering feature design and structured data.',
    exampleProducts: 'Netflix Recommendations, early credit card fraud detection.',
    impact: 'Software became predictive. It could classify and rank, but couldn\'t understand structure or sequence.'
  },
  {
    id: 'dl',
    title: 'Deep Learning',
    era: '2015 - 2020',
    icon: Terminal,
    color: 'border-cyan-900/60 text-cyan-400 bg-cyan-950/10',
    howItWorked: 'Multi-layered neural networks (deep nets) extracted features automatically from raw, unstructured data (images, voice, text).',
    whatChanged: 'No more manual feature engineering. The models could recognize patterns in raw pixels or raw audio waves directly.',
    exampleProducts: 'Google Search rankbrain, Siri/Alexa voice transcription, self-driving vision systems.',
    impact: 'Software became perceptual. It could see and hear, but lacked reasoning or synthesis.'
  },
  {
    id: 'llm',
    title: 'Generative LLMs',
    era: '2020 - Present',
    icon: MessageSquare,
    color: 'border-brandPurple/60 text-brandPurple bg-brandPurple/10',
    howItWorked: 'Massive scale self-supervised pre-training on human text. Models learned structural semantic relationships across billions of parameters.',
    whatChanged: 'Emergent capabilities. The model gained reasoning, synthesis, in-context learning, and coding skills from language modeling.',
    exampleProducts: 'ChatGPT, Midjourney, Github Copilot.',
    impact: 'Software became generative & cognitive. It could synthesize knowledge, rewrite code, and reason.'
  },
  {
    id: 'agents',
    title: 'AI Agents',
    era: 'Emerging (2024+)',
    icon: SparklesIcon,
    color: 'border-brandGreen/60 text-brandGreen bg-brandGreen/10',
    howItWorked: 'LLMs wrapped in action loops with access to tools (browsers, terminals, file systems), memory databases, and autonomous planning.',
    whatChanged: 'From a chat interface to autonomous action. The AI doesn\'t just answer questions; it executes complete workflows on your behalf.',
    exampleProducts: 'Cursor, Devin, AutoGPT, Agentic workflows.',
    impact: 'Software is becoming active. It shifts from tool to assistant to autonomous coworker.'
  }
]

// Custom mini Sparkles icon since lucide-react might not have SparklesIcon
function SparklesIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z"/>
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/>
    </svg>
  )
}

export default function WhyAIMatters() {
  const [selectedEra, setSelectedEra] = useState('rules')
  const { completeSection } = useAppStore()

  const currentEra = eras.find(e => e.id === selectedEra)

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Why AI Matters</h2>
        <p className="text-zinc-400 text-lg mt-1">
          Why is this technology fundamentally different from previous software paradigms?
        </p>

        {/* Presenter Notes */}
        <PresenterNotes 
          notes="Start the workshop by highlighting that LLMs are not just 'better chatbots.' They represent a paradigm shift in computing. Traditional computing runs on explicit rules; AI computing runs on statistical patterns. PMs must transition from writing specifications to shaping behaviors."
          exercise="Ask the PMs: Name a feature in your current product that is built with 'Rules' (e.g. email validation) vs one that could be augmented by 'Agents' (e.g. automated onboarding triage)."
        />

        {/* Timeline Slider */}
        <div className="grid grid-cols-5 gap-3 mt-6">
          {eras.map((era) => {
            const Icon = era.icon
            const isSelected = selectedEra === era.id
            return (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'border-brandPurple bg-brandPurple text-white glow-purple ring-2 ring-brandPurple/30 scale-[1.02]' 
                    : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] uppercase tracking-widest mt-4 block font-mono ${isSelected ? 'text-white/80' : 'text-zinc-500'}`}>
                  {era.era}
                </span>
                <span className={`text-sm font-bold mt-1 block truncate w-full ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                  {era.title}
                </span>
              </button>
            )
          })}
        </div>

        {/* Details Card */}
        <div className="mt-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden min-h-[220px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brandPurple/5 rounded-full blur-3xl pointer-events-none" />
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedEra}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase bg-brandPurple/20 text-brandPurple font-mono font-bold px-3 py-1 rounded-full">
                  {currentEra.era} Paradigm
                </span>
                <h3 className="text-xl font-bold text-white">{currentEra.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="space-y-1">
                  <h4 className="text-xs text-zinc-500 uppercase font-semibold">How it Works</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed">{currentEra.howItWorked}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs text-zinc-500 uppercase font-semibold">The Core Shift</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed">{currentEra.whatChanged}</p>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4 flex justify-between items-center gap-4 text-sm">
                <div>
                  <span className="text-zinc-500 font-semibold uppercase text-xs mr-2">Example Products:</span>
                  <span className="text-brandCyan font-semibold">{currentEra.exampleProducts}</span>
                </div>
                <div className="text-zinc-400 italic text-xs">
                  {currentEra.impact}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <KarpathyInsight text="LLMs are not databases; they are next-token predictors. We have built an intelligence engine that understands structure and logic. The training is compression; intelligence emerges from prediction." />
        
        <PMInsight 
          decision="Natural language is becoming the universal API. PMs should stop designing rigid forms and click paths and start thinking about intent resolution and semantic inputs."
          impact="Interfaces will shrink. Products will shift from complex dashboards to conversational systems, semantic query inputs, and agentic task execution in the background."
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-4 flex justify-end">
        <button
          onClick={() => completeSection(1)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brandGreen text-white text-sm font-semibold rounded-lg hover:bg-brandGreen/90 glow-green transition-colors"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Mark Section Completed</span>
        </button>
      </div>
    </div>
  )
}
