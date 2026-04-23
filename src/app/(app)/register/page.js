'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect page for /register
 * Redirects to /auth?tab=signup for the unified auth page
 */
export default function RegisterPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/auth?tab=signup');
    }, [router]);

    return null;
}

