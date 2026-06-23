import { getCurrentUserServer } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import DashboardClient from './dashboard-client';

export const metadata = {
  title: 'Dashboard - HairdoBooking',
  description: 'Your client dashboard',
};

export default async function DashboardPage() {
  const user = await getCurrentUserServer();
  if (!user) {
    redirect(`/auth?returnUrl=${encodeURIComponent('/dashboard')}`);
  }

  return <DashboardClient initialUser={user} />;
}
