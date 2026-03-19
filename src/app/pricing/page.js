import Link from "next/link";
import PageShell from "@/components/layouts/PageShell";
import { ArrowRight, BadgePercent, CalendarClock, Users2 } from "lucide-react";

const plans = [
    {
        name: "Starter",
        description: "For solo pros and small salons getting started.",
        price: "$29",
        note: "per month",
        accent: "border-black/10",
        items: ["Online booking", "Client reminders", "Basic reports"],
    },
    {
        name: "Growth",
        description: "For teams that need more seats and better automation.",
        price: "$59",
        note: "per month",
        accent: "border-black",
        featured: true,
        items: ["All Starter features", "Team scheduling", "Priority support"],
    },
    {
        name: "Scale",
        description: "For multi-location businesses and higher usage.",
        price: "$99",
        note: "per month",
        accent: "border-black/10",
        items: ["Advanced analytics", "Multi-location", "Dedicated onboarding"],
    },
];

export default function PricingPage() {
    return (
        <PageShell
            variant="business"
            eyebrow="Pricing"
            title={<>Simple pricing that can grow with your team.</>}
            description="This is a placeholder pricing page for now. Later, the final price will be calculated from billing frequency, number of users, and applied discount rules through the API."
            actions={(
                <>
                    <Link href="/partners/register" className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
                        Start free trial <ArrowRight className="h-4 w-4" />
                    </Link>
                    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-neutral-600">
                        <BadgePercent className="h-4 w-4 text-black" />
                        Discounts will apply automatically later
                    </div>
                </>
            )}
        >
            <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="grid gap-4 md:grid-cols-3 lg:col-span-1">
                    {plans.map((plan) => (
                        <article
                            key={plan.name}
                            className={`rounded-[1.5rem] border bg-white p-6 shadow-sm ${plan.featured ? "border-black shadow-lg shadow-black/10" : plan.accent}`}
                        >
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{plan.name}</p>
                            <p className="mt-2 text-sm leading-7 text-neutral-600">{plan.description}</p>
                            <div className="mt-5 flex items-end gap-2">
                                <span className="text-4xl font-semibold text-neutral-950">{plan.price}</span>
                                <span className="pb-1 text-sm text-neutral-500">{plan.note}</span>
                            </div>
                            <ul className="mt-5 space-y-3 text-sm text-neutral-700">
                                {plan.items.map((item) => (
                                    <li key={item} className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-black" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>

                <aside className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-50 text-black">
                            <CalendarClock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-neutral-950">Coming soon</p>
                            <p className="text-sm text-neutral-500">Dynamic billing calculator</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4 text-sm leading-7 text-neutral-600">
                        <p>
                            The final pricing engine will use the selected billing frequency, seat count, and future discount rules from the API.
                        </p>
                        <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                            <p className="font-medium text-neutral-900">Planned inputs</p>
                            <ul className="mt-3 space-y-2">
                                <li className="flex items-center gap-2"><Users2 className="h-4 w-4 text-black" /> Number of users</li>
                                <li className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-black" /> Monthly or yearly billing</li>
                                <li className="flex items-center gap-2"><BadgePercent className="h-4 w-4 text-black" /> Discount tiers</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </section>
        </PageShell>
    );
}

