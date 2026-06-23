import React, { useState } from 'react'
import { Award, Download, RefreshCw, Send, CheckCircle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import SectionCompleteButton from '../components/SectionCompleteButton'
import PMInsight from '../components/PMInsight'
import PresenterNotes from '../components/PresenterNotes'
import confetti from 'canvas-confetti'

const fields = [
  { key: 'problem', label: '1. What problem does the AI solve?', placeholder: 'Describe the customer pain point (e.g. support agents waste 2 hours/day copy-pasting customer replies)' },
  { key: 'user', label: '2. Target User Persona', placeholder: 'Who is using this AI? (e.g. Customer support reps, end-customers, marketing managers)' },
  { key: 'prompt', label: '3. Prompt & Instruction Strategy', placeholder: 'What role and guidelines will you give the model? Which framework (CRISPE/PREP) will you use?' },
  { key: 'knowledgeSource', label: '4. Knowledge Source (RAG Strategy)', placeholder: 'What external data does the AI need access to? (e.g. customer billing logs, refund policy wikis)' },
  { key: 'successMetric', label: '5. Success Metric & Target Accuracy', placeholder: 'How will you evaluate success? (e.g. reduce support reply latency by 50%, accuracy &gt; 95%)' },
  { key: 'risks', label: '6. Operational Risks & Hallucination Guardrails', placeholder: 'What happens if the model fails? What guardrails are in place? (e.g. human-in-the-loop review for high refund values)' },
  { key: 'feedbackLoop', label: '7. Feedback Loop & Continuous Evals', placeholder: 'How will you collect feedback to improve the model? (e.g. support agent thumbs up/down, monthly prompt audits)' }
]

export default function CapstoneChallenge() {
  const { capstone, updateCapstone, completeSection } = useAppStore()
  const [submitted, setSubmitted] = useState(false)

  const handleFieldChange = (key, val) => {
    updateCapstone(key, val)
  }

  const handleSubmitBlueprint = () => {
    // Check if at least 3 fields have content
    const filledCount = Object.values(capstone).filter(val => val && val.trim().length > 15).length
    if (filledCount < 3) {
      alert("Please fill out at least 3 sections with detailed text before submitting your Strategy Blueprint.")
      return
    }

    setSubmitted(true)
    completeSection(13)
    
    // Trigger confetti explosion!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col h-full justify-between print-page">
      <div className="space-y-6">
        <div className="flex items-center justify-between no-print">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Capstone Challenge</h2>
            <p className="text-zinc-400 text-lg mt-1">
              Design your own AI Product Strategy Blueprint.
            </p>
          </div>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold rounded-lg text-zinc-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Strategy PDF</span>
          </button>
        </div>

        {/* Presenter Notes */}
        <PresenterNotes 
          notes="This is the collaborative workshop activity. Divide the Product Managers into groups of 3-4. Ask them to spend 15-20 minutes filling out this strategy canvas for a feature in their current product line. They should present their canvas to the classroom."
          exercise="Encourage PMs to debate 'Success Metric & Accuracy' (Step 5) and 'Hallucination Guardrails' (Step 6)—these are usually the most overlooked components."
          duration="30 mins"
        />

        {/* Strategy Canvas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          {fields.map((field) => (
            <div 
              key={field.key} 
              className={`bg-zinc-900/60 border border-zinc-805 rounded-xl p-4.5 space-y-2 relative transition-all ${
                submitted ? 'border-brandGreen/20 bg-brandGreen/[0.02]' : ''
              }`}
            >
              <label className="text-xs text-zinc-300 font-bold block tracking-wide">{field.label}</label>
              <textarea
                rows={3}
                value={capstone[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                disabled={submitted}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brandPurple resize-none"
              />
            </div>
          ))}
        </div>

        {/* Submit action */}
        <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-5 rounded-2xl mt-6 no-print">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-brandPurple/10 text-brandPurple rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-200">Submit Your Strategy Canvas</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Submit to finalize the course blueprint and trigger evaluation approval.</p>
            </div>
          </div>

          <button
            onClick={handleSubmitBlueprint}
            disabled={submitted}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${
              submitted 
                ? 'bg-brandGreen/20 text-brandGreen cursor-default' 
                : 'bg-brandPurple text-white hover:bg-brandPurple/90 glow-purple'
            }`}
          >
            {submitted ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            <span>{submitted ? "Strategy Canvas Approved!" : "Approve Strategy Canvas"}</span>
          </button>
        </div>

        {submitted && (
          <div className="bg-brandGreen/10 border border-brandGreen/30 p-5 rounded-2xl text-center space-y-2 mt-6">
            <CheckCircle className="w-8 h-8 text-brandGreen mx-auto animate-bounce" />
            <h4 className="text-brandGreen font-bold text-base">Congratulations, Workshop Completed!</h4>
            <p className="text-zinc-300 text-xs max-w-lg mx-auto">
              You have successfully completed all 13 modules of "Inside the Mind of an LLM". You are now ready to design, deploy, and evaluate production-grade generative features.
            </p>
            <div className="text-[10px] text-zinc-500 font-mono pt-3">
              Press the "Export Strategy PDF" at the top of the screen to print or download your strategy blueprint canvas.
            </div>
          </div>
        )}

        <PMInsight 
          concept="Programmatic Guardrails & Safety"
          source="Guardrails AI Whitepaper, 'Structural Validation of LLM Outputs' (2023)"
          quote="To deploy LLMs in high-stakes environments, we must establish programmatic boundaries that inspect inputs for safety and validate outputs against structural schemas."
          takeaway="The user experience must be designed for fallback. Implement guardrail models (like Llama-Guard) to filter toxic input, use Pydantic/Instructor to enforce JSON schemas, and ensure high-risk actions (like transferring money) require explicit human confirmation."
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-4 flex justify-end no-print">
        <SectionCompleteButton sectionId={13} />
      </div>
    </div>
  )
}
