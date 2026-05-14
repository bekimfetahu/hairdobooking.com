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

/**
 * Fetch featured services (curated list of 8 services)
 * Supports optional location-based distance filtering
 * 
 * BACKEND: Laravel /api/client/search/featured-services
 * Chain: Browser → /api/search/featured-services → Laravel → Elasticsearch
 * 
 * Query Parameters:
 * - lat (float): Latitude for distance-based filtering
 * - lon (float): Longitude for distance-based filtering
 * - distance (string): Distance radius like "10km", "30km"
 */
export async function searchFeaturedServices({ lat, lon, distance } = {}) {
  try {
    const params = new URLSearchParams();

    if (lat) params.append('lat', lat);
    if (lon) params.append('lon', lon);
    if (distance && lat && lon) params.append('distance', distance);

    const url = `/api/search/featured-services${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      } catch (e) {
        const text = await response.text();
        errorMessage = text ? text : `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

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

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      } catch (e) {
        const text = await response.text();
        errorMessage = text ? text : `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Search for services globally with optional location filtering
 * 
 * BACKEND: Elasticsearch (via Laravel ServiceSearchController)
 * Chain: Browser → /api/search/services → Laravel /api/client/search/services → ES services_search index
 * Results are grouped by name server-side (one result per canonical service name).
 * 
 * Filters:
 * - q: Service name text search
 * - category: Comma-separated numeric category IDs (OR logic)
 * - audience: Comma-separated numeric audience IDs
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

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      } catch (e) {
        const text = await response.text();
        errorMessage = text ? text : `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
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
 * Transform service search result to service card format.
 * Backend groups services by name but includes UUID for canonical matching.
 * When multiple categories exist (e.g., "Hair Cut" in Hair + Barbering),
 * uuid is the primary service UUID and uuids is an array of all variants.
 */
export function transformServiceToResult(service) {
  // Support both formats: array (categories) or single string (category, category_name)
  let categories = [];
  if (Array.isArray(service.categories)) {
    categories = service.categories;
  } else if (service.category) {
    categories = [service.category];
  } else if (service.category_name) {
    categories = [service.category_name];
  }

  return {
    name: service.name,
    display_name: service.name,
    uuid: service.uuid, // Primary global_service_uuid for filtering venues
    uuids: service.uuids || [service.uuid], // All variant UUIDs if service has multiple categories
    categories,
    category: categories[0] || null, // first for single-category compat
    audiences: Array.isArray(service.audiences) ? service.audiences : [],
    price: service.price ?? service.price_min ?? service.price_avg ?? null,
    duration: service.duration_minutes ?? service.duration_avg ?? service.duration ?? null,
    venueCount: service.venue_count || service.venueCount || 0,
  };
}
