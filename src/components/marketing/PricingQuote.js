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
    const professionalLabel = `${numberOfUsers} active professional${numberOfUsers > 1 ? "s" : ""}`;

    if (variant === "starter") {
        return (
            <div className="mt-5 flex items-end gap-2">
                <span className="text-4xl font-semibold text-neutral-950">
                    {isReady ? `£${quote.pay_price}` : "£—"}
                </span>
                <span className="pb-1 text-sm text-neutral-500">
                    {isReady
                        ? `per ${frequencyLabel} • ${professionalLabel}`
                        : error
                            ? "Price unavailable"
                            : "Fetching live price…"}
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-4 rounded-md  bg-neutral-50 p-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-neutral-800">
                {isReady ? "Monthly subscription" : <span className="inline-block h-3 w-24 rounded bg-neutral-100" />}
            </p>

            <div className="flex items-end gap-3">
                <span className="text-4xl font-semibold tracking-[-0.04em] text-neutral-950">
                    {isReady ? `£${quote.pay_price}` : "£—"}
                </span>
                <span className="pb-1 text-sm font-medium text-neutral-600">
                    {isReady
                        ? `per ${frequencyLabel} • ${professionalLabel}`
                        : loading
                            ? "Calculating price…"
                            : error
                                ? "Price unavailable"
                                : "Set active professionals"}
                </span>
            </div>

            <div className="space-y-2 rounded-md border border-black/10 bg-white p-3 text-sm text-neutral-700">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-neutral-600">Base price</span>
                    <span className="font-medium text-neutral-900">{isReady ? `£${quote.base_price}` : "£—"}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-neutral-600">
                    <span>
                        Team discount
                    </span>
                    <span className="font-semibold">
                        {isReady ? `${quote.discount_percent}%` : "—"}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-neutral-600">
                    <span>You save</span>
                    <span className="font-semibold text-neutral-900">{isReady ? `£${quote.discount_amount}` : "£—"}</span>
                </div>
            </div>
        </div>
    );
}
