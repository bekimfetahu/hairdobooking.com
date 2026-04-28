'use client';
import { useState, useCallback } from 'react';
import { searchServices, transformServiceToResult } from '@/services/search/searchService';

/**
 * Custom hook for service search
 * 
 * BACKEND: MySQL (via Laravel ServiceSearchController)
 * - Manages search state for service results
 * - Calls Next.js API proxy: /api/search/services
 * - Proxy forwards to: GET /api/client/search/services (Laravel)
 * - Supports: category/audience filtering, location-based Haversine filtering
 * 
 * COMPARISON:
 * - Services: MySQL (this hook)
 * - Venues: Elasticsearch (useVenueSearch hook)
 * 
 * Can accept initial data from SSR (initialData parameter)
 */
export function useServiceSearch(initialData = []) {
  const [results, setResults] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async ({ q, category, audience, lat, lon, distance, perPage = 10, page = 1 }) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useServiceSearch] Starting MYSQL search:', { q, category, audience, lat, lon, distance, perPage, page });

      // MYSQL: Call Next.js search proxy → Laravel ServiceSearchController
      const response = await searchServices({ q, category, audience, lat, lon, distance, perPage, page });

      console.log('[useServiceSearch] Got response:', response);

      // Transform API response to service format
      const services = response.data.map(transformServiceToResult);
      setResults(services);

      console.log('[useServiceSearch] Transformed to services:', services.length);
      return services;
    } catch (err) {
      console.error('[useServiceSearch] Error caught:', {
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
