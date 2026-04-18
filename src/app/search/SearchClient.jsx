"use client";

import { useSearchParams } from "next/navigation";
import PreferredSalonSearch from "@/components/modals/PreferredSalonSearch";

export default function SearchClient() {
    const searchParams = useSearchParams();
    const initialService = searchParams.get("service") || "";
    const initialLocation = searchParams.get("location") || "";

    const initialSearch = initialLocation || initialService || "";

    return <PreferredSalonSearch initialSearch={initialSearch} />;
}
