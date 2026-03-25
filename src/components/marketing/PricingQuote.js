"use client";

import { useEffect, useState } from "react";
import { BadgePercent } from "lucide-react";

export default function PricingQuote({ numberOfUsers, billingFrequency, variant }) {
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isReady = !loading && !error && !!quote;

    useEffect(() => {
        let active = true;

        async function fetchQuote() {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams({
                    number_of_users: String(numberOfUsers),
                    billing_frequency: billingFrequency,
                });

                const res = await fetch(`/api/pricing/quote?${params.toString()}`);
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.message || "Failed to fetch pricing");
                }

                const data = await res.json();
                if (!active) return;
                setQuote(data.plan_price_option ?? null);
            } catch (e) {
                if (!active) return;
                setError(e.message);
                setQuote(null);
            } finally {
                if (!active) return;
                setLoading(false);
            }
        }

        fetchQuote();

        return () => {
            active = false;
        };
    }, [numberOfUsers, billingFrequency]);

    const frequencyLabel = billingFrequency === "month" ? "month" : "year";

    if (variant === "starter") {
        return (
            <div className="mt-5 flex items-end gap-2">
                <span className="text-4xl font-semibold text-neutral-950">
                    {isReady ? `£${quote.pay_price}` : "£—"}
                </span>
                <span className="pb-1 text-sm text-neutral-500">
                    {isReady
                        ? `per ${frequencyLabel} (1 user)`
                        : error
                            ? "Price unavailable"
                            : "Fetching live price…"}
                </span>
            </div>
        );
    }

    // Default: calculator / detailed variant
    return (
        <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {isReady ? (
                    quote.plan?.name ?? "Current plan"
                ) : (
                    <span className="inline-block h-3 w-24 rounded bg-neutral-100" />
                )}
            </p>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-semibold text-neutral-950">
                    {isReady ? `£${quote.pay_price}` : "£—"}
                </span>
                <span className="pb-1 text-xs text-neutral-500">
                    {isReady
                        ? `per ${frequencyLabel} (incl. VAT)`
                        : loading
                            ? "Calculating price…"
                            : error
                                ? "Price unavailable"
                                : "Set team size & billing"}
                </span>
            </div>
            <ul className="space-y-1 text-xs text-neutral-600">
                <li>
                    Base price: {isReady ? (
                        <>£{quote.base_price}</>
                    ) : (
                        <span className="inline-block h-3 w-20 rounded bg-neutral-100" />
                    )}
                </li>
                <li className="flex items-center gap-1">
                    <BadgePercent className="h-3 w-3 text-black" />
                    {isReady ? (
                        <>Discount: {quote.discount_percent}% (−£{quote.discount_amount})</>
                    ) : (
                        <span className="inline-block h-3 w-28 rounded bg-neutral-100" />
                    )}
                </li>
            </ul>
        </div>
    );
}
