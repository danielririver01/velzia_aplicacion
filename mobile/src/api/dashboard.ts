import api from './client';
import type { ApiResponse, DashboardOverview, DashboardStats } from '../types';

export const dashboardApi = {
  getOverview: async (): Promise<ApiResponse<DashboardOverview>> => {
    const response = await api.get<ApiResponse<DashboardOverview>>('/dashboard/overview');
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  },

  checkOrders: async (): Promise<ApiResponse<void>> => {
    const response = await api.get<ApiResponse<void>>('/dashboard/check-orders');
    return response.data;
  },

  getSettings: async (): Promise<ApiResponse<void>> => {
    const response = await api.get<ApiResponse<void>>('/dashboard/settings');
    return response.data;
  },

  getSubscription: async (): Promise<ApiResponse<void>> => {
    const response = await api.get<ApiResponse<void>>('/dashboard/subscription');
    return response.data;
  },

  updateProfile: async (data: { name?: string; business_name?: string; phone?: string }): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>('/dashboard/profile', data);
    return response.data;
  },

  changePassword: async (data: { current_password: string; new_password: string }): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/dashboard/change-password', data);
    return response.data;
  },

  toggleStatus: async (): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/dashboard/toggle-status');
    return response.data;
  },
};
