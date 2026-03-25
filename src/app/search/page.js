"use client";

import { useSearchParams } from "next/navigation";

import PageShell from "@/components/layouts/PageShell";
import PreferredSalonSearch from "@/components/PreferredSalonSearch";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const initialService = searchParams.get("service") || "";
    const initialLocation = searchParams.get("location") || "";

    const initialSearch = initialLocation || initialService || "";

    return (
        <PageShell
                variant="marketing"
                eyebrow="Find salons near you"
                title="Discover salons and beauty services near you"
                description="Search by salon name, address or postcode, then pick your preferred location from the list or directly from the map."
                contentClassName="mt-6"
            >
                <PreferredSalonSearch initialSearch={initialSearch} />
            </PageShell>
    );
}
