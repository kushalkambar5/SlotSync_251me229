"use client";

import Link from "next/link";
import { ClipboardList, Building2, Users, Bell } from "lucide-react";
import { RequirePermission } from "@/components/auth/ProtectedRoute";
import { PageHeader } from "@/components/layout/AppHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { LoadingState } from "@/components/feedback/States";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useAnalyticsOverview } from "@/features/analytics/api";
import { useBookings } from "@/features/bookings/hooks";
import { useCancellations } from "@/features/cancellations/hooks";
import { BookingCard } from "@/features/bookings/components/BookingCard";

export default function AdminDashboardPage() {
  return (
    <RequirePermission
      anyOf={[PERMISSIONS.APPROVE_BOOKING, PERMISSIONS.MANAGE_FACILITIES, PERMISSIONS.MANAGE_USERS, PERMISSIONS.VIEW_ANALYTICS]}
    >
      <AdminInner />
    </RequirePermission>
  );
}

function AdminInner() {
  const overview = useAnalyticsOverview();
  const pending = useBookings({ status: "PENDING", limit: 4 });
  const canc = useCancellations({ status: "PENDING", page: 1, limit: 20 });

  const byStatus = Object.fromEntries(
    (overview.data?.bookingsByStatus ?? []).map((r) => [r.status, r.count])
  );

  const cards = [
    { label: "Pending bookings", value: byStatus.PENDING ?? pending.data?.meta.total ?? "—", href: "/admin/bookings", icon: ClipboardList, tint: "bg-amber-100 text-amber-700" },
    { label: "Cancellation requests", value: canc.data?.meta.total ?? "—", href: "/admin/cancellations", icon: Bell, tint: "bg-orange-100 text-orange-700" },
    { label: "Approved bookings", value: byStatus.APPROVED ?? "—", href: "/admin/bookings", icon: ClipboardList, tint: "bg-emerald-100 text-emerald-700" },
    { label: "Total facilities", value: overview.data?.totalFacilities ?? "—", href: "/admin/facilities", icon: Building2, tint: "bg-blue-100 text-blue-700" },
  ];

  return (
    <div>
      <PageHeader title="Admin overview" description="Operational actions first: pending bookings, cancellations, facility status." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} href={c.href}>
              <Card className="transition-shadow hover:shadow-md"><CardBody className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.tint}`}><Icon className="h-5 w-5" /></span>
                <div><p className="text-lg font-extrabold">{overview.isLoading ? "…" : c.value}</p><p className="text-xs text-gray-500">{c.label}</p></div>
              </CardBody></Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold">Pending bookings</h2>
            <Link href="/admin/bookings" className="text-xs font-bold text-[#EF2B4D] hover:underline">Open queue →</Link>
          </div>
          {pending.isLoading ? <LoadingState /> : pending.data && pending.data.items.length > 0 ? (
            <div className="flex flex-col gap-3">{pending.data.items.map((b) => <BookingCard key={b.id} booking={b} />)}</div>
          ) : (
            <p className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">Queue is clear. 🎉</p>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-base font-bold">Quick links</h2>
          <div className="grid grid-cols-1 gap-2">
            {[
              { href: "/admin/facilities", icon: Building2, label: "Manage facilities", desc: "Create, edit, hours, status" },
              { href: "/admin/users", icon: Users, label: "Manage users", desc: "Status, roles, search" },
              { href: "/admin/analytics", label: "Analytics", desc: "Utilization, peaks, trends" },
              { href: "/admin/audit-logs", label: "Audit logs", desc: "Who did what, when" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm">
                <span className="font-bold text-sm">{l.label}</span>
                <span className="text-xs text-gray-500">· {l.desc}</span>
                <span className="ml-auto text-[#EF2B4D]">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
