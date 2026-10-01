"use client";

import { useState } from "react";
import { RequirePermission } from "@/components/auth/ProtectedRoute";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/feedback/States";
import { Pagination } from "@/components/ui/Pagination";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getErrorMessage } from "@/lib/api/errors";
import { useAuditLogs } from "@/features/analytics/api";

export default function AuditLogsPage() {
  return (
    <RequirePermission permission={PERMISSIONS.VIEW_AUDIT_LOGS}>
      <AuditInner />
    </RequirePermission>
  );
}

function AuditInner() {
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [page, setPage] = useState(1);
  const logs = useAuditLogs({
    ...(action ? { action } : {}),
    ...(entityType ? { entityType } : {}),
    page,
    limit: 20,
  });

  return (
    <div>
      <PageHeader title="Audit logs" description="Read-only trail: timestamp, actor, action, entity." />
      <div className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 sm:grid-cols-2">
        <div><Label htmlFor="al-action">Action contains</Label><Input id="al-action" placeholder="BOOKING_APPROVED" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} /></div>
        <div><Label htmlFor="al-entity">Entity type</Label><Input id="al-entity" placeholder="booking" value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(1); }} /></div>
      </div>
      {logs.isLoading ? <LoadingState /> : logs.isError ? (
        <ErrorState message={getErrorMessage(logs.error)} onRetry={() => logs.refetch()} />
      ) : (logs.data?.items ?? []).length === 0 ? (
        <EmptyState title="No audit events found." hint="Try widening your filters." />
      ) : (
        <>
          <Card><CardBody className="overflow-x-auto p-0">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead><tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                <th className="px-4 py-3">Time</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Actor</th>
              </tr></thead>
              <tbody>
                {((logs.data?.items) ?? []).map((l) => (
                  <tr key={l.id} className="border-b border-gray-50 align-top last:border-0 hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className="rounded-md bg-[#F4F5F7] px-2 py-0.5 text-[11px] font-bold">{l.action}</span></td>
                    <td className="px-4 py-3 text-xs">{l.entityType}{l.entityId ? <span className="text-gray-400"> · {l.entityId.slice(0, 8)}…</span> : null}</td>
                    <td className="px-4 py-3 text-xs">{l.actorUserId ? `${l.actorUserId.slice(0, 8)}…` : "system"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody></Card>
          <Pagination page={logs.data?.meta.page ?? 1} total={logs.data?.meta.total ?? 0} limit={logs.data?.meta.limit ?? 20} onPage={setPage} />
        </>
      )}
    </div>
  );
}
