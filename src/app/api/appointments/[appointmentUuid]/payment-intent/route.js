import { NextResponse } from 'next/server';
import laravelApi from '@/services/laravelApi';

export async function POST(req, { params }) {
  try {
    const { appointmentUuid } = await params;

    if (!appointmentUuid) {
      return NextResponse.json(
        { message: 'Appointment UUID is required' },
        { status: 400 }
      );
    }

    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const response = await laravelApi.post(
      `appointments/${appointmentUuid}/payment-intent`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Create payment intent proxy error:', error);
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Failed to create payment intent' };
    return NextResponse.json(data, { status });
  }
}
