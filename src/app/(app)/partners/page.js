import PageShell from "@/components/layouts/PageShell";
import BlackButton from '@/components/ui/BlackButton';
import Image from "next/image";
import Link from "next/link";
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
    Zap,
    Shield,
    Layers,
    MessageCircle,
    BarChart3,
    Clock,
    Heart,
    Smile,
    TrendingUp,
    XCircle,
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
                            <Link href="/partners/register">
                                <BlackButton className="rounded-full px-8 h-12 text-base">
                                    Take Trial
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </BlackButton>
                            </Link>

                            <Link
                                href="/pricing"
                                className="inline-flex items-center gap-2 rounded-full px-8 h-12 text-base bg-white/90 backdrop-blur border border-border text-muted-foreground hover:text-foreground transition-colors"
                            >
                                See Plans
                            </Link>
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
                className="relative w-full py-14 md:py-16 overflow-hidden"
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
                        height={710}
                    />
                </div>
            </section>

            {/* WHY HAIRDOBOOKING - FEATURES */}
            <section id="why-hairdobooking" className="mt-11 md:mt-14 py-11 md:py-14" style={{
                background: `linear-gradient(to bottom, hsl(0, 0%, 99%) 0%, hsl(0, 0%, 96%) 100%)`,
            }}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
                            Why choose HairdoBooking?
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Built exclusively for Hair & Beauty professionals. Simple, fast, and designed for how salons actually work.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'hsl(0, 80%, 95%)', color: accent }}>
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-3 text-foreground">Built for salons</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Designed exclusively for Hair & Beauty professionals—not restaurants or gyms. We know how salons actually work.</p>
                        </div>

                        <div className="p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'hsl(0, 80%, 95%)', color: accent }}>
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-3 text-foreground">Get started faster</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Common salon services are included by default. Select what you offer instead of creating everything from scratch.</p>
                        </div>

                        <div className="p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'hsl(0, 80%, 95%)', color: accent }}>
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-3 text-foreground">One central hub</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">All bookings—phone, social media, website, walk-ins—in one place. No more double bookings or missed appointments.</p>
                        </div>

                        <div className="p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'hsl(0, 80%, 95%)', color: accent }}>
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-3 text-foreground">Save time managing</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Less admin, fewer mistakes, and more time with clients. Your entire team has complete visibility.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== BENEFITS ===== */}
            <section id="benefits" className="relative">
                <div className="py-14 md:py-16 -mx-4 sm:-mx-6" style={{
                    background: `linear-gradient(to bottom, hsl(0, 0%, 99%) 0%, hsl(0, 0%, 97%) 100%)`,
                }}>
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                                Tools built for salon success
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
            <section id="marketplace" className="mt-11 md:mt-14 py-11 md:py-14" style={{
                background: `linear-gradient(to bottom, hsl(0, 0%, 99%) 0%, hsl(0, 0%, 96%) 100%)`,
            }}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
                            Bring in new clients
                            <span className="block" style={{ color: accent }}>without losing your own</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            HairdoBooking helps your salon reach new clients through our marketplace. Once a client selects your salon as their preferred salon, they'll be taken straight to your salon whenever they sign in—making repeat bookings faster and helping you build lasting client relationships instead of sending them back to browse competing salons.       </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'hsl(0, 80%, 95%)', color: accent }}>
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-3 text-foreground">Attract New Clients</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Reach clients actively searching for your services in the HairdoBooking marketplace.</p>
                        </div>

                        <div className="p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'hsl(0, 80%, 95%)', color: accent }}>
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-3 text-foreground">Keep Your Clients</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Your existing clients stay focused on your salon with no competitor distraction.</p>
                        </div>

                        <div className="p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'hsl(0, 80%, 95%)', color: accent }}>
                                <TrendingDown className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-3 text-foreground">Zero Competition</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">See your salon on the marketplace without rival salons cluttering the experience.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAIRNESS / RATINGS */}
            <section id="fairness" className="mt-11 md:mt-14 py-11 md:py-14" style={{
                background: `linear-gradient(to bottom, hsl(0, 0%, 99%) 0%, hsl(0, 0%, 96%) 100%)`,
            }}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
                            Your reputation shouldn't be
                            <span className="block" style={{ color: accent }}>decided by anonymous reviews</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            At HairdoBooking, we believe great salons deserve to be recognised for the relationships they build—not by anonymous ratings that can be misleading or unfair. Our platform helps you strengthen client loyalty, encourage repeat bookings, and grow your business without the pressure of public review scores that can negatively impact both your reputation and your team's wellbeing.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                        <div className="p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'hsl(0, 80%, 95%)', color: accent }}>
                                <XCircle className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-3 text-foreground">No anonymous ratings</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Build your reputation on verified client relationships, not questionable anonymous scores.</p>
                        </div>

                        <div className="p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'hsl(0, 80%, 95%)', color: accent }}>
                                <Heart className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-3 text-foreground">Stronger relationships</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Focus on building genuine, lasting connections with your clients that drive loyalty.</p>
                        </div>

                        <div className="p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'hsl(0, 80%, 95%)', color: accent }}>
                                <Smile className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-3 text-foreground">Happier team</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Remove the stress of public scores. Your team stays confident and focused on delivering great service.</p>
                        </div>

                        <div className="p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'hsl(0, 80%, 95%)', color: accent }}>
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-3 text-foreground">Growth via loyalty</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Grow your business through repeat bookings and strong client relationships, not review scores.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how" className="mt-11 md:mt-14 py-11 md:py-14" style={{
                background: `linear-gradient(to bottom, hsl(0, 0%, 99%) 0%, hsl(0, 0%, 96%) 100%)`,
            }}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">How it works</h2>
                        <p className="text-lg text-muted-foreground max-w-xl mx-auto">Get up and running in four simple steps</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { step: 1, title: 'Set Up Your Salon', desc: 'Add services, availability, and your team', icon: Calendar },
                            { step: 2, title: 'Take Bookings Anywhere', desc: 'Marketplaces, social media, phone', icon: MessageCircle },
                            { step: 3, title: 'Manage in One Place', desc: 'All bookings in one dashboard', icon: Layers },
                            { step: 4, title: 'Get Discovered', desc: 'New clients through our marketplace', icon: Sparkles },
                        ].map(({ step, title, desc, icon: Icon }) => (
                            <div key={step} className="relative">
                                <div className="h-full p-6 rounded-2xl border border-border/50 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-lg font-bold text-white" style={{ background: accent }}>
                                            {step}
                                        </div>
                                        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: accent }} />
                                    </div>
                                    <h3 className="font-semibold text-base mb-2 text-foreground">{title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                                </div>
                                {step < 4 && (
                                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5" style={{ background: accent, opacity: 0.3 }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </PageShell>
    );
}
