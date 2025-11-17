"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useProtectedRoute } from "@/hooks/use-protected-route";

const updateSchema = z.object({
  fullName: z.string().optional(),
  address: z.string().optional(),
  profilePicture: z.string().url().optional()
});

type UpdateValues = z.infer<typeof updateSchema>;

export default function DashboardPage() {
  const { accessToken } = useProtectedRoute("USER");
  const { push } = useToast();

  const accountQuery = useQuery({
    queryKey: ["account", "me"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const res = await apiFetch<{
        id: string;
        status: "ACTIVE" | "INACTIVE" | "PENDING";
        balance: number;
        accountNumber: string;
        user: { fullName: string; email: string; mobileNumber: string; address?: string; profilePicture?: string };
        transactions: Array<{ id: string; type: "CREDIT" | "DEBIT"; amount: number; createdAt: string; description?: string }>;
      }>("/api/accounts/me", { token: accessToken });
      return res.data;
    }
  });

  const ledgerQuery = useQuery({
    queryKey: ["ledger", "me"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const res = await apiFetch<{ balance: number; transactions: Array<{ id: string; type: "CREDIT" | "DEBIT"; amount: number; createdAt: string; description?: string }> }>(
        "/api/transactions/me",
        { token: accessToken }
      );
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: UpdateValues) => {
      const response = await apiFetch("/api/accounts/me", {
        method: "PATCH",
        token: accessToken,
        body: values
      });
      return response;
    },
    onSuccess: (response) => {
      push(response.toast ?? { message: "Profile updated", type: "success" });
      accountQuery.refetch();
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        push(error.toast ?? { message: error.message, type: "error" });
      }
    }
  });

  const { register, handleSubmit } = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      fullName: accountQuery.data?.user.fullName,
      address: accountQuery.data?.user.address,
      profilePicture: accountQuery.data?.user.profilePicture
    },
    values: {
      fullName: accountQuery.data?.user.fullName ?? "",
      address: accountQuery.data?.user.address ?? "",
      profilePicture: accountQuery.data?.user.profilePicture ?? ""
    }
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">My Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">Account Number</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{accountQuery.data?.accountNumber ?? "—"}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">Balance</p>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
            <p className="text-3xl font-semibold text-slate-900 dark:text-white">AED {ledgerQuery.data?.balance ?? 0}</p>
          </div>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">Status</p>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
              {accountQuery.data?.status ?? "PENDING"}
            </p>
          </div>
          <div className="rounded-full border border-emerald-500 px-4 py-1 text-sm text-emerald-600 dark:text-emerald-200">
            {accountQuery.data?.status ?? "PENDING"}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Profile</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Keep your contact details up to date.</p>
          </div>
          <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-3">
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-300">Full name</label>
              <Input {...register("fullName")} />
            </div>
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-300">Address</label>
              <Input {...register("address")} placeholder="Dubai, UAE" />
            </div>
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-300">Profile picture URL</label>
              <Input {...register("profilePicture")} placeholder="https://cdn..." />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Transactions</h2>
          </div>
          <div className="space-y-3">
            {ledgerQuery.data?.transactions?.length ? (
              ledgerQuery.data.transactions.slice(0, 6).map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/5 dark:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {txn.type === "CREDIT" ? "Credit" : "Debit"} - AED {txn.amount}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{new Date(txn.createdAt).toLocaleString()}</p>
                  </div>
                  {txn.type === "CREDIT" ? (
                    <ArrowUpRight className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-amber-500 dark:text-amber-300" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">No transactions yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

