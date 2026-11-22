import { NextResponse } from 'next/server';
import laravelApi from '@/services/laravelApi';

async function forwardRequest(req, method, params) {
  const { appointmentUuid } = await params;
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const config = { headers: { Authorization: `Bearer ${token}` } };

  try {
    const response = method === 'GET'
      ? await laravelApi.get(`appointments/${appointmentUuid}/reschedule`, config)
      : await laravelApi.patch(
          `appointments/${appointmentUuid}/reschedule`,
          await req.json(),
          config
        );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      error?.response?.data || { message: 'Unable to reschedule appointment' },
      { status: error?.response?.status || 500 }
    );
  }
}

export function GET(req, context) {
  return forwardRequest(req, 'GET', context.params);
}

export function PATCH(req, context) {
  return forwardRequest(req, 'PATCH', context.params);
}
