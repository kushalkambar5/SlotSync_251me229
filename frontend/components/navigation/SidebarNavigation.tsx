"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Bell,
  User,
  ShieldCheck,
  ClipboardList,
  BarChart3,
  ScrollText,
  Users,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { PERMISSIONS } from "@/lib/auth/permissions";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  admin?: boolean;
}

const appNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/facilities", label: "Facilities", icon: Building2 },
  { href: "/bookings", label: "My Bookings", icon: CalendarCheck },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Admin Overview", icon: ShieldCheck, permission: PERMISSIONS.APPROVE_BOOKING, admin: true },
  { href: "/admin/bookings", label: "Booking Approvals", icon: ClipboardList, permission: PERMISSIONS.APPROVE_BOOKING, admin: true },
  { href: "/admin/cancellations", label: "Cancellations", icon: ClipboardList, permission: PERMISSIONS.APPROVE_CANCELLATION, admin: true },
  { href: "/admin/facilities", label: "Facilities", icon: Building2, permission: PERMISSIONS.MANAGE_FACILITIES, admin: true },
  { href: "/admin/users", label: "Users", icon: Users, permission: PERMISSIONS.MANAGE_USERS, admin: true },
  { href: "/admin/roles", label: "Roles & Access", icon: KeyRound, permission: PERMISSIONS.MANAGE_ROLES, admin: true },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, permission: PERMISSIONS.VIEW_ANALYTICS, admin: true },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText, permission: PERMISSIONS.VIEW_AUDIT_LOGS, admin: true },
];

export function useVisibleNav() {
  const { can } = useAuth();
  return {
    appNav,
    adminNav: adminNav.filter((i) => (i.permission ? can(i.permission) : true)),
  };
}

function NavLink({ href, label, icon: Icon }: NavItem) {
  const pathname = usePathname();
  // Exact match, or a true child route (href + "/..."). "/dashboard" and
  // "/admin" are index pages, so they only highlight on exact match —
  // otherwise Admin Overview would stay lit on every /admin/* page.
  const isIndex = href === "/dashboard" || href === "/admin";
  const active = pathname === href || (!isIndex && pathname.startsWith(`${href}/`));
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-[#FDE8EB] text-[#EF2B4D]"
          : "text-gray-700 hover:bg-[#F4F5F7] hover:text-[#1F1F1F]"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

export function SidebarNavigation() {
  const { adminNav } = useVisibleNav();
  return (
    <nav aria-label="Application" className="flex flex-col gap-1">
      {appNav.map((i) => (
        <NavLink key={i.href} {...i} />
      ))}
      {adminNav.length > 0 && (
        <>
          <p className="mt-4 mb-1 px-3.5 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
            Administration
          </p>
          {adminNav.map((i) => (
            <NavLink key={i.href} {...i} />
          ))}
        </>
      )}
    </nav>
  );
}
