import React from 'react';
import CheckoutPage from '../../../components/checkout/CheckoutPage';

export default async function Page({ params, searchParams }) {
  // SSR: appointmentUuid from URL
  const { appointmentUuid } = params;
  return <CheckoutPage appointmentUuid={appointmentUuid} />;
}
