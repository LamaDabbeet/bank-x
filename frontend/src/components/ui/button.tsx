"use client";

import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { ButtonHTMLAttributes, forwardRef } from "react";

const variants = {
  primary:
    "bg-cyan-500 text-slate-900 hover:bg-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-300",
  outline:
    "border border-slate-300 text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-200 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800/50",
  ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10"
};

type Variant = keyof typeof variants;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, className, variant = "primary", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

