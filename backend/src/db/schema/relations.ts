import { relations } from "drizzle-orm/relations";
import { auditLogs } from "./audit-logs.js";
import { bookingRestrictions } from "./booking-restrictions.js";
import { bookings } from "./bookings.js";
import { cancellationRequests } from "./cancellation-requests.js";
import { departments } from "./departments.js";
import { facilities } from "./facilities.js";
import { facilityOperatingHours } from "./facility-operating-hours.js";
import { facilityTypes } from "./facility-types.js";
import { notifications } from "./notifications.js";
import { permissions } from "./permissions.js";
import { rolePermissions } from "./role-permissions.js";
import { roles } from "./roles.js";
import { users } from "./users.js";
import { waitlistEntries } from "./waitlist-entries.js";

// Relational query helpers (db.query.*) mirroring §§4 + 40 of db_plan.md.
export const departmentsRelations = relations(departments, ({ many }) => ({
  users: many(users),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  bookings: many(bookings),
  notifications: many(notifications),
  waitlistEntries: many(waitlistEntries),
  bookingRestrictions: many(bookingRestrictions),
  auditLogs: many(auditLogs),
}));

export const facilityTypesRelations = relations(facilityTypes, ({ many }) => ({
  facilities: many(facilities),
}));

export const facilitiesRelations = relations(facilities, ({ one, many }) => ({
  type: one(facilityTypes, {
    fields: [facilities.typeId],
    references: [facilityTypes.id],
  }),
  operatingHours: many(facilityOperatingHours),
  bookings: many(bookings),
  waitlistEntries: many(waitlistEntries),
}));

export const facilityOperatingHoursRelations = relations(
  facilityOperatingHours,
  ({ one }) => ({
    facility: one(facilities, {
      fields: [facilityOperatingHours.facilityId],
      references: [facilities.id],
    }),
  }),
);

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  facility: one(facilities, {
    fields: [bookings.facilityId],
    references: [facilities.id],
  }),
  approvedByUser: one(users, {
    fields: [bookings.approvedBy],
    references: [users.id],
  }),
  rejectedByUser: one(users, {
    fields: [bookings.rejectedBy],
    references: [users.id],
  }),
  cancelledByUser: one(users, {
    fields: [bookings.cancelledBy],
    references: [users.id],
  }),
  cancellationRequests: many(cancellationRequests),
  notifications: many(notifications),
}));

export const cancellationRequestsRelations = relations(
  cancellationRequests,
  ({ one }) => ({
    booking: one(bookings, {
      fields: [cancellationRequests.bookingId],
      references: [bookings.id],
    }),
    requestedByUser: one(users, {
      fields: [cancellationRequests.requestedBy],
      references: [users.id],
    }),
    reviewedByUser: one(users, {
      fields: [cancellationRequests.reviewedBy],
      references: [users.id],
    }),
  }),
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [notifications.bookingId],
    references: [bookings.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id],
  }),
}));

export const waitlistEntriesRelations = relations(waitlistEntries, ({ one }) => ({
  user: one(users, {
    fields: [waitlistEntries.userId],
    references: [users.id],
  }),
  facility: one(facilities, {
    fields: [waitlistEntries.facilityId],
    references: [facilities.id],
  }),
}));

export const bookingRestrictionsRelations = relations(
  bookingRestrictions,
  ({ one }) => ({
    user: one(users, {
      fields: [bookingRestrictions.userId],
      references: [users.id],
    }),
    createdByUser: one(users, {
      fields: [bookingRestrictions.createdBy],
      references: [users.id],
    }),
  }),
);
