"use client";

import { clsx } from "clsx";

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return <div className={clsx("glass-panel rounded-2xl p-6", className)}>{children}</div>;
};

