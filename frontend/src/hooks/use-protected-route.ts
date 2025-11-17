"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";

export const useProtectedRoute = (role?: "ADMIN" | "USER") => {
  const router = useRouter();
  const { user, accessToken, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!user || !accessToken) {
      router.replace("/login");
      return;
    }
    if (role && user.role !== role) {
      router.replace(role === "ADMIN" ? "/admin/accounts" : "/dashboard");
    }
  }, [accessToken, hydrated, role, router, user]);

  return { user, accessToken };
};

