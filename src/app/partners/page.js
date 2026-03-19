import PageShell from "@/components/layouts/PageShell";
import Image from "next/image";
import Link from "next/link";
import Title from "@/components/typography/Title";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, CalendarDays, CreditCard, MapPin, Sparkles, Users } from "lucide-react";

const features = [
    {
        icon: CalendarDays,
        title: "Always-on booking",
        text: "Let clients book 24/7 from any device with a smooth, branded experience.",
    },
    {
        icon: CreditCard,
        title: "No commission fees",
        text: "Keep your revenue. Simple pricing, no hidden charges, no surprises.",
    },
    {
        icon: Users,
        title: "Team friendly",
        text: "Manage multiple staff members, services, and schedules from one place.",
    },
    {
        icon: MapPin,
        title: "Multi-location ready",
        text: "Scale from a single chair to multiple locations without changing tools.",
    },
    {
        icon: Sparkles,
        title: "Premium client flow",
        text: "A clean, modern booking journey that feels polished on mobile and desktop.",
    },
    {
        icon: CheckCircle2,
        title: "Free to try",
        text: "Start with confidence and move at your own pace — no credit card required.",
    },
];

export default function PartnerPage() {
    return (
        <PageShell variant="business" className="py-8 sm:py-10">
            <div className="mx-auto max-w-6xl">
                <section className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-2xl shadow-black/5">
                    <div className="grid lg:grid-cols-2">
                        <div className="p-8 sm:p-10 lg:p-12">
                            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700">
                                <BriefcaseBusiness className="h-4 w-4 text-black" />
                                Built for salons and barbers
                            </div>

                            <Title className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-neutral-950 md:text-5xl">
                                A booking platform that feels <span className="text-primary">premium</span>, fast, and easy to use.
                            </Title>

                            <p className="mt-6 max-w-xl text-base leading-8 text-neutral-600 md:text-lg">
                                HairdoBooking helps you take bookings, manage staff, and keep clients coming back —
                                all with a clean brand experience that matches the quality of your business.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Link
                                    href="/partners/register"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                                >
                                    Start your free trial
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3.5 text-sm font-medium text-neutral-700 transition-colors hover:border-black hover:text-black"
                                >
                                    View pricing
                                </Link>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3 text-sm text-neutral-600">
                                {[
                                    "24/7 online booking",
                                    "No commission fees",
                                    "Built for growth",
                                ].map((item) => (
                                    <span key={item} className="rounded-full border border-black/10 bg-neutral-50 px-4 py-2">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="relative flex items-center justify-center bg-[linear-gradient(180deg,#fffaf9_0%,#ffffff_100%)] p-8 sm:p-10 lg:p-12">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(208,0,0,0.10),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(17,17,17,0.06),transparent_35%)]" />
                            <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-xl shadow-black/10">
                                <div className="border-b border-black/5 px-6 py-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Partner preview</p>
                                    <p className="mt-1 text-lg font-semibold text-neutral-950">A modern booking experience</p>
                                </div>
                                <div className="p-4">
                                    <Image
                                        src="/model.png"
                                        alt="Hair salon model"
                                        width={800}
                                        height={900}
                                        className="h-auto w-full rounded-[1.5rem] object-cover object-center"
                                        priority
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="mt-10">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Why partners choose us</p>
                            <h2 className="mt-2 text-2xl font-semibold text-neutral-950 md:text-3xl">Everything designed to help your business grow</h2>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <article key={feature.title} className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-50 text-black">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-neutral-950">{feature.title}</h3>
                                    <p className="mt-2 text-sm leading-7 text-neutral-600">{feature.text}</p>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-10 rounded-[1.75rem] border border-black/10 bg-black px-6 py-8 text-white sm:px-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Ready to grow?</p>
                            <h2 className="mt-2 text-2xl font-semibold">Bring a cleaner booking experience to your clients.</h2>
                        </div>
                        <Link
                            href="/partners/register"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
                        >
                            Start your free trial
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            </div>
        </PageShell>
    );
}
