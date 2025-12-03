import { create } from 'zustand';
import api from '../utils/api';

export const useProblemStore = create((set, get) => ({
  problems: [],
  loading: false,
  error: null,
  filters: {
    topic: '',
    pattern: '',
    difficulty: '',
    company: ''
  },

  // Fetch all problems
  fetchProblems: async (filters = {}) => {
    console.log('Fetching problems with filters:', filters);
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/problems?${params}`);
      console.log('Fetched problems count:', response.data.problems.length);
      set({ problems: response.data.problems, loading: false });
    } catch (error) {
      console.error('Error fetching problems:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Add a new problem
  addProblem: async (problemData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/problems', problemData);
      set((state) => ({ 
        problems: [response.data, ...state.problems],
        loading: false 
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update a problem
  updateProblem: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/problems/${id}`, updates);
      set((state) => ({
        problems: state.problems.map(p => 
          p.id === id ? { ...p, ...updates } : p
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete a problem
  deleteProblem: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/problems/${id}`);
      set((state) => ({
        problems: state.problems.filter(p => p.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Analyze a problem (without saving)
  analyzeProblem: async (title, platform, url) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/problems/analyze', { title, platform, platformUrl: url });
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Set filters
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().fetchProblems({ ...get().filters, ...newFilters });
  },

  // Clear filters
  clearFilters: () => {
    set({ filters: { topic: '', pattern: '', difficulty: '', company: '' } });
    get().fetchProblems();
  },

  // Generate AI study notes for a problem
  generateNotes: async (problemId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/problems/${problemId}/generate-notes`);
      set({ loading: false });
      return response.data.notes;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Generate problem description
  generateDescription: async (problemId) => {
    set({ loading: true, error: null });
    try {
      // Get problem data to send with request
      const problem = get().problems.find(p => p.id === problemId);
      
      const response = await api.post(`/problems/${problemId}/generate-description`, {
        title: problem?.title,
        platform: problem?.platform,
        difficulty: problem?.difficulty,
        topics: problem?.topics,
        patterns: problem?.patterns
      });
      
      // Update the problem in the store
      set((state) => ({
        problems: state.problems.map((p) =>
          p.id === problemId ? { ...p, description: response.data.description } : p
        ),
        loading: false
      }));
      
      return response.data.description;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));
