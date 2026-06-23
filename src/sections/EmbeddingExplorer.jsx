import React, { useState, useRef, useEffect } from 'react'
import { Compass, Sparkles, RefreshCw, GitPullRequest, Layers, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import PMInsight from '../components/PMInsight'
import PresenterNotes from '../components/PresenterNotes'
import { useAppStore } from '../store/useAppStore'

const initialWords = [
  { name: 'Product', x: 20, y: 75, category: 'pm_core' },
  { name: 'Manager', x: 24, y: 72, category: 'pm_core' },
  { name: 'Roadmap', x: 22, y: 82, category: 'pm_core' },
  { name: 'PRD', x: 18, y: 68, category: 'pm_core' },
  { name: 'Engineer', x: 78, y: 22, category: 'tech_team' },
  { name: 'Developer', x: 82, y: 18, category: 'tech_team' },
  { name: 'Code', x: 80, y: 28, category: 'tech_team' },
  { name: 'Backlog', x: 76, y: 32, category: 'tech_team' },
  { name: 'Banana', x: 50, y: 55, category: 'unrelated' },
  { name: 'Monkey', x: 52, y: 50, category: 'unrelated' },
]

const clusterTickets = [
  { name: 'Login is broken (Critical)', x: 15, y: 80, type: 'Bug', color: '#ef4444' },
  { name: 'Checkout throws 500 error', x: 20, y: 75, type: 'Bug', color: '#ef4444' },
  { name: 'DB latency spiking 300ms', x: 35, y: 85, type: 'Incident', color: '#f59e0b' },
  { name: 'Memory leak on dashboard', x: 40, y: 78, type: 'Incident', color: '#f59e0b' },
  { name: 'Add export to CSV button', x: 75, y: 25, type: 'Feature', color: '#10b981' },
  { name: 'DarkMode theme toggle', x: 80, y: 20, type: 'Feature', color: '#10b981' },
  { name: 'Make dashboard header sticky', x: 85, y: 40, type: 'Enhancement', color: '#06b6d4' },
  { name: 'Improve input font size', x: 78, y: 35, type: 'Enhancement', color: '#06b6d4' },
]

// Custom Words coordinate helpers
const getCoordinatesForWord = (word, index) => {
  const specMap = {
    "pm": { x: 30, y: 70, cluster: 1, color: "#8b5cf6" },
    "ceo": { x: 35, y: 80, cluster: 1, color: "#8b5cf6" },
    "engineer": { x: 25, y: 30, cluster: 2, color: "#06b6d4" },
    "developer": { x: 20, y: 25, cluster: 2, color: "#06b6d4" },
    "designer": { x: 45, y: 40, cluster: 3, color: "#10b981" },
    "roadmap": { x: 75, y: 75, cluster: 4, color: "#f59e0b" },
    "prd": { x: 80, y: 70, cluster: 4, color: "#f59e0b" },
    "sprint": { x: 65, y: 20, cluster: 5, color: "#ec4899" },
    "backlog": { x: 70, y: 15, cluster: 5, color: "#ec4899" }
  }

  const clean = word.trim().toLowerCase()
  if (specMap[clean]) {
    return specMap[clean]
  }

  // Hash-based mapping to spread random inputs
  let hash = 0
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash)
  }
  const absHash = Math.abs(hash)
  
  // Use index to help space items if hashes collide
  const x = 15 + ((absHash + index * 12) % 70)
  const y = 15 + (((absHash >> 2) + index * 9) % 70)
  const cluster = (absHash % 4) + 1 // 4 possible clusters
  const colors = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]
  
  return { x, y, cluster, color: colors[cluster - 1] }
}

