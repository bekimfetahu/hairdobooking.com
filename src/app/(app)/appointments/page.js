import { getCurrentUserServer } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import AppointmentsClient from '@/app/(app)/appointments/appointments-client';
import { fetchInitialAppointments } from '@/services/appointments';

export const metadata = {
  title: 'My Appointments - HairdoBooking',
  description: 'View and manage your upcoming salon appointments',
};

export default async function AppointmentsPage() {
  // SSR: Check authentication and fetch initial data
  const user = await getCurrentUserServer();
  
  if (!user) {
    // Redirect to unified auth page and preserve return path via `returnUrl`
    redirect(`/auth?returnUrl=${encodeURIComponent('/appointments')}`);
  }

  // SSR: Fetch initial appointments data
  const initialAppointments = await fetchInitialAppointments(user.token);
  
  return (
    <AppointmentsClient 
      initialUser={user}
      initialAppointments={initialAppointments}
    />
  );
}