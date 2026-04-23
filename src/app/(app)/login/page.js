'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect page for /login
 * Redirects to /auth?tab=signin for the unified auth page
 */
export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/auth?tab=signin');
    }, [router]);

    return null;
}
