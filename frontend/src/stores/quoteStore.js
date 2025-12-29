import { create } from 'zustand';
import axios from 'axios';

const API_BAR_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useQuoteStore = create((set, get) => ({
  quotes: [],
  loading: false,
  error: null,

  fetchQuotes: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_BAR_URL}/quotes`);
      set({ quotes: response.data, loading: false });
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      set({ error: error.message, loading: false });
    }
  },

  getRandomQuote: (category = null) => {
    const { quotes } = get();
    if (quotes.length === 0) return null;
    
    let filtered = quotes;
    if (category) {
      filtered = quotes.filter(q => q.category === category);
    }
    
    if (filtered.length === 0) filtered = quotes; // Fallback
    
    return filtered[Math.floor(Math.random() * filtered.length)];
  },

  getQuoteByIndex: (index) => {
    const { quotes } = get();
    if (quotes.length === 0) return null;
    return quotes[index % quotes.length];
  }
}));
