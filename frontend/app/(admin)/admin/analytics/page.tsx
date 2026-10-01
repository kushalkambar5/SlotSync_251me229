"use client";

import { useState } from "react";
import { RequirePermission } from "@/components/auth/ProtectedRoute";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState } from "@/components/feedback/States";
import { Card, CardBody } from "@/components/ui/Card";
import { Select, Label } from "@/components/ui/Input";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getErrorMessage } from "@/lib/api/errors";
import { formatTime } from "@/lib/utils/format";
import { useAnalyticsOverview, useAnalyticsFacilities, usePeakHours, useUsageTrends } from "@/features/analytics/api";

export default function AnalyticsPage() {
  return (
    <RequirePermission permission={PERMISSIONS.VIEW_ANALYTICS}>
      <AnalyticsInner />
    </RequirePermission>
  );
}

function AnalyticsInner() {
  const [granularity, setGranularity] = useState("daily");
  const overview = useAnalyticsOverview();
  const facilities = useAnalyticsFacilities();
  const peaks = usePeakHours();
  const trends = useUsageTrends(granularity);

  const byStatus = Object.fromEntries((overview.data?.bookingsByStatus ?? []).map((r) => [r.status, r.count]));
  const maxFacility = Math.max(1, ...(facilities.data ?? []).map((f) => f.count));
  const maxTrend = Math.max(1, ...(trends.data ?? []).map((t) => t.count));

  return (
    <div>
      <PageHeader title="Analytics" description="All metrics come from backend APIs — never derived client-side." />
      {overview.isLoading ? <LoadingState /> : overview.isError ? (
        <ErrorState message={getErrorMessage(overview.error)} onRetry={() => overview.refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {(["PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const).map((s) => (
              <Card key={s}><CardBody><p className="text-xl font-extrabold">{byStatus[s] ?? 0}</p><p className="text-[11px] font-bold text-gray-500">{s}</p></CardBody></Card>
            ))}
            <Card><CardBody><p className="text-xl font-extrabold">{overview.data?.totalFacilities ?? 0}</p><p className="text-[11px] font-bold text-gray-500">FACILITIES</p></CardBody></Card>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card><CardBody>
              <h2 className="text-sm font-bold">Most booked facilities</h2>
              {facilities.isLoading ? <LoadingState /> : (
                <div className="mt-3 flex flex-col gap-2">
                  {(facilities.data ?? []).map((f) => (
                    <div key={f.facilityId}>
                      <div className="flex justify-between text-xs"><span className="font-semibold">{f.facilityName}</span><span className="text-gray-500">{f.count}</span></div>
                      <div className="mt-1 h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-[#EF2B4D]" style={{ width: `${Math.round((f.count / maxFacility) * 100)}%` }} /></div>
                    </div>
                  ))}
                  {(facilities.data ?? []).length === 0 && <p className="text-xs text-gray-500">No booking data yet.</p>}
                </div>
              )}
            </CardBody></Card>

            <Card><CardBody>
              <h2 className="text-sm font-bold">Peak hours</h2>
              {peaks.isLoading ? <LoadingState /> : (
                <div className="mt-3 flex flex-col gap-1.5">
                  {(peaks.data ?? []).map((p) => (
                    <div key={p.startTime} className="flex items-center justify-between rounded-lg bg-[#F4F5F7]/70 px-3 py-1.5 text-xs">
                      <span className="font-bold">{formatTime(p.startTime)}</span><span className="text-gray-600">{p.count} bookings</span>
                    </div>
                  ))}
                  {(peaks.data ?? []).length === 0 && <p className="text-xs text-gray-500">No booking data yet.</p>}
                </div>
              )}
            </CardBody></Card>
          </div>

          <Card className="mt-4"><CardBody>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold">Usage trends</h2>
              <div className="flex items-center gap-2">
                <Label htmlFor="trend-g">Granularity</Label>
                <Select id="trend-g" value={granularity} onChange={(e) => setGranularity(e.target.value)}>
                  <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                </Select>
              </div>
            </div>
            {trends.isLoading ? <LoadingState /> : (
              <div className="mt-3 flex h-40 items-end gap-1.5">
                {(trends.data ?? []).map((t) => (
                  <div key={t.period} title={`${t.period}: ${t.count}`} className="flex-1 rounded-t-md bg-[#EF2B4D]/80" style={{ height: `${Math.max(4, Math.round((t.count / maxTrend) * 100))}%` }} />
                ))}
                {(trends.data ?? []).length === 0 && <p className="text-xs text-gray-500">No trend data yet.</p>}
              </div>
            )}
          </CardBody></Card>
        </>
      )}
    </div>
  );
}
