import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Department, FacilityType } from "@/types/facility";

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get<Department[]>("/departments"),
    staleTime: 5 * 60_000,
  });
}

export function useFacilityTypes() {
  return useQuery({
    queryKey: ["facility-types"],
    queryFn: () => api.get<FacilityType[]>("/facility-types"),
    staleTime: 5 * 60_000,
  });
}
