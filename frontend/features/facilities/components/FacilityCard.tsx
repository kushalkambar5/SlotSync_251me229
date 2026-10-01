"use client";

import Link from "next/link";
import { Building2, MapPin, Users } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { FacilityStatusBadge } from "@/components/ui/Badge";
import type { Facility } from "@/types/facility";

export function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardBody className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDE8EB] text-[#EF2B4D]">
              <Building2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#1F1F1F]">{facility.name}</h3>
              <p className="text-[11px] text-gray-500">{facility.typeName ?? facility.code}</p>
            </div>
          </div>
          <FacilityStatusBadge status={facility.status} />
        </div>
        {(facility.building || facility.location) && (
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {[facility.building, facility.floor].filter(Boolean).join(" · ")}
            {facility.location ? ` — ${facility.location}` : ""}
          </p>
        )}
        <p className="flex items-center gap-1 text-xs text-gray-600">
          <Users className="h-3.5 w-3.5" aria-hidden="true" /> Capacity: {facility.capacity}
        </p>
        {facility.description && (
          <p className="line-clamp-2 text-xs text-gray-500">{facility.description}</p>
        )}
        <div className="mt-auto pt-2">
          <Link
            href={`/facilities/${facility.id}`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[#F4F5F7] px-4 py-2 text-sm font-semibold text-[#1F1F1F] hover:bg-[#FDE8EB] hover:text-[#EF2B4D]"
          >
            View Availability
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
