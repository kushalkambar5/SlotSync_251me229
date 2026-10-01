"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NotificationBell } from "@/components/navigation/NotificationBell";
import { UserMenu } from "@/components/navigation/UserMenu";
import { SidebarNavigation } from "@/components/navigation/SidebarNavigation";

export function AppHeader({ title }: { title?: string }) {
  const [drawer, setDrawer] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
            onClick={() => setDrawer(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <Link href="/dashboard" className="flex items-center" aria-label="SlotSync dashboard">
            <span className="relative block h-8 w-32">
              <Image src="/navbar_logo.png" alt="SlotSync" fill className="object-contain object-left" sizes="128px" />
            </span>
          </Link>
          {title && (
            <span className="hidden text-sm font-semibold text-gray-500 md:block">/ {title}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close navigation" onClick={() => setDrawer(false)} className="absolute inset-0 bg-black/40" />
          <div className="absolute top-0 left-0 flex h-full w-72 flex-col bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold">Menu</span>
              <button onClick={() => setDrawer(false)} aria-label="Close navigation" className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div onClick={() => setDrawer(false)}>
              <SidebarNavigation />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1F1F1F] sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-gray-600">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
