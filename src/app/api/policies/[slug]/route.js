import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';

export async function GET(req, { params }) {
  const { slug } = await params;
  try {
    const res = await laravelApp.get(`client/policies/${encodeURIComponent(slug)}`);
    // Laravel returns { data: { ...policy } } — unwrap to return the inner object
    const payload = res.data?.data ?? res.data;
    return NextResponse.json(payload, { status: res.status });
  } catch (err) {
    const status = err?.response?.status || 500;
    const data = err?.response?.data || { message: 'Policy proxy error' };
    return NextResponse.json(data, { status });
  }
}
// import { NextResponse } from 'next/server';
// import laravelApp from '@/services/laravelApp';

// export async function GET(req, { params }) {
//   const { slug } = params;
//   try {
//     const res = await laravelApp.get(`client/policies/${encodeURIComponent(slug)}`);
//     return NextResponse.json(res.data, { status: res.status });
//   } catch (err) {
//     const status = err?.response?.status || 500;
//     const data = err?.response?.data || { message: 'Policy proxy error' };
//     return NextResponse.json(data, { status });
//   }
// }
