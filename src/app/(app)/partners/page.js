import PageShell from "@/components/layouts/PageShell";
import Image from "next/image";
import Link from "next/link";
import Hero from '@/components/Hero';
import { CalendarDays, MapPin, Sparkles, Users } from "lucide-react";
import ImageSlider from '@/components/ui/ImageSlider';

export default function PartnerPage() {
    return (
        <PageShell variant="business">
            <div className="mx-auto max-w-6xl">

                <Hero />

                {/* Product showcase section with subtle background to highlight container border */}
                <div className="mt-10 rounded-[1.25rem] border border-black/10 bg-neutral-50/80 px-4 py-8 sm:px-6">
                    <div className="mx-auto max-w-6xl">
                        {/* Left column text above the slider (full width) */}
                        <div className="mb-6 text-center sm:text-left">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Product showcase</p>
                            <h2 className="mt-2 text-3xl font-semibold text-neutral-950">Beautiful timelines, built for salons</h2>

                            <p className="mt-4 text-base text-neutral-600">
                                See your day at a glance — a single, clean timeline that brings in walk-ins, online bookings and partner appointments.
                                Colour-coded statuses help your team scan the day quickly. One-click edits, quick block tools and clear labels keep your calendar accurate
                                and your team in control. Designed for Hair & Beauty salons and Barbers who need speed, clarity and reliability.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-4 justify-center sm:justify-end">
                                <Link href="/partners/register" className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800">
                                    Start free
                                </Link>
                                <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-neutral-700 hover:border-black hover:text-black">
                                    See plans
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Slider card */}
                    <div className="mt-6 mx-auto max-w-full">
                        <div className="bg-white shadow-lg">
                             <img
                                src="/images/appointments.png"
                                alt="Hairdresser using tablet to book an appointment"
                                className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* CENTRAL CONTROL / MULTI-PLATFORM */}
                <section id="control" className="mt-12 rounded-[1.25rem] border border-black/10 bg-white p-8 shadow-sm">
                    <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">All your bookings</p>
                            <h3 className="mt-2 text-2xl font-semibold text-neutral-950">One calendar. Total clarity.</h3>
                            <p className="mt-4 text-base text-neutral-600">
                                One calendar, total clarity. Bring bookings from every source into a single place so your team can
                                operate with confidence — no confusion, no double-bookings.
                            </p>

                            <ul className="mt-6 space-y-3 text-sm text-neutral-700">
                                <li>• Mixed bookings (online, phone & partner platforms) in one view</li>
                                <li>• Clear labels so staff know where a booking came from</li>
                                <li>• Quick block & edit tools that keep your calendar accurate</li>
                            </ul>
                        </div>

                        <div className="flex items-center justify-center">
                            <div className="rounded-2xl border border-black/5 bg-neutral-50 p-4">
                                <Image src="/hero-booking.jpg" alt="Central calendar" width={720} height={420} className="w-[480px] max-w-full h-auto rounded" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* WHY HAIRDObooking */}
                <section id="why" className="mt-12">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="rounded-[1rem] border border-black/10 bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Why HairdoBooking</p>
                            <h4 className="mt-3 text-lg font-semibold text-neutral-950">A platform made for salons — not a one-size-fits-all marketplace</h4>
                            <p className="mt-3 text-sm text-neutral-600">We focus on salon workflows, not generic growth metrics. That means fewer distractions and more time for clients.</p>
                        </div>

                        <div className="rounded-[1rem] border border-black/10 bg-white p-6 shadow-sm">
                            <h4 className="text-lg font-semibold text-neutral-950">No public star ratings</h4>
                            <p className="mt-3 text-sm text-neutral-600">We don’t surface negative public ratings. Your salon is presented professionally — we promote the positive and let your service speak for itself.</p>
                        </div>

                        <div className="rounded-[1rem] border border-black/10 bg-white p-6 shadow-sm">
                            <h4 className="text-lg font-semibold text-neutral-950">Keep what you earn</h4>
                            <p className="mt-3 text-sm text-neutral-600">No marketplace commission — owners receive payments directly via Stripe. (Stripe card fees apply; see Stripe for details).</p>
                        </div>
                    </div>
                </section>

                {/* CORE BENEFITS */}
                <section id="benefits" className="mt-12">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Core benefits</p>
                        <h3 className="mt-2 text-2xl font-semibold text-neutral-950">Built to run your salon with confidence</h3>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <article className="rounded-[1rem] border border-black/10 bg-white p-6 text-center shadow-sm">
                            <CalendarDays className="mx-auto h-6 w-6 text-black" />
                            <h5 className="mt-4 font-semibold">Effortless scheduling</h5>
                            <p className="mt-2 text-sm text-neutral-600">A clean timeline that your team learns in minutes — colour-coded and easy to scan.</p>
                        </article>

                        <article className="rounded-[1rem] border border-black/10 bg-white p-6 text-center shadow-sm">
                            <MapPin className="mx-auto h-6 w-6 text-black" />
                            <h5 className="mt-4 font-semibold">Business control</h5>
                            <p className="mt-2 text-sm text-neutral-600">Central tools for staff, locations and inventory — everything where you expect it.</p>
                        </article>

                        <article className="rounded-[1rem] border border-black/10 bg-white p-6 text-center shadow-sm">
                            <Sparkles className="mx-auto h-6 w-6 text-black" />
                            <h5 className="mt-4 font-semibold">Professional client experience</h5>
                            <p className="mt-2 text-sm text-neutral-600">A polished booking experience that feels like your salon — fast, clear and reliable.</p>
                        </article>

                        <article className="rounded-[1rem] border border-black/10 bg-white p-6 text-center shadow-sm">
                            <Users className="mx-auto h-6 w-6 text-black" />
                            <h5 className="mt-4 font-semibold">Built for growth</h5>
                            <p className="mt-2 text-sm text-neutral-600">From one chair to many locations — scale seamlessly without swapping tools.</p>
                        </article>
                    </div>
                </section>

                {/* SIMPLICITY */}
                <section id="simplicity" className="mt-12 rounded-[1rem] border border-black/10 bg-black px-6 py-8 text-white sm:px-8">
                    <div className="grid gap-4 lg:grid-cols-2 lg:items-center">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Simplicity</p>
                            <h3 className="mt-2 text-2xl font-semibold">No learning curve. Just work.</h3>
                            <p className="mt-4 text-neutral-200">Designed for busy salon teams — fast onboarding, intuitive controls and helpful defaults so you can focus on clients.</p>
                        </div>
                        <div className="flex items-center justify-end">
                            <Link href="/partners/register" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black hover:bg-neutral-200">
                                Try it free
                            </Link>
                        </div>
                    </div>
                </section>

                {/* PRICING MESSAGE */}
                <section id="pricing" className="mt-12">
                    <div className="rounded-[1rem] border border-black/10 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Pricing</p>
                                <h3 className="mt-2 text-2xl font-semibold text-neutral-950">Transparent plans that scale with you</h3>
                                <p className="mt-3 text-sm text-neutral-600">Choose the number of users and billing frequency — discounts apply automatically. No hidden fees, no marketplace commissions.</p>
                            </div>
                            <div className="text-right">
                                <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-medium hover:border-black hover:text-black">See pricing</Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section id="final-cta" className="mt-12 rounded-[1.25rem] border border-black/10 bg-white p-8 text-center shadow-xl">
                    <h3 className="text-2xl font-semibold text-neutral-950">Bring a cleaner booking experience to your clients.</h3>
                    <p className="mt-3 text-sm text-neutral-600">Free to start. No hidden costs. Keep your revenue.</p>

                    <div className="mt-6 flex items-center justify-center gap-4">
                        <Link href="/partners/register" className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-medium text-white hover:bg-neutral-800">Start free — no card</Link>
                        <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3.5 text-sm font-medium text-neutral-700 hover:border-black hover:text-black">See plans & discounts</Link>
                    </div>
                </section>
            </div>
        </PageShell>
    );
}
