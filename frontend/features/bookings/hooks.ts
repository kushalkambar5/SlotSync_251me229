import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingsApi, type BookingFilters } from "./api";

export function useBookings(filters: BookingFilters) {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => bookingsApi.list(filters),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingsApi.get(id),
    enabled: !!id,
  });
}

function invalidateBookingLists(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["bookings"] });
  qc.invalidateQueries({ queryKey: ["availability"] });
  qc.invalidateQueries({ queryKey: ["notifications"] });
  qc.invalidateQueries({ queryKey: ["admin-overview"] });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => invalidateBookingLists(qc),
  });
}

export function useApproveBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.approve(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["booking", id] });
      invalidateBookingLists(qc);
    },
  });
}

export function useRejectBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      bookingsApi.reject(id, reason),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["booking", v.id] });
      invalidateBookingLists(qc);
    },
  });
}

export function useRequestCancellation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      bookingsApi.requestCancellation(id, reason),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["booking", v.id] });
      invalidateBookingLists(qc);
    },
  });
}
