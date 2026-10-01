"use client";

import { useState } from "react";
import { RequirePermission } from "@/components/auth/ProtectedRoute";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState, EmptyState, SuccessMessage } from "@/components/feedback/States";
import { Pagination } from "@/components/ui/Pagination";
import { Select, Label } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDate, slotLabel } from "@/lib/utils/format";
import { useCancellations, useApproveCancellation, useRejectCancellation } from "@/features/cancellations/hooks";
import { RejectBookingDialog, ConfirmDialog } from "@/features/bookings/components/BookingDialogs";

export default function AdminCancellationsPage() {
  return (
    <RequirePermission anyOf={[PERMISSIONS.APPROVE_CANCELLATION, PERMISSIONS.REJECT_CANCELLATION]}>
      <CancellationsInner />
    </RequirePermission>
  );
}

function CancellationsInner() {
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);
  const list = useCancellations({ status: status || undefined, page, limit: 15 });
  const approve = useApproveCancellation();
  const reject = useRejectCancellation();
  const [target, setTarget] = useState<{ id: string; mode: "approve" | "reject" } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div>
      <PageHeader title="Cancellation requests" description="Approve to cancel the booking, or reject to keep it approved." />
      {msg && <div className="mb-4"><SuccessMessage message={msg} /></div>}
      <div className="mb-4">
        <Label htmlFor="cx-status">Status</Label>
        <Select id="cx-status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="max-w-48">
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </Select>
      </div>
      {list.isLoading ? <LoadingState /> : list.isError ? (
        <ErrorState message={getErrorMessage(list.error)} onRetry={() => list.refetch()} />
      ) : (list.data?.items ?? []).length === 0 ? (
        <EmptyState title="No cancellation requests." hint="Approved bookings can be sent here by their owners." />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {((list.data?.items) ?? []).map((c) => (
              <Card key={c.id}>
                <CardBody className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">
                      {c.bookingDate ? formatDate(c.bookingDate) : ""} · {c.startTime && c.endTime ? slotLabel(c.startTime, c.endTime) : ""}
                    </p>
                    <p className="text-xs text-gray-500">Booking {c.bookingId.slice(0, 8)}… · requested by {c.requestedBy.slice(0, 8)}…</p>
                    <p className="mt-1 text-sm text-gray-700">Reason: {c.reason}</p>
                    <p className="mt-1 text-[11px] font-bold text-gray-500">STATUS: {c.status}</p>
                  </div>
                  {c.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setTarget({ id: c.id, mode: "approve" })}>Approve</Button>
                      <Button size="sm" variant="danger" onClick={() => setTarget({ id: c.id, mode: "reject" })}>Reject</Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
          <Pagination page={list.data?.meta.page ?? 1} total={list.data?.meta.total ?? 0} limit={list.data?.meta.limit ?? 15} onPage={setPage} />
        </>
      )}
      <ConfirmDialog
        open={target?.mode === "approve"}
        onClose={() => setTarget(null)}
        title="Approve cancellation?"
        description="The booking becomes CANCELLED and the first waitlisted user (if any) is promoted and notified."
        confirmLabel="Approve cancellation"
        loading={approve.isPending}
        onConfirm={async () => {
          if (!target) return;
          await approve.mutateAsync(target.id);
          setMsg("Cancellation approved — booking is now cancelled.");
          setTarget(null);
        }}
      />
      <RejectBookingDialog
        open={target?.mode === "reject"}
        onClose={() => setTarget(null)}
        onConfirm={async (reason) => {
          if (!target) return;
          await reject.mutateAsync({ id: target.id, reason });
          setMsg("Cancellation rejected — booking remains approved.");
          setTarget(null);
        }}
      />
    </div>
  );
}
