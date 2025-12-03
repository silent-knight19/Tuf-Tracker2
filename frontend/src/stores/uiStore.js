import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      modalOpen: false,
      modalContent: null,

      // Toggle theme
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'dark' ? 'light' : 'dark' 
      })),

      // Toggle sidebar
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),

      // Open modal
      openModal: (content) => set({ 
        modalOpen: true, 
        modalContent: content 
      }),

      // Close modal
      closeModal: () => set({ 
        modalOpen: false, 
        modalContent: null 
      }),
    }),
    {
      name: 'ui-storage',
    }
  )
);
