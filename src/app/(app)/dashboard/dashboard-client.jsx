'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import PageShell from '@/components/layouts/PageShell';
import { searchVenues } from '@/services/search/searchService';
import {
    ArrowRight,
    CalendarDays,
    Clock3,
    Heart,
    MapPin,
    Sparkles,
    Star,
} from 'lucide-react';

export default function DashboardClient({ initialUser }) {
    const user = useSelector((state) => state.auth.user) || initialUser;
    const displayName = user?.client?.first_name || user?.first_name || user?.name || 'there';

    const primaryVenue = user?.client?.primary_venue ?? user?.client?.primaryVenue ?? null;
    const savedVenues = useMemo(
        () => (Array.isArray(user?.client?.saved_venues) ? user.client.saved_venues : Array.isArray(user?.client?.savedVenues) ? user.client.savedVenues : []),
        [user]
    );
    const [upcomingAppointments, setUpcomingAppointments] = useState(
        Array.isArray(user?.appointments) ? user.appointments : []
    );
    const [nearbySuggestions, setNearbySuggestions] = useState([]);
    const [nearbyLoading, setNearbyLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadUpcomingAppointments = async () => {
            try {
                const response = await fetch('/api/appointments?scope=upcoming&page=1', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data?.message || 'Failed to load upcoming appointments');
                }

                const payload = await response.json();
                const items = Array.isArray(payload?.data) ? payload.data : [];

                if (!isMounted) return;
                setUpcomingAppointments(items.length ? items : (Array.isArray(user?.appointments) ? user.appointments : []));
            } catch (error) {
                if (!isMounted) return;
                setUpcomingAppointments(Array.isArray(user?.appointments) ? user.appointments : []);
            }
        };

        loadUpcomingAppointments();

        return () => {
            isMounted = false;
        };
    }, [user]);

    useEffect(() => {
        const lat = user?.client?.address?.latitude ?? user?.client?.latitude ?? null;
        const lon = user?.client?.address?.longitude ?? user?.client?.longitude ?? null;

        if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) {
            setNearbySuggestions([]);
            return;
        }

        let isMounted = true;
        const loadNearby = async () => {
            setNearbyLoading(true);
            try {
                const response = await searchVenues({ lat, lon, distance: '10mi', page: 1 });
                if (!isMounted) return;
                const list = Array.isArray(response?.data) ? response.data.slice(0, 3) : [];
                setNearbySuggestions(list.map((venue) => ({
                    name: venue?.venue?.name || venue?.name || 'Salon',
                    address: venue?.address?.formatted || venue?.address || 'Nearby salon',
                    slug: venue?.venue?.slug ? `/salon/${venue.venue.slug}` : '/salon/search',
                })));
            } catch (error) {
                if (!isMounted) return;
                setNearbySuggestions([]);
            } finally {
                if (isMounted) setNearbyLoading(false);
            }
        };

        loadNearby();

        return () => {
            isMounted = false;
        };
    }, [user]);

    const primaryVenueHref = primaryVenue?.slug ? `/salon/${primaryVenue.slug}` : '/salon/search';
    const savedVenueCards = savedVenues.slice(0, 3);
    const panelStats = [
        { label: 'Upcoming bookings', value: String(upcomingAppointments.length || 0), icon: CalendarDays },
        { label: 'Saved salons', value: String(savedVenues.length || 0), icon: Heart },
        { label: 'Nearby', value: nearbyLoading ? '…' : String(nearbySuggestions.length || 0), icon: MapPin },
    ];

    const formatAppointmentDate = (appointment) => {
        const dateValue = appointment?.date || appointment?.booking_date || appointment?.scheduled_for || appointment?.start_date || null;
        const timeValue = appointment?.time || appointment?.slot || appointment?.booking_time || appointment?.start_time || null;
        const rawDate = appointment?.from_time || appointment?.start_time || appointment?.datetime || appointment?.scheduled_at || appointment?.date_time || null;

        if (rawDate) {
            const parsed = new Date(rawDate);
            if (!Number.isNaN(parsed.getTime())) {
                return {
                    date: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed),
                    time: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(parsed),
                };
            }
        }

        return {
            date: dateValue ? String(dateValue) : 'Date to be confirmed',
            time: timeValue ? String(timeValue) : 'Time to be confirmed',
        };
    };

    return (
        <PageShell
            variant="dashboard"
            eyebrow="Client dashboard"
            title={<>Welcome back, {displayName}.</>}
            description="Your salon home is here. Keep bookings simple, revisit saved salons, and get back to your preferred salon faster."
        >
            <section className="mb-6 flex flex-wrap items-center gap-3">
                <Link
                    href={primaryVenueHref}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-primary/50 hover:bg-white"
                >
                    {primaryVenue ? 'Choose preferred salon' : 'Choose preferred salon'}
                    <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                    href="/my-appointments"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:border-black/20 hover:bg-neutral-50"
                >
                    My appointments
                </Link>
                <Link
                    href="/salon/search"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:border-black/20 hover:bg-neutral-50"
                >
                    Browse salons
                </Link>
                <Link
                    href="/search/service"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:border-black/20 hover:bg-neutral-50"
                >
                    Browse services
                </Link>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                {panelStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <article key={stat.label} className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-neutral-500">{stat.label}</p>
                                    <p className="mt-2 text-3xl font-semibold text-neutral-950">{stat.value}</p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-neutral-50 text-black">
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                        </article>
                    );
                })}
            </section>

            <section className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
                <article className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Upcoming</p>
                            <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Your next appointments</h2>
                        </div>
                        <Link href="/my-appointments" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-black">
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {upcomingAppointments.length ? (
                        <div className="mt-5 space-y-3">
                            {upcomingAppointments.slice(0, 3).map((appointment, index) => {
                                const formatted = formatAppointmentDate(appointment);

                                return (
                                    <div key={`${appointment?.id || appointment?.uuid || 'appt'}-${index}`} className="flex items-start justify-between gap-4 rounded-lg border border-black/10 bg-neutral-50 p-4">
                                        <div>
                                            <p className="font-medium text-neutral-950">{appointment?.venue?.name || appointment?.salon_name || 'Salon appointment'}</p>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
                                                <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" />{formatted.date}</span>
                                                <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" />{formatted.time}</span>
                                            </div>
                                        </div>
                                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                            {appointment?.status || 'Confirmed'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-5 rounded-lg border border-dashed border-black/15 bg-neutral-50 p-6 text-center">
                            <p className="text-base font-medium text-neutral-900">No upcoming bookings yet</p>
                            <p className="mt-2 text-sm text-neutral-600">Book your next visit and your appointments will appear here.</p>
                            <Link href="/salon/search" className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:border-primary/40 hover:text-primary">
                                Find a salon <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    )}
                </article>

            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-2">
                <article className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Saved</p>
                            <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Your saved salons</h2>
                        </div>
                        <Link href="/salon/search" className="text-sm font-medium text-neutral-700 hover:text-black">
                            Explore more
                        </Link>
                    </div>

                    {savedVenueCards.length ? (
                        <div className="mt-5 grid gap-3">
                            {savedVenueCards.map((salon, index) => (
                                <Link
                                    key={`${salon?.uuid || salon?.name || 'saved'}-${index}`}
                                    href={salon?.slug && salon.slug.startsWith('/salon/') ? salon.slug : '/salon/search'}
                                    className="flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-neutral-50 p-3 transition-colors hover:border-black/20 hover:bg-white"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-neutral-100 text-sm font-semibold text-neutral-900">
                                            {salon?.name?.charAt(0)?.toUpperCase() || 'S'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-neutral-950">{salon?.name || 'Saved salon'}</p>
                                            <p className="truncate text-sm text-neutral-600">{salon?.address || 'Saved salon'}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-neutral-500" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-5 rounded-lg border border-dashed border-black/15 bg-neutral-50 p-6 text-center">
                            <p className="text-base font-medium text-neutral-900">No saved salons yet</p>
                            <p className="mt-2 text-sm text-neutral-600">Save the salons you love and they will appear here.</p>
                            <Link href="/salon/search" className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:border-primary/40 hover:text-primary">
                                Explore salons <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    )}
                </article>

                <article className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Nearby</p>
                            <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Suggested salons near you</h2>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-primary">
                            <Sparkles className="h-3.5 w-3.5" />
                            Smart picks
                        </span>
                    </div>

                    {nearbySuggestions.length ? (
                        <div className="mt-5 grid gap-3">
                            {nearbySuggestions.slice(0, 3).map((salon, index) => (
                                <Link
                                    key={`${salon?.name || 'nearby'}-${index}`}
                                    href={salon?.slug || '/salon/search'}
                                    className="flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-neutral-50 p-3 transition-colors hover:border-black/20 hover:bg-white"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-neutral-100 text-sm font-semibold text-neutral-900">
                                            <Star className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-neutral-950">{salon?.name || 'Nearby salon'}</p>
                                            <p className="truncate text-sm text-neutral-600">{salon?.address || 'Near your location'}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-neutral-500" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-5 rounded-lg border border-dashed border-black/15 bg-neutral-50 p-6 text-center">
                            <p className="text-base font-medium text-neutral-900">No nearby salons yet</p>
                            <p className="mt-2 text-sm text-neutral-600">Add your address to see salons near you.</p>
                        </div>
                    )}
                </article>
            </section>
        </PageShell>
    );
}
