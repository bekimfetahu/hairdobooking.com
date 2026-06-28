import PageShell from "@/components/layouts/PageShell";
import BlackButton from '@/components/ui/BlackButton';
import Image from "next/image";
import {
    Calendar,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    MapPin,
    Phone as PhoneIcon,
    Mail,
    Users,
    TrendingDown,
} from "lucide-react";
import React from "react";

// ----- Content data (adapted from lovable.dev ListYourSalon) -----
const bullets = [
    'No more switching between platforms',
    'No more double bookings',
    'No more messy schedules',
];

const benefits = [
    {
        title: 'One unified inbox',
        text: 'Bookings from marketplaces, Instagram, WhatsApp and your website land in a single calendar.',
    },
    {
        title: 'Smart conflict guard',
        text: 'Real-time sync blocks double bookings the moment a slot is taken — anywhere.',
    },
    {
        title: 'Built for busy salons',
        text: 'Staff schedules, services, deposits and reminders that actually save you time.',
    },
];


const tiers = [
    {
        name: 'Solo',
        users: '1 user',
        tagline: 'Perfect for independent stylists',
        monthly: 19,
        yearly: 15,
        features: ['Marketplace listing', 'Online bookings', 'SMS & email reminders', 'Calendar sync'],
    },
    {
        name: 'Studio',
        users: '2 – 5 users',
        tagline: 'Small teams finding their rhythm',
        monthly: 15,
        yearly: 12,
        features: [
            'Everything in Solo',
            'Staff schedules',
            'Social media sync',
            'Deposits & no-show protection',
        ],
        featured: true,
        badge: 'Most popular',
    },
    {
        name: 'Salon',
        users: '6 – 15 users',
        tagline: 'Growing salons with a full chair',
        monthly: 12,
        yearly: 9,
        features: [
            'Everything in Studio',
            'Multi-location',
            'Reports & insights',
            'Priority support',
        ],
    },
    {
        name: 'Enterprise',
        users: '16+ users',
        tagline: 'Chains & multi-brand groups',
        monthly: 9,
        yearly: 7,
        features: [
            'Everything in Salon',
            'Dedicated account manager',
            'Custom onboarding',
            'API & integrations',
        ],
        badge: 'Best value',
    },
];

export default function PartnerPage() {
    const billing = 'yearly'; // server-rendered default
    const accent = 'hsl(0, 80%, 50%)';

    return (
        <PageShell containerClassName="">
            {/* ===== HERO ===== */}
          {/* ===== HERO ===== */}
<section
    style={{
        background:
            'radial-gradient(circle at center, hsl(30, 30%, 99%) 0%, hsl(0, 30%, 97%) 40%, hsl(30, 25%, 98%) 70%, hsl(0, 20%, 96%) 100%)',
    }}
>
    <div
        className="
            relative max-w-6xl mx-auto px-3 pt-10 sm:pt-8 md:pt-10 lg:pt-12 xl:pt-16
            grid md:grid-cols-[1.4fr_1.1fr] gap-5
        "
    >
        {/* LEFT COLUMN */}
        <div className="relative z-20 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6 text-foreground">
                All Your Bookings.
                <br className="hidden md:block" />
                <span style={{ color: accent }}>One Simple System.</span>
                <span className="block w-24 h-1 rounded-full mt-4" style={{ background: accent }} />
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                Manage appointments from marketplaces, social media, and your own clients — all in one place, without the chaos.
            </p>

            <ul className="space-y-3 mb-10">
                {bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-foreground">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: accent }} />
                        <span className="text-base md:text-lg">{b}</span>
                    </li>
                ))}
            </ul>

            <div className="flex flex-wrap gap-3">
                <BlackButton className="rounded-full px-8 h-12 text-base">
                    Take Trial
                    <ArrowRight className="ml-2 w-4 h-4" />
                </BlackButton>

                <a
                    href="#plans"
                    className="inline-flex items-center gap-2 rounded-full px-8 h-12 text-base bg-white/90 backdrop-blur border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                    See Plans
                </a>
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="relative z-10 flex items-start justify-end">
            <Image
                src="/images/stylist.png"
                alt="HairdoBooking dashboard screenshot"
                width={369}
                height={500}
                className="h-auto max-w-none opacity-70"
                style={{ width: 'auto', height: 'auto' }}
            />
        </div>
    </div>
</section>

            {/* SCHEDULER */}
            <section
                className="relative w-full py-24 overflow-hidden"
