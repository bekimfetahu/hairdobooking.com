"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import Script from "next/script";
import LocationSearch from "@/components/search/LocationSearch";
import VenueSearchResultsList from "@/components/search/VenueSearchResultsList";
import { searchVenues } from "@/services/search/searchService";
import Select from 'react-select';

function VenueMap({ venues, selectedLocation, searchDistance, router }) {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markersRef = React.useRef([]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    let center = { lat: 51.5074, lng: -0.1278 };
    if (selectedLocation) center = { lat: selectedLocation.lat, lng: selectedLocation.lon };

    if (!mapInstanceRef.current) {
      if (typeof window.google?.maps?.Map !== "function") return;
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      });
    } else {
      mapInstanceRef.current.setCenter(center);
    }

    // clear old markers
    markersRef.current.forEach((m) => m.marker?.setMap(null));
    markersRef.current = [];

    if (!Array.isArray(venues)) return;
    const bounds = new window.google.maps.LatLngBounds();

    venues.forEach((venue) => {
      const loc = venue.address?.location;
      if (!loc) return;
      const position = { lat: loc.lat, lng: loc.lon };
      const marker = new window.google.maps.Marker({ position, map: mapInstanceRef.current, title: venue.venue?.name });
      marker.addListener("click", () => {
        if (router && venue.venue?.slug) router.push(`/salon/${venue.venue.slug}`);
      });
      markersRef.current.push({ marker });
      bounds.extend(position);
    });

    try {
      if (!bounds.isEmpty) mapInstanceRef.current.fitBounds(bounds, 50);
    } catch (e) {
      // ignore
    }

    return () => markersRef.current.forEach((m) => m.marker?.setMap(null));
  }, [venues, selectedLocation, router]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(Math.min(currentZoom + 1, 21));
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(Math.max(currentZoom - 1, 0));
    }
  };

  return (
    <div className="w-full h-full relative" style={{ minHeight: 300 }}>
      <div ref={mapRef} className="w-full h-full" />

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1 z-10">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white border border-gray-300 rounded-md shadow-md hover:bg-gray-50 hover:shadow-lg transition-all flex items-center justify-center text-lg font-bold text-gray-700"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white border border-gray-300 rounded-md shadow-md hover:bg-gray-50 hover:shadow-lg transition-all flex items-center justify-center text-lg font-bold text-gray-700"
          title="Zoom out"
        >
          −
        </button>
      </div>
    </div>
  );

}

