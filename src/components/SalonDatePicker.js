"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

export default function SalonDatePicker({ value, onChange, unavailableDates = [], availableDates = null, onMonthChange = () => {} }) {
  const unavailableSet = useMemo(() => new Set(unavailableDates), [unavailableDates]);
  const availableSet = useMemo(() => (Array.isArray(availableDates) ? new Set(availableDates) : null), [availableDates]);

  const [weekStart, setWeekStart] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize state after hydration to avoid SSR/client mismatch from timezone differences
  useEffect(() => {
    const today = dayjs().startOf("day");
    const selected = value ? dayjs(value) : null;
    setWeekStart((selected || today).startOf("week"));
    setCurrentMonth((selected || today).startOf("month"));
    setIsHydrated(true);
  }, [value]);

  useEffect(() => {
    if (!weekStart) return;
    const m = weekStart.startOf("month");
    if (m.month() !== currentMonth.month() || m.year() !== currentMonth.year()) {
      setCurrentMonth(m);
    }
  }, [weekStart, currentMonth]);

  useEffect(() => {
    if (!currentMonth) return;
    try {
      onMonthChange(currentMonth.format("YYYY-MM-DD"));
    } catch (e) {
      // ignore
    }
  }, [currentMonth, onMonthChange]);

  // days grid removed - we only render a 7-day horizontal scroller

  const today = dayjs().startOf("day");
  const selected = value ? dayjs(value) : null;

  const isDisabled = (date) => {
    const iso = date.format("YYYY-MM-DD");
    if (date.isBefore(today, "day")) return true;
    if (unavailableSet.has(iso)) return true;
    if (availableSet && !availableSet.has(iso)) return true;
    return false;
  };

  const handleSelect = (date) => {
    if (isDisabled(date)) return;
    if (!onChange) return;
    onChange(date.format("YYYY-MM-DD"));
  };

  // Prevent hydration mismatch - don't render until hydrated
  if (!isHydrated || !weekStart || !currentMonth) {
    return <div className="w-full h-32" />;
  }

  const monthLabel = currentMonth.format("MMMM YYYY");
  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Only week navigation (prev/next week). Month changes automatically when weekStart moves across month boundary.
  const goToPrevWeek = () => {
    const prevWeek = weekStart.subtract(7, "day");
    // Don't allow navigating before today
    if (prevWeek.isBefore(today, "week")) return;
    setWeekStart(prevWeek);
  };
  const goToNextWeek = () => setWeekStart((w) => w.add(7, "day"));

  return (
    <div className="w-full text-xs text-neutral-800">
      <div className="rounded-md border border-black/10 bg-white p-2 text-xs text-neutral-800 shadow-sm">
        <div className="mb-2 px-1">
          <span className="text-sm font-semibold text-neutral-900">{monthLabel}</span>
        </div>

        <div className="mb-2 flex items-center gap-1">
          <button type="button" onClick={goToPrevWeek} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-neutral-700 hover:bg-neutral-100 text-xs">&#10094;</button>

          <div className="flex-1 overflow-auto">
            <div className="flex w-full justify-between gap-1 px-0.5">
              {Array.from({ length: 7 }).map((_, idx) => {
                const date = weekStart.add(idx, "day");
                const iso = date.format("YYYY-MM-DD");
                const disabled = isDisabled(date);
                const isToday = date.isSame(today, "day");
                const isSelected = selected && date.isSame(selected, "day");

                return (
                  <button key={iso} type="button" onClick={() => handleSelect(date)} disabled={disabled} className="flex flex-1 flex-col items-center justify-center rounded-md p-0.5 text-center min-w-0">
                    <div className={`text-[9px] font-medium truncate ${disabled ? "text-neutral-300" : "text-neutral-600"}`}>{weekdayLabels[(date.day() + 6) % 7]}</div>
                    <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all flex-shrink-0 ${isSelected ? "bg-blue-500 text-white shadow-md" : disabled ? "border-transparent text-neutral-300 bg-neutral-50 cursor-not-allowed" : isToday ? "border-2 border-blue-400 bg-white text-neutral-900 hover:bg-blue-50 hover:border-blue-500" : "border-transparent bg-white text-neutral-800 hover:bg-blue-100 hover:border-blue-300 hover:border-2"}`}>{date.date()}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button type="button" onClick={goToNextWeek} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-neutral-700 hover:bg-neutral-100 text-xs">&#10095;</button>
        </div>

        <div className="mt-1 border-t pt-2 text-center">
          {(() => {
            const weekDays = Array.from({ length: 7 }).map((_, i) => weekStart.add(i, "day"));
            const weekHasAvailable = weekDays.some((d) => !isDisabled(d));
            if (weekHasAvailable) return null;

            const weekEnd = weekStart.add(6, "day");
            let next = null;
            if (Array.isArray(availableDates) && availableDates.length > 0) {
              next = availableDates.find((d) => d > weekEnd.format("YYYY-MM-DD")) || availableDates.find((d) => d >= today.format("YYYY-MM-DD"));
              if (next) next = dayjs(next);
            } else {
              for (let i = 1; i <= 60; i++) {
                const cand = weekEnd.add(i, "day");
                if (!isDisabled(cand)) {
                  next = cand;
                  break;
                }
              }
            }

            if (!next) return <div className="text-xs text-neutral-500">Closed for the coming weeks.</div>;

            return (
              <>
                <div className="text-xs font-semibold text-neutral-900">Closed</div>
                <div className="mt-1 text-[11px] text-neutral-500">Next available: {next.format("dddd, D MMM")}</div>
                <div className="mt-2">
                  <button type="button" onClick={() => onChange(next.format("YYYY-MM-DD"))} className="inline-flex items-center justify-center rounded-full border border-primary/60 bg-white px-2.5 py-1 text-xs font-semibold text-primary shadow-sm hover:bg-primary/5">Go to {next.format("ddd, D MMM")}</button>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
 
