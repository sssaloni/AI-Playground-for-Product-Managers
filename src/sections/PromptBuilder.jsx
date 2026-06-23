import React, { useState, useEffect } from 'react'
import { Hammer, Sparkles, AlertCircle, Copy, Check, Play, Info } from 'lucide-react'
import PMInsight from '../components/PMInsight'
import PresenterNotes from '../components/PresenterNotes'
import { useAppStore } from '../store/useAppStore'

const frameworks = {
  crispe: {
    name: "CRISPE Framework",
    fields: [
      { key: "context", label: "Context", placeholder: "What is the background? (e.g. We are launching a new food delivery app for pets)" },
      { key: "role", label: "Role / Persona", placeholder: "Who is the AI acting as? (e.g. Senior Product Manager with fintech experience)" },
      { key: "instruction", label: "Instruction / Task", placeholder: "What exactly do you want the AI to do? (e.g. Write a product specs document)" },
      { key: "schema", label: "Schema / Format", placeholder: "How should the output look? (e.g. JSON format with 'feature', 'priority' keys)" },
      { key: "persona", label: "Persona / Tone", placeholder: "What tone should it write in? (e.g. Objective, highly professional, direct)" },
      { key: "evaluation", label: "Evaluation Criteria", placeholder: "How should the AI evaluate its output? (e.g. Ensure no fluff and focus on technical feasibility)" }
    ]
  },
  prep: {
    name: "PREP Framework",
    fields: [
      { key: "position", label: "Position", placeholder: "Define the persona or role (e.g. Act as a UX Researcher)" },
      { key: "request", label: "Request", placeholder: "The specific task to complete (e.g. Create a user interview script)" },
      { key: "explanation", label: "Explanation", placeholder: "Provide necessary background details (e.g. We are testing a new dark mode setting)" },
      { key: "purpose", label: "Purpose", placeholder: "What is the end goal? (e.g. To identify readability issues on mobile screens)" }
    ]
  }
}

const presets = {
  crispe: {
    context: "We are launching a premium subscription Tier for a fitness application.",
    role: "Senior Growth Product Manager",
    instruction: "Write 3 copy variations for a paywall header to increase conversion rate by 15%.",
    schema: "Bullet points detailing header, subheader, and growth hypotheses.",
    persona: "Persuasive and energetic, yet professional.",
    evaluation: "Make sure variations target busy professionals and fit within 60 characters."
  },
  prep: {
    position: "Act as a Lead Data Analyst.",
    request: "Generate a SQL query to calculate 30-day user retention rate.",
    explanation: "We define retention as a user who performs at least 1 action in the app 30 days after signup.",
    purpose: "To present retention trends to investors in our Q3 deck."
  }
}

