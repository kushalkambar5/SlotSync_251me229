"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequirePermission } from "@/components/auth/ProtectedRoute";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState } from "@/components/feedback/States";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { SuccessMessage } from "@/components/feedback/States";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getErrorMessage } from "@/lib/api/errors";
import { rbacApi } from "@/features/users/api";
import { useRoles, useRole, usePermissions, useCreateRole, useToggleRolePermission } from "@/features/users/hooks";

const roleSchema = z.object({
  name: z.string().min(2, "Name required."),
  description: z.string().optional(),
});

export default function RolesPage() {
  return (
    <RequirePermission permission={PERMISSIONS.MANAGE_ROLES}>
      <RolesInner />
    </RequirePermission>
  );
}

function RolesInner() {
  const roles = useRoles();
  const perms = usePermissions();
  const create = useCreateRole();
  const toggle = useToggleRolePermission();
  const [selected, setSelected] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const detail = useRole(selected ?? "");

  const { register, handleSubmit, reset, formState } = useForm<{ name: string; description?: string }>({
    resolver: zodResolver(roleSchema),
  });

  const onCreate = async (v: { name: string; description?: string }) => {
    setErr(null); setOk(null);
    try {
      await create.mutateAsync({ name: v.name.trim(), description: v.description || undefined });
      reset();
      setOk("Role created.");
    } catch (e) { setErr(getErrorMessage(e)); }
  };

  const flip = async (permissionId: string, grant: boolean) => {
    if (!selected) return;
    setErr(null);
    try {
      await toggle.mutateAsync({ roleId: selected, permissionId, grant });
    } catch (e) { setErr(getErrorMessage(e)); }
  };

  const granted = new Set((detail.data?.permissions ?? []).map((p) => p.id));

  return (
    <div>
      <PageHeader title="Roles & permissions" description="Configurable RBAC — mirrors the backend permission model. Changes apply immediately." />
      {ok && <div className="mb-4"><SuccessMessage message={ok} /></div>}
      {err && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200">{err}</p>}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardBody>
          <h2 className="text-sm font-bold">Roles</h2>
          {roles.isLoading ? <LoadingState /> : roles.isError ? (
            <ErrorState message={getErrorMessage(roles.error)} onRetry={() => roles.refetch()} />
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              {(roles.data ?? []).map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r.id)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left ${selected === r.id ? "border-[#EF2B4D] ring-1 ring-[#EF2B4D]/30" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <span><span className="block text-sm font-bold">{r.name}</span>
                    <span className="text-[11px] text-gray-500">{r.isSystemRole ? "System role" : "Custom"} · {r.isActive ? "Active" : "Inactive"}</span></span>
                  <span className="text-[#EF2B4D]">→</span>
                </button>
              ))}
            </div>
          )}
          <h3 className="mt-5 text-sm font-bold">Create role</h3>
          <form onSubmit={handleSubmit(onCreate)} className="mt-2 flex flex-col gap-2">
            <div><Label htmlFor="role-name">Name</Label><Input id="role-name" placeholder="EVENT_MANAGER" {...register("name")} /><FieldError message={formState.errors.name?.message} /></div>
            <div><Label htmlFor="role-desc">Description</Label><Input id="role-desc" {...register("description")} /></div>
            <div><Button type="submit" size="sm" loading={create.isPending}>Create role</Button></div>
          </form>
        </CardBody></Card>

        <Card><CardBody>
          <h2 className="text-sm font-bold">Permissions {detail.data ? `— ${detail.data.name}` : ""}</h2>
          {!selected ? (
            <p className="mt-2 text-sm text-gray-500">Select a role to view its permission matrix.</p>
          ) : detail.isLoading ? <LoadingState /> : detail.isError ? (
            <ErrorState message={getErrorMessage(detail.error)} onRetry={() => detail.refetch()} />
          ) : (
            <div className="mt-2 flex flex-col gap-1.5">
              {(perms.data ?? []).map((p) => {
                const has = granted.has(p.id);
                return (
                  <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-lg bg-[#F4F5F7]/60 px-3 py-2 hover:bg-[#F4F5F7]">
                    <input
                      type="checkbox"
                      checked={has}
                      disabled={toggle.isPending}
                      onChange={(e) => void flip(p.id, e.target.checked)}
                      aria-label={p.name}
                    />
                    <span className="text-xs font-bold">{p.name}</span>
                    {p.description && <span className="text-[11px] text-gray-500">· {p.description}</span>}
                  </label>
                );
              })}
            </div>
          )}
        </CardBody></Card>
      </div>
    </div>
  );
}

// re-export to keep tree-shakable single import site
export { rbacApi as _rbacApi };
