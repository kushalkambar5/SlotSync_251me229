"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="User menu"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#F4F5F7]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EF2B4D] text-xs font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-semibold text-[#1F1F1F] sm:block">
          {user.name}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
      </button>
      {open && (
        <>
          <button
            aria-label="Close user menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-60 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-bold text-[#1F1F1F]">{user.name}</p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
              {user.roleName && (
                <p className="mt-1 inline-block rounded-full bg-[#F4F5F7] px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                  {user.roleName}
                </p>
              )}
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#F4F5F7]"
            >
              <UserIcon className="h-4 w-4" aria-hidden="true" /> Profile
            </Link>
            <button
              onClick={() => void logout()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
