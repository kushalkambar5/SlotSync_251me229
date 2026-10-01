-- §17 of db_plan.md — approved bookings for the same facility must never
-- overlap, even under concurrent requests. A normal
-- SELECT-then-INSERT flow can race, so this exclusion constraint is the
-- final safety boundary. Drizzle has no EXCLUDE builder, so it ships as
-- versioned raw SQL applied after `drizzle-kit migrate` (see migrate.ts).
--
-- The tstzrange expression builds a half-open [start, end) range from the
-- booking's date + start/end times. The WHERE clause scopes the constraint
-- to APPROVED rows only, so PENDING / REJECTED / CANCELLED rows never block.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS no_overlap_approved_bookings;

ALTER TABLE bookings
  ADD CONSTRAINT no_overlap_approved_bookings
  EXCLUDE USING gist (
    facility_id WITH =,
    tstzrange(
      ((booking_date::text || ' ' || start_time::text)::timestamptz),
      ((booking_date::text || ' ' || end_time::text)::timestamptz),
      '[)'
    ) WITH &&
  )
  WHERE (status = 'APPROVED');
