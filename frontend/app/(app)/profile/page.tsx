"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/providers/AuthProvider";
import { usersApi } from "@/features/users/api";
import { getErrorMessage } from "@/lib/api/errors";
import { PageHeader } from "@/components/layout/AppHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { SuccessMessage } from "@/components/feedback/States";

const schema = z.object({ name: z.string().min(2, "Name must be at least 2 characters.") });

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState } = useForm<{ name: string }>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? "" },
  });

  useEffect(() => {
    if (user) reset({ name: user.name });
  }, [user, reset]);

  const onSubmit = async (v: { name: string }) => {
    setOk(null);
    setErr(null);
    try {
      await usersApi.updateMe({ name: v.name.trim() });
      await refresh();
      setOk("Profile updated.");
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Profile" description="Your account, role and department." />
      <Card><CardBody>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-xs font-bold uppercase text-gray-400">Name</dt><dd className="font-semibold">{user?.name}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-gray-400">Email</dt><dd className="font-semibold">{user?.email}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-gray-400">Role</dt><dd className="font-semibold">{user?.roleName ?? "—"}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-gray-400">Status</dt><dd className="font-semibold">{user?.isActive ? "Active" : "Inactive"}</dd></div>
        </dl>
        <div className="mt-3">
          <p className="text-xs font-bold uppercase text-gray-400">Permissions ({user?.permissions.length ?? 0})</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {(user?.permissions ?? []).map((p) => (
              <span key={p} className="rounded-full bg-[#F4F5F7] px-2 py-0.5 text-[11px] font-semibold text-gray-700">{p}</span>
            ))}
          </div>
        </div>
      </CardBody></Card>

      <Card className="mt-4"><CardBody>
        <h2 className="text-sm font-bold">Edit profile</h2>
        <p className="text-xs text-gray-500">Only fields supported by the backend are editable (name).</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-3 flex flex-col gap-3">
          <div>
            <Label htmlFor="profile-name" required>Display name</Label>
            <Input id="profile-name" {...register("name")} />
            <FieldError message={formState.errors.name?.message} />
          </div>
          {ok && <SuccessMessage message={ok} />}
          {err && <p role="alert" className="text-xs font-semibold text-red-600">{err}</p>}
          <div><Button type="submit" loading={formState.isSubmitting}>Save changes</Button></div>
        </form>
      </CardBody></Card>
    </div>
  );
}
