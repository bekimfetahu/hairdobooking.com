"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

import { fetchPrimarySalonLocations, setPrimarySalon } from "@/services/auth/primarySalon";

function getCoordsFromSalon(salon) {
    const lat = Number(salon?.latitude ?? salon?.address?.latitude ?? undefined);
    const lng = Number(salon?.longitude ?? salon?.address?.longitude ?? undefined);

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

export default function PreferredSalonSearch({ initialSearch = "", onPrimaryUpdated } = {}) {
    const router = useRouter();

    const [search, setSearch] = useState(initialSearch);
    const [query, setQuery] = useState(initialSearch);
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hoveredSalonId, setHoveredSalonId] = useState(null);
    const [selectedSalonId, setSelectedSalonId] = useState(null);
    const [preferredStatus, setPreferredStatus] = useState("");
    const [preferredError, setPreferredError] = useState("");
    const [settingPreferredId, setSettingPreferredId] = useState(null);
    const [primaryVenueId, setPrimaryVenueId] = useState(null);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    const center = useMemo(() => computeCenter(salons), [salons]);

    const selectedSalon = useMemo(
        () => salons.find((s) => s.uuid === selectedSalonId) || null,
        [salons, selectedSalonId]
    );

    useEffect(() => {
        let cancelled = false;

        async function loadCurrentUser() {
            try {
                const res = await fetch("/api/auth/me", {
                    method: "GET",
                    credentials: "include",
                });

                if (!res.ok) return;

                const data = await res.json();
                const user = data?.user || data;
                const primaryVenue = user?.client?.primary_venue ?? user?.client?.primaryVenue ?? null;
                if (!cancelled && primaryVenue?.uuid) {
                    setPrimaryVenueId(primaryVenue.uuid);
                }
            } catch {
                // ignore auth errors
            }
        }

        loadCurrentUser();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setQuery(search.trim());
        }, 400);

        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        let aborted = false;

        async function load() {
            setLoading(true);
            setError("");

            try {
                const { items } = await fetchPrimarySalonLocations({
                    search: query.trim(),
                    perPage: 15,
                    page: 1,
                });

                if (!aborted) {
                    setSalons(items || []);
                    if (selectedSalonId && !items.find((s) => s.uuid === selectedSalonId)) {
                        setSelectedSalonId(null);
                        setPreferredStatus("");
                        setPreferredError("");
                    }
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
    }, [query, selectedSalonId]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!window.google || !window.google.maps) return;
        if (!mapRef.current) return;

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

    useEffect(() => {
        if (!hoveredSalonId) return;
        if (!mapInstanceRef.current) return;
        if (!window.google || !window.google.maps) return;

        const entry = markersRef.current.find((item) => item.uuid === hoveredSalonId);
        if (!entry) return;

        const position = entry.marker.getPosition();
        if (!position) return;

        mapInstanceRef.current.panTo(position);

        const currentZoom = mapInstanceRef.current.getZoom() || 12;
        if (currentZoom < 14) {
            mapInstanceRef.current.setZoom(14);
        }
    }, [hoveredSalonId]);

    const onSubmit = (event) => {
        event.preventDefault();
        setQuery(search.trim());
    };

    const handleSelectSalon = (salon) => {
        setSelectedSalonId(salon.uuid);
        setPreferredStatus("");
        setPreferredError("");
    };

    const handleSetPreferredSalon = async (salon) => {
        if (!salon) return;
        setSettingPreferredId(salon.uuid);
        setPreferredStatus("");
        setPreferredError("");

        try {
            const updatedUser = await setPrimarySalon(salon.uuid);
            const primaryVenue = updatedUser?.client?.primary_venue ?? updatedUser?.client?.primaryVenue ?? null;
            if (primaryVenue?.uuid) {
                setPrimaryVenueId(primaryVenue.uuid);
            } else {
                setPrimaryVenueId(salon.uuid);
            }

            if (updatedUser && typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("preferred-salon-updated", {
                        detail: { user: updatedUser },
                    })
                );
            }

            if (typeof onPrimaryUpdated === "function") {
                onPrimaryUpdated(updatedUser);
            }

            setPreferredStatus("Your preferred salon has been updated.");
        } catch (err) {
            const message = err?.message || "Failed to set preferred salon";
            setPreferredError(message);

            if (message.toLowerCase().includes("unauth")) {
                router.push("/login?redirect=/search");
            }
        } finally {
            setSettingPreferredId(null);
        }
    };

    return (
        <>
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}&libraries=maps&v=weekly&loading=async`}
                strategy="lazyOnload"
            />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
                <section className="flex flex-col rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 lg:overflow-hidden">
                    <form
                        onSubmit={onSubmit}
                        className="flex flex-col gap-3 rounded-2xl bg-neutral-50 p-3 ring-1 ring-black/5"
                    >
                        <input
                            aria-label="Search"
                            placeholder="Salon Name, Address, Postcode"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                        />
                    </form>

                    <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                        <span>
                            {loading
                                ? "Searching salons..."
                                : `${salons.length} salon${salons.length === 1 ? "" : "s"} found`}
                        </span>
                        <span>Results are based on marketplace-enabled salons.</span>
                    </div>

                    {selectedSalon && (
                        <div className="mt-2 rounded-xl bg-primary/5 px-3 py-2 text-xs text-neutral-800">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate font-medium">
                                        Selected salon: {selectedSalon.name}
                                    </p>
                                    <p className="truncate text-[11px] text-neutral-500">
                                        {selectedSalon.address?.postcode ||
                                            selectedSalon.address?.line2 ||
                                            "Address not available"}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleSetPreferredSalon(selectedSalon)}
                                    disabled={settingPreferredId === selectedSalon.uuid}
                                    className="shrink-0 rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-60"
                                >
                                    {settingPreferredId === selectedSalon.uuid
                                        ? "Saving..."
                                        : "Confirm as my preferred salon"}
                                </button>
                            </div>
                            {preferredStatus && (
                                <p className="mt-1 text-[11px] text-emerald-700">{preferredStatus}</p>
                            )}
                            {preferredError && (
                                <p className="mt-1 text-[11px] text-red-700">{preferredError}</p>
                            )}
                        </div>
                    )}

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

                            const isPrimary = primaryVenueId && salon.uuid === primaryVenueId;
                            const isHovered = hoveredSalonId === salon.uuid;

                            return (
                                <article
                                    key={salon.uuid}
                                    className="flex flex-col gap-1 rounded-2xl bg-white px-3.5 py-3 text-sm ring-1 ring-black/5 hover:ring-black/20"
                                    onClick={() => handleSelectSalon(salon)}
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

                                    <div className="mt-2 flex justify-end">
                                        {isPrimary ? (
                                            <button
                                                type="button"
                                                disabled
                                                className="cursor-default rounded-full border border-emerald-500 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700"
                                            >
                                                Your preferred salon
                                            </button>
                                        ) : (
                                            isHovered && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectSalon(salon);
                                                        handleSetPreferredSalon(salon);
                                                    }}
                                                    disabled={settingPreferredId === salon.uuid}
                                                    className="rounded-full border border-primary bg-white px-3 py-1 text-[11px] font-medium text-primary shadow-sm hover:bg-primary/5 disabled:opacity-60"
                                                >
                                                    {settingPreferredId === salon.uuid
                                                        ? "Saving..."
                                                        : "Set as my preferred salon"}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

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
        </>
    );
}
