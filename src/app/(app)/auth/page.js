'use client';

import { useSearchParams } from 'next/navigation';
import AuthPageShell from '@/components/layouts/AuthPageShell';
import AuthPanel from '@/components/auth/AuthPanel';
import { CalendarDays, Heart, Sparkles } from 'lucide-react';

const benefits = [
    {
        icon: CalendarDays,
        title: 'Book appointments',
        text: 'Find salons and manage upcoming visits in one place.',
    },
    {
        icon: Heart,
        title: 'Save favorites',
        text: 'Keep the salons you like most close at hand.',
    },
    {
        icon: Sparkles,
        title: 'Simple and fast',
        text: 'A clean booking experience built for clients.',
    },
];

export default function AuthPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'signin';
  const returnUrl = searchParams.get('returnUrl'); // For redirect after auth

  return (
    <AuthPageShell
      variant="default"
      eyebrow="Client access"
      title="Sign in or create an account"
      description="Manage your bookings, save your favorite salons, and stay organized."
      panelBadge="Built for your salon bookings"
      panelTitle="Everything you need to book and manage appointments."
      panelDescription="Keep your appointments organized, find salons faster, and return to your favorites anytime."
      benefits={benefits}
    >
      <AuthPanel 
        initialTab={tab === 'signup' ? 'signup' : 'signin'}
        returnUrl={returnUrl ? decodeURIComponent(returnUrl) : null}
        showHeader={true}
      />
    </AuthPageShell>
  );
}
