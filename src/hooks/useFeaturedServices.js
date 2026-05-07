'use client';
import { useState, useCallback } from 'react';
import { searchFeaturedServices, transformServiceToResult } from '@/services/search/searchService';

/**
 * Custom hook for featured services
 * 
 * BACKEND: Laravel /api/client/search/featured-services
 * - Manages state for 8 curated featured services
 * - Supports location-based distance filtering
 * - Can accept initial data from SSR (initialData parameter)
 */
export function useFeaturedServices(initialData = []) {
  const [results, setResults] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async ({ lat, lon, distance } = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Call Next.js search proxy → Laravel featured services endpoint
      const response = await searchFeaturedServices({ lat, lon, distance });

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
