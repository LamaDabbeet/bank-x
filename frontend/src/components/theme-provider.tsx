"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemeProvider>
  );
};

