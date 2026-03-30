'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SocialCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState('Completing sign-in...');

    useEffect(() => {
        async function complete() {
            const token = searchParams.get('token');
            const provider = searchParams.get('provider');
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
                if (!res.ok) throw new Error('Failed to set token');

                // success: navigate to desired page
                router.replace(next);
            } catch (err) {
                console.error(err);
                setMessage('Failed to complete authentication');
            }
        }

        complete();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="mb-2">{message}</p>
                <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-black mx-auto" />
            </div>
        </div>
    );
}
