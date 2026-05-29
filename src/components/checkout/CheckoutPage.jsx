import React, { useEffect, useState } from 'react';
import StripePaymentContainer from '../booking/StripePaymentContainer';

export default function CheckoutPage({ appointmentUuid }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch appointment details and payment intent
        const res = await fetch(`/api/appointments/${appointmentUuid}/checkout`);
        if (!res.ok) throw new Error('Failed to load appointment');
        const data = await res.json();
        setAppointment(data.appointment);
        setPaymentIntent(data.payment_intent);
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

  // Example: show summary, then payment form or pay at salon button
  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="mb-4">
        <div className="font-semibold">Service:</div>
        <div>{appointment.service_name}</div>
        <div className="font-semibold mt-2">Employee:</div>
        <div>{appointment.employee_name}</div>
        <div className="font-semibold mt-2">Date & Time:</div>
        <div>{appointment.date_time}</div>
        {appointment.voucher && (
          <div className="mt-2 text-green-700">Voucher: {appointment.voucher.code} (-{appointment.voucher.amount})</div>
        )}
        <div className="font-semibold mt-2">Total:</div>
        <div>£{appointment.total}</div>
      </div>
      {paymentIntent && paymentIntent.payment_required && (
        <StripePaymentContainer
          appointmentId={appointment.uuid}
          amount={paymentIntent.amount}
          ownerName={appointment.owner_name}
          serviceName={appointment.service_name}
          clientEmail={appointment.client_email}
          clientSecret={paymentIntent.client_secret}
          paymentIntentId={paymentIntent.payment_intent_id}
          paymentOptional={paymentIntent.payment_optional}
          onPaymentSuccess={() => window.location.href = `/checkout/${appointment.uuid}/success`}
          onPaymentError={() => {}}
          onSkipPayment={paymentIntent.payment_optional ? () => window.location.href = `/checkout/${appointment.uuid}/success` : null}
        />
      )}
      {paymentIntent && paymentIntent.payment_optional && (
        <button
          className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg border border-gray-300"
          onClick={() => window.location.href = `/checkout/${appointment.uuid}/success`}
        >
          Pay at Salon
        </button>
      )}
    </div>
  );
}
