import type { FacilityStatus } from "./api";

export interface Facility {
  id: string;
  name: string;
  code: string;
  typeId: string;
  typeName?: string;
  location?: string | null;
  building?: string | null;
  floor?: string | null;
  capacity: number;
  description?: string | null;
  status: FacilityStatus;
  isActive?: boolean;
  createdAt?: string;
}

export interface FacilityDetail extends Facility {
  operatingHours: OperatingHour[];
}

export interface OperatingHour {
  id?: string;
  facilityId?: string;
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  opensAt: string | null; // "HH:MM:SS"
  closesAt: string | null;
  isClosed: boolean;
}

export interface AvailabilitySlot {
  startTime: string; // "HH:MM"
  endTime: string;
  status: "AVAILABLE" | "BOOKED";
}

export interface AvailabilityResponse {
  facility: { id: string; name: string; status: FacilityStatus };
  date: string;
  operatingHours: {
    opensAt: string | null;
    closesAt: string | null;
    isClosed: boolean;
  } | null;
  slots: AvailabilitySlot[];
}

export interface FacilityType {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
