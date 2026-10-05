"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequirePermission } from "@/components/auth/ProtectedRoute";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState, SuccessMessage } from "@/components/feedback/States";
import { Button } from "@/components/ui/Button";
import { Textarea, Label, FieldError, Select } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getErrorMessage, conflictMessage, getErrorCode } from "@/lib/api/errors";
import { todayISO, slotLabel } from "@/lib/utils/format";
import { useFacilities, useAvailability } from "@/features/facilities/hooks";
import { AvailabilitySlotGrid, DateSelector } from "@/features/facilities/components/AvailabilityGrid";
import { useCreateBooking, useBookings } from "@/features/bookings/hooks";

const detailsSchema = z.object({
  purpose: z.string().max(2000, "Keep it under 2000 characters.").optional(),
});

function WizardInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [step, setStep] = useState(1);
  const [facilityId, setFacilityId] = useState(search.get("facilityId") ?? "");
  const [date, setDate] = useState(search.get("date") ?? todayISO());
  const [slot, setSlot] = useState<{ startTime: string; endTime: string } | null>(
    search.get("start") && search.get("end")
      ? { startTime: search.get("start")!, endTime: search.get("end")! }
      : null
  );
  const [done, setDone] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const facilities = useFacilities({ limit: 100 });
  const availability = useAvailability(facilityId, facilityId ? date : null);
  const create = useCreateBooking();
  // Proactive daily-limit guard: the backend allows 1 active slot per day per
  // user across ALL facilities, but availability is per-facility. Surface the
  // user's existing booking for the chosen date before they pick a slot.
  const dayBookings = useBookings({ date: date || undefined, limit: 5 });

  const facility = useMemo(
    () => (facilities.data?.items ?? []).find((f) => f.id === facilityId),
    [facilities.data, facilityId]
  );

  const activeBookingForDate = useMemo(() => {
    const items = dayBookings.data?.items ?? [];
    return (
      items.find((b) =>
        ["PENDING", "APPROVED", "CANCELLATION_REQUESTED"].includes(b.status)
      ) ?? null
    );
  }, [dayBookings.data]);

  // The selected slot may have become BOOKED since the grid was rendered
  // (stale deep-link or concurrent booking). Block continuing in that case.
  const selectedSlotBooked = useMemo(() => {
    if (!slot || !availability.data?.slots) return false;
    const match = availability.data.slots.find(
      (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
    );
    return match?.status === "BOOKED";
  }, [slot, availability.data]);

  const { register, handleSubmit, formState } = useForm<{ purpose?: string }>({
    resolver: zodResolver(detailsSchema),
  });

  const goToStep = (n: number) => {
    // Clear stale submit errors when the user changes context.
    setSubmitError(null);
    setStep(n);
  };

  const submit = async (v: { purpose?: string }) => {
    if (!facilityId || !slot) return;
    setSubmitError(null);
    try {
      const booking = await create.mutateAsync({
        facilityId,
        bookingDate: date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        purpose: v.purpose?.trim() || undefined,
      });
      setDone(booking.id);
      setStep(5);
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = getErrorCode(e);
      setSubmitError(status === 409 ? conflictMessage(e) : getErrorMessage(e));
      if (status === 409 && code !== "DAILY_BOOKING_LIMIT_REACHED") {
        // True slot conflict — refresh availability and send back to slot
        // step where the (now BOOKED) slot is disabled. The error is kept in
        // state so it stays visible on step 3.
        availability.refetch();
        dayBookings.refetch();
        setStep(3);
      }
      // DAILY_BOOKING_LIMIT_REACHED (and other errors): stay on step 4 so the
      // message above stays visible instead of looping back to slot picking.
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Request a booking" description="Five quick steps. Your request goes to an admin as Pending." />
      {/* Stepper */}
      <ol className="mb-6 flex items-center gap-1 text-[11px] font-bold" aria-label="Booking progress">
        {["Facility", "Date", "Slot", "Details", "Done"].map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const past = step > n;
          return (
            <li key={label} className="flex flex-1 items-center gap-1">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${active ? "bg-[#EF2B4D] text-white" : past ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>{n}</span>
              <span className={active ? "text-[#EF2B4D]" : "text-gray-500"}>{label}</span>
              {n < 5 && <span className="mx-1 h-0.5 flex-1 bg-gray-200" />}
            </li>
          );
        })}
      </ol>

      <Card><CardBody>
        {step === 1 && (
          <div>
            <Label htmlFor="bw-facility" required>Step 1 — Choose facility</Label>
            {facilities.isLoading ? <LoadingState /> : facilities.isError ? (
              <ErrorState message={getErrorMessage(facilities.error)} onRetry={() => facilities.refetch()} />
            ) : (
              <Select id="bw-facility" value={facilityId} onChange={(e) => setFacilityId(e.target.value)}>
                <option value="">Select a facility…</option>
                {(facilities.data?.items ?? []).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} · {f.building ?? ""} · cap {f.capacity} · {f.status}
                  </option>
                ))}
              </Select>
            )}
            <div className="mt-4 flex justify-end">
              <Button disabled={!facilityId} onClick={() => setStep(2)}>Continue →</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-3 text-sm font-semibold">Step 2 — Choose date {facility && <span className="text-gray-500">for {facility.name}</span>}</p>
            <DateSelector value={date} onChange={(d) => { setDate(d); setSlot(null); setSubmitError(null); }} min={todayISO()} />
            {activeBookingForDate && (
              <p role="alert" className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                You already have an active booking on {date} ({activeBookingForDate.facilityName ?? "another facility"} · {activeBookingForDate.status}). Limit: 1 active slot per day — pick a different date or manage your existing booking in <Link href="/bookings" className="underline">My bookings</Link>.
              </p>
            )}
            <div className="mt-4 flex justify-between">
              <Button variant="secondary" onClick={() => goToStep(1)}>← Back</Button>
              <Button onClick={() => { setSlot(null); goToStep(3); }}>Continue →</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-3 text-sm font-semibold">Step 3 — Pick a 1-hour slot <span className="text-gray-500">({date})</span></p>
            {submitError && (
              <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200">{submitError}</p>
            )}
            {activeBookingForDate && (
              <p role="alert" className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                You already have an active booking on {date} ({activeBookingForDate.status}). You can&apos;t request another slot that day — see <Link href="/bookings" className="underline">My bookings</Link>.
              </p>
            )}
            {availability.isError ? (
              <ErrorState message={getErrorMessage(availability.error)} onRetry={() => availability.refetch()} />
            ) : (
              <AvailabilitySlotGrid slots={availability.data?.slots} selected={slot} onSelect={(s) => { setSlot({ startTime: s.startTime, endTime: s.endTime }); setSubmitError(null); }} loading={availability.isLoading} />
            )}
            {selectedSlotBooked && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                The selected slot was just booked by someone else. Please pick another slot.
              </p>
            )}
            <div className="mt-4 flex justify-between">
              <Button variant="secondary" onClick={() => goToStep(2)}>← Back</Button>
              <Button disabled={!slot || selectedSlotBooked || !!activeBookingForDate} onClick={() => goToStep(4)}>Continue →</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <form onSubmit={handleSubmit(submit)}>
            <p className="mb-3 text-sm font-semibold">
              Step 4 — Details: {facility?.name} · {date} · {slot && slotLabel(slot.startTime, slot.endTime)}
            </p>
            {activeBookingForDate && (
              <p role="alert" className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                You already have an active booking on {date} ({activeBookingForDate.status}). Submitting will be rejected — limit is 1 active slot per day. Manage it in <Link href="/bookings" className="underline">My bookings</Link>.
              </p>
            )}
            {selectedSlotBooked && (
              <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                This slot is no longer available (just booked). Go back and pick another slot.
              </p>
            )}
            <Label htmlFor="bw-purpose">Purpose / details (optional)</Label>
            <Textarea id="bw-purpose" rows={3} placeholder="e.g. CSE seminar practice session…" {...register("purpose")} />
            <FieldError message={formState.errors.purpose?.message} />
            {submitError && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200">{submitError}</p>}
            <div className="mt-4 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => goToStep(3)}>← Back</Button>
              <Button type="submit" loading={create.isPending} disabled={!!activeBookingForDate || selectedSlotBooked}>Submit request</Button>
            </div>
            <p className="mt-3 text-[11px] text-gray-500">Limit: 1 active slot per day per user. The backend enforces overlap prevention.</p>
          </form>
        )}

        {step === 5 && done && (
          <div className="flex flex-col gap-4 text-center">
            <SuccessMessage message="Booking requested! Status: PENDING — an admin will approve or reject it, and you'll be notified." />
            <div className="flex justify-center gap-2">
              <Link href={`/bookings/${done}`} className="rounded-lg bg-[#EF2B4D] px-4 py-2 text-sm font-bold text-white hover:bg-[#D81E40]">View booking →</Link>
              <Link href="/bookings" className="rounded-lg bg-[#F4F5F7] px-4 py-2 text-sm font-bold text-[#1F1F1F] hover:bg-gray-200">My bookings</Link>
            </div>
          </div>
        )}
      </CardBody></Card>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <RequirePermission permission={PERMISSIONS.BOOK_FACILITY}>
      <Suspense fallback={<LoadingState />}>
        <WizardInner />
      </Suspense>
    </RequirePermission>
  );
}
