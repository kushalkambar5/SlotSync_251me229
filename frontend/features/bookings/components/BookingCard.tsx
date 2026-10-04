"use client";

import Link from "next/link";
import { formatDate, slotLabel } from "@/lib/utils/format";
import { BookingStatusBadge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import type { Booking } from "@/types/booking";

export function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#1F1F1F]">
              {booking.facilityName ?? "Facility"}
            </h3>
            <p className="text-xs text-gray-500">
              {formatDate(booking.bookingDate)} ·{" "}
              {slotLabel(booking.startTime, booking.endTime)}
            </p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>
        {booking.purpose && (
          <p className="line-clamp-2 text-xs text-gray-600">{booking.purpose}</p>
        )}
        <Link
          href={`/bookings/${booking.id}`}
          className="mt-1 text-xs font-bold text-[#EF2B4D] hover:underline"
        >
          View details →
        </Link>
      </CardBody>
    </Card>
  );
}

const STEPS = [
  "Requested",
  "Pending approval",
  "Approved",
  "Cancellation requested",
  "Cancelled",
];

export function BookingTimeline({ status }: { status: Booking["status"] }) {
  // Show only states that apply.
  const flow: Booking["status"][] =
    status === "REJECTED"
      ? ["PENDING", "REJECTED"]
      : status === "CANCELLED"
        ? ["PENDING", "APPROVED", "CANCELLATION_REQUESTED", "CANCELLED"]
        : status === "CANCELLATION_REQUESTED"
          ? ["PENDING", "APPROVED", "CANCELLATION_REQUESTED"]
          : status === "APPROVED"
            ? ["PENDING", "APPROVED"]
            : ["PENDING"];
  void STEPS;
  // Final-step color follows the same semantics as BookingStatusBadge:
  // approved/cancelled = green, rejected = red, in-between = amber/orange.
  const finalStyles: Record<string, string> = {
    PENDING: "bg-amber-500 text-white",
    APPROVED: "bg-emerald-500 text-white",
    REJECTED: "bg-red-500 text-white",
    CANCELLATION_REQUESTED: "bg-orange-500 text-white",
    CANCELLED: "bg-emerald-500 text-white",
  };
  return (
    <ol className="flex flex-col gap-0" aria-label="Booking timeline">
      {flow.map((s, i) => (
        <li key={s} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                i === flow.length - 1
                  ? (finalStyles[s] ?? "bg-[#EF2B4D] text-white")
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {i + 1}
            </span>
            {i < flow.length - 1 && <span className="h-5 w-0.5 bg-gray-200" />}
          </div>
          <p className="pb-3 text-sm font-medium text-[#1F1F1F]">
            {s.replace(/_/g, " ")}
          </p>
        </li>
      ))}
    </ol>
  );
}
