'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';

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
            if (!res.ok) throw new Error(data.message || `${provider} login failed`);
            console.log(data)

            dispatch(loginSuccess({ user: data.user }));
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    return (
    <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.log(`${provider} login failed`)}
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        logo_alignment="center"
        width="100%" // ✅ makes it full width
    />
    );
}
