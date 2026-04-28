"use client";

import React from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { ChevronDown, Filter, Search } from "lucide-react";
import LocationSearch from "@/components/search/LocationSearch";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { searchVenues } from "@/services/search/searchService";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/iconMap";

function calculateDistance(lat1, lon1, lat2, lon2) {
  const radius = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return radius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function getCoords(venue) {
  const lat = Number(venue?.address?.location?.lat ?? venue?.location?.lat ?? undefined);
  const lon = Number(venue?.address?.location?.lon ?? venue?.location?.lon ?? undefined);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  return { lat, lng: lon };
}

function computeCenter(venues) {
  const valid = (venues || []).map(getCoords).filter(Boolean);

  if (!valid.length) {
    return { lat: 51.5074, lng: -0.1278 };
  }

  const totals = valid.reduce(
    (acc, coord) => ({ lat: acc.lat + coord.lat, lng: acc.lng + coord.lng }),
    { lat: 0, lng: 0 }
  );

  return { lat: totals.lat / valid.length, lng: totals.lng / valid.length };
}

function formatAddress(venue) {
  return venue?.address?.formatted || [venue?.address?.line1, venue?.address?.line2, venue?.address?.postcode].filter(Boolean).join(", ") || "Address not available";
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "Price on request";
  }

  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return String(value);
  }

  return `£${amount.toFixed(2)}`;
}

