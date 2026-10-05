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

  const venueLine = b
    ? [b.facilityBuilding, b.facilityFloor ? `Floor ${b.facilityFloor}` : null, b.facilityLocation]
        .filter(Boolean)
        .join(" · ")
    : "";

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
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  {b.facilityTypeName ?? "Facility"}{b.facilityCode ? ` · ${b.facilityCode}` : ""}
                </p>
                <h2 className="mt-1 text-xl font-extrabold">{b.facilityName ?? "Facility"}</h2>
                <p className="mt-1 text-sm text-gray-600">{formatDate(b.bookingDate)} · {slotLabel(b.startTime, b.endTime)}</p>
                {venueLine ? <p className="mt-1 text-sm text-gray-600">📍 {venueLine}</p> : null}
                {b.facilityCapacity != null ? (
                  <p className="mt-1 text-xs text-gray-500">Capacity: {b.facilityCapacity}</p>
                ) : null}
              </div>
              <BookingStatusBadge status={b.status} />
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2">
              <div><dt className="text-xs font-bold text-gray-400 uppercase">Date</dt><dd className="font-semibold">{formatDate(b.bookingDate)}</dd></div>
              <div><dt className="text-xs font-bold text-gray-400 uppercase">Time slot</dt><dd className="font-semibold">{slotLabel(b.startTime, b.endTime)}</dd></div>
              <div><dt className="text-xs font-bold text-gray-400 uppercase">Room / Facility</dt><dd>{b.facilityName ?? "—"}</dd></div>
              <div><dt className="text-xs font-bold text-gray-400 uppercase">Facility code</dt><dd>{b.facilityCode ?? "—"}</dd></div>
              <div><dt className="text-xs font-bold text-gray-400 uppercase">Building</dt><dd>{b.facilityBuilding ?? "—"}</dd></div>
              <div><dt className="text-xs font-bold text-gray-400 uppercase">Floor / Room no.</dt><dd>{b.facilityFloor ?? "—"}</dd></div>
              <div><dt className="text-xs font-bold text-gray-400 uppercase">Location</dt><dd>{b.facilityLocation ?? "—"}</dd></div>
              <div><dt className="text-xs font-bold text-gray-400 uppercase">Type</dt><dd>{b.facilityTypeName ?? "—"}</dd></div>
              <div>
                <dt className="text-xs font-bold text-gray-400 uppercase">Requester</dt>
                <dd className="font-semibold">{b.userName ?? b.userId}</dd>
                {b.userEmail && <dd className="text-xs text-gray-500">{b.userEmail}</dd>}
              </div>
              <div><dt className="text-xs font-bold text-gray-400 uppercase">Purpose</dt><dd>{b.purpose || "—"}</dd></div>
              {b.createdAt && <div><dt className="text-xs font-bold text-gray-400 uppercase">Requested at</dt><dd>{new Date(b.createdAt).toLocaleString()}</dd></div>}
              <div><dt className="text-xs font-bold text-gray-400 uppercase">Booking ID</dt><dd className="break-all font-mono text-xs">{b.id}</dd></div>
              {b.rejectionReason && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold text-gray-400 uppercase">Rejection / review reason</dt>
                  <dd className="mt-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{b.rejectionReason}</dd>
                </div>
              )}
            </dl>

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
