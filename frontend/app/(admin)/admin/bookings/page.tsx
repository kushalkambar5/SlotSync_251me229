"use client";

import Link from "next/link";
import { useState } from "react";
import { RequirePermission } from "@/components/auth/ProtectedRoute";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/feedback/States";
import { Pagination } from "@/components/ui/Pagination";
import { Select, Label, Input } from "@/components/ui/Input";
import { BookingStatusBadge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDate, slotLabel } from "@/lib/utils/format";
import { useBookings } from "@/features/bookings/hooks";

export default function AdminBookingsPage() {
  return (
    <RequirePermission anyOf={[PERMISSIONS.APPROVE_BOOKING, PERMISSIONS.REJECT_BOOKING]}>
      <AdminBookingsInner />
    </RequirePermission>
  );
}

function AdminBookingsInner() {
  const [status, setStatus] = useState("PENDING");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const list = useBookings({ status: status || undefined, date: date || undefined, page, limit: 15 });

  return (
    <div>
      <PageHeader title="Booking approvals" description="Review pending requests. Approve, or reject with a reason." />
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="ab-status">Status</Label>
          <Select id="ab-status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLATION_REQUESTED">Cancellation requested</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="ab-date">Date</Label>
          <Input id="ab-date" type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }} />
        </div>
      </div>
      {list.isLoading ? <LoadingState /> : list.isError ? (
        <ErrorState message={getErrorMessage(list.error)} onRetry={() => list.refetch()} />
      ) : (list.data?.items ?? []).length === 0 ? (
        <EmptyState title="No bookings in this view." hint="Try a different status or date." />
      ) : (
        <>
          <Card><CardBody className="overflow-x-auto p-0">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                  <th className="px-4 py-3">Facility / slot</th>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {((list.data?.items) ?? []).map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <p className="font-bold">{b.facilityName}</p>
                      <p className="text-xs text-gray-500">{formatDate(b.bookingDate)} · {slotLabel(b.startTime, b.endTime)}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{b.userName}</td>
                    <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/bookings/${b.id}`} className="text-xs font-bold text-[#EF2B4D] hover:underline">Review →</Link>
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
