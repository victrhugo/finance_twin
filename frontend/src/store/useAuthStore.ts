import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  currentUserId: string | null;
  currentUserEmail: string | null;
  setCurrentUser: (userId: string | null, email: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUserId: null,
      currentUserEmail: null,
      setCurrentUser: (userId, email) => set({ currentUserId: userId, currentUserEmail: email }),
      logout: () => set({ currentUserId: null, currentUserEmail: null }),
    }),
    {
      name: 'finance-twin-auth',
    }
  )
);
