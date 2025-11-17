"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { apiFetch } from "@/lib/api-client";

export default function AdminLogsPage() {
  const { accessToken } = useProtectedRoute("ADMIN");

  const logsQuery = useQuery({
    queryKey: ["admin", "logs"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const res = await apiFetch<
        Array<{ id: string; log: string; haveError: boolean; type: number; createdAt: string; user?: { email: string } }>
      >("/api/logs", { token: accessToken });
      return res.data ?? [];
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-cyan-600 dark:text-cyan-300" />
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Audit Trail</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Every UI + API interaction stored per requirement #8.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-white/5 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">User</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-transparent">
            {logsQuery.data?.map((log) => (
              <tr key={log.id} className="border-t border-slate-100 text-slate-700 dark:border-white/5 dark:text-slate-300">
                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      log.type === 1
                        ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200"
                    }`}
                  >
                    {log.type === 1 ? "UI" : "API"}
                  </span>
                </td>
                <td className="px-4 py-3">{log.log}</td>
                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{log.user?.email ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!logsQuery.data?.length && (
          <div className="px-4 py-6 text-sm text-slate-600 dark:text-slate-400">
            No logs yet. Perform an action to populate.
          </div>
        )}
      </Card>
    </div>
  );
}

