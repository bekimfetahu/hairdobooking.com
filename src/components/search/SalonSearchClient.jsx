"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Search, Maximize2 } from "lucide-react";
import { cn } from '@/lib/utils';
import LocationSearch from "@/components/search/LocationSearch";
import VenueSearchResultsList from "@/components/search/VenueSearchResultsList";
import VenueSearchResultCardSkeleton from "@/components/search/VenueSearchResultCardSkeleton";
import Select from 'react-select';
import useGoogleMapsReady from '@/hooks/useGoogleMapsReady';
import { createPortal } from 'react-dom';
import SalonMobileMapPortal from '@/components/search/SalonMobileMapPortal';
import useSalonSearch from '@/components/search/useSalonSearch';

function VenueMap({ selectedLocation, searchDistance, router, mapsReady }) {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markersRef = React.useRef([]);
  const mapVenuesRef = React.useRef(new Map()); // Track all venues loaded by map bounds
  const infoWindowRef = React.useRef(null); // Info window for marker details
  const zoomDebounceRef = React.useRef(null);
  const isInitialRenderRef = React.useRef(true); // Track first render to fit bounds only once
  const markerClickTimeRef = React.useRef(0); // Track last marker click time to ignore bounds_changed
  
  // Map-independent state
  const [mapVenues, setMapVenues] = React.useState([]); // All venues fetched by map
  const [isFullscreen, setIsFullscreen] = React.useState(false); // Fullscreen mode state

  // Helper to create Google Maps-style marker icon
  const createMarkerIcon = (color = '#dc2626') => {
    // Google Maps-style teardrop marker in red brand color - SMALLER and THINNER
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 28 40">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-opacity="0.25"/>
        </filter>
      </defs>
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26c0-7.732-6.268-14-14-14z" fill="${color}" stroke="white" stroke-width="0.8"/>
      <circle cx="14" cy="12" r="4.5" fill="white"/>
    </svg>`;
    try {
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    } catch (e) {
      // btoa may be unavailable in some environments; fallback to encodeURI
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }
  };

  // Helper to show venue info window on marker click
  const showVenueInfoWindow = (marker, venue) => {
    const name = venue.name || venue.venue?.name || 'Venue';
    const address = venue.address || venue.venue?.address_formatted || 'No address';
    const imageUrl = venue.primary_image; // Backend now returns full URL
    const slug = venue.slug || venue.venue?.slug;

    // Record marker click time to prevent bounds_changed from triggering fetch
    markerClickTimeRef.current = Date.now();

    let contentHtml = `
      <div style="max-width: 280px; padding: 8px; font-family: system-ui, -apple-system, sans-serif;">
        ${imageUrl ? `<img src="${imageUrl}" alt="${name}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 4px; margin-bottom: 6px;" />` : ''}
        <h3 style="margin: 4px 0; font-size: 15px; font-weight: 600;">${name}</h3>
        <p style="margin: 4px 0; font-size: 12px; color: #666;">${address}</p>
        ${slug ? `<a href="/salon/${slug}" style="color: #dc2626; text-decoration: none; font-weight: 500; font-size: 13px; display: inline-block; margin-top: 4px;">View Details →</a>` : ''}
      </div>
    `;

    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }

    infoWindowRef.current.setContent(contentHtml);
    infoWindowRef.current.open(mapInstanceRef.current, marker);
  };

  // Fetch venues based on current map bounds (what user sees)
  const fetchVenuesByBounds = React.useCallback(async () => {
    if (!mapInstanceRef.current || !selectedLocation) {
      console.log('[VenueMap] fetchVenuesByBounds: skipped - map or selectedLocation not ready');
      return;
    }

    const bounds = mapInstanceRef.current.getBounds();
    if (!bounds) {
      console.log('[VenueMap] fetchVenuesByBounds: skipped - bounds not available');
      return;
    }

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    try {
      const params = new URLSearchParams();
      params.append('lat', selectedLocation.lat);
      params.append('lon', selectedLocation.lon);
      params.append('neLat', ne.lat());
      params.append('neLon', ne.lng());
      params.append('swLat', sw.lat());
      params.append('swLon', sw.lng());

      const url = `/api/search/venues-by-zoom?${params}`;
      console.log('[VenueMap] Fetching from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`[VenueMap] Fetch failed with status ${response.status}:`, errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      const newVenues = data.data || [];

      console.log(`[VenueMap] Fetched ${newVenues.length} venues (total in area: ${data.total})`);

      // Replace all venues (not merge) - map shows what's currently visible
      mapVenuesRef.current.clear();
      newVenues.forEach((venue) => {
        mapVenuesRef.current.set(venue.uuid, venue);
      });

      const allVenuesArray = Array.from(mapVenuesRef.current.values());
      setMapVenues(allVenuesArray);
    } catch (error) {
      console.error('[VenueMap] Failed to fetch venues by bounds:', error.message || error);
    }
  }, [selectedLocation]);

  // Render all markers on the map (map-independent)
  const rerenderMarkers = React.useCallback(() => {
    if (!mapInstanceRef.current || typeof window === "undefined") return;

    // clear old markers
    markersRef.current.forEach((m) => m.marker?.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    // Add unmarked blue markers for all venues
    mapVenues.forEach((venue) => {
      const lat = venue.lat;
      const lon = venue.lon;
      if (!lat || !lon) return;
      
      const position = { lat, lng: lon };

      const marker = new window.google.maps.Marker({ 
        position, 
        map: mapInstanceRef.current, 
        title: venue.name,
        icon: {
          url: createMarkerIcon(),
          scaledSize: new window.google.maps.Size(20, 28),
          anchor: new window.google.maps.Point(10, 28),
        }
      });
      marker.addListener("click", () => {
        showVenueInfoWindow(marker, venue);
      });
      markersRef.current.push({ marker });
      bounds.extend(position);
    });

    try {
      if (!bounds.isEmpty() && isInitialRenderRef.current) {
        console.log('[VenueMap] Initial bounds fit - fitting markers to view');
        mapInstanceRef.current.fitBounds(bounds, 50);
        isInitialRenderRef.current = false; // Only fit bounds on initial render
      }
    } catch (e) {
      // ignore
    }
  }, [mapVenues]);

  // Initialize map and set up bounds_changed listener
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mapsReady) return;
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

      // Add bounds_changed event listener for dynamic venue loading
      // This fires when user zooms or pans the map
      mapInstanceRef.current.addListener('bounds_changed', () => {
        // Skip if still in initial render (avoid extra fetches)
        if (isInitialRenderRef.current) {
          console.log('[VenueMap] Skipping bounds_changed during initial render');
          return;
        }
        
        // Skip if marker was clicked recently (within 500ms) - prevents closing info window
        const timeSinceClick = Date.now() - markerClickTimeRef.current;
        if (timeSinceClick < 500) {
          console.log('[VenueMap] Skipping bounds_changed after marker click');
          return;
        }
        
        clearTimeout(zoomDebounceRef.current);
        zoomDebounceRef.current = setTimeout(() => {
          console.log('[VenueMap] User zoom/pan detected, fetching venues...');
          fetchVenuesByBounds();
        }, 800); // Debounce by 800ms to avoid excessive API calls
      });

      // Initial fetch at current bounds
      console.log('[VenueMap] Map initialized, scheduling initial fetch...');
      setTimeout(() => fetchVenuesByBounds(), 200);
    } else {
      mapInstanceRef.current.setCenter(center);
    }

    return () => {
      if (zoomDebounceRef.current) {
        clearTimeout(zoomDebounceRef.current);
      }
    };
  }, [selectedLocation, mapsReady]);

  // Separate effect: render markers when map venues change
  React.useEffect(() => {
    console.log('[VenueMap] Map venues changed, re-rendering markers...');
    rerenderMarkers();
  }, [mapVenues]);

  // Listen for fullscreen changes (e.g., when user presses ESC)
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

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

  const handleFullscreen = () => {
    if (!mapRef.current) return;

    if (!isFullscreen) {
      // Request fullscreen
      if (mapRef.current.requestFullscreen) {
        mapRef.current.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else if (mapRef.current.webkitRequestFullscreen) {
        mapRef.current.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen?.();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />

      {/* Zoom + Fullscreen Controls */}
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

      {/* Fullscreen Button */}
      <div className="absolute bottom-4 right-4 z-10">
        <button
          onClick={handleFullscreen}
          className="w-10 h-10 bg-white border border-gray-300 rounded-md shadow-md hover:bg-gray-50 hover:shadow-lg transition-all flex items-center justify-center text-gray-700"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

}

export default function SalonSearchClient({
  initialVenues = [],
  initialMeta = null,
  initialLocationLabel = "",
  initialLocationLat = null,
  initialLocationLon = null,
  initialDistance = "50mi",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const scrollContainerRef = React.useRef(null);

  const {
    displayedVenues,
    totalVenues,
    page,
    hasMore,
    loading,
    query,
    distance,
    selectedLocation,
    loadMoreRef,
    handleDistanceChange,
    handleLocationChange,
    handleQueryChange,
  } = useSalonSearch({
    initialVenues,
    initialMeta,
    initialLocationLabel,
    initialLocationLat,
    initialLocationLon,
    initialDistance,
    initialQuery: searchParams?.get('q') || '',
    scrollContainerRef,
  });

  const [showMap, setShowMap] = React.useState(false);
  const [showMobileMap, setShowMobileMap] = React.useState(false);
  const [mobilePortalEl, setMobilePortalEl] = React.useState(null);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const el = document.createElement('div');
    el.setAttribute('id', 'salon-mobile-map-portal');
    document.body.appendChild(el);
    setMobilePortalEl(el);
    return () => {
      try { document.body.removeChild(el); } catch (e) {}
    };
  }, []);

  const [expandedOpeningHours, setExpandedOpeningHours] = React.useState(new Set());
  const toggleOpeningHours = (venueUuid) => {
    setExpandedOpeningHours((prev) => {
      const next = new Set(prev);
      if (next.has(venueUuid)) next.delete(venueUuid);
      else next.add(venueUuid);
      return next;
    });
  };

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

  const perPage = 6;
  const distanceOptions = React.useMemo(() => [
    { value: '5mi', label: '5mi' },
    { value: '10mi', label: '10mi' },
    { value: '15mi', label: '15mi' },
    { value: '30mi', label: '30mi' },
    { value: '50mi', label: '50mi' },
  ], []);

  const mapsReady = useGoogleMapsReady();

  React.useEffect(() => {
    const sp = searchParams;
    const q = sp?.get("q") || "";
    if (q && q !== query) handleQueryChange(q);
  }, [searchParams]);

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
    <div className="relative w-full h-screen overflow-hidden pt-2 pb-0 md:pt-4 flex flex-col">
      {/* Full-width search bar */}
      <div className="relative w-full flex justify-center px-5 sm:px-6 pb-4 z-30 flex-shrink-0">
        <div className="max-w-4xl w-full">
          <div className="relative">
            <div className="hidden sm:flex h-11 items-center rounded-full border border-black/80 bg-white/95 px-2 shadow-[0_18px_45px_rgba(0,0,0,0.14)] ring-2 ring-black/10 backdrop-blur-xl">
              {/* Search Services */}
              <div className="flex items-center flex-1 px-3">
                <Search className="w-4 h-4 text-black mr-2 flex-shrink-0" />

                <input
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Search salons by name"
                  className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                />
              </div>

              <span className="text-black/25 text-xs select-none">|</span>

              <div className="flex items-center w-80 px-3">
                <LocationSearch 
                  value={selectedLocation?.address || initialLocationLabel}
                  onLocationChange={handleLocationChange}
                  mapsReady={mapsReady}
                />
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
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Search salons..."
                  className="w-full bg-transparent outline-none text-xs text-gray-700 placeholder:text-sm placeholder-gray-400"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => handleQueryChange('')}
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
                  onLocationChange={handleLocationChange}
                  onLocationFocus={() => {}}
                  placeholder="Location..."
                  className="w-full"
                />
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Controls and stats (non-flex, shrink naturally) */}
      <div className="w-full mx-auto pl-4 pr-4 mt-5 flex-shrink-0">
        {/* Controls row: distance select (left) and Show Map (right) */}
        <div className="flex items-center justify-between gap-3 mb-2 mt-0">
          <div className="w-40">
            <Select
              instanceId="salon-distance"
              options={distanceOptions}
              value={distanceOptions.find((o) => o.value === distance)}
              onChange={(opt) => handleDistanceChange(opt?.value || '50mi')}
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

          <div className="hidden md:block flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowMap((s) => !s)}
              className="h-8 px-3 border border-gray-200 rounded-md flex items-center gap-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {showMap ? 'Close Map' : 'Show Map'}
            </button>
          </div>
        </div>

        {!showMap && (
          <div className="py-2 pl-0 pr-3 mb-2 flex-shrink-0">
            <p className="text-sm text-gray-700 font-normal">
              Showing {displayedVenues.length}/{totalVenues} {totalVenues === 1 ? 'salon' : 'salons'} within {distance} of {selectedLocation?.address || initialLocationLabel || 'selected location'}
            </p>
          </div>
        )}

        <SalonMobileMapPortal
          showMobileMap={showMobileMap}
          setShowMobileMap={setShowMobileMap}
          selectedLocation={selectedLocation}
          distance={distance}
          router={router}
          mapsReady={mapsReady}
          VenueMap={VenueMap}
        />
      </div>

      {/* Main content section - takes remaining space */}
      <section className="flex flex-1 overflow-hidden relative w-full">
        {/* Salons Results View - Full width when map is hidden */}
        {!showMap && (
          <div ref={scrollContainerRef} className="w-full h-full overflow-y-auto relative show-scrollbar">
            <div className="container mx-auto pl-0 pr-0 sm:pr-1 py-4">
              {/* Show skeletons while loading and no venues yet */}
              {loading && displayedVenues.length === 0 ? (
                <div className="md:grid md:grid-cols-2 gap-4 hidden">
                  {[...Array(6)].map((_, i) => (
                    <VenueSearchResultCardSkeleton key={`skeleton-${i}`} />
                  ))}
                </div>
              ) : (
                <>
                  <VenueSearchResultsList
                    venues={displayedVenues}
                    selectedLocation={selectedLocation}
                    showMap={showMap}
                    loading={loading}
                    hasMore={hasMore}
                    loadMoreRef={loadMoreRef}
                    hideServices={true}
                    expandedOpeningHours={expandedOpeningHours}
                    toggleOpeningHours={toggleOpeningHours}
                    expandedGroups={expandedGroups}
                    toggleGroup={toggleGroup}
                  />
                  {/* Show loading indicator at bottom while fetching more */}
                  {loading && displayedVenues.length > 0 && hasMore && (
                    <div className="py-4 flex justify-center">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-600">Loading more salons...</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Map View - Full screen when map is shown */}
        {showMap && (
          <div className="container mx-auto pl-0 pr-1 sm:pr-1 w-full h-full overflow-hidden flex flex-col">
            {/* Map Container */}
            {(mapsReady || (typeof window !== 'undefined' && window?.google?.maps)) ? (
              <div className="flex-1 w-full overflow-hidden border border-gray-200 rounded-md">
                <VenueMap
                  selectedLocation={selectedLocation}
                  searchDistance={distance}
                  router={router}
                  mapsReady={mapsReady}
                />
              </div>
            ) : (
              <div className="flex-1 w-full flex items-center justify-center text-gray-500">
                Loading map...
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
