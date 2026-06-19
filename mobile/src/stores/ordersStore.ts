import { create } from 'zustand';
import { ordersApi } from '../api';
import type { Order, CreateOrderPayload } from '../types';

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;

  fetchOrders: (status?: string) => Promise<void>;
  createOrder: (data: CreateOrderPayload) => Promise<boolean>;
  updateOrderStatus: (id: number, status: string) => Promise<boolean>;
  cancelOrder: (id: number) => Promise<boolean>;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchOrders: async (status?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ordersApi.list(status);
      if (response.success && response.data) {
        set({ orders: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Error al cargar', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error de conexión', isLoading: false });
    }
  },

  createOrder: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ordersApi.create(data);
      if (response.success) {
        set({ isLoading: false });
        return true;
      }
      set({ error: response.message || 'Error al crear pedido', isLoading: false });
      return false;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error de conexión', isLoading: false });
      return false;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const response = await ordersApi.updateStatus(id, status);
      if (response.success) {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status: response.data?.status || status } : o
          ),
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  cancelOrder: async (id) => {
    try {
      const response = await ordersApi.cancel(id);
      if (response.success) {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status: 'cancelled' } : o
          ),
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));