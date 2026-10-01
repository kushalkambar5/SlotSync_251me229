"use client";

import Link from "next/link";
import { useState } from "react";
import { RequirePermission } from "@/components/auth/ProtectedRoute";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/feedback/States";
import { Pagination } from "@/components/ui/Pagination";
import { FacilityStatusBadge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getErrorMessage } from "@/lib/api/errors";
import { useFacilities } from "@/features/facilities/hooks";

export default function AdminFacilitiesPage() {
  return (
    <RequirePermission permission={PERMISSIONS.MANAGE_FACILITIES}>
      <AdminFacilitiesInner />
    </RequirePermission>
  );
}

function AdminFacilitiesInner() {
  const [page, setPage] = useState(1);
  const list = useFacilities({ page, limit: 15 });

  return (
    <div>
      <PageHeader
        title="Facility administration"
        description="Create, edit, activate/deactivate and manage operating hours."
        action={<Link href="/admin/facilities/new" className="rounded-lg bg-[#EF2B4D] px-4 py-2 text-sm font-bold text-white hover:bg-[#D81E40]">+ New facility</Link>}
      />
      {list.isLoading ? <LoadingState /> : list.isError ? (
        <ErrorState message={getErrorMessage(list.error)} onRetry={() => list.refetch()} />
      ) : (list.data?.items ?? []).length === 0 ? (
        <EmptyState title="No facilities yet." hint="Create the first classroom, lab or hall." />
      ) : (
        <>
          <Card><CardBody className="overflow-x-auto p-0">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type / Building</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {((list.data?.items) ?? []).map((f) => (
                  <tr key={f.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="px-4 py-3"><p className="font-bold">{f.name}</p><p className="text-xs text-gray-500">{f.code}</p></td>
                    <td className="px-4 py-3 text-xs">{f.typeName} · {f.building ?? "—"}</td>
                    <td className="px-4 py-3">{f.capacity}</td>
                    <td className="px-4 py-3"><FacilityStatusBadge status={f.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/facilities/${f.id}`} className="text-xs font-bold text-[#EF2B4D] hover:underline">Manage →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody></Card>
          <Pagination page={list.data?.meta.page ?? 1} total={list.data?.meta.total ?? 0} limit={list.data?.meta.limit ?? 15} onPage={setPage} />
        </>
      )}
    </div>
  );
}
