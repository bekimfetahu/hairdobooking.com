'use client';
import { useState, useCallback } from 'react';
import { searchServices, transformServiceToResult } from '@/services/search/searchService';

/**
 * Custom hook for service search
 * 
 * BACKEND: Elasticsearch (via Laravel ServiceSearchController)
 * - Manages search state for service results grouped by service name
 * - Calls Next.js API proxy: /api/search/services
 * - Proxy forwards to: GET /api/client/search/services (ES services_search index)
 * - Supports: category/audience filtering
 * 
 * COMPARISON:
 * - Services: Elasticsearch, grouped by name (this hook → homepage dropdown)
 * - Venues: Elasticsearch, with geo-distance (useVenueSearch hook)
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

      // MYSQL: Call Next.js search proxy → Laravel ServiceSearchController
      const response = await searchServices({ q, category, audience, lat, lon, distance, perPage, page });

      // Transform API response to service format
      const services = response.data.map(transformServiceToResult);
      setResults(services);

      return services;
    } catch (err) {
      setError(err.message);
      setResults([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}
