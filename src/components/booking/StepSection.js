"use client";

import React from "react";

/**
 * Generic booking step section card with shared styling.
 *
 * Props:
 * - stepNumber: number | string
 * - title: string
 * - headerSummary?: React.ReactNode (small text under title, e.g. selection summary)
 * - headerRight?: React.ReactNode (e.g. "Change" chip or toggle)
 * - isOpen: boolean (controls visibility of children/body)
 * - children: React.ReactNode (content shown when open)
 */
export default function StepSection({
  stepNumber,
  title,
  headerSummary = null,
  headerRight = null,
  isOpen,
  children,
}) {
  return (
    <div className="rounded-md border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {title ? <p className="text-sm font-semibold text-neutral-950">{title}</p> : null}
          {headerSummary && <div className="mt-1 text-[11px] text-neutral-600">{headerSummary}</div>}
        </div>
        {headerRight}
      </div>

      {isOpen && children && <div className="mt-3">{children}</div>}
    </div>
  );
}
