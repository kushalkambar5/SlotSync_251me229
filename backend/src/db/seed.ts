import "dotenv/config";
import { client, db } from "./client.js";
import { departments } from "./schema/departments.js";
import { facilityTypes } from "./schema/facility-types.js";
import { permissions } from "./schema/permissions.js";
import { rolePermissions } from "./schema/role-permissions.js";
import { roles } from "./schema/roles.js";

const ROLE_SEED = [
  { name: "ADMIN", description: "Facility manager with full control", isSystemRole: true },
  { name: "FACULTY", description: "Can browse facilities and request bookings", isSystemRole: true },
  { name: "CONVENOR", description: "Same booking permissions as faculty", isSystemRole: true },
  { name: "STUDENT", description: "Read-only facility and availability browsing", isSystemRole: true },
] as const;

// resource + action pairs from §8 of db_plan.md
const PERMISSION_SEED: Array<{ name: string; resource: string; action: string }> = [
  { name: "view_facilities", resource: "facility", action: "view" },
  { name: "view_availability", resource: "availability", action: "view" },
  { name: "book_facility", resource: "booking", action: "create" },
  { name: "cancel_booking", resource: "booking", action: "cancel" },
  { name: "approve_booking", resource: "booking", action: "approve" },
  { name: "reject_booking", resource: "booking", action: "reject" },
  { name: "approve_cancellation", resource: "cancellation", action: "approve" },
  { name: "reject_cancellation", resource: "cancellation", action: "reject" },
  { name: "manage_facilities", resource: "facility", action: "manage" },
  { name: "manage_users", resource: "user", action: "manage" },
  { name: "manage_roles", resource: "role", action: "manage" },
  { name: "view_analytics", resource: "analytics", action: "view" },
];

const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  ADMIN: PERMISSION_SEED.map((p) => p.name),
  FACULTY: ["view_facilities", "view_availability", "book_facility", "cancel_booking"],
  CONVENOR: ["view_facilities", "view_availability", "book_facility", "cancel_booking"],
  STUDENT: ["view_facilities", "view_availability"],
};

const DEPARTMENT_SEED = [
  { name: "Computer Science and Engineering", code: "CSE" },
  { name: "Electronics and Communication", code: "ECE" },
  { name: "Mechanical Engineering", code: "ME" },
  { name: "Civil Engineering", code: "CE" },
  { name: "Electrical Engineering", code: "EEE" },
  { name: "Information Technology", code: "IT" },
];

const FACILITY_TYPE_SEED = [
  { name: "CLASSROOM", description: "Standard teaching classroom" },
  { name: "LAB", description: "Practical / computer laboratory" },
  { name: "SEMINAR_HALL", description: "Mid-size seminar hall" },
  { name: "AUDITORIUM", description: "Large auditorium" },
  { name: "MEETING_ROOM", description: "Small meeting room" },
];

async function main(): Promise<void> {
  const roleRows = await db.insert(roles).values([...ROLE_SEED]).onConflictDoNothing().returning();
  const permissionRows = await db
    .insert(permissions)
    .values(PERMISSION_SEED)
    .onConflictDoNothing()
    .returning();

  const allRoles = roleRows.length > 0 ? roleRows : await db.select().from(roles);
  const allPermissions =
    permissionRows.length > 0 ? permissionRows : await db.select().from(permissions);

  const permissionByName = new Map(allPermissions.map((p) => [p.name, p.id]));
  for (const role of allRoles) {
    const names = ROLE_PERMISSION_MAP[role.name] ?? [];
    if (names.length === 0) continue;
    await db
      .insert(rolePermissions)
      .values(
        names.flatMap((name) => {
          const permissionId = permissionByName.get(name);
          return permissionId ? [{ roleId: role.id, permissionId }] : [];
        }),
      )
      .onConflictDoNothing();
  }

  await db.insert(departments).values(DEPARTMENT_SEED).onConflictDoNothing();
  await db.insert(facilityTypes).values(FACILITY_TYPE_SEED).onConflictDoNothing();

  await client.end();
  console.log("Seed complete");
}

void main().catch(async (err: unknown) => {
  console.error(err);
  await client.end();
  process.exit(1);
});
