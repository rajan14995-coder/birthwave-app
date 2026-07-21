import { create } from "zustand";

type AuthUser = {
  id: string;
  phone: string;
  name?: string | null;
  role: "PATIENT" | "STAFF";
};

interface AuthState {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
