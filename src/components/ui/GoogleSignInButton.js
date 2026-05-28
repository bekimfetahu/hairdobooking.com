'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import { fetchCurrentUser } from '@/services/auth/session';

export default function GoogleSignInButton({ provider = 'google' }) {
    const router = useRouter();
    const dispatch = useDispatch();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await fetch(`/api/auth/social/${provider}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });

            const data = await res.json();
            if (!res.ok) {
                const details = Array.isArray(data.details)
                    ? data.details.join(', ')
                    : typeof data.details === 'object' && data.details
                        ? JSON.stringify(data.details)
                        : '';
                console.error([data.message || `${provider} login failed`, details].filter(Boolean).join(' — '));
                return;
            }

            const refreshedUser = await fetchCurrentUser();
            dispatch(loginSuccess({ 
                user: refreshedUser || data.user,
                token: data.token 
            }));
            router.push('/dashboard');
        } catch (err) {
            console.error(`${provider} login failed:`, err);
        }
    };

    return (
        <div className="w-full google-signin-fullwidth">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log(`${provider} login failed`)}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                logo_alignment="center"
                width="100%"
                containerProps={{ style: { width: '100%' }, className: 'w-full' }}
            />
        </div>
    );
}
