import { create } from 'zustand';
import api from '../utils/api';

export const useAnalyticsStore = create((set) => ({
  overview: null,
  topics: [],
  patterns: [],
  difficulty: null,
  platforms: [],
  heatmap: [],
  timeline: [],
  loading: false,
  error: null,

  // Fetch overview stats
  fetchOverview: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/analytics/overview');
      set({ overview: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch topic distribution
  fetchTopics: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/analytics/topics');
      set({ topics: response.data.topics, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch pattern coverage
  fetchPatterns: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/analytics/patterns');
      set({ patterns: response.data.patterns, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch difficulty distribution
  fetchDifficulty: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/analytics/difficulty');
      set({ difficulty: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch platform distribution
  fetchPlatforms: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/analytics/platforms');
      set({ platforms: response.data.platforms, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch heatmap
  fetchHeatmap: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/analytics/heatmap');
      set({ heatmap: response.data.heatmap, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch timeline
  fetchTimeline: async (days = 30) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/analytics/timeline?days=${days}`);
      set({ timeline: response.data.timeline, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
