import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancellationsApi } from "./api";

export function useCancellations(params: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["cancellations", params],
    queryFn: () => cancellationsApi.list(params),
  });
}

export function useApproveCancellation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancellationsApi.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cancellations"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useRejectCancellation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancellationsApi.reject(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cancellations"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
