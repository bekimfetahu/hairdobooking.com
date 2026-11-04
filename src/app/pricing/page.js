"use client";

import { useState } from "react";
import Link from "next/link";
import PageShell from "@/components/layouts/PageShell";
import {
    ArrowRight,
    BadgePercent,
    BellRing,
    BriefcaseBusiness,
    Building2,
    CalendarCheck2,
    ChartColumnIncreasing,
    ClipboardList,
    User,
    Users2,
} from "lucide-react";
import PricingQuote from "@/components/marketing/PricingQuote";

const includedFeatures = [
    { icon: CalendarCheck2, label: "Appointment scheduling & calendar management" },
    { icon: ClipboardList, label: "Client management & appointment history" },
    { icon: Building2, label: "Your own salon pages in the marketplace included" },
    { icon: CalendarCheck2, label: "Working hours, holidays & availability" },
    { icon: BellRing, label: "Email notifications included" },
    { icon: BadgePercent, label: "Optional SMS reminder packages" },
    { icon: ChartColumnIncreasing, label: "Reports & business insights" },
    { icon: CalendarCheck2, label: "No booking fee — only Stripe transaction fees apply" },
];

export default function PricingPage() {
    const [numberOfUsers, setNumberOfUsers] = useState(1);

    return (
        <PageShell
            variant="business"
            customHeader
            customHeaderContent={(
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                    <div className="space-y-5 pt-2">
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Pricing</p>

                        <h1 className="font-semibold max-w-xl text-4xl tracking-[-0.06em] text-neutral-950 md:text-5xl xl:text-[3.25rem]">
                            Pay only for <span className="text-primary">active professionals</span>
                        </h1>

                        <p className="max-w-xl text-base leading-8 text-neutral-600 md:text-lg">
                            Only professionals who take appointments count towards your subscription. Your salon pages in the marketplace are included at no extra cost, and there is no booking or appointment fee. We only pass through the standard Stripe processing fees for each transaction, which vary by location and payment method. Receptionists, managers, accountants and other administrative staff are included at no extra cost.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-24">
                            <Link href="/partners/register" className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
                                Start free trial <ArrowRight className="h-4 w-4" />
                            </Link>
                            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-neutral-600">
                                <BadgePercent className="h-4 w-4 text-black" />
                                Automatic team discounts as your professional team grows
                            </div>
                        </div>
                    </div>

                    <aside className="rounded-[24px] border border-black/10 bg-white p-6 shadow-[0_16px_40px_rgba(17,17,17,0.06)]">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-50 text-black">
                                <CalendarCheck2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-primary">Calculate your monthly price</p>
                                <p className="text-sm text-neutral-500">Only active professionals are billable</p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-5 text-sm leading-7 text-neutral-600">
                            <p>Choose how many active professionals you need.</p>

                            <div className="space-y-4 rounded-xl border border-black/10 bg-neutral-50 p-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-medium text-neutral-900">
                                        {numberOfUsers === 1 ? (
                                            <User className="h-4 w-4 text-primary" />
                                        ) : (
                                            <Users2 className="h-4 w-4 text-primary" />
                                        )}
                                        <span>{numberOfUsers === 1 ? "Individual" : "Team"}</span>
                                    </div>
                                    <span className="font-semibold text-neutral-900">
                                        {numberOfUsers} {numberOfUsers === 1 ? "professional" : "professionals"}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={50}
                                    value={numberOfUsers}
                                    onChange={(e) => setNumberOfUsers(Number(e.target.value))}
                                    className="h-2 w-full cursor-pointer accent-primary"
                                />
                            </div>

                            <div className="rounded-xl border border-black/10">
                                <PricingQuote
                                    variant="calculator"
                                    numberOfUsers={numberOfUsers}
                                    billingFrequency="month"
                                />
                            </div>

                        </div>
                    </aside>
                </div>
            )}
        >
            <section className="mt-10">
                <article className="rounded-[24px] border border-black/10 bg-white p-6 shadow-[0_16px_40px_rgba(17,17,17,0.04)]">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-50 text-black">
                            <BriefcaseBusiness className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Everything Included</p>
                            <p className="text-lg font-semibold text-neutral-900">Simple pricing for a growing salon</p>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        {includedFeatures.map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-3 rounded-xl border border-black/5 bg-neutral-50 px-3 py-3">
                                <Icon className="h-5 w-5 shrink-0 text-primary" />
                                <span className="text-[15px] leading-6 text-neutral-700">{label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 border-t border-black/5 pt-4 text-sm text-neutral-600">
                        We do not charge booking fee. Only Stripe processing fees apply per transaction.
                        <br />
                        See the <a href="https://stripe.com/pricing" target="_blank" rel="noreferrer" className="font-medium text-black underline underline-offset-2">Stripe pricing</a>.
                    </div>
                </article>
            </section>
        </PageShell>
    );
}

