'use client';
import { useState, useCallback } from 'react';
import { searchServices, transformServiceToResult } from '@/services/search/searchService';

/**
 * Custom hook for service search
 * Manages search state and calls the search service proxy
 * Can accept initial data from SSR
 */
export function useServiceSearch(initialData = []) {
  const [results, setResults] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async ({ q, category, audience, lat, lon, distance, perPage = 10, page = 1 }) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useServiceSearch] Starting search:', { q, category, audience, lat, lon, distance, perPage, page });

      // Call the Next.js search proxy
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
