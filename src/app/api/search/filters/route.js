/**
 * Search Filters Proxy (/api/search/filters)
 * Proxies filter options requests to Laravel backend.
 * Routes to: /api/client/search/filters
 */
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';

export async function GET(req) {
  try {
    // Call Laravel filter endpoint with X-App-Token
    const response = await laravelApp.get('client/search/filters');

    return NextResponse.json(response.data, {
      status: response.status,
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour like Laravel does
      },
    });
  } catch (error) {
    console.error('[Search Filters Error]', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      laravel_response: error.response?.data,
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch filter options',
        message: error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
