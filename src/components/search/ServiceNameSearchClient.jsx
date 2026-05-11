"use client";

import React from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Filter, ChevronDown, MapPin, Search, Clock, ChevronUp } from "lucide-react";
import LocationSearch from "@/components/search/LocationSearch";
import PillCarousel from "@/components/content/PillCarousel";
import VenueSearchResultCard from "@/components/search/VenueSearchResultCard";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { useServiceSearch } from "@/hooks/useServiceSearch";
import { searchVenues } from "@/services/search/searchService";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/iconMap";

function formatMoney(value) {
  if (value == null) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : `£${n.toFixed(2)}`;
}

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * VenueMap Component - Displays all venues on a Google Map
 * Simplified version based on PreferredSalonSearch pattern
 */
function VenueMap({ venues, selectedLocation, serviceName, searchDistance, router }) {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markersRef = React.useRef([]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.google?.maps || !mapRef.current) return;

    // Calculate center from selected location or first venue
    let center = { lat: 51.5074, lng: -0.1278 }; // London default
    if (selectedLocation) {
      center = { lat: selectedLocation.lat, lng: selectedLocation.lon };
    } else if (venues.length > 0 && venues[0]?.address?.location) {
      const loc = venues[0].address.location;
      center = { lat: loc.lat, lng: loc.lon };
    }

    // Initialize map if needed (use direct constructor like PreferredSalonSearch)
    if (!mapInstanceRef.current) {
      try {
        // Ensure Map constructor is available
        if (typeof window.google?.maps?.Map !== 'function') {
          console.warn('[VenueMap] Map constructor not ready yet');
          return;
        }
        
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          zoom: 12,
          center,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        });
      } catch (err) {
        console.error('[VenueMap] Map constructor error:', err);
        return;
      }
    } else {
      mapInstanceRef.current.setCenter(center);
    }

    try {

        // Clear existing markers
        markersRef.current.forEach(({ marker }) => marker?.setMap(null));
        markersRef.current = [];

        // Ensure Marker and LatLngBounds are available
        if (typeof window.google?.maps?.Marker !== 'function' || typeof window.google?.maps?.LatLngBounds !== 'function') {
          console.warn('[VenueMap] Marker or LatLngBounds not ready yet');
          return;
        }

        // Add markers for each venue
        const bounds = new window.google.maps.LatLngBounds();
        
        venues.forEach((venue, index) => {
          const venueLocation = venue.address?.location;
          if (!venueLocation) return;

          const position = { lat: venueLocation.lat, lng: venueLocation.lon };
          
          const marker = new window.google.maps.Marker({
            position,
            map: mapInstanceRef.current,
            title: venue.venue?.name || "Venue",
            label: {
              text: String(index + 1),
              color: "#fff",
              fontWeight: "bold",
            },
          });

          const infoContent = `
            <div style="padding: 8px; max-width: 250px; cursor: pointer;" class="venue-info-popup" data-slug="${venue.venue?.slug}">
              <p style="font-weight: 600; margin: 0 0 4px 0; font-size: 14px; text-decoration: underline; color: #2563eb;">${venue.venue?.name || "Venue"}</p>
              <p style="margin: 0; font-size: 12px; color: #666;">${venue.address?.formatted || ""}</p>
            </div>
          `;

          // Ensure InfoWindow is available
          if (typeof window.google?.maps?.InfoWindow !== 'function') {
            console.warn('[VenueMap] InfoWindow not ready yet');
            return;
          }

          const infoWindow = new window.google.maps.InfoWindow({
            content: infoContent,
          });

          marker.addListener("click", () => {
            // Close all other info windows
            markersRef.current.forEach(entry => {
              if (entry.infoWindow) entry.infoWindow.close();
            });
            infoWindow.open(mapInstanceRef.current, marker);
            
            // Add click listener to info window content
            setTimeout(() => {
              const popupElement = document.querySelector('.venue-info-popup');
              if (popupElement) {
                popupElement.addEventListener('click', () => {
                  const slug = popupElement.getAttribute('data-slug');
                  if (slug && router) {
                    router.push(`/salon/${slug}`);
                  }
                });
              }
            }, 0);
          });

          markersRef.current.push({
            marker,
            infoWindow,
            uuid: venue.venue?.uuid,
          });

          bounds.extend(position);
        });

        // Fit bounds with proper sequence
        if (venues.length > 0 && selectedLocation) {
          // Single resize before fitBounds (don't trigger after)
          window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
          
          setTimeout(() => {
            if (mapInstanceRef.current && venues.length > 0) {
              try {
                // Parse searchDistance (e.g., "10km" -> 10)
                const distanceMatch = (searchDistance || "10km").match(/(\d+)/);
                const distanceKm = distanceMatch ? parseInt(distanceMatch[1]) : 10;
                const totalRadiusKm = distanceKm + 5; // Add 5km buffer

                // Create a bounds around the search location with the specified radius
                const R = 6371; // Earth's radius in km
                const lat = (selectedLocation.lat * Math.PI) / 180;
                const lon = (selectedLocation.lon * Math.PI) / 180;
                const d = totalRadiusKm / R;

                const searchBounds = new window.google.maps.LatLngBounds();
                
                // Add points around the search location to define the radius
                const offsetLat = (d * 180) / Math.PI;
                const offsetLon = (d * 180) / (Math.PI * Math.cos(lat));

                searchBounds.extend(new window.google.maps.LatLng(
                  selectedLocation.lat + offsetLat,
                  selectedLocation.lon
                ));
                searchBounds.extend(new window.google.maps.LatLng(
                  selectedLocation.lat - offsetLat,
                  selectedLocation.lon
                ));
                searchBounds.extend(new window.google.maps.LatLng(
                  selectedLocation.lat,
                  selectedLocation.lon + offsetLon
                ));
                searchBounds.extend(new window.google.maps.LatLng(
                  selectedLocation.lat,
                  selectedLocation.lon - offsetLon
                ));

                // Fit to search bounds (will show the search radius with buffer)
                mapInstanceRef.current.fitBounds(searchBounds, 50);
              } catch (err) {
                console.error('[VenueMap] fitBounds error:', err);
              }
            }
          }, 50);
        }
    } catch (err) {
      console.error('[VenueMap] Map error:', err);
    }

    return () => {
      markersRef.current.forEach(({ marker }) => marker?.setMap(null));
    };
  }, [venues, selectedLocation]);

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
    <div className="w-full h-full relative">
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

