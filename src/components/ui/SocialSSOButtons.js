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
        <div className="grid gap-3">
            <button
                type="button"
                onClick={() => (window.location.href = googleServerRedirectUrl)}
                className="google-signin-fullwidth social-sso-button"
            >
                <span className="social-sso-button__icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.7 4.9-6.4 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 6 .1 8 2.2l5.7-5.7C34.2 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z" />
                        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15 19 12 24 12c3.1 0 6 .1 8 2.2l5.7-5.7C34.2 6.1 29.4 4 24 4c-7.8 0-14.6 4.4-17.7 10.7z" />
                        <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.2C29.4 35.4 26.9 36 24 36c-5.2 0-9.7-3.1-11.5-7.6l-6.6 5.1C8.9 39.5 16 44 24 44z" />
                        <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-1 2.9-2.9 5.3-5.2 6.9l.1-.1 6.3 5.2C35.9 36.8 40 31.1 40 24c0-1.3-.1-2.7-.4-3.9z" />
                    </svg>
                </span>
                <span>Continue with Google</span>
            </button>

            <button
                type="button"
                onClick={() => (window.location.href = facebookServerRedirectUrl)}
                className="social-sso-button"
            >
                <span className="social-sso-button__icon" aria-hidden="true">
                    <Image src="/images/facebook-logo.png" alt="" width={20} height={20} />
                </span>
                <span>Continue with Facebook</span>
            </button>
        </div>
    );
}
