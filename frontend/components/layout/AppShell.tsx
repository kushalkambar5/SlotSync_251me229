"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, CalendarCheck, Bell, User } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { SidebarNavigation } from "@/components/navigation/SidebarNavigation";

const tabs = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/facilities", label: "Spaces", icon: Building2 },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

function MobileBar() {
  const pathname = usePathname();
  return (
    <div className="grid grid-cols-5">
      {tabs.map((t) => {
        const Icon = t.icon;
        const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-semibold ${
              active ? "text-[#EF2B4D]" : "text-gray-500"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

export function AppShell({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F4F5F7]/60">
      <AppHeader title={title} />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-gray-200/80 bg-white p-3 shadow-sm">
            <SidebarNavigation />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      {/* Mobile bottom navigation */}
      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-2 py-1 lg:hidden"
      >
        <MobileBar />
      </nav>
      <div className="h-16 lg:hidden" />
    </div>
  );
}
