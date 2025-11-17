"use client";

import { create } from "zustand";

type Role = "ADMIN" | "USER";
type Status = "ACTIVE" | "INACTIVE" | "PENDING";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  status: Status;
}

interface AuthState {
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  hydrated: boolean;
  login: (payload: { user: AuthUser; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  hydrate: () => void;
}

const STORAGE_KEY = "bank-auth";

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  login: ({ user, accessToken, refreshToken }) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken, refreshToken }));
    }
    set({ user, accessToken, refreshToken, hydrated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ user: undefined, accessToken: undefined, refreshToken: undefined, hydrated: true });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      set({ hydrated: true });
      return;
    }
    try {
      const parsed = JSON.parse(data) as { user: AuthUser; accessToken: string; refreshToken: string };
      set({ ...parsed, hydrated: true });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      set({ hydrated: true });
    }
  }
}));

