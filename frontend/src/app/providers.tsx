"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { useAuthStore } from "@/store/auth-store";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 30
          }
        }
      })
  );

  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

