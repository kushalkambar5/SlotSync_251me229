"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { RequirePermission } from "@/components/auth/ProtectedRoute";
import { PageHeader } from "@/components/layout/AppHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, Label, FieldError } from "@/components/ui/Input";
import { SuccessMessage } from "@/components/feedback/States";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getErrorMessage } from "@/lib/api/errors";
import { facilitiesApi } from "@/features/facilities/api";

const schema = z.object({
  name: z.string().min(2, "Name required."),
  code: z.string().min(2, "Code required."),
  typeId: z.string().min(1, "Choose a type."),
  building: z.string().optional(),
  floor: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number({ error: "Capacity must be a positive number." }).int().positive("Capacity must be positive."),
  description: z.string().optional(),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "MAINTENANCE"]),
});

type Values = z.infer<typeof schema>;

export default function NewFacilityPage() {
  return (
    <RequirePermission permission={PERMISSIONS.MANAGE_FACILITIES}>
      <NewFacilityInner />
    </RequirePermission>
  );
}

function NewFacilityInner() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const { data: types } = useQuery({ queryKey: ["facility-types"], queryFn: facilitiesApi.types });
  const { register, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { status: "AVAILABLE" },
  });

  const onSubmit = async (v: Values) => {
    setServerError(null);
    try {
      const f = await facilitiesApi.create({
        name: v.name.trim(),
        code: v.code.trim(),
        typeId: v.typeId,
        building: v.building || undefined,
        floor: v.floor || undefined,
        location: v.location || undefined,
        capacity: v.capacity,
        description: v.description || undefined,
        status: v.status,
      });
      setCreatedId(f.id);
    } catch (e) {
      setServerError(getErrorMessage(e));
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New facility" action={<Link href="/admin/facilities" className="text-xs font-bold text-[#EF2B4D] hover:underline">← All facilities</Link>} />
      <Card><CardBody>
        {createdId ? (
          <div className="flex flex-col gap-4">
            <SuccessMessage message="Facility created with default operating hours (Mon–Sat 08:00–18:00). You can now tune its hours." />
            <div className="flex gap-2">
              <Button onClick={() => router.push(`/admin/facilities/${createdId}`)}>Manage hours & details →</Button>
              <Button variant="secondary" onClick={() => router.push("/admin/facilities")}>Back to list</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><Label htmlFor="nf-name" required>Name</Label><Input id="nf-name" {...register("name")} placeholder="Seminar Hall A" /><FieldError message={formState.errors.name?.message} /></div>
              <div><Label htmlFor="nf-code" required>Code</Label><Input id="nf-code" {...register("code")} placeholder="SHA-01" /><FieldError message={formState.errors.code?.message} /></div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><Label htmlFor="nf-type" required>Type</Label>
                <Select id="nf-type" {...register("typeId")} defaultValue="">
                  <option value="">Select type…</option>{(types ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select><FieldError message={formState.errors.typeId?.message} /></div>
              <div><Label htmlFor="nf-status">Status</Label>
                <Select id="nf-status" {...register("status")}>
                  <option value="AVAILABLE">Available</option><option value="UNAVAILABLE">Unavailable</option><option value="MAINTENANCE">Maintenance</option>
                </Select></div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><Label htmlFor="nf-building">Building</Label><Input id="nf-building" {...register("building")} placeholder="Academic Block" /></div>
              <div><Label htmlFor="nf-floor">Floor</Label><Input id="nf-floor" {...register("floor")} placeholder="Ground" /></div>
            </div>
            <div><Label htmlFor="nf-location">Location</Label><Input id="nf-location" {...register("location")} placeholder="Room 101, East wing" /></div>
            <div><Label htmlFor="nf-capacity" required>Capacity</Label><Input id="nf-capacity" type="number" min={1} {...register("capacity", { valueAsNumber: true })} /><FieldError message={formState.errors.capacity?.message} /></div>
            <div><Label htmlFor="nf-desc">Description</Label><Textarea id="nf-desc" rows={3} {...register("description")} /></div>
            {serverError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200">{serverError}</p>}
            <div><Button type="submit" loading={formState.isSubmitting}>Create facility</Button></div>
          </form>
        )}
      </CardBody></Card>
    </div>
  );
}