export default function EmbeddingExplorer() {
  const { completeSection } = useAppStore()

  // Tabs State
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('embedding_active_tab') || 'guided')

  // Guided Mode States
  const [mode, setMode] = useState('semantic') // 'semantic' | 'tickets'
  const [words, setWords] = useState(initialWords)
  const [selectedWord, setSelectedWord] = useState(null)
  const [isClustered, setIsClustered] = useState(false)
  const [arithmeticStep, setArithmeticStep] = useState(0) // 0: none, 1: King, 2: - Man, 3: + Woman, 4: = Queen

  // Try Your Own Mode States
  const [customInput, setCustomInput] = useState(() => localStorage.getItem('embedding_custom_input') || 'PM, Engineer, Designer, CEO, Roadmap, PRD, Sprint, Backlog')
  const [customWords, setCustomWords] = useState([])
  const [selectedCustomWord, setSelectedCustomWord] = useState(null)
  const [customClusteringEnabled, setCustomClusteringEnabled] = useState(false)

  const containerRef = useRef(null)

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem('embedding_active_tab', activeTab)
  }, [activeTab])

  useEffect(() => {
    localStorage.setItem('embedding_custom_input', customInput)
  }, [customInput])

  // Parse custom words list when input changes
  useEffect(() => {
    const tokens = customInput.split(',')
      .map(w => w.trim())
      .filter(w => w.length > 0)
    
    const parsed = tokens.map((w, idx) => {
      const coords = getCoordinatesForWord(w, idx)
      return {
        name: w,
        x: coords.x,
        y: coords.y,
        cluster: coords.cluster,
        color: coords.color
      }
    })
    setCustomWords(parsed)
    setSelectedCustomWord(null)
  }, [customInput])

  // Recalculate nearest neighbors to selectedWord/selectedCustomWord
  const getNearestNeighbors = (isCustom) => {
    const activeSelected = isCustom ? selectedCustomWord : selectedWord
    const activeList = isCustom ? customWords : words
    if (!activeSelected) return []

    const base = activeList.find(w => w.name === activeSelected)
    if (!base) return []

    return activeList
      .filter(w => w.name !== activeSelected)
      .map(w => {
        const dist = Math.sqrt(Math.pow(w.x - base.x, 2) + Math.pow(w.y - base.y, 2))
        return { name: w.name, distance: dist.toFixed(1) }
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
  }

  // Handle Dragging
  const handleDrag = (e, index, isCustom) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    
    // Normalize coordinates to percentage values (0 - 100)
    let x = ((e.clientX - rect.left) / rect.width) * 100
    let y = 100 - (((e.clientY - rect.top) / rect.height) * 100)
    
    // Constraints
    x = Math.max(5, Math.min(95, x))
    y = Math.max(5, Math.min(95, y))

    if (isCustom) {
      const updated = [...customWords]
      updated[index] = { ...updated[index], x, y }
      setCustomWords(updated)
      setSelectedCustomWord(updated[index].name)
    } else {
      const updated = [...words]
      updated[index] = { ...updated[index], x, y }
      setWords(updated)
      setSelectedWord(updated[index].name)
    }
  }

  const handleStartDrag = (wordName, isCustom) => {
    if (isCustom) {
      setSelectedCustomWord(wordName)
    } else {
      setSelectedWord(wordName)
    }
  }
  const triggerArithmeticDemo = () => {
    setArithmeticStep(1)
    setTimeout(() => setArithmeticStep(2), 2000)
    setTimeout(() => setArithmeticStep(3), 4000)
    setTimeout(() => setArithmeticStep(4), 6000)
  }

  const resetWords = () => {
    setWords(initialWords)
    setSelectedWord(null)
    setArithmeticStep(0)
  }
  const neighbors = getNearestNeighbors(activeTab === 'custom')

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Embedding Explorer</h2>
        <p className="text-zinc-400 text-lg mt-1">
          How does AI understand meaning? Mapping concepts into coordinates.
        </p>

        <PresenterNotes 
          notes="Explain that embeddings are high-dimensional vectors (often 1536 dimensions) that represent semantic similarity. We map these to 2D using algorithms like t-SNE or UMAP. Show the famous King - Man + Woman = Queen relationship. Explain that similar items cluster naturally."
          exercise="Select the 'Support Tickets' mode. Ask the PMs: 'How would you automatically route incoming customer emails to the correct team without writing 1,000 regex statements?' Show clustering in action."
        />

        {/* Concept Explanation Block */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 mt-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brandPurple/5 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-brandPurple bg-brandPurple/10 border border-brandPurple/20 px-2 py-0.5 rounded w-fit">
            Concept Explanation & Unified Example
          </h3>
          <p className="text-zinc-300 text-sm mt-3 leading-relaxed">
            <strong>Embeddings:</strong> AI models represent the meaning of words by converting them into long lists of numbers called <strong>Vectors</strong> (often 1536+ dimensions). In this numerical space, words with similar meanings (like "Product", "Manager", and "Roadmap") are placed very close to one another, while unrelated words (like "Banana") are placed far away. We can even perform semantic math on these vectors.
          </p>
          <div className="mt-4 border-t border-zinc-800/80 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400">
              <strong>Unified Example:</strong> PM core concepts cluster naturally together:
            </span>
            <span className="text-brandPurple font-mono font-semibold">
              Product + Manager + Strategy = Roadmap
            </span>
          </div>
        </div>

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
          /* Mode Toggles */
          <div className="flex items-center justify-between mt-6">
            <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
              <button
                onClick={() => { setMode('semantic'); resetWords(); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'semantic' ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                2D Semantic Vector Space
              </button>
              <button
                onClick={() => { setMode('tickets'); setIsClustered(false); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'tickets' ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Support Ticket Clustering
              </button>
            </div>

            {mode === 'semantic' ? (
              <div className="flex gap-2">
                <button
                  onClick={triggerArithmeticDemo}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brandCyan/20 text-brandCyan border border-brandCyan/30 hover:bg-brandCyan/30 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Vector Math Demo</span>
                </button>
                <button
                  onClick={resetWords}
                  className="p-1.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsClustered(prev => !prev)}
                className="flex items-center gap-1.5 px-4 py-2 bg-brandPurple text-white text-xs font-semibold rounded-lg hover:bg-brandPurple/90 transition-colors"
              >
                <Layers className="w-4 h-4" />
                <span>{isClustered ? "Reset Tickets" : "Run Clustering Algorithm"}</span>
              </button>
            )}
          </div>
        ) : (
          /* Custom Words Input & Controls */
          <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs text-zinc-400 font-mono uppercase font-semibold block">Custom Words Input (separated by commas)</label>
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="PM, Engineer, Designer, CEO"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brandPurple"
              />
            </div>
            
            <button
              onClick={() => setCustomClusteringEnabled(!customClusteringEnabled)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border rounded-lg transition-all ${
                customClusteringEnabled 
                  ? 'bg-brandPurple border-brandPurple text-white glow-purple' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{customClusteringEnabled ? "Hide Clusters" : "Display Clusters"}</span>
            </button>
          </div>
        )}

        {/* Main Grid Visualizer */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Vector scatter grid */}
          <div className="md:col-span-8 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden h-[380px] select-none">
            {/* Grid background lines */}
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-[0.03] pointer-events-none">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border border-white" />
              ))}
            </div>

            {/* Scatter arena */}
            <div 
              ref={containerRef}
              className="w-full h-full relative"
            >
              {activeTab === 'guided' ? (
                mode === 'semantic' ? (
                  // Semantic Word Plotting
                  words.map((word, index) => {
                    const isSelected = selectedWord === word.name
                    return (
                      <div
                        key={word.name}
                        onMouseDown={() => handleStartDrag(word.name, false)}
                        onDragStart={(e) => e.preventDefault()}
                        onMouseMove={(e) => e.buttons === 1 && handleDrag(e, index, false)}
                        className={`absolute cursor-move select-none px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-75 shadow-lg ${
                          isSelected 
                            ? 'border-brandPurple bg-brandPurple text-white z-20 scale-[1.05]'
                            : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-600'
                        }`}
                        style={{
                          left: `${word.x}%`,
                          bottom: `${word.y}%`,
                          transform: 'translate(-50%, 50%)',
                        }}
                      >
                        {word.name}
                      </div>
                    )
                  })
                ) : (
                  // Ticket Clustering Plotting
                  clusterTickets.map((ticket, index) => {
                    // If clustered, move to cluster coordinates, else stay scattered
                    const targetX = isClustered 
                      ? (ticket.type === 'Bug' ? 20 : ticket.type === 'Incident' ? 35 : ticket.type === 'Feature' ? 75 : 82)
                      : ticket.x
                    const targetY = isClustered
                      ? (ticket.type === 'Bug' ? 70 : ticket.type === 'Incident' ? 30 : ticket.type === 'Feature' ? 75 : 35)
                      : ticket.y

                    return (
                      <motion.div
                        key={ticket.name}
                        animate={{ left: `${targetX}%`, bottom: `${targetY}%` }}
                        transition={{ type: 'spring', stiffness: 60, damping: 12 }}
                        className="absolute cursor-default select-none px-2.5 py-1.5 rounded-lg border border-zinc-800 text-[10px] font-semibold text-zinc-200 shadow-md flex items-center gap-1.5"
                        style={{
                          backgroundColor: `${ticket.color}15`,
                          borderColor: ticket.color,
                          transform: 'translate(-50%, 50%)',
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ticket.color }} />
                        {ticket.name}
                      </motion.div>
                    )
                  })
                )
              ) : (
                // Custom Words Plotting
                customWords.map((word, index) => {
                  const isSelected = selectedCustomWord === word.name
                  return (
                    <div
                      key={word.name + "-" + index}
                      onMouseDown={() => handleStartDrag(word.name, true)}
                      onDragStart={(e) => e.preventDefault()}
                      onMouseMove={(e) => e.buttons === 1 && handleDrag(e, index, true)}
                      className={`absolute cursor-move select-none px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-75 shadow-lg ${
                        isSelected 
                          ? 'bg-brandPurple text-white z-20 scale-[1.05]'
                          : 'bg-zinc-900/80 text-zinc-300 hover:border-zinc-600'
                      }`}
                      style={{
                        left: `${word.x}%`,
                        bottom: `${word.y}%`,
                        transform: 'translate(-50%, 50%)',
                        borderColor: customClusteringEnabled ? word.color : isSelected ? '#8b5cf6' : '#27272a',
                        boxShadow: customClusteringEnabled ? `0 0 10px ${word.color}33` : ''
                      }}
                    >
                      {customClusteringEnabled && (
                        <span className="w-1.5 h-1.5 rounded-full inline-block mr-1.5" style={{ backgroundColor: word.color }} />
                      )}
                      {word.name}
                    </div>
                  )
                })
              )}

              {/* Vector Arithmetic Visualization overlay */}
              {activeTab === 'guided' && mode === 'semantic' && arithmeticStep > 0 && (
                <div className="absolute top-4 left-4 bg-zinc-900/90 border border-zinc-800 px-4 py-3 rounded-xl space-y-1 font-mono text-xs max-w-sm pointer-events-none">
                  <span className="text-zinc-500 uppercase text-[9px] block">Semantic Arithmetic</span>
                  <div className="flex items-center gap-2 text-zinc-200">
                    <span className={arithmeticStep >= 1 ? 'text-brandCyan font-bold' : ''}>Product</span>
                    <span>+</span>
                    <span className={arithmeticStep >= 2 ? 'text-brandPurple font-bold' : ''}>Manager</span>
                    <span>+</span>
                    <span className={arithmeticStep >= 3 ? 'text-brandAmber font-bold' : ''}>Strategy</span>
                    <span>=</span>
                    <span className={arithmeticStep >= 4 ? 'text-brandGreen font-bold' : ''}>Roadmap</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-2">
                    {arithmeticStep === 1 && "Start at Product coordinate [20, 75]"}
                    {arithmeticStep === 2 && "Add Manager direction (adding manager context)"}
                    {arithmeticStep === 3 && "Add Strategy direction (moving semantically closer to high-level goals)"}
                    {arithmeticStep === 4 && "Resolves closest to Roadmap coordinate [22, 82]!"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details & Neighbors */}
          <div className="md:col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
            {activeTab === 'guided' ? (
              mode === 'semantic' ? (
                <div className="space-y-4">
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                    Similarity Metadata
                  </span>

                  {selectedWord ? (
                    <div className="space-y-4">
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 text-[10px] uppercase font-mono block">Selected Entity</span>
                        <span className="text-lg font-bold text-brandPurple mt-0.5 block">{selectedWord}</span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-zinc-400 font-semibold text-xs block">Nearest Neighbors (Cosine Dist)</span>
                        {neighbors.map((n) => (
                          <div key={n.name} className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-900 text-xs">
                            <span className="text-zinc-300 font-semibold">{n.name}</span>
                            <span className="font-mono text-zinc-500">{n.distance} units</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-zinc-500 text-xs flex flex-col items-center justify-center gap-2">
                      <Compass className="w-8 h-8 text-zinc-600 animate-spin" style={{ animationDuration: '6s' }} />
                      <span>Select or drag any word on the coordinate space to analyze neighbor weights.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                    Clustering Insights
                  </span>

                  {isClustered ? (
                    <div className="space-y-3">
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                        <span className="text-brandPurple font-bold text-xs uppercase block">Group centroids</span>
                        <p className="text-zinc-300 text-xs leading-relaxed">
                          The vector engine grouped tickets into 4 distinct quadrants: Technical bugs (red), backend service latency incidents (yellow), feature requests (green), and layout enhancements (cyan).
                        </p>
                      </div>

                      <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Classification Accuracy:</span>
                        <span className="text-brandGreen font-bold font-mono">98.4%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-zinc-500 text-xs">
                      Click "Run Clustering Algorithm" to watch raw text queries sort themselves into logical segments based on semantic similarity.
                    </div>
                  )}
                </div>
              )
            ) : (
              /* Custom Input Sidebar Details */
              <div className="space-y-4">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                  Custom Similarity Metadata
                </span>

                {selectedCustomWord ? (
                  <div className="space-y-4">
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 text-[10px] uppercase font-mono block">Selected Entity</span>
                      <span className="text-lg font-bold text-brandPurple mt-0.5 block">{selectedCustomWord}</span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-zinc-400 font-semibold text-xs block">Nearest Neighbors (Cosine Dist)</span>
                      {neighbors.length > 0 ? (
                        neighbors.map((n) => (
                          <div key={n.name} className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-900 text-xs">
                            <span className="text-zinc-300 font-semibold">{n.name}</span>
                            <span className="font-mono text-zinc-500">{n.distance} units</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500 block italic">No other words to compare.</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-6 text-zinc-500 text-xs flex flex-col items-center justify-center gap-2 border border-dashed border-zinc-800 rounded-xl p-3 bg-zinc-950/20">
                      <Compass className="w-8 h-8 text-zinc-600 animate-spin" style={{ animationDuration: '8s' }} />
                      <span>Select or drag custom word to find nearest semantic matches.</span>
                    </div>

                    {customClusteringEnabled && (
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                        <span className="text-brandPurple font-bold text-xs uppercase block">Semantic Clusters</span>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {[1, 2, 3, 4].map((clusterNum) => {
                            const clusterItems = customWords.filter(cw => cw.cluster === clusterNum)
                            if (clusterItems.length === 0) return null
                            const colors = ["text-brandPurple", "text-brandCyan", "text-brandGreen", "text-brandAmber"]
                            return (
                              <div key={clusterNum} className="text-[11px] leading-relaxed">
                                <span className={`font-bold uppercase ${colors[clusterNum - 1]}`}>Cluster {clusterNum}:</span>{" "}
                                <span className="text-zinc-300">{clusterItems.map(item => item.name).join(', ')}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-zinc-800 pt-3 text-xs text-zinc-500 flex justify-between font-mono">
              <span>Embedding Engine:</span>
              <span>text-embedding-3</span>
            </div>
          </div>
        </div>

        <PMInsight 
          concept="Semantic Vector Spaces"
          source="Mikolov et al., 'Distributed Representations of Words and Phrases and their Compositionality' (NeurIPS 2013)"
          quote="Word representations can capture syntactic and semantic regularities. For example, vector('King') - vector('Man') + vector('Woman') results in a vector closest to Queen."
          takeaway="Embeddings map meaning to math. PMs should utilize embeddings for semantic search, recommendation engines, and user clustering. Because embeddings capture bias present in the training set (e.g., gender roles), PMs must design bias-mitigation filters when matching candidate resumes or recommending content."
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-4 flex justify-end">
        <button
          onClick={() => completeSection(5)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brandGreen text-white text-sm font-semibold rounded-lg hover:bg-brandGreen/90 glow-green transition-colors"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Mark Section Completed</span>
        </button>
      </div>
    </div>
  )
}
