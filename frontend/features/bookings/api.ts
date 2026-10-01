import { api } from "@/lib/api/client";
import type { Booking, CancellationRequest } from "@/types/booking";

export interface BookingFilters {
  status?: string;
  facilityId?: string;
  userId?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export const bookingsApi = {
  list: (f: BookingFilters = {}) =>
    api.getPaginated<Booking>("/bookings", { query: { ...f } }),
  get: (id: string) => api.get<Booking>(`/bookings/${id}`),
  create: (body: {
    facilityId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    purpose?: string;
  }) => api.post<Booking>("/bookings", body),
  approve: (id: string) => api.post<Booking>(`/bookings/${id}/approve`),
  reject: (id: string, reason: string) =>
    api.post<Booking>(`/bookings/${id}/reject`, { reason }),
  requestCancellation: (id: string, reason: string) =>
    api.post<CancellationRequest>(`/bookings/${id}/cancellation-request`, {
      reason,
    }),
  joinWaitlist: (body: {
    facilityId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
  }) => api.post("/waitlist", body),
};
