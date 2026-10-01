import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { AuditLog } from "@/types/audit";

export const analyticsApi = {
  overview: () =>
    api.get<{ bookingsByStatus: { status: string; count: number }[]; totalFacilities: number }>(
      "/analytics/overview"
    ),
  facilities: () =>
    api.get<{ facilityId: string; facilityName: string; count: number }[]>(
      "/analytics/facilities"
    ),
  peakHours: () =>
    api.get<{ startTime: string; count: number }[]>("/analytics/peak-hours"),
  trends: (granularity: string = "daily") =>
    api.get<{ period: string; count: number }[]>("/analytics/usage-trends", {
      query: { granularity },
    }),
};

export const auditApi = {
  list: (params: Record<string, string | number | undefined> = {}) =>
    api.getPaginated<AuditLog>("/audit-logs", { query: { ...params } }),
};

export function useAnalyticsOverview() {
  return useQuery({ queryKey: ["admin-overview"], queryFn: analyticsApi.overview });
}
export function useAnalyticsFacilities() {
  return useQuery({ queryKey: ["analytics-facilities"], queryFn: analyticsApi.facilities });
}
export function usePeakHours() {
  return useQuery({ queryKey: ["peak-hours"], queryFn: analyticsApi.peakHours });
}
export function useUsageTrends(granularity: string) {
  return useQuery({
    queryKey: ["usage-trends", granularity],
    queryFn: () => analyticsApi.trends(granularity),
  });
}
export function useAuditLogs(params: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => auditApi.list(params),
  });
}
