import { create } from 'zustand';
import { syncWithBackend, clearTokens } from '../api/client';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  loginWithClerk: (clerkToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
  checkStoredAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  loginWithClerk: async (clerkToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await syncWithBackend(clerkToken);
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.response?.data?.error || 'Error al iniciar sesión',
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    try {
    } finally {
      await clearTokens();
      set({ user: null, isAuthenticated: false });
    }
  },

  setUser: (user: User) => set({ user }),
  clearError: () => set({ error: null }),

  checkStoredAuth: async () => {
    try {
      const { default: SecureStore } = await import('expo-secure-store');
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        set({ isAuthenticated: true });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));