"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
    const [service, setService] = useState("");
    const [location, setLocation] = useState("");
    const router = useRouter();

    const onSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (service) params.set("service", service);
        if (location) params.set("location", location);
        router.push(`/search?${params.toString()}`);
    };

    return (
        <form onSubmit={onSubmit} className="flex w-full max-w-2xl gap-2">
            <input
                aria-label="Service"
                placeholder="Service (e.g. Haircut, Nails)"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-1/2 rounded-full border border-black/10 px-4 py-2 text-sm"
            />

            <input
                aria-label="Location"
                placeholder="Location or postcode"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-1/2 rounded-full border border-black/10 px-4 py-2 text-sm"
            />

            <button type="submit" className="ml-2 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">Search</button>
        </form>
    );
}

