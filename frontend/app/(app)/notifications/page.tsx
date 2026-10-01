"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/feedback/States";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/api/errors";
import { useNotifications, useMarkRead, useMarkAllRead } from "@/features/notifications/hooks";

const typeColor: Record<string, string> = {
  BOOKING_APPROVED: "bg-emerald-100 text-emerald-800",
  CANCELLATION_APPROVED: "bg-emerald-100 text-emerald-800",
  WAITLIST_PROMOTED: "bg-emerald-100 text-emerald-800",
  BOOKING_REJECTED: "bg-red-100 text-red-800",
  CANCELLATION_REJECTED: "bg-red-100 text-red-800",
  BOOKING_REMINDER: "bg-amber-100 text-amber-800",
};

export default function NotificationsPage() {
  const list = useNotifications({ limit: 30 });
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Approvals, rejections, reminders (30 min before your slot) and waitlist promotions."
        action={<Button variant="secondary" size="sm" onClick={() => markAll.mutate()} disabled={markAll.isPending}>Mark all read</Button>}
      />
      {list.isLoading ? <LoadingState /> : list.isError ? (
        <ErrorState message={getErrorMessage(list.error)} onRetry={() => list.refetch()} />
      ) : (list.data?.items ?? []).length === 0 ? (
        <EmptyState title="No notifications." hint="Booking updates and reminders will appear here." />
      ) : (
        <div className="flex flex-col gap-2">
          {(list.data?.items ?? []).map((n) => (
            <Card key={n.id} className={n.isRead ? "opacity-75" : "ring-1 ring-[#EF2B4D]/30"}>
              <CardBody className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${typeColor[n.type] ?? "bg-gray-100 text-gray-700"}`}>
                      {n.type.replace(/_/g, " ")}
                    </span>
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-[#EF2B4D]" aria-label="Unread" />}
                  </div>
                  <p className="mt-1 text-sm font-bold">{n.title}</p>
                  <p className="text-xs text-gray-600">{n.message}</p>
                  <p className="mt-1 text-[11px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                  {n.bookingId && (
                    <Link href={`/bookings/${n.bookingId}`} className="mt-1 inline-block text-xs font-bold text-[#EF2B4D] hover:underline">
                      View booking →
                    </Link>
                  )}
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => markRead.mutate(n.id)}
                    className="shrink-0 rounded-lg bg-[#F4F5F7] px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-200"
                  >
                    Mark read
                  </button>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
