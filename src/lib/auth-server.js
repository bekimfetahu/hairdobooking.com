/**
 * Server-side authentication utilities for Next.js
 * Use this in server components and server actions to access user data
 */

import { cookies } from 'next/headers';
import laravelApi from '@/services/laravelApi';

function isExpectedDynamicUsageError(error) {
  const message = error?.message || '';
  return message.includes('Dynamic server usage');
}

/**
 * Fetch the current authenticated user from the server
 * This reads the token from cookies and fetches user data from Laravel API
 * @returns {Promise<Object|null>} User object or null if not authenticated
 */
export async function getCurrentUserServer() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    // If a `token` cookie exists, use it as a Bearer token (legacy JWT flow).
    if (token) {
      try {
        const response = await laravelApi.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        });

        return response.data || null;
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[Auth] Failed to fetch user from Laravel API (bearer):', error.message);
        }
        // fallthrough to try session cookie forwarding
      }
    }

    // Fallback: forward all incoming cookies to the Laravel app so session-based
    // auth (Sanctum/session) can authenticate the server-side request.
    try {
      const allCookies = cookieStore.getAll() || [];
      if (process.env.NODE_ENV !== 'production') {
        const names = allCookies.map(c => c.name).join(', ');
        console.debug('[Auth] No bearer token; attempting cookie-forward. Cookies present:', names);
      }

      // Build Cookie header string
      const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

      if (!cookieHeader) {
        return null;
      }

      const response = await laravelApi.get('/auth/me', {
        headers: {
          Cookie: cookieHeader,
        },
      });

      return response.data || null;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Auth] Failed to fetch user from Laravel API (cookie-forward):', error?.message || error);
      }
      return null;
    }
  } catch (error) {
    if (!isExpectedDynamicUsageError(error) && process.env.NODE_ENV !== 'production') {
      console.debug('[Auth] Error in getCurrentUserServer:', error.message);
    }
    return null;
  }
}

/**
 * Check if a user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isUserAuthenticatedServer() {
  const user = await getCurrentUserServer();
  return user !== null;
}
