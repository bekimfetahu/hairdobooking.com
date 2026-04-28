/**
 * Search Service - DUAL BACKEND ARCHITECTURE
 * 
 * This service handles two separate search backends:
 * 
 * 1. ELASTICSEARCH VENUES (searchVenues)
 *    Chain: Browser → /api/search/venues → Laravel /api/client/search/venues → Elasticsearch
 *    Model: VenueSearch (Elasticsearch)
 *    Index: {prefix}venues (e.g., dev_venues, qa_venues, prod_venues)
 *    Features: Geo-distance, full-text, fast distributed search
 * 
 * 2. MYSQL SERVICES (searchServices)
 *    Chain: Browser → /api/search/services → Laravel /api/client/search/services → MySQL
 *    Model: GlobalService (MySQL)
 *    Tables: global_services, services, categories, audiences, venues, addresses
 *    Features: Real-time, relational filtering, Haversine distance in SQL
 * 
 * Both backends support:
 * - Keyword search (q parameter)
 * - Category filtering (comma-separated numeric IDs)
 * - Audience filtering (comma-separated numeric IDs)
 * - Location-based filtering (lat, lon, distance)
 * 
 * Choose your backend based on data characteristics:
 * - Use Elasticsearch for high-volume, fast-changing venue data
 * - Use MySQL for smaller datasets with complex relational queries
 */

export async function searchVenues({ q, lat, lon, distance = '10km', perPage = 10, page = 1, category, audience, service, professional }) {
  try {
    const params = new URLSearchParams();

    if (q) params.append('q', q);
    if (lat) params.append('lat', lat);
    if (lon) params.append('lon', lon);
    if (distance && lat && lon) params.append('distance', distance);
    if (category) params.append('category', category);
    if (audience) params.append('audience', audience);
    if (service) params.append('service', service);
    if (professional) params.append('professional', professional);
    params.append('perPage', perPage);
    params.append('page', page);

    const url = `/api/search/venues?${params}`;
    console.log('[SearchService] ELASTICSEARCH Venue Search:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[SearchService] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      
      console.error('[SearchService] Error details:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        message: errorMessage,
      });
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[SearchService] Success:', data.data?.length || 0, 'venues found');
    
    // Debug: Log full venue response
    if (data.data?.length > 0) {
      console.log('[SearchService] First venue full data:', data.data[0]);
      console.log('[SearchService] Location data:', {
        address: data.data[0]?.address,
        location: data.data[0]?.address?.location,
      });
    }
    
    return data;
  } catch (error) {
    console.error('[SearchService] Caught error:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Search for services globally with optional location filtering
 * 
 * BACKEND: MySQL (via Laravel ServiceSearchController)
 * Chain: Browser → /api/search/services → Laravel /api/client/search/services → MySQL
 * 
 * Filters:
 * - q: Service name text search
 * - category: Comma-separated numeric category IDs (OR logic)
 * - audience: Comma-separated numeric audience IDs
 * - lat/lon/distance: Haversine-based location filtering in SQL
 */
export async function searchServices({ q, category, audience, lat, lon, distance, perPage = 10, page = 1 }) {
  try {
    const params = new URLSearchParams();

    if (q) params.append('q', q);
    if (category) params.append('category', category);
    if (audience) params.append('audience', audience);
    if (lat) params.append('lat', lat);
    if (lon) params.append('lon', lon);
    if (distance && lat && lon) params.append('distance', distance);
    params.append('perPage', perPage);
    params.append('page', page);

    const url = `/api/search/services?${params}`;
    console.log('[SearchService] MYSQL Service Search:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[SearchService] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      
      console.error('[SearchService] Error details:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        message: errorMessage,
      });
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[SearchService] Success:', data.data?.length || 0, 'services found');
    return data;
  } catch (error) {
    console.error('[SearchService] Caught error:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Transform Elasticsearch venue document to salon card format
 */
export function transformVenueToSalon(venue) {
  return {
    id: venue.venue.uuid,
    name: venue.venue.name,
    slug: venue.venue.slug,
    address: venue.address.formatted,
    image: venue.primary_image?.url || null,
    services: venue.services?.map(s => s.display_name || s.name) || [],
    location: venue.address.location,
    uuid: venue.venue.uuid,
  };
}

/**
 * Transform service search result to service card format
 */
export function transformServiceToResult(service) {
  return {
    id: service.uuid,
    uuid: service.uuid,
    name: service.display_name || service.name || service.service_name,
    category: service.category?.name || service.category_name || service.category,
    audience: service.audience || service.audience_name || null,
    audiences: Array.isArray(service.audiences) ? service.audiences : [],
    price: service.price ?? service.price_avg ?? null,
    duration: service.duration_minutes ?? service.duration_avg ?? service.duration ?? null,
    venueCount: service.venue_count || service.venueCount || 0,
  };
}
