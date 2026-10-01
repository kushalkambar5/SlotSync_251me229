"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { LoadingState, PermissionDenied } from "@/components/feedback/States";

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
