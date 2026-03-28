"use client";

import { useState } from "react";
import Link from "next/link";
import PageShell from "@/components/layouts/PageShell";
import { ArrowRight, BadgePercent, CalendarClock, Users2 } from "lucide-react";
import PricingQuote from "@/components/marketing/PricingQuote";

export default function PricingPage() {
    // Starter card (1-user) pricing
    const [starterBillingFrequency, setStarterBillingFrequency] = useState("month");

    // Calculator pricing
    const [numberOfUsers, setNumberOfUsers] = useState(3);
    const [billingFrequency, setBillingFrequency] = useState("month");

    return (
        <PageShell
            variant="business"
            eyebrow="Pricing"
            title={(
                <>
                    <span className="text-primary">Simple</span>, per-user pricing.
                </>
            )}
            description="Pay per team member, monthly or yearly, and run as many salons as you like on one account. Every subscription includes the same features for everyone, with VAT included and optional SMS add-ons billed separately. No long-term contracts—cancel anytime, or pause your account for up to 6 months so you don’t pay while you’re not using it."
            actions={(
                <>
                    <Link href="/partners/register" className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
                        Start free trial <ArrowRight className="h-4 w-4" />
                    </Link>
                    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-neutral-600">
                        <BadgePercent className="h-4 w-4 text-black" />
                        Automatic discounts based on team size and billing—no extra steps.
                    </div>
                </>
            )}
        >
            <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="grid gap-4 md:grid-cols-1 lg:col-span-1">
                    <article className="max-w-md rounded-[1.5rem] border border-black bg-white p-6 shadow-lg shadow-black/10">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Starter</p>
                        <p className="mt-2 text-sm leading-7 text-neutral-600">
                            For solo pros and small salons getting started. Pricing below is for 1 active staff member 
                            – you&apos;ll get better value when you add more users on the right.
                        </p>

                        <div className="mt-4 inline-flex rounded-full border border-black/10 bg-neutral-50 p-1 text-xs font-medium">
                            <button
                                type="button"
                                onClick={() => setStarterBillingFrequency("month")}
                                className={`px-3 py-1 rounded-full ${
                                    starterBillingFrequency === "month"
                                        ? "bg-black text-white"
                                        : "text-neutral-700"
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                type="button"
                                onClick={() => setStarterBillingFrequency("year")}
                                className={`px-3 py-1 rounded-full ${
                                    starterBillingFrequency === "year"
                                        ? "bg-black text-white"
                                        : "text-neutral-700"
                                }`}
                            >
                                Yearly
                            </button>
                        </div>

                        <PricingQuote
                            variant="starter"
                            numberOfUsers={1}
                            billingFrequency={starterBillingFrequency}
                        />

                        <ul className="mt-5 space-y-3 text-sm text-neutral-700">
                            <li className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-black" />
                                Online booking
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-black" />
                                Client reminders
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-black" />
                                Basic reports
                            </li>
                        </ul>
                    </article>
                </div>

                <aside className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-50 text-black">
                            <CalendarClock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-primary">Estimate your subscription</p>
                            <p className="text-sm text-neutral-500">Live quote from the HairdoBooking billing engine</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-5 text-sm leading-7 text-neutral-600">
                        <p>
                            Choose how many professional staff seats you need and whether you want to pay Monthly or Yearly. Prices come directly from the backend pricing rules.
                        </p>

                        <div className="space-y-4 rounded-2xl border border-black/10 bg-neutral-50 p-4">
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 font-medium text-neutral-900">
                                    <Users2 className="h-4 w-4 text-black" />
                                    Team size
                                </label>
                                <span className="text-neutral-700">{numberOfUsers} user{numberOfUsers > 1 ? "s" : ""}</span>
                            </div>
                            <input
                                type="range"
                                min={1}
                                max={20}
                                value={numberOfUsers}
                                onChange={(e) => setNumberOfUsers(Number(e.target.value))}
                                className="w-full accent-black"
                            />

                            <div className="flex items-center justify-between gap-2 text-sm">
                                <span className="font-medium text-neutral-900">Billing frequency</span>
                                <div className="inline-flex rounded-full border border-black/10 bg-white p-1 text-xs font-medium">
                                    <button
                                        type="button"
                                        onClick={() => setBillingFrequency("month")}
                                        className={`px-3 py-1 rounded-full ${
                                            billingFrequency === "month"
                                                ? "bg-black text-white"
                                                : "text-neutral-700"
                                        }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBillingFrequency("year")}
                                        className={`px-3 py-1 rounded-full ${
                                            billingFrequency === "year"
                                                ? "bg-black text-white"
                                                : "text-neutral-700"
                                        }`}
                                    >
                                        Yearly
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-black/10 bg-white p-4">
                            <PricingQuote
                                variant="calculator"
                                numberOfUsers={numberOfUsers}
                                billingFrequency={billingFrequency}
                            />
                        </div>
                    </div>
                </aside>
            </section>
        </PageShell>
    );
}

