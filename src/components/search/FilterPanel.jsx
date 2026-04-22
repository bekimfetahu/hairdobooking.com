'use client';

import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

/**
 * FilterPanel
 * 
 * Floating filter panel with categories and audiences
 * Displays checkbox filters and shows result counts
 */
export function FilterPanel({
  options = { categories: [], audiences: [] },
  selectedFilters = { categories: [], audiences: [] },
  onFilterChange,
  onClearAll,
  onApply,
  loading = false,
  isOpen = false,
}) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    audiences: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isFilterSelected = (filterType, filterId) => {
    return selectedFilters[filterType]?.includes(filterId) ?? false;
  };

  const hasActiveFilters = 
    (selectedFilters.categories?.length ?? 0) > 0 || 
    (selectedFilters.audiences?.length ?? 0) > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-end sm:items-center justify-center">
      {/* Filter Panel */}
      <div className="bg-white rounded-t-lg sm:rounded-lg shadow-lg w-full sm:w-96 max-h-screen sm:max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={onApply}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Close filters"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading filters...</p>
            </div>
          ) : (
            <>
              {/* Categories Section */}
              {options.categories && options.categories.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleSection('categories')}
                    className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 px-2 py-1 rounded"
                  >
                    <h3 className="font-semibold text-gray-900">Categories</h3>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform ${
                        expandedSections.categories ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {expandedSections.categories && (
                    <div className="space-y-2 ml-2">
                      {options.categories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={isFilterSelected('categories', category.id)}
                            onChange={() => onFilterChange('categories', category.id)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                          />
                          <span className="ml-3 text-gray-700 group-hover:text-gray-900">
                            {category.name}
                          </span>
                          <span className="ml-auto text-xs text-gray-500 group-hover:text-gray-600">
                            {category.count}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Audiences Section */}
              {options.audiences && options.audiences.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleSection('audiences')}
                    className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 px-2 py-1 rounded"
                  >
                    <h3 className="font-semibold text-gray-900">Target Audience</h3>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform ${
                        expandedSections.audiences ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {expandedSections.audiences && (
                    <div className="space-y-2 ml-2">
                      {options.audiences.map((audience) => (
                        <label
                          key={audience.id}
                          className="flex items-center cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={isFilterSelected('audiences', audience.id)}
                            onChange={() => onFilterChange('audiences', audience.id)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                          />
                          <span className="ml-3 text-gray-700 group-hover:text-gray-900">
                            {audience.name}
                          </span>
                          <span className="ml-auto text-xs text-gray-500 group-hover:text-gray-600">
                            {audience.count}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 space-y-3">
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="w-full text-center text-gray-700 font-medium py-2 hover:bg-gray-100 rounded"
            >
              Clear Filters
            </button>
          )}
          <button
            onClick={onApply}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
