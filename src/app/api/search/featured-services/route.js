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
 * - distance (string): Distance radius like "10km", "30km"
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const distance = searchParams.get('distance');

    // Build query params for Laravel
    const laravelParams = new URLSearchParams();
    if (lat) laravelParams.append('lat', lat);
    if (lon) laravelParams.append('lon', lon);
    if (distance) laravelParams.append('distance', distance);

    const laravelBaseUrl = process.env.LARAVEL_INTERNAL_URL || process.env.NEXT_PUBLIC_LARAVEL_URL;
    const url = `${laravelBaseUrl}/api/client/search/featured-services?${laravelParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Token': process.env.CLIENT_ACCESS_TOKEN,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: await response.text() };
      }
      
      return new Response(
        JSON.stringify({
          error: errorData.message || errorData.error || 'Featured services endpoint error',
          details: errorData,
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Featured Services API] Exception:', error.message);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch featured services',
        message: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
