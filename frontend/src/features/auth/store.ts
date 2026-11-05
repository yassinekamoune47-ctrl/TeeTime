import { create } from 'zustand';
import type { User } from '@/types/user.types';
import { toUser, type RawAuthUser } from './types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  mfaPending: boolean;
  login: (rawUser: RawAuthUser) => void;
  signup: (data: RawAuthUser) => void;
  logout: () => void;
  setUser: (rawUser: RawAuthUser | null) => void;
  setMfaPending: (pending: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  mfaPending: false,
  login: (rawUser) => set({ user: toUser(rawUser), isAuthenticated: true, mfaPending: false }),
  signup: (data) => set({ user: toUser(data), isAuthenticated: true, mfaPending: false }),
  logout: () => set({ user: null, isAuthenticated: false, mfaPending: false }),
  setUser: (rawUser) => set({ user: rawUser ? toUser(rawUser) : null, isAuthenticated: !!rawUser }),
  setMfaPending: (pending) => set({ mfaPending: pending }),
}));