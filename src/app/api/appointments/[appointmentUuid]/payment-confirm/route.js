/**
 * Payment Confirmation Proxy Handler
 * 
 * Purpose: Confirm a Stripe payment for an appointment via the secure server-side route.
 * The HttpOnly cookie (set during login) is automatically sent with the request.
 * 
 * Flow:
 * 1. Browser sends payment_intent_id to this handler
 * 2. Handler extracts token from HttpOnly cookie
 * 3. Handler forwards request to Laravel with Authorization header
 * 4. Laravel confirms the payment and returns status
 * 5. Handler returns response to browser
 */

import { NextResponse } from 'next/server';
import laravelApi from '@/services/laravelApi';

export async function POST(req, { params }) {
  try {
    const { appointmentUuid } = await params;
    const { payment_intent_id } = await req.json();

    if (!appointmentUuid || !payment_intent_id) {
      return NextResponse.json(
        { message: 'Appointment UUID and payment_intent_id are required' },
        { status: 400 }
      );
    }

    // Get token from HttpOnly cookie
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Call Laravel API with token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    const response = await laravelApi.post(
      `appointments/${appointmentUuid}/payment-confirm`,
      { payment_intent_id },
      config
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Failed to confirm payment' };
    return NextResponse.json(data, { status });
  }
}
