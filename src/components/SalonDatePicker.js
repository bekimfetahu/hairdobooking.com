"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";

/**
 * Reusable date picker for salon booking.
 *
 * Props:
 * - value: string | null (YYYY-MM-DD)
 * - onChange: (value: string) => void
 * - unavailableDates?: string[] (each in YYYY-MM-DD, will be disabled)
 *
 * Behavior:
 * - Renders a compact trigger. Clicking it opens an inline calendar popover.
 * - Selecting a date calls onChange and closes the calendar.
 */
export default function SalonDatePicker({ value, onChange, unavailableDates = [] }) {
  const today = dayjs().startOf("day");
  const selected = value ? dayjs(value) : null;

  const unavailableSet = useMemo(() => new Set(unavailableDates), [unavailableDates]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const base = selected || today;
    return base.startOf("month");
  });

  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const startOfMonth = currentMonth.startOf("month");
  const startWeekday = startOfMonth.day(); // 0 (Sun) - 6 (Sat)
  const gridStart = startOfMonth.subtract(startWeekday, "day");

  const days = useMemo(() => {
    return Array.from({ length: 42 }, (_, index) => gridStart.add(index, "day"));
  }, [gridStart.valueOf()]);

  const isSameDay = (a, b) => a && b && a.isSame(b, "day");

  const isDisabled = (date) => {
    const iso = date.format("YYYY-MM-DD");
    if (date.isBefore(today, "day")) return true;
    if (unavailableSet.has(iso)) return true;
    return false;
  };

  const handleSelect = (date) => {
    if (isDisabled(date)) return;
    if (!onChange) return;
    const iso = date.format("YYYY-MM-DD");
    onChange(iso);
    setIsOpen(false);
  };

  const monthLabel = currentMonth.format("MMMM YYYY");

  const goToPrevMonth = () => {
    setCurrentMonth((m) => m.subtract(1, "month"));
  };

  const goToNextMonth = () => {
    setCurrentMonth((m) => m.add(1, "month"));
  };

  const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (event) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const displayLabel = selected ? selected.format("ddd, DD MMM YYYY") : "Choose a date";

  return (
    <div ref={wrapperRef} className="relative inline-block w-full text-xs text-neutral-800">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white px-3 py-2 text-left text-xs font-medium text-neutral-800 hover:border-black/20 hover:bg-neutral-50"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="truncate">{displayLabel}</span>
        <span className="ml-2 text-[10px] text-neutral-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-2 rounded-md border border-black/10 bg-white p-3 text-xs text-neutral-800 shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-neutral-700 hover:bg-neutral-100"
              aria-label="Previous month"
            >
              &#10094;
            </button>
            <span className="text-xs font-semibold text-neutral-900">{monthLabel}</span>
            <button
              type="button"
              onClick={goToNextMonth}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-neutral-700 hover:bg-neutral-100"
              aria-label="Next month"
            >
              &#10095;
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-[10px] font-medium text-neutral-500">
            {weekdayLabels.map((label) => (
              <div key={label} className="flex items-center justify-center">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs">
            {days.map((date) => {
              const iso = date.format("YYYY-MM-DD");
              const disabled = isDisabled(date);
              const isCurrentMonth = date.month() === currentMonth.month();
              const isToday = date.isSame(today, "day");
              const isSelected = selected && isSameDay(date, selected);

              const baseClasses = "flex h-8 w-8 items-center justify-center rounded-full border text-[11px] transition-colors";

              let stateClasses = "border-transparent text-neutral-700 hover:bg-neutral-100 hover:border-black/10";

              if (!isCurrentMonth) {
                stateClasses = "border-transparent text-neutral-300 hover:bg-transparent hover:border-transparent";
              }

              if (disabled) {
                stateClasses = "border-transparent text-neutral-300 bg-neutral-50 cursor-not-allowed hover:bg-neutral-50";
              }

              if (isSelected) {
                stateClasses = "border-black bg-black text-white hover:bg-black";
              } else if (!disabled && isToday) {
                stateClasses = "border-black/30 bg-neutral-100 text-neutral-900 hover:bg-neutral-200";
              }

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => handleSelect(date)}
                  className={`${baseClasses} ${stateClasses}`}
                  disabled={disabled}
                  aria-pressed={!!isSelected}
                  aria-current={isToday ? "date" : undefined}
                >
                  {date.date()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
