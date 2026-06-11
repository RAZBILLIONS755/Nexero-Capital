import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
}

interface AdminAuthState {
  admin: AdminUser | null;
  isAdmin: boolean;
  loginAdmin: (admin: AdminUser) => void;
  logoutAdmin: () => void;
}

export const useAdminStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      isAdmin: false,
      loginAdmin: (admin) => set({ admin, isAdmin: true }),
      logoutAdmin: () => set({ admin: null, isAdmin: false }),
    }),
    { name: 'nexero-admin', getStorage: () => sessionStorage }
  )
);

export default useAdminStore;
