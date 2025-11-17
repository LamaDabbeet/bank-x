"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, LogOut, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuthStore } from "@/store/auth-store";

const links = [
  { href: "/dashboard", label: "My Accounts", role: "USER" },
  { href: "/admin/accounts", label: "Accounts", role: "ADMIN" },
  { href: "/admin/transactions", label: "Transactions", role: "ADMIN" },
  { href: "/admin/logs", label: "Logs", role: "ADMIN" }
] as const;

export const SiteHeader = () => {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-cyan-700 dark:text-cyan-300"
        >
          <Shield className="h-6 w-6" />
          Bank X
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          {links
            .filter((link) => !link.role || link.role === user?.role)
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname.startsWith(link.href)
                    ? "text-slate-900 dark:text-white"
                    : "hover:text-slate-900 dark:hover:text-white"
                }
              >
                {link.label}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:block">
                {user.role}
              </span>
              <Button
                variant="outline"
                className="flex items-center gap-2 border border-red-500 text-red-200 hover:bg-red-500/10"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button
              asChild
              variant="outline"
              className="border-cyan-500 text-cyan-600 hover:bg-cyan-500/10 dark:text-cyan-200"
            >
              <Link href="/login" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Sign in
              </Link>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

