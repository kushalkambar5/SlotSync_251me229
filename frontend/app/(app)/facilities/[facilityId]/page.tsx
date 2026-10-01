"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Users, Clock } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState } from "@/components/feedback/States";
import { FacilityStatusBadge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/api/errors";
import { todayISO } from "@/lib/utils/format";
import { useFacility, useAvailability } from "@/features/facilities/hooks";
import {
  AvailabilitySlotGrid,
  DateSelector,
} from "@/features/facilities/components/AvailabilityGrid";
import { DAY_NAMES } from "@/types/facility";

export default function FacilityDetailPage() {
  const params = useParams<{ facilityId: string }>();
  const id = params.facilityId;
  const { can } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState(todayISO());
  const [selected, setSelected] = useState<{ startTime: string; endTime: string } | null>(null);

  const facility = useFacility(id);
  const availability = useAvailability(id, date);

  const canBook = can(PERMISSIONS.BOOK_FACILITY);

  return (
    <div>
      <PageHeader
        title={facility.data?.name ?? "Facility"}
        description="Live availability is provided by the backend — what you see is what you can book."
        action={
          <Link href="/facilities" className="text-xs font-bold text-[#EF2B4D] hover:underline">
            ← All facilities
          </Link>
        }
      />

      {facility.isLoading ? (
        <LoadingState message="Loading facility…" />
      ) : facility.isError || !facility.data ? (
        <ErrorState
          message={getErrorMessage(facility.error, "Facility not found.")}
          onRetry={() => facility.refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardBody>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold">{facility.data.name}</h2>
                    <FacilityStatusBadge status={facility.data.status} />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {facility.data.typeName} · Code {facility.data.code}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />{" "}
                    {[facility.data.building, facility.data.floor].filter(Boolean).join(" · ")}
                    {facility.data.location ? ` — ${facility.data.location}` : ""}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                    <Users className="h-4 w-4" /> Capacity: {facility.data.capacity}
                  </p>
                  {facility.data.description && (
                    <p className="mt-3 text-sm text-gray-600">{facility.data.description}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <h3 className="mb-1 flex items-center gap-1.5 text-sm font-bold">
                  <Clock className="h-4 w-4 text-[#EF2B4D]" /> Operating hours
                </h3>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {facility.data.operatingHours.map((h) => (
                    <p key={h.dayOfWeek} className="text-xs text-gray-600">
                      <span className="font-semibold">{DAY_NAMES[h.dayOfWeek]}:</span>{" "}
                      {h.isClosed || !h.opensAt || !h.closesAt
                        ? "Closed"
                        : `${h.opensAt.slice(0, 5)} – ${h.closesAt.slice(0, 5)}`}
                    </p>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-sm font-bold">Check availability</h3>
              <div className="mt-3">
                <DateSelector value={date} onChange={(d) => { setDate(d); setSelected(null); }} min={todayISO()} />
              </div>
              {availability.data?.operatingHours && (
                <p className="mt-2 text-[11px] text-gray-500">
                  Hours:{" "}
                  {availability.data.operatingHours.isClosed
                    ? "Closed"
                    : `${availability.data.operatingHours.opensAt?.slice(0, 5)} – ${availability.data.operatingHours.closesAt?.slice(0, 5)}`}
                </p>
              )}
              <div className="mt-3">
                <AvailabilitySlotGrid
                  slots={availability.data?.slots}
                  selected={selected}
                  onSelect={(s) => setSelected({ startTime: s.startTime, endTime: s.endTime })}
                  loading={availability.isLoading}
                />
              </div>
              {availability.isError && (
                <p role="alert" className="mt-2 text-xs font-semibold text-red-600">
                  {getErrorMessage(availability.error)}
                </p>
              )}
              <div className="mt-4">
                {canBook ? (
                  <Button
                    className="w-full"
                    disabled={!selected}
                    onClick={() =>
                      selected &&
                      router.push(
                        `/bookings/new?facilityId=${id}&date=${date}&start=${selected.startTime}&end=${selected.endTime}`
                      )
                    }
                  >
                    {selected ? "Continue to booking →" : "Select a slot above"}
                  </Button>
                ) : (
                  <p className="rounded-xl bg-[#F4F5F7] px-3 py-2.5 text-center text-xs font-medium text-gray-600">
                    Students can view availability. Booking is available to
                    faculty and convenors.
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
