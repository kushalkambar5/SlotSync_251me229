export interface ApiErrorBody {
  success: false;
  error: { code: string; message: string };
}

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }

  is(status: number) {
    return this.status === status;
  }
}

export function getErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

/** Human-friendly message for booking conflicts (409).
 * Distinguishes the backend's conflict codes so a daily-limit rejection is
 * never misreported as "slot taken" (and vice versa). */
export function conflictMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 409) {
    if (err.code === "DAILY_BOOKING_LIMIT_REACHED") {
      return "You already have an active booking for this day (max one per day). Cancel or wait for a decision on your existing booking before requesting another slot.";
    }
    if (err.code === "BOOKING_OVERLAP") {
      return "This slot is no longer available. Please select another slot.";
    }
    return err.message || "This request conflicts with an existing booking.";
  }
  return getErrorMessage(err);
}

/** Extract the backend error code (`DAILY_BOOKING_LIMIT_REACHED`, etc.). */
export function getErrorCode(err: unknown): string | null {
  if (err instanceof ApiError) return err.code || null;
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as { code: unknown }).code === "string"
  ) {
    return (err as { code: string }).code;
  }
  return null;
}
