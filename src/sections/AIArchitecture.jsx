import React, { useState } from 'react'
import { Layers, ArrowDown, ArrowRight, Play, Server, Database, Settings, ShieldAlert, Cpu } from 'lucide-react'
import PMInsight from '../components/PMInsight'
import KarpathyInsight from '../components/KarpathyInsight'
import PresenterNotes from '../components/PresenterNotes'
import { useAppStore } from '../store/useAppStore'

const architectureNodes = [
  {
    id: 'frontend',
    name: '1. Frontend (UI)',
    tech: 'React / Next.js / Native',
    role: 'Captures user intentions. Renders streaming tokens, text blocks, and citations.',
    vendors: 'Vercel, Tailwind CSS, shadcn/ui',
    example: 'Cursor\'s chat pane or ChatGPT\'s side conversation list.'
  },
  {
    id: 'orchestration',
    name: '2. Prompt Orchestration',
    tech: 'LangChain / LlamaIndex / Python',
    role: 'Assembles context variables, controls routing logic, and structures JSON output constraints.',
    vendors: 'LangChain, LlamaIndex, Instructor',
    example: 'Cursor merging your file imports with systemic instructions into one payload.'
  },
  {
    id: 'rag',
    name: '3. Vector Database (RAG)',
    tech: 'Pinecone / pgvector / Qdrant',
    role: 'Index store for semantic chunks. Performs rapid distance search to return grounded context.',
    vendors: 'Pinecone, pgvector (PostgreSQL), Qdrant, Chroma',
    example: 'Perplexity searching index pages to answer recent questions.'
  },
  {
    id: 'llm',
    name: '4. Cognitive Engine (LLM)',
    tech: 'GPT-4o / Claude 3.5 / Llama 3',
    role: 'Core neural network weights. Receives prompt coordinate sequence and generates output.',
    vendors: 'OpenAI, Anthropic, Google Gemini, Groq (Hardware), Hugging Face',
    example: 'Claude 3.5 Sonnet processing code tasks inside Cursor.'
  },
  {
    id: 'tools',
    name: '5. Tool Execution (Agents)',
    tech: 'Function Calling / Python Runtime',
    role: 'Enables model to execute actions (calls database APIs, runs terminal commands, searches web).',
    vendors: 'OpenAI Functions, LangGraph, custom backend APIs',
    example: 'ChatGPT running Python code inside Advanced Data Analysis.'
  },
  {
    id: 'memory',
    name: '6. Memory & Session',
    tech: 'Redis / Postgres DB',
    role: 'Maintains dialogue history and personalization variables across chats.',
    vendors: 'Redis, Memgraph, standard SQL relational stores',
    example: 'ChatGPT\'s memory storing your preference for concise answers.'
  },
  {
    id: 'guardrails',
    name: '7. Guardrails & Safety',
    tech: 'Moderation APIs / LlamaGuard',
    role: 'Filters prompt injections, toxic entries, or inappropriate model generations.',
    vendors: 'LlamaGuard, NeMo Guardrails, OpenAI Moderation API',
    example: 'ChatGPT blocking requests to write malicious software code.'
  },
  {
    id: 'evals',
    name: '8. Evals & Monitoring',
    tech: 'LangSmith / Phoenix / Arize',
    role: 'Audits model performance, tracks token cost spikes, and monitors drift/hallucinations.',
    vendors: 'LangSmith, Phoenix (Arize), Braintrust',
    example: 'Continuous evaluation loops measuring prompt drift during releases.'
  }
]

