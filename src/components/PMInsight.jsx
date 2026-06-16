import React from 'react'
import { Landmark, AlertTriangle, Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PMInsight({ title = "PM Takeaway", decision, impact }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-950 border border-brandGreen/30 rounded-xl p-5 my-4 glow-green"
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-brandGreen/10 text-brandGreen rounded-lg">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-zinc-100 font-bold text-base tracking-wide flex items-center gap-2">
            {title}
          </h4>
          
          <div className="mt-3 space-y-2.5 text-sm">
            <div>
              <span className="text-brandGreen font-medium text-xs uppercase tracking-wider block">
                What to Care About
              </span>
              <p className="text-zinc-300 mt-0.5 leading-relaxed">
                {decision}
              </p>
            </div>
            
            {impact && (
              <div>
                <span className="text-zinc-400 font-medium text-xs uppercase tracking-wider block">
                  Product / UX Impact
                </span>
                <p className="text-zinc-400 mt-0.5 leading-relaxed">
                  {impact}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
