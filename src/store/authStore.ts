import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  momoNumber?: string;
  /** SHA-256 hash of the user's 4-digit withdrawal PIN (stored client-side). */
  withdrawalPinHash?: string;
  referralCode: string;
  referredBy?: string;
  joinedAt: string;
  /** Funds deposited (cannot be withdrawn) used to create investments */
  accountBalance: number;
  investmentBalance: number;
  taskBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalInvested: number;
  referralInvestmentEarnings: number;
  referralTaskEarnings: number;
  isActive: boolean;
  isSuspended: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'nexero-auth',
      // Persist only the minimal auth state and strip any legacy admin flag on rehydrate
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      deserialize: (str) => {
        try {
          const parsed = JSON.parse(str);
          if (parsed && typeof parsed === 'object') {
            if (parsed.state && parsed.state.isAdmin !== undefined) delete parsed.state.isAdmin;
            if (parsed.isAdmin !== undefined) delete parsed.isAdmin;
          }
          return parsed;
        } catch (e) {
          return undefined as any;
        }
      },
    }
  )
);
