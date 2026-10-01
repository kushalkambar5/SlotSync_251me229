"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/AppHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/feedback/States";
import { Pagination } from "@/components/ui/Pagination";
import { FacilityCard } from "@/features/facilities/components/FacilityCard";
import { FacilityFilters, type FilterState } from "@/features/facilities/components/FacilityFilters";
import { useFacilities } from "@/features/facilities/hooks";
import { facilitiesApi } from "@/features/facilities/api";
import { getErrorMessage } from "@/lib/api/errors";

export default function FacilitiesPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    typeId: "",
    minCapacity: "",
    status: "",
    building: "",
  });
  const [page, setPage] = useState(1);

  const query = useMemo(
    () => ({
      typeId: filters.typeId || undefined,
      minCapacity: filters.minCapacity ? Number(filters.minCapacity) : undefined,
      status: filters.status || undefined,
      building: filters.building || undefined,
      page,
      limit: 12,
    }),
    [filters, page]
  );

  const { data: types } = useQuery({
    queryKey: ["facility-types"],
    queryFn: facilitiesApi.types,
    staleTime: 5 * 60_000,
  });

  const list = useFacilities(query);

  const visible = useMemo(() => {
    const items = list.data?.items ?? [];
    const q = filters.search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q)
    );
  }, [list.data, filters.search]);

  return (
    <div>
      <PageHeader
        title="Facilities"
        description="Discover classrooms, labs, seminar halls and auditoriums. Select a facility to see live availability."
      />
      <FacilityFilters
        filters={filters}
        onChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
        types={types}
      />
      <div className="mt-5">
        {list.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-200/70" />
            ))}
          </div>
        ) : list.isError ? (
          <ErrorState message={getErrorMessage(list.error)} onRetry={() => list.refetch()} />
        ) : visible.length === 0 ? (
          <EmptyState title="No facilities found." hint="Try widening your search or clearing filters." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((f) => (
                <FacilityCard key={f.id} facility={f} />
              ))}
            </div>
            <Pagination
              page={list.data?.meta.page ?? 1}
              total={list.data?.meta.total ?? 0}
              limit={list.data?.meta.limit ?? 12}
              onPage={setPage}
            />
          </>
        )}
      </div>
      {list.isLoading && <LoadingState message="Loading facilities…" />}
    </div>
  );
}
