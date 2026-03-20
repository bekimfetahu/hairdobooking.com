'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, MapPin, Search, X } from 'lucide-react';
import { fetchPrimarySalonLocations } from '@/services/auth/primarySalon';

const formatAddress = (venue) => {
    const parts = [
        venue?.building_name,
        venue?.street,
        venue?.town,
        venue?.city,
        venue?.postcode,
    ].filter(Boolean);

    return parts.join(', ');
};

export default function PrimarySalonPickerModal({
    open,
    onClose,
    currentVenueUuid,
    currentVenueLabel,
    onSelect,
}) {
    const [query, setQuery] = useState('');
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [savingVenueId, setSavingVenueId] = useState('');
    const [error, setError] = useState('');

    const selectedCount = useMemo(() => salons.length, [salons]);

    useEffect(() => {
        if (!open) {
            setQuery('');
            setSalons([]);
            setLoading(false);
            setSavingVenueId('');
            setError('');
            return;
        }

        const body = document.body;
        const previousOverflow = body.style.overflow;
        body.style.overflow = 'hidden';

        return () => {
            body.style.overflow = previousOverflow;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setLoading(true);
            setError('');

            try {
                const { items } = await fetchPrimarySalonLocations({
                    search: query.trim(),
                    perPage: 20,
                    page: 1,
                    signal: controller.signal,
                });
                setSalons(items);
            } catch (err) {
                if (err?.name !== 'AbortError') {
                    setError(err?.message || 'Failed to load salons');
                    setSalons([]);
                }
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [open, query]);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose?.();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    const handleSelect = async (venue) => {
        if (!venue?.uuid || savingVenueId === venue.uuid) {
            return;
        }

        setSavingVenueId(venue.uuid);
        try {
            await onSelect(venue);
            onClose?.();
        } catch (err) {
            setError(err?.message || 'Failed to update primary salon');
        } finally {
            setSavingVenueId('');
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 px-4 py-6 pt-20 backdrop-blur-sm sm:py-8 sm:pt-24 lg:pt-28"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose?.();
                }
            }}
        >
            <div className="flex max-h-[calc(100vh-8rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl sm:max-h-[calc(100vh-9rem)]">
                <div className="border-b border-black/10 px-5 py-5 sm:px-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Primary salon</p>
                            <h2 className="mt-2 text-2xl font-semibold text-neutral-950 sm:text-3xl">Search and choose your salon</h2>
                            <p className="mt-2 text-sm leading-7 text-neutral-600">
                                Pick the salon you want as your default for services and bookings. Changing this keeps your existing salon associations.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-neutral-700 transition-colors hover:border-black hover:text-black"
                            aria-label="Close primary salon selector"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                        <label className="block">
                            <span className="sr-only">Search salons</span>
                            <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3">
                                <Search className="h-4 w-4 text-neutral-500" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search by salon name, city, postcode, or street"
                                    className="w-full bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                                />
                            </div>
                        </label>

                        <div className="rounded-2xl border border-black/10 bg-black px-4 py-3 text-white">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Current primary salon</p>
                            <p className="mt-1 text-sm font-semibold">{currentVenueLabel || 'No primary salon set'}</p>
                            <p className="mt-1 text-xs text-white/70">Use the selector below to change it whenever you need.</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                    {error && (
                        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="mb-4 flex items-center justify-between gap-3 text-sm text-neutral-500">
                        <p>{loading ? 'Searching salons...' : `${selectedCount} salon${selectedCount === 1 ? '' : 's'} found`}</p>
                        <p>Address details are shown to help you choose the right location.</p>
                    </div>

                    <div className="grid gap-3">
                        {loading ? (
                            <div className="rounded-3xl border border-black/10 bg-neutral-50 p-6 text-sm text-neutral-500">
                                Loading salons...
                            </div>
                        ) : salons.length > 0 ? (
                            salons.map((venue) => {
                                const isCurrent = venue?.uuid === currentVenueUuid;
                                const address = formatAddress(venue);

                                return (
                                    <button
                                        key={venue.uuid}
                                        type="button"
                                        onClick={() => handleSelect(venue)}
                                        disabled={savingVenueId === venue.uuid}
                                        className={`flex w-full flex-col gap-2 rounded-[1.25rem] border px-3.5 py-3 text-left transition-colors sm:flex-row sm:items-start sm:justify-between sm:px-4 sm:py-3.5 ${isCurrent ? 'border-black bg-neutral-50' : 'border-black/10 bg-white hover:border-black hover:bg-neutral-50'}`}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                <MapPin className="h-4 w-4 shrink-0 text-black" />
                                                <p className="truncate text-sm font-semibold text-neutral-950 sm:text-base">{venue.name}</p>
                                                {isCurrent && <Check className="h-4 w-4 shrink-0 text-black" />}
                                            </div>

                                            <p className="mt-1 text-xs leading-5 text-neutral-600 sm:text-sm">
                                                <span className="font-medium text-neutral-900">{venue.company?.company_name || 'Salon'}</span>
                                                {address ? <span className="text-neutral-500"> · {address}</span> : <span className="text-neutral-500"> · Address not available</span>}
                                            </p>
                                        </div>

                                        <div className="shrink-0 text-xs font-medium text-neutral-500 sm:text-sm">
                                            {savingVenueId === venue.uuid ? 'Saving...' : isCurrent ? 'Current primary' : 'Set primary'}
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="rounded-3xl border border-dashed border-black/15 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
                                No salons found. Try a different name, city, or postcode.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