export default function PromptBuilder() {
  const { completeSection } = useAppStore()

  // Tabs State
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('prompt_builder_active_tab') || 'guided')

  // Guided Mode States
  const [activeFramework, setActiveFramework] = useState('crispe')
  const [form, setForm] = useState(presets.crispe)
  const [isCopied, setIsCopied] = useState(false)

  // Custom Mode States
  const [customPrompt, setCustomPrompt] = useState(() => localStorage.getItem('prompt_builder_custom_prompt') || 'Write a product spec for onboarding.')
  const [customIsCopied, setCustomIsCopied] = useState(false)

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem('prompt_builder_active_tab', activeTab)
  }, [activeTab])

  useEffect(() => {
    localStorage.setItem('prompt_builder_custom_prompt', customPrompt)
  }, [customPrompt])

  useEffect(() => {
    if (activeTab === 'guided') {
      setForm(presets[activeFramework])
    }
  }, [activeFramework, activeTab])

  const handleInputChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }))
  }

  // Calculate quality score based on number of filled fields (Guided)
  const fields = frameworks[activeFramework].fields
  const filledCount = fields.filter(f => form[f.key] && form[f.key].trim().length > 10).length
  const score = Math.round((filledCount / fields.length) * 100)

  // Construct prompt (Guided)
  const getCompiledPrompt = () => {
    if (activeFramework === 'crispe') {
      return `[CONTEXT]\n${form.context || ''}\n\n[ROLE]\n${form.role || ''}\n\n[INSTRUCTION]\n${form.instruction || ''}\n\n[SCHEMA/FORMAT]\n${form.schema || ''}\n\n[PERSONA/TONE]\n${form.persona || ''}\n\n[EVALUATION]\n${form.evaluation || ''}`
    } else {
      return `[POSITION]\n${form.position || ''}\n\n[REQUEST]\n${form.request || ''}\n\n[EXPLANATION]\n${form.explanation || ''}\n\n[PURPOSE]\n${form.purpose || ''}`
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getCompiledPrompt())
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleCustomCopy = () => {
    navigator.clipboard.writeText(customPrompt)
    setCustomIsCopied(true)
    setTimeout(() => setCustomIsCopied(false), 2000)
  }

  // Custom Prompt Analyzer Heuristics
  const analyzePrompt = (prompt) => {
    let currentScore = 20
    const missing = []
    const suggestions = []
    
    if (!prompt || prompt.trim().length < 10) {
      return {
        score: 0,
        missing: ["Prompt context, goals, and role specification."],
        suggestions: ["Start by writing a sentence describing the task you want the AI to perform."]
      }
    }

    const lower = prompt.toLowerCase()

    // Check for persona/role
    const roleKeywords = ["act as", "role", "persona", "expert", "writer", "developer", "manager", "analyst", "you are a"]
    const hasRole = roleKeywords.some(w => lower.includes(w))
    if (hasRole) {
      currentScore += 25
    } else {
      missing.push("Role / Persona")
      suggestions.push("Define a clear persona for the AI (e.g. 'Act as a Senior UX copywriter').")
    }

    // Check for context
    const contextKeywords = ["context", "background", "because", "situation", "pet", "startup", "company", "user", "milestone", "launch"]
    const hasContext = contextKeywords.some(w => lower.includes(w)) || prompt.length > 90
    if (hasContext) {
      currentScore += 20
    } else {
      missing.push("Context / Background")
      suggestions.push("Describe the situation or backdrop (e.g. 'We are launching a pet app tier').")
    }

    // Check for output format
    const formatKeywords = ["format", "json", "markdown", "list", "bullet", "table", "schema", "headers", "csv"]
    const hasFormat = formatKeywords.some(w => lower.includes(w))
    if (hasFormat) {
      currentScore += 20
    } else {
      missing.push("Output Format / Schema")
      suggestions.push("Specify the exact output format (e.g. 'Return as a markdown table' or 'Use JSON').")
    }

    // Check for constraints
    const constraintKeywords = ["limit", "words", "characters", "do not", "avoid", "never", "only", "short", "long", "rules"]
    const hasConstraints = constraintKeywords.some(w => lower.includes(w))
    if (hasConstraints) {
      currentScore += 15
    } else {
      missing.push("Constraints / Boundaries")
      suggestions.push("Set limits (e.g. 'Keep output under 100 words' or 'Avoid using jargon').")
    }

    // Length bonus
    if (prompt.length > 200) {
      currentScore += 10
    }
    
    currentScore = Math.min(currentScore, 100)

    return {
      score: currentScore,
      missing: missing.length ? missing : ["None! Your prompt is well-grounded."],
      suggestions: suggestions.length ? suggestions : ["Excellent structure! Ready to test in a chat interface."]
    }
  }

  const customAnalysis = analyzePrompt(customPrompt)

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Prompt Builder</h2>
        <p className="text-zinc-400 text-lg mt-1">
          How do we guide AI? Prompt engineering is programming in natural language.
        </p>

        <PresenterNotes 
          notes="Explain that prompt engineering is essentially guiding the statistical pathways of the LLM. By providing Context, Role, and Constraints, you constrain the model's search space, reducing hallucinations and improving consistency. Contrast the 'Naive Prompt' with the 'Structured Prompt' built on this screen."
          exercise="Ask a student to write a basic request they usually send to ChatGPT (e.g. 'write an email'). Fill out the CRISPE builder together to show how much more targeted the result becomes."
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
          /* Guided Mode Layout */
          <>
            {/* Framework Selector & Score */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
              <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setActiveFramework('crispe')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeFramework === 'crispe' ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  CRISPE Framework
                </button>
                <button
                  onClick={() => setActiveFramework('prep')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeFramework === 'prep' ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  PREP Framework
                </button>
              </div>

              {/* Quality Score Badge */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 font-semibold uppercase">Prompt Quality Score:</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold font-mono px-3 py-1 rounded-lg ${
                    score >= 80 ? 'bg-brandGreen/25 text-brandGreen' : score >= 50 ? 'bg-brandAmber/25 text-brandAmber' : 'bg-red-950/40 text-red-400'
                  }`}>
                    {score}%
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">
                    {score >= 80 ? "Production Grade" : score >= 50 ? "Needs Polish" : "Weak Structure"}
                  </span>
                </div>
              </div>
            </div>

            {/* Builder Split Pane */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Input Form Fields */}
              <div className="lg:col-span-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                  Structure Your Request
                </span>

                <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                  {fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-xs text-zinc-300 font-bold block">{field.label}</label>
                      <textarea
                        rows={2}
                        value={form[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brandPurple resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Compiled Output Preview */}
              <div className="lg:col-span-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[360px]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                      Live Compiled Prompt
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-[10px] text-brandCyan hover:text-brandCyan/80 font-bold bg-brandCyan/10 border border-brandCyan/20 px-2 py-1 rounded"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? "Copied" : "Copy to Clipboard"}</span>
                    </button>
                  </div>

                  <pre className="mt-4 bg-zinc-950 p-4.5 rounded-xl border border-zinc-850 font-mono text-xs text-zinc-300 overflow-y-auto max-h-[280px] whitespace-pre-wrap leading-relaxed">
                    {getCompiledPrompt()}
                  </pre>
                </div>

                <div className="border-t border-zinc-800 pt-3 text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-brandAmber" />
                  <span>Structured prompts restrict the LLM search space, improving latency and logical consistency.</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Custom Workspace Layout */
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editor Workspace */}
            <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                    Custom Prompt Workspace
                  </span>
                  <button
                    onClick={handleCustomCopy}
                    className="flex items-center gap-1 text-[10px] text-brandCyan hover:text-brandCyan/80 font-bold bg-brandCyan/10 border border-brandCyan/20 px-2 py-1 rounded"
                  >
                    {customIsCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{customIsCopied ? "Copied" : "Copy Prompt"}</span>
                  </button>
                </div>
                
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Draft your prompt here from scratch. E.g. 'Act as a senior growth PM...'"
                  rows={12}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brandPurple resize-none min-h-[260px] leading-relaxed"
                />
              </div>

              <div className="border-t border-zinc-800 pt-3 text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-brandCyan" />
                <span>Type live to grade prompt quality and get recommendations immediately.</span>
              </div>
            </div>

            {/* Analysis Workspace */}
            <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                Prompt Audit Metrics
              </span>

              {/* Quality score */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Prompt Quality Score</span>
                  <span className="text-xs text-zinc-350 font-semibold block mt-0.5">
                    {customAnalysis.score >= 80 ? "Production Grade" : customAnalysis.score >= 50 ? "Needs Polish" : "Weak Structure"}
                  </span>
                </div>
                <span className={`text-xl font-bold font-mono px-4 py-2 rounded-xl border ${
                  customAnalysis.score >= 80 ? 'bg-brandGreen/15 border-brandGreen/30 text-brandGreen' : customAnalysis.score >= 50 ? 'bg-brandAmber/15 border-brandAmber/30 text-brandAmber' : 'bg-red-950/20 border-red-500/30 text-red-400'
                }`}>
                  {customAnalysis.score}%
                </span>
              </div>

              {/* Missing context items */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Missing Context Elements</span>
                <ul className="space-y-1.5">
                  {customAnalysis.missing.map((item, idx) => (
                    <li key={idx} className="text-[11px] text-zinc-400 flex items-start gap-1.5">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested Improvements */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block text-brandCyan">Suggested Improvements</span>
                <ul className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {customAnalysis.suggestions.map((sug, idx) => (
                    <li key={idx} className="text-[11px] text-zinc-300 leading-relaxed flex items-start gap-1.5">
                      <span className="text-brandCyan font-bold">•</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Before vs After showcase */}
        <div className="mt-6 bg-zinc-905 border border-zinc-800 rounded-2xl p-5">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
            Why Structure Matters: Naive vs Engineering
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
            <div className="bg-red-950/10 border border-red-950 p-3.5 rounded-xl">
              <span className="text-red-400 font-bold uppercase tracking-wide block mb-1">Naive Prompt</span>
              <p className="text-zinc-400 font-mono">"Write an onboarding email for new users."</p>
              <span className="text-[10px] text-zinc-500 block mt-3">Result: Generic, bloated, ignores brand style, requires heavy manual rewrite.</span>
            </div>
            <div className="bg-brandGreen/5 border border-brandGreen/20 p-3.5 rounded-xl">
              <span className="text-brandGreen font-bold uppercase tracking-wide block mb-1">Engineered Prompt</span>
              <p className="text-zinc-300 font-mono">"Act as a SaaS Copywriter. Write an onboarding email. Constraints: Keep under 150 words, tone is casual, include one CTA link..."</p>
              <span className="text-[10px] text-zinc-400 block mt-3">Result: High consistency, production-ready copy, matches customer style guidelines immediately.</span>
            </div>
          </div>
        </div>

        <PMInsight 
          concept="In-Context Learning (ICL)"
          source="Brown et al., 'Language Models are Few-Shot Learners' (NeurIPS 2020)"
          quote="In-context learning allows the model to adapt to a task at inference time simply by prepending examples, without any weight updates."
          takeaway="Prompt engineering is a rapid prototyping tool, not a stable production backend. PMs should use prompts to discover features, but transition core instructions to few-shot system context, dynamic routers, or fine-tuning to reduce prompt drift and prevent jailbreak injection attacks."
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-4 flex justify-end">
        <button
          onClick={() => completeSection(9)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brandGreen text-white text-sm font-semibold rounded-lg hover:bg-brandGreen/90 glow-green transition-colors"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Mark Section Completed</span>
        </button>
      </div>
    </div>
  )
}

