-- §32 of db_plan.md — GiST support required for the APPROVED-booking
-- overlap exclusion constraint (facility UUID equality inside a GiST index).
CREATE EXTENSION IF NOT EXISTS btree_gist;
