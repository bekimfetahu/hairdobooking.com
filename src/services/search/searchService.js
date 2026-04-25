/**
 * Search Service
 * Calls the Next.js proxy to Elasticsearch venue search
 * Pattern: Browser → /api/search/venues → Laravel /api/client/search/venues → Elasticsearch
 */

export async function searchVenues({ q, lat, lon, distance = '10km', perPage = 10, page = 1, category, audience }) {
  try {
    const params = new URLSearchParams();

    if (q) params.append('q', q);
    if (lat) params.append('lat', lat);
    if (lon) params.append('lon', lon);
    if (distance && lat && lon) params.append('distance', distance);
    if (category) params.append('category', category);
    if (audience) params.append('audience', audience);
    params.append('perPage', perPage);
    params.append('page', page);

    const url = `/api/search/venues?${params}`;
    console.log('[SearchService] Calling:', url);

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
    console.log('[SearchService] Calling services:', url);

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
    services: venue.services?.map(s => s.name) || [],
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
    name: service.name,
    category: service.category,
    price: service.price,
    duration: service.duration_minutes,
    venueCount: service.venue_count || 0,
  };
}
