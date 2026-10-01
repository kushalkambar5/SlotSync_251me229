-- §17 of db_plan.md — approved bookings for the same facility must never
-- overlap, even under concurrent requests. A normal
-- SELECT-then-INSERT flow can race, so this exclusion constraint is the
-- final safety boundary. Drizzle has no EXCLUDE builder, so it ships as
-- versioned raw SQL applied after `drizzle-kit migrate` (see migrate.ts).
--
-- The tsrange expression builds a half-open [start, end) range from
-- `booking_date + start/end_time` (DATE + TIME -> TIMESTAMP). This form is
-- used deliberately: text -> timestamp/timestamptz casts depend on GUCs
-- (DateStyle/TimeZone) and are only STABLE, while exclusion-constraint index
-- expressions must be IMMUTABLE — but DATE + TIME arithmetic is IMMUTABLE.
-- Booking slots are wall-clock facility-local times, so tsrange is also
-- semantically correct. The WHERE clause scopes the constraint to APPROVED
-- rows only, so PENDING / REJECTED / CANCELLED rows never block.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS no_overlap_approved_bookings;

ALTER TABLE bookings
  ADD CONSTRAINT no_overlap_approved_bookings
  EXCLUDE USING gist (
    facility_id WITH =,
    tsrange(
      (booking_date + start_time),
      (booking_date + end_time),
      '[)'
    ) WITH &&
  )
  WHERE (status = 'APPROVED');
