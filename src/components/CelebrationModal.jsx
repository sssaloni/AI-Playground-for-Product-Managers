import React, { useState, useEffect, useRef } from 'react'
import { X, Download, Share2, Award, Sparkles, Check } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import confetti from 'canvas-confetti'

export default function CelebrationModal() {
  const { showBadgeModal, setShowBadgeModal, userEmail } = useAppStore()
  const [copied, setCopied] = useState(false)
  
  // Try to parse name from email as default
  const getDefaultName = () => {
    if (!userEmail) return 'Saloni Malhotra'
    const namePart = userEmail.split('@')[0]
    // split by dot, underscore, or dash
    const parts = namePart.split(/[._-]/)
    return parts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  const [name, setName] = useState(getDefaultName())
  const canvasRef = useRef(null)

  useEffect(() => {
    if (showBadgeModal) {
      // Trigger confetti!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      })
      
      // Secondary blast
      const timer = setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        })
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        })
      }, 400)

      return () => clearTimeout(timer)
    }
  }, [showBadgeModal])

  // Redraw canvas whenever the name changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // 1. Clear & Background Gradient
    const bgGrad = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, width*0.75)
    bgGrad.addColorStop(0, '#1a103c') // deep violet
    bgGrad.addColorStop(0.6, '#080512') // midnight purple
    bgGrad.addColorStop(1, '#020104') // near black
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, width, height)

    // 2. Subtle Tech Grid Pattern
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.03)'
    ctx.lineWidth = 1
    const gridSize = 40
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Concentric rings in background
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.035)'
    ctx.lineWidth = 1
    for (let r = 150; r <= 550; r += 100) {
      ctx.beginPath()
      ctx.arc(width/2, height/2, r, 0, Math.PI * 2)
      ctx.stroke()
    }

    // 3. Holographic Gradient Border
    const borderGrad = ctx.createLinearGradient(0, 0, width, height)
    borderGrad.addColorStop(0, '#8b5cf6') // Purple
    borderGrad.addColorStop(0.25, '#3b82f6') // Blue
    borderGrad.addColorStop(0.5, '#06b6d4') // Cyan
    borderGrad.addColorStop(0.75, '#f59e0b') // Amber
    borderGrad.addColorStop(1, '#10b981') // Green

    ctx.strokeStyle = borderGrad
    ctx.lineWidth = 20
    ctx.strokeRect(10, 10, width - 20, height - 20)

    // Inner gold border line
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)'
    ctx.lineWidth = 2
    ctx.strokeRect(28, 28, width - 56, height - 56)

    // Corner Ornaments (Gold)
    const drawCorner = (cx, cy, dx, dy) => {
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(cx, cy + dy * 35)
      ctx.lineTo(cx, cy)
      ctx.lineTo(cx + dx * 35, cy)
      ctx.stroke()
    }
    drawCorner(36, 36, 1, 1)
    drawCorner(width - 36, 36, -1, 1)
    drawCorner(36, height - 36, 1, -1)
    drawCorner(width - 36, height - 36, -1, -1)

    // 4. Header Section
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Glowing text effect for Header
    ctx.shadowColor = 'rgba(168, 85, 247, 0.6)'
    ctx.shadowBlur = 12
    ctx.fillStyle = '#c084fc' // Light purple
    ctx.font = 'bold 22px "Outfit", "Inter", "Montserrat", sans-serif'
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '6px'
    ctx.fillText('CERTIFICATE OF COMPLETION', width / 2, 170)
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px'
    
    // Reset shadow
    ctx.shadowBlur = 0

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
    ctx.font = '16px "Inter", sans-serif'
    ctx.fillText('This credentials verify that the recipient has completed', width / 2, 220)

    // 5. Presentee Details
    ctx.fillStyle = '#06b6d4' // Brand Cyan
    ctx.font = 'bold 15px "Outfit", "Inter", sans-serif'
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '2px'
    ctx.fillText('PROUDLY PRESENTED TO', width / 2, 285)
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px'

    // Name text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 50px "Outfit", "Inter", "Montserrat", sans-serif'
    ctx.fillText(name.toUpperCase(), width / 2, 340)

    // Gradient Divider Line
    const divGrad = ctx.createLinearGradient(width/2 - 180, 0, width/2 + 180, 0)
    divGrad.addColorStop(0, 'rgba(6, 182, 212, 0)')
    divGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.75)')
    divGrad.addColorStop(1, 'rgba(6, 182, 212, 0)')
    ctx.fillStyle = divGrad
    ctx.fillRect(width/2 - 180, 380, 360, 2)

    // 6. Workshop info
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
    ctx.font = '15px "Inter", sans-serif'
    ctx.fillText('for successfully mastering the curriculum of', width / 2, 415)

    // Title of Workshop
    const titleGrad = ctx.createLinearGradient(width/2 - 250, 0, width/2 + 250, 0)
    titleGrad.addColorStop(0, '#c084fc')
    titleGrad.addColorStop(0.5, '#ffffff')
    titleGrad.addColorStop(1, '#6366f1')
    ctx.fillStyle = titleGrad
    ctx.font = 'extrabold 42px "Outfit", "Inter", "Montserrat", sans-serif'
    ctx.fillText('INSIDE THE MIND OF AN LLM', width / 2, 465)

    ctx.fillStyle = '#10b981' // Green
    ctx.font = '600 15px "Inter", sans-serif'
    ctx.fillText('An Interactive Product Manager’s AI Simulator Workshop', width / 2, 510)

    // 7. Gold Seal Badge
    const sealX = width / 2
    const sealY = 640
    
    // Outer seal circle
    ctx.shadowColor = 'rgba(245, 158, 11, 0.3)'
    ctx.shadowBlur = 15
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(sealX, sealY, 50, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0 // reset

    // Seal interior
    ctx.fillStyle = 'rgba(245, 158, 11, 0.08)'
    ctx.beginPath()
    ctx.arc(sealX, sealY, 46, 0, Math.PI * 2)
    ctx.fill()

    // Seal text
    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 11px "Outfit", "Inter", sans-serif'
    ctx.fillText('SELF-TAUGHT', sealX, sealY - 11)
    ctx.fillText('LEARNER', sealX, sealY + 13)

    // Star icon inside seal
    ctx.font = '15px "Inter", sans-serif'
    ctx.fillText('★ ★ ★', sealX, sealY + 1)

    // 8. Signatures & Date
    const footerY = 820

    // Date
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '13px "Inter", sans-serif'
    ctx.fillText('DATE OF ISSUE', width * 0.25, footerY)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 15px "Outfit", "Inter", sans-serif'
    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
    ctx.fillText(today, width * 0.25, footerY + 25)

    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(width * 0.25 - 75, footerY + 10)
    ctx.lineTo(width * 0.25 + 75, footerY + 10)
    ctx.stroke()

    // Instructor
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '13px "Inter", sans-serif'
    ctx.fillText('INSTRUCTOR', width * 0.75, footerY)
    
    ctx.fillStyle = '#f59e0b' // gold signature style
    ctx.font = 'italic bold 20px "Georgia", serif'
    ctx.fillText('Saloni Malhotra', width * 0.75, footerY + 25)

    ctx.beginPath()
    ctx.moveTo(width * 0.75 - 75, footerY + 10)
    ctx.lineTo(width * 0.75 + 75, footerY + 10)
    ctx.stroke()

    // 9. Verification footer link
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.font = '11px "Inter", sans-serif'
    ctx.fillText('Credential verification: saloni-malhotra.com/ai-playground | ID: LRN-' + Math.random().toString(36).substr(2, 6).toUpperCase(), width / 2, 920)

  }, [name, showBadgeModal])

  if (!showBadgeModal) return null

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${name.toLowerCase().replace(/\s+/g, '-')}-ai-learner-badge.png`
    link.href = url
    link.click()
  }

  const handleShareLinkedIn = () => {
    const postText = `I just completed the 'Inside the Mind of an LLM' interactive workshop! 🚀 I learned about tokenization, embeddings, temperature, attention mechanisms, RAG strategies, and AI agent architectures. Feeling ready to build and evaluate production-grade generative AI products! 💡 #AI #ProductManagement #GenerativeAI #ContinuousLearning`
    
    navigator.clipboard.writeText(postText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
      window.open('https://www.linkedin.com/feed/', '_blank')
    }).catch(err => {
      console.error('Failed to copy text: ', err)
      window.open('https://www.linkedin.com/feed/', '_blank')
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 backdrop-blur-md overflow-y-auto p-4 md:p-6 select-none animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-stretch overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brandPurple/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brandCyan/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Close Button */}
        <button 
          onClick={() => setShowBadgeModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Badge Preview */}
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950/50 border border-zinc-850 rounded-xl p-4 relative">
          <canvas 
            ref={canvasRef} 
            width={1000} 
            height={1000}
            className="w-full max-w-sm aspect-square bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl"
          />
          <div className="flex items-center gap-1 mt-3 text-zinc-500 text-[10px] uppercase tracking-wide font-mono">
            <Sparkles className="w-3.5 h-3.5 text-brandYellow" />
            <span>High-Resolution PNG Canvas Preview</span>
          </div>
        </div>

        {/* Right Side: Configuration & Actions */}
        <div className="w-full md:w-96 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brandPurple/20 text-brandPurple rounded-xl border border-brandPurple/30">
                <Award className="w-6 h-6 text-brandYellow fill-brandYellow/10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Workshop Accomplished!</h3>
                <p className="text-xs text-zinc-400">You completed 100% of the workshop.</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs text-zinc-400 font-semibold uppercase block">Certificate Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name" 
                className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-brandPurple focus:ring-1 focus:ring-brandPurple rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-650 transition-all font-sans focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500 block leading-tight">
                This name will be painted in elegant gold/white uppercase typography directly onto the downloadable certificate.
              </span>
            </div>

            <div className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-xl space-y-2 text-xs leading-relaxed text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brandPurple block">Self-Taught Achievement</span>
              <p>
                By completing all 15 modules, you have mastered token calculations, embedding models, vector search dynamics, context chunk limits, and AI safety templates.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Download Action */}
            <button 
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-brandGreen text-white text-xs font-bold rounded-xl hover:bg-brandGreen/90 glow-green transition-all cursor-pointer hover:scale-[1.01]"
            >
              <Download className="w-4 h-4" />
              <span>Download Badge PNG</span>
            </button>

            {/* LinkedIn Action */}
            <button 
              onClick={handleShareLinkedIn}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-350 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-brandGreen stroke-[3]" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? "LinkedIn Post Copied!" : "Share on LinkedIn"}</span>
            </button>
            
            {copied && (
              <p className="text-[10px] text-brandGreen text-center font-semibold animate-pulse">
                Text copied! Go ahead and paste it on LinkedIn.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
