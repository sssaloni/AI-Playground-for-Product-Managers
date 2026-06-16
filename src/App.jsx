import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import { useAppStore } from './store/useAppStore'
import { Sun, Moon } from 'lucide-react'

// Import Sections
import WhyAIMatters from './sections/WhyAIMatters'
import EvolutionOfAI from './sections/EvolutionOfAI'
import NextTokenPredictor from './sections/NextTokenPredictor'
import TokenizerVisualizer from './sections/TokenizerVisualizer'
import EmbeddingExplorer from './sections/EmbeddingExplorer'
import TemperaturePlayground from './sections/TemperaturePlayground'
import AttentionSimulator from './sections/AttentionSimulator'
import HallucinationLab from './sections/HallucinationLab'
import PromptBuilder from './sections/PromptBuilder'
import RAGSimulator from './sections/RAGSimulator'
import RAG from './sections/RAG'
import ProductAssistant from './sections/ProductAssistant'
import AIArchitecture from './sections/AIArchitecture'
import CapstoneChallenge from './sections/CapstoneChallenge'
import InsideChatGPT from './sections/InsideChatGPT'
import ResponseGenerator from './sections/ResponseGenerator'

function App() {
  const { activeSection, presenterMode } = useAppStore()
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
    } else {
      root.classList.remove('light')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const renderSection = (id) => {
    switch (id) {
      case 1: return <WhyAIMatters />
      case 2: return <EvolutionOfAI />
      case 3: return <NextTokenPredictor />
      case 4: return <TokenizerVisualizer />
      case 5: return <EmbeddingExplorer />
      case 6: return <TemperaturePlayground />
      case 7: return <AttentionSimulator />
      case 8: return <HallucinationLab />
      case 9: return <PromptBuilder />
      case 10: return <RAGSimulator />
      case 16: return <RAG />
      case 11: return <ProductAssistant />
      case 12: return <AIArchitecture />
      case 13: return <CapstoneChallenge />
      case 14: return <InsideChatGPT />
      case 15: return <ResponseGenerator />
      default: return <WhyAIMatters />
    }
  }

  return (
    <div className="flex w-screen h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar Panel */}
      <Sidebar />

      {/* Main Content Arena */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 font-mono text-xs uppercase">Learning Module</span>
            <span className="text-zinc-300 font-bold text-sm">/</span>
            <span className="text-brandPurple font-semibold text-sm">
              Section {activeSection}: {
                activeSection === 1 ? 'Why AI Matters' :
                activeSection === 2 ? 'Evolution of AI' :
                activeSection === 3 ? 'Next Token Predictor' :
                activeSection === 4 ? 'Tokenizer Visualizer' :
                activeSection === 5 ? 'Embedding Explorer' :
                activeSection === 6 ? 'Temperature Playground' :
                activeSection === 7 ? 'Attention Simulator' :
                activeSection === 8 ? 'Hallucination Lab' :
                activeSection === 9 ? 'Prompt Builder' :
                activeSection === 10 ? 'RAG Simulator' :
                activeSection === 16 ? 'RAG Masterclass' :
                activeSection === 11 ? 'Product Assistant Builder' :
                activeSection === 12 ? 'AI Product Architecture' :
                activeSection === 13 ? 'Capstone Challenge' :
                activeSection === 15 ? 'Response Generator' :
                'Inside ChatGPT (Secret)'
              }
            </span>
          </div>

          <div className="flex items-center gap-3">
            {presenterMode && (
              <div className="bg-brandAmber/20 border border-brandAmber/40 text-brandAmber text-[10px] uppercase font-bold px-3 py-1 rounded-full animate-pulse">
                Presenter Mode Active (Projector Font Scale Enabled)
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-brandAmber" /> : <Moon className="w-4 h-4 text-brandPurple" />}
            </button>
          </div>
        </header>

        {/* Dynamic content rendering container with font-scaling wrapper */}
        <main 
          className={`flex-1 overflow-y-auto presenter-scale-transition ${
            presenterMode 
              ? 'p-10 text-lg max-w-7xl mx-auto w-full leading-relaxed' 
              : 'p-6 max-w-5xl mx-auto w-full'
          }`}
        >
          <div className={`${presenterMode ? 'space-y-8 font-medium' : 'space-y-6'}`}>
            {renderSection(activeSection)}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
