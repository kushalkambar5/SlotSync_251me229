"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState, SuccessMessage } from "@/components/feedback/States";
import { BookingStatusBadge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDate, slotLabel } from "@/lib/utils/format";
import { useBooking, useRequestCancellation } from "@/features/bookings/hooks";
import { BookingTimeline } from "@/features/bookings/components/BookingCard";
import { CancellationDialog } from "@/features/bookings/components/BookingDialogs";

export default function BookingDetailPage() {
  const params = useParams<{ bookingId: string }>();
  const id = params.bookingId;
  const { user, can } = useAuth();
  const booking = useBooking(id);
  const cancelReq = useRequestCancellation();
  const [dialog, setDialog] = useState(false);
  const [ok, setOk] = useState<string | null>(null);

  const b = booking.data;
  const isOwner = b && user && b.userId === user.id;
  const canRequestCancel =
    !!b && !!isOwner && b.status === "APPROVED" && can(PERMISSIONS.CANCEL_BOOKING);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Booking details"
        action={<Link href="/bookings" className="text-xs font-bold text-[#EF2B4D] hover:underline">← My bookings</Link>}
      />
      {booking.isLoading ? <LoadingState /> : booking.isError || !b ? (
        <ErrorState message={getErrorMessage(booking.error, "Booking not found.")} onRetry={() => booking.refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {ok && <SuccessMessage message={ok} />}
          <Card><CardBody>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold">{b.facilityName ?? "Facility"}</h2>
                <p className="mt-1 text-sm text-gray-600">{formatDate(b.bookingDate)} · {slotLabel(b.startTime, b.endTime)}</p>
              </div>
              <BookingStatusBadge status={b.status} />
            </div>
            <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs font-bold text-gray-400 uppercase">Requester</dt><dd className="font-semibold">{b.userName ?? b.userId}</dd></div>
              <div><dt className="text-xs font-bold text-gray-400 uppercase">Purpose</dt><dd>{b.purpose || "—"}</dd></div>
              {b.rejectionReason && <div className="sm:col-span-2"><dt className="text-xs font-bold text-gray-400 uppercase">Rejection / review reason</dt><dd className="rounded-lg bg-red-50 px-3 py-2 text-red-800">{b.rejectionReason}</dd></div>}
              {b.createdAt && <div><dt className="text-xs font-bold text-gray-400 uppercase">Requested at</dt><dd>{new Date(b.createdAt).toLocaleString()}</dd></div>}
            </dl>
            {canRequestCancel && (
              <div className="mt-5 border-t border-gray-100 pt-4">
                <Button variant="outline" onClick={() => setDialog(true)}>Request cancellation</Button>
              </div>
            )}
          </CardBody></Card>
          <Card><CardBody>
            <h3 className="mb-3 text-sm font-bold">Lifecycle</h3>
            <BookingTimeline status={b.status} />
          </CardBody></Card>
        </div>
      )}
      <CancellationDialog
        open={dialog}
        onClose={() => setDialog(false)}
        onConfirm={async (reason) => {
          await cancelReq.mutateAsync({ id, reason });
          setOk("Cancellation requested. An admin will review it shortly.");
        }}
      />
    </div>
  );
}
