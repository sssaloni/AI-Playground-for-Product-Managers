import React from 'react'
import { BookOpen, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PMInsight({ concept, source, quote, takeaway }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden bg-slate-950 border border-zinc-800 rounded-xl p-5 my-5 glow-green"
    >
      {/* Decorative background blur element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brandGreen/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-brandPurple/5 rounded-full blur-xl pointer-events-none" />
      
      <div className="flex items-start gap-4">
        {/* Academic icon badge */}
        <div className="p-2.5 bg-brandGreen/10 text-brandGreen rounded-xl border border-brandGreen/25 mt-0.5 shrink-0 shadow-sm shadow-brandGreen/10">
          <BookOpen className="w-5 h-5" />
        </div>
        
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-brandGreen/15 border border-brandGreen/30 text-brandGreen">
              PM Research Insight
            </span>
            <span className="text-zinc-400 text-xs font-semibold font-mono">
              // Topic: {concept}
            </span>
          </div>

          {/* Blockquote section */}
          {quote && (
            <div className="relative pl-4 border-l-2 border-brandPurple bg-zinc-900/30 py-3 px-4 rounded-r-lg">
              <p className="text-zinc-300 text-sm leading-relaxed italic font-serif">
                "{quote}"
              </p>
              {source && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 font-mono">
                  <span className="text-brandPurple font-bold">Source:</span>
                  <span>{source}</span>
                </div>
              )}
            </div>
          )}

          {/* Product Takeaway section */}
          <div className="space-y-1.5">
            <span className="text-brandGreen font-bold text-xs uppercase tracking-wider block font-mono">
              Product & Strategic Impact
            </span>
            <p className="text-zinc-300 text-sm leading-relaxed font-sans">
              {takeaway}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
