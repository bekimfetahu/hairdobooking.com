/**
 * Salon Professionals Proxy (/api/salons/[slug]/professionals)
 */
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';
import laravelApi from '@/services/laravelApi';

export async function POST(req, { params }) {
  try {
    const { slug } = await params;

    const contentType = req.headers.get('content-type') || '';
    let body = {};

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
    } else {
      body = await req.json();
    }

    const payload = body?.data || {};
    const method = (body?.method || 'get').toLowerCase();
    const accessType = body?.access_type || 'laravelApp';

    const token = req.cookies.get('token')?.value;
    const service = accessType === 'laravelApp' ? laravelApp : laravelApi;

    const clientIp = getClientIp(req);
    const config = {
      headers: {
        'X-Forwarded-For': clientIp,
        ...(accessType === 'laravelApi' && token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const url = `client/salons/${slug}/professionals`;

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
    console.error('salon professionals proxy error', error);
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Unexpected error occurred.' };
    return NextResponse.json(data, { status });
  }
}

function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}
