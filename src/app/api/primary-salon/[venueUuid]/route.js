/**
 * Primary Salon Proxy (/api/primary-salon/[venueUuid])
 * Forwards update requests to `client/primary-salon/{venueUuid}`
 */
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';
import laravelApi from '@/services/laravelApi';

export async function POST(req, context) {
  try {
    const { params } = await context;
    const { venueUuid } = await params;
    console.log('[primary-salon proxy POST] incoming params', { params });
    console.log('[primary-salon proxy POST] request url', req.url);

    const contentType = req.headers.get('content-type') || '';
    let body = {};

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
    } else {
      body = await req.json();
    }

    const method = (body?.method || 'put').toLowerCase();
    const accessType = body?.access_type || 'laravelApi';
    const payload = body?.data || {};

    const token = req.cookies.get('token')?.value;
    const service = accessType === 'laravelApp' ? laravelApp : laravelApi;

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const config = { headers: { 'X-Forwarded-For': clientIp, ...(accessType === 'laravelApi' && token ? { Authorization: `Bearer ${token}` } : {}) } };

    // Backend route is registered as PUT /primary-salon/{venue:uuid} (authenticated)
    // Only the app-to-app endpoints live under `client/...`; for user-scoped actions
    // use the top-level `/primary-salon` route registered in Laravel.
    // Simple routing: user-scoped requests should hit the authenticated Laravel endpoint
    if (!venueUuid || venueUuid === 'undefined') {
      console.warn('[primary-salon proxy POST] invalid venueUuid', { venueUuid, params, url: req.url });
      return NextResponse.json({ message: 'Invalid venue UUID' }, { status: 400 });
    }

    // The backend exposes primary-salon as an authenticated user endpoint
    // at /primary-salon/{venue:uuid}. There is no app-to-app `client/primary-salon`
    // route, so force user-scoped path and log if caller requested `laravelApp`.
    if (accessType === 'laravelApp') {
      console.warn('[primary-salon proxy] access_type=laravelApp requested but primary-salon is user-scoped; forcing laravelApi (cookie)');
    }
    const url = `primary-salon/${venueUuid}`;

    try {
      const serviceBase = service?.defaults?.baseURL || '<unknown-base>';
      const fullTarget = `${serviceBase.replace(/\/$/, '')}/${String(url).replace(/^\/?/, '')}`;
      console.log('[primary-salon proxy POST] forwarding', { method, fullTarget, url, payload, accessType, forwardedHeaders: Object.keys(config.headers || {}) });

      let response;
      if (method === 'get') {
        response = await service.get(url, { params: payload, ...config });
      } else if (method === 'delete') {
        response = await service.delete(url, { data: payload, ...config });
      } else {
        response = await service[method](url, payload, config);
      }

      console.log('[primary-salon proxy POST] backend response status', response.status);
      return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
      console.error('[primary-salon proxy POST] axios error', {
        message: error?.message,
        responseStatus: error?.response?.status,
        responseData: error?.response?.data,
        requestUrl: error?.config?.url,
        requestMethod: error?.config?.method,
      });
      const status = error?.response?.status || 500;
      const data = error?.response?.data || { message: 'Unexpected error occurred.' };
      return NextResponse.json(data, { status });
    }
  } catch (error) {
    console.error('primary-salon proxy error', error?.response?.status, error?.response?.data || error?.message);
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Unexpected error occurred.' };
    return NextResponse.json(data, { status });
  }
}

export async function PUT(req, context) {
  // Accept direct PUT requests (bypass method override)
  try {
    const { params } = await context;
    const { venueUuid } = await params;

    const contentType = req.headers.get('content-type') || '';
    let body = {};

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
    } else {
      body = await req.json();
    }

    const accessType = body?.access_type || 'laravelApi';
    const payload = body?.data || {};

    const token = req.cookies.get('token')?.value;
    const service = accessType === 'laravelApp' ? laravelApp : laravelApi;

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const config = { headers: { 'X-Forwarded-For': clientIp, ...(accessType === 'laravelApi' && token ? { Authorization: `Bearer ${token}` } : {}) } };

    if (accessType === 'laravelApp') {
      console.warn('[primary-salon proxy PUT] access_type=laravelApp requested but primary-salon is user-scoped; forcing laravelApi (cookie)');
    }
    const url = `primary-salon/${venueUuid}`;

    try {
      const serviceBase = service?.defaults?.baseURL || '<unknown-base>';
      const fullTarget = `${serviceBase.replace(/\/$/, '')}/${String(url).replace(/^\/?/, '')}`;
      console.log('[primary-salon proxy PUT] forwarding', { method: 'PUT', fullTarget, url, payload, accessType, forwardedHeaders: Object.keys(config.headers || {}) });

      const response = await service.put(url, payload, config);
      console.log('[primary-salon proxy PUT] backend response status', response.status);
      return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
      console.error('[primary-salon proxy PUT] axios error', {
        message: error?.message,
        responseStatus: error?.response?.status,
        responseData: error?.response?.data,
        requestUrl: error?.config?.url,
        requestMethod: error?.config?.method,
      });
      const status = error?.response?.status || 500;
      const data = error?.response?.data || { message: 'Unexpected error occurred.' };
      return NextResponse.json(data, { status });
    }
  } catch (error) {
    console.error('primary-salon proxy error (PUT)', error?.response?.status, error?.response?.data || error?.message);
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Unexpected error occurred.' };
    return NextResponse.json(data, { status });
  }
}
