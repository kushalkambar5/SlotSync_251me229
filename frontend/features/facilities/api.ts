import { api } from "@/lib/api/client";
import type {
  AvailabilityResponse,
  Department,
  Facility,
  FacilityDetail,
  FacilityType,
  OperatingHour,
} from "@/types/facility";

export interface FacilityFilters {
  typeId?: string;
  minCapacity?: number;
  status?: string;
  building?: string;
  page?: number;
  limit?: number;
}

export const facilitiesApi = {
  list: (f: FacilityFilters = {}) =>
    api.getPaginated<Facility>("/facilities", { query: { ...f } }),
  get: (id: string) => api.get<FacilityDetail>(`/facilities/${id}`),
  availability: (id: string, date: string) =>
    api.get<AvailabilityResponse>(`/facilities/${id}/availability`, {
      query: { date },
    }),
  create: (body: {
    name: string;
    code: string;
    typeId: string;
    building?: string;
    floor?: string;
    location?: string;
    capacity: number;
    description?: string;
    status?: string;
  }) => api.post<Facility>("/facilities", body),
  update: (id: string, body: Partial<Facility>) =>
    api.patch<Facility>(`/facilities/${id}`, body),
  updateStatus: (id: string, status: string) =>
    api.patch<Facility>(`/facilities/${id}/status`, { status }),
  hours: (id: string) => api.get<OperatingHour[]>(`/facilities/${id}/operating-hours`),
  putHours: (
    id: string,
    hours: { dayOfWeek: number; opensAt: string | null; closesAt: string | null; isClosed: boolean }[]
  ) => api.put<OperatingHour[]>(`/facilities/${id}/operating-hours`, { hours }),
  types: () => api.get<FacilityType[]>("/facility-types"),
  departments: () => api.get<Department[]>("/departments"),
};
