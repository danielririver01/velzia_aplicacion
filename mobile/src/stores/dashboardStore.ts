import { create } from 'zustand';
import { dashboardApi } from '../api';
import type { DashboardOverview, DashboardStats } from '../types';

interface DashboardState {
  overview: DashboardOverview | null;
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;

  fetchOverview: () => Promise<void>;
  fetchStats: () => Promise<void>;
  toggleStatus: () => Promise<boolean>;
  updateProfile: (data: { name?: string; business_name?: string; phone?: string }) => Promise<boolean>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  overview: null,
  stats: null,
  isLoading: false,
  error: null,

  fetchOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getOverview();
      if (response.success && response.data) {
        set({ overview: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Error al cargar', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error de conexión', isLoading: false });
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getStats();
      if (response.success && response.data) {
        set({ stats: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Error al cargar', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error de conexión', isLoading: false });
    }
  },

  toggleStatus: async () => {
    try {
      const response = await dashboardApi.toggleStatus();
      if (response.success) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await dashboardApi.updateProfile(data);
      return response.success;
    } catch {
      return false;
    }
  },
}));
