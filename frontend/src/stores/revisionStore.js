import { create } from 'zustand';
import api from '../utils/api';

export const useRevisionStore = create((set, get) => ({
  // State
  revisions: [],
  dueToday: {
    day_2: [],
    day_7: [],
    day_14: [],
    day_30: [],
    month_2: [],
    month_3: [],
    monthly: []
  },
  overdue: [],
  upcoming: [],
  counts: {
    dueToday: 0,
    overdue: 0,
    upcoming: 0
  },
  loading: false,
  error: null,

  // Actions
  fetchRevisions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/revisions');
      set({ revisions: response.data.revisions, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchDueToday: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/revisions/due-today');
      set({
        dueToday: response.data.dueToday,
        overdue: response.data.overdue,
        upcoming: response.data.upcoming,
        counts: response.data.counts,
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchRevisionById: async (revisionId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/revisions/${revisionId}`);
      
      // Update or add to revisions list
      set(state => {
        const exists = state.revisions.find(r => r.id === revisionId);
        if (exists) {
          return {
            revisions: state.revisions.map(r => r.id === revisionId ? response.data : r),
            loading: false
          };
        } else {
          return {
            revisions: [...state.revisions, response.data],
            loading: false
          };
        }
      });
      
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  addToRevisionQueue: async (problemData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/revisions', problemData);
      
      // Add to revisions list
      set(state => ({
        revisions: [...state.revisions, response.data],
        loading: false
      }));

      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  completeReview: async (revisionId, reviewData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/revisions/${revisionId}/review`, reviewData);

      // Update revision in state
      set(state => ({
        revisions: state.revisions.map(r => 
          r.id === revisionId ? response.data.revision : r
        ),
        loading: false
      }));

      // Refresh due today
      get().fetchDueToday();

      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateRevisionNotes: async (revisionId, notesData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/revisions/${revisionId}`, notesData);

      // Update revision in state
      set(state => ({
        revisions: state.revisions.map(r => 
          r.id === revisionId ? response.data : r
        ),
        loading: false
      }));

      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logRevisionTime: async (revisionId, phase, timeTaken) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/revisions/${revisionId}/log-time`, {
        phase,
        timeTaken
      });

      // Update revision in state
      set(state => ({
        revisions: state.revisions.map(r => 
          r.id === revisionId ? response.data : r
        ),
        loading: false
      }));

      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  removeFromQueue: async (revisionId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/revisions/${revisionId}`);

      // Remove from state
      set(state => ({
        revisions: state.revisions.filter(r => r.id !== revisionId),
        loading: false
      }));

      // Refresh due today
      get().fetchDueToday();
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Utility: Get revision by problem ID
  getRevisionByProblemId: (problemId) => {
    const state = get();
    return state.revisions.find(r => r.problemId === problemId);
  },

  // Utility: Get revision by ID
  getRevisionById: (revisionId) => {
    const state = get();
    return state.revisions.find(r => r.id === revisionId);
  },

  // Utility: Get revisions by bucket
  getRevisionsByBucket: (bucket) => {
    const state = get();
    return state.revisions.filter(r => r.bucket === bucket);
  },

  // Utility: Get revisions by pattern
  getRevisionsByPattern: (pattern) => {
    const state = get();
    return state.revisions.filter(r => r.pattern === pattern);
  }
}));
