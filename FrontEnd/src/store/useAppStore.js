import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set) => ({
      // Theme State
      isDarkMode: false,
      toggleTheme: () => set((state) => {
        const newTheme = !state.isDarkMode;
        if (newTheme) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        return { isDarkMode: newTheme };
      }),
      setTheme: (isDark) => set(() => {
        if (isDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        return { isDarkMode: isDark };
      }),

      // Currency State
      currency: 'INR', // Default
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'spendsense-app-storage', // unique name
      // Only persist certain fields
      partialize: (state) => ({ isDarkMode: state.isDarkMode, currency: state.currency }),
    }
  )
);

export default useAppStore;
