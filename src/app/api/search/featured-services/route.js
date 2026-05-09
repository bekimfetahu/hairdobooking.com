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

    console.log('[Featured Services API] Fetching from Laravel:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Token': process.env.CLIENT_ACCESS_TOKEN,
        'Accept': 'application/json',
      },
    });

    console.log('[Featured Services API] Laravel response status:', response.status);

    if (!response.ok) {
      let errorData;
      let errorText = '';
      try {
        errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await response.text();
        errorData = { message: errorText };
      }
      
      console.error('[Featured Services API] Laravel error:', response.status, errorText);

      return new Response(
        JSON.stringify({
          error: errorData.message || errorData.error || 'Featured services endpoint error',
          details: errorData,
          status: response.status,
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('[Featured Services API] Success:', data?.data?.length ?? 0, 'services');

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Featured Services API] Exception:', error.message, error.stack);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch featured services',
        message: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
