import { Suspense } from 'react';
import PreviewClient from './PreviewClient';

export const metadata = {
    robots: 'noindex, nofollow',
    title: 'Venue Preview',
    description: 'Private preview of a venue. This page is not indexed by search engines.',
};

export default function PreviewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600 font-semibold">Loading preview...</p>
                </div>
            </div>
        }>
            <PreviewClient />
        </Suspense>
    );
}
