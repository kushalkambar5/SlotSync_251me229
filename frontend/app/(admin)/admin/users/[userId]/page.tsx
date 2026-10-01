"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { RequirePermission } from "@/components/auth/ProtectedRoute";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState, SuccessMessage } from "@/components/feedback/States";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select, Label } from "@/components/ui/Input";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getErrorMessage } from "@/lib/api/errors";
import { usersApi } from "@/features/users/api";
import { useManagedUser, useRoles, useUpdateUserStatus, useAssignRole } from "@/features/users/hooks";

export default function AdminUserDetailPage() {
  return (
    <RequirePermission permission={PERMISSIONS.MANAGE_USERS}>
      <AdminUserInner />
    </RequirePermission>
  );
}

function AdminUserInner() {
  const params = useParams<{ userId: string }>();
  const id = params.userId;
  const user = useManagedUser(id);
  const { data: roles } = useRoles();
  const setStatus = useUpdateUserStatus();
  const assignRole = useAssignRole();
  const [roleId, setRoleId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setMsg(null); setErr(null);
    try { await fn(); setMsg(ok); } catch (e) { setErr(getErrorMessage(e)); }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="User details" action={<Link href="/admin/users" className="text-xs font-bold text-[#EF2B4D] hover:underline">← Users</Link>} />
      {user.isLoading ? <LoadingState /> : user.isError || !user.data ? (
        <ErrorState message={getErrorMessage(user.error, "User not found.")} onRetry={() => user.refetch()} />
      ) : (
        <>
          {msg && <div className="mb-4"><SuccessMessage message={msg} /></div>}
          {err && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200">{err}</p>}
          <Card><CardBody>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs font-bold uppercase text-gray-400">Name</dt><dd className="font-semibold">{user.data.name}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-gray-400">Email</dt><dd className="font-semibold">{user.data.email}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-gray-400">Role</dt><dd className="font-semibold">{user.data.roleName ?? "—"}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-gray-400">Status</dt><dd className="font-semibold">{user.data.isActive ? "Active" : "Inactive"}</dd></div>
            </dl>
          </CardBody></Card>
          <Card className="mt-4"><CardBody>
            <h2 className="text-sm font-bold">Account status</h2>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="secondary" loading={setStatus.isPending} onClick={() => void act(() => usersApi.setStatus(id, !user.data!.isActive).then(() => undefined), `User ${user.data!.isActive ? "deactivated" : "activated"}.`)}>
                {user.data.isActive ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </CardBody></Card>
          <Card className="mt-4"><CardBody>
            <h2 className="text-sm font-bold">Assign role</h2>
            <p className="text-xs text-gray-500">Changes take effect immediately on next request.</p>
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <div className="min-w-48 flex-1">
                <Label htmlFor="ur-role">Role</Label>
                <Select id="ur-role" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                  <option value="">Select role…</option>
                  {(roles ?? []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </div>
              <Button disabled={!roleId} loading={assignRole.isPending} onClick={() => void act(() => assignRole.mutateAsync({ id, roleId }), "Role updated.")}>Assign</Button>
            </div>
          </CardBody></Card>
        </>
      )}
    </div>
  );
}
