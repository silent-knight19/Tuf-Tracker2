import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../config/firebase';
import api from '../utils/api';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      error: null,

      // Fetch extended user stats
      fetchUserStats: async () => {
        try {
          const response = await api.get('/auth/me');
          set(state => ({
            user: { ...state.user, ...response.data }
          }));
        } catch (error) {
          console.error('Failed to fetch user stats:', error);
        }
      },

      // Initialize auth listener
      initializeAuth: () => {
        return onAuthStateChanged(auth, async (user) => {
          if (user) {
            set({ 
              user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email
              },
              loading: false
            });
            // Fetch stats
            get().fetchUserStats();
          } else {
            set({ user: null, loading: false });
          }
        });
      },

      // Sign in
      signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName || userCredential.user.email
          };
          set({ user, loading: false });
          
          // Fetch stats
          await get().fetchUserStats();
          
          return userCredential.user;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Sign in with Google
      signInWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
          const provider = new GoogleAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          const user = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName || userCredential.user.email
          };
          set({ user, loading: false });
          
          // Fetch stats
          await get().fetchUserStats();
          
          return userCredential.user;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Sign up
      signUp: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName || userCredential.user.email
          };
          set({ user, loading: false });
          return userCredential.user;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Sign out
      signOut: async () => {
        set({ loading: true });
        try {
          await signOut(auth);
          set({ user: null, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
