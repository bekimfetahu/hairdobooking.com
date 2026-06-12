import { NextResponse } from 'next/server';
import laravelApi from '@/services/laravelApi';

export async function GET(req, { params }) {
  try {
    const { appointmentUuid } = await params;

    if (!appointmentUuid) {
      return NextResponse.json({ message: 'Appointment UUID is required' }, { status: 400 });
    }

    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await laravelApi.get(`appointments/${appointmentUuid}/payment-status`, config);

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Payment status proxy error:', error);
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Failed to fetch payment status' };
    return NextResponse.json(data, { status });
  }
}
