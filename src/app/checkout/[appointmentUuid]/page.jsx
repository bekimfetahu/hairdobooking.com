import React from 'react';
import CheckoutPage from '../../../components/checkout/CheckoutPage';
import AuthPageShell from '@/components/layouts/AuthPageShell';

export default async function Page({ params, searchParams }) {
  // SSR: appointmentUuid from URL
  const { appointmentUuid } = await params;
  return (
    <AuthPageShell title="Checkout" rightCardClassName="max-w-3xl w-full">
      <CheckoutPage appointmentUuid={appointmentUuid} />
    </AuthPageShell>
  );
}
