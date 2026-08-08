/**
 * API Route: /api/preview/validate
 * 
 * Validates a marketplace preview token on behalf of a user.
 * Tokens are encrypted and signed, valid for 10 minutes.
 * 
 * Request:
 *   - POST /api/preview/validate
 *   - Body: { token: string }
 * 
 * Response on success:
 *   {
 *     success: true,
 *     data: {
 *       venue: { uuid, name, slug, ... },
 *       is_marketplace_approved: boolean,
 *       preview_expires_at: timestamp
 *     }
 *   }
 * 
 * Response on failure:
 *   - 400: Invalid or expired token
 *   - 500: Server error
 */

import laravelApp from '@/services/laravelApp';

export async function POST(request) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return Response.json(
                { error: 'Token is required' },
                { status: 400 }
            );
        }

        // Forward validation to Laravel backend
        const response = await laravelApp.post('/client/marketplace-preview/validate', {
            token,
        });

        return Response.json(response.data);
    } catch (error) {
        console.error('Preview validation error:', error);
        
        if (error.response?.status === 400) {
            return Response.json(
                { error: 'Invalid or expired preview token' },
                { status: 400 }
            );
        }

        return Response.json(
            { error: 'Failed to validate preview token' },
            { status: 500 }
        );
    }
}
