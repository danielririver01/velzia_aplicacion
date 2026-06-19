import api from './client';
import type { ApiResponse, Order, CreateOrderPayload, CreateOrderResponse } from '../types';

export const ordersApi = {
  list: async (status?: string): Promise<ApiResponse<Order[]>> => {
    const params = status ? { status } : {};
    const response = await api.get<ApiResponse<Order[]>>('/orders', { params });
    return response.data;
  },

  get: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  create: async (data: CreateOrderPayload): Promise<ApiResponse<CreateOrderResponse>> => {
    const response = await api.post<ApiResponse<CreateOrderResponse>>('/orders', data);
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<ApiResponse<Order>> => {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return response.data;
  },

  cancel: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>(`/orders/${id}/cancel`);
    return response.data;
  },
};