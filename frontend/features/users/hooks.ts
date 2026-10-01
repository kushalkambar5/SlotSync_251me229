import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rbacApi, usersApi } from "./api";

export function useUsers(params: { search?: string; roleId?: string; isActive?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => usersApi.list(params),
  });
}

export function useManagedUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => usersApi.get(id),
    enabled: !!id,
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.setStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) =>
      usersApi.setRole(id, roleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useRoles() {
  return useQuery({ queryKey: ["roles"], queryFn: rbacApi.roles });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ["role", id],
    queryFn: () => rbacApi.role(id),
    enabled: !!id,
  });
}

export function usePermissions() {
  return useQuery({ queryKey: ["permissions"], queryFn: rbacApi.permissions });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rbacApi.createRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useToggleRolePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissionId,
      grant,
    }: {
      roleId: string;
      permissionId: string;
      grant: boolean;
    }) =>
      grant
        ? rbacApi.addPermission(roleId, permissionId)
        : rbacApi.removePermission(roleId, permissionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["role"] });
    },
  });
}
