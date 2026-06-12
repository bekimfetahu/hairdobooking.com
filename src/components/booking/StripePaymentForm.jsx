"use client";

import React, { useState, useEffect } from "react";
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

/**
 * StripePaymentForm Component
 *
 * Handles payment collection and confirms the payment with the backend.
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
  onClose,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [timeoutWarning, setTimeoutWarning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setTimeoutWarning(true),
      12 * 60 * 1000
    );

    return () => clearTimeout(timer);
  }, []);

  const confirmPaymentWithBackend = async (
    appointmentUuid,
    paymentIntentId
  ) => {
    try {
      if (!appointmentUuid || !paymentIntentId) {
        throw new Error("Missing appointment or payment intent id");
      }

      const response = await fetch(
        `/api/appointments/${appointmentUuid}/payment-confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_intent_id: paymentIntentId,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("Payment confirm failed:", data);

        setErrorMessage(data.message || "Failed to confirm payment");
        setPaymentStatus("confirmation_failed");

        onPaymentError?.(data);
        return;
      }

      setPaymentStatus("succeeded");
      setErrorMessage(null);

      onPaymentSuccess?.({
        appointmentId: appointmentUuid,
        paymentIntentId,
        status: "succeeded",
      });
    } catch (err) {
      console.error(err);

      setErrorMessage(
        "Failed to confirm payment. Please contact support."
      );
      setPaymentStatus("confirmation_error");

      onPaymentError?.(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage(null);
    setIsLoading(true);

    if (!stripe || !elements) {
      setErrorMessage(
        "Stripe is not loaded. Please refresh and try again."
      );
      setIsLoading(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/payment-result`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(
          error.message ||
            "Payment failed. Please check your card details and try again."
        );

        setPaymentStatus("failed");
        onPaymentError?.(error);

        return;
      }

      if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" ||
          paymentIntent.status === "processing")
      ) {
        await confirmPaymentWithBackend(
          appointmentId,
          paymentIntent.id
        );
      } else if (paymentIntent) {
        setErrorMessage(
          `Payment status: ${paymentIntent.status}`
        );

        setPaymentStatus(paymentIntent.status);

        onPaymentError?.({
          status: paymentIntent.status,
        });
      }
    } catch (err) {
      setErrorMessage(
        err?.message ||
          "An error occurred. Please try again."
      );

      setPaymentStatus("error");
      onPaymentError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (value) => {
    const num = Number.parseFloat(value || 0);

    try {
      if (currency) {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
        }).format(num);
      }
    } catch (e) {
      console.error(e);
    }

    return num.toFixed(2);
  };

  const formattedAmount = formatAmount(amount);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Payment
          </h2>
          <p className="text-gray-600 mt-1">
            Complete your appointment booking
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">
            {serviceName}
          </span>

          <span className="font-semibold text-gray-900">
            {formattedAmount}
          </span>
        </div>

        <div className="text-sm text-gray-500">
          <p>At: {ownerName}</p>
        </div>
      </div>

      {timeoutWarning && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-4">
          <p className="text-sm">
            ⚠️ Your payment session will expire soon.
            Complete payment now.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-4">
          <p className="text-sm font-medium">
            Payment Error
          </p>
          <p className="text-sm mt-1">
            {errorMessage}
          </p>
        </div>
      )}

      {paymentStatus === "succeeded" && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md mb-4">
          <p className="text-sm font-medium">
            ✓ Payment Successful
          </p>
          <p className="text-sm mt-1">
            Your appointment has been confirmed.
          </p>
        </div>
      )}

      {paymentStatus === "processing" && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md mb-4">
          <p className="text-sm font-medium">
            Processing Payment
          </p>
          <p className="text-sm mt-1">
            Please wait while we process your payment...
          </p>
        </div>
      )}

      {paymentStatus !== "succeeded" && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <LinkAuthenticationElement
            options={{
              defaultValues: {
                email: clientEmail,
              },
            }}
          />

          <PaymentElement
            options={{
              layout: "tabs",
              defaultValues: {
                billingDetails: {
                  email: clientEmail,
                },
              },
            }}
          />

          <button
            type="submit"
            disabled={
              isLoading || !stripe || !elements
            }
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Processing...
              </div>
            ) : (
              `Pay ${formattedAmount}`
            )}
          </button>

          {paymentOptional && onSkipPayment && (
            <button
              type="button"
              onClick={onSkipPayment}
              disabled={isLoading}
              className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-semibold py-3 px-4 rounded-lg border border-gray-300"
            >
              Skip Payment for Now
            </button>
          )}

          <div className="flex items-center justify-center text-xs text-gray-500 space-x-1">
            <span>🔒</span>
            <span>
              Secure payment powered by Stripe
            </span>
          </div>
        </form>
      )}

      {paymentStatus === "failed" && (
        <button
          type="button"
          onClick={() => {
            setPaymentStatus(null);
            setErrorMessage(null);
          }}
          className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg"
        >
          Try Again
        </button>
      )}

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Having trouble?{" "}
          <a
            href="/support"
            className="text-blue-600 hover:text-blue-700"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}