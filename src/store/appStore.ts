import { create } from 'zustand'

interface AppStore {
  isDarkMode: boolean
  toggleDarkMode: () => void
  language: 'en' | 'ar' | 'fr'
  setLanguage: (lang: 'en' | 'ar' | 'fr') => void
}

export const useAppStore = create<AppStore>((set) => ({
  isDarkMode: true,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
}))
