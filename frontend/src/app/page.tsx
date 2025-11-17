"use client";

import Link from "next/link";
import { ArrowRight, Shield, Zap, LineChart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "Dual-role Access",
    body: "Admins sign up customers, control user status, and execute high-trust transactions in a single console.",
    icon: Shield
  },
  {
    title: "Real-time Visibility",
    body: "Users track balances, credits, and debits instantly with color-coded toast notifications.",
    icon: LineChart
  },
  {
    title: "Enterprise-grade Logging",
    body: "Every UI and API event lands in PostgreSQL to accelerate audits and RCA.",
    icon: Zap
  }
];

export default function Home() {
  return (
    <section className="w-full space-y-12">
      <div className="glass-panel rounded-3xl p-10 text-center shadow-glow">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-600 dark:text-slate-300">Bank Account Management</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white sm:text-5xl">
          Launch-ready portal for admins & retail clients
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Secure sign-ups, granular account controls, instant notifications, and transaction tooling backed
          by a hardened Node.js API.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild className="px-6 py-3 text-base shadow-glow">
            <Link href="/login" className="flex items-center gap-2">
              Launch Console <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="px-6 py-3 text-base">
            <Link href="/register">Open an Account</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="space-y-4 border border-slate-200 dark:border-white/5">
            <feature.icon className="h-8 w-8 text-cyan-500 dark:text-cyan-300" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{feature.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
