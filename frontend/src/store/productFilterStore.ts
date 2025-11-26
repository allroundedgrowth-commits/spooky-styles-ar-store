import { create } from 'zustand';
import { ProductFilters } from '../types/product';

/**
 * Product Filter Store State
 */
interface ProductFilterStore {
  // State
  filters: ProductFilters;
  searchQuery: string;
  
  // Actions
  setCategory: (category: string | undefined) => void;
  setTheme: (theme: string | undefined) => void;
  setSearch: (search: string) => void;
  setIsAccessory: (isAccessory: boolean | undefined) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  getActiveFilterCount: () => number;
}

/**
 * Zustand store for product catalog filtering state
 * Manages category, theme, search, and accessory filters
 */
export const useProductFilterStore = create<ProductFilterStore>((set, get) => ({
  // Initial state
  filters: {},
  searchQuery: '',

  // Set category filter
  setCategory: (category) => {
    set((state) => ({
      filters: {
        ...state.filters,
        category,
      },
    }));
  },

  // Set theme filter
  setTheme: (theme) => {
    set((state) => ({
      filters: {
        ...state.filters,
        theme,
      },
    }));
  },

  // Set search query
  setSearch: (search) => {
    set((state) => ({
      searchQuery: search,
      filters: {
        ...state.filters,
        search: search || undefined,
      },
    }));
  },

  // Set accessory filter
  setIsAccessory: (isAccessory) => {
    set((state) => ({
      filters: {
        ...state.filters,
        is_accessory: isAccessory,
      },
    }));
  },

  // Set multiple filters at once
  setFilters: (newFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    }));
  },

  // Clear all filters
  clearFilters: () => {
    set({
      filters: {},
      searchQuery: '',
    });
  },

  // Get count of active filters
  getActiveFilterCount: () => {
    const { filters } = get();
    let count = 0;
    if (filters.category) count++;
    if (filters.theme) count++;
    if (filters.search) count++;
    if (filters.is_accessory !== undefined) count++;
    return count;
  },
}));
