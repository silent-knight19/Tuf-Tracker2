import axios from 'axios';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



import { useRateLimitStore } from '../stores/rateLimitStore';

// Response interceptor for error handling and rate limiting
api.interceptors.response.use(
  (response) => {
    // Check for Rate Limit Headers on every response
    if (response.headers) {
      useRateLimitStore.getState().updateFromHeaders(response.headers);
    }
    return response;
  },
  async (error) => {
    // Also check headers on error responses (like 429)
    if (error.response && error.response.headers) {
      useRateLimitStore.getState().updateFromHeaders(error.response.headers);
    }
    
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
      
      if (error.response.status === 401) {
        // Unauthorized - sign out and redirect to login
        try {
          await signOut(auth);
        } catch (e) {
          console.error('Error signing out:', e);
        }
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);



export default api;
