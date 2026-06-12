'use client';

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

/**
 * StripePaymentForm Component
 * 
 * Handles payment collection for marketplace appointments using Stripe Payment Element.
 * 
 * Props:
 * - appointmentId: string - UUID of the appointment requiring payment
 * - amount: number - Amount in currency units (dollars/pounds)
 * - ownerName: string - Name of salon owner
 * - serviceName: string - Service being paid for
 * - clientEmail: string - Client email for Link authentication
 * - paymentOptional: boolean - Whether payment is optional (user can skip)
 * - onPaymentSuccess: function - Callback when payment confirmed
 * - onPaymentError: function - Callback on error
 * - onSkipPayment: function - Callback when user skips payment (only for optional)
 */
export default function StripePaymentForm({
  appointmentId,
  amount,
  currency,
  ownerName,
  serviceName,
  clientEmail,
  paymentOptional,
  onPaymentSuccess,
  onPaymentError,
  onSkipPayment,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [timeoutWarning, setTimeoutWarning] = useState(false);

  // Show timeout warning if payment has been pending > 12 minutes
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutWarning(true);
    }, 12 * 60 * 1000); // 12 minutes

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    if (!stripe || !elements) {
      setErrorMessage('Stripe is not loaded. Please refresh and try again.');
      setIsLoading(false);
      return;
    }

    try {
      // Submit payment to Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Return URL is used only for 3D Secure and similar auth flows
          return_url: `${window.location.origin}/booking/payment-result`,
        },
        // Redirect to on_success to show payment succeeded page
        redirect: 'if_required',
      });

      if (error) {
        // Payment failed client-side (validation, declined card, etc)
        setErrorMessage(
          error.message || 'Payment failed. Please check your card details and try again.'
        );
        setPaymentStatus('failed');
        onPaymentError?.(error);
        setIsLoading(false);
        return;
      }

      // Check payment status
      if (
        paymentIntent.status === 'succeeded' ||
        paymentIntent.status === 'processing'
      ) {
        onClose,
      }) {
        console.log('Stripe payment succeeded/processing - appointmentId:', appointmentId, 'paymentIntent.id:', paymentIntent.id);
        await confirmPaymentWithBackend(appointmentId, paymentIntent.id);
      } else {
        // Payment in an unexpected state
        setErrorMessage(
          `Payment status: ${paymentIntent.status}. Please check your email for details.`
        );
        setPaymentStatus(paymentIntent.status);
        onPaymentError?.({ status: paymentIntent.status });
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'An error occurred. Please try again or contact support.'
      );
      setPaymentStatus('error');
      onPaymentError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPaymentWithBackend = async (appointmentUuid, paymentIntentId) => {
    try {
      console.log('Payment confirmation - appointmentUuid:', appointmentUuid, 'paymentIntentId:', paymentIntentId);
      
      if (!appointmentUuid || !paymentIntentId) {
        throw new Error(`Missing required payment data: appointmentUuid=${appointmentUuid}, paymentIntentId=${paymentIntentId}`);
      }
      
      // Next.js route handler will use HttpOnly cookie for authentication
      // No need to pass token manually
      const url = `/api/appointments/${appointmentUuid}/payment-confirm`;
      console.log('Calling payment confirm endpoint:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payment_intent_id: paymentIntentId }),
      });
      
      console.log('Payment confirm response status:', response.status);

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Failed to confirm payment');
        setPaymentStatus('confirmation_failed');
        onPaymentError?.(data);
        return;
      }

      // Payment confirmed successfully
      setPaymentStatus('succeeded');
      setErrorMessage(null);
      onPaymentSuccess?.({
        appointmentId: appointmentUuid,
        paymentIntentId,
        status: 'succeeded',
      });
    } catch (err) {
      setErrorMessage('Failed to confirm payment. Please contact support.');
      setPaymentStatus('confirmation_error');
      onPaymentError?.(err);
    }
  };

  // Format amount for display using currency when available.
  // Backend returns amount in major units (dollars/pounds), not cents
  const fmt = (value) => {
    const num = Number.parseFloat(value || 0);
    try {
      if (currency) {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(num);
      }
    } catch (e) {
      // fall through to simple formatting
    }
    return num.toFixed(2);
  };
  const formattedAmount = fmt(amount);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
        <p className="text-gray-600 mt-1">Complete your appointment booking</p>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">{serviceName}</span>
          <span className="font-semibold text-gray-900">{formattedAmount}</span>
        </div>
        <div className="text-sm text-gray-500">
          <p>At: {ownerName}</p>
        </div>
      </div>

      {/* Timeout Warning */}
      {timeoutWarning && (
              console.error('Payment confirm failed:', response.status, data);
              setErrorMessage(data.message || 'Failed to confirm payment');
              setPaymentStatus('confirmation_failed');
              onPaymentError?.(data);
              return;
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-4">
          <p className="text-sm font-medium">Payment Error</p>
          <p className="text-sm mt-1">{errorMessage}</p>
        </div>
      )}

      {/* Success Message */}
      {paymentStatus === 'succeeded' && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md mb-4">
          <p className="text-sm font-medium">✓ Payment Successful</p>
          <p className="text-sm mt-1">Your appointment has been confirmed.</p>
        </div>
      )}

      {/* Processing Message */}
      {paymentStatus === 'processing' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md mb-4">
          <p className="text-sm font-medium">Processing Payment</p>
          <p className="text-sm mt-1">Please wait while we process your payment...</p>
        </div>
      )}

      {/* Payment Form */}
      {paymentStatus !== 'succeeded' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email for Link authentication */}
          <div>
            <LinkAuthenticationElement
              options={{ defaultValues: { email: clientEmail } }}
            />
          </div>

          {/* Payment element */}
          <div>
            <PaymentElement
              options={{
                layout: 'tabs',
                defaultValues: {
                  billingDetails: {
                    email: clientEmail,
                  },
                },
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !stripe || !elements}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Pay ${formattedAmount}`
            )}
          </button>

          {/* Skip Payment Button - for optional payments */}
          {paymentOptional && onSkipPayment && (
            <button
              type="button"
              onClick={onSkipPayment}
              disabled={isLoading}
              className="w-full mt-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 border border-gray-300"
            >
              Skip Payment for Now
            </button>
          )}

          {/* Security Info */}
          <div className="flex items-center justify-center text-xs text-gray-500 space-x-1">
            <span>🔒</span>
            <span>Secure payment powered by Stripe</span>
          </div>
        </form>
      )}

      {/* Retry Button - shown on certain errors */}
      {paymentStatus === 'failed' && (
        <button
          onClick={() => {
            setPaymentStatus(null);
            setErrorMessage(null);
          }}
          className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Try Again
        </button>
      )}

      {/* Contact Support Link */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Having trouble?{' '}
          <a href="/support" className="text-blue-600 hover:text-blue-700">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
