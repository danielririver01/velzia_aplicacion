import api from './client';
import type { ApiResponse, Product, Modifier } from '../types';

export const productsApi = {
  list: async (): Promise<ApiResponse<Product[]>> => {
    const response = await api.get<ApiResponse<Product[]>>('/products');
    return response.data;
  },

  get: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    price: number;
    category_id: number;
    description?: string;
    is_novedad?: boolean;
  }): Promise<ApiResponse<Product>> => {
    const response = await api.post<ApiResponse<Product>>('/products', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data;
  },

  toggle: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}/toggle`);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/products/${id}`);
    return response.data;
  },

  createModifier: async (productId: number, data: { name: string; price: number }): Promise<ApiResponse<Modifier>> => {
    const response = await api.post<ApiResponse<Modifier>>(`/products/${productId}/modifiers`, data);
    return response.data;
  },

  listModifiers: async (productId: number): Promise<ApiResponse<Modifier[]>> => {
    const response = await api.get<ApiResponse<Modifier[]>>(`/products/${productId}/modifiers`);
    return response.data;
  },

  deleteModifier: async (modifierId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/products/modifiers/${modifierId}`);
    return response.data;
  },
};
