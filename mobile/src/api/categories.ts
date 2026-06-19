import api from './client';
import type { ApiResponse, Category } from '../types';

export const categoriesApi = {
  list: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  get: async (id: number): Promise<ApiResponse<Category>> => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: { name: string; description?: string; icon?: string }): Promise<ApiResponse<Category>> => {
    const response = await api.post<ApiResponse<Category>>('/categories', data);
    return response.data;
  },

  update: async (id: number, data: { name?: string; description?: string; icon?: string }): Promise<ApiResponse<Category>> => {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data;
  },

  toggle: async (id: number): Promise<ApiResponse<Category>> => {
    const response = await api.patch<ApiResponse<Category>>(`/categories/${id}/toggle`);
    return response.data;
  },

  reorder: async (id: number, sort_order: number): Promise<ApiResponse<Category>> => {
    const response = await api.patch<ApiResponse<Category>>(`/categories/${id}/reorder`, { sort_order });
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/categories/${id}`);
    return response.data;
  },
};
