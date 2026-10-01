"use client";

import Link from "next/link";
import { useState } from "react";
import { RequirePermission } from "@/components/auth/ProtectedRoute";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/feedback/States";
import { Pagination } from "@/components/ui/Pagination";
import { Input, Select, Label } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getErrorMessage } from "@/lib/api/errors";
import { useUsers, useRoles } from "@/features/users/hooks";

export default function AdminUsersPage() {
  return (
    <RequirePermission permission={PERMISSIONS.MANAGE_USERS}>
      <AdminUsersInner />
    </RequirePermission>
  );
}

function AdminUsersInner() {
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("");
  const [active, setActive] = useState("");
  const [page, setPage] = useState(1);
  const list = useUsers({ search: search || undefined, roleId: roleId || undefined, isActive: active || undefined, page, limit: 15 });
  const { data: roles } = useRoles();

  return (
    <div>
      <PageHeader title="User management" description="Search by email, filter by role or status, manage accounts." />
      <div className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 sm:grid-cols-3">
        <div><Label htmlFor="u-search">Search (email)</Label><Input id="u-search" placeholder="name@nitk.edu.in" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
        <div><Label htmlFor="u-role">Role</Label>
          <Select id="u-role" value={roleId} onChange={(e) => { setRoleId(e.target.value); setPage(1); }}>
            <option value="">All roles</option>{(roles ?? []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select></div>
        <div><Label htmlFor="u-active">Status</Label>
          <Select id="u-active" value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }}>
            <option value="">All</option><option value="true">Active</option><option value="false">Inactive</option>
          </Select></div>
      </div>
      {list.isLoading ? <LoadingState /> : list.isError ? (
        <ErrorState message={getErrorMessage(list.error)} onRetry={() => list.refetch()} />
      ) : (list.data?.items ?? []).length === 0 ? (
        <EmptyState title="No users found." hint="Try a different search or filter." />
      ) : (
        <>
          <Card><CardBody className="overflow-x-auto p-0">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead><tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                <th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th>
              </tr></thead>
              <tbody>
                {((list.data?.items) ?? []).map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="px-4 py-3"><p className="font-bold">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></td>
                    <td className="px-4 py-3 text-xs">{u.roleName ?? "—"}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${u.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"}`}>{u.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="px-4 py-3 text-right"><Link href={`/admin/users/${u.id}`} className="text-xs font-bold text-[#EF2B4D] hover:underline">Manage →</Link></td>
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
