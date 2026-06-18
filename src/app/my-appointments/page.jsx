import Link from 'next/link';
import React from 'react';
import { cookies } from 'next/headers';
import ScopeAppointmentsClient from '@/components/appointments/ScopeAppointmentsClient';
import AuthPageShell from '@/components/layouts/AuthPageShell';

export default async function MyAppointmentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || null;

  if (!token) {
    return (
      <AuthPageShell title="My Appointments" pageClassName="w-full">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">My Appointments</h1>
          <p className="mt-4">Please <Link href="/login">sign in</Link> to view your appointments.</p>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell title="My Appointments" pageClassName="w-full">
        <ScopeAppointmentsClient scope="upcoming" />
        <ScopeAppointmentsClient scope="past" />
    </AuthPageShell>
  );
}
