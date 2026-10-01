"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/providers/AuthProvider";
import { useDepartments } from "@/features/auth/hooks";
import { getErrorMessage } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label, FieldError } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Enter a valid email."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
    departmentId: z.string().optional(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: signup } = useAuth();
  const router = useRouter();
  const { data: departments } = useDepartments();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: FormValues) => {
    setServerError(null);
    try {
      await signup({
        name: v.name.trim(),
        email: v.email.trim(),
        password: v.password,
        departmentId: v.departmentId || undefined,
      });
      router.push("/dashboard");
    } catch (e) {
      setServerError(getErrorMessage(e, "Registration failed."));
    }
  };

  return (
    <Card>
      <CardBody>
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="relative block h-9 w-36">
            <Image src="/navbar_logo.png" alt="SlotSync" fill className="object-contain" sizes="144px" />
          </span>
          <h1 className="text-xl font-extrabold text-[#1F1F1F]">Create your account</h1>
          <p className="text-sm text-gray-500">
            Students, faculty and convenors join here. Your role is assigned by the backend — no role picker needed.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div>
            <Label htmlFor="name" required>Name</Label>
            <Input id="name" autoComplete="name" placeholder="Aarav Sharma" {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="email" required>Email</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@nitk.edu.in" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="departmentId">Department</Label>
            <Select id="departmentId" {...register("departmentId")} defaultValue="">
              <option value="">Select department (optional)</option>
              {(departments ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="password" required>Password</Label>
              <Input id="password" type="password" autoComplete="new-password" placeholder="Min 6 characters" {...register("password")} />
              <FieldError message={errors.password?.message} />
            </div>
            <div>
              <Label htmlFor="confirmPassword" required>Confirm password</Label>
              <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat password" {...register("confirmPassword")} />
              <FieldError message={errors.confirmPassword?.message} />
            </div>
          </div>
          {serverError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200">
              {serverError}
            </p>
          )}
          <Button type="submit" loading={isSubmitting} size="lg">
            Create account
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#EF2B4D] hover:underline">
            Log in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