style={{
  background: `
    linear-gradient(
      to bottom,
      hsl(0, 0%, 100%) 0%,      /* pure white */
      hsl(0, 54%, 98%) 25%,     /* very light tint */
      hsl(0, 30%, 97%) 50%,     /* soft fade */
      hsl(30, 25%, 98%) 75%,    /* pastel fade */
      hsl(0, 20%, 96%) 100%     /* soft bottom */
    )
  `,
}}


            >

                {/* TITLE SECTION */}
                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center mb-14">

                    <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
                        Everything you need,
                        <span
                            className="block"
                            style={{ color: accent }}   // your red accent from Hero
                        >
                            nothing you don’t
                        </span>
                    </h2>

                    <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                        Simple, flexible and powerful tools to run your salon — without the clutter.
                    </p>

                </div>





                {/* Image */}
                <div className="relative max-w-7xl mx-auto px-2 flex justify-center z-10">
                    <Image
                        src="/images/scheduler-app.png"
                        alt="Scheduler preview"
                        className="h-auto max-w-full"
                        width={1416}
                        height={678}
                    />
                </div>
            </section>


            {/* ===== BENEFITS ===== */}
            <section id="benefits" className="relative">
                <div className="bg-white py-20 md:py-28 -mx-4 sm:-mx-6">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                                Everything you need, nothing you don’t
                            </h2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                Built with salon owners to replace spreadsheets, sticky notes and five different apps.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {benefits.map((b) => (
                                <div key={b.title} className="p-8 rounded-2xl border border-border bg-white">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: 'hsl(0, 80%, 95%)' }}>
                                        <Calendar className="w-5 h-5" style={{ color: accent }} />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{b.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{b.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            {/* MARKETPLACE */}
            <section id="marketplace" className="mt-12 rounded-md border border-black/10 bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-semibold text-neutral-950">Bring in new clients — without losing your own</h3>
                <p className="mt-3 text-neutral-600">HairdoBooking includes a marketplace designed to help new clients discover your salon — without pushing your existing clients toward competitors.</p>

                <ul className="mt-4 space-y-2 text-neutral-700">
                    <li>• Attract new clients actively searching for services</li>
                    <li>• Your existing clients stay focused on your salon</li>
                    <li>• No competitor distraction after selection</li>
                </ul>
            </section>

            {/* FAIRNESS / RATINGS */}
            <section id="fairness" className="mt-8 rounded-md border border-black/5 bg-neutral-50 p-6">
                <h4 className="text-lg font-semibold text-neutral-900">A fairer experience for salon professionals</h4>
                <p className="mt-2 text-neutral-600">Public rating systems can often be inconsistent. HairdoBooking focuses on helping you build strong client relationships and a reliable business — instead of relying heavily on anonymous scores that don’t always reflect your work.</p>
            </section>

            {/* HOW IT WORKS */}
            <section id="how" className="mt-12">
                <h3 className="text-2xl font-semibold text-neutral-950">How it works</h3>
                <ol className="mt-4 space-y-4 text-neutral-700">
                    <li><strong>1. Set Up Your Salon</strong> — Add services, availability, and team.</li>
                    <li><strong>2. Keep Taking Bookings Anywhere</strong> — Marketplaces, social media, phone.</li>
                    <li><strong>3. Manage Everything in One Place</strong> — All bookings in one dashboard.</li>
                    <li><strong>4. Get Discovered by New Clients</strong> — Through our marketplace.</li>
                </ol>
            </section>

            {/* PRODUCT VISUALS */}
            <section id="visuals" className="mt-12 rounded-md border border-black/10 bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-semibold text-neutral-950">Product visuals</h3>
                <p className="mt-2 text-neutral-600">Screenshots: calendar, dashboard and booking interface.</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-md overflow-hidden bg-neutral-50">
                        <Image src="/images/screenshot-calendar.png" alt="Calendar" width={400} height={260} className="w-full h-auto" />
                    </div>
                    <div className="rounded-md overflow-hidden bg-neutral-50">
                        <Image src="/images/screenshot-dashboard.png" alt="Dashboard" width={400} height={260} className="w-full h-auto" />
                    </div>
                    <div className="rounded-md overflow-hidden bg-neutral-50">
                        <Image src="/images/screenshot-booking.png" alt="Booking interface" width={400} height={260} className="w-full h-auto" />
                    </div>
                </div>
            </section>

            {/* COMPARISON */}
            <section id="comparison" className="mt-12 rounded-md border border-black/10 bg-white p-8 shadow-sm">
                <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                        <h4 className="font-semibold text-neutral-900">Without HairdoBooking</h4>
                        <ul className="mt-3 space-y-2 text-neutral-700">
                            <li>• Multiple tools</li>
                            <li>• Manual tracking</li>
                            <li>• High risk of mistakes</li>
                            <li>• No central visibility</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-neutral-900">With HairdoBooking</h4>
                        <ul className="mt-3 space-y-2 text-neutral-700">
                            <li>• One system</li>
                            <li>• Clear overview</li>
                            <li>• Fewer errors</li>
                            <li>• Full control</li>
                        </ul>
                    </div>
                </div>

            </section>

            {/* ===== CTA ===== */}
            <section className="relative bg-white">
                <div className="-mx-4 sm:-mx-6 py-20 md:py-28">
                    <div className="max-w-3xl mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                            Bring order to your booking day
                        </h2>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            Try HairdoBooking free for 14 days and see every appointment in one calendar.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            <BlackButton className="rounded-full px-8 h-12 text-base">
                                Take Trial
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </BlackButton>
                            <a href="#plans" className="inline-flex items-center gap-2 rounded-full px-8 h-12 text-base bg-white border border-border text-muted-foreground hover:text-foreground transition-colors">
                                See Plans
                            </a>
                        </div>
                    </div>
                </div>

            </section>
        </PageShell>
    );
}
