"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { formatTime } from "@/lib/utils/format";
import type { AvailabilitySlot } from "@/types/facility";

const slotBtn: Record<string, string> = {
  AVAILABLE: "bg-[#F4F5F7] text-gray-700 border-gray-200 hover:bg-[#FDE8EB] hover:text-[#EF2B4D] hover:border-[#EF2B4D]/40",
  BOOKED: "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through",
  SELECTED: "bg-[#EF2B4D] text-white border-[#EF2B4D] shadow-sm ring-2 ring-[#EF2B4D]/30",
};

export function AvailabilitySlotGrid({
  slots,
  selected,
  onSelect,
  loading,
}: {
  slots: AvailabilitySlot[] | undefined;
  selected: { startTime: string; endTime: string } | null;
  onSelect: (s: AvailabilitySlot) => void;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Loading slots">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-200/80" />
        ))}
      </div>
    );
  }
  if (!slots || slots.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
        No bookable slots for this date — the facility may be closed, under
        maintenance, or outside operating hours.
      </p>
    );
  }
  return (
    <div>
      <div className="mb-2 flex items-center gap-4 text-[11px] font-medium text-gray-500">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-300" /> Booked
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#EF2B4D]" /> Selected
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Time slots">
        {slots.map((s) => {
          const isBooked = s.status === "BOOKED";
          const isSelected =
            selected?.startTime === s.startTime && selected?.endTime === s.endTime;
          const cls = isBooked ? slotBtn.BOOKED : isSelected ? slotBtn.SELECTED : slotBtn.AVAILABLE;
          return (
            <button
              key={`${s.startTime}-${s.endTime}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isBooked}
              onClick={() => onSelect(s)}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${cls}`}
            >
              <span>
                {formatTime(s.startTime)} – {formatTime(s.endTime)}
              </span>
              {isBooked ? (
                <span className="text-[10px] font-medium">Booked</span>
              ) : isSelected ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <span className="text-[10px] font-semibold text-emerald-600">Free</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateSelector({
  value,
  onChange,
  min,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
}) {
  const [quick, setQuick] = useState<string>("");
  const shift = (days: number) => {
    const d = new Date(value ? `${value}T00:00:00` : new Date());
    d.setDate(d.getDate() + days);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const iso = `${d.getFullYear()}-${m}-${day}`;
    if (!min || iso >= min) onChange(iso);
    setQuick("");
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="avail-date" className="text-sm font-semibold text-[#1F1F1F]">
        Date
      </label>
      <input
        id="avail-date"
        type="date"
        value={value}
        min={min}
        onChange={(e) => {
          onChange(e.target.value);
          setQuick("");
        }}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#EF2B4D] focus:outline-none"
      />
      <div className="flex gap-1">
        {(["Today", "Tomorrow"] as const).map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              const base = new Date();
              if (label === "Tomorrow") base.setDate(base.getDate() + 1);
              const m = String(base.getMonth() + 1).padStart(2, "0");
              const day = String(base.getDate()).padStart(2, "0");
              onChange(`${base.getFullYear()}-${m}-${day}`);
              setQuick(label);
            }}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
              quick === label
                ? "bg-[#EF2B4D] text-white"
                : "bg-[#F4F5F7] text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => shift(-1)}
          className="rounded-lg bg-[#F4F5F7] px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
          aria-label="Previous day"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => shift(1)}
          className="rounded-lg bg-[#F4F5F7] px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
          aria-label="Next day"
        >
          →
        </button>
      </div>
    </div>
  );
}
