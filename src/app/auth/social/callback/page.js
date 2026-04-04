import { Suspense } from 'react';
import SocialCallbackClient from './SocialCallbackClient';

export default function SocialCallbackPage() {
    return (
        <Suspense
            fallback={(
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <p className="mb-2">Completing sign-in...</p>
                        <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-black mx-auto" />
                    </div>
                </div>
            )}
        >
            <SocialCallbackClient />
        </Suspense>
    );
}
