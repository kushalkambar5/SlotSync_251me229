"use client";

import { Input, Select, Label } from "@/components/ui/Input";
import type { FacilityType } from "@/types/facility";

export interface FilterState {
  search: string;
  typeId: string;
  minCapacity: string;
  status: string;
  building: string;
}

export function FacilityFilters({
  filters,
  onChange,
  types,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  types: FacilityType[] | undefined;
}) {
  const set = (k: keyof FilterState, v: string) => onChange({ ...filters, [k]: v });
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="sm:col-span-2 lg:col-span-1">
        <Label htmlFor="f-search">Search</Label>
        <Input
          id="f-search"
          placeholder="Name or code…"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="f-type">Type</Label>
        <Select id="f-type" value={filters.typeId} onChange={(e) => set("typeId", e.target.value)}>
          <option value="">All types</option>
          {(types ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="f-cap">Min capacity</Label>
        <Input
          id="f-cap"
          type="number"
          min={1}
          placeholder="e.g. 50"
          value={filters.minCapacity}
          onChange={(e) => set("minCapacity", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="f-status">Status</Label>
        <Select id="f-status" value={filters.status} onChange={(e) => set("status", e.target.value)}>
          <option value="">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="UNAVAILABLE">Unavailable</option>
          <option value="MAINTENANCE">Maintenance</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="f-building">Building</Label>
        <Input
          id="f-building"
          placeholder="Building…"
          value={filters.building}
          onChange={(e) => set("building", e.target.value)}
        />
      </div>
    </div>
  );
}
