'use client';

import { useSearchParams } from 'next/navigation';
import AuthPageShell from '@/components/layouts/AuthPageShell';
import AuthPanel from '@/components/auth/AuthPanel';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'signin';
  const returnUrl = searchParams.get('returnUrl'); // For redirect after auth

  return (
    <AuthPageShell
      variant="default"
      pageClassName="pt-4 sm:pt-6 pb-16 sm:pb-24"
    >
      <div className="w-full md:w-1/2 mx-auto">
      <AuthPanel 
        initialTab={tab === 'signup' ? 'signup' : 'signin'}
        returnUrl={returnUrl ? decodeURIComponent(returnUrl) : null}
        showHeader={true}
      />
      </div>
    </AuthPageShell>
  );
}