export default function SalonSearchClient({
  initialVenues = [],
  initialLocationLabel = "",
  initialLocationLat = null,
  initialLocationLon = null,
  initialDistance = "50mi",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [areaVenues, setAreaVenues] = React.useState(initialVenues || []); // all salons within selected distance
  const [displayedVenues, setDisplayedVenues] = React.useState(initialVenues || []); // filtered list shown
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [showMap, setShowMap] = React.useState(false);
  const [query, setQuery] = React.useState((searchParams?.get("q")) || "");
  const [selectedLocation, setSelectedLocation] = React.useState(
    Number.isFinite(initialLocationLat) && Number.isFinite(initialLocationLon)
      ? { lat: initialLocationLat, lon: initialLocationLon, address: initialLocationLabel }
      : null
  );
  const [distance, setDistance] = React.useState(initialDistance || "50mi");
  const [mapsReady, setMapsReady] = React.useState(false);

  // Track which venue has opening hours expanded: Set of venueUuid
  const [expandedOpeningHours, setExpandedOpeningHours] = React.useState(new Set());
  const toggleOpeningHours = (venueUuid) => {
    setExpandedOpeningHours((prev) => {
      const next = new Set(prev);
      if (next.has(venueUuid)) next.delete(venueUuid);
      else next.add(venueUuid);
      return next;
    });
  };

  // Track which service groups are expanded: Set of "venueUuid::groupKey"
  const [expandedGroups, setExpandedGroups] = React.useState(new Set());
  const toggleGroup = (venueUuid, groupKey) => {
    const id = `${venueUuid}::${groupKey}`;
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const perPage = 12;
  const distanceOptions = React.useMemo(() => [
    { value: '5mi', label: '5mi' },
    { value: '10mi', label: '10mi' },
    { value: '15mi', label: '15mi' },
    { value: '30mi', label: '30mi' },
    { value: '50mi', label: '50mi' },
  ], []);

  const fetchAreaVenues = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = { perPage: 200, page: 1 };
      if (selectedLocation?.lat) params.lat = selectedLocation.lat;
      if (selectedLocation?.lon) params.lon = selectedLocation.lon;
      if (distance) params.distance = distance;

      const res = await searchVenues(params);
      const data = res.data || [];
      setAreaVenues(data);
      setDisplayedVenues(data.slice(0, perPage));
      const total = (res.meta?.total || res.pagination?.total) ?? data.length;
      setHasMore(data.length < total);
      setPage(1);
    } catch (e) {
      console.error("Salon area fetch failed", e);
      setAreaVenues([]);
      setDisplayedVenues([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, distance]);

  React.useEffect(() => {
    const sp = searchParams;
    const q = sp?.get("q") || "";
    if (q && q !== query) setQuery(q);
  }, [searchParams]);

  React.useEffect(() => {
    void fetchAreaVenues();
  }, [fetchAreaVenues]);

  // debounce local filtering of areaVenues
  const queryDebounceRef = React.useRef(null);
  React.useEffect(() => {
    clearTimeout(queryDebounceRef.current);
    queryDebounceRef.current = setTimeout(() => {
      const q = (query || "").trim().toLowerCase();
      if (!q) {
        setDisplayedVenues(areaVenues.slice(0, perPage));
        setHasMore(areaVenues.length > perPage);
        setPage(1);
        return;
      }
      const filtered = areaVenues.filter((v) => {
        const name = (v.venue?.name || "").toLowerCase();
        const addr = (v.address?.formatted || "").toLowerCase();
        return name.includes(q) || addr.includes(q);
      });
      setDisplayedVenues(filtered.slice(0, perPage));
      setHasMore(filtered.length > perPage);
      setPage(1);
    }, 300);
    return () => clearTimeout(queryDebounceRef.current);
  }, [query, areaVenues]);

  const loadMore = React.useCallback(() => {
    if (loading || !hasMore) return;
    const start = page * perPage;
    const next = areaVenues.slice(start, start + perPage);
    if (next.length === 0) return;
    setDisplayedVenues((prev) => [...prev, ...next]);
    setPage((p) => p + 1);
    setHasMore(areaVenues.length > (start + next.length));
  }, [loading, hasMore, page, areaVenues]);

  const handleSearchNavigate = async () => {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (selectedLocation?.address) params.append("loc", selectedLocation.address);
    if (selectedLocation?.lat) params.append("lat", selectedLocation.lat);
    if (selectedLocation?.lon) params.append("lon", selectedLocation.lon);
    if (distance) params.append("distance", distance);
    await router.push(`/salon/search?${params.toString()}`);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden pt-2 pb-0 md:pt-4">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}&libraries=maps,places&v=weekly&loading=async`}
        strategy="lazyOnload"
        onLoad={() => setMapsReady(true)}
      />

      {/* Full-width search bar */}
      <div className="relative w-full flex justify-center px-5 sm:px-6 pb-4 z-30">
        <div className="max-w-4xl w-full">
          <div className="relative">
            <div className="hidden sm:flex h-11 items-center rounded-full border border-black/80 bg-white/95 px-2 shadow-[0_18px_45px_rgba(0,0,0,0.14)] ring-2 ring-black/10 backdrop-blur-xl">
              {/* Search Services */}
              <div className="flex items-center flex-1 px-3">
                <Search className="w-4 h-4 text-black mr-2 flex-shrink-0" />

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search salons by name"
                  className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                />
              </div>

              <span className="text-black/25 text-xs select-none">|</span>

              <div className="flex items-center w-56 px-3">
                <LocationSearch onSelect={(loc) => setSelectedLocation(loc)} initialLabel={initialLocationLabel} />
              </div>
            </div>

            {/* Mobile Layout: Stacked (search + location) */}
            <div className="sm:hidden space-y-2 bg-transparent">
              {/* Search Input */}
              <div className="h-[35px] flex items-center rounded-md border border-black/70 bg-white px-2 shadow-sm">
                <Search className="w-3.5 h-3.5 text-black mr-1.5 flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search salons..."
                  className="w-full bg-transparent outline-none text-xs text-gray-700 placeholder:text-sm placeholder-gray-400"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
                    aria-label="Clear search"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Location Input */}
              <div className="h-[35px] flex items-center rounded-md border border-black/70 bg-white px-2 shadow-sm">
                <LocationSearch
                  value={selectedLocation?.address || initialLocationLabel}
                  mapsReady={mapsReady}
                  onLocationChange={(loc) => setSelectedLocation(loc)}
                  onLocationFocus={() => {}}
                  placeholder="Location..."
                  className="w-full"
                />
              </div>
            </div>


          </div>
        </div>
      </div>
      <div className="container mx-auto px-1 sm:px-1 mt-5">
        {/* Controls row: distance select (left) and Show Map (right) */}
        <div className="flex items-center justify-between gap-3 mb-2 mt-0">
          <div className="w-40">
            <Select
              instanceId="salon-distance"
              options={distanceOptions}
              value={distanceOptions.find((o) => o.value === distance)}
              onChange={(opt) => setDistance(opt?.value || '50mi')}
              isSearchable={false}
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({ ...base, minHeight: '32px', height: '32px', borderRadius: '6px', boxShadow: 'none' }),
                valueContainer: (base) => ({ ...base, height: '32px', padding: '0 8px' }),
                indicatorsContainer: (base) => ({ ...base, height: '32px' }),
                singleValue: (base) => ({ ...base, lineHeight: '32px' }),
                placeholder: (base) => ({ ...base, lineHeight: '32px' }),
                menu: (base) => ({ ...base, zIndex: 60 }),
              }}
            />
          </div>

          <div className="flex-1" />

          <div>
            <button
              type="button"
              onClick={() => setShowMap((s) => !s)}
              className="h-8 px-3 border border-gray-200 rounded-md flex items-center gap-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </div>
          {showMap ? (
          <div className="flex flex-1 overflow-hidden h-[calc(100vh-200px)] relative">
            <div className="flex-1 md:flex-none md:w-1/2 overflow-y-auto pl-0 pr-4 py-2">
              <div className="max-w-2xl mx-auto">
                <VenueSearchResultsList
                  venues={displayedVenues}
                  selectedLocation={selectedLocation}
                  showMap={showMap}
                  loading={loading}
                  hasMore={hasMore}
                  loadMoreRef={null}
                  hideServices={true}
                  expandedOpeningHours={expandedOpeningHours}
                  toggleOpeningHours={toggleOpeningHours}
                  expandedGroups={expandedGroups}
                  toggleGroup={toggleGroup}
                />
              </div>
            </div>

            <div className="hidden md:block w-1/2 bg-white border-l border-gray-200 h-full">
              {(mapsReady || (typeof window !== 'undefined' && window?.google?.maps)) ? (
                <VenueMap venues={areaVenues} selectedLocation={selectedLocation} searchDistance={distance} router={router} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">Loading map...</div>
              )}
            </div>
          </div>
          ) : (
          <div className="w-full overflow-y-auto px-0 py-2">
            <VenueSearchResultsList
              venues={displayedVenues}
              selectedLocation={selectedLocation}
              showMap={showMap}
              loading={loading}
              hasMore={hasMore}
              loadMoreRef={null}
              hideServices={true}
              expandedOpeningHours={expandedOpeningHours}
              toggleOpeningHours={toggleOpeningHours}
              expandedGroups={expandedGroups}
              toggleGroup={toggleGroup}
            />
          </div>
        )}
      </div>
    </div>
  );
}
