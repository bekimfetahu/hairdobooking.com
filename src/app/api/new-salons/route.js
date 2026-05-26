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
    console.error('Error fetching new salons:', error.message);
    console.error('Error details:', error.response?.data || error);
    return Response.json(
      { 
        error: 'Failed to fetch new salons',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
