import { useState, useEffect, useCallback } from 'react';
import { filterService } from '@/services/search/filterService';

/**
 * useSearchFilters
 * 
 * Manages search filter state and operations
 * Fetches available options and maintains filter selections
 */
export function useSearchFilters() {
  // Filter options from backend
  const [options, setOptions] = useState({
    categories: [],
    audiences: [],
  });

  // Active filter selections
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    audiences: [],
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available filter options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const data = await filterService.getFilterOptions();
        setOptions(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching filter options:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  /**
   * Toggle a filter checkbox
   */
  const toggleFilter = useCallback((filterType, filterId) => {
    setSelectedFilters((prev) => {
      const current = prev[filterType] || [];
      const updated = current.includes(filterId)
        ? current.filter((id) => id !== filterId)
        : [...current, filterId];

      return {
        ...prev,
        [filterType]: updated,
      };
    });
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setSelectedFilters({
      categories: [],
      audiences: [],
    });
  }, []);

  /**
   * Get query string for API call
   */
  const getFilterQueryParams = useCallback(() => {
    const params = {};

    if (selectedFilters.categories.length > 0) {
      params.category = selectedFilters.categories.join(',');
    }

    if (selectedFilters.audiences.length > 0) {
      params.audience = selectedFilters.audiences.join(',');
    }

    return params;
  }, [selectedFilters]);

  /**
   * Check if any filters are applied
   */
  const hasActiveFilters = useCallback(
    () => selectedFilters.categories.length > 0 || selectedFilters.audiences.length > 0,
    [selectedFilters]
  );

  return {
    options,
    selectedFilters,
    loading,
    error,
    toggleFilter,
    clearFilters,
    getFilterQueryParams,
    hasActiveFilters,
  };
}
