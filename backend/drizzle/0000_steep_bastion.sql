CREATE TYPE "public"."booking_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLATION_REQUESTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."cancellation_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."facility_status" AS ENUM('AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('BOOKING_APPROVED', 'BOOKING_REJECTED', 'CANCELLATION_APPROVED', 'CANCELLATION_REJECTED', 'BOOKING_REMINDER', 'WAITLIST_PROMOTED');--> statement-breakpoint
CREATE TYPE "public"."restriction_type" AS ENUM('NO_SHOW', 'ADMIN_RESTRICTION');--> statement-breakpoint
CREATE TYPE "public"."waitlist_status" AS ENUM('WAITING', 'PROMOTED', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"code" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "departments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_system_role" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"resource" varchar(100) NOT NULL,
	"action" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_resource_action_unique" UNIQUE("resource","action")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"department_id" uuid,
	"role_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "facility_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "facility_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"code" varchar(50) NOT NULL,
	"type_id" uuid NOT NULL,
	"location" text,
	"building" varchar(100),
	"floor" varchar(30),
	"capacity" integer NOT NULL,
	"description" text,
	"status" "facility_status" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "facilities_code_unique" UNIQUE("code"),
	CONSTRAINT "facilities_capacity_positive" CHECK ("facilities"."capacity" > 0)
);
--> statement-breakpoint
CREATE TABLE "facility_operating_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"day_of_week" smallint NOT NULL,
	"opens_at" time,
	"closes_at" time,
	"is_closed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "facility_operating_hours_day_range" CHECK ("facility_operating_hours"."day_of_week" BETWEEN 0 AND 6),
	CONSTRAINT "facility_operating_hours_open_valid" CHECK (("facility_operating_hours"."is_closed" = true) OR ("facility_operating_hours"."opens_at" IS NOT NULL AND "facility_operating_hours"."closes_at" IS NOT NULL AND "facility_operating_hours"."opens_at" < "facility_operating_hours"."closes_at"))
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"facility_id" uuid NOT NULL,
	"booking_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"status" "booking_status" NOT NULL,
	"purpose" text,
	"rejection_reason" text,
	"approved_at" timestamp with time zone,
	"approved_by" uuid,
	"rejected_at" timestamp with time zone,
	"rejected_by" uuid,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_time_order" CHECK ("bookings"."start_time" < "bookings"."end_time")
);
--> statement-breakpoint
CREATE TABLE "cancellation_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"requested_by" uuid NOT NULL,
	"reason" text NOT NULL,
	"status" "cancellation_status" NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"review_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"booking_id" uuid,
	"type" "notification_type" NOT NULL,
	"title" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"action" varchar(150) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" "inet",
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"facility_id" uuid NOT NULL,
	"booking_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"position" integer NOT NULL,
	"status" "waitlist_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_entries_position_positive" CHECK ("waitlist_entries"."position" > 0),
	CONSTRAINT "waitlist_entries_time_order" CHECK ("waitlist_entries"."start_time" < "waitlist_entries"."end_time")
);
--> statement-breakpoint
CREATE TABLE "booking_restrictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"restriction_type" "restriction_type" NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "booking_restrictions_expiry_after_start" CHECK ("booking_restrictions"."expires_at" > "booking_restrictions"."starts_at")
);
--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_type_id_facility_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."facility_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_operating_hours" ADD CONSTRAINT "facility_operating_hours_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_rejected_by_users_id_fk" FOREIGN KEY ("rejected_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancellation_requests" ADD CONSTRAINT "cancellation_requests_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancellation_requests" ADD CONSTRAINT "cancellation_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancellation_requests" ADD CONSTRAINT "cancellation_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_restrictions" ADD CONSTRAINT "booking_restrictions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_restrictions" ADD CONSTRAINT "booking_restrictions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_unique" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "users_role_id_idx" ON "users" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "users_department_id_idx" ON "users" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "users_is_active_idx" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "facilities_type_id_idx" ON "facilities" USING btree ("type_id");--> statement-breakpoint
CREATE INDEX "facilities_status_idx" ON "facilities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "facilities_capacity_idx" ON "facilities" USING btree ("capacity");--> statement-breakpoint
CREATE INDEX "facilities_type_capacity_status_idx" ON "facilities" USING btree ("type_id","capacity","status");--> statement-breakpoint
CREATE UNIQUE INDEX "facility_operating_hours_facility_day_unique" ON "facility_operating_hours" USING btree ("facility_id","day_of_week");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_user_day_active_unique" ON "bookings" USING btree ("user_id","booking_date") WHERE "bookings"."status" IN ('PENDING', 'APPROVED', 'CANCELLATION_REQUESTED');--> statement-breakpoint
CREATE INDEX "bookings_facility_date_idx" ON "bookings" USING btree ("facility_id","booking_date");--> statement-breakpoint
CREATE INDEX "bookings_facility_date_status_idx" ON "bookings" USING btree ("facility_id","booking_date","status");--> statement-breakpoint
CREATE INDEX "bookings_user_date_idx" ON "bookings" USING btree ("user_id","booking_date");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bookings_approved_by_idx" ON "bookings" USING btree ("approved_by");--> statement-breakpoint
CREATE INDEX "bookings_created_at_idx" ON "bookings" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cancellation_requests_booking_pending_unique" ON "cancellation_requests" USING btree ("booking_id") WHERE "cancellation_requests"."status" = 'PENDING';--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_booking_id_idx" ON "notifications" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_entries_active_slot_unique" ON "waitlist_entries" USING btree ("user_id","facility_id","booking_date","start_time","end_time") WHERE "waitlist_entries"."status" = 'WAITING';--> statement-breakpoint
CREATE INDEX "waitlist_entries_slot_idx" ON "waitlist_entries" USING btree ("facility_id","booking_date","status");--> statement-breakpoint
CREATE INDEX "waitlist_entries_user_idx" ON "waitlist_entries" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "booking_restrictions_user_window_idx" ON "booking_restrictions" USING btree ("user_id","starts_at","expires_at");