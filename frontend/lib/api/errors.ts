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

/** Human-friendly message for booking conflicts (409). */
export function conflictMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 409) {
    return "This slot is no longer available. Please select another slot.";
  }
  return getErrorMessage(err);
}
