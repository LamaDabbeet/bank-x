"use client";

import * as ToastPrimitives from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ToastPayload } from "@bank/types";
import { clsx } from "clsx";

interface ToastContextValue {
  push: (toast: ToastPayload) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<string, string> = {
  success: "border-emerald-400 bg-emerald-950/70 text-emerald-100",
  error: "border-red-400 bg-red-950/70 text-red-100",
  warning: "border-amber-400 bg-amber-950/70 text-amber-100"
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Array<ToastPayload & { id: string }>>([]);

  const push = useCallback((toast: ToastPayload) => {
    setToasts((prev) => [...prev, { ...toast, id: crypto.randomUUID() }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitives.Provider swipeDirection="right">
        {children}
        <ToastPrimitives.Viewport className="fixed bottom-6 right-6 z-50 flex w-96 flex-col gap-3" />

        {toasts.map((toast) => (
          <ToastPrimitives.Root
            key={toast.id}
            duration={4000}
            onOpenChange={(open) => !open && remove(toast.id)}
            className={clsx(
              "toast-slide border px-4 py-3 shadow-2xl shadow-black/50 rounded-xl",
              variantStyles[toast.type ?? "success"]
            )}
          >
            <ToastPrimitives.Title className="text-sm font-semibold">
              {toast.message}
            </ToastPrimitives.Title>
          </ToastPrimitives.Root>
        ))}
      </ToastPrimitives.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
};

