// src/laravelApp/dashboard/page.js
'use client';

import { useSelector } from 'react-redux';
import PageShell from '@/components/layouts/PageShell';
import { CalendarDays, Heart, MapPin, Sparkles } from 'lucide-react';

const quickStats = [
    { label: 'Upcoming bookings', value: '3', icon: CalendarDays },
    { label: 'Saved salons', value: '12', icon: Heart },
    { label: 'Nearby suggestions', value: '8', icon: MapPin },
];

const shortcuts = [
    { title: 'Browse salons', text: 'Find a new place for your next appointment.', icon: Sparkles },
    { title: 'View bookings', text: 'Check your upcoming visits and reminders.', icon: CalendarDays },
    { title: 'Saved favorites', text: 'Revisit the salons you like most.', icon: Heart },
];

export default function DashboardPage() {
    const user = useSelector((state) => state.auth.user);
    const displayName = user?.client?.first_name || user?.first_name || user?.name || 'there';

    return (
        <PageShell
            variant="dashboard"
            eyebrow="Client dashboard"
            title={<>Welcome back, {displayName}.</>}
            description="This is a structured dashboard placeholder for clients. Later this area can be connected to real booking, salon discovery, and favorites data."
        >
            <section className="grid gap-4 md:grid-cols-3">
                {quickStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <article key={stat.label} className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-neutral-500">{stat.label}</p>
                                    <p className="mt-2 text-3xl font-semibold text-neutral-950">{stat.value}</p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-50 text-black">
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                        </article>
                    );
                })}
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Next step</p>
                    <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Start exploring salons near you</h2>
                    <p className="mt-3 text-sm leading-7 text-neutral-600">
                        Once salon discovery is wired up, this card can surface recommended salons, offers, and recent bookings.
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {shortcuts.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.title} className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-5 w-5 text-black" />
                                        <p className="font-medium text-neutral-950">{item.title}</p>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-neutral-600">{item.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </article>

                <aside className="rounded-[1.5rem] border border-black/10 bg-black p-6 text-white shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Preview</p>
                    <h2 className="mt-2 text-2xl font-semibold">Your future booking timeline</h2>
                    <p className="mt-3 text-sm leading-7 text-white/75">
                        This space can later show appointments, reminders, and quick actions based on the logged-in client data.
                    </p>
                    <div className="mt-6 space-y-3">
                        {['Book a salon visit', 'See upcoming appointments', 'Manage favorites'].map((item) => (
                            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90">
                                {item}
                            </div>
                        ))}
                    </div>
                </aside>
            </section>
        </PageShell>
    );
}
