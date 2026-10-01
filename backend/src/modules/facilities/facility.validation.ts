import { z } from "zod";

export const listFacilitiesQuerySchema = z.object({
  typeId: z.string().uuid().optional(),
  minCapacity: z.coerce.number().int().positive().optional(),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "MAINTENANCE"]).optional(),
  building: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createFacilitySchema = z.object({
  name: z.string().min(2).max(150),
  code: z.string().min(2).max(50),
  typeId: z.string().uuid(),
  location: z.string().max(1000).optional(),
  building: z.string().max(100).optional(),
  floor: z.string().max(30).optional(),
  capacity: z.number().int().positive(),
  description: z.string().max(2000).optional(),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "MAINTENANCE"]).default("AVAILABLE"),
});

export const updateFacilitySchema = z.object({
  name: z.string().min(2).max(150).optional(),
  typeId: z.string().uuid().optional(),
  location: z.string().max(1000).nullable().optional(),
  building: z.string().max(100).nullable().optional(),
  floor: z.string().max(30).nullable().optional(),
  capacity: z.number().int().positive().optional(),
  description: z.string().max(2000).nullable().optional(),
});

export const updateFacilityStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "MAINTENANCE"]),
});

const operatingHourEntry = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  opensAt: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable().optional(),
  closesAt: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable().optional(),
  isClosed: z.boolean().default(false),
});

export const putOperatingHoursSchema = z.object({
  hours: z.array(operatingHourEntry).min(1).max(7),
});

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
