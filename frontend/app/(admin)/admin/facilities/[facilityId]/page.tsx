"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequirePermission } from "@/components/auth/ProtectedRoute";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState, SuccessMessage } from "@/components/feedback/States";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, Label, FieldError } from "@/components/ui/Input";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getErrorMessage } from "@/lib/api/errors";
import { DAY_NAMES } from "@/types/facility";
import { useFacility, useOperatingHours, useUpdateFacility, useUpdateFacilityStatus, usePutOperatingHours } from "@/features/facilities/hooks";

const editSchema = z.object({
  name: z.string().min(2).optional().or(z.literal("")),
  building: z.string().optional(),
  floor: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number({ error: "Capacity must be positive." }).int().positive().optional(),
  description: z.string().optional(),
});

export default function ManageFacilityPage() {
  return (
    <RequirePermission permission={PERMISSIONS.MANAGE_FACILITIES}>
      <ManageInner />
    </RequirePermission>
  );
}

function ManageInner() {
  const params = useParams<{ facilityId: string }>();
  const id = params.facilityId;
  const facility = useFacility(id);
  const hours = useOperatingHours(id);
  const update = useUpdateFacility(id);
  const setStatus = useUpdateFacilityStatus(id);
  const putHours = usePutOperatingHours(id);

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ dayOfWeek: number; opensAt: string; closesAt: string; isClosed: boolean }[]>([]);

  const { register, handleSubmit, reset, formState } = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (facility.data) {
      reset({
        name: facility.data.name,
        building: facility.data.building ?? "",
        floor: facility.data.floor ?? "",
        location: facility.data.location ?? "",
        capacity: facility.data.capacity,
        description: facility.data.description ?? "",
      });
    }
  }, [facility.data, reset]);

  useEffect(() => {
    if (hours.data) {
      setDraft(
        hours.data.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          opensAt: h.opensAt ? h.opensAt.slice(0, 5) : "08:00",
          closesAt: h.closesAt ? h.closesAt.slice(0, 5) : "18:00",
          isClosed: h.isClosed,
        }))
      );
    }
  }, [hours.data]);

  const saveDetails = async (v: z.infer<typeof editSchema>) => {
    setMsg(null); setErr(null);
    try {
      await update.mutateAsync({
        name: v.name || undefined,
        building: v.building || null,
        floor: v.floor || null,
        location: v.location || null,
        capacity: v.capacity,
        description: v.description || null,
      });
      setMsg("Facility details updated.");
    } catch (e) { setErr(getErrorMessage(e)); }
  };

  const saveHours = async () => {
    setMsg(null); setErr(null);
    try {
      await putHours.mutateAsync(
        draft.map((d) => ({
          dayOfWeek: d.dayOfWeek,
          opensAt: d.isClosed ? null : `${d.opensAt}:00`,
          closesAt: d.isClosed ? null : `${d.closesAt}:00`,
          isClosed: d.isClosed,
        }))
      );
      setMsg("Operating hours updated.");
    } catch (e) { setErr(getErrorMessage(e)); }
  };

  const changeStatus = async (status: string) => {
    setMsg(null); setErr(null);
    try {
      await setStatus.mutateAsync(status);
      setMsg(`Facility marked ${status}.`);
    } catch (e) { setErr(getErrorMessage(e)); }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Manage facility" action={<Link href="/admin/facilities" className="text-xs font-bold text-[#EF2B4D] hover:underline">← All facilities</Link>} />
      {facility.isLoading ? <LoadingState /> : facility.isError || !facility.data ? (
        <ErrorState message={getErrorMessage(facility.error, "Facility not found.")} onRetry={() => facility.refetch()} />
      ) : (
        <>
          {msg && <div className="mb-4"><SuccessMessage message={msg} /></div>}
          {err && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200">{err}</p>}

          <Card><CardBody>
            <h2 className="text-sm font-bold">Details — {facility.data.name}</h2>
            <form onSubmit={handleSubmit(saveDetails)} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><Label htmlFor="mf-name">Name</Label><Input id="mf-name" {...register("name")} /><FieldError message={formState.errors.name?.message} /></div>
              <div><Label htmlFor="mf-cap">Capacity</Label><Input id="mf-cap" type="number" min={1} {...register("capacity", { valueAsNumber: true })} /><FieldError message={formState.errors.capacity?.message} /></div>
              <div><Label htmlFor="mf-b">Building</Label><Input id="mf-b" {...register("building")} /></div>
              <div><Label htmlFor="mf-f">Floor</Label><Input id="mf-f" {...register("floor")} /></div>
              <div className="sm:col-span-2"><Label htmlFor="mf-l">Location</Label><Input id="mf-l" {...register("location")} /></div>
              <div className="sm:col-span-2"><Label htmlFor="mf-d">Description</Label><Textarea id="mf-d" rows={2} {...register("description")} /></div>
              <div className="sm:col-span-2"><Button type="submit" loading={update.isPending}>Save details</Button></div>
            </form>
          </CardBody></Card>

          <Card className="mt-4"><CardBody>
            <h2 className="text-sm font-bold">Status</h2>
            <p className="text-xs text-gray-500">Current: <strong>{facility.data.status}</strong>. Facilities outside AVAILABLE cannot be booked.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["AVAILABLE", "UNAVAILABLE", "MAINTENANCE"] as const).map((s) => (
                <Button key={s} size="sm" variant={facility.data!.status === s ? "primary" : "secondary"} loading={setStatus.isPending} onClick={() => void changeStatus(s)}>{s}</Button>
              ))}
            </div>
          </CardBody></Card>

          <Card className="mt-4"><CardBody>
            <h2 className="text-sm font-bold">Operating hours</h2>
            <p className="text-xs text-gray-500">Bookings are only allowed inside these hours. Closed days return no slots.</p>
            <div className="mt-3 flex flex-col gap-2">
              {draft.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((d, i) => (
                <div key={d.dayOfWeek} className="flex flex-wrap items-center gap-2 rounded-lg bg-[#F4F5F7]/70 px-3 py-2">
                  <span className="w-24 text-xs font-bold">{DAY_NAMES[d.dayOfWeek]}</span>
                  <input type="time" value={d.opensAt} disabled={d.isClosed} onChange={(e) => setDraft((prev) => prev.map((x, xi) => xi === i ? { ...x, opensAt: e.target.value } : x))} className="rounded-md border border-gray-300 px-2 py-1 text-xs disabled:opacity-40" aria-label={`${DAY_NAMES[d.dayOfWeek]} opens`} />
                  <span className="text-xs text-gray-500">to</span>
                  <input type="time" value={d.closesAt} disabled={d.isClosed} onChange={(e) => setDraft((prev) => prev.map((x, xi) => xi === i ? { ...x, closesAt: e.target.value } : x))} className="rounded-md border border-gray-300 px-2 py-1 text-xs disabled:opacity-40" aria-label={`${DAY_NAMES[d.dayOfWeek]} closes`} />
                  <label className="ml-auto flex items-center gap-1 text-xs font-semibold text-gray-600">
                    <input type="checkbox" checked={d.isClosed} onChange={(e) => setDraft((prev) => prev.map((x, xi) => xi === i ? { ...x, isClosed: e.target.checked } : x))} /> Closed
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-3"><Button onClick={saveHours} loading={putHours.isPending}>Save hours</Button></div>
          </CardBody></Card>
        </>
      )}
    </div>
  );
}
