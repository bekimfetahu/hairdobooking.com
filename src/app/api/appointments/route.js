/**
 * Appointments Proxy Handler (/api/appointments)
 *
 * Purpose: Keep appointment-related backend URLs server-side so the
 * frontend never sends arbitrary Laravel endpoint paths. This proxy
 * uses centralized services `laravelApi` (user) and `laravelApp` (app)
 * to forward requests to Laravel.
 */
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';
import laravelApi from '@/services/laravelApi';

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body;

    if (contentType.includes('multipart/form-data')) {
      // Basic support: accept form fields `slug` and other form values
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
    } else {
      body = await req.json();
    }

    const slug = body?.slug;
    const payload = body?.data || {};
    const method = (body?.method || 'post').toLowerCase();
    const explicitAccess = body?.access_type; // optional override

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ message: 'Salon slug is required' }, { status: 422 });
    }

    const token = req.cookies.get('token')?.value;
    const accessType = explicitAccess || (token ? 'laravelApi' : 'laravelApp');
    const service = accessType === 'laravelApp' ? laravelApp : laravelApi;

    const clientIp = getClientIp(req);
    const config = {
      headers: {
        'X-Forwarded-For': clientIp,
        ...(accessType === 'laravelApi' && token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const url = `client/salons/${slug}/appointments`;
    let response;

    if (method === 'get') {
      response = await service.get(url, { params: payload, ...config });
    } else if (method === 'delete') {
      response = await service.delete(url, { data: payload, ...config });
    } else {
      response = await service[method](url, payload, config);
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('appointments proxy error', error);
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Unexpected error occurred.' };
    return NextResponse.json(data, { status });
  }
}

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;
    const service = token ? laravelApi : laravelApp;
    const config = {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    if (!token) {
      return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
    }

    // forward query params (page, scope, etc.) to backend
    const url = `appointments`;
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const response = await laravelApi.get(`/${url}`, { params, headers: { Authorization: `Bearer ${token}` } });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('appointments proxy GET error', error?.response || error);
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Unexpected error occurred.' };
    return NextResponse.json(data, { status });
  }
}

function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}
