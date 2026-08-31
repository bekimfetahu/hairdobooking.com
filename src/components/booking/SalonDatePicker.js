"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";

export default function SalonDatePicker({ value, onChange, unavailableDates = [], availableDates = null, onMonthChange = () => {}, isLoading = false }) {
  const unavailableSet = useMemo(() => new Set(unavailableDates), [unavailableDates]);
  const availableSet = useMemo(() => (Array.isArray(availableDates) ? new Set(availableDates) : null), [availableDates]);

  const [weekStart, setWeekStart] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const initialMonthFetchDoneRef = useRef(false);

  // Initialize state after hydration to avoid SSR/client mismatch from timezone differences
  useEffect(() => {
    const today = dayjs().startOf("day");
    const selected = value ? dayjs(value) : null;
    // Compute ISO-week (Monday) start for a given date
    const isoWeekStart = (d) => {
      const dd = d.startOf('day');
      const shift = (dd.day() + 6) % 7; // 0=Sun -> shift 6, 1=Mon -> shift 0
      return dd.subtract(shift, 'day');
    };

    const base = selected || today;
    const week = isoWeekStart(base);
    setWeekStart(week);
    setCurrentMonth(week.startOf('month'));
    setIsHydrated(true);
  }, [value]);

  useEffect(() => {
    if (!weekStart) return;
    const m = weekStart.startOf("month");
    if (!currentMonth || m.month() !== currentMonth.month() || m.year() !== currentMonth.year()) {
      setCurrentMonth(m);
    }
  }, [weekStart, currentMonth]);

  useEffect(() => {
    if (!currentMonth) return;

    // Skip the initial hydration-driven month load because the parent already prefetches
    // the current 2-week availability window for the selected service.
    if (!initialMonthFetchDoneRef.current) {
      initialMonthFetchDoneRef.current = true;
      return;
    }

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
  const isoWeekStart = (d) => {
    const dd = d.startOf('day');
    const shift = (dd.day() + 6) % 7;
    return dd.subtract(shift, 'day');
  };

  const goToPrevWeek = () => {
    const prevWeek = weekStart.subtract(7, "day");
    // Don't allow navigating before the ISO-week of today
    if (prevWeek.isBefore(isoWeekStart(today))) return;
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
          <button type="button" onClick={goToPrevWeek} disabled={isLoading} className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-all ${isLoading ? "border-primary/60 bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-lg shadow-primary/60 animate-pulse cursor-not-allowed" : "border-primary/80 bg-white text-primary hover:border-primary hover:shadow-md hover:shadow-primary/30 hover:bg-primary/5"}`}>&#10094;</button>

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

          <button type="button" onClick={goToNextWeek} disabled={isLoading} className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-all ${isLoading ? "border-primary/60 bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-lg shadow-primary/60 animate-pulse cursor-not-allowed" : "border-primary/80 bg-white text-primary hover:border-primary hover:shadow-md hover:shadow-primary/30 hover:bg-primary/5"}`}>&#10095;</button>
        </div>

        <div className="mt-1 border-t border-neutral-100 pt-2 text-center">
          {(() => {
            const weekHasAvailable = Array.from({ length: 7 }).some((_, i) => !isDisabled(weekStart.add(i, 'day')));
            if (weekHasAvailable) return null;

            const weekEnd = weekStart.add(6, "day");

            // Find next available within the current week (after today)
            const weekDays = Array.from({ length: 7 }).map((_, i) => weekStart.add(i, 'day'));
            const nextInWeek = weekDays.find((d) => !isDisabled(d) && (d.isSame(today, 'day') || d.isAfter(today, 'day')));

            // Find the next available after this week (first try `availableDates` list, then fallback to scanning)
            let next = null;
            if (Array.isArray(availableDates) && availableDates.length > 0) {
              next = availableDates.find((d) => d > weekEnd.format("YYYY-MM-DD")) || availableDates.find((d) => d >= today.format("YYYY-MM-DD"));
              if (next) next = dayjs(next);
            }

            // If `availableDates` was provided but didn't contain a suitable next date,
            // fall back to scanning the calendar up to 60 days ahead to find the next non-disabled day.
            if (!next) {
              for (let i = 1; i <= 60; i++) {
                const cand = weekEnd.add(i, "day");
                if (!isDisabled(cand)) {
                  next = cand;
                  break;
                }
              }
            }

            // Determine messaging
            // If there's an available day later this week, show "Closed today"
            if (nextInWeek) {
              return (
                <>
                  <div className="text-xs font-semibold text-neutral-900">Closed today</div>
                  <div className="mt-1 text-[11px] text-neutral-500">Open next: {nextInWeek.format("dddd, D MMM")}</div>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const targetWeek = isoWeekStart(nextInWeek);
                          setWeekStart(targetWeek);
                          setCurrentMonth(targetWeek.startOf('month'));
                        } catch (e) {}
                        onChange(nextInWeek.format("YYYY-MM-DD"));
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-primary/60 bg-white px-2.5 py-1 text-xs font-semibold text-primary shadow-sm hover:bg-primary/5"
                    >
                      Go to {nextInWeek.format("ddd, D MMM")}
                    </button>
                  </div>
                </>
              );
            }

            // If no available day this week but there's one later, show "Closed this week"
            if (next) {
              return (
                <>
                  <div className="text-xs font-semibold text-neutral-900">Closed this week</div>
                  <div className="mt-1 text-[11px] text-neutral-500">Next available: {next.format("dddd, D MMM")}</div>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const targetWeek = isoWeekStart(next);
                          setWeekStart(targetWeek);
                          setCurrentMonth(targetWeek.startOf('month'));
                        } catch (e) {}
                        onChange(next.format("YYYY-MM-DD"));
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-primary/60 bg-white px-2.5 py-1 text-xs font-semibold text-primary shadow-sm hover:bg-primary/5"
                    >
                      Go to {next.format("ddd, D MMM")}
                    </button>
                  </div>
                </>
              );
            }

            // No availability in the next N days
            return <div className="text-xs text-neutral-500">No available times in the next 60 days.</div>;
          })()}
        </div>
      </div>
    </div>
  );
}
 