export default function ServiceSearchClient({
  initialService = null,
  initialServiceUuid = "",
  initialServiceName = "",
  initialLocationLabel = "",
  initialLocationLat = null,
  initialLocationLon = null,
  initialDistance = "10km",
}) {
  const router = useRouter();

  const [serviceQuery, setServiceQuery] = React.useState(initialServiceName || initialService?.name || "");
  const [selectedLocation, setSelectedLocation] = React.useState(
    Number.isFinite(initialLocationLat) && Number.isFinite(initialLocationLon)
      ? { lat: initialLocationLat, lon: initialLocationLon, address: initialLocationLabel || "" }
      : null
  );
  const [locationLabel, setLocationLabel] = React.useState(initialLocationLabel || "");
  const [searchDistance, setSearchDistance] = React.useState(initialDistance || "10km");
  const [expandedFilter, setExpandedFilter] = React.useState(null);
  const [venues, setVenues] = React.useState([]);
  const [venuesLoading, setVenuesLoading] = React.useState(false);
  const [venuesError, setVenuesError] = React.useState("");
  const [hoveredVenueId, setHoveredVenueId] = React.useState(null);
  const [selectedVenueId, setSelectedVenueId] = React.useState(null);
  const [mapsReady, setMapsReady] = React.useState(false);
  const [selectedServiceUuid, setSelectedServiceUuid] = React.useState(initialServiceUuid || initialService?.uuid || "");

  const debounceRef = React.useRef(null);
  const geocoderRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markersRef = React.useRef([]);

  const {
    options: filterOptions,
    selectedFilters,
    toggleFilter,
    clearFilters,
  } = useSearchFilters();

  const hasActiveFilters = (selectedFilters.categories?.length || 0) > 0 || (selectedFilters.audiences?.length || 0) > 0;
  const center = React.useMemo(() => computeCenter(venues), [venues]);

  const serviceFilter = React.useMemo(() => {
    return selectedServiceUuid || initialService?.uuid || "";
  }, [initialService?.uuid, selectedServiceUuid]);

  const getMatchedService = React.useCallback((venue) => {
    const services = venue?.services || [];

    if (!serviceFilter) {
      return services[0] || null;
    }

    return (
      services.find((item) => item?.global_service_uuid === serviceFilter) ||
      services.find((item) => item?.uuid === serviceFilter) ||
      services[0] ||
      null
    );
  }, [serviceFilter]);

  const fetchVenues = React.useCallback(async ({ service, location = selectedLocation, distance = searchDistance }) => {
    if (!service) {
      setVenues([]);
      return;
    }

    setVenuesLoading(true);
    setVenuesError("");

    try {
      const response = await searchVenues({
        service,
        lat: location?.lat,
        lon: location?.lon,
        distance,
        category: selectedFilters.categories?.length ? selectedFilters.categories.join(",") : undefined,
        audience: selectedFilters.audiences?.length ? selectedFilters.audiences.join(",") : undefined,
        perPage: 48,
      });

      setVenues(response?.data || []);
    } catch (err) {
      setVenues([]);
      setVenuesError(err?.message || "Failed to load salons");
    } finally {
      setVenuesLoading(false);
    }
  }, [searchDistance, selectedFilters.audiences, selectedFilters.categories, selectedLocation]);

  React.useEffect(() => {
    if (!serviceFilter) return;

    fetchVenues({
      service: serviceFilter,
      location: selectedLocation,
      distance: searchDistance,
    });
  }, [fetchVenues, searchDistance, selectedLocation, serviceFilter]);

  React.useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = serviceQuery.trim();
    if (!trimmed && !serviceFilter && !hasActiveFilters) {
      setVenues([]);
      return undefined;
    }

    debounceRef.current = setTimeout(() => {
      fetchVenues({ service: serviceFilter });
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [fetchVenues, hasActiveFilters, serviceFilter, serviceQuery, selectedFilters.audiences, selectedFilters.categories, selectedLocation, searchDistance]);

  React.useEffect(() => {
    if (!mapsReady || selectedLocation || !window.google?.maps) return;

    const geocodeAddress = async () => {
      try {
        const targetAddress = locationLabel || "London, UK";
        const { Geocoder } = await window.google.maps.importLibrary("geocoding");
        geocoderRef.current = new Geocoder();

        const result = await new Promise((resolve, reject) => {
          geocoderRef.current.geocode({ address: targetAddress }, (results, status) => {
            if (status === "OK" && results?.length) {
              resolve(results[0]);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });

        const { lat, lng } = result.geometry.location;
        setSelectedLocation({
          lat: lat(),
          lon: lng(),
          address: targetAddress,
          placeId: result.place_id,
          postcode: null,
          country: "UK",
          isDefaultLocation: !initialLocationLabel,
        });
      } catch (err) {
        console.error("[ServiceSearchClient] failed to geocode location", err);
      }
    };

    geocodeAddress();
  }, [initialLocationLabel, locationLabel, mapsReady, selectedLocation]);

  React.useEffect(() => {
    if (!mapsReady || !mapRef.current || !window.google?.maps) return;
    let cancelled = false;

    const initMap = async () => {
      if (cancelled || !mapRef.current) return;
      if (typeof window.google.maps.Map !== "function") return;

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

      markersRef.current.forEach((entry) => entry.marker?.setMap?.(null));
      markersRef.current = [];

      venues.forEach((venue) => {
        const coords = getCoords(venue);
        if (!coords) return;

        const isHovered = hoveredVenueId === venue?.venue?.uuid;
        const isSelected = selectedVenueId === venue?.venue?.uuid;
        const markerIcon = isHovered || isSelected
          ? "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
          : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";

        const marker = new window.google.maps.Marker({
          position: coords,
          map: mapInstanceRef.current,
          title: venue?.venue?.name,
          icon: markerIcon,
        });

        marker.addListener("click", () => {
          setSelectedVenueId(venue?.venue?.uuid);
          const card = document.querySelector(`[data-venue-id="${venue?.venue?.uuid}"]`);
          if (card?.scrollIntoView) {
            card.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });

        markersRef.current.push({ uuid: venue?.venue?.uuid, marker });
      });
    };

    initMap();

    return () => {
      cancelled = true;
    };
  }, [center, hoveredVenueId, mapsReady, selectedVenueId, venues]);

  const handleLocationChange = (locationData) => {
    setSelectedLocation(locationData);
    setLocationLabel(locationData?.address || "");
    fetchVenues({ service: serviceFilter, location: locationData });
  };

  const handleServiceChange = (event) => {
    setServiceQuery(event.target.value);
    setSelectedServiceUuid(initialService?.uuid || initialServiceUuid || "");
  };

  const renderFilters = () => {
    if (expandedFilter !== "filters") return null;

    return (
      <div className="mt-2 w-full rounded-md border border-gray-200 bg-white p-4 shadow-lg">
        <div className="grid gap-4 md:grid-cols-2">
          {filterOptions.categories?.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold text-gray-900">Categories</h4>
              <div className="space-y-2">
                {filterOptions.categories.map((category) => {
                  const Icon = getIcon(category.icon);
                  return (
                    <label key={category.id} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedFilters.categories?.includes(category.id) || false}
                        onChange={() => toggleFilter("categories", category.id)}
                      />
                      {Icon && <Icon className="h-4 w-4 text-gray-600" />}
                      <span className="text-sm text-gray-700">{category.name} ({category.count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {filterOptions.audiences?.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold text-gray-900">Audience</h4>
              <div className="space-y-2">
                {filterOptions.audiences.map((audience) => {
                  const Icon = getIcon(audience.icon);
                  return (
                    <label key={audience.id} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedFilters.audiences?.includes(audience.id) || false}
                        onChange={() => toggleFilter("audiences", audience.id)}
                      />
                      {Icon && <Icon className="h-4 w-4 text-gray-600" />}
                      <span className="text-sm text-gray-700">{audience.name} ({audience.count})</span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="mb-3 text-xs font-semibold text-gray-900">Search Distance</h4>
                <div className="flex gap-4">
                  {["5km", "10km", "15km"].map((distance) => (
                    <label key={distance} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="service-search-distance"
                        checked={searchDistance === distance}
                        onChange={() => {
                          setSearchDistance(distance);
                          fetchVenues({ service: serviceFilter, distance });
                        }}
                      />
                      <span className="text-sm text-gray-700">{distance}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t border-gray-200 pt-3">
          <button
            type="button"
            onClick={() => {
              clearFilters();
              setSearchDistance("10km");
              fetchVenues({ service: serviceFilter, distance: "10km" });
              setExpandedFilter(null);
            }}
            className="rounded-md bg-gray-200 px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={async () => {
              await fetchVenues({
                service: serviceFilter,
                location: selectedLocation,
                distance: searchDistance,
              });
              setExpandedFilter(null);
            }}
            className="px-4 py-1.5 bg-brand-blue text-white text-xs font-medium rounded-md hover:opacity-90 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    );
  };

  const handleVenueClick = (venue) => {
    const matchedService = getMatchedService(venue);

    if (!venue?.venue?.slug || !matchedService?.uuid) {
      return;
    }

    const params = new URLSearchParams();
    if (matchedService?.name) params.set("name", matchedService.name);
    if (selectedLocation?.address) params.set("loc", selectedLocation.address);
    if (selectedLocation?.lat !== undefined && selectedLocation?.lat !== null) params.set("lat", String(selectedLocation.lat));
    if (selectedLocation?.lon !== undefined && selectedLocation?.lon !== null) params.set("lon", String(selectedLocation.lon));

    router.push(`/salon/${venue.venue.slug}/service/${matchedService.uuid}?${params.toString()}`);
  };

  return (
    <section className="relative overflow-visible pt-5 pb-0 md:pt-8 md:pb-0">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(30, 30%, 99%) 0%, hsl(0, 30%, 97%) 40%, hsl(30, 25%, 98%) 70%, hsl(0, 20%, 96%) 100%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-3 sm:px-6 flex flex-col gap-6">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}&libraries=maps,places&v=weekly&loading=async`}
        strategy="lazyOnload"
        onLoad={() => setMapsReady(true)}
      />

      <div className="relative mb-2">
        <div className="flex items-center bg-white rounded-full border border-gray-200 px-2 sm:px-4 py-0.5 shadow-sm overflow-visible">
          <div className="w-3/5 flex items-center gap-0">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
              <input
                value={serviceQuery}
                onChange={handleServiceChange}
                placeholder="Search Services or Salons..."
                className={cn(
                  'w-full h-8 sm:h-9 pl-6 sm:pl-8 pr-1 sm:pr-2 rounded-full border-0 bg-transparent',
                  'text-sm sm:text-base text-gray-900 placeholder-gray-500',
                  'focus:outline-none',
                  'transition-all duration-200'
                )}
              />
            </div>
          </div>

          <div className="h-5 sm:h-6 bg-gray-200 w-px"></div>

          <div className="w-2/5 flex items-center">
            <LocationSearch
              value={selectedLocation?.address || locationLabel}
              onLocationChange={handleLocationChange}
              onLocationFocus={() => setExpandedFilter(null)}
              onLocationBlur={() => {}}
              mapsReady={mapsReady}
              placeholder="Location..."
              className="w-full"
            />
          </div>
        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <section className="rounded-md border border-black/10 bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Services search</p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-neutral-950">{venues.length} venue{venues.length === 1 ? "" : "s"} found</h3>
                {venuesLoading && <p className="text-sm text-neutral-500">Updating...</p>}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <button
                type="button"
                onClick={() => setExpandedFilter(expandedFilter === "filters" ? null : "filters")}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                  hasActiveFilters
                    ? 'border-primary text-primary bg-blue-50'
                    : 'border-gray-300 text-gray-700 bg-white hover:border-gray-400'
                )}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Filters {hasActiveFilters && `(${(selectedFilters.categories?.length || 0) + (selectedFilters.audiences?.length || 0)})`}
                </span>
                <ChevronDown className={cn('w-4 h-4 transition-transform', expandedFilter === 'filters' && 'rotate-180')} />
              </button>
            </div>
          </div>

          {renderFilters() && <div className="mb-4">{renderFilters()}</div>}

          {venuesError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {venuesError}
            </div>
          )}

          <div className="max-h-[760px] space-y-3 overflow-y-auto pr-1">
            {!venuesLoading && venues.length === 0 && !venuesError && (
              <div className="rounded-md border border-dashed border-black/10 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
                No salons match this service and location yet.
              </div>
            )}
            {venues.map((venue) => {
              const matchedService = getMatchedService(venue);

              const coords = getCoords(venue);
              const distance = selectedLocation && coords
                ? calculateDistance(selectedLocation.lat, selectedLocation.lon, coords.lat, coords.lng)
                : null;
              const isHovered = hoveredVenueId === venue?.venue?.uuid;
              const isSelected = selectedVenueId === venue?.venue?.uuid;

              return (
                <article
                  key={venue?.venue?.uuid}
                  data-venue-id={venue?.venue?.uuid}
                  onMouseEnter={() => setHoveredVenueId(venue?.venue?.uuid)}
                  onMouseLeave={() => setHoveredVenueId(null)}
                  onClick={() => handleVenueClick(venue)}
                  className={cn(
                    "cursor-pointer rounded-md border bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                    isSelected ? "border-primary/70 ring-1 ring-primary/20" : isHovered ? "border-gray-300" : "border-black/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-neutral-950">{venue?.venue?.name}</p>
                      <p className="mt-1 text-sm text-neutral-600">{formatAddress(venue)}</p>
                    </div>

                    {distance !== null && (
                      <div className="shrink-0 rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                        {distance.toFixed(1)} km
                      </div>
                    )}
                  </div>

                  {matchedService && (
                    <div className="mt-3 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-semibold text-neutral-950">{matchedService.name}</span>
                        <span>{matchedService.duration_minutes ? `${matchedService.duration_minutes} min` : "Duration n/a"}</span>
                        <span>{matchedService.price !== undefined ? `From ${formatMoney(matchedService.price)}` : "Price n/a"}</span>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-md border border-black/10 bg-neutral-950 p-3 text-white shadow-sm ring-1 ring-black/10">
          <div className="mb-3 px-1 pt-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Map view</p>
            <p className="text-sm text-white/80">Hover a venue to highlight its marker.</p>
          </div>

          <div ref={mapRef} className="min-h-[420px] flex-1 rounded-md bg-neutral-800" />

          {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY && (
            <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-md bg-black/70 px-3 py-2 text-[11px] text-neutral-200">
              Google Maps API key is not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_KEY to enable the map.
            </div>
          )}
        </section>
      </div>
      </div>
    </section>
  );
}