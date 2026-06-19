import { create } from 'zustand';
import { productsApi } from '../api';
import type { Product } from '../types';

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  createProduct: (data: { name: string; price: number; category_id: number; description?: string; is_novedad?: boolean }) => Promise<boolean>;
  toggleProduct: (id: number) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.list();
      if (response.success && response.data) {
        set({ products: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Error al cargar', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error de conexión', isLoading: false });
    }
  },

  createProduct: async (data) => {
    try {
      const response = await productsApi.create(data);
      if (response.success) {
        set((state) => ({
          products: [...state.products, response.data!],
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  toggleProduct: async (id) => {
    try {
      const response = await productsApi.toggle(id);
      if (response.success) {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? response.data! : p)),
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await productsApi.delete(id);
      if (response.success) {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
