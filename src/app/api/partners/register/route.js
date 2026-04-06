/**
 * Partners Register Proxy (/api/partners/register)
 * Forwards partner free-trial / registration requests to Laravel
 * using the application-level service (`laravelApp`).
 */
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body = {};

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
    } else {
      body = await req.json();
    }

    const payload = body?.data || body || {};

    const response = await laravelApp.post('client/free-trial', payload);

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('partners register proxy error', error);
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Unexpected error occurred.' };
    return NextResponse.json(data, { status });
  }
}
