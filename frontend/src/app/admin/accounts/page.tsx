"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, LoaderCircle, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast-provider";

const createSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  mobileNumber: z.string().min(6),
  address: z.string().optional(),
  profilePicture: z.string().url().optional()
});

type CreateValues = z.infer<typeof createSchema>;

export default function AdminAccountsPage() {
  const { accessToken } = useProtectedRoute("ADMIN");
  const { push } = useToast();

  const accountsQuery = useQuery({
    queryKey: ["admin", "accounts"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const res = await apiFetch<
        Array<{
          id: string;
          accountNumber: string;
          status: "ACTIVE" | "INACTIVE";
          balance: number;
          user: { id: string; fullName: string; email: string; mobileNumber: string; status: string };
        }>
      >("/api/accounts", { token: accessToken });
      return res.data ?? [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (values: CreateValues) => {
      const res = await apiFetch("/api/accounts", {
        method: "POST",
        token: accessToken,
        body: values
      });
      return res;
    },
    onSuccess: (res) => {
      accountsQuery.refetch();
      push(res.toast ?? { message: "Account created", type: "success" });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        push(err.toast ?? { message: err.message, type: "error" });
      }
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "ACTIVE" | "INACTIVE" }) => {
      const res = await apiFetch(`/api/accounts/${id}`, {
        method: "PATCH",
        token: accessToken,
        body: { status }
      });
      return res;
    },
    onSuccess: (res) => {
      accountsQuery.refetch();
      push(res.toast ?? { message: "Account updated", type: "success" });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        push(err.toast ?? { message: err.message, type: "error" });
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/api/accounts/${id}`, {
        method: "DELETE",
        token: accessToken
      });
    },
    onSuccess: () => {
      accountsQuery.refetch();
      push({ message: "Account removed", type: "warning" });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        push(err.toast ?? { message: err.message, type: "error" });
      }
    }
  });

  const { register, handleSubmit, reset } = useForm<CreateValues>({
    resolver: zodResolver(createSchema)
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Account Directory</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create customers, toggle activation, and manage balances.
          </p>
        </div>
      </div>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Create customer</h2>
        <form
          onSubmit={handleSubmit((values) => {
            createMutation.mutate(values, {
              onSuccess: () => reset()
            });
          })}
          className="grid gap-4 md:grid-cols-2"
        >
          <Input placeholder="Full name" {...register("fullName")} />
          <Input placeholder="Email" type="email" {...register("email")} />
          <Input placeholder="Mobile number" {...register("mobileNumber")} />
          <Input placeholder="Address (optional)" {...register("address")} />
          <Input placeholder="Profile picture URL" {...register("profilePicture")} className="md:col-span-2" />
          <Button type="submit" className="md:col-span-2" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create account"}
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">All accounts</h2>
        <div className="rounded-2xl border border-slate-200 dark:border-white/5">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Account #</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-transparent">
              {accountsQuery.data?.map((account) => (
                <tr key={account.id} className="border-t border-slate-100 text-slate-700 dark:border-white/5 dark:text-slate-200">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900 dark:text-white">{account.user.fullName}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{account.user.email}</p>
                  </td>
                  <td className="px-4 py-3">{account.accountNumber}</td>
                  <td className="px-4 py-3">AED {account.balance}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        account.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                      }`}
                    >
                      {account.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="border-emerald-500 text-emerald-600 dark:text-emerald-300"
                        onClick={() =>
                          updateStatus.mutate({
                            id: account.id,
                            status: account.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                          })
                        }
                      >
                        <Check className="mr-1 h-4 w-4" />
                        {account.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-rose-500 hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-500/10"
                        onClick={() => deleteMutation.mutate(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {accountsQuery.isLoading && (
            <div className="flex items-center justify-center py-6 text-slate-600 dark:text-slate-400">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading accounts...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

