"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";

import PageShell from "@/components/layouts/PageShell";
import { fetchPrimarySalonLocations } from "@/services/auth/primarySalon";

function getCoordsFromSalon(salon) {
    // Prefer top-level latitude/longitude; fall back to nested address if needed
    const lat = Number(
        salon?.latitude ?? salon?.address?.latitude ?? undefined
    );
    const lng = Number(
        salon?.longitude ?? salon?.address?.longitude ?? undefined
    );

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    return { lat, lng };
}

function computeCenter(locations) {
    const valid = locations
        .map((loc) => getCoordsFromSalon(loc))
        .filter(Boolean);

    if (!valid.length) {
        // Default center (e.g. London) if no coordinates yet
        return { lat: 51.5074, lng: -0.1278 };
    }

    const { latSum, lngSum } = valid.reduce(
        (acc, coord) => ({
            latSum: acc.latSum + coord.lat,
            lngSum: acc.lngSum + coord.lng,
        }),
        { latSum: 0, lngSum: 0 }
    );

    return {
        lat: latSum / valid.length,
        lng: lngSum / valid.length,
    };
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const initialService = searchParams.get("service") || "";
    const initialLocation = searchParams.get("location") || "";

    const [service, setService] = useState(initialService);
    const [location, setLocation] = useState(initialLocation);
    const [query, setQuery] = useState(initialLocation || initialService || "");
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hoveredSalonId, setHoveredSalonId] = useState(null);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]); // [{ uuid, marker }]

    const center = useMemo(() => computeCenter(salons), [salons]);

    // Fetch salons from Laravel marketplace endpoint using existing service
    useEffect(() => {
        let aborted = false;

        async function load() {
            setLoading(true);
            setError("");

            try {
                const { items } = await fetchPrimarySalonLocations({
                    search: query.trim(),
                    perPage: 50,
                    page: 1,
                });

                if (!aborted) {
                    setSalons(items || []);
                }
            } catch (err) {
                if (!aborted) {
                    setError(err?.message || "Failed to load salons");
                    setSalons([]);
                }
            } finally {
                if (!aborted) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            aborted = true;
        };
    }, [query]);

    // Initialise and update Google Map markers when salons change
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!window.google || !window.google.maps) return;
        if (!mapRef.current) return;

        // Lazily create the map once
        if (!mapInstanceRef.current) {
            mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
                center,
                zoom: 12,
                mapTypeControl: false,
                streetViewControl: false,
            });
        } else {
            mapInstanceRef.current.setCenter(center);
        }

        // Clear old markers
        markersRef.current.forEach(({ marker }) => marker.setMap(null));
        markersRef.current = [];

        salons.forEach((salon) => {
            const coords = getCoordsFromSalon(salon);
            if (!coords) return;

            const marker = new window.google.maps.Marker({
                position: coords,
                map: mapInstanceRef.current,
                title: salon.name,
            });
            markersRef.current.push({ uuid: salon.uuid, marker });
        });
    }, [salons, center]);

    // When hovering a salon in the list, pan the map to its marker
    useEffect(() => {
        if (!hoveredSalonId) return;
        if (!mapInstanceRef.current) return;
        if (!window.google || !window.google.maps) return;

        const entry = markersRef.current.find((item) => item.uuid === hoveredSalonId);
        if (!entry) return;

        const position = entry.marker.getPosition();
        if (!position) return;

        mapInstanceRef.current.panTo(position);

        // Gently zoom in a bit when highlighting, without being too aggressive
        const currentZoom = mapInstanceRef.current.getZoom() || 12;
        if (currentZoom < 14) {
            mapInstanceRef.current.setZoom(14);
        }
    }, [hoveredSalonId]);

    const onSubmit = (event) => {
        event.preventDefault();
        // For now, combine service + location into a single backend search string
        const combined = [service, location].filter(Boolean).join(" ");
        setQuery(combined);
    };

    return (
        <>
            {/* Load Google Maps JS API for client-side map rendering */}
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}&libraries=maps&v=weekly`}
                strategy="lazyOnload"
            />

            <PageShell
                variant="marketing"
                eyebrow="Find salons near you"
                title="Discover salons and beauty services near you"
                description="Search by salon name, address or postcode, then pick your preferred location from the list or directly from the map."
                contentClassName="mt-6"
            >
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                    {/* Left column: search + results */}
                    <section className="flex flex-col rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 lg:overflow-hidden">
                        <form
                            onSubmit={onSubmit}
                            className="flex flex-col gap-3 rounded-2xl bg-neutral-50 p-3 ring-1 ring-black/5 md:flex-row"
                        >
                            <input
                                aria-label="Service"
                                placeholder="Service (e.g. Haircut, Nails)"
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm md:w-1/2"
                            />

                            <input
                                aria-label="Location"
                                placeholder="Location or postcode"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm md:w-1/2"
                            />

                            <button
                                type="submit"
                                className="mt-1 inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 md:mt-0"
                            >
                                Search
                            </button>
                        </form>

                        <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                            <span>
                                {loading
                                    ? "Searching salons..."
                                    : `${salons.length} salon${salons.length === 1 ? "" : "s"} found`}
                            </span>
                            <span>Results are based on marketplace-enabled salons.</span>
                        </div>

                        <div className="mt-3 flex-1 space-y-2 overflow-y-auto rounded-2xl bg-neutral-50 p-3">
                            {error && (
                                <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                                    {error}
                                </div>
                            )}

                            {!error && !loading && salons.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-6 text-center text-sm text-neutral-500">
                                    No salons found. Try another name or postcode.
                                </div>
                            )}

                            {salons.map((salon) => {
                                const addressParts = [];
                                const addr = salon.address || {};
                                if (addr.line1) addressParts.push(addr.line1);
                                if (addr.line2) addressParts.push(addr.line2);
                                if (addr.line3) addressParts.push(addr.line3);
                                if (addr.postcode) addressParts.push(addr.postcode);

                                const addressInline = addressParts.join(", ");

                                return (
                                    <article
                                        key={salon.uuid}
                                        className="flex flex-col gap-1 rounded-2xl bg-white px-3.5 py-3 text-sm ring-1 ring-black/5 hover:ring-black/20"
                                        onMouseEnter={() => setHoveredSalonId(salon.uuid)}
                                        onMouseLeave={() => setHoveredSalonId(null)}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-neutral-950">
                                                    {salon.name}
                                                </p>
                                                {salon.company?.company_name && (
                                                    <p className="truncate text-xs text-neutral-500">
                                                        {salon.company.company_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <p className="mt-1 text-xs text-neutral-600">
                                            {addressInline || "Address not available"}
                                        </p>

                                        {salon.phone && (
                                            <p className="mt-0.5 text-xs text-neutral-500">{salon.phone}</p>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    {/* Right column: map */}
                    <section className="relative flex flex-col overflow-hidden rounded-3xl bg-neutral-900/95 p-3 text-white shadow-sm ring-1 ring-black/10">
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                    Map view
                                </p>
                                <p className="text-sm text-neutral-100">
                                    Explore salons around your chosen area.
                                </p>
                            </div>
                        </div>

                        <div
                            ref={mapRef}
                            className="h-64 w-full rounded-2xl bg-neutral-800 md:h-[420px] lg:h-[480px]"
                        />

                        {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY && (
                            <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl bg-black/70 px-3 py-2 text-[11px] text-neutral-200">
                                Google Maps API key is not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_KEY in your env to enable the live map.
                            </div>
                        )}
                    </section>
                </div>
            </PageShell>
        </>
    );
}
