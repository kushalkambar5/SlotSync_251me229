import type { BookingStatus, FacilityStatus } from "@/types/api";

// Single source of truth for status colors — do not hardcode
// different colors for the same semantic status elsewhere.
const bookingStyles: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  CANCELLATION_REQUESTED: "bg-orange-100 text-orange-800 border-orange-200",
  CANCELLED: "bg-gray-200 text-gray-700 border-gray-300",
};

const facilityStyles: Record<FacilityStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  UNAVAILABLE: "bg-gray-200 text-gray-700 border-gray-300",
  MAINTENANCE: "bg-red-100 text-red-800 border-red-200",
};

const slotStyles: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  BOOKED: "bg-gray-200 text-gray-600 border-gray-300",
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  SELECTED: "bg-[#EF2B4D] text-white border-[#EF2B4D]",
  UNAVAILABLE: "bg-gray-100 text-gray-400 border-gray-200",
};

function Badge({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge className={bookingStyles[status]}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

export function FacilityStatusBadge({ status }: { status: FacilityStatus }) {
  return (
    <Badge className={facilityStyles[status]}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}

export function SlotStatusBadge({ status }: { status: string }) {
  return <Badge className={slotStyles[status] ?? slotStyles.UNAVAILABLE}>{status}</Badge>;
}
