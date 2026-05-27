/**
 * Vouchers Validation Proxy Handler (/api/vouchers/validate)
 *
 * Purpose: Keep voucher validation backend URLs server-side so the
 * frontend never sends arbitrary Laravel endpoint paths. This proxy
 * uses `laravelApp` for app-to-app requests (guest users can validate vouchers).
 */
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';

export async function POST(req) {
  try {
    const body = await req.json();

    const slug = body?.slug;
    const code = body?.code;
    const service_uuid = body?.service_uuid;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ message: 'Salon slug is required' }, { status: 422 });
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ message: 'Voucher code is required' }, { status: 422 });
    }

    if (!service_uuid || typeof service_uuid !== 'string') {
      return NextResponse.json({ message: 'Service UUID is required' }, { status: 422 });
    }

    const clientIp = getClientIp(req);
    const config = {
      headers: {
        'X-Forwarded-For': clientIp,
      },
    };

    const url = `client/salons/${slug}/vouchers/validate`;
    const response = await laravelApp.post(url, { code, service_uuid }, config);

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('voucher validation proxy error', error);
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Failed to validate voucher.' };
    return NextResponse.json(data, { status });
  }
}

function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}
