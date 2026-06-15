import { NextResponse } from 'next/server';
import laravelApi from '@/services/laravelApi';

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await laravelApi.get('client/appointments', config);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Failed to fetch account appointments:', error);
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Failed to load appointments' };
    return NextResponse.json(data, { status });
  }
}
