import laravelApi from '@/services/laravelApi';

export async function fetchInitialAppointments(token) {
  try {
    // Use server-side token if provided for SSR
    if (token) {
      const res = await laravelApi.get('appointments', { headers: { Authorization: `Bearer ${token}` } });
      return res.data?.data || [];
    }

    // Fallback to unauthenticated empty list
    return [];
  } catch (e) {
    console.error('fetchInitialAppointments error', e);
    return [];
  }
}

export async function fetchAppointments() {
  try {
    const res = await fetch('/api/appointments', { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data || [];
  } catch (e) {
    console.error('fetchAppointments error', e);
    return [];
  }
}