// Shared time helpers for bookings / operating hours / availability.

/** "10:30" -> minutes since midnight. Throws on invalid format. */
export function timeToMinutes(t: string): number {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(t.trim());
  if (!m) throw new Error(`Invalid time: ${t}`);
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 24 || min < 0 || min > 59) throw new Error(`Invalid time: ${t}`);
  return h * 60 + min;
}

export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Exactly one hour (60 minutes)? backend_plan.md §§16, 25. */
export function isOneHourSlot(start: string, end: string): boolean {
  try {
    return timeToMinutes(end) - timeToMinutes(start) === 60;
  } catch {
    return false;
  }
}

/** Half-open overlap: [s1,e1) vs [s2,e2). */
export function slotsOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  return timeToMinutes(s1) < timeToMinutes(e2) && timeToMinutes(s2) < timeToMinutes(e1);
}

/** Slot inside operating window (inclusive start, exclusive end)? */
export function slotInsideHours(
  slotStart: string,
  slotEnd: string,
  opensAt: string,
  closesAt: string,
): boolean {
  return (
    timeToMinutes(slotStart) >= timeToMinutes(opensAt) &&
    timeToMinutes(slotEnd) <= timeToMinutes(closesAt)
  );
}

/** 0 = Sunday … 6 = Saturday (plan §20). Uses UTC date to avoid TZ drift. */
export function dayOfWeek(dateStr: string): number {
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${dateStr}`);
  return d.getUTCDay();
}

/** "YYYY-MM-DD" strict check + not-in-the-past (compares date part only). */
export function isValidBookingDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  return dateStr >= (todayStr as string);
}

/** Combine date + time into a Date (local facility time assumed; stored as UTC instant). */
export function slotStartDate(dateStr: string, startTime: string): Date {
  return new Date(`${dateStr}T${startTime.length === 5 ? startTime + ":00" : startTime}`);
}
