import React from 'react'
import { Megaphone, AlertCircle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export default function PresenterNotes({ notes, duration = "15 mins", exercise }) {
  const presenterMode = useAppStore((state) => state.presenterMode)

  if (!presenterMode) return null

  return (
    <div className="bg-amber-950/20 border border-brandAmber/40 rounded-xl p-5 my-4">
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-brandAmber/10 text-brandAmber rounded-lg mt-0.5">
          <Megaphone className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h5 className="text-brandAmber font-bold text-sm tracking-wide uppercase">
              Presenter Guide / Lecture Script
            </h5>
            <span className="bg-brandAmber/20 text-brandAmber text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {duration} Allocation
            </span>
          </div>
          
          <div className="mt-3 space-y-3 text-sm text-zinc-300">
            <div>
              <span className="font-semibold text-zinc-100 block">How to Explain This Screen:</span>
              <p className="mt-0.5 leading-relaxed italic">{notes}</p>
            </div>
            
            {exercise && (
              <div className="border-t border-brandAmber/20 pt-3 mt-3">
                <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-brandAmber" /> Live Classroom Exercise:
                </span>
                <p className="mt-0.5 leading-relaxed text-zinc-400">{exercise}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
