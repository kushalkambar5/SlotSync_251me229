"use client";

import Link from "next/link";
import { Building2, CalendarCheck, Bell, ShieldCheck } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/AppHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { useBookings } from "@/features/bookings/hooks";
import { useUnreadCount } from "@/features/notifications/hooks";
import { useFacilities } from "@/features/facilities/hooks";
import { BookingCard } from "@/features/bookings/components/BookingCard";
import { LoadingState } from "@/components/feedback/States";

export default function DashboardPage() {
  const { user, can } = useAuth();
  const canBook = can(PERMISSIONS.BOOK_FACILITY);
  const isAdmin = can(PERMISSIONS.APPROVE_BOOKING);
  const bookings = useBookings({ limit: 5 });
  const pending = useBookings(isAdmin ? { status: "PENDING", limit: 5 } : { limit: 0 });
  const facilities = useFacilities({ limit: 4 });
  const unread = useUnreadCount();

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(" ")[0] ?? "there"} 👋`}
        description={
          canBook
            ? "Find a facility, check live availability, and request your 1-hour slot."
            : "Browse facilities and view live availability. Booking is available to faculty and convenors."
        }
        action={
          canBook ? (
            <Link
              href="/bookings/new"
              className="rounded-lg bg-[#EF2B4D] px-4 py-2 text-sm font-bold text-white hover:bg-[#D81E40]"
            >
              + Quick Book
            </Link>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card><CardBody className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FDE8EB] text-[#EF2B4D]"><Building2 className="h-5 w-5" /></span>
          <div><p className="text-lg font-extrabold">{facilities.data?.meta.total ?? "—"}</p><p className="text-xs text-gray-500">Facilities</p></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><CalendarCheck className="h-5 w-5" /></span>
          <div><p className="text-lg font-extrabold">{bookings.data?.meta.total ?? "—"}</p><p className="text-xs text-gray-500">My bookings</p></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><Bell className="h-5 w-5" /></span>
          <div><p className="text-lg font-extrabold">{unread.data?.unreadCount ?? "—"}</p><p className="text-xs text-gray-500">Unread alerts</p></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><ShieldCheck className="h-5 w-5" /></span>
          <div><p className="text-sm font-extrabold">{user?.roleName ?? "—"}</p><p className="text-xs text-gray-500">Your role</p></div>
        </CardBody></Card>
      </div>

      {isAdmin && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold">Pending approvals</h2>
            <Link href="/admin/bookings" className="text-xs font-bold text-[#EF2B4D] hover:underline">Review all →</Link>
          </div>
          {pending.isLoading ? <LoadingState /> : pending.data && pending.data.items.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {pending.data.items.map((b) => <BookingCard key={b.id} booking={b} />)}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">No pending approvals. 🎉</p>
          )}
        </div>
      )}

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">Recent bookings</h2>
          <Link href="/bookings" className="text-xs font-bold text-[#EF2B4D] hover:underline">View all →</Link>
        </div>
        {bookings.isLoading ? <LoadingState /> : bookings.data && bookings.data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {bookings.data.items.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">
            No bookings yet.{" "}
            {canBook ? <Link href="/bookings/new" className="font-bold text-[#EF2B4D]">Request your first slot →</Link> : "Check facility availability to get started."}
          </div>
        )}
      </div>
    </div>
  );
}
