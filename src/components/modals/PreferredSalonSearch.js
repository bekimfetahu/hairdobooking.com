"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { MapPin } from "lucide-react";

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

export default function PreferredSalonSearch({ initialSearch = "", onPrimaryUpdated, onClose } = {}) {
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
    const [primarySalon, setPrimarySalonState] = useState(null);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    const preferredSalon = useMemo(() => {
        if (primarySalon) {
            const match = salons.find((s) => s.uuid === primarySalon.uuid);
            return match ? { ...primarySalon, ...match } : primarySalon;
        }
        if (!primaryVenueId) return null;
        return salons.find((s) => s.uuid === primaryVenueId) || null;
    }, [primarySalon, primaryVenueId, salons]);

    const center = useMemo(
        () => computeCenter(preferredSalon ? [...salons, preferredSalon] : salons),
        [salons, preferredSalon]
    );

    function getAddressInline(salon) {
        if (!salon) return '';

        const parts = [];

        const addr = salon.address || {};
        if (addr.line1) parts.push(addr.line1);
        if (addr.line2) parts.push(addr.line2);
        if (addr.line3) parts.push(addr.line3);
        if (addr.postcode) parts.push(addr.postcode);

        // Backwards-compatible flat fields
        if (parts.length === 0) {
            if (salon.building_name) parts.push(salon.building_name);
            if (salon.street) parts.push(salon.street);
            if (salon.town) parts.push(salon.town);
            if (salon.city) parts.push(salon.city);
            if (salon.postcode) parts.push(salon.postcode);
        }

        // Other potential shape fallbacks
        if (parts.length === 0) {
            if (salon.address_line1) parts.push(salon.address_line1);
            if (salon.address_line2) parts.push(salon.address_line2);
            if (salon.postal_code) parts.push(salon.postal_code);
        }

        return parts.join(', ');
    }

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
                    setPrimarySalonState(primaryVenue);
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

        const hasMapId = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID);

        if (!mapInstanceRef.current) {
            const mapOptions = {
                center,
                zoom: 12,
                mapTypeControl: false,
                streetViewControl: false,
            };

            // Only set mapId when provided; otherwise stay on standard map
            if (hasMapId) {
                mapOptions.mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
            }

            // @ts-ignore - mapId is supported when using the JS API v3.49+
            mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
        } else {
            mapInstanceRef.current.setCenter(center);
        }

        // Clear existing markers from the map
        markersRef.current.forEach(({ marker }) => {
            if (marker) {
                marker.setMap(null);
            }
        });
        markersRef.current = [];

        let cancelled = false;

        (async () => {
            try {
                const entries = [];

                // Ensure the preferred salon is included on the map even if it's not
                // present in the current search results so its marker can render red.
                const markerSalons =
                    preferredSalon && !salons.some((s) => s.uuid === preferredSalon.uuid)
                        ? [...salons, preferredSalon]
                        : salons;

                if (hasMapId && window.google.maps.importLibrary) {
                    // Use Advanced Markers when a Map ID is configured
                    const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");
                    markerSalons.forEach((salon) => {
                        const coords = getCoordsFromSalon(salon);
                        if (!coords) return;

                        const isPrimary = primaryVenueId && salon.uuid === primaryVenueId;
                        const baseIconUrl = isPrimary
                            ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                            : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";

                        const img = document.createElement("img");
                        img.src = baseIconUrl;
                        img.alt = salon.name;
                        img.style.width = "24px";
                        img.style.height = "24px";

                        const marker = new AdvancedMarkerElement({
                            position: coords,
                            map: mapInstanceRef.current,
                            title: salon.name,
                            content: img,
                        });

                        // Use the Advanced Marker click event
                        marker.addListener("gmp-click", () => {
                            setSelectedSalonId(salon.uuid);
                            setHoveredSalonId(salon.uuid);

                            const card = document.querySelector(
                                `[data-salon-id="${salon.uuid}"]`
                            );
                            if (card && typeof card.scrollIntoView === "function") {
                                card.scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                        });

                        entries.push({
                            uuid: salon.uuid,
                            marker,
                            img,
                            baseIconUrl,
                            isAdvanced: true,
                        });
                    });
                } else {
                    // Fallback to classic Marker when no Map ID is configured
                    markerSalons.forEach((salon) => {
                        const coords = getCoordsFromSalon(salon);
                        if (!coords) return;

                        const isPrimary = primaryVenueId && salon.uuid === primaryVenueId;
                        const baseIconUrl = isPrimary
                            ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                            : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";

                        const marker = new window.google.maps.Marker({
                            position: coords,
                            map: mapInstanceRef.current,
                            title: salon.name,
                            icon: baseIconUrl,
                        });

                        marker.addListener("click", () => {
                            setSelectedSalonId(salon.uuid);
                            setHoveredSalonId(salon.uuid);

                            const card = document.querySelector(
                                `[data-salon-id="${salon.uuid}"]`
                            );
                            if (card && typeof card.scrollIntoView === "function") {
                                card.scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                        });

                        entries.push({
                            uuid: salon.uuid,
                            marker,
                            baseIconUrl,
                            isAdvanced: false,
                        });
                    });
                }

                if (!cancelled) {
                    markersRef.current = entries;
                } else {
                    entries.forEach((entry) => {
                        if (entry.marker) {
                            entry.marker.setMap(null);
                        }
                    });
                }
            } catch {
                // If Advanced Marker import fails, do nothing; map remains usable.
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [salons, center, primaryVenueId, preferredSalon]);

    useEffect(() => {
        if (!mapInstanceRef.current) return;
        if (!window.google || !window.google.maps) return;

        // Reset all markers to their base icon first
        markersRef.current.forEach((entry) => {
            if (entry.isAdvanced && entry.img && entry.baseIconUrl) {
                entry.img.src = entry.baseIconUrl;
            } else if (!entry.isAdvanced && entry.baseIconUrl && entry.marker?.setIcon) {
                entry.marker.setIcon(entry.baseIconUrl);
            }
        });

        if (!hoveredSalonId) return;

        const entry = markersRef.current.find((item) => item.uuid === hoveredSalonId);
        if (!entry) return;

        // Highlight hovered marker so it stands out among nearby locations
        if (entry.isAdvanced && entry.img) {
            entry.img.src = "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
        } else if (!entry.isAdvanced && entry.marker?.setIcon) {
            entry.marker.setIcon("https://maps.google.com/mapfiles/ms/icons/yellow-dot.png");
        }

        const position = entry.marker.position || entry.marker.getPosition?.();
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
                setPrimarySalonState(primaryVenue);
            } else {
                setPrimaryVenueId(salon.uuid);
                setPrimarySalonState(salon);
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

            // After successfully setting the preferred salon, redirect to it.
            const slugFromUser = primaryVenue?.slug;
            const slugFromSalon = salon.slug;
            const targetSlug = slugFromUser || slugFromSalon || null;
            if (targetSlug) {
                router.push(`/salon/${targetSlug}`);
            }
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

            <div className="grid h-full gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
                <section className="flex h-full flex-col rounded-md bg-white p-4 shadow-sm ring-1 ring-black/5 lg:overflow-hidden">
                    <form onSubmit={onSubmit} className="w-full">
                        <input
                            aria-label="Search"
                            placeholder="Salon Name, Address, Postcode"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
                        />
                    </form>

                    <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                        <span>
                            {loading
                                ? "Searching salons..."
                                : `${salons.length} salon${salons.length === 1 ? "" : "s"} found`}
                        </span>
                    </div>

                    {preferredSalon && (
                        <div className="mt-3">
                            {(() => {
                                const addressInline = getAddressInline(preferredSalon);

                                return (
                                    <article
                                        className="flex flex-col gap-1 rounded-md bg-emerald-50 px-3.5 py-3 text-sm ring-1 ring-emerald-500"
                                        onClick={() => {
                                            if (preferredSalon.uuid) {
                                                setSelectedSalonId(preferredSalon.uuid);
                                                setHoveredSalonId(preferredSalon.uuid);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-neutral-950">
                                                    {preferredSalon.name}
                                                </p>
                                                {preferredSalon.company?.company_name && (
                                                    <p className="truncate text-xs text-neutral-500">
                                                        {preferredSalon.company.company_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <p className="mt-1 text-xs text-neutral-600">
                                            {addressInline || "Address not available"}
                                        </p>

                                        {preferredSalon.phone && (
                                            <p className="mt-0.5 text-xs text-neutral-500">{preferredSalon.phone}</p>
                                        )}

                                        <div className="mt-2 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (preferredSalon.slug) {
                                                        router.push(`/salon/${preferredSalon.slug}`);
                                                    }
                                                    if (typeof onClose === "function") {
                                                        onClose();
                                                    }
                                                }}
                                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-primary bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary hover:bg-primary/10"
                                            >
                                                <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/10">
                                                    <MapPin className="h-3 w-3" />
                                                </span>
                                                <span>Go to your preferred salon</span>
                                            </button>
                                        </div>
                                    </article>
                                );
                            })()}

                            {preferredStatus && (
                                <p className="mt-1 text-[11px] text-emerald-700">{preferredStatus}</p>
                            )}
                            {preferredError && (
                                <p className="mt-1 text-[11px] text-red-700">{preferredError}</p>
                            )}
                        </div>
                    )}

                    <div className="mt-3 flex-1 space-y-2 overflow-y-auto rounded-md bg-neutral-50 p-3">
                        {error && (
                            <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                                {error}
                            </div>
                        )}

                        {!error && !loading && salons.length === 0 && (
                            <div className="rounded-md border border-dashed border-black/10 bg-white px-4 py-6 text-center text-sm text-neutral-500">
                                No salons found. Try another name or postcode.
                            </div>
                        )}

                        {salons
                            .filter((salon) => !primaryVenueId || salon.uuid !== primaryVenueId)
                            .map((salon) => {
                            const addressInline = getAddressInline(salon);

                            const isPrimary = primaryVenueId && salon.uuid === primaryVenueId;
                            const isHovered = hoveredSalonId === salon.uuid;
                            const isSelected = selectedSalonId === salon.uuid;

                            return (
                                <article
                                    key={salon.uuid}
                                    data-salon-id={salon.uuid}
                                    className={`flex flex-col gap-1 rounded-md px-3.5 py-3 text-sm ring-1 transition-colors ${
                                        isSelected
                                            ? "bg-primary/5 ring-primary/40"
                                            : "bg-white ring-black/5 hover:ring-black/20"
                                    }`}
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (salon.slug) {
                                                        router.push(`/salon/${salon.slug}`);
                                                    }
                                                    if (typeof onClose === "function") {
                                                        onClose();
                                                    }
                                                }}
                                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-primary bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary hover:bg-primary/10"
                                            >
                                                <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/10">
                                                    <MapPin className="h-3 w-3" />
                                                </span>
                                                <span>Your preferred salon</span>
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
                                                    className="cursor-pointer rounded-full border border-neutral-900 bg-white px-3 py-1 text-[11px] font-medium text-neutral-900 shadow-sm hover:bg-neutral-900/5 disabled:opacity-60"
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

                <section className="relative flex h-full flex-col overflow-hidden rounded-md bg-neutral-900/95 p-3 text-white shadow-sm ring-1 ring-black/10">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
                                Map view
                            </p>
                            <p className="text-sm text-neutral-100">
                                Explore salons around your chosen area.
                            </p>
                        </div>
                    </div>

                    <div
                        ref={mapRef}
                        className="flex-1 w-full rounded-md bg-neutral-800 min-h-[260px] md:min-h-[360px] lg:min-h-[420px]"
                    />

                    {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY && (
                        <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-md bg-black/70 px-3 py-2 text-[11px] text-neutral-200">
                            Google Maps API key is not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_KEY in your env to enable the live map.
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
