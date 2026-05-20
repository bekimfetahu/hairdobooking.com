"use client";

import React from "react";
import VenueSearchResultCard from "@/components/search/VenueSearchResultCard";
import { cn } from "@/lib/utils";

/**
 * VenueSearchResultsList Component
 * Displays venues in either grid or list layout while preserving ranking order
 * - Grid mode: 2-column grid when map is hidden (full width available)
 * - List mode: Single column when map is shown (limited width)
 */
function VenueSearchResultsList({
  venues = [],
  activeServiceName = "",
  hideServices = false,
  selectedFilters = {},
  filterOptions = {},
  selectedLocation = null,
  showMap = false,
  loading = false,
  hasMore = false,
  isLoadingMore = false,
  expandedOpeningHours = new Set(),
  toggleOpeningHours = () => {},
  expandedGroups = new Set(),
  toggleGroup = () => {},
  handleServiceClick = () => {},
  loadMoreRef = null,
}) {
  // Get matched services for filtering
  const getMatchedServices = (venue, serviceName) => {
    const all = venue?.services || [];
    if (serviceName) {
      const lower = serviceName.toLowerCase();
      return all.filter((s) => (s.name || "").toLowerCase() === lower);
    }
    return all;
  };

  if (venues.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        {activeServiceName ? (
          <>
            No venues found offering &quot;{activeServiceName}&quot;
            {(selectedFilters.categories?.length || 0) > 0 || (selectedFilters.audiences?.length || 0) > 0
              ? " with the selected filters"
              : ""}
            .
          </>
        ) : (
          <>Select a service to see results</>
        )}
      </div>
    );
  }

  return (
    <div className={cn("transition-opacity duration-200", loading && "opacity-50 pointer-events-none")}>
      {/* Loading indicator when refreshing results */}
      {loading && venues.length > 0 && (
        <div className="flex items-center gap-2 py-2">
          <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-700">Searching for new results...</span>
        </div>
      )}

      {/* Grid Layout - 2 columns on desktop when map is hidden */}
      <div className={cn("hidden", showMap ? "md:block space-y-4" : "md:grid md:grid-cols-2 gap-4") }>
        {venues.map((venue, vi) => (
          <VenueSearchResultCard
            key={venue.venue?.uuid || vi}
            venue={venue}
            index={vi}
            activeServiceName={activeServiceName}
            hideServices={hideServices}
            selectedFilters={selectedFilters}
            filterOptions={filterOptions}
            selectedLocation={selectedLocation}
            expandedOpeningHours={expandedOpeningHours}
            toggleOpeningHours={toggleOpeningHours}
            expandedGroups={expandedGroups}
            toggleGroup={toggleGroup}
            handleServiceClick={handleServiceClick}
          />
        ))}
      </div>

      {/* List Layout - Single column on mobile and when map is shown */}
      <div className="md:hidden space-y-4">
        {venues.map((venue, vi) => (
          <VenueSearchResultCard
            key={venue.venue?.uuid || vi}
            venue={venue}
            index={vi}
            activeServiceName={activeServiceName}
            hideServices={hideServices}
            selectedFilters={selectedFilters}
            selectedLocation={selectedLocation}
            expandedOpeningHours={expandedOpeningHours}
            toggleOpeningHours={toggleOpeningHours}
            expandedGroups={expandedGroups}
            toggleGroup={toggleGroup}
            handleServiceClick={handleServiceClick}
          />
        ))}
      </div>

      {/* Load More Section */}
      {hasMore && !loading && venues.length > 0 && (
        <div ref={loadMoreRef} className="py-6 text-center">
          {isLoadingMore && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading more venues...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VenueSearchResultsList;

