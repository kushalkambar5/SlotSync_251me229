import { ProtectedRoute, RequirePermission } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { PERMISSIONS } from "@/lib/auth/permissions";

const ADMIN_ANY = [
  PERMISSIONS.APPROVE_BOOKING,
  PERMISSIONS.MANAGE_FACILITIES,
  PERMISSIONS.MANAGE_USERS,
  PERMISSIONS.MANAGE_ROLES,
  PERMISSIONS.VIEW_ANALYTICS,
  PERMISSIONS.VIEW_AUDIT_LOGS,
];

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <RequirePermission anyOf={ADMIN_ANY}>
        <AppShell>{children}</AppShell>
      </RequirePermission>
    </ProtectedRoute>
  );
}
