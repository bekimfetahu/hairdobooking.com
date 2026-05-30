'use client';

import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';

/**
 * StripePaymentContainer Component
 * 
 * Wrapper component that initializes Stripe and provides the Elements provider.
 * Manages the payment intent creation and handles the full payment flow.
 * 
 * Props:
 * - appointmentId: string - UUID of appointment
 * - amount: number - Amount in GBP/currency
 * - ownerName: string - Salon owner name
 * - serviceName: string - Service description
 * - clientEmail: string - Client email
 * - clientSecret: string - Stripe payment intent client secret
 * - paymentIntentId: string - Stripe payment intent ID
 * - paymentOptional: boolean - Whether payment is optional (user can skip)
 * - onPaymentSuccess: function - Callback on success
 * - onPaymentError: function - Callback on error
 * - onSkipPayment: function - Callback when user skips payment (only for optional)
 * - onClose: function - Callback to close payment form
 */
export default function StripePaymentContainer({
  appointmentId,
  amount,
  ownerName,
  serviceName,
  clientEmail,
  clientSecret,
  paymentIntentId,
  paymentOptional,
  currency,
  onPaymentSuccess,
  onPaymentError,
  onSkipPayment,
  onClose,
}) {
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Stripe
  useEffect(() => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      setError('Stripe configuration is missing. Please contact support.');
      setLoading(false);
      return;
    }

    const stripe = loadStripe(publishableKey);
    setStripePromise(stripe);
  }, []);

  // Validate payment intent data from props
  useEffect(() => {
    if (!stripePromise) return;

    if (!clientSecret || !paymentIntentId) {
      setError('Payment information missing. Please try again.');
      setLoading(false);
      return;
    }

    // Payment intent data already provided, ready to render form
    setLoading(false);
  }, [stripePromise, clientSecret, paymentIntentId]);

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          <p className="font-medium mb-2">Payment Error</p>
          <p className="text-sm mb-4">{error}</p>
          <div className="flex space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Preparing payment form...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#2563eb', // Blue-600
            colorText: '#1f2937', // Gray-800
            colorDanger: '#dc2626', // Red-600
            fontFamily: 'system-ui, -apple-system, sans-serif',
            spacingUnit: '4px',
            borderRadius: '6px',
          },
        },
      }}
    >
      <StripePaymentForm
        appointmentId={appointmentId}
        amount={amount}
        currency={currency}
        ownerName={ownerName}
        serviceName={serviceName}
        clientEmail={clientEmail}
        paymentOptional={paymentOptional}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        onSkipPayment={onSkipPayment}
      />
    </Elements>
  );
}
