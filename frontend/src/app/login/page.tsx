"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { push } = useToast();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const response = await apiFetch<{
        user: { id: string; email: string; role: "ADMIN" | "USER"; status: string };
        tokens: { accessToken: string; refreshToken: string };
      }>("/api/auth/login", {
        method: "POST",
        body: values
      });

      if (response.data) {
        login({
          user: response.data.user,
          accessToken: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken
        });

        push(response.toast ?? { message: "Welcome back!", type: "success" });
        router.push(response.data.user.role === "ADMIN" ? "/admin/accounts" : "/dashboard");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        push(error.toast ?? { message: error.message, type: "error" });
      } else {
        push({ message: "Unable to sign in right now.", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md">
      <Card className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Access your Bank X workspace.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-700 dark:text-slate-300" htmlFor="email">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@bank.com" {...register("email")} />
            {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-700 dark:text-slate-300" htmlFor="password">
              Password
            </label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>
        <p className="text-center text-sm text-slate-600 dark:text-slate-300">
          Need an account?{" "}
          <Link href="/register" className="text-cyan-300 hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </section>
  );
}

