'use client';
import { useState, useCallback } from 'react';
import { searchVenues, transformVenueToSalon } from '@/services/search/searchService';

/**
 * Custom hook for venue search
 * 
 * BACKEND: Elasticsearch (via Laravel VenueSearchController)
 * - Manages search state for venue results
 * - Calls Next.js API proxy: /api/search/venues
 * - Proxy forwards to: GET /api/client/search/venues (Laravel)
 * - Supports: geo-distance filtering, full-text search
 * 
 * COMPARISON:
 * - Venues: Elasticsearch (this hook)
 * - Services: MySQL (useServiceSearch hook)
 * 
 * Can accept initial data from SSR (initialData parameter)
 */
export function useVenueSearch(initialData = []) {
  const [results, setResults] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async ({ q, lat, lon, distance, perPage = 10, page = 1, category, audience }) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useVenueSearch] Starting ELASTICSEARCH search:', { q, lat, lon, distance, perPage, page, category, audience });

      // ELASTICSEARCH: Call Next.js search proxy → Laravel VenueSearchController
      const response = await searchVenues({ q, lat, lon, distance, perPage, page, category, audience });

      console.log('[useVenueSearch] Got response:', response);

      // Transform API response to salon format
      const salons = response.data.map(transformVenueToSalon);
      setResults(salons);

      console.log('[useVenueSearch] Transformed to salons:', salons.length);
      return salons;
    } catch (err) {
      console.error('[useVenueSearch] Error caught:', {
        message: err.message,
        stack: err.stack,
      });
      setError(err.message);
      setResults([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}
