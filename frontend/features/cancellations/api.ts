import { api } from "@/lib/api/client";
import type { CancellationRequest } from "@/types/booking";

export const cancellationsApi = {
  list: (params: { status?: string; page?: number; limit?: number } = {}) =>
    api.getPaginated<CancellationRequest>("/cancellations", { query: { ...params } }),
  approve: (id: string) => api.post(`/cancellations/${id}/approve`),
  reject: (id: string, reason: string) =>
    api.post(`/cancellations/${id}/reject`, { reason }),
};
