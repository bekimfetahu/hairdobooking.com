import { NextResponse } from 'next/server';
import laravelApi from '@/services/laravelApi';

export async function GET(req, { params }) {
  const { appointmentUuid } = await params;
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const response = await laravelApi.get(
      `appointments/${appointmentUuid}/reschedule/availability`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: Object.fromEntries(new URL(req.url).searchParams),
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      error?.response?.data || { message: 'Failed to load reschedule availability' },
      { status: error?.response?.status || 500 }
    );
  }
}
