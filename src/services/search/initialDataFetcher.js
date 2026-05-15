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

export async function fetchInitialData(distance = '50km') {
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
