import React, { useState, useEffect } from 'react'
import { GraduationCap, Upload, Play, Key, Eye, HelpCircle, AlertCircle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import PMInsight from '../components/PMInsight'
import KarpathyInsight from '../components/KarpathyInsight'
import PresenterNotes from '../components/PresenterNotes'

const mockRetrievedChunks = [
  { text: "Feature: Smart Onboarding. Users can link bank accounts instantly via Plaid. Success Metric: Conversion improves by 8%. Cost estimate: $0.05 per active user. Tech Stack: Node, React Native, Postgres.", score: 0.94 },
  { text: "Milestone 1: Prototype design due July 10th. Milestone 2: Internal beta due August 3rd. Milestone 3: Production launch scheduled for September 12th, 2026. Lead Architect: Dave Thompson.", score: 0.81 }
]

const presetQuestions = [
  "What are the milestones for the smart onboarding feature?",
  "What success metrics and tech stack are defined?",
  "Who is the lead architect and what is the launch date?"
]

export default function ProductAssistant() {
  const { openaiKey, setOpenAIKey, completeSection } = useAppStore()
  
  // Tab State
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('assistant_active_tab') || 'guided')

  // Guided Mode States
  const [fileUploaded, setFileUploaded] = useState(false)
  const [fileName, setFileName] = useState("")
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [showTransparency, setShowTransparency] = useState(true)
  const [keyInput, setKeyInput] = useState(openaiKey)
  const [showKeyInput, setShowKeyInput] = useState(false)

  // Custom Mode States
  const [customSystemPrompt, setCustomSystemPrompt] = useState(() => localStorage.getItem('assistant_custom_sys') || 'You are a helpful product assistant. Ground your answers ONLY in the following context documents.\n\nIf the answer cannot be found in the context, say "I cannot find this in the uploaded document."')
  const [customKnowledge, setCustomKnowledge] = useState(() => localStorage.getItem('assistant_custom_knowledge') || 'Product: Premium Pet Food.\nKey benefits: High protein, organic ingredients, improves coat health in 14 days.\nPricing: $45 per bag.\nDelivery: Free shipping on orders over $50.')
  const [customQuestion, setCustomQuestion] = useState(() => localStorage.getItem('assistant_custom_question') || 'How much does the premium pet food cost and what are its benefits?')
  const [customAnswer, setCustomAnswer] = useState(() => localStorage.getItem('assistant_custom_answer') || '')
  const [customFileName, setCustomFileName] = useState(() => localStorage.getItem('assistant_custom_file_name') || '')
  const [customLoading, setCustomLoading] = useState(false)

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem('assistant_active_tab', activeTab)
  }, [activeTab])

  useEffect(() => {
    localStorage.setItem('assistant_custom_sys', customSystemPrompt)
  }, [customSystemPrompt])

  useEffect(() => {
    localStorage.setItem('assistant_custom_knowledge', customKnowledge)
  }, [customKnowledge])

  useEffect(() => {
    localStorage.setItem('assistant_custom_question', customQuestion)
  }, [customQuestion])

  useEffect(() => {
    localStorage.setItem('assistant_custom_answer', customAnswer)
  }, [customAnswer])

  useEffect(() => {
    localStorage.setItem('assistant_custom_file_name', customFileName)
  }, [customFileName])

  const handleMockUpload = () => {
    setFileName("Onboarding_Product_Spec_v3.pdf")
    setFileUploaded(true)
  }

  const handleSaveKey = () => {
    setOpenAIKey(keyInput)
    setShowKeyInput(false)
  }

  const handleCustomFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCustomFileName(file.name)
    if (file.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCustomKnowledge(event.target.result)
      }
      reader.readAsText(file)
    } else {
      // PDF/DOCX mock
      setCustomKnowledge(`Product Specification: ${file.name.replace(/\.[^/.]+$/, "")}\nOwner: Jane Doe\nMilestone: Launch scheduled for November 15, 2026.\nGoal: Increase conversion rate by 15% in Q4.\nRisk factors: Third-party integration delays and server scaling issues.`)
    }
  }

  // Similarity matching helper (word overlap Jaccard variant)
  const calculateSimilarity = (query, chunkText) => {
    const qWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2)
    if (qWords.length === 0) return 0.15
    const cWords = chunkText.toLowerCase().split(/\W+/)
    let matches = 0
    qWords.forEach(qw => {
      if (cWords.includes(qw)) matches++
    })
    const overlapRatio = matches / qWords.length
    return parseFloat((0.2 + overlapRatio * 0.75).toFixed(2))
  }

  // Parse custom knowledge source into chunks and score them
  const getCustomChunks = () => {
    if (!customKnowledge.trim()) return []
    const sentences = customKnowledge.split(/[.!?\n]/).map(s => s.trim()).filter(s => s.length > 5)
    return sentences
      .map((text, idx) => {
        const score = calculateSimilarity(customQuestion, text)
        return { id: idx + 1, content: text, score }
      })
      .sort((a, b) => b.score - a.score)
  }

  const customChunks = getCustomChunks()
  const customTopChunks = customChunks.filter(c => c.score > 0.3).slice(0, 2)

  // Compiled raw prompt text for transparency
  const customAssembledPrompt = `SYSTEM:\n${customSystemPrompt}\n\nContext/Knowledge Source:\n${customTopChunks.map(c => `[Chunk #${c.id}]: ${c.content}`).join('\n')}\n\nUSER:\n${customQuestion}`

  const handleQuestionSubmit = async (customQ) => {
    if (activeTab === 'guided') {
      const q = customQ || question
      if (!q.trim()) return
      setLoading(true)
      setAnswer('')

      if (openaiKey) {
        try {
          const systemPrompt = `You are a helpful product assistant. Ground your answers ONLY in the following context documents:\n\n${mockRetrievedChunks.map(c => c.text).join('\n\n')}\n\nIf the answer cannot be found in the context, say "I cannot find this in the uploaded document."`
          
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: q }
              ],
              temperature: 0.1
            })
          })

          const data = await response.json()
          if (data.choices && data.choices[0]) {
            setAnswer(data.choices[0].message.content)
          } else {
            setAnswer("API Error: " + (data.error?.message || "Unknown error occurred"))
          }
        } catch (err) {
          setAnswer("Fetch Error: Failed to connect to OpenAI. Check your network or API key.")
        }
      } else {
        setTimeout(() => {
          if (q.toLowerCase().includes("milestone") || q.toLowerCase().includes("launch")) {
            setAnswer("According to the uploaded product spec sheet, Milestone 1 (Prototype design) is due July 10th, Milestone 2 (Internal beta) is due August 3rd, and the final production launch is scheduled for September 12th, 2026. The Lead Architect is Dave Thompson.")
          } else if (q.toLowerCase().includes("metric") || q.toLowerCase().includes("tech")) {
            setAnswer("The defined success metric is an improvement in onboarding conversion rate by 8%. The tech stack for Smart Onboarding consists of Node.js, React Native, and PostgreSQL, with integrations to Plaid.")
          } else {
            setAnswer("Based on the uploaded document, Dave Thompson leads the architecture team for the Smart Onboarding feature. The feature utilizes Plaid for bank integrations and aims to boost signup conversions.")
          }
          setLoading(false)
        }, 1000)
        return
      }
      setLoading(false)
    } else {
      // Custom mode submission
      const q = customQ || customQuestion
      if (!q.trim() || !customKnowledge.trim()) return
      setCustomLoading(true)
      setCustomAnswer('')

      if (openaiKey) {
        try {
          const systemPrompt = `${customSystemPrompt}\n\nContext:\n${customTopChunks.map(c => c.content).join('\n\n')}`
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: q }
              ],
              temperature: 0.1
            })
          })

          const data = await response.json()
          if (data.choices && data.choices[0]) {
            setCustomAnswer(data.choices[0].message.content)
          } else {
            setCustomAnswer("API Error: " + (data.error?.message || "Unknown error occurred"))
          }
        } catch (err) {
          setCustomAnswer("Fetch Error: Failed to connect to OpenAI. Check your network or API key.")
        }
      } else {
        setTimeout(() => {
          if (customTopChunks.length === 0) {
            setCustomAnswer("I cannot find any relevant details in the provided context to answer your question. Try adding more relevant sentences to your Knowledge Source.")
          } else {
            const synthesis = customTopChunks.map(c => c.content).join(' ')
            setCustomAnswer(`Based on the retrieved custom knowledge:\n${synthesis}`)
          }
          setCustomLoading(false)
        }, 1000)
        return
      }
      setCustomLoading(false)
    }
  }

  const rawPromptText = `SYSTEM:\nYou are a helpful product assistant. Ground your answers ONLY in the following context documents:\n\n${mockRetrievedChunks.map(c => c.text).join('\n\n')}\n\nUSER:\n${question || "[Your Question]"}`

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Product Assistant Builder</h2>
        <p className="text-zinc-400 text-lg mt-1">
          Build and inspect a fully functional PDF QA chatbot in real-time.
        </p>

        <PresenterNotes 
          notes="This is the hands-on lab. Users can mock-upload a PDF. If they have their own OpenAI API key, they can enter it to run live API calls right in their browser! Show them 'Transparency Mode'—explain that this is how developers audit what details actually get passed to the LLM (context window management)."
          exercise="If a student has a key, test a custom question. Have the class look at the 'Raw Prompt Sent to LLM' pane to show exactly how the system systemized the prompt before calling OpenAI."
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

        {/* OpenAI Key Configuration Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <Key className="w-4.5 h-4.5 text-brandCyan" />
            <span className="text-xs font-bold text-zinc-300">OpenAI API Connection:</span>
            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${openaiKey ? 'bg-brandGreen/20 text-brandGreen' : 'bg-brandAmber/20 text-brandAmber'}`}>
              {openaiKey ? 'Connected (Live API Mode)' : 'Offline Mock Mode'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-xs text-zinc-400 hover:text-zinc-200 underline font-semibold"
            >
              {openaiKey ? 'Change API Key' : 'Configure API Key'}
            </button>
            {openaiKey && (
              <button
                onClick={() => setOpenAIKey('')}
                className="text-xs text-red-400 hover:text-red-300 underline font-semibold"
              >
                Clear Key
              </button>
            )}
          </div>
        </div>

        {/* API Key Form Expansion */}
        {showKeyInput && (
          <div className="mt-3 p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex gap-3">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-proj-..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
            />
            <button
              onClick={handleSaveKey}
              className="px-4 py-1.5 bg-brandPurple text-white text-xs font-bold rounded-lg hover:bg-brandPurple/90"
            >
              Save Key
            </button>
          </div>
        )}

        {activeTab === 'guided' ? (
          /* Builder Arena (Guided) */
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Chat Panel */}
            <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[360px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                    Q&A Control Dashboard
                  </span>
                  <button
                    onClick={() => setShowTransparency(!showTransparency)}
                    className={`flex items-center gap-1 text-[10px] font-bold border px-2 py-1 rounded transition-colors ${
                      showTransparency ? 'border-brandPurple bg-brandPurple/15 text-brandPurple' : 'border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Transparency Mode</span>
                  </button>
                </div>

                {/* Upload section */}
                {!fileUploaded ? (
                  <div className="mt-4 border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
                    <div className="p-3 bg-zinc-950 text-zinc-500 rounded-full border border-zinc-850">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200">No Document Uploaded</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Upload a product specifications sheet to ground the assistant.</p>
                    </div>
                    <button
                      onClick={handleMockUpload}
                      className="px-4 py-2 bg-brandPurple text-white text-xs font-bold rounded-lg hover:bg-brandPurple/90 transition-all"
                    >
                      Upload Mock Spec Sheet PDF
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div className="bg-zinc-950 px-4 py-3 rounded-lg border border-zinc-850 flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-semibold flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-brandGreen" />
                        Document: {fileName}
                      </span>
                      <span className="text-brandGreen font-bold font-mono">1.2k tokens index</span>
                    </div>

                    {/* Preset Questions */}
                    <div className="space-y-1.5">
                      <span className="text-zinc-500 text-[10px] uppercase font-mono block">Suggested Questions</span>
                      <div className="flex flex-col gap-2">
                        {presetQuestions.map((q) => (
                          <button
                            key={q}
                            onClick={() => { setQuestion(q); handleQuestionSubmit(q); }}
                            className="w-full text-left bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs text-zinc-300 hover:border-zinc-700 transition-colors"
                          >
                            "{q}"
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom query input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask custom question about spec sheet..."
                        className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brandPurple font-mono"
                      />
                      <button
                        onClick={() => handleQuestionSubmit()}
                        disabled={loading || !question.trim()}
                        className="px-4 bg-brandPurple hover:bg-brandPurple/90 rounded-xl text-white text-xs font-bold transition-all disabled:bg-zinc-800 disabled:text-zinc-600"
                      >
                        {loading ? "Calling LLM..." : "Ask AI"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Answer Display */}
              {answer && (
                <div className="mt-4 bg-zinc-950 border border-brandGreen/20 p-4.5 rounded-xl text-xs leading-relaxed text-zinc-300 relative">
                  <span className="text-[10px] text-brandGreen uppercase font-mono font-bold block mb-1">Generated Answer</span>
                  <p className="font-mono">{answer}</p>
                </div>
              )}
            </div>

            {/* Transparency Panel */}
            {showTransparency && (
              <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[360px]">
                <div>
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                    Transparency Mode / LLM Debugger
                  </span>

                  <div className="space-y-3 mt-4">
                    {/* Retrieved Chunks */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono block">Context Chunks Retrieved (similarity &gt; 0.8)</span>
                      <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 space-y-2 max-h-[140px] overflow-y-auto">
                        {mockRetrievedChunks.map((chunk, idx) => (
                          <div key={idx} className="text-[10px] border-b border-zinc-850/60 pb-1.5 last:border-0">
                            <div className="flex justify-between font-semibold text-[8px] text-brandCyan">
                              <span>Chunk #{idx + 1}</span>
                              <span>Score: {chunk.score}</span>
                            </div>
                            <p className="text-zinc-400 mt-0.5">{chunk.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Raw System Prompt */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono block">Raw System & User Prompt Assembly</span>
                      <pre className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 text-[9px] font-mono text-zinc-400 overflow-y-auto max-h-[120px] whitespace-pre-wrap">
                        {rawPromptText}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-850 pt-3 mt-4 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
                  <span>Latency: {loading ? "..." : "1.2s"}</span>
                  <span>Context tokens: ~640</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Builder Arena (Custom) */
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Chat Panel (Custom) */}
            <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[360px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                    Custom AI Assistant Settings
                  </span>
                  <button
                    onClick={() => setShowTransparency(!showTransparency)}
                    className={`flex items-center gap-1 text-[10px] font-bold border px-2 py-1 rounded transition-colors ${
                      showTransparency ? 'border-brandPurple bg-brandPurple/15 text-brandPurple' : 'border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Transparency Mode</span>
                  </button>
                </div>

                {/* System Prompt Input */}
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-300 font-bold flex items-center justify-between">
                    <span>System Prompt</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Controls assistant behavior</span>
                  </label>
                  <textarea
                    value={customSystemPrompt}
                    onChange={(e) => setCustomSystemPrompt(e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brandPurple resize-none"
                    placeholder="Enter system prompt guidelines..."
                  />
                </div>

                {/* Knowledge Source Input (File Upload + Text Area) */}
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-300 font-bold flex items-center justify-between">
                    <span>Knowledge Source / Context</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Grounding document for RAG</span>
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                    <div className="md:col-span-2 relative border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-3 text-center flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-950/20">
                      <input
                        type="file"
                        accept=".txt,.pdf,.docx"
                        onChange={handleCustomFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="w-4 h-4 text-zinc-500 mb-1" />
                      <span className="text-[10px] font-bold text-zinc-300">Select PDF/TXT/DOCX</span>
                      <span className="text-[8px] text-zinc-500">Or drag and drop to parse content</span>
                    </div>

                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 flex flex-col justify-center text-xs">
                      <span className="text-[9px] text-zinc-500 uppercase font-mono block">Status</span>
                      {customFileName ? (
                        <span className="text-[10px] text-brandGreen font-bold truncate mt-1 block">
                          ✓ {customFileName}
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 italic mt-1 block">No file (using manual text)</span>
                      )}
                    </div>
                  </div>

                  <textarea
                    value={customKnowledge}
                    onChange={(e) => setCustomKnowledge(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brandPurple resize-none"
                    placeholder="Paste context guidelines here..."
                  />
                </div>

                {/* User Question Input */}
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-300 font-bold block">User Question</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder="Ask a question about the custom knowledge..."
                      className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brandPurple font-mono"
                    />
                    <button
                      onClick={() => handleQuestionSubmit()}
                      disabled={customLoading || !customQuestion.trim() || !customKnowledge.trim()}
                      className="px-4 bg-brandPurple hover:bg-brandPurple/90 rounded-xl text-white text-xs font-bold transition-all disabled:bg-zinc-800 disabled:text-zinc-600"
                    >
                      {customLoading ? "Calling LLM..." : "Ask AI"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Answer Display */}
              {customAnswer && (
                <div className="mt-4 bg-zinc-950 border border-brandGreen/20 p-4.5 rounded-xl text-xs leading-relaxed text-zinc-300 relative">
                  <span className="text-[10px] text-brandGreen uppercase font-mono font-bold block mb-1">Generated Answer</span>
                  <p className="font-mono whitespace-pre-wrap">{customAnswer}</p>
                </div>
              )}
            </div>

            {/* Transparency Panel (Custom) */}
            {showTransparency && (
              <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[360px]">
                <div>
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                    Transparency Mode / LLM Debugger
                  </span>

                  <div className="space-y-3 mt-4">
                    {/* Retrieved Chunks */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono block">Context Chunks Retrieved (similarity &gt; 0.3)</span>
                      <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 space-y-2 max-h-[140px] overflow-y-auto">
                        {customChunks.length > 0 ? (
                          customChunks.map((chunk) => (
                            <div key={chunk.id} className="text-[10px] border-b border-zinc-850/60 pb-1.5 last:border-0">
                              <div className="flex justify-between font-semibold text-[8px] text-brandCyan">
                                <span>Chunk #{chunk.id}</span>
                                <span className={chunk.score > 0.3 ? 'text-brandGreen font-bold' : ''}>
                                  Score: {chunk.score}
                                </span>
                              </div>
                              <p className="text-zinc-400 mt-0.5">{chunk.content}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-[10px] text-zinc-600 italic py-4 text-center">
                            No text inside the custom Knowledge Source.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Raw Compiled Prompt */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono block">Raw System & User Prompt Assembly</span>
                      <pre className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 text-[9px] font-mono text-zinc-400 overflow-y-auto max-h-[120px] whitespace-pre-wrap leading-relaxed">
                        {customAssembledPrompt}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-850 pt-3 mt-4 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
                  <span>Latency: {customLoading ? "..." : "1.2s"}</span>
                  <span>Context tokens: ~{Math.round(customKnowledge.length / 4)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <KarpathyInsight text="LLMs are stateless engines. They do not store user sessions or uploaded document keys in their parameter weights. Every message we send must reconstruct the entire history and context from scratch in the prompt template." />

        <PMInsight 
          decision="Transparency is key to model debugging. Always build a 'debug console' or transparency view for your developers to verify what chunks are being retrieved and how prompts are assembled. This makes context window bugs visible."
          impact="Reduce API token overhead. Ensure you have chunk filters and overlap controls so that garbage text doesn't bloat your prompt sizes."
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-4 flex justify-end">
        <button
          onClick={() => completeSection(11)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brandGreen text-white text-sm font-semibold rounded-lg hover:bg-brandGreen/90 glow-green transition-colors"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Mark Section Completed</span>
        </button>
      </div>
    </div>
  )
}
