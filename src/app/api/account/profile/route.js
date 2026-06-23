import { NextResponse } from 'next/server';
import laravelApi from '@/services/laravelApi';
const API_BASE = process.env.LARAVEL_INTERNAL_URL || process.env.NEXT_PUBLIC_LARAVEL_URL;

// Proxy for profile fetch/update. Uses authenticated Laravel endpoint `/account/profile`.
export async function POST(req){
  try{
    const form = await req.formData();
    const forward = new FormData();
    for(const [k,v] of form.entries()) forward.append(k,v);

    const token = req.cookies.get('token')?.value;
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const config = { headers: { 'X-Forwarded-For': clientIp } };
    if(token) config.headers.Authorization = `Bearer ${token}`;

    const url = 'account/profile';
    const serviceBase = laravelApi?.defaults?.baseURL || '<unknown-base>';
    const fullTarget = `${serviceBase.replace(/\/$/, '')}/${String(url).replace(/^\/?/, '')}`;
    console.log('[profile proxy POST] forwarding', { fullTarget, forwardedHeaders: Object.keys(config.headers || {}) });

    // Use native fetch to proxy multipart FormData reliably (lets node set boundary)
    const backendUrl = `${API_BASE}/api/${url}`;
    const cookieHeader = req.headers.get('cookie') || '';
    // extract XSRF-TOKEN cookie and forward as header for Sanctum stateful auth
    const xsrf = (() => {
      try{
        const cookies = cookieHeader.split(';').map(c=>c.trim());
        const xs = cookies.find(c=>c.startsWith('XSRF-TOKEN='));
        if(!xs) return null;
        return decodeURIComponent(xs.split('=')[1] || '');
      }catch(e){ return null; }
    })();

    const headers = {
      'X-Forwarded-For': clientIp,
      Cookie: cookieHeader,
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
    // preserve origin/referrer to satisfy CORS/Sanctum stateful checks
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    if(origin) headers.Origin = origin;
    if(referer) headers.Referer = referer;
    if(xsrf) headers['X-XSRF-TOKEN'] = xsrf;
    // quick test: also forward Authorization Bearer token if present (matches appointments pattern)
    const bearer = req.cookies.get('token')?.value;
    if (bearer) headers.Authorization = `Bearer ${bearer}`;

    const fetchRes = await fetch(backendUrl, { method: 'POST', body: forward, headers });
    const text = await fetchRes.text().catch(()=>null);
    let parsed = null;
    try{ parsed = text ? JSON.parse(text) : null; }catch(e){ parsed = null; }
    console.log('[profile proxy POST] backend status', fetchRes.status, 'bodyText:', text);
    // When proxying, return the backend response body directly so clients receive the expected shape.
    // Include lightweight debug info under `_debug` to avoid changing primary response shape.
    const responseBody = parsed ?? text ?? null;
    const debug = { forwardedCookie: cookieHeader || null, forwardedXSRF: xsrf || null, backendStatus: fetchRes.status };
    // If the backend returned an object, attach _debug without overwriting existing keys.
    if(responseBody && typeof responseBody === 'object' && !Array.isArray(responseBody)){
      responseBody._debug = debug;
      return NextResponse.json(responseBody, { status: fetchRes.status });
    }
    // otherwise return a wrapper with body and debug (for non-JSON responses)
    return NextResponse.json({ body: responseBody, _debug: debug }, { status: fetchRes.status });
  }catch(error){
    console.error('[profile proxy POST] axios error', { message: error?.message, responseStatus: error?.response?.status, responseData: error?.response?.data });
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Unexpected error occurred.' };
    return NextResponse.json(data, { status });
  }
}

export async function GET(req){
  try{
    const token = req.cookies.get('token')?.value;
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const config = { headers: { 'X-Forwarded-For': clientIp } };
    if(token) config.headers.Authorization = `Bearer ${token}`;

    const res = await laravelApi.get('account/profile', config);
    return NextResponse.json(res.data);
  }catch(error){
    console.error('[profile proxy GET] axios error', { message: error?.message, responseStatus: error?.response?.status, responseData: error?.response?.data });
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Unexpected error occurred.' };
    return NextResponse.json(data, { status });
  }
}
