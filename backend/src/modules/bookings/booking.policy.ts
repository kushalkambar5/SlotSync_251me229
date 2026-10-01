import { BOOKING_TRANSITIONS } from "../../config/constants.js";
import type { BookingStatus } from "../../config/constants.js";
import { Errors } from "../../utils/errors.js";

/** backend_plan.md §31 — explicit transitions only, no generic status PATCH. */
export function assertTransition(from: string, to: string): void {
  const allowed = BOOKING_TRANSITIONS[from as BookingStatus] ?? [];
  if (!allowed.includes(to as BookingStatus))
    throw Errors.business(
      "INVALID_BOOKING_TRANSITION",
      `Cannot transition booking from ${from} to ${to}.`,
    );
}
