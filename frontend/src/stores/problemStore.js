import { create } from 'zustand';
import api from '../utils/api';

export const useProblemStore = create((set, get) => ({
  problems: [],
  loading: false,
  error: null,
  filters: {
    topics: [],
    patterns: [],
    difficulty: '',
    company: ''
  },

  // Fetch all problems
  fetchProblems: async (filters = {}) => {
    console.log('Fetching problems with filters:', filters);
    set({ loading: true, error: null });
    try {
      // Correctly format array filters for the API
      const queryParams = { ...filters };
      if (Array.isArray(queryParams.topics)) queryParams.topics = queryParams.topics.join(',');
      if (Array.isArray(queryParams.patterns)) queryParams.patterns = queryParams.patterns.join(',');

      const params = new URLSearchParams(queryParams);
      const response = await api.get(`/problems?${params}`);
      console.log('Fetched problems count:', response.data.problems.length);
      set({ problems: response.data.problems, loading: false });
    } catch (error) {
      console.error('Error fetching problems:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Fetch a single problem
  fetchProblem: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/problems/${id}`);
      set((state) => {
        const index = state.problems.findIndex(p => p.id === id);
        if (index !== -1) {
          // Update existing problem
          const newProblems = [...state.problems];
          newProblems[index] = { ...newProblems[index], ...response.data };
          return { problems: newProblems, loading: false };
        } else {
          // Add new problem to list
          return { problems: [...state.problems, response.data], loading: false };
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching problem:', error);
      set({ error: error.message, loading: false });
      throw error;
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
    set((state) => {
      const updatedFilters = { ...state.filters };
      
      // Handle multi-select toggling for topics and patterns
      if (newFilters.topics !== undefined) {
        const topic = Array.isArray(newFilters.topics) ? newFilters.topics[0] : newFilters.topics;
        if (topic) {
          const index = updatedFilters.topics.indexOf(topic);
          if (index > -1) {
            updatedFilters.topics = updatedFilters.topics.filter(t => t !== topic);
          } else {
            updatedFilters.topics = [...updatedFilters.topics, topic];
          }
        } else {
          updatedFilters.topics = [];
        }
      } else if (newFilters.patterns !== undefined) {
        const pattern = Array.isArray(newFilters.patterns) ? newFilters.patterns[0] : newFilters.patterns;
        if (pattern) {
          const index = updatedFilters.patterns.indexOf(pattern);
          if (index > -1) {
            updatedFilters.patterns = updatedFilters.patterns.filter(p => p !== pattern);
          } else {
            updatedFilters.patterns = [...updatedFilters.patterns, pattern];
          }
        } else {
          updatedFilters.patterns = [];
        }
      } else {
        // Standard single-value filter update
        Object.assign(updatedFilters, newFilters);
      }
      
      return { filters: updatedFilters };
    });
    
    get().fetchProblems(get().filters);
  },

  // Clear filters
  clearFilters: () => {
    const defaultFilters = { topics: [], patterns: [], difficulty: '', company: '' };
    set({ filters: defaultFilters });
    get().fetchProblems(defaultFilters);
  },

  // Generate AI study notes for a problem
  generateNotes: async (problemId, forceRefresh = false) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/problems/${problemId}/generate-notes`, {
        forceRefresh
      });
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
