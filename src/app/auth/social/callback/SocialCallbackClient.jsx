'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import { fetchCurrentUser } from '@/services/auth/session';

export default function SocialCallbackClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useDispatch();
    const [message, setMessage] = useState('Completing sign-in...');

    useEffect(() => {
        async function complete() {
            const token = searchParams.get('token');
            const next = searchParams.get('next') || '/dashboard';

            if (!token) {
                setMessage('Missing token in callback');
                return;
            }

            try {
                const res = await fetch('/api/auth/social/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                if (!res.ok) {
                    throw new Error('Failed to set token');
                }

                // Immediately fetch user and update Redux state
                // This updates NavbarStatic and all connected components without needing a page refresh
                const user = await fetchCurrentUser();
                if (user) {
                    dispatch(loginSuccess({ user }));
                }

                console.log('Social auth complete, redirecting to:', next);
                router.replace(next);
            } catch (error) {
                console.error(error);
                setMessage('Failed to complete authentication');
            }
        }

        complete();
    }, [searchParams, router, dispatch]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="mb-2">{message}</p>
                <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-black mx-auto" />
            </div>
        </div>
    );
}