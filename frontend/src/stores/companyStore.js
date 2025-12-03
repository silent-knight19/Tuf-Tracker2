import { create } from 'zustand';
import api from '../utils/api';

export const useCompanyStore = create((set) => ({
  companies: [],
  companyProblems: [],
  selectedCompany: null,
  readinessData: null,
  loading: false,
  error: null,

  // Fetch all companies
  fetchCompanies: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/company');
      set({ companies: response.data.companies, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Get readiness for a specific company
  getCompanyReadiness: async (companyName) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/company/${companyName}`);
      set({ 
        readinessData: response.data, 
        selectedCompany: companyName,
        loading: false 
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch problems for a specific company
  fetchCompanyProblems: async (companyName) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/company/${companyName}/problems`);
      set({ 
        companyProblems: response.data.problems, 
        loading: false 
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
