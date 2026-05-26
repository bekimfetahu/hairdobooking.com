import laravelApp from '@/services/laravelApp';

/**
 * GET /api/new-salons
 * 
 * Proxy endpoint for fetching latest venues/salons added to the marketplace.
 * Routes to Laravel backend: GET /api/client/new-salons
 * 
 * Query parameters:
 * - perPage: Number of results (default 12, max 50)
 * - page: Page number (default 1)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const perPage = searchParams.get('perPage') || 12;
    const page = searchParams.get('page') || 1;

    const response = await laravelApp.get('/client/new-salons', {
      params: {
        perPage,
        page,
      },
    });

    return Response.json(response.data);
  } catch (error) {
    const upstreamStatus = error?.response?.status;
    const upstreamData = error?.response?.data;

    // QA/production can temporarily run with backend routes not yet deployed.
    // Return an empty successful payload instead of a 500 for known recoverable cases.
    if (upstreamStatus === 404 || upstreamStatus === 401 || upstreamStatus === 403) {
      console.warn('[api/new-salons] Upstream unavailable for new salons:', upstreamStatus);
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

    console.error('Error fetching new salons:', error.message);
    console.error('Error details:', upstreamData || error);
    return Response.json(
      { 
        error: 'Failed to fetch new salons',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
