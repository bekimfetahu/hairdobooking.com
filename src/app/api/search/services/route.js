/**
 * Service Search Proxy (/api/search/services)
 * Proxies service search requests to Laravel backend.
 * Routes to: GET /api/client/search/services (Elasticsearch, grouped by name)
 */
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';

export async function GET(req) {
  try {
    // Extract search parameters from query string
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const audience = searchParams.get('audience');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const distance = searchParams.get('distance');
    const perPage = searchParams.get('perPage') || 10;
    const page = searchParams.get('page') || 1;

    // Build query parameters for Laravel
    const params = {};
    if (q) params.q = q;
    if (category) params.category = category;
    if (audience) params.audience = audience;
    if (lat) params.lat = lat;
    if (lon) params.lon = lon;
    if (distance && lat && lon) params.distance = distance;
    params.perPage = Math.min(perPage, 100); // Cap at 100 results
    params.page = page;

    // Call Laravel search endpoint with X-App-Token
    const response = await laravelApp.get('client/search/services', { params });

    return NextResponse.json(response.data, {
      status: response.status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {

    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.message || error.response.data?.error || `Laravel returned ${statusCode}`;
      
      return NextResponse.json(
        { 
          error: errorMessage,
          status: statusCode,
        },
        { status: statusCode }
      );
    }

    // Handle request/network errors
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Cannot connect to backend service' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to search services' },
      { status: 500 }
    );
  }
}
