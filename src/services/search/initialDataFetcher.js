/**
 * Initial Data Fetcher for SSR
 * Fetches venues and services for a given location on the server side
 * Uses laravelApp service for app-to-app authentication (X-App-Token)
 */

import laravelApp from '@/services/laravelApp';
import { transformVenueToSalon, transformServiceToResult } from '@/services/search/searchService';

// Central London coordinates
const LONDON_COORDS = {
  lat: 51.5074,
  lon: -0.1278,
  address: 'London, UK',
  country: 'UK',
};

export async function fetchInitialData(distance = '50mi') {
  try {
    console.log('[InitialDataFetcher] Fetching venues and featured services for London...');
    console.log('[InitialDataFetcher] Using app-to-app authentication (X-App-Token)');

    // Fetch venues and featured services in parallel using laravelApp service
    // laravelApp automatically includes X-App-Token header
    const [venuesResponse, featuredServicesResponse] = await Promise.all([
      laravelApp.get('/client/search/venues', {
        params: {
            q: '',
            lat: LONDON_COORDS.lat,
            lon: LONDON_COORDS.lon,
            distance,
            perPage: 4,
            page: 1,
        },
      }),
      laravelApp.get('/client/search/featured-services', {
        params: {
          lat: LONDON_COORDS.lat,
          lon: LONDON_COORDS.lon,
          distance,
        },
      }),
    ]);

    const rawVenues = venuesResponse.data?.data || [];
    const rawServices = featuredServicesResponse.data?.data || [];

    // Transform API response to component format
    const venues = rawVenues.map(transformVenueToSalon);
    const services = rawServices.map(transformServiceToResult);

    console.log('[InitialDataFetcher] Successfully fetched and transformed:', venues.length, 'venues and', services.length, 'services');

    return {
      initialLocation: LONDON_COORDS,
      initialVenues: venues,
      initialServices: services,
    };
  } catch (error) {
    console.error('[InitialDataFetcher] Error fetching initial data:');
    console.error('[InitialDataFetcher] Message:', error.message);
    if (error.response) {
      console.error('[InitialDataFetcher] Status:', error.response.status);
      console.error('[InitialDataFetcher] Status Text:', error.response.statusText);
      console.error('[InitialDataFetcher] Data:', error.response.data);
    }
    
    // Return fallback data instead of throwing
    console.log('[InitialDataFetcher] Returning fallback data (location only)');
    return {
      initialLocation: LONDON_COORDS,
      initialVenues: [],
      initialServices: [],
    };
  }
}

/**
 * Fetch latest salons added to the marketplace
 * Used for the "New to Hairdobooking" page
 * 
 * @param {number} perPage - Number of results per page (default 12)
 * @param {number} page - Page number (default 1)
 * @returns {Promise<Array>} Array of venue/salon objects
 */
export async function fetchNewSalons(perPage = 12, page = 1) {
  try {
    console.log('[InitialDataFetcher] Fetching new salons...');

    const response = await laravelApp.get('/client/new-salons', {
      params: {
        perPage,
        page,
      },
    });

    const rawVenues = response.data?.data || [];
    const venues = rawVenues.map(transformVenueToSalon);

    console.log('[InitialDataFetcher] Successfully fetched new salons:', venues.length);

    return {
      venues,
      meta: response.data?.meta || { total: 0, current_page: 1, last_page: 1 },
    };
  } catch (error) {
    // QA/prod can temporarily run frontend ahead of backend route rollout.
    // Treat 404 as a soft failure and return empty data without noisy error logs.
    if (error?.response?.status === 404) {
      console.warn('[InitialDataFetcher] New salons endpoint not available (404). Returning empty data.');
      return {
        venues: [],
        meta: { total: 0, current_page: 1, last_page: 1 },
      };
    }

    console.error('[InitialDataFetcher] Error fetching new salons:');
    console.error('[InitialDataFetcher] Message:', error.message);
    if (error.response) {
      console.error('[InitialDataFetcher] Status:', error.response.status);
      console.error('[InitialDataFetcher] Data:', error.response.data);
    }

    // Return fallback data
    return {
      venues: [],
      meta: { total: 0, current_page: 1, last_page: 1 },
    };
  }
}
