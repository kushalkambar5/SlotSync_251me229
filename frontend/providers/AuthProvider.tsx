"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { getStoredToken } from "@/lib/api/client";
import { hasPermission } from "@/lib/auth/permissions";
import {
  fetchSession,
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
} from "@/lib/auth/session";
import type { SessionUser } from "@/types/auth";

interface AuthContextValue {
  user: SessionUser | null;
  permissions: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  can: (permission: string) => boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    departmentId?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    if (!getStoredToken()) {
      // No token — try cookie session anyway (httpOnly cookie auth).
      try {
        const me = await fetchSession();
        setUser({ ...me.user, roleName: me.roleName, permissions: me.permissions });
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    try {
      const me = await fetchSession();
      setUser({ ...me.user, roleName: me.roleName, permissions: me.permissions });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setUser(null);
      // keep previous user on transient errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const data = await loginApi(input);
      setUser({
        ...data.user,
        roleName: data.roleName,
        permissions: data.permissions,
      });
    },
    []
  );

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      departmentId?: string;
    }) => {
      const data = await registerApi(input);
      setUser({
        ...data.user,
        roleName: data.roleName,
        permissions: data.permissions,
      });
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      permissions: user?.permissions ?? [],
      isLoading,
      isAuthenticated: user !== null,
      can: (p: string) => hasPermission(user?.permissions, p),
      login,
      register,
      logout,
      refresh,
    }),
    [user, isLoading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
