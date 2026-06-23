/**
 * Featured Services Proxy - SSR Friendly Route Handler
 * 
 * Proxies to Laravel: GET /api/client/search/featured-services
 * Returns 8 curated services (Hair Cut, Hair Cut & Blow Dry, etc.)
 * with optional location-based distance filtering
 * 
 * Query Parameters:
 * - lat (float): Latitude for distance-based filtering
 * - lon (float): Longitude for distance-based filtering
 * - distance (string): Distance radius like "10mi", "30mi"
 */

import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const distance = searchParams.get('distance');

    // Build query parameters for Laravel
    const params = {};
    if (lat) params.lat = lat;
    if (lon) params.lon = lon;
    if (distance) params.distance = distance;

    // Call Laravel search endpoint with X-App-Token
    const response = await laravelApp.get('client/search/featured-services', { params });

    return NextResponse.json(response.data, {
      status: response.status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    // Detailed error logging for debugging
    console.error('[Featured Services Error]', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      laravel_response: error.response?.data,
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch featured services',
        message: error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
