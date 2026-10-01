"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RequirePermission } from "@/components/auth/ProtectedRoute";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState, SuccessMessage } from "@/components/feedback/States";
import { BookingStatusBadge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDate, slotLabel } from "@/lib/utils/format";
import { useBooking, useApproveBooking, useRejectBooking } from "@/features/bookings/hooks";
import { BookingTimeline } from "@/features/bookings/components/BookingCard";
import { RejectBookingDialog, ConfirmDialog } from "@/features/bookings/components/BookingDialogs";

export default function AdminBookingDetailPage() {
  return (
    <RequirePermission anyOf={[PERMISSIONS.APPROVE_BOOKING, PERMISSIONS.REJECT_BOOKING]}>
      <AdminBookingInner />
    </RequirePermission>
  );
}

function AdminBookingInner() {
  const params = useParams<{ bookingId: string }>();
  const id = params.bookingId;
  const router = useRouter();
  const booking = useBooking(id);
  const approve = useApproveBooking();
  const reject = useRejectBooking();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const b = booking.data;
  const pending = b?.status === "PENDING";

  const doApprove = async () => {
    setErr(null);
    try {
      await approve.mutateAsync(id);
      setMsg("Booking approved. The requester has been notified.");
      setApproveOpen(false);
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Review booking" action={<Link href="/admin/bookings" className="text-xs font-bold text-[#EF2B4D] hover:underline">← Queue</Link>} />
      {booking.isLoading ? <LoadingState /> : booking.isError || !b ? (
        <ErrorState message={getErrorMessage(booking.error, "Booking not found.")} onRetry={() => booking.refetch()} />
      ) : (
        <>
          {msg && <div className="mb-4"><SuccessMessage message={msg} /></div>}
          {err && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200">{err}</p>}
          <Card><CardBody>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold">{b.facilityName}</h2>
                <p className="text-sm text-gray-600">{formatDate(b.bookingDate)} · {slotLabel(b.startTime, b.endTime)}</p>
                <p className="mt-1 text-sm text-gray-600">Requester: <strong>{b.userName}</strong></p>
                {b.purpose && <p className="mt-2 text-sm text-gray-600">Purpose: {b.purpose}</p>}
                {b.rejectionReason && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">Reason: {b.rejectionReason}</p>}
              </div>
              <BookingStatusBadge status={b.status} />
            </div>
            {pending && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                <Button onClick={() => setApproveOpen(true)} loading={approve.isPending}>Approve booking</Button>
                <Button variant="danger" onClick={() => setRejectOpen(true)}>Reject with reason</Button>
              </div>
            )}
          </CardBody></Card>
          <Card className="mt-4"><CardBody>
            <h3 className="mb-3 text-sm font-bold">Lifecycle</h3>
            <BookingTimeline status={b.status} />
          </CardBody></Card>
          {msg && (
            <div className="mt-4">
              <Button variant="secondary" onClick={() => router.push("/admin/bookings")}>Back to queue</Button>
            </div>
          )}
        </>
      )}
      <ConfirmDialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        title="Approve this booking?"
        description="The slot will be locked for this requester and they will be notified. Overlaps are re-checked by the backend."
        confirmLabel="Confirm approval"
        loading={approve.isPending}
        onConfirm={doApprove}
      />
      <RejectBookingDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={async (reason) => {
          setErr(null);
          try {
            await reject.mutateAsync({ id, reason });
            setMsg("Booking rejected with reason. The requester has been notified.");
          } catch (e) {
            setErr(getErrorMessage(e));
            throw e;
          }
        }}
      />
    </div>
  );
}
