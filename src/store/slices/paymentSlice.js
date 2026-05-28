import { createSlice } from "@reduxjs/toolkit";

/**
 * Payment state for marketplace appointments
 * 
 * Tracks payment intent creation, confirmation, and status
 * for appointments that require online payment.
 * 
 * State shape per payment:
 * {
 *   appointmentId: "<uuid>",
 *   status: "idle" | "creating_intent" | "pending" | "processing" | "succeeded" | "failed",
 *   paymentIntentId: "<pi_...>" | null,
 *   clientSecret: "<...>_secret_..." | null,
 *   amount: 2500 (cents),
 *   error: null | string,
 *   createdAt: ISO timestamp,
 *   expiresAt: ISO timestamp (15 min after creation),
 * }
 */

const defaultPaymentState = {
  // { [appointmentId]: { ...payment state } }
  byAppointmentId: {},
};

const paymentSlice = createSlice({
  name: "payment",
  initialState: defaultPaymentState,
  reducers: {
    /**
     * Initialize payment intent creation
     */
    initiatePaymentIntent(state, action) {
      const { appointmentId, amount } = action.payload;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

      state.byAppointmentId[appointmentId] = {
        appointmentId,
        status: "creating_intent",
        paymentIntentId: null,
        clientSecret: null,
        amount,
        error: null,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };
    },

    /**
     * Payment intent successfully created
     */
    setPaymentIntentReady(state, action) {
      const { appointmentId, paymentIntentId, clientSecret } = action.payload;
      const payment = state.byAppointmentId[appointmentId];

      if (payment) {
        payment.status = "pending";
        payment.paymentIntentId = paymentIntentId;
        payment.clientSecret = clientSecret;
        payment.error = null;
      }
    },

    /**
     * Payment is being processed (Stripe processing)
     */
    setPaymentProcessing(state, action) {
      const { appointmentId } = action.payload;
      const payment = state.byAppointmentId[appointmentId];

      if (payment) {
        payment.status = "processing";
        payment.error = null;
      }
    },

    /**
     * Payment completed successfully
     */
    setPaymentSucceeded(state, action) {
      const { appointmentId } = action.payload;
      const payment = state.byAppointmentId[appointmentId];

      if (payment) {
        payment.status = "succeeded";
        payment.error = null;
      }
    },

    /**
     * Payment failed
     */
    setPaymentFailed(state, action) {
      const { appointmentId, error } = action.payload;
      const payment = state.byAppointmentId[appointmentId];

      if (payment) {
        payment.status = "failed";
        payment.error = error || "Payment failed";
      }
    },

    /**
     * Payment timed out (15 minute grace period expired)
     */
    setPaymentExpired(state, action) {
      const { appointmentId } = action.payload;
      const payment = state.byAppointmentId[appointmentId];

      if (payment) {
        payment.status = "expired";
        payment.error = "Payment session expired. Please try booking again.";
      }
    },

    /**
     * Clear payment state for an appointment
     */
    clearPayment(state, action) {
      const { appointmentId } = action.payload;
      delete state.byAppointmentId[appointmentId];
    },

    /**
     * Clear all payment states
     */
    clearAllPayments(state) {
      state.byAppointmentId = {};
    },
  },
});

export const {
  initiatePaymentIntent,
  setPaymentIntentReady,
  setPaymentProcessing,
  setPaymentSucceeded,
  setPaymentFailed,
  setPaymentExpired,
  clearPayment,
  clearAllPayments,
} = paymentSlice.actions;

// Selectors
export const selectPaymentByAppointmentId = (appointmentId) => (state) =>
  state.payment?.byAppointmentId?.[appointmentId] || null;

export const selectPaymentStatus = (appointmentId) => (state) =>
  state.payment?.byAppointmentId?.[appointmentId]?.status || "idle";

export const selectPaymentIntent = (appointmentId) => (state) => {
  const payment = state.payment?.byAppointmentId?.[appointmentId];
  return payment
    ? {
        id: payment.paymentIntentId,
        clientSecret: payment.clientSecret,
        status: payment.status,
      }
    : null;
};

export const selectPaymentError = (appointmentId) => (state) =>
  state.payment?.byAppointmentId?.[appointmentId]?.error || null;

export const selectIsPaymentExpired = (appointmentId) => (state) => {
  const payment = state.payment?.byAppointmentId?.[appointmentId];
  if (!payment || !payment.expiresAt) return false;

  return new Date() > new Date(payment.expiresAt);
};

export default paymentSlice.reducer;
