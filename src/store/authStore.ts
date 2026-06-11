import { create } from 'zustand';
import { UserProfile, Household } from '../types';

interface AuthState {
  user: UserProfile | null;
  household: Household | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setHousehold: (household: Household | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  household: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setHousehold: (household) => set({ household }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, household: null, isLoading: false }),
}));
