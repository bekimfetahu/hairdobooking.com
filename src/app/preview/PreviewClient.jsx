'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

export default function PreviewClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [venue, setVenue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            setError('No preview token provided. Please check the link and try again.');
            setLoading(false);
            return;
        }

        // Validate token with our API
        const validateToken = async () => {
            try {
                const response = await axios.post('/api/preview/validate', { token });
                if (response.data.success && response.data.data) {
                    setVenue(response.data.data);
                } else {
                    setError('Failed to load preview. The token may be invalid or expired.');
                }
            } catch (err) {
                console.error('Preview validation error:', err);
                if (err.response?.status === 400) {
                    setError('This preview link has expired or is invalid. Please request a new preview link from your admin panel.');
                } else {
                    setError('Failed to load preview. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        validateToken();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600 font-semibold">Loading preview...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="text-2xl text-red-600">⚠️</div>
                        <div className="flex-1">
                            <h2 className="font-bold text-lg text-gray-900">Preview Unavailable</h2>
                            <p className="text-sm text-gray-600 mt-2">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Return to Marketplace
                    </button>
                </div>
            </div>
        );
    }

    if (!venue) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-gray-600 font-semibold">No venue data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Preview Banner */}
            <div className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-1 bg-amber-600 text-white text-xs font-semibold rounded">
                            PREVIEW
                        </span>
                        <p className="text-sm text-amber-900">
                            This is a preview of how <strong>{venue.name}</strong> will appear on the marketplace.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="text-sm text-amber-700 hover:text-amber-900 underline"
                    >
                        Close Preview
                    </button>
                </div>
            </div>

            {/* Venue Preview Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Venue Header */}
                    <div className="p-8 border-b">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
                                <p className="text-sm text-gray-600 mt-2">
                                    {venue.is_marketplace_approved ? (
                                        <span className="inline-flex items-center gap-1 text-green-700">
                                            <span className="text-green-600">✓</span> Approved for marketplace
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-blue-700">
                                            <span className="text-blue-600">⏳</span> Pending marketplace approval
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Preview Info */}
                    <div className="p-8 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Venue ID</h3>
                                <p className="text-sm text-gray-600 font-mono">{venue.venue_uuid}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Slug</h3>
                                <p className="text-sm text-gray-600 font-mono">{venue.slug}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Approval Status</h3>
                                <p className="text-sm">
                                    {venue.is_marketplace_approved ? (
                                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                            Approved
                                        </span>
                                    ) : (
                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                            Pending
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Preview Expires At</h3>
                                <p className="text-sm text-gray-600">
                                    {new Date(venue.preview_expires_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Preview Link Section */}
                    <div className="p-8">
                        <p className="text-sm text-gray-600 mb-4">
                            This preview link will expire in 10 minutes. Generate a new preview link from your admin panel to see the latest changes.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            View Marketplace
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