export default function AIArchitecture() {
  const [selectedNode, setSelectedNode] = useState('frontend')
  const { completeSection } = useAppStore()

  const currentNode = architectureNodes.find(n => n.id === selectedNode)

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">AI Product Architecture</h2>
        <p className="text-zinc-400 text-lg mt-1">
          What components exist inside a production-grade AI system? Click layers to audit.
        </p>

        <PresenterNotes 
          notes="Use this slide to walk PMs through the system architecture. Most PMs assume building AI is just 'calling the OpenAI API.' Explain that a production app consists of at least 8 separate layers, and the actual LLM API is just the cognitive core. Standard software still governs memory, databases, and logging."
          exercise="Highlight 'Evals & Monitoring' (Step 8). Ask PMs: 'How do you run A/B tests on prompts?' Explain that you need automated evals since human testers can't review 100k generated chat logs."
        />

        {/* Modular flow map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Visual block flowchart */}
          <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 relative flex flex-col items-center justify-center gap-3 min-h-[380px]">
            <span className="text-[10px] text-zinc-500 uppercase font-mono absolute top-4 left-4">System Block Flow</span>

            {/* Block Layout columns */}
            <div className="flex flex-col items-center gap-2 w-full max-w-md mt-4">
              {/* Row 1: Frontend */}
              <button
                onClick={() => setSelectedNode('frontend')}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold font-mono transition-all ${
                  selectedNode === 'frontend' ? 'bg-brandPurple border-brandPurple text-white glow-purple' : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                Frontend (UI Web/Mobile)
              </button>

              <ArrowDown className="w-4 h-4 text-zinc-600" />

              {/* Row 2: Prompt / Guardrails */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setSelectedNode('orchestration')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold font-mono transition-all ${
                    selectedNode === 'orchestration' ? 'bg-brandPurple border-brandPurple text-white glow-purple' : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  Prompt Orchestration
                </button>
                <button
                  onClick={() => setSelectedNode('guardrails')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold font-mono transition-all ${
                    selectedNode === 'guardrails' ? 'bg-brandPurple border-brandPurple text-white glow-purple' : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  Safety Guardrails
                </button>
              </div>

              <ArrowDown className="w-4 h-4 text-zinc-600" />

              {/* Row 3: Vector DB & Memory */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setSelectedNode('rag')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold font-mono transition-all ${
                    selectedNode === 'rag' ? 'bg-brandPurple border-brandPurple text-white glow-purple' : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  Vector Index (RAG)
                </button>
                <button
                  onClick={() => setSelectedNode('memory')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold font-mono transition-all ${
                    selectedNode === 'memory' ? 'bg-brandPurple border-brandPurple text-white glow-purple' : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  Redis Session Memory
                </button>
              </div>

              <ArrowDown className="w-4 h-4 text-zinc-600" />

              {/* Row 4: LLM Model */}
              <button
                onClick={() => setSelectedNode('llm')}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold font-mono transition-all ${
                  selectedNode === 'llm' ? 'bg-brandPurple border-brandPurple text-white glow-purple' : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                Cognitive Core (LLM API / Cloud)
              </button>

              <ArrowDown className="w-4 h-4 text-zinc-600" />

              {/* Row 5: Agents & Evals */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setSelectedNode('tools')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold font-mono transition-all ${
                    selectedNode === 'tools' ? 'bg-brandPurple border-brandPurple text-white glow-purple' : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  Tool Exec (Agents)
                </button>
                <button
                  onClick={() => setSelectedNode('evals')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold font-mono transition-all ${
                    selectedNode === 'evals' ? 'bg-brandPurple border-brandPurple text-white glow-purple' : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  Evals & Logs
                </button>
              </div>
            </div>
          </div>

          {/* Layer description side box */}
          <div className="lg:col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                Component Breakdown
              </span>

              <div className="space-y-4">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                  <span className="text-[10px] text-brandCyan uppercase font-mono block">Selected Component</span>
                  <h3 className="text-lg font-bold text-white mt-1">{currentNode.name}</h3>
                  <span className="text-[10px] text-zinc-500 font-mono italic block mt-0.5">{currentNode.tech}</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-mono block">Functional Role</span>
                    <p className="text-zinc-300 text-xs leading-relaxed mt-0.5">{currentNode.role}</p>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-mono block">Market / Vendor Options</span>
                    <p className="text-brandPurple font-semibold text-xs mt-0.5">{currentNode.vendors}</p>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-mono block">Real Product Example</span>
                    <p className="text-brandCyan font-semibold text-xs mt-0.5">{currentNode.example}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-850 pt-3 text-[10px] text-zinc-500 font-mono">
              Arch type: Serverless API wrapper stack
            </div>
          </div>
        </div>

        <KarpathyInsight text="The prompt orchestrator is traditional Python/JavaScript code that connects the APIs. Don't write logic inside prompts when you can write logic in code. Prompts are for reasoning; code is for control loops." />

        <PMInsight 
          decision="Building AI products requires managing a distributed network of vendor APIs. Ensure your architecture has fallback logic for model endpoints (e.g. if Claude goes down, automatically route queries to GPT-4o) and monitors latency bottlenecks at the database layer."
          impact="Minimize vendor lock-in. Build your application using general model integrations so you can swap model providers as API pricing and context window speed improve."
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-4 flex justify-end">
        <button
          onClick={() => completeSection(12)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brandGreen text-white text-sm font-semibold rounded-lg hover:bg-brandGreen/90 glow-green transition-colors"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Mark Section Completed</span>
        </button>
      </div>
    </div>
  )
}
