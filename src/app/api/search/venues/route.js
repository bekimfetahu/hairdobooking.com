/**
 * Venue Search Proxy (/api/search/venues)
 * Proxies Elasticsearch search requests to Laravel backend.
 * Routes to: /api/client/search/venues
 */
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';

export async function GET(req) {
  try {
    // Extract search parameters from query string
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const distance = searchParams.get('distance') || '10km';
    const service = searchParams.get('service');
    const category = searchParams.get('category');
    const audience = searchParams.get('audience');
    const professional = searchParams.get('professional');
    const perPage = searchParams.get('perPage') || 10;
    const page = searchParams.get('page') || 1;

    // Build query parameters for Laravel
    const params = {};
    if (q) params.q = q;
    if (lat) params.lat = lat;
    if (lon) params.lon = lon;
    if (distance && lat && lon) params.distance = distance;
    if (service) params.service = service;
    if (category) params.category = category;
    if (audience) params.audience = audience;
    if (professional) params.professional = professional;
    params.perPage = Math.min(perPage, 100); // Cap at 100 results
    params.page = page;

    // Call Laravel search endpoint with X-App-Token
    const response = await laravelApp.get('client/search/venues', { params });

    return NextResponse.json(response.data, {
      status: response.status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    // Detailed error logging for debugging
    console.error('[Search Venues Error]', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      laravel_response: error.response?.data,
      request_url: error.config?.url,
      request_params: error.config?.params,
      query_params_obj: { q, lat, lon, distance, service, category, audience, professional, perPage, page },
      error_code: error.code,
      full_error: error.toString(),
    });

    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.message || error.response.data?.error || `Laravel returned ${statusCode}`;
      
      return NextResponse.json(
        { 
          error: errorMessage,
          status: statusCode,
          details: process.env.NODE_ENV === 'development' ? error.response.data : undefined,
          debug: process.env.NODE_ENV === 'development' ? { service, requested_params: { q, lat, lon, distance, service, category, audience, professional } } : undefined,
        },
        { status: statusCode }
      );
    }

    // Handle request/network errors
    if (error.code === 'ECONNREFUSED') {
      console.error('[Connection Error] Cannot reach Laravel backend');
      return NextResponse.json(
        { error: 'Cannot connect to backend service' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to search venues' },
      { status: 500 }
    );
  }
}
