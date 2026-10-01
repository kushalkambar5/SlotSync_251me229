"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/feedback/States";
import { Pagination } from "@/components/ui/Pagination";
import { Select, Label } from "@/components/ui/Input";
import { BookingCard } from "@/features/bookings/components/BookingCard";
import { useBookings } from "@/features/bookings/hooks";
import { getErrorMessage } from "@/lib/api/errors";
import { BOOKING_STATUSES } from "@/types/booking";
import { useAuth } from "@/providers/AuthProvider";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function MyBookingsPage() {
  const { can } = useAuth();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const list = useBookings({ status: status || undefined, page, limit: 9 });

  return (
    <div>
      <PageHeader
        title="My bookings"
        description="Track every request: pending, approved, rejected, cancellation-requested, cancelled."
        action={
          can(PERMISSIONS.BOOK_FACILITY) ? (
            <Link href="/bookings/new" className="rounded-lg bg-[#EF2B4D] px-4 py-2 text-sm font-bold text-white hover:bg-[#D81E40]">
              + New booking
            </Link>
          ) : undefined
        }
      />
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="bk-status">Status filter</Label>
          <Select id="bk-status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </Select>
        </div>
      </div>
      {list.isLoading ? <LoadingState message="Loading bookings…" /> : list.isError ? (
        <ErrorState message={getErrorMessage(list.error)} onRetry={() => list.refetch()} />
      ) : (list.data?.items ?? []).length === 0 ? (
        <EmptyState
          title="No bookings yet."
          hint={can(PERMISSIONS.BOOK_FACILITY) ? "Request your first 1-hour slot — it takes under a minute." : undefined}
          action={can(PERMISSIONS.BOOK_FACILITY) ? <Link href="/bookings/new" className="rounded-lg bg-[#EF2B4D] px-4 py-2 text-sm font-bold text-white">Request a slot</Link> : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(list.data?.items ?? []).map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
          <Pagination page={list.data?.meta.page ?? 1} total={list.data?.meta.total ?? 0} limit={list.data?.meta.limit ?? 9} onPage={setPage} />
        </>
      )}
    </div>
  );
}
