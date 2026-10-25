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
            eyebrow="Pricing"
            title={(
                <>
                    Pay only for <span className="text-primary">active professionals</span>
                </>
            )}
            description="Only professionals who take appointments count towards your subscription. Your salon pages in the marketplace are included at no extra cost, and there is no booking or appointment fee. We only pass through the standard Stripe processing fees for each transaction, which vary by location and payment method. Receptionists, managers, accountants and other administrative staff are included at no extra cost."
            actions={(
                <>
                    <Link href="/partners/register" className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
                        Start free trial <ArrowRight className="h-4 w-4" />
                    </Link>
                    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-neutral-600">
                        <BadgePercent className="h-4 w-4 text-black" />
                        Automatic team discounts as your professional team grows
                    </div>
                </>
            )}
        >
            <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="grid gap-4 md:grid-cols-1 lg:col-span-1">
                    <article className="max-w-md rounded-md border border-black/10 bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Everything Included</p>

                        <div className="mt-3 space-y-3 text-[15px] leading-7 text-neutral-700">
                            {includedFeatures.map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-2 rounded-md px-2 py-1">
                                    <Icon className="h-5 w-5 shrink-0 text-black" />
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>
                    </article>
                </div>

                <aside className="rounded-md border border-black/10 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-neutral-50 text-black">
                            <CalendarCheck2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-primary">Calculate your monthly price</p>
                            <p className="text-sm text-neutral-500">Only active professionals are billable</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-5 text-sm leading-7 text-neutral-600">
                        <p>Choose how many active professionals you need.</p>

                        <div className="space-y-4 rounded-md border border-black/10 bg-neutral-50 p-4">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 font-medium text-neutral-900">
                                    {numberOfUsers === 1 ? (
                                        <User className="h-4 w-4 text-black" />
                                    ) : (
                                        <Users2 className="h-4 w-4 text-black" />
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
                                max={100}
                                value={numberOfUsers}
                                onChange={(e) => setNumberOfUsers(Number(e.target.value))}
                                className="w-full accent-black"
                            />
                        </div>

                        <div className="rounded-md border border-black/10">
                            <PricingQuote
                                variant="calculator"
                                numberOfUsers={numberOfUsers}
                                billingFrequency="month"
                            />
                        </div>

                        <div className="pt-2 text-sm text-neutral-600">
                            We do not charge booking fee. Only Stripe processing fees apply per transaction.
                            <br />
                            See the <a href="https://stripe.com/pricing" target="_blank" rel="noreferrer" className="font-medium text-black underline underline-offset-2">Stripe pricing</a>.
                        </div>
                    </div>
                </aside>
            </section>
        </PageShell>
    );
}

