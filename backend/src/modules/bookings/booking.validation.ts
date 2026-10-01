import { z } from "zod";

const timeRe = /^\d{2}:\d{2}(:\d{2})?$/;

export const createBookingSchema = z.object({
  facilityId: z.string().uuid(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(timeRe),
  endTime: z.string().regex(timeRe),
  purpose: z.string().max(2000).optional(),
});

export const listBookingsQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLATION_REQUESTED", "CANCELLED"]).optional(),
  facilityId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const rejectBookingSchema = z.object({
  reason: z.string().min(3).max(2000),
});

export const requestCancellationSchema = z.object({
  reason: z.string().min(3).max(2000),
});
