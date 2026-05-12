"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function formatMoney(value) {
  if (value == null) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : `£${n.toFixed(2)}`;
}

/**
 * ServiceItem Component
 * Displays a single service item with pricing and duration
 * Used within service groups in venue results
 */
function ServiceItem({
  service,
  onServiceClick,
  isExpanded,
  showExpandButton = false,
  isIndented = false,
  onToggleGroup,
}) {
  const meta = [service.category, service.audience].filter(Boolean).join(" · ");

  if (showExpandButton && service.itemCount) {
    // Multi-variant group header
    const prices = (service.items || [])
      .map((s) => Number(s.price))
      .filter((p) => !Number.isNaN(p));
    const minPrice = prices.length ? Math.min(...prices) : null;

    return (
      <button
        type="button"
        onClick={() => onToggleGroup?.()}
        className="w-full pl-0 pr-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {service.name} ({service.itemCount})
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {minPrice != null && (
            <span className="text-sm font-semibold text-gray-900">
              From {formatMoney(minPrice)}
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </button>
    );
  }

  // Single service item
  return (
    <button
      type="button"
      onClick={() => onServiceClick?.()}
      className={cn(
        "w-full pr-4 py-3 text-left hover:transition-colors flex items-center justify-between gap-4",
        isIndented ? "pl-8 hover:bg-gray-100" : "pl-0 hover:bg-gray-50"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className={cn("truncate", isIndented ? "text-sm text-gray-700" : "text-sm font-medium text-gray-900")}>
          {service.display_name || service.name}
        </p>
        {meta && (
          <p className="text-xs text-gray-500 mt-0.5">{meta}</p>
        )}
      </div>
      <div className="flex flex-col items-end flex-shrink-0 gap-0.5 text-right">
        {service.price != null && (
          <span className="text-sm font-semibold text-gray-900">
            {formatMoney(service.price)}
          </span>
        )}
        {service.duration_minutes != null && (
          <span className="text-xs text-gray-500">
            {service.duration_minutes} min
          </span>
        )}
      </div>
    </button>
  );
}

export default ServiceItem;

