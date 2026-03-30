'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import GoogleSignInButton from './GoogleSignInButton';
import { loginSuccess } from '@/store/slices/authSlice';
import { fetchCurrentUser } from '@/services/auth/session';

export default function SocialSSOButtons({ facebookHref = '/api/auth/social/facebook' }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const googleRef = useRef(null);
    const [googleHeight, setGoogleHeight] = useState(null);

    // Server-redirect support (Laravel Socialite): toggle via env vars
    // - Facebook: NEXT_PUBLIC_FACEBOOK_SERVER_REDIRECT / NEXT_PUBLIC_FACEBOOK_REDIRECT_URL
    // - Google:   NEXT_PUBLIC_GOOGLE_SERVER_REDIRECT / NEXT_PUBLIC_GOOGLE_REDIRECT_URL
    const fbServerRedirectEnabled = process.env.NEXT_PUBLIC_FACEBOOK_SERVER_REDIRECT === 'true';
    const fbServerRedirectUrl = process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_LARAVEL_URL}/client/auth/social/facebook/redirect`;

    const googleServerRedirectEnabled = process.env.NEXT_PUBLIC_GOOGLE_SERVER_REDIRECT === 'true';
    const googleServerRedirectUrl = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_LARAVEL_URL}/client/auth/social/google/redirect`;

    useEffect(() => {
        function measure() {
            const el = googleRef.current;
            if (el) setGoogleHeight(el.offsetHeight);
        }
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    async function loadFacebookSDK(appId) {
        return new Promise((resolve, reject) => {
            if (window.FB) return resolve(window.FB);
            window.fbAsyncInit = function () {
                window.FB.init({ appId, cookie: true, xfbml: false, version: 'v16.0' });
                resolve(window.FB);
            };
            const s = document.createElement('script');
            s.src = 'https://connect.facebook.net/en_US/sdk.js';
            s.async = true;
            s.onload = () => {
                if (window.FB) resolve(window.FB);
            };
            s.onerror = reject;
            document.body.appendChild(s);
        });
    }

    const handleFacebookLogin = async () => {
        const isSecureOrigin = window.location.protocol === 'https:';

        // Facebook JS SDK refuses to run on http pages, so use the Laravel redirect
        // flow there. Keep the SDK path only for secure origins.
        if (fbServerRedirectEnabled || !isSecureOrigin) {
            window.location.href = fbServerRedirectUrl;
            return;
        }

        try {
            const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
            if (!appId) {
                // fallback to redirect if no client id configured
                window.location.href = facebookHref;
                return;
            }

            const FB = await loadFacebookSDK(appId);
            FB.login(async (resp) => {
                if (!resp?.authResponse) return;
                const accessToken = resp.authResponse.accessToken;

                const res = await fetch('/api/auth/social/facebook', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accessToken }),
                });
                const data = await res.json();
                if (!res.ok) {
                    console.error('Facebook login failed', data);
                    return;
                }

                const refreshedUser = await fetchCurrentUser();
                dispatch(loginSuccess({ user: refreshedUser || data.user }));
                router.push('/dashboard');
            }, { scope: 'email,public_profile' });
        } catch (err) {
            console.error('FB login error', err);
            // fallback to redirect to server flow
            window.location.href = facebookHref;
        }
    };

    return (
        <div className="grid gap-4">
            <div ref={googleRef}>
                {googleServerRedirectEnabled ? (
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
                ) : (
                    <GoogleSignInButton />
                )}
            </div>

            <button
                type="button"
                onClick={handleFacebookLogin}
                style={googleHeight ? { height: googleHeight } : undefined}
                className="social-sso-button flex w-full items-center justify-center gap-3 border border-black/10 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:border-black hover:text-black"
            >
                <Image src="/images/facebook-logo.png" alt="Facebook" width={20} height={20} className="h-5 w-5" />
                Continue with Facebook
            </button>
        </div>
    );
}
