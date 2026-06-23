import { create } from 'zustand'

export const useAppStore = create((set) => ({
  activeSection: 1,
  completedSections: [],
  presenterMode: false,
  openaiKey: localStorage.getItem('openai_key') || '',
  userEmail: localStorage.getItem('user_email') || null,
  isPresenter: localStorage.getItem('is_presenter') === 'true',
  showBadgeModal: false,
  setShowBadgeModal: (val) => set({ showBadgeModal: val }),
  
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
    
    // Check if 100% progress of non-secret sections is reached
    const nonSecretIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16];
    const completedCount = updated.filter(sid => nonSecretIds.includes(sid)).length;
    const completedAll = completedCount === nonSecretIds.length;

    return { 
      completedSections: updated,
      showBadgeModal: completedAll ? true : state.showBadgeModal
    };
  }),

  resetProgress: () => set({
    completedSections: [],
    activeSection: 1,
    showBadgeModal: false,
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
