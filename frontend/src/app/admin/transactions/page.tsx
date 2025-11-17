"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownRightSquare, ArrowUpRightSquare } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast-provider";

const schema = z.object({
  amount: z.coerce.number().positive(),
  description: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function AdminTransactionsPage() {
  const { accessToken } = useProtectedRoute("ADMIN");
  const { push } = useToast();
  const [accountId, setAccountId] = useState<string>("");

  const accountsQuery = useQuery({
    queryKey: ["admin", "accounts", "light"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const res = await apiFetch<
        Array<{
          id: string;
          accountNumber: string;
          balance: number;
          user: { fullName: string };
        }>
      >("/api/accounts", { token: accessToken });
      return res.data ?? [];
    }
  });

  const mutation = useMutation({
    mutationFn: async ({ type, values }: { type: "credit" | "debit"; values: FormValues }) => {
      const res = await apiFetch(`/api/transactions/${accountId}/${type}`, {
        method: "POST",
        token: accessToken,
        body: values
      });
      return res;
    },
    onSuccess: (res) => {
      push(
        res.toast ?? {
          message: res.message ?? "Transaction complete",
          type: res.toast?.type ?? "success"
        }
      );
      accountsQuery.refetch();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        push(err.toast ?? { message: err.message, type: "error" });
      }
    }
  });

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, description: "" }
  });

  const selected = accountsQuery.data?.find((acc) => acc.id === accountId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Transactions</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Run audited credits and debits on any account.</p>
      </div>

      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="text-sm text-slate-700 dark:text-slate-300">Account</label>
            <select
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white"
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
            >
              <option value="">Select account</option>
              {accountsQuery.data?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.user.fullName} — {account.accountNumber}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/5 dark:bg-white/5">
            {selected ? (
              <div className="flex flex-col gap-1 text-sm">
                <p className="text-slate-900 dark:text-slate-200">{selected.user.fullName}</p>
                <p className="text-slate-600 dark:text-slate-400">#{selected.accountNumber}</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">AED {selected.balance}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">Select an account to view summary.</p>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit((values) => {
            if (!accountId) {
              push({ message: "Pick an account first", type: "warning" });
              return;
            }
            mutation.mutate(
              { type: "credit", values },
              {
                onSuccess: () => reset()
              }
            );
          })}
          className="grid gap-4 md:grid-cols-3"
        >
          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">Amount (AED)</label>
            <Input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-slate-700 dark:text-slate-300">Description</label>
            <Input placeholder="Invoice settlement" {...register("description")} />
          </div>
          <div className="flex flex-wrap gap-3 md:col-span-3">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 bg-emerald-500 text-slate-900 hover:bg-emerald-400"
            >
              <ArrowUpRightSquare className="h-4 w-4" />
              Credit
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 border-amber-500 text-amber-300"
              disabled={mutation.isPending}
              onClick={handleSubmit((values) => {
                if (!accountId) {
                  push({ message: "Pick an account first", type: "warning" });
                  return;
                }
                mutation.mutate(
                  { type: "debit", values },
                  {
                    onSuccess: () => reset()
                  }
                );
              })}
            >
              <ArrowDownRightSquare className="h-4 w-4" />
              Debit
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

