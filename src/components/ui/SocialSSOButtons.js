'use client';

import { useMemo } from 'react';
import Image from 'next/image';

export default function SocialSSOButtons() {
    const googleServerRedirectUrl = useMemo(
        () => `${process.env.NEXT_PUBLIC_LARAVEL_URL}/client/auth/social/google/redirect`,
        []
    );

    const facebookServerRedirectUrl = useMemo(
        () => `${process.env.NEXT_PUBLIC_LARAVEL_URL}/client/auth/social/facebook/redirect`,
        []
    );

    return (
        <div className="grid gap-4">
            <button
                type="button"
                onClick={() => (window.location.href = googleServerRedirectUrl)}
                className="google-signin-fullwidth social-sso-button flex w-full items-center justify-center gap-3 border border-black/10 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:border-black hover:text-black"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20" className="h-5 w-5">
                    <path fill="#EA4335" d="M24 9.5c3.9 0 7.1 1.4 9.3 3.3l6.9-6.9C36.2 2.9 30.5 0 24 0 14.7 0 6.9 5.1 2.7 12.6l7.9 6.1C12.8 14.2 18 9.5 24 9.5z"/>
                    <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.7-2 5-4.3 6.6l6.9 5.3C43.7 37.9 46.5 31.6 46.5 24.5z"/>
                </svg>
                Continue with Google
            </button>

            <button
                type="button"
                onClick={() => (window.location.href = facebookServerRedirectUrl)}
                className="social-sso-button flex w-full items-center justify-center gap-3 border border-black/10 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:border-black hover:text-black"
            >
                <Image src="/images/facebook-logo.png" alt="Facebook" width={20} height={20} className="h-5 w-5" />
                Continue with Facebook
            </button>
        </div>
    );
}
