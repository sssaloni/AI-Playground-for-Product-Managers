import { create } from 'zustand'

export const useAppStore = create((set) => ({
  activeSection: 1,
  completedSections: [],
  presenterMode: false,
  openaiKey: localStorage.getItem('openai_key') || '',
  
  // Capstone Challenge State
  capstone: {
    problem: '',
    user: '',
    prompt: '',
    knowledgeSource: '',
    successMetric: '',
    risks: '',
    feedbackLoop: '',
  },

  setSection: (id) => set({ activeSection: id }),
  
  togglePresenterMode: () => set((state) => ({ presenterMode: !state.presenterMode })),
  
  setOpenAIKey: (key) => {
    localStorage.setItem('openai_key', key)
    set({ openaiKey: key })
  },
  
  updateCapstone: (field, value) => set((state) => ({
    capstone: { ...state.capstone, [field]: value }
  })),

  completeSection: (id) => set((state) => {
    if (state.completedSections.includes(id)) return state;
    const updated = [...state.completedSections, id];
    return { completedSections: updated };
  }),

  resetProgress: () => set({
    completedSections: [],
    activeSection: 1,
    capstone: {
      problem: '',
      user: '',
      prompt: '',
      knowledgeSource: '',
      successMetric: '',
      risks: '',
      feedbackLoop: '',
    }
  })
}))
