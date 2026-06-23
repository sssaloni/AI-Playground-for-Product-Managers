import { create } from 'zustand'

export const useAppStore = create((set) => ({
  activeSection: 1,
  completedSections: [],
  presenterMode: false,
  openaiKey: localStorage.getItem('openai_key') || '',
  userEmail: localStorage.getItem('user_email') || null,
  isPresenter: localStorage.getItem('is_presenter') === 'true',
  
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
  
  togglePresenterMode: () => set((state) => {
    if (!state.isPresenter) return { presenterMode: false };
    return { presenterMode: !state.presenterMode };
  }),
  
  setOpenAIKey: (key) => {
    localStorage.setItem('openai_key', key)
    set({ openaiKey: key })
  },

  login: (email, password) => {
    const cleanedEmail = (email || '').trim().toLowerCase();
    const isPresenterUser = cleanedEmail === 'sssalonimalhotra@gmail.com';
    if (isPresenterUser) {
      if (password === 'Saloni560048') {
        localStorage.setItem('user_email', cleanedEmail);
        localStorage.setItem('is_presenter', 'true');
        set({ userEmail: cleanedEmail, isPresenter: true });
        return { success: true };
      } else {
        return { success: false, error: 'Incorrect password for presenter access.' };
      }
    } else {
      localStorage.setItem('user_email', cleanedEmail);
      localStorage.setItem('is_presenter', 'false');
      set({ userEmail: cleanedEmail, isPresenter: false, presenterMode: false });
      return { success: true };
    }
  },

  logout: () => {
    localStorage.removeItem('user_email');
    localStorage.removeItem('is_presenter');
    set({ userEmail: null, isPresenter: false, presenterMode: false });
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
