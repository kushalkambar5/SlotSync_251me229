"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/providers/AuthProvider";
import { getErrorMessage } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Card";

const schema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await login(values);
      router.push(params.get("next") || "/dashboard");
    } catch (e) {
      setServerError(getErrorMessage(e, "Invalid email or password."));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div>
        <Label htmlFor="email" required>Email</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="you@nitk.edu.in" {...register("email")} />
        <FieldError message={errors.email?.message} />
      </div>
      <div>
        <Label htmlFor="password" required>Password</Label>
        <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register("password")} />
        <FieldError message={errors.password?.message} />
      </div>
      {serverError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200">
          {serverError}
        </p>
      )}
      <Button type="submit" loading={isSubmitting} size="lg">
        Log in
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Card>
      <CardBody>
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="relative block h-9 w-36">
            <Image src="/navbar_logo.png" alt="SlotSync" fill className="object-contain" sizes="144px" />
          </span>
          <h1 className="text-xl font-extrabold text-[#1F1F1F]">Welcome back</h1>
          <p className="text-sm text-gray-500">Log in to request slots and track bookings.</p>
        </div>
        <Suspense fallback={<Spinner label="Loading…" />}>
          <LoginForm />
        </Suspense>
        <p className="mt-5 text-center text-sm text-gray-600">
          New to SlotSync?{" "}
          <Link href="/register" className="font-bold text-[#EF2B4D] hover:underline">
            Create an account
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
