"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import { apiFetch, ApiError } from "@/lib/api-client";

const schema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email(),
  mobileNumber: z.string().min(6),
  password: z.string().min(8)
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { push } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: values
      });

      push({ message: "Registration submitted! Await approval.", type: "success" });
      reset();
    } catch (error) {
      if (error instanceof ApiError) {
        push(error.toast ?? { message: error.message, type: "error" });
      } else {
        push({ message: "Request failed. Please retry.", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-xl">
      <Card className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Open your account</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Submit the basics. An admin will activate you shortly.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">Full name</label>
            <Input placeholder="Alex Johnson" {...register("fullName")} />
            {errors.fullName && <p className="text-xs text-rose-400">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">Email</label>
            <Input placeholder="you@bank.com" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">Mobile number</label>
            <Input placeholder="+97150000000" {...register("mobileNumber")} />
            {errors.mobileNumber && <p className="text-xs text-rose-400">{errors.mobileNumber.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">Password</label>
            <Input placeholder="••••••••" type="password" {...register("password")} />
            {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit request"}
          </Button>
        </form>
        <p className="text-center text-sm text-slate-600 dark:text-slate-300">
          Already approved?{" "}
          <Link href="/login" className="text-cyan-300 hover:underline">
            Sign in here
          </Link>
        </p>
      </Card>
    </section>
  );
}

