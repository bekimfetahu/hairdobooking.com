'use client';

import React from 'react';
import { Filter } from 'lucide-react';

/**
 * FilterButton
 * 
 * Button to open filter panel
 * Shows badge with count of active filters
 */
export function FilterButton({ activeFilterCount = 0, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      aria-label="Open filters"
    >
      <Filter size={18} className="text-gray-600" />
      <span className="text-gray-700 font-medium">Filters</span>

      {activeFilterCount > 0 && (
        <span className="absolute top-0 right-0 -mt-2 -mr-2 inline-flex items-center justify-center h-5 w-5 bg-blue-600 text-white text-xs font-bold rounded-full">
          {activeFilterCount > 9 ? '9+' : activeFilterCount}
        </span>
      )}
    </button>
  );
}
