import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Search, Cpu, MessageSquare, Play, HelpCircle, Code, Star } from 'lucide-react'
import PMInsight from '../components/PMInsight'
import PresenterNotes from '../components/PresenterNotes'
import { useAppStore } from '../store/useAppStore'
import SectionCompleteButton from '../components/SectionCompleteButton'

const methods = [
  {
    id: 'rules',
    name: 'Rules Engine',
    tech: 'If-Else / SQL',
    icon: Database,
    color: 'text-orange-400 bg-orange-950/20 border-orange-900/40',
    query: 'SELECT * FROM restaurants WHERE city = "Paris" AND rating >= 4.5 ORDER BY reviews DESC LIMIT 1;',
    result: {
      title: 'Restaurant #129 - Le Bistrot',
      rating: '4.8 stars',
      review: 'No review synthesis. Exact match on database fields.',
      meta: 'Hardcoded filter matching.'
    },
    codeSnippet: `if (user.location === "Paris" && rating > 4.5) {
  return showRestaurant();
} else {
  return showError();
}`,
    explanation: 'Very rigid. If a user asks for "cozy spot for a rainy day," this engine fails completely because "cozy" and "rainy" are not database columns.'
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    tech: 'Collaborative Filtering',
    icon: Cpu,
    color: 'text-blue-400 bg-blue-950/20 border-blue-900/40',
    query: 'MatrixFactorization(user_id, restaurant_features)',
    result: {
      title: 'Le Comptoir (92% Match)',
      rating: '4.6 stars',
      review: 'Recommended because users similar to you liked this spot.',
      meta: 'Statistical rating recommendation.'
    },
    codeSnippet: `def recommend(user_vector):
  scores = dot_product(user_vector, item_matrix)
  return top_k(scores)`,
    explanation: 'Predicts ratings based on historical correlation. Understands patterns of user behavior, but still cannot parse the text meaning of custom user prompts.'
  },
  {
    id: 'search',
    name: 'Search Engine',
    tech: 'TF-IDF / ElasticSearch',
    icon: Search,
    color: 'text-cyan-400 bg-cyan-950/20 border-cyan-900/40',
    query: 'query: "good restaurant Paris rating:4.5"',
    result: {
      title: 'Top 10 Bistros in Paris (Yelp)',
      rating: 'Multiple links',
      review: 'Lists webpages matching keywords. User has to click and read.',
      meta: 'Index lookup and rank.'
    },
    codeSnippet: `GET /restaurants/_search {
  "query": { "match": { "description": "good restaurant" } }
}`,
    explanation: 'Scans text indexes for exact keywords. Returns a list of documents, requiring the user to do the hard work of reading, comparing, and concluding.'
  },
  {
    id: 'llm',
    name: 'Large Language Model',
    tech: 'Generative Transformer',
    icon: MessageSquare,
    color: 'text-brandPurple bg-brandPurple/20 border-brandPurple/40 glow-purple',
    query: 'Prompt: "Find me a cozy restaurant in Paris with great wine."',
    result: {
      title: 'L\'Ami Jean in Paris',
      rating: '4.7 (Synthesized)',
      review: '"L\'Ami Jean is perfect. Its wooden beams create a cozy warmth, and reviewers rave about their deep-flavored Côte du Rhône selection. It feels like a lively tavern on a rainy evening."',
      meta: 'Generative semantic synthesis.'
    },
    codeSnippet: `model.generate(
  "Find me a cozy restaurant in..."
)`,
    explanation: 'Synthesizes information. Understands the semantic concept of "cozy" and "great wine", reviews millions of descriptions, and outputs a custom conversational answer explaining why it fits.'
  }
]

export default function EvolutionOfAI() {
  const [selectedMethod, setSelectedMethod] = useState('rules')
  const { completeSection } = useAppStore()

  const currentMethod = methods.find(m => m.id === selectedMethod)
  const Icon = currentMethod.icon

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Evolution of AI</h2>
        <p className="text-zinc-400 text-lg mt-1">
          Comparing how software handles user intentions across generations.
        </p>

        <PresenterNotes 
          notes="Use this screen to explain to PMs the difference between structured data retrieval (SQL/ML) and unstructured semantic synthesis (LLMs). The LLM is the first paradigm that can translate raw user sentiment into custom tailored content without predefined database constraints."
          exercise="Type a prompt like 'I am feeling sad, what is a comforting meal?' and explain why Rules and ML engines can't easily answer this, whereas an LLM responds to the emotion."
        />

        {/* Input prompt mock */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 font-mono text-sm">User Query:</span>
            <span className="text-zinc-100 font-medium text-base bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
              "Find me a good restaurant in Paris"
            </span>
          </div>
          <span className="text-brandCyan text-xs uppercase font-semibold animate-pulse">
            Processing...
          </span>
        </div>

        {/* Tech tabs */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {methods.map((method) => {
            const MethodIcon = method.icon
            const isSelected = selectedMethod === method.id
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'border-brandPurple bg-brandPurple text-white glow-purple ring-2 ring-brandPurple/20 scale-[1.02]' 
                    : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-mono font-bold ${isSelected ? 'text-white/80' : 'text-zinc-500'}`}>
                    {method.tech}
                  </span>
                  <MethodIcon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                </div>
                <h4 className={`text-sm font-bold mt-3 ${isSelected ? 'text-white' : 'text-zinc-200'}`}>{method.name}</h4>
              </button>
            )
          })}
        </div>

        {/* Animation & Explanation Arena */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visual Execution flow */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
                <Code className="w-3.5 h-3.5" />
                <span>Backend Execution Logic</span>
              </div>
              <pre className="mt-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 overflow-x-auto font-mono text-xs text-brandCyan leading-relaxed">
                {currentMethod.codeSnippet}
              </pre>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800">
              <span className="text-xs text-zinc-500 font-semibold uppercase">How it processes:</span>
              <p className="text-zinc-300 text-sm mt-1 leading-relaxed">{currentMethod.explanation}</p>
            </div>
          </div>

          {/* Results display */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
                <Star className="w-3.5 h-3.5 text-brandYellow" />
                <span>User Experience / Output</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedMethod}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4"
                >
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Returned Entity</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{currentMethod.result.title}</h3>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Rating Metric</span>
                    <p className="text-sm font-semibold text-brandCyan mt-0.5">{currentMethod.result.rating}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Details / Synthesis</span>
                    <p className="text-sm text-zinc-300 mt-1 leading-relaxed italic">
                      {currentMethod.result.review}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>Output type:</span>
              <span className="font-semibold text-brandPurple">{currentMethod.result.meta}</span>
            </div>
          </div>
        </div>

        <PMInsight 
          concept="System Complexity Shift"
          source="Chip Huyen, 'Designing Machine Learning Systems' (O'Reilly, 2022)"
          quote="System complexity is no longer about the rules written by developers, but about the data pipelines, continuous validation loops, and feedback systems that feed the learning models."
          takeaway="The shift from static predictions to agentic systems means PMs must plan for multi-agent loops and tool APIs. Success is defined by the quality of the execution environment (browsers, sandboxes) and error-recovery fallback systems."
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-4 flex justify-end">
        <SectionCompleteButton sectionId={2} />
      </div>
    </div>
  )
}
