"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import { MapPin, Calendar, User, Sparkles, Banknote } from 'lucide-react';
import StripePaymentContainer from '../booking/StripePaymentContainer';

export default function CheckoutPage({ appointmentUuid: propAppointmentUuid }) {
  const params = useParams();
  const appointmentUuid = propAppointmentUuid || params?.appointmentUuid;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        if (!appointmentUuid) throw new Error('Missing appointment identifier');

        // Fetch appointment details and payment intent via proxy
        const res = await fetch(`/api/appointments/${appointmentUuid}/checkout`);
        if (!res.ok) throw new Error('Failed to load appointment');
        const data = await res.json();
        const pi = data.payment_intent || null;

        // appointment may be embedded under pi.appointment (Laravel service returns appointment resource)
        const appt = pi?.appointment || null;
        setAppointment(appt);

        // Normalize payment intent shape for frontend usage
        let normalized = null;
        if (pi) {
          normalized = {
            client_secret: pi.client_secret || pi.payment_intent?.client_secret || pi.payment_intent_client_secret || null,
            payment_intent_id: pi.payment_intent_id || pi.payment_intent?.payment_intent_id || pi.payment_intent_id || null,
            amount: pi.amount ?? (pi.payment_intent?.amount ?? null),
            currency: pi.currency || pi.currency_code || (pi.payment_intent?.currency) || null,
            payment_required: pi.payment_required ?? pi.payment_intent?.payment_required ?? false,
            payment_optional: pi.payment_optional ?? pi.payment_intent?.payment_optional ?? false,
            stripe_status: pi.stripe_status ?? pi.payment_intent?.stripe_status ?? null,
          };

          // Convert cents -> major units if amount looks like cents
          if (typeof normalized.amount === 'number') {
            if (normalized.amount > 1000) {
              normalized.amount = (normalized.amount / 100).toFixed(2);
            } else {
              normalized.amount = Number(normalized.amount).toFixed(2);
            }
          }
        }

        setPaymentIntent(normalized);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [appointmentUuid]);

  if (loading) return <div>Loading checkout...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!appointment) return <div>Appointment not found.</div>;

  // Styled summary similar to SalonClient right column
  const venueName = appointment.venue?.name || '';
  const venueAddress = appointment.venue?.address?.formatted || '';
  const serviceName = appointment.service?.display_name || appointment.service?.name || '';
  const employeeName = appointment.employee?.full_name || appointment.employee?.user?.full_name || '';
  const fromTime = appointment.from_time ? dayjs(appointment.from_time).format('dddd, D MMMM') : '';
  const timeRange = appointment.from_time ? (appointment.to_time ? `${dayjs(appointment.from_time).format('HH:mm')} → ${dayjs(appointment.to_time).format('HH:mm')}` : dayjs(appointment.from_time).format('HH:mm')) : '';

  // Determine whether the appointment has already been paid.
  // Accept common paid status labels returned by backend/Stripe.
  const paidStatuses = ['succeeded', 'confirmed', 'paid'];
  const intentStatus = paymentIntent?.stripe_status || paymentIntent?.status || null;
  const isPaid = (
    paidStatuses.includes(String(appointment?.payment?.status ?? '').toLowerCase()) ||
    (intentStatus && paidStatuses.includes(String(intentStatus).toLowerCase())) ||
    appointment?.is_paid === true
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-md border border-black/10 bg-white p-4 shadow-sm">
        <div className="border-b border-black/8 bg-gradient-to-r from-neutral-50 to-white px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <MapPin size={18} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-neutral-950">{venueName}</p>
              {venueAddress && (
                <p className="mt-0 text-xs text-neutral-600 line-clamp-2">{venueAddress}</p>
              )}
            </div>
          </div>
        </div>

        <div className="divide-y divide-black/5 p-5">
          <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
              <Sparkles size={18} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">Service</p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">{serviceName} <span className="text-neutral-500 font-normal">{appointment.service?.duration ? `— ${appointment.service.duration} min` : ''}</span></p>
            </div>
          </div>

          <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Calendar size={18} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">Date & Time</p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">{fromTime} {timeRange ? `at ${timeRange}` : ''}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <User size={18} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">Professional</p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">{employeeName || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <Banknote size={18} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">Total</p>
              <p className="mt-1 text-sm font-bold text-emerald-700">{paymentIntent?.currency ? `${paymentIntent.currency} ` : '£'}{paymentIntent?.amount ?? '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Payment area */}
        <div className="p-5">
          {paymentIntent && (
            <div className="space-y-3">
              {!isPaid ? (
                <>
                  <p className="text-sm text-neutral-700">To complete your booking, pay now to confirm your appointment. Payments are processed securely through Stripe.</p>

                  {/* Show Pay now when payment is required/optional, when a client_secret is present,
                      or when a payment intent ID / pending stripe status exists (server returned intent id only) */}
                  {(paymentIntent.payment_required || paymentIntent.payment_optional || paymentIntent.client_secret || paymentIntent.payment_intent_id || paymentIntent.stripe_status === 'pending') ? (
                    <div className="flex flex-col gap-2">
                      <button
                        className="w-full inline-flex items-center justify-center rounded-full bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
                        onClick={() => { if (!isPaid) setShowPaymentModal(true); }}
                      >
                        Pay now
                      </button>
                      {paymentIntent.payment_optional && (
                        <button
                          className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg border border-gray-300"
                          onClick={() => window.location.href = `/checkout/${appointment.uuid}/success`}
                        >
                          Pay at Salon
                        </button>
                      )}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-md border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-800">Payment received</p>
                  <p className="mt-1 text-sm text-emerald-700">Thank you — we’ve received your payment and your appointment is confirmed. A receipt has been sent to <span className="font-medium text-emerald-900">{appointment.client?.email || 'your email'}</span>.</p>
                  {paymentIntent?.amount && (
                    <p className="mt-2 text-xs text-emerald-700">Amount paid: {paymentIntent.currency ? `${paymentIntent.currency} ` : ''}{paymentIntent.amount}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Modal reusing SalonClient pattern */}
          {showPaymentModal && paymentIntent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold">{paymentIntent.payment_optional ? 'Payment (Optional)' : 'Complete Payment'}</h2>
                  <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
                </div>
                <div className="p-6">
                  {paymentIntent.payment_optional && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900"><span className="font-semibold">Payment is optional.</span> You can pay now to confirm, or choose to pay at the salon when you arrive.</p>
                    </div>
                  )}

                  <StripePaymentContainer
                    appointmentId={appointment.uuid}
                    amount={paymentIntent.amount}
                    currency={paymentIntent.currency}
                    ownerName={venueName}
                    serviceName={serviceName}
                    clientEmail={appointment.client?.email || ''}
                    clientSecret={paymentIntent.client_secret}
                    paymentIntentId={paymentIntent.payment_intent_id}
                    paymentOptional={paymentIntent.payment_optional}
                    onPaymentSuccess={() => window.location.href = `/checkout/${appointment.uuid}/success`}
                    onPaymentError={() => {}}
                    onSkipPayment={paymentIntent.payment_optional ? () => { setShowPaymentModal(false); window.location.href = `/checkout/${appointment.uuid}/success`; } : null}
                    onClose={() => setShowPaymentModal(false)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
