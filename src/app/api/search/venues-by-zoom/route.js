/**
 * Venue Search by Map Bounds (/api/search/venues-by-zoom)
 * Simple pass-through proxy to Laravel /api/client/search/venues-map
 * Returns ALL venues in area: uuid, name, slug, lat, lon + total count
 */
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Forward all parameters to Laravel
    const params = {};
    
    if (searchParams.has('lat')) params.lat = parseFloat(searchParams.get('lat'));
    if (searchParams.has('lon')) params.lon = parseFloat(searchParams.get('lon'));
    if (searchParams.has('neLat')) params.neLat = parseFloat(searchParams.get('neLat'));
    if (searchParams.has('neLon')) params.neLon = parseFloat(searchParams.get('neLon'));
    if (searchParams.has('swLat')) params.swLat = parseFloat(searchParams.get('swLat'));
    if (searchParams.has('swLon')) params.swLon = parseFloat(searchParams.get('swLon'));
    if (searchParams.has('distance')) params.distance = searchParams.get('distance');

    if (!params.lat || !params.lon) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lon' },
        { status: 400 }
      );
    }

    // Call Laravel lightweight map search endpoint
    const response = await laravelApp.get('client/search/venues-map', { params });

    return NextResponse.json(response.data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('[venues-by-zoom] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
