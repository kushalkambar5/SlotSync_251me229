"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { LoadingState, PermissionDenied } from "@/components/feedback/States";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <LoadingState message="Checking your session…" />;
  if (!isAuthenticated) return <LoadingState message="Redirecting to login…" />;
  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingState message="Checking your session…" />;
  if (isAuthenticated) return <AlreadyLoggedIn />;
  return <>{children}</>;
}

export function AlreadyLoggedIn() {
  const { user, logout } = useAuth();

  return (
    <Card>
      <CardBody>
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="relative block h-9 w-36">
            <Image src="/navbar_logo.png" alt="SlotSync" fill className="object-contain" sizes="144px" />
          </span>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-extrabold text-[#1F1F1F]">Already logged in</h1>
          <p className="text-sm text-gray-500">
            {user?.name || user?.email
              ? `You're signed in${user?.name ? ` as ${user.name}` : ""}${user?.email ? ` (${user.email})` : ""}.`
              : "You're already signed in to SlotSync."}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EF2B4D] px-6 py-3 text-base font-semibold text-white transition-all hover:bg-[#D81E40] active:scale-[0.98]"
          >
            Go to dashboard
          </Link>
          <Button variant="outline" size="lg" onClick={() => void logout()}>
            Log out
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
export function RequirePermission({
  permission,
  anyOf,
  children,
}: {
  permission?: string;
  anyOf?: string[];
  children: React.ReactNode;
}) {
  const { can, isLoading } = useAuth();
  if (isLoading) return <LoadingState />;
  const allowed = permission
    ? can(permission)
    : anyOf
      ? anyOf.some((p) => can(p))
      : true;
  if (!allowed) return <PermissionDenied />;
  return <>{children}</>;
}
