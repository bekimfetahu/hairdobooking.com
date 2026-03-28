import React, { Suspense } from "react";
import PageShell from "@/components/layouts/PageShell";
import SearchClient from "./SearchClient";

export default function SearchPage() {
    return (
        <PageShell
            variant="marketing"
            eyebrow="Find salons near you"
            title="Discover salons and beauty services near you"
            description="Search by salon name, address or postcode, then pick your preferred location from the list or directly from the map."
            contentClassName="mt-6"
        >
            <Suspense fallback={<div>Loading search…</div>}>
                <SearchClient />
            </Suspense>
        </PageShell>
    );
}
