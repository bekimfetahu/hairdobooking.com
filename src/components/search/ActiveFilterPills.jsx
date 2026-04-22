'use client';

import React from 'react';
import { X } from 'lucide-react';

/**
 * ActiveFilterPills
 * 
 * Display active filters as removable pills/badges
 */
export function ActiveFilterPills({ selectedFilters = {}, options = {}, onRemoveFilter }) {
  const allActivePills = [];

  // Add category pills
  if (selectedFilters.categories && selectedFilters.categories.length > 0) {
    selectedFilters.categories.forEach((catId) => {
      const category = options.categories?.find((c) => c.id === catId);
      if (category) {
        allActivePills.push({
          id: `cat_${catId}`,
          type: 'categories',
          value: catId,
          label: category.name,
        });
      }
    });
  }

  // Add audience pills
  if (selectedFilters.audiences && selectedFilters.audiences.length > 0) {
    selectedFilters.audiences.forEach((audId) => {
      const audience = options.audiences?.find((a) => a.id === audId);
      if (audience) {
        allActivePills.push({
          id: `aud_${audId}`,
          type: 'audiences',
          value: audId,
          label: audience.name,
        });
      }
    });
  }

  if (allActivePills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {allActivePills.map((pill) => (
        <div
          key={pill.id}
          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
        >
          <span>{pill.label}</span>
          <button
            onClick={() => onRemoveFilter(pill.type, pill.value)}
            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
            aria-label={`Remove ${pill.label} filter`}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
