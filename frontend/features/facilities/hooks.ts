import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { facilitiesApi, type FacilityFilters } from "./api";

export function useFacilities(filters: FacilityFilters) {
  return useQuery({
    queryKey: ["facilities", filters],
    queryFn: () => facilitiesApi.list(filters),
  });
}

export function useFacility(id: string) {
  return useQuery({
    queryKey: ["facility", id],
    queryFn: () => facilitiesApi.get(id),
    enabled: !!id,
  });
}

export function useAvailability(facilityId: string, date: string | null) {
  return useQuery({
    queryKey: ["availability", facilityId, date],
    queryFn: () => facilitiesApi.availability(facilityId, date!),
    enabled: !!facilityId && !!date,
  });
}

export function useOperatingHours(facilityId: string) {
  return useQuery({
    queryKey: ["operating-hours", facilityId],
    queryFn: () => facilitiesApi.hours(facilityId),
    enabled: !!facilityId,
  });
}

export function useCreateFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: facilitiesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["facilities"] }),
  });
}

export function useUpdateFacility(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof facilitiesApi.update>[1]) =>
      facilitiesApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facilities"] });
      qc.invalidateQueries({ queryKey: ["facility", id] });
    },
  });
}

export function useUpdateFacilityStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => facilitiesApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facilities"] });
      qc.invalidateQueries({ queryKey: ["facility", id] });
    },
  });
}

export function usePutOperatingHours(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hours: Parameters<typeof facilitiesApi.putHours>[1]) =>
      facilitiesApi.putHours(id, hours),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["operating-hours", id] });
      qc.invalidateQueries({ queryKey: ["facility", id] });
    },
  });
}
