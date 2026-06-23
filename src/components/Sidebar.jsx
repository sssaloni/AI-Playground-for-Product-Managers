import React, { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { 
  History, Sparkles, Binary, Sliders, Hash, Map, 
  Compass, AlertTriangle, Eye, RefreshCw, Presentation, GraduationCap,
  Layers, Hammer, Award, HelpCircle, Play, Database,
  ChevronLeft, ChevronRight, LogOut
} from 'lucide-react'

const sections = [
  { id: 1, name: 'Why AI Matters', icon: History },
  { id: 2, name: 'Evolution of AI', icon: Sparkles },
  { id: 3, name: 'Next Token Predictor', icon: Binary },
  { id: 4, name: 'Tokenizer Visualizer', icon: Hash },
  { id: 5, name: 'Embedding Explorer', icon: Compass },
  { id: 6, name: 'Temperature Playground', icon: Sliders },
  { id: 15, name: 'Response Generator', icon: Play },
  { id: 7, name: 'Attention Simulator', icon: Eye },
  { id: 8, name: 'Hallucination Lab', icon: AlertTriangle },
  { id: 9, name: 'Prompt Builder', icon: Hammer },
  { id: 16, name: 'RAG Masterclass', icon: Database },
  { id: 10, name: 'RAG Simulator', icon: Map },
  { id: 11, name: 'Product Assistant Builder', icon: GraduationCap },
  { id: 12, name: 'AI Product Architecture', icon: Layers },
  { id: 13, name: 'Capstone Challenge', icon: Award },
  { id: 14, name: 'Inside ChatGPT (Secret)', icon: HelpCircle, isSecret: true },
]

export default function Sidebar() {
  const { 
    activeSection, 
    setSection, 
    completedSections, 
    presenterMode, 
    togglePresenterMode, 
    resetProgress,
    isPresenter,
    logout,
    setShowBadgeModal
  } = useAppStore()

  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true')

  const handleToggleCollapse = (val) => {
    setIsCollapsed(val)
    localStorage.setItem('sidebar-collapsed', val ? 'true' : 'false')
  }

  // Calculate percentage progress
  const totalSteps = sections.filter(s => !s.isSecret).length
  const completedCount = completedSections.filter(id => sections.some(s => s.id === id && !s.isSecret)).length
  const progressPercent = Math.min(100, Math.round((completedCount / totalSteps) * 100))

  return (
    <div className={`h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between shrink-0 select-none transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-80'}`}>
      {/* Sidebar Header */}
      {isCollapsed ? (
        <div className="p-4 border-b border-zinc-800 flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-brandPurple flex items-center justify-center text-white font-extrabold text-sm glow-purple cursor-pointer" onClick={() => handleToggleCollapse(false)} title="Expand Sidebar">
            AI
          </div>
          <button 
            onClick={() => handleToggleCollapse(false)} 
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brandPurple flex items-center justify-center text-white font-extrabold text-sm glow-purple">
                AI
              </div>
              <div>
                <h1 className="text-zinc-100 font-bold tracking-tight text-sm">
                  Inside the Mind of an LLM
                </h1>
                <p className="text-zinc-500 text-xs mt-0.5">
                  Interactive PM Workshop
                </p>
              </div>
            </div>
            <button 
              onClick={() => handleToggleCollapse(true)} 
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-zinc-400">Workshop Progress</span>
              <span className="text-brandPurple">{progressPercent}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-brandPurple h-full transition-all duration-500 ease-out glow-purple"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {progressPercent === 100 && (
              <button
                onClick={() => setShowBadgeModal(true)}
                className="mt-3.5 w-full flex items-center justify-center gap-1.5 py-2 bg-brandPurple/20 hover:bg-brandPurple/35 border border-brandPurple/50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer animate-pulse"
              >
                <Award className="w-4 h-4 text-brandYellow fill-brandYellow/15" />
                <span>Claim Completion Badge</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className={`flex-1 overflow-y-auto py-4 space-y-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          const isCompleted = completedSections.includes(section.id)
          
          if (section.isSecret && completedCount < totalSteps) {
            // Hide the secret section until all other sections are completed
            return null
          }

          return (
            <button
              key={section.id}
              onClick={() => setSection(section.id)}
              className={`w-full flex items-center rounded-lg transition-all duration-200 group cursor-pointer ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5 text-left'
              } ${
                isActive 
                  ? 'bg-brandPurple text-white font-semibold glow-purple' 
                  : section.isSecret 
                    ? 'text-brandCyan hover:bg-brandCyan/10 border border-dashed border-brandCyan/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
              title={isCollapsed ? section.name : undefined}
            >
              <div className={`p-1.5 rounded-md shrink-0 ${
                isActive 
                  ? 'bg-white/20 text-white' 
                  : section.isSecret
                    ? 'bg-brandCyan/20 text-brandCyan'
                    : isCompleted
                      ? 'bg-brandGreen/20 text-brandGreen'
                      : 'bg-zinc-900 text-zinc-400 group-hover:text-zinc-300'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">{section.name}</p>
                </div>
              )}

              {!isCollapsed && isCompleted && !isActive && (
                <div className="w-2 h-2 rounded-full bg-brandGreen" />
              )}
            </button>
          )
        })}
      </div>

      {/* Sidebar Footer Controls */}
      {isCollapsed ? (
        <div className="p-2 border-t border-zinc-800 bg-zinc-950/80 flex flex-col items-center gap-3 py-4">
          {isPresenter && (
            <button
              onClick={togglePresenterMode}
              className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                presenterMode 
                  ? 'bg-brandAmber/15 text-brandAmber border border-brandAmber/30 glow-amber' 
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-850'
              }`}
              title={`Switch to ${presenterMode ? 'Student' : 'Presenter'} Mode`}
            >
              <Presentation className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              if (confirm("Reset all workshop progress and answers?")) {
                resetProgress()
              }
            }}
            className="p-2 text-zinc-500 hover:text-red-400 rounded hover:bg-red-950/10 transition-colors cursor-pointer"
            title="Reset Workshop State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to log out?")) {
                logout()
              }
            }}
            className="p-2 text-zinc-500 hover:text-red-450 rounded hover:bg-red-950/10 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 space-y-2.5">
          {/* Presenter mode toggle */}
          {isPresenter && (
            <button
              onClick={togglePresenterMode}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                presenterMode 
                  ? 'bg-brandAmber/15 text-brandAmber border-brandAmber/30 glow-amber' 
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850'
              }`}
            >
              <div className="flex items-center gap-2">
                <Presentation className="w-4 h-4" />
                <span>Workshop Mode</span>
              </div>
              <span className="text-[10px] uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                {presenterMode ? 'Presenter' : 'Student'}
              </span>
            </button>
          )}

          {/* Reset progress */}
          <button
            onClick={() => {
              if (confirm("Reset all workshop progress and answers?")) {
                resetProgress()
              }
            }}
            className="w-full flex items-center gap-2 justify-center px-3 py-2 text-zinc-500 hover:text-red-400 text-xs rounded hover:bg-red-950/10 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Workshop State</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              if (confirm("Are you sure you want to log out?")) {
                logout()
              }
            }}
            className="w-full flex items-center gap-2 justify-center px-3 py-2 text-zinc-500 hover:text-red-450 hover:bg-red-950/10 text-xs rounded transition-colors cursor-pointer border border-zinc-800/80 hover:border-red-950/30"
          >
            <LogOut className="w-3 h-3" />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  )
}
