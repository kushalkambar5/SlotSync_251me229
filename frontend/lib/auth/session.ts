import { api, setStoredToken } from "@/lib/api/client";
import type { AuthResponse, MeResponse } from "@/types/auth";

export async function login(input: { email: string; password: string }) {
  const data = await api.post<AuthResponse>("/auth/login", input);
  setStoredToken(data.token);
  return data;
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  departmentId?: string;
}) {
  const data = await api.post<AuthResponse>("/auth/register", input);
  setStoredToken(data.token);
  return data;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    /* ignore - still clear local state */
  }
  setStoredToken(null);
}

export async function fetchSession(): Promise<MeResponse> {
  return api.get<MeResponse>("/auth/me");
}
