import { api } from "@/lib/api/client";
import type { ManagedUser, Permission, Role, RoleDetail } from "@/types/user";

export const usersApi = {
  list: (params: { search?: string; roleId?: string; isActive?: string; page?: number; limit?: number } = {}) =>
    api.getPaginated<ManagedUser>("/users", { query: { ...params } }),
  get: (id: string) => api.get<ManagedUser>(`/users/${id}`),
  me: () => api.get<ManagedUser>("/users/me"),
  updateMe: (body: { name?: string }) => api.patch<ManagedUser>("/users/me", body),
  update: (id: string, body: { name?: string; departmentId?: string | null }) =>
    api.patch<ManagedUser>(`/users/${id}`, body),
  setStatus: (id: string, isActive: boolean) =>
    api.patch<ManagedUser>(`/users/${id}/status`, { isActive }),
  setRole: (id: string, roleId: string) =>
    api.patch<ManagedUser>(`/users/${id}/role`, { roleId }),
};

export const rbacApi = {
  roles: () => api.get<Role[]>("/roles"),
  role: (id: string) => api.get<RoleDetail>(`/roles/${id}`),
  createRole: (body: { name: string; description?: string; permissionIds?: string[] }) =>
    api.post<RoleDetail>("/roles", body),
  updateRole: (id: string, body: { name?: string; description?: string | null }) =>
    api.patch<RoleDetail>(`/roles/${id}`, body),
  addPermission: (roleId: string, permissionId: string) =>
    api.post(`/roles/${roleId}/permissions`, { permissionId }),
  removePermission: (roleId: string, permissionId: string) =>
    api.delete(`/roles/${roleId}/permissions/${permissionId}`),
  permissions: () => api.get<Permission[]>("/permissions"),
};
