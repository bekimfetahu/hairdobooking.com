/**
 * Saved Salons Proxy (/api/saved-salons/[venueUuid])
 * Forwards save/unsave requests to `client/saved-salons/{venueUuid}`.
 */
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';
import laravelApi from '@/services/laravelApi';

export async function POST(req, { params }) {
  return handleRequest(req, params);
}

async function handleRequest(req, params) {
  try {
    const { venueUuid } = await params;

    const contentType = req.headers.get('content-type') || '';
    let body = {};

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
    } else {
      body = await req.json();
    }

    const method = (body?.method || 'post').toLowerCase();
    const accessType = body?.access_type || 'laravelApi';
    const payload = body?.data || {};

    const token = req.cookies.get('token')?.value;
    const service = accessType === 'laravelApp' ? laravelApp : laravelApi;

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const config = { headers: { 'X-Forwarded-For': clientIp, ...(accessType === 'laravelApi' && token ? { Authorization: `Bearer ${token}` } : {}) } };

    const url = `client/saved-salons/${venueUuid}`;

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
    console.error('saved-salons proxy error', error);
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Unexpected error occurred.' };
    return NextResponse.json(data, { status });
  }
}