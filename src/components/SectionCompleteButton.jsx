import React from 'react'
import { Check, Play } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export default function SectionCompleteButton({ sectionId, label = "Mark Section Completed" }) {
  const { completedSections, completeSection } = useAppStore()
  const isCompleted = completedSections.includes(sectionId)

  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 px-5 py-2.5 bg-brandGreen/10 border border-brandGreen/35 text-brandGreen text-sm font-semibold rounded-lg select-none cursor-default glow-green/10 transition-all duration-300">
        <Check className="w-4 h-4 stroke-[3]" />
        <span>Completed</span>
      </div>
    )
  }

  return (
    <button
      onClick={() => completeSection(sectionId)}
      className="flex items-center gap-2 px-5 py-2.5 bg-brandGreen text-white text-sm font-semibold rounded-lg hover:bg-brandGreen/90 glow-green transition-all duration-200 cursor-pointer active:scale-[0.98]"
    >
      <Play className="w-4 h-4 fill-white" />
      <span>{label}</span>
    </button>
  )
}
