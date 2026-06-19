import { create } from 'zustand';
import { categoriesApi } from '../api';
import type { Category } from '../types';

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  createCategory: (data: { name: string; description?: string; icon?: string }) => Promise<boolean>;
  updateCategory: (id: number, data: { name?: string; description?: string; icon?: string }) => Promise<boolean>;
  toggleCategory: (id: number) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoriesApi.list();
      if (response.success && response.data) {
        set({ categories: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Error al cargar', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error de conexión', isLoading: false });
    }
  },

  createCategory: async (data) => {
    try {
      const response = await categoriesApi.create(data);
      if (response.success) {
        set((state) => ({
          categories: [...state.categories, response.data!],
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const response = await categoriesApi.update(id, data);
      if (response.success) {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? response.data! : c)),
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  toggleCategory: async (id) => {
    try {
      const response = await categoriesApi.toggle(id);
      if (response.success) {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? response.data! : c)),
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await categoriesApi.delete(id);
      if (response.success) {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
