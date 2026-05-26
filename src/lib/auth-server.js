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

    if (!token) {
      return null;
    }

    try {
      const response = await laravelApi.get('/client/user', {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });

      return response.data || null;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Auth] Failed to fetch user from Laravel API:', error.message);
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
