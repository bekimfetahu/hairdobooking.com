import { NextResponse } from 'next/server';
import laravelApi from '@/services/laravelApi';

export async function GET(req, { params }) {
  try {
    const { appointmentUuid } = await params;
    if (!appointmentUuid) return NextResponse.json({ message: 'Appointment UUID required' }, { status: 400 });

    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Try to create or retrieve a payment intent (preferred). If that fails, fall back to payment-status.
    let paymentIntent = null;
    let appointment = null;

    // First, attempt to create/get a payment intent for this appointment.
    try {
      const createRes = await laravelApi.post(`appointments/${appointmentUuid}/payment-intent`, {}, config);
      // createRes.data expected: { client_secret, payment_intent_id, amount, currency, owner_uuid }
      paymentIntent = createRes.data;
    } catch (createErr) {
      // If creation fails (e.g. payment already pending/confirmed) try to fetch existing status
      try {
        const ps = await laravelApi.get(`appointments/${appointmentUuid}/payment-status`, config);
        paymentIntent = ps.data;
      } catch (statusErr) {
        paymentIntent = null;
      }
    }

    // Fetch appointment resource for display where available
    try {
      const apptRes = await laravelApi.get(`appointments/${appointmentUuid}`, config);
      appointment = apptRes.data;
    } catch (apptErr) {
      appointment = null;
    }

    // Merge appointment into paymentIntent response for frontend convenience
    // Only call payment-status if we didn't already receive sufficient payment data
    // (e.g. client_secret or payment_intent_id). This avoids duplicate requests.
    let statusRes = null;
    const needsStatusFetch = !paymentIntent || (!paymentIntent.client_secret && !paymentIntent.payment_intent_id && !paymentIntent.stripe_status);
    if (needsStatusFetch) {
      try {
        statusRes = await laravelApi.get(`appointments/${appointmentUuid}/payment-status`, config);
        // Merge status data under paymentIntent, preferring any client_secret or extra payment fields
        paymentIntent = { ...(paymentIntent || {}), ...(statusRes.data || {}) };
      } catch (statusMergeErr) {
        // ignore — we already have best-effort paymentIntent and appointment
      }
    }

    // If appointment wasn't fetched earlier, try to use appointment from status response
    if (!appointment && statusRes?.data?.appointment) {
      appointment = statusRes.data.appointment;
    }

    const result = { payment_intent: paymentIntent };
    if (appointment) result.payment_intent = { ...(result.payment_intent || {}), appointment };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Checkout proxy error:', error);
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Failed to fetch checkout data' };
    return NextResponse.json(data, { status });
  }
}
