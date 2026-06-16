import React from 'react'
import { BrainCircuit } from 'lucide-react'
import { motion } from 'framer-motion'

export default function KarpathyInsight({ text }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden bg-slate-950 border border-brandPurple/30 rounded-xl p-4 my-4 glow-purple"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-brandPurple/5 rounded-full blur-xl pointer-events-none" />
      <div className="flex items-start gap-3">
        <div className="p-2 bg-brandPurple/20 text-brandPurple rounded-lg mt-0.5">
          <BrainCircuit className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider text-brandPurple font-semibold">
            Karpathy Insight
          </span>
          <p className="text-zinc-300 text-sm mt-1 leading-relaxed italic">
            "{text}"
          </p>
        </div>
      </div>
    </motion.div>
  )
}
