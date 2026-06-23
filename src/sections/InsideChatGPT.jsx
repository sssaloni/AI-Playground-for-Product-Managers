import React, { useState } from 'react'
import { Sparkles, ArrowRight, Binary, Database, Hash, Eye, Compass, Play } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PMInsight from '../components/PMInsight'
import PresenterNotes from '../components/PresenterNotes'
import { useAppStore } from '../store/useAppStore'
import SectionCompleteButton from '../components/SectionCompleteButton'

const pipelineSteps = [
  {
    id: 'input',
    title: '1. User Input Query',
    icon: Sparkles,
    color: 'border-blue-900/60 bg-blue-950/10 text-blue-400',
    description: "The user enters a conversational request, such as 'Verify Q3 roadmap timeline.'",
    details: "Inputs are unstructured natural language. The system must process this text, maintaining context and intents without hardcoded input filters."
  },
  {
    id: 'tokenizer',
    title: '2. Tokenizer splitting',
    icon: Hash,
    color: 'border-emerald-950/60 bg-emerald-950/10 text-emerald-400',
    description: "The input string is converted into numeric token IDs (e.g. 'Verify' -> #3598, 'Q3' -> #1042).",
    details: "BPE tokenizer translates English characters into integer IDs. Spaces, capitalization, emojis, and rare words undergo fragmentation into sub-word tokens."
  },
  {
    id: 'embeddings',
    title: '3. Vector Mapping',
    icon: Compass,
    color: 'border-cyan-900/60 bg-cyan-950/10 text-cyan-400',
    description: "Token IDs map to vectors (high-dimensional lists of numbers) representing semantic meaning.",
    details: "Each token is loaded as a vector inside a coordinate space. The coordinates capture semantic relationships (e.g. 'verify' projects near 'audit' or 'check')."
  },
  {
    id: 'attention',
    title: '4. Self-Attention',
    icon: Eye,
    color: 'border-brandPurple/60 bg-brandPurple/10 text-brandPurple',
    description: "Words interact with other words in the sequence to contextualize pronoun links and nouns.",
    details: "Self-attention matrices update the vector values by calculating dot products, ensuring words are understood relative to adjacent and distant descriptors."
  },
  {
    id: 'rag',
    title: '5. Database RAG Lookup',
    icon: Database,
    color: 'border-brandAmber/60 bg-brandAmber/10 text-brandAmber',
    description: "The embedded query searches the Vector Database for matching internal company context.",
    details: "The database matches vectors using Cosine distance, retrieving the most similar text chunks (e.g. Q3 roadmap PDF) and injecting them into the system prompt."
  },
  {
    id: 'generation',
    title: '6. Next-Token Generation',
    icon: Binary,
    color: 'border-brandGreen/60 bg-brandGreen/10 text-brandGreen',
    description: "The model runs a probability prediction loop, generating text token-by-token using temperature.",
    details: "Next-token prediction generates words based on combined weights. The softmax distribution gets modulated by temperature parameters before picking the output."
  }
]

export default function InsideChatGPT() {
  const [activeStep, setActiveStep] = useState('input')
  const { completeSection } = useAppStore()

  const currentStep = pipelineSteps.find(s => s.id === activeStep)

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Inside ChatGPT</h2>
        <p className="text-zinc-400 text-lg mt-1">
          The ultimate unified mental model. Trace the lifecycle of a prompt.
        </p>

        <PresenterNotes 
          notes="This is the final summary screen. Use it to synthesize everything taught in the workshop. Step through the blocks sequentially (Input -> Tokens -> Embeddings -> Attention -> RAG -> Generation). This single visualization is what the Product Managers will recall when designing AI features months from now."
          exercise="Ask the class: 'If we experience database latency in our Pinecone Vector DB, which step (1-6) gets slowed down?' (Step 5). 'If our prompt is too long, which step takes more computational budget?' (Step 2 & 3)."
        />

        {/* Pipeline Pipeline row */}
        <div className="mt-6 flex flex-col md:flex-row items-center gap-2.5 overflow-x-auto pb-4">
          {pipelineSteps.map((step, idx) => {
            const StepIcon = step.icon
            const isActive = activeStep === step.id
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setActiveStep(step.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                    isActive 
                      ? 'border-brandPurple bg-brandPurple text-white glow-purple ring-2 ring-brandPurple/20 scale-[1.02]' 
                      : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                    <StepIcon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold block truncate ${isActive ? 'text-white' : 'text-zinc-300'}`}>{step.title}</h4>
                  </div>
                </button>
                {idx < pipelineSteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-zinc-700 shrink-0 hidden md:block" />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Details card for active step */}
        <div className="mt-6 bg-zinc-900/60 border border-zinc-850 rounded-2xl p-6 relative overflow-hidden min-h-[200px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brandPurple/5 rounded-full blur-3xl pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full border ${currentStep.color}`}>
                  Pipeline Step
                </span>
                <h3 className="text-lg font-bold text-white">{currentStep.title}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-mono block">Action Description</span>
                  <p className="text-zinc-200 text-sm leading-relaxed font-semibold">{currentStep.description}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-mono block">Under the Hood</span>
                  <p className="text-zinc-400 text-xs leading-relaxed">{currentStep.details}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <PMInsight 
          concept="Transformer Architecture"
          source="Vaswani et al., 'Attention Is All You Need' (NeurIPS 2017)"
          quote="The Transformer allows for significantly more parallelization during training... replacing recurrent layers with multi-headed self-attention."
          takeaway="Knowing the hardware-software boundary is crucial. Transformers are compute-bound (FLOPs) during pre-training but memory-bandwidth bound (memory retrieval from GPU VRAM) during generation, which directly determines the unit economics (cost per million tokens) of your product."
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-4 flex justify-end">
        <SectionCompleteButton sectionId={14} />
      </div>
    </div>
  )
}
