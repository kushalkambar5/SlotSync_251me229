// backend_plan.md §38 — consistent error shape + PG -> API translation.

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const Errors = {
  validation: (message = "Invalid request data.") =>
    new ApiError(400, "VALIDATION_ERROR", message),
  unauthenticated: (message = "Authentication required.") =>
    new ApiError(401, "UNAUTHENTICATED", message),
  forbidden: (message = "You do not have permission to perform this action.") =>
    new ApiError(403, "FORBIDDEN", message),
  notFound: (resource = "Resource") => new ApiError(404, "NOT_FOUND", `${resource} not found.`),
  conflict: (code: string, message: string) => new ApiError(409, code, message),
  business: (code: string, message: string) => new ApiError(422, code, message),
  internal: (message = "Internal server error.") =>
    new ApiError(500, "INTERNAL_SERVER_ERROR", message),
};

/** Map low-level Drizzle/Postgres errors to meaningful API errors (§38). */
export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (typeof err === "object" && err !== null && "code" in err) {
    const pg = err as { code?: string; message?: string; constraint?: string };
    // unique_violation
    if (pg.code === "23505") {
      const c = pg.constraint ?? "";
      if (c.includes("bookings_user_day_active_unique"))
        return Errors.conflict(
          "DAILY_BOOKING_LIMIT_REACHED",
          "You already have an active booking for this day.",
        );
      if (c.includes("cancellation_requests_booking_pending_unique"))
        return Errors.conflict(
          "BOOKING_ALREADY_EXISTS",
          "A pending cancellation request already exists for this booking.",
        );
      if (c.includes("waitlist_entries_active_slot_unique"))
        return Errors.conflict(
          "BOOKING_ALREADY_EXISTS",
          "You are already on the waitlist for this slot.",
        );
      if (c.includes("users_email") || c.includes("users_email_lower_unique"))
        return Errors.conflict("BOOKING_ALREADY_EXISTS", "Email is already registered.");
      return Errors.conflict("BOOKING_ALREADY_EXISTS", "Duplicate record.");
    }
    // exclusion_violation (overlap) — also raised via raw SQL message fallback
    if (pg.code === "23P01" || (pg.constraint ?? "").includes("no_overlap_approved_bookings"))
      return Errors.conflict("BOOKING_OVERLAP", "This slot overlaps an approved booking.");
    // check_violation / fk_violation
    if (pg.code === "23514")
      return Errors.business("VALIDATION_ERROR", "Data violates a database constraint.");
    if (pg.code === "23503")
      return Errors.business("VALIDATION_ERROR", "Referenced record does not exist.");
  }
  const msg = err instanceof Error ? err.message : "";
  if (msg.includes("no_overlap_approved_bookings"))
    return Errors.conflict("BOOKING_OVERLAP", "This slot overlaps an approved booking.");
  return Errors.internal();
}