export default function ServiceNameSearchClient({
  serviceName = "",
  initialVenues = [],
  initialFeaturedServices = [],
  initialLocationLabel = "",
  initialLocationLat = null,
  initialLocationLon = null,
  initialDistance = "10km",
  initialCategories = null,
  initialAudiences = null,
}) {
  const router = useRouter();
  const [venues, setVenues] = React.useState(initialVenues);
  const [loading, setLoading] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [mapsReady, setMapsReady] = React.useState(false);
  const [expandedFilter, setExpandedFilter] = React.useState(null);
  const [searchDistance, setSearchDistance] = React.useState(initialDistance);
  const [selectedLocation, setSelectedLocation] = React.useState(
    Number.isFinite(initialLocationLat) && Number.isFinite(initialLocationLon)
      ? { lat: initialLocationLat, lon: initialLocationLon, address: initialLocationLabel }
      : null
  );
  const [isDefaultLocationLoaded, setIsDefaultLocationLoaded] = React.useState(
    Number.isFinite(initialLocationLat) && Number.isFinite(initialLocationLon)
  );

  // Featured services state
  const [featuredServices, setFeaturedServices] = React.useState(initialFeaturedServices);
  const [showFeaturedPills, setShowFeaturedPills] = React.useState(initialFeaturedServices.length > 0);
  const [featuredLoading, setFeaturedLoading] = React.useState(initialFeaturedServices.length === 0);

  // Mobile map bottom sheet state
  const [showMobileMap, setShowMobileMap] = React.useState(false);

  // Map visibility toggle
  const [showMap, setShowMap] = React.useState(false);

  // Service search input state
  const [serviceQuery, setServiceQuery] = React.useState(serviceName || "");
  const [activeServiceName, setActiveServiceName] = React.useState(serviceName || "");
  const [showServiceDropdown, setShowServiceDropdown] = React.useState(false);
  const [selectedServiceOrSalon, setSelectedServiceOrSalon] = React.useState(false); // Track if service/salon is selected
  // Tracks which service groups are expanded: Set of "venueUuid::groupKey"
  const [expandedGroups, setExpandedGroups] = React.useState(new Set());
  // Tracks which venue has opening hours expanded: Set of venueUuid
  const [expandedOpeningHours, setExpandedOpeningHours] = React.useState(new Set());
  const serviceSearchRef = React.useRef(null);
  const serviceDebounceRef = React.useRef(null);
  const geocoderRef = React.useRef(null);
  const loadMoreRef = React.useRef(null);
  const suppressNextFocusRef = React.useRef(false);
  const dropdownLockRef = React.useRef(false);

  const { options: filterOptions, selectedFilters, toggleFilter, clearFilters } = useSearchFilters();
  const { results: serviceResults, loading: serviceSearchLoading, search: searchServices } = useServiceSearch();

  /**
   * From a venue ES response, return all services whose global_service_uuid matches the searched UUID,
   * or fallback to canonical service name (case-insensitive) if no UUID is present.
   * 
   * Service object structure from VenueSearchResource:
   * - name: canonical service name (e.g., "Hair Cut")
   * - display_name: variant display name (e.g., "Hair Cut Long Hair")
   * - global_service_uuid: UUID of canonical service
   */
  function getMatchedServices(venue, serviceName) {
    const all = venue?.services || [];
    if (serviceName) {
      const lower = serviceName.toLowerCase();
      // Match against 'name' (canonical name from service_canonical_name)
      return all.filter((s) => (s.name || '').toLowerCase() === lower);
    }
    return all;
  }

  /**
   * Group all matched services into a single group per venue, keyed by the
   * shared canonical service name. Returns array of { key, label, items }.
   */
  function groupMatchedServices(services) {
    if (services.length === 0) return [];
    // Group by canonical name (all variants of the same service have the same 'name')
    const label = services[0].name || "";
    return [{ key: label, label, items: services }];
  }

  // Handle service query input with debounce
  const handleServiceQueryChange = (e) => {
    const val = e.target.value;
    setServiceQuery(val);
    clearTimeout(serviceDebounceRef.current);
    if (val.trim().length >= 1) {
      serviceDebounceRef.current = setTimeout(() => {
        // Only open dropdown if not locked (i.e., not in the middle of a selection)
        if (!dropdownLockRef.current) {
          // Search services with location AND filter parameters
          void searchServices({ 
            q: val.trim(), 
            perPage: 8,
            lat: selectedLocation?.lat,
            lon: selectedLocation?.lon,
            distance: searchDistance,
            category: selectedFilters.categories?.length ? selectedFilters.categories.join(',') : undefined,
            audience: selectedFilters.audiences?.length ? selectedFilters.audiences.join(',') : undefined,
          });
          setShowServiceDropdown(true);
        }
      }, 300);
    } else {
      setShowServiceDropdown(false);
    }
  };

  // Define fetchVenues here so handleServiceSelect can call it
  const fetchVenues = React.useCallback(
    async ({
      location = selectedLocation,
      distance = searchDistance,
      filters = selectedFilters,
      activeService,
      page = 1,
      append = false,
    } = {}) => {
      // Assign defaults if not provided
      if (typeof activeService === 'undefined') activeService = activeServiceName;
      const isInitialLoad = page === 1;
      
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      try {
        const params = {
          lat: location?.lat,
          lon: location?.lon,
          distance,
          category: filters.categories?.length ? filters.categories.join(",") : undefined,
          audience: filters.audiences?.length ? filters.audiences.join(",") : undefined,
          perPage: 4,
          page,
        };
        if (activeService) {
          params.service = activeService;
        }
        const response = await searchVenues(params);
        const newVenues = response?.data || [];
        
        if (append) {
          setVenues(prev => [...prev, ...newVenues]);
        } else {
          setVenues(newVenues);
          setCurrentPage(1);
        }
        
        // Check if there are more results
        const totalResults = response?.total || 0;
        const loadedSoFar = append ? venues.length + newVenues.length : newVenues.length;
        setHasMore(loadedSoFar < totalResults);
        
        if (append) {
          setCurrentPage(page);
        }
      } catch (err) {
        if (!append) {
          setVenues([]);
        }
        console.error('[ServiceNameSearchClient] fetchVenues error:', err);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [activeServiceName, selectedLocation, searchDistance, selectedFilters, venues.length]
  );

  const handleServiceSelect = (service) => {
    // Just populate input and close dropdown - don't navigate yet
    // User must click search button to navigate with URL params
    dropdownLockRef.current = true;
    suppressNextFocusRef.current = true;
    setShowServiceDropdown(false);
    setSelectedServiceOrSalon(true);
    setServiceQuery(service.name);
    setActiveServiceName(service.name);
    // Blur the input to prevent focus from affecting dropdown
    if (serviceSearchRef.current?.querySelector('input')) {
      serviceSearchRef.current.querySelector('input').blur();
    }
    
    // Unlock dropdown after a brief delay to allow all state updates to settle
    setTimeout(() => {
      dropdownLockRef.current = false;
    }, 50);
  };

  // Handle search button click - navigate with URL params (like Hero)
  const handleSearchButtonClick = () => {
    if (!serviceQuery.trim()) return;
    
    const params = new URLSearchParams();
    params.set('q', serviceQuery);
    
    // Pass location details if available
    if (selectedLocation?.address) params.set('loc', selectedLocation.address);
    if (selectedLocation?.lat !== undefined) params.set('lat', String(selectedLocation.lat));
    if (selectedLocation?.lon !== undefined) params.set('lon', String(selectedLocation.lon));
    
    // Pass search distance
    if (searchDistance) params.set('distance', searchDistance);
    
    // Pass filters if any
    if (selectedFilters.categories?.length) params.set('categories', selectedFilters.categories.join(','));
    if (selectedFilters.audiences?.length) params.set('audiences', selectedFilters.audiences.join(','));
    
    // Navigate to search page with new params
    router.push(`/search/service?${params.toString()}`);
  };

  // Close service dropdown on outside click
  React.useEffect(() => {
    const handleClick = (e) => {
      if (serviceSearchRef.current && !serviceSearchRef.current.contains(e.target)) {
        setShowServiceDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Infinite scroll observer
  React.useEffect(() => {
    if (!hasMore || isLoadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading) {
          void fetchVenues({
            page: currentPage + 1,
            append: true,
          });
        }
      },
      { threshold: 0.1 }
    );

    // Store ref in local variable to avoid stale closure in cleanup
    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observer.observe(currentLoadMoreRef);
    }

    return () => {
      if (currentLoadMoreRef) {
        observer.unobserve(currentLoadMoreRef);
      }
    };
  }, [hasMore, isLoadingMore, loading, currentPage, fetchVenues]);

  // Initialize location: if no lat/lon, geocode location label or default to "London, UK"
  React.useEffect(() => {
    if (isDefaultLocationLoaded) return; // Only run once

    const initializeLocation = async () => {
      try {
        // If we already have lat/lon, we're done
        if (Number.isFinite(initialLocationLat) && Number.isFinite(initialLocationLon)) {
          setIsDefaultLocationLoaded(true);
          return;
        }

        // If Google Maps not ready yet, wait and try again
        if (!window.google?.maps || typeof window.google.maps.Geocoder !== 'function') {
          setTimeout(initializeLocation, 100);
          return;
        }

        // Determine what to geocode: use location label if provided, otherwise default to "London, UK"
        const addressToGeocode = initialLocationLabel || "London, UK";

        geocoderRef.current = new window.google.maps.Geocoder();

        // Geocode the address
        const results = await new Promise((resolve, reject) => {
          geocoderRef.current.geocode({ address: addressToGeocode }, (results, status) => {
            if (status === "OK" && results.length > 0) {
              resolve(results[0]);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });

        const { lat, lng } = results.geometry.location;
        const defaultLocation = {
          lat: lat(),
          lon: lng(),
          address: addressToGeocode,
          placeId: results.place_id,
        };

        setSelectedLocation(defaultLocation);
        setIsDefaultLocationLoaded(true);
      } catch (err) {
        // Geocoding error - mark as loaded anyway to avoid infinite loop
        console.error("[ServiceNameSearchClient] Location initialization error:", err);
        setIsDefaultLocationLoaded(true);
      }
    };

    initializeLocation();
  }, [isDefaultLocationLoaded, initialLocationLabel, initialLocationLat, initialLocationLon]);

  // Seed filters from URL params once filter options are available
  const seededRef = React.useRef(false);
  React.useEffect(() => {
    if (seededRef.current) return;
    if (!filterOptions.categories?.length && !filterOptions.audiences?.length) return;
    if (!initialCategories && !initialAudiences) { seededRef.current = true; return; }

    const catIds = initialCategories
      ? initialCategories.split(",").map(Number).filter(Boolean)
      : [];
    const audIds = initialAudiences
      ? initialAudiences.split(",").map(Number).filter(Boolean)
      : [];

    catIds.forEach((id) => {
      if (!selectedFilters.categories.includes(id)) toggleFilter("categories", id);
    });
    audIds.forEach((id) => {
      if (!selectedFilters.audiences.includes(id)) toggleFilter("audiences", id);
    });

    seededRef.current = true;
  }, [filterOptions, initialCategories, initialAudiences, selectedFilters, toggleFilter]);

  // Sync serviceName prop changes (e.g., when pill is clicked and URL changes)
  // The server has already fetched venues for the new service and passed them as initialVenues
  React.useEffect(() => {
    if (serviceName && serviceName !== activeServiceName) {
      setActiveServiceName(serviceName);
      setServiceQuery(serviceName);
    }
  }, [serviceName, activeServiceName]);

  // Client-side fallback: fetch featured services if not provided from SSR
  const featuredFetchedRef = React.useRef(false);
  React.useEffect(() => {
    if (featuredFetchedRef.current) return;
    // Always fetch featured services, regardless of whether serviceName is set
    if (featuredServices.length > 0) { // Already have them from SSR
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFeaturedLoading(false);
      featuredFetchedRef.current = true;
      return;
    }

    const fetchFeaturedServices = async () => {
      try {
        // Build URL with query parameters (location optional for featured services)
        const params = new URLSearchParams();
        // Pass location if available, otherwise no params (fallback to all services)
        if (selectedLocation?.lat && selectedLocation?.lon) {
          params.set('lat', String(selectedLocation.lat));
          params.set('lon', String(selectedLocation.lon));
          params.set('distance', searchDistance);
        }

        const url = `/api/search/featured-services${params.toString() ? '?' + params.toString() : ''}`;
        console.log('[ServiceNameSearchClient] Fetching featured services from:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            // If body isn't JSON, use the status message
          }
          throw new Error(`Failed to fetch featured services: ${errorMessage}`);
        }

        const data = await response.json();
        const services = data?.data || [];
        
        setFeaturedServices(services);
        setShowFeaturedPills(services.length > 0);
        setFeaturedLoading(false);
      } catch (err) {
        console.error('[ServiceNameSearchClient] Failed to fetch featured services:', err.message);
        setFeaturedLoading(false);
      }
    };

    featuredFetchedRef.current = true;
    void fetchFeaturedServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceName, featuredServices]);

  // Pre-fetch services for the initial serviceName when component mounts
  const serviceFetchedRef = React.useRef(false);
  React.useEffect(() => {
    if (serviceFetchedRef.current) return;
    if (!serviceName) return;
    
    serviceFetchedRef.current = true;
    // Fetch services matching the initial service name with location AND all filter parameters
    // Use initialCategories/initialAudiences directly since selectedFilters might not be seeded yet
    const categoryParam = initialCategories ? initialCategories : undefined;
    const audienceParam = initialAudiences ? initialAudiences : undefined;
    
    void searchServices({ 
      q: serviceName, 
      perPage: 8,
      lat: selectedLocation?.lat,
      lon: selectedLocation?.lon,
      distance: searchDistance,
      category: categoryParam,
      audience: audienceParam,
    });
  }, [serviceName, selectedLocation, searchDistance, searchServices, initialCategories, initialAudiences]);

  // Auto-select first featured service on page load (Browse mode)
  const featuredInitializedRef = React.useRef(false);
  const autoFetchVenuesRef = React.useRef(false);
  React.useEffect(() => {
    if (featuredInitializedRef.current) return;
    if (!showFeaturedPills) return;
    if (!isDefaultLocationLoaded) return; // Wait for location to be loaded
    if (featuredServices.length === 0) return;

    featuredInitializedRef.current = true;
    autoFetchVenuesRef.current = true; // Mark as fetched to prevent double-fetch in the autoFetch effect
    const firstFeatured = featuredServices[0];
    
    // Set service state - React 18 batches these updates automatically
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveServiceName(firstFeatured.name);
    setServiceQuery(firstFeatured.name);
    
    // Immediately fetch venues for the first featured service
    void fetchVenues({ activeService: firstFeatured.name });
  }, [showFeaturedPills, isDefaultLocationLoaded, featuredServices, selectedLocation?.address, selectedLocation?.lat, selectedLocation?.lon, searchDistance, router, fetchVenues]);

  // Fetch venues when activeServiceName changes (including auto-selected featured service)
  React.useEffect(() => {
    if (!activeServiceName) return;
    if (!isDefaultLocationLoaded) return;
    
    // Skip on initial render to avoid double-fetch
    if (!autoFetchVenuesRef.current) {
      autoFetchVenuesRef.current = true;
      return;
    }
    
    void fetchVenues({ activeService: activeServiceName });
  }, [activeServiceName, isDefaultLocationLoaded, fetchVenues]);

  const hasActiveFilters =
    (selectedFilters.categories?.length || 0) > 0 ||
    (selectedFilters.audiences?.length || 0) > 0;

  const handleLocationChange = (locationData) => {
    setSelectedLocation(locationData);
    void fetchVenues({ location: locationData });
  };

  const handleServiceClick = (venue, service) => {
    if (!venue?.venue?.slug || !service?.uuid) return;
    // Close dropdowns and mark as selected
    setShowServiceDropdown(false);
    setExpandedFilter(null);
    setSelectedServiceOrSalon(true);
    // Set search value to the venue name
    setServiceQuery(venue.venue.name || '');
  };

  const toggleGroup = (venueUuid, groupKey) => {
    const id = `${venueUuid}::${groupKey}`;
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getTodayDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const getTodayOpeningHours = (hours) => {
    if (!hours || !Array.isArray(hours) || hours.length === 0) return null;
    const todayDay = getTodayDayName();
    const todayHours = hours.find(h => h.day === todayDay);
    return todayHours;
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${minutes === '00' ? '' : ':' + minutes}${ampm}`;
  };

  const toggleOpeningHours = (venueUuid) => {
    setExpandedOpeningHours((prev) => {
      const next = new Set(prev);
      if (next.has(venueUuid)) next.delete(venueUuid);
      else next.add(venueUuid);
      return next;
    });
  };

  return (
    <div className="w-full min-h-screen">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}&libraries=maps,places&v=weekly&loading=async`}
        strategy="lazyOnload"
        onLoad={() => setMapsReady(true)}
      />

      {/* Full-width search bar */}
      <div className="w-full flex justify-center p-4 z-30">
        <div className="max-w-4xl w-full">
          <div ref={serviceSearchRef} className="relative">
            <div className="hidden sm:flex w-full h-11 bg-white rounded-full shadow-sm items-center px-2">
              {/* Search Services */}
              <div className="flex items-center flex-1 px-3">
                <Search className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={serviceQuery}
                  onChange={handleServiceQueryChange}
                  onFocus={() => {
                    if (suppressNextFocusRef.current) {
                      suppressNextFocusRef.current = false;
                      return;
                    }
                    setSelectedServiceOrSalon(false);
                    if (!dropdownLockRef.current) {
                      setShowServiceDropdown(true);
                    }
                  }}
                  placeholder="Search Services..."
                  className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                />
                {serviceQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setServiceQuery('');
                      setShowServiceDropdown(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Divider */}
              <span className="text-gray-300 text-xs select-none">|</span>

              {/* Location */}
              <div className="flex items-center w-56 px-3">
                <LocationSearch
                  value={selectedLocation?.address || initialLocationLabel}
                  mapsReady={mapsReady}
                  onLocationChange={(loc) => {
                    setSelectedLocation(loc);
                    setShowServiceDropdown(false);
                  }}
                  onLocationFocus={() => setShowServiceDropdown(false)}
                  placeholder="Location..."
                  className="w-full"
                />
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearchButtonClick}
                disabled={!serviceQuery.trim()}
                className="ml-2 h-8 px-4 rounded-full border border-gray-200 bg-[#f8f8f8] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center text-sm font-medium text-gray-800 shrink-0"
                aria-label="Search"
              >
                Search
              </button>
            </div>

            {/* Mobile Layout: Stacked */}
            <div className="sm:hidden space-y-2">
              {/* Search Input */}
              <div className="h-8 flex items-center bg-white rounded-md border border-black px-2 shadow-sm">
                <Search className="w-3.5 h-3.5 text-gray-500 mr-1.5 flex-shrink-0" />
                <input
                  type="text"
                  value={serviceQuery}
                  onChange={handleServiceQueryChange}
                  onFocus={() => {
                    if (suppressNextFocusRef.current) {
                      suppressNextFocusRef.current = false;
                      return;
                    }
                    setSelectedServiceOrSalon(false);
                    if (!dropdownLockRef.current) {
                      setShowServiceDropdown(true);
                    }
                  }}
                  placeholder="Search Services..."
                  className="w-full bg-transparent outline-none text-xs text-gray-700 placeholder-gray-400"
                />
                {serviceQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setServiceQuery('');
                      setShowServiceDropdown(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
                    aria-label="Clear search"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Location Input + Search Button - Same Row */}
              <div className="h-8 flex items-center gap-1.5">
                {/* Location Input */}
                <div className="flex-1 flex items-center bg-white rounded-md border border-black px-2 py-1 shadow-sm">
                  <LocationSearch
                    value={selectedLocation?.address || initialLocationLabel}
                    mapsReady={mapsReady}
                    onLocationChange={(loc) => {
                      setSelectedLocation(loc);
                      setShowServiceDropdown(false);
                    }}
                    onLocationFocus={() => setShowServiceDropdown(false)}
                    placeholder="Location..."
                    className="w-full"
                  />
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearchButtonClick}
                  disabled={!serviceQuery.trim()}
                  className="h-8 px-3 rounded-md border border-black bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center text-xs font-medium shrink-0"
                  aria-label="Search"
                >
                  Search
                </button>
              </div>
            </div>

          {/* Dropdown */}
          {showServiceDropdown && !selectedServiceOrSalon && (
            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-[9999] max-h-96 overflow-y-auto">
              {/* Filter toggle — right aligned, same as Hero */}
              <div className="flex items-center justify-end px-3 py-3 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setExpandedFilter(expandedFilter === "filters" ? null : "filters")}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1 rounded-lg border transition-all",
                    hasActiveFilters
                      ? "border-primary text-primary bg-blue-50"
                      : "border-gray-300 text-gray-700 bg-white hover:border-gray-400"
                  )}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Filters{hasActiveFilters && ` (${(selectedFilters.categories?.length || 0) + (selectedFilters.audiences?.length || 0)})`}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", expandedFilter === "filters" && "rotate-180")} />
                </button>
              </div>

              {/* Expandable filter panel */}
              {expandedFilter === "filters" && (
                <div className="p-3 border-b border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    {filterOptions.categories?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 mb-2">Categories</h4>
                        <div className="space-y-2">
                          {filterOptions.categories.map((cat) => {
                            const Icon = getIcon(cat.icon);
                            return (
                              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedFilters.categories?.includes(cat.id) || false}
                                  onChange={() => toggleFilter("categories", cat.id)}
                                  className="w-4 h-4 rounded border-gray-300"
                                />
                                {Icon && <Icon className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                                <span className="text-sm text-gray-700">{cat.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {filterOptions.audiences?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 mb-2">Audience</h4>
                        <div className="space-y-2">
                          {filterOptions.audiences.map((aud) => {
                            const Icon = getIcon(aud.icon);
                            return (
                              <label key={aud.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedFilters.audiences?.includes(aud.id) || false}
                                  onChange={() => toggleFilter("audiences", aud.id)}
                                  className="w-4 h-4 rounded border-gray-300"
                                />
                                {Icon && <Icon className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                                <span className="text-sm text-gray-700">{aud.name}</span>
                              </label>
                            );
                          })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-xs font-semibold text-gray-900 mb-3">Search Distance</h4>
                          <div className="flex gap-4">
                            {["5km", "10km", "15km", "30km"].map((d) => (
                              <label key={d} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="sn-distance"
                                  checked={searchDistance === d}
                                  onChange={() => {
                                    setSearchDistance(d);
                                    void fetchVenues({ distance: d });
                                  }}
                                  className="w-4 h-4 text-blue-600 border-gray-300"
                                />
                                <span className="text-sm text-gray-700">{d}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        clearFilters();
                        setSearchDistance("10km");
                        void fetchVenues({ filters: { categories: [], audiences: [] }, distance: "10km" });
                        setExpandedFilter(null);
                      }}
                      className="px-4 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => { void fetchVenues(); setExpandedFilter(null); setShowServiceDropdown(false); }}
                      className="px-4 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}

              {/* Service suggestions */}
              {serviceSearchLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </div>
                </div>
              ) : serviceResults.length > 0 ? (
                <>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 border-b border-gray-100">Services</div>
                  {serviceResults.map((service, i) => (
                    <button
                      key={service.name || i}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceSelect(service);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <p className="text-sm font-semibold text-gray-900">{service.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {Array.isArray(service.categories) && service.categories.length > 0
                            ? service.categories.join(", ")
                            : service.category || ""}
                        </p>
                        {service.venueCount > 0 && (
                          <p className="text-xs text-gray-500">
                            {service.venueCount} {service.venueCount === 1 ? "location" : "locations"}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </>
              ) : serviceQuery.trim().length >= 1 && !featuredServices.some(s => s.name.toLowerCase() === serviceQuery.trim().toLowerCase()) ? (
                <div className="p-4 text-center text-sm text-gray-500">No services found for &quot;{serviceQuery}&quot;</div>
              ) : featuredServices.length > 0 ? (
                // Show featured services when: query matches featured service OR query is empty
                <>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 border-b border-gray-100">Featured Services</div>
                  {featuredServices.map((service, i) => (
                    <button
                      key={service.uuid || service.name || i}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceSelect(service);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <p className="text-sm font-semibold text-gray-900">{service.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {Array.isArray(service.categories) && service.categories.length > 0
                            ? service.categories.join(", ")
                            : service.category || ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
      </div>


      {/* Featured Services Pills — Show in browse mode (loading or loaded) — Stay visible when featured service is selected */}
      {showFeaturedPills && (
        <>
          {featuredLoading ? (
            // Loading state
            <div className="py-3 border-b border-gray-200 bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-8 bg-gray-200 rounded-full animate-pulse"
                      style={{ width: `${80 + i * 20}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : featuredServices.length > 0 ? (
            // Loaded state with carousel
            <div className="py-3 border-b border-gray-200 bg-white">
              <div className="max-w-7xl mx-auto">
                <PillCarousel
                  title="Popular Searches"
                  pills={featuredServices.map((service) => ({
                    id: service.uuid || service.name,
                    name: service.name,
                  }))}
                  activePillId={activeServiceName}
                  onPillClick={(pill) => {
                    const params = new URLSearchParams();
                    params.set('q', pill.name);
                    if (selectedLocation?.address) {
                      params.set('loc', selectedLocation.address);
                    }
                    if (selectedLocation?.lat && selectedLocation?.lon) {
                      params.set('lat', selectedLocation.lat);
                      params.set('lon', selectedLocation.lon);
                    }
                    if (searchDistance) {
                      params.set('distance', searchDistance);
                    }
                    if (selectedFilters.categories.length > 0) {
                      params.set('categories', selectedFilters.categories.join(','));
                    }
                    if (selectedFilters.audiences.length > 0) {
                      params.set('audiences', selectedFilters.audiences.join(','));
                    }
                    router.push(`/search/service?${params.toString()}`);
                  }}
                />
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Result count feedback with Show Map button */}
      {activeServiceName && !loading && venues.length > 0 && (() => {
        const venuesWithMatch = venues.filter(venue => {
          const matched = getMatchedServices(venue, activeServiceName).filter((s) => {
            if (selectedFilters.categories?.length && !selectedFilters.categories.includes(Number(s.category_id))) return false;
            if (selectedFilters.audiences?.length && !selectedFilters.audiences.includes(Number(s.audience_id))) return false;
            return true;
          });
          return matched.length > 0;
        });
        if (venuesWithMatch.length === 0) return null;
        return (
          <div className="py-2 px-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 font-medium">
                Showing {venuesWithMatch.length} {venuesWithMatch.length === 1 ? "salon" : "salons"} offering &quot;{activeServiceName}&quot;
              </p>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                {showMap ? "Hide Map" : "Show Map"}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Layout: 2 Columns (Grid view or List+Map) */}
      {activeServiceName && (
        <div className="flex flex-1 overflow-hidden h-[calc(100vh-200px)] relative">
          {/* Left Column: Venues List or Half-Grid */}
          <div className={showMap ? "flex-1 md:flex-none md:w-1/2 overflow-y-auto pl-0 pr-4 py-0" : "w-1/2 overflow-y-auto pl-4 pr-2 py-4"}>
          <div className={showMap ? "max-w-2xl mx-auto" : ""}>
            {/* Loading indicator when refreshing results */}
            {loading && venues.length > 0 && (
              <div className="flex items-center gap-2 py-2">
                <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-700">Searching for new results...</span>
              </div>
            )}

            {/* Venue cards */}
            {venues.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                {activeServiceName ? (
                  <>
                    No venues found offering &quot;{activeServiceName}&quot;
                    {hasActiveFilters && " with the selected filters"}.
                  </>
                ) : (
                  <>Select a service to see results</>
                )}
              </div>
            ) : (
              <div className={cn("space-y-4 transition-opacity duration-200", loading && "opacity-50 pointer-events-none")}>
                {/* When not showing map, show only left half of venues. When showing map, show all venues */}
                {(showMap ? venues : venues.slice(0, Math.ceil(venues.length / 2))).map((venue, vi) => {
                  return (
                    <VenueSearchResultCard
                      key={venue.venue?.uuid || vi}
                      venue={venue}
                      index={vi}
                      activeServiceName={activeServiceName}
                      selectedFilters={selectedFilters}
                      selectedLocation={selectedLocation}
                      expandedOpeningHours={expandedOpeningHours}
                      toggleOpeningHours={toggleOpeningHours}
                      expandedGroups={expandedGroups}
                      toggleGroup={toggleGroup}
                      handleServiceClick={handleServiceClick}
                    />
                  );
                  const matched = getMatchedServices(venue, activeServiceName).filter((s) => {
                    if (selectedFilters.categories?.length && !selectedFilters.categories.includes(Number(s.category_id))) return false;
                    if (selectedFilters.audiences?.length && !selectedFilters.audiences.includes(Number(s.audience_id))) return false;
                    return true;
                  });
                  if (matched.length === 0) return null;

                  const address =
                    venue.address?.formatted ||
                    [venue.address?.line1, venue.address?.line2, venue.address?.postcode]
                      .filter(Boolean)
                      .join(", ");

                  let distanceMiles = null;
                  const vLat = venue.address?.location?.lat;
                  const vLon = venue.address?.location?.lon;
                  if (selectedLocation?.lat && vLat && vLon) {
                    const distanceKm = calcDistance(
                      selectedLocation.lat,
                      selectedLocation.lon,
                      vLat,
                      vLon
                    );
                    distanceMiles = (distanceKm / 1.60934).toFixed(1);
                  }

                  return (
                    <div
                      key={venue.venue?.uuid || vi} 
                      className="overflow-hidden border-b border-gray-200 pt-4 pb-0"
                    >
                      {/* Venue header - Stacked on mobile, horizontal on desktop */}
                      <div className="flex flex-col md:flex-row md:items-start gap-2 pl-0 pr-0 md:pl-0 md:pr-0 pt-0 md:py-0">
                        {/* Image - Full width on mobile, fixed landscape on desktop */}
                        <div className="w-full md:w-48 h-40 md:h-32 bg-gray-100 flex-shrink-0 overflow-hidden rounded-md">
                          {venue.primary_image?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={venue.primary_image.url}
                              alt={venue.venue?.name || ""}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        
                        {/* Venue info - Below image on mobile, beside image on desktop */}
                        <div className="flex-1 min-w-0 pl-0 pr-0 md:pl-2 md:pr-0 py-0 md:py-0">
                          <p className="font-semibold text-gray-900 truncate">{venue.venue?.name}</p>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <div className="flex items-center gap-1 text-sm text-gray-500 min-w-0">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{address}</span>
                            </div>
                            {distanceMiles && (
                              <div className="text-sm font-medium text-gray-700 flex-shrink-0">
                                {distanceMiles} mi
                              </div>
                            )}
                          </div>
                          
                          {/* Opening Hours */}
                          {venue.opening_hours && venue.opening_hours.length > 0 && (() => {
                            const todayHours = getTodayOpeningHours(venue.opening_hours);
                            const isHoursExpanded = expandedOpeningHours.has(venue.venue?.uuid);
                            
                            return (
                              <div className="mt-2">
                                <button
                                  type="button"
                                  onClick={() => toggleOpeningHours(venue.venue?.uuid)}
                                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span>
                                    {todayHours 
                                      ? `${todayHours.day} ${formatTime(todayHours.open)} - ${formatTime(todayHours.close)}`
                                      : 'Closed'
                                    }
                                  </span>
                                  {isHoursExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                                  )}
                                </button>
                                
                                {/* Expanded hours */}
                                {isHoursExpanded && (() => {
                                  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                  return (
                                    <div className="mt-2 pl-5 border-l border-gray-200">
                                      <div className="space-y-1">
                                        {allDays.map((day) => {
                                          const hours = venue.opening_hours.find(h => h.day === day);
                                          const isClosed = !hours || !hours.open || !hours.close;
                                          return (
                                            <div key={day} className="flex items-center justify-between text-xs">
                                              <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isClosed ? 'bg-gray-300' : 'bg-green-500'}`} />
                                                <span className={`font-medium ${isClosed ? 'text-gray-400' : 'text-gray-600'}`}>{day}</span>
                                              </div>
                                              <span className={isClosed ? 'text-gray-400' : 'text-gray-500'}>
                                                {isClosed
                                                  ? 'Closed'
                                                  : `${formatTime(hours.open)} - ${formatTime(hours.close)}`
                                                }
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* All matched services collapsed into one group per venue */}
                      <div className="divide-y divide-gray-100">
                        {groupMatchedServices(matched).map((group) => {
                          const venueUuid = venue.venue?.uuid || "";
                          const groupId = `${venueUuid}::${group.key}`;
                          const isExpanded = expandedGroups.has(groupId);

                          if (group.items.length === 1) {
                            const service = group.items[0];
                            const meta = [service.category, service.audience].filter(Boolean).join(" · ");
                            return (
                              <button
                                key={group.key}
                                type="button"
                                onClick={() => handleServiceClick(venue, service)}
                                className="w-full pl-0 pr-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {service.display_name || service.name}
                                  </p>
                                  {meta && (
                                    <p className="text-xs text-gray-500 mt-0.5">{meta}</p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0 gap-0.5 text-right">
                                  {service.price != null && (
                                    <span className="text-sm font-semibold text-gray-900">
                                      {formatMoney(service.price)}
                                    </span>
                                  )}
                                  {service.duration_minutes != null && (
                                    <span className="text-xs text-gray-500">
                                      {service.duration_minutes} min
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          }

                          // Multi-variant group — collapsible
                          const prices = group.items
                            .map((s) => Number(s.price))
                            .filter((p) => !Number.isNaN(p));
                          const minPrice = prices.length ? Math.min(...prices) : null;

                          return (
                            <div key={group.key}>
                              {/* Group header */}
                              <button
                                type="button"
                                onClick={() => toggleGroup(venueUuid, group.key)}
                                className="w-full pl-0 pr-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {group.label} ({group.items.length})
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {minPrice != null && (
                                    <span className="text-sm font-semibold text-gray-900">
                                      From {formatMoney(minPrice)}
                                    </span>
                                  )}
                                  <ChevronDown
                                    className={cn(
                                      "w-4 h-4 text-gray-400 transition-transform",
                                      isExpanded && "rotate-180"
                                    )}
                                  />
                                </div>
                              </button>

                              {/* Expanded variants */}
                              {isExpanded && (
                                <div className="divide-y divide-gray-100">
                                  {group.items.map((service, si) => {
                                    const meta = [service.category, service.audience].filter(Boolean).join(" · ");
                                    return (
                                    <button
                                      key={service.uuid || si}
                                      type="button"
                                      onClick={() => handleServiceClick(venue, service)}
                                      className="w-full pl-8 pr-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center justify-between gap-4"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm text-gray-700 truncate">
                                          {service.display_name || service.name}
                                        </p>
                                        {meta && (
                                          <p className="text-xs text-gray-500 mt-0.5">{meta}</p>
                                        )}
                                      </div>
                                      <div className="flex flex-col items-end flex-shrink-0 gap-0.5 text-right">
                                        {service.price != null && (
                                          <span className="text-sm font-semibold text-gray-900">
                                            {formatMoney(service.price)}
                                          </span>
                                        )}
                                        {service.duration_minutes != null && (
                                          <span className="text-xs text-gray-500">
                                            {service.duration_minutes} min
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

        {/* Load More Section */}
        {hasMore && !loading && venues.length > 0 && (
          <div ref={loadMoreRef} className="py-6 text-center">
            {isLoadingMore && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading more venues...
              </div>
            )}
          </div>
        )}
          </div>
          </div>

          {/* Right Column: Second Half of Venues or Google Map */}
          {!showMap ? (
            <div className="w-1/2 overflow-y-auto pl-2 pr-4 py-4 border-l border-gray-200">
              <div className={cn("space-y-4 transition-opacity duration-200", loading && "opacity-50 pointer-events-none")}>
                {/* Show right half of venues */}
                {venues.slice(Math.ceil(venues.length / 2)).map((venue, vi) => {
                  return (
                    <VenueSearchResultCard
                      key={venue.venue?.uuid || vi}
                      venue={venue}
                      index={vi}
                      activeServiceName={activeServiceName}
                      selectedFilters={selectedFilters}
                      selectedLocation={selectedLocation}
                      expandedOpeningHours={expandedOpeningHours}
                      toggleOpeningHours={toggleOpeningHours}
                      expandedGroups={expandedGroups}
                      toggleGroup={toggleGroup}
                      handleServiceClick={handleServiceClick}
                    />
                  );
                  const matched = getMatchedServices(venue, activeServiceName).filter((s) => {
                    if (selectedFilters.categories?.length && !selectedFilters.categories.includes(Number(s.category_id))) return false;
                    if (selectedFilters.audiences?.length && !selectedFilters.audiences.includes(Number(s.audience_id))) return false;
                    return true;
                  });
                  if (matched.length === 0) return null;

                  const address =
                    venue.address?.formatted ||
                    [venue.address?.line1, venue.address?.line2, venue.address?.postcode]
                      .filter(Boolean)
                      .join(", ");

                  let distanceMiles = null;
                  const vLat = venue.address?.location?.lat;
                  const vLon = venue.address?.location?.lon;
                  if (selectedLocation?.lat && vLat && vLon) {
                    const distanceKm = calcDistance(
                      selectedLocation.lat,
                      selectedLocation.lon,
                      vLat,
                      vLon
                    );
                    distanceMiles = (distanceKm / 1.60934).toFixed(1);
                  }

                  return (
                    <div
                      key={venue.venue?.uuid || vi} 
                      className="overflow-hidden border-b border-gray-200 pt-4 pb-0"
                    >
                      {/* Venue header - Stacked on mobile, horizontal on desktop */}
                      <div className="flex flex-col md:flex-row md:items-start gap-2 pl-0 pr-0 md:pl-0 md:pr-0 pt-0 md:py-0">
                        {/* Image - Full width on mobile, fixed landscape on desktop */}
                        <div className="w-full md:w-48 h-40 md:h-32 bg-gray-100 flex-shrink-0 overflow-hidden rounded-md">
                          {venue.primary_image?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={venue.primary_image.url}
                              alt={venue.venue?.name || ""}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        
                        {/* Venue info - Below image on mobile, beside image on desktop */}
                        <div className="flex-1 min-w-0 pl-0 pr-0 md:pl-2 md:pr-0 py-0 md:py-0">
                          <p className="font-semibold text-gray-900 truncate">{venue.venue?.name}</p>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <div className="flex items-center gap-1 text-sm text-gray-500 min-w-0">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{address}</span>
                            </div>
                            {distanceMiles && (
                              <div className="text-sm font-medium text-gray-700 flex-shrink-0">
                                {distanceMiles} mi
                              </div>
                            )}
                          </div>
                          
                          {/* Opening Hours */}
                          {venue.opening_hours && venue.opening_hours.length > 0 && (() => {
                            const todayHours = getTodayOpeningHours(venue.opening_hours);
                            const isHoursExpanded = expandedOpeningHours.has(venue.venue?.uuid);
                            
                            return (
                              <div className="mt-2">
                                <button
                                  type="button"
                                  onClick={() => toggleOpeningHours(venue.venue?.uuid)}
                                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span>
                                    {todayHours 
                                      ? `${todayHours.day} ${formatTime(todayHours.open)} - ${formatTime(todayHours.close)}`
                                      : 'Closed'
                                    }
                                  </span>
                                  {isHoursExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                                  )}
                                </button>
                                
                                {/* Expanded hours */}
                                {isHoursExpanded && (() => {
                                  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                  return (
                                    <div className="mt-2 pl-5 border-l border-gray-200">
                                      <div className="space-y-1">
                                        {allDays.map((day) => {
                                          const hours = venue.opening_hours.find(h => h.day === day);
                                          const isClosed = !hours || !hours.open || !hours.close;
                                          return (
                                            <div key={day} className="flex items-center justify-between text-xs">
                                              <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isClosed ? 'bg-gray-300' : 'bg-green-500'}`} />
                                                <span className={`font-medium ${isClosed ? 'text-gray-400' : 'text-gray-600'}`}>{day}</span>
                                              </div>
                                              <span className={isClosed ? 'text-gray-400' : 'text-gray-500'}>
                                                {isClosed
                                                  ? 'Closed'
                                                  : `${formatTime(hours.open)} - ${formatTime(hours.close)}`
                                                }
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* All matched services collapsed into one group per venue */}
                      <div className="divide-y divide-gray-100">
                        {groupMatchedServices(matched).map((group) => {
                          const venueUuid = venue.venue?.uuid || "";
                          const groupId = `${venueUuid}::${group.key}`;
                          const isExpanded = expandedGroups.has(groupId);

                          if (group.items.length === 1) {
                            const service = group.items[0];
                            const meta = [service.category, service.audience].filter(Boolean).join(" · ");
                            return (
                              <button
                                key={group.key}
                                type="button"
                                onClick={() => handleServiceClick(venue, service)}
                                className="w-full pl-0 pr-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {service.display_name || service.name}
                                  </p>
                                  {meta && (
                                    <p className="text-xs text-gray-500 mt-0.5">{meta}</p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0 gap-0.5 text-right">
                                  {service.price != null && (
                                    <span className="text-sm font-semibold text-gray-900">
                                      {formatMoney(service.price)}
                                    </span>
                                  )}
                                  {service.duration_minutes != null && (
                                    <span className="text-xs text-gray-500">
                                      {service.duration_minutes} min
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          }

                          // Multi-variant group — collapsible
                          const prices = group.items
                            .map((s) => Number(s.price))
                            .filter((p) => !Number.isNaN(p));
                          const minPrice = prices.length ? Math.min(...prices) : null;

                          return (
                            <div key={group.key}>
                              {/* Group header */}
                              <button
                                type="button"
                                onClick={() => toggleGroup(venueUuid, group.key)}
                                className="w-full pl-0 pr-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {group.label} ({group.items.length})
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {minPrice != null && (
                                    <span className="text-sm font-semibold text-gray-900">
                                      From {formatMoney(minPrice)}
                                    </span>
                                  )}
                                  <ChevronDown
                                    className={cn(
                                      "w-4 h-4 text-gray-400 transition-transform",
                                      isExpanded && "rotate-180"
                                    )}
                                  />
                                </div>
                              </button>

                              {/* Expanded variants */}
                              {isExpanded && (
                                <div className="divide-y divide-gray-100">
                                  {group.items.map((service, si) => {
                                    const meta = [service.category, service.audience].filter(Boolean).join(" · ");
                                    return (
                                    <button
                                      key={service.uuid || si}
                                      type="button"
                                      onClick={() => handleServiceClick(venue, service)}
                                      className="w-full pl-8 pr-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center justify-between gap-4"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm text-gray-700 truncate">
                                          {service.display_name || service.name}
                                        </p>
                                        {meta && (
                                          <p className="text-xs text-gray-500 mt-0.5">{meta}</p>
                                        )}
                                      </div>
                                      <div className="flex flex-col items-end flex-shrink-0 gap-0.5 text-right">
                                        {service.price != null && (
                                          <span className="text-sm font-semibold text-gray-900">
                                            {formatMoney(service.price)}
                                          </span>
                                        )}
                                        {service.duration_minutes != null && (
                                          <span className="text-xs text-gray-500">
                                            {service.duration_minutes} min
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="hidden md:block w-1/2 bg-white border-l border-gray-200 h-full overflow-hidden">
              {(mapsReady || (typeof window !== 'undefined' && window?.google?.maps)) && venues.length > 0 ? (
                <VenueMap
                  venues={venues}
                  selectedLocation={selectedLocation}
                  serviceName={activeServiceName}
                  router={router}
                />
              ) : (mapsReady || (typeof window !== 'undefined' && window?.google?.maps)) ? (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No venues to display
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Loading map...
                </div>
              )}
            </div>
          )}

        {/* Mobile Map Bottom Sheet */}
        {showMobileMap && (
          <div className="fixed inset-0 md:hidden bg-black/40 z-40" onClick={() => setShowMobileMap(false)} />
        )}
        <div className={cn(
          "fixed bottom-0 left-0 right-0 md:hidden transition-all duration-300 z-50 bg-white rounded-t-2xl shadow-lg flex flex-col",
          showMobileMap ? "h-3/4" : "h-20"
        )}>
          {/* Handle bar and toggle button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex-1" />
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
            <button
              onClick={() => setShowMobileMap(!showMobileMap)}
              className="flex-1 text-right text-xs text-gray-500 hover:text-gray-700"
            >
              {showMobileMap ? "Hide" : ""}
            </button>
          </div>

          {/* Map or Show Map Button */}
          {showMobileMap ? (
            <div className="flex-1 overflow-hidden w-full">
              {(mapsReady || (typeof window !== 'undefined' && window?.google?.maps)) && venues.length > 0 ? (
                <VenueMap
                  venues={venues}
                  selectedLocation={selectedLocation}
                  serviceName={activeServiceName}
                  router={router}
                />
              ) : null}
            </div>
          ) : (
            <div className="flex items-center justify-center px-4 py-4">
              <button
                type="button"
                onClick={() => setShowMobileMap(true)}
                className="cursor-pointer inline-flex items-center justify-center rounded-full font-semibold text-white gap-2 bg-brand-blue border border-brand-blue hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 transition ease-in-out duration-150 text-base px-8 py-3"
              >
                View Map
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-5 h-5" aria-hidden="true">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    )}
    </div>
  );}