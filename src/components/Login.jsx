import React, { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Mail, Lock, ArrowRight, ShieldAlert, KeyRound, Brain, Zap, Users } from 'lucide-react'

// SparkleOutline SVG Component
const SparkleOutline = ({ className, size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M12 3C12 8 8 12 3 12C8 12 12 16 12 21C12 16 16 12 21 12C16 12 12 8 12 3Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
)

export default function Login() {
  const login = useAppStore((state) => state.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Force dark mode on mounting and restore theme on unmount
  useEffect(() => {
    const root = window.document.documentElement
    const hadLight = root.classList.contains('light')
    if (hadLight) {
      root.classList.remove('light')
    }
    return () => {
      if (hadLight) {
        root.classList.add('light')
      }
    }
  }, [])

  // Clean email input and check if it requires presenter password
  const cleanEmail = email.trim().toLowerCase()
  const isPresenterEmail = cleanEmail === 'sssalonimalhotra@gmail.com'

  useEffect(() => {
    if (isPresenterEmail) {
      setShowPassword(true)
    } else {
      setShowPassword(false)
      setPassword('') // Clear password if they backspace or change email
    }
    setError('')
  }, [email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Please enter your email address.')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    if (isPresenterEmail && !password) {
      setError('Password is required for presenter access.')
      return
    }

    setIsSubmitting(true)

    // Call Supabase API to log email address
    try {
      await fetch('https://lttdffetbxmnxbhcmqeq.supabase.co/rest/v1/workshop_logins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dGRmZmV0YnhtbnhiaGNtcWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDAwODgsImV4cCI6MjA5Nzc3NjA4OH0.KH4raNmEtkYV5bfBPjvUgfFxK1BjCZ_A3TwWqvN1hh8',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dGRmZmV0YnhtbnhiaGNtcWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDAwODgsImV4cCI6MjA5Nzc3NjA4OH0.KH4raNmEtkYV5bfBPjvUgfFxK1BjCZ_A3TwWqvN1hh8',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ email: cleanEmail })
      })
    } catch (err) {
      console.error('Failed to log email to Supabase:', err)
    }

    // Add a slight delay for smooth transition and premium loading feel
    setTimeout(() => {
      const result = login(cleanEmail, password)
      setIsSubmitting(false)
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.')
      }
    }, 800)
  }


  return (
    <div className="min-h-screen w-screen bg-zinc-950 flex flex-col items-center justify-between py-6 px-4 md:px-8 relative overflow-y-auto font-sans text-zinc-100 selection:bg-brandPurple/30 select-none">
      
      {/* Decorative Glows & Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brandPurple/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brandCyan/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-brandAmber/5 blur-[100px] pointer-events-none" />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

      {/* Navbar Header */}
      <header className="w-full max-w-6xl flex items-center justify-between z-20 py-4 border-b border-zinc-900/60 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">
            AI Product Playground
          </span>
        </div>
        <a 
          href="https://salonimalhotra.cv/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 hover:border-zinc-700 hover:text-white transition-all shadow-md font-medium"
        >
          <span>Created by Saloni Malhotra</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </header>

      {/* Main Content Arena */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center z-10 py-12 lg:py-16 my-auto">
        
        {/* Left Column: Hero Content & Login Form */}
        <div className="lg:col-span-7 flex flex-col text-left">
          
          <div className="relative mb-6 inline-block">
            {/* Sparkles decorations absolute relative to title */}
            <SparkleOutline className="absolute left-[-24px] top-[-16px] text-violet-500/80 animate-pulse" size={20} />
            <SparkleOutline className="absolute right-[15%] top-[-24px] text-teal-400/80 animate-pulse" size={16} />
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] relative">
              Welcome to the <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">
                AI Product Playground
              </span>
            </h1>
          </div>

          <p className="text-zinc-400 text-base sm:text-lg max-w-xl leading-relaxed font-medium">
            A hands-on space for PMs to explore AI concepts, test ideas, and build the future.
          </p>

          {/* Embedded Login Form */}
          <div className="mt-10 max-w-md w-full bg-zinc-900/30 border border-zinc-900/60 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
            <h2 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2">
              👋 Let's get started
            </h2>
            <p className="text-zinc-400 text-xs mb-5 leading-relaxed">
              Enter your work email to access the interactive workshop.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Work Email
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500 group-focus-within:text-brandPurple transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    disabled={isSubmitting}
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-brandPurple focus:ring-1 focus:ring-brandPurple/30 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Presenter Password Field with CSS height/opacity transition */}
              <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  showPassword ? 'max-h-28 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <div className="space-y-2 pt-1 text-left">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-xs font-semibold text-brandAmber uppercase tracking-wider flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      Presenter Password
                    </label>
                    <span className="text-[10px] text-brandAmber/80 font-medium">
                      Authorized Mode Required
                    </span>
                  </div>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500 group-focus-within:text-brandAmber transition-colors">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required={showPassword}
                      disabled={isSubmitting}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-brandAmber focus:ring-1 focus:ring-brandAmber/30 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-400 animate-shake">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white bg-gradient-to-r transition-all duration-300 transform active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                  showPassword 
                    ? 'from-brandAmber to-amber-600 hover:shadow-lg hover:shadow-brandAmber/20 glow-amber' 
                    : 'from-brandPurple to-indigo-600 hover:shadow-lg hover:shadow-brandPurple/20 glow-purple'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Entering playground...</span>
                  </div>
                ) : (
                  <>
                    <span>Enter Playground</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Secure badge */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-500 font-medium">
              <span>🔒</span>
              <span>Secure. Private. For PMs only.</span>
            </div>
          </div>

        </div>

        {/* Right Column: Key Features & Instructor Bio */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          
          {/* Core Value Props List */}
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6 text-left relative">
            <SparkleOutline className="absolute right-4 bottom-4 text-violet-500/40 animate-pulse" size={24} />
            
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Core Pillars
            </h3>

            {/* Feature 1 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-950/20 border border-purple-900/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-200">Learn by doing</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Interact with key AI concepts like tokenizers, attention layers, temperatures, and RAG in real time.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-200">Risk-free experimentation</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Modify hyperparameters and custom data sets safely inside visual interactive testing environments.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/20 border border-indigo-900/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-200">Built for PMs</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Focus entirely on core product intuition, technical vocabulary, and design trade-offs.
                </p>
              </div>
            </div>
          </div>

          {/* Instructor Bio Card */}
          <a 
            href="https://salonimalhotra.cv/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="creator-card block bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-left group"
          >
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-brandCyan/40 to-transparent" />
            
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                Instructor & Creator
              </p>
              <span className="text-[9px] bg-brandPurple/20 text-brandPurple px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                Product Leader
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brandPurple to-brandCyan flex items-center justify-center text-white-force font-extrabold text-base shrink-0 border border-white/10 shadow-md">
                SM
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-zinc-100 group-hover:text-brandPurple transition-colors">
                  Saloni Malhotra
                </h4>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">
                  Product Leader driving Enterprise AI Platforms & Developer Infrastructure | B2B SaaS | ex-Oracle, Unilever | XLRI Jamshedpur
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-900/60 flex items-center justify-between text-xs text-brandCyan font-semibold">
              <span>Visit Website</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-zinc-500 group-hover:text-brandCyan/80 transition-colors">salonimalhotra.cv</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </a>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl text-center py-6 border-t border-zinc-900/60 shrink-0 z-10">
        <p className="text-zinc-500 text-xs">
          © AI Product Playground. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
