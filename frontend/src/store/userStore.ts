import { create } from 'zustand';
import { User } from '../types/user';
import authService from '../services/auth.service';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  loadUser: () => Promise<void>;
  clearUser: () => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user, error: null }),

  loadUser: async () => {
    if (!authService.isAuthenticated()) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      console.error('Failed to load user:', error);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: error.response?.data?.error?.message || 'Failed to load user'
      });
    }
  },

  clearUser: () => set({ user: null, isAuthenticated: false, error: null }),

  setError: (error) => set({ error }),
}));
