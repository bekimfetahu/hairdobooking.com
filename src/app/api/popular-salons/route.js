import laravelApp from '@/services/laravelApp';

/**
 * GET /api/popular-salons
 *
 * Proxy endpoint for fetching the most liked salons on the marketplace.
 * Routes to Laravel backend: GET /api/client/popular-salons
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const perPage = searchParams.get('perPage') || 12;
    const page = searchParams.get('page') || 1;

    const response = await laravelApp.get('/client/popular-salons', {
      params: {
        perPage,
        page,
      },
    });

    return Response.json(response.data);
  } catch (error) {
    const upstreamStatus = error?.response?.status;
    const upstreamData = error?.response?.data;

    if (upstreamStatus === 404 || upstreamStatus === 401 || upstreamStatus === 403) {
      console.warn('[api/popular-salons] Upstream unavailable:', upstreamStatus);
      return Response.json({
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: Number(perPage) || 12,
          total: 0,
        },
      });
    }

    console.error('Error fetching popular salons:', error.message);
    console.error('Error details:', upstreamData || error);
    return Response.json(
      { error: 'Failed to fetch popular salons', details: error.message },
      { status: 500 }
    );
  }
}
