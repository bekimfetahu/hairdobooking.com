"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * VenueSearchResultCardSkeleton
 * Skeleton loader for venue search result cards
 * Matches the structure and styling of VenueSearchResultCard
 */
export default function VenueSearchResultCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 bg-gray-200 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
      </div>

      {/* Content placeholder */}
      <div className="p-4 space-y-3">
        {/* Venue name */}
        <div className="h-5 bg-gray-200 rounded w-3/4" />

        {/* Address line 1 */}
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>

        {/* Services section */}
        <div className="pt-2 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-20" />
            <div className="h-6 bg-gray-200 rounded-full w-24" />
            <div className="h-6 bg-gray-200 rounded-full w-16" />
          </div>
        </div>

        {/* Price and rating footer */}
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-gray-200 rounded w-20" />
          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
