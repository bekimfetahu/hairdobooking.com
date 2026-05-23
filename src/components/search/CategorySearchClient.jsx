'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { Search, MapPin } from 'lucide-react';
import Select from 'react-select';
import LocationSearch from '@/components/search/LocationSearch';
import VenueSearchResultsList from '@/components/search/VenueSearchResultsList';
import { searchVenues, searchServices } from '@/services/search/searchService';
import { cn } from '@/lib/utils';

/**
 * VenueMap Component - Displays all venues on a Google Map
 */
function VenueMap({ venues, selectedLocation, router }) {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markersRef = React.useRef([]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    // Calculate center from selected location or first venue
    let center = { lat: 51.5074, lng: -0.1278 }; // London default
    
    if (selectedLocation && typeof selectedLocation.lat === 'number' && typeof selectedLocation.lon === 'number') {
      if (isFinite(selectedLocation.lat) && isFinite(selectedLocation.lon)) {
        center = { lat: selectedLocation.lat, lng: selectedLocation.lon };
      }
    } else if (venues.length > 0 && venues[0]?.address?.location) {
      const loc = venues[0].address.location;
      if (typeof loc.lat === 'number' && typeof loc.lon === 'number' && isFinite(loc.lat) && isFinite(loc.lon)) {
        center = { lat: loc.lat, lng: loc.lon };
      }
    }

    // Initialize map if needed
    if (!mapInstanceRef.current) {
      try {
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

      if (typeof window.google?.maps?.Marker !== 'function' || typeof window.google?.maps?.LatLngBounds !== 'function') {
        console.warn('[VenueMap] Marker or LatLngBounds not ready yet');
        return;
      }

      // Add markers for each venue
      const bounds = new window.google.maps.LatLngBounds();
      
      venues.forEach((venue, index) => {
        const venueLocation = venue.address?.location;
        if (!venueLocation) return;
        
        // Validate coordinates are numbers and finite
        if (typeof venueLocation.lat !== 'number' || typeof venueLocation.lon !== 'number' ||
            !isFinite(venueLocation.lat) || !isFinite(venueLocation.lon)) {
          console.warn('[VenueMap] Invalid venue coordinates:', venueLocation);
          return;
        }

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
          <div style="padding: 0; max-width: 280px; cursor: pointer;" class="venue-info-popup" data-slug="${venue.venue?.slug}">
            ${venue.primary_image?.url ? `
              <img src="${venue.primary_image.url}" alt="${venue.venue?.name}" style="width: 100%; height: 160px; object-fit: cover; display: block; border-radius: 4px 4px 0 0;">
            ` : ''}
            <div style="padding: 8px;">
              <p style="font-weight: 600; margin: 0 0 4px 0; font-size: 14px; text-decoration: underline; color: #2563eb;">${venue.venue?.name || "Venue"}</p>
              <p style="margin: 0; font-size: 12px; color: #666;">${venue.address?.formatted || ""}</p>
            </div>
          </div>
        `;

        if (typeof window.google?.maps?.InfoWindow !== 'function') {
          console.warn('[VenueMap] InfoWindow not ready yet');
          return;
        }

        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent,
        });

        marker.addListener("click", () => {
          markersRef.current.forEach(entry => {
            if (entry.infoWindow) entry.infoWindow.close();
          });
          infoWindow.open(mapInstanceRef.current, marker);
          
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

      if (venues.length > 0 && selectedLocation) {
        window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
        
        setTimeout(() => {
          if (mapInstanceRef.current && venues.length > 0) {
            try {
              const bounds = new window.google.maps.LatLngBounds();
              let hasValidVenues = false;
              
              venues.forEach((venue) => {
                const loc = venue.address?.location;
                if (loc && typeof loc.lat === 'number' && typeof loc.lon === 'number' && 
                    isFinite(loc.lat) && isFinite(loc.lon)) {
                  bounds.extend(new window.google.maps.LatLng(loc.lat, loc.lon));
                  hasValidVenues = true;
                }
              });
              
              if (hasValidVenues) {
                mapInstanceRef.current.fitBounds(bounds, 50);
              }
            } catch (err) {
              console.error('[VenueMap] fitBounds error:', err);
            }
          }
        }, 100);
      }
    } catch (err) {
      console.error('[VenueMap] Error:', err);
    }
  }, [venues, selectedLocation, router]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}

/**
 * CategorySearchClient - Service search within a category domain
 * 
 * Features:
 * - Category selector with icons (pre-selects from URL)
 * - Location and distance filters only (no category/audience pills)
 * - Searches for salons offering services in the selected category
 * - Optional service name search within the category
 * 
 * Flow:
 * 1. User sees category buttons (Hair, Nails, Barbering, etc.)
 * 2. Selected category from URL is highlighted
 * 3. Shows all salons offering services in that category
 * 4. User can search for specific service within category
 * 5. Location/distance changes trigger new search
 */
export default function CategorySearchClient({
    categories = [],
    selectedCategorySlug = null,
    initialVenues = [],
    initialVenuesMeta = null,
    initialLocationLabel = "",
    initialLocationLat = null,
    initialLocationLon = null,
    initialDistance = "50mi",
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [selectedCategory, setSelectedCategory] = useState(
        categories.find((cat) => cat.slug === selectedCategorySlug) || null
    );
    const [venues, setVenues] = useState(initialVenues);
    const [venuesMeta, setVenuesMeta] = useState(initialVenuesMeta);
    const [selectedLocation, setSelectedLocation] = useState(
        initialLocationLat && initialLocationLon
            ? { lat: initialLocationLat, lon: initialLocationLon, address: initialLocationLabel }
            : null
    );
    const [distance, setDistance] = useState(initialDistance);
    const [loading, setLoading] = useState(false);
    const [mapsReady, setMapsReady] = useState(false);

    // Service search state
    const [serviceQuery, setServiceQuery] = useState("");
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);
    const [serviceResults, setServiceResults] = useState([]);
    const [featuredServices, setFeaturedServices] = useState([]);
    const [serviceSearchLoading, setServiceSearchLoading] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedServiceOrSalon, setSelectedServiceOrSalon] = useState(false);
    
    // Venue results UI state
    const [expandedOpeningHours, setExpandedOpeningHours] = useState(new Set());
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    
    // Map state
    const [showMap, setShowMap] = useState(false);
    const [showMobileMap, setShowMobileMap] = useState(false);
    
    const serviceSearchRef = React.useRef(null);
    const serviceDebounceRef = React.useRef(null);
    const dropdownLockRef = React.useRef(false);
    const suppressNextFocusRef = React.useRef(false);
    const featuredServicesFetchedRef = React.useRef(false);

    const distanceOptions = React.useMemo(() => [
        { value: '5mi', label: '5mi' },
        { value: '10mi', label: '10mi' },
        { value: '25mi', label: '25mi' },
        { value: '50mi', label: '50mi' },
        { value: '100mi', label: '100mi' },
    ], []);

    // Handle category selection
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setServiceQuery("");
        setSelectedService(null);
        setSelectedServiceOrSalon(false);
        setShowServiceDropdown(false);

        // Update URL with new category
        const params = new URLSearchParams();
        params.set('category', category.slug);
        if (selectedLocation?.lat) params.set('lat', selectedLocation.lat);
        if (selectedLocation?.lon) params.set('lon', selectedLocation.lon);
        params.set('distance', distance);
        if (selectedLocation?.address) params.set('loc', selectedLocation.address);

        router.push(`/search/category?${params.toString()}`);

        // Fetch venues for this category (no service filter yet)
        performSearch(category, selectedLocation, distance, "");
    };

    // Handle location change
    const handleLocationChange = (newLocation) => {
        setSelectedLocation(newLocation);
        if (selectedCategory) {
            performSearch(selectedCategory, newLocation, distance, serviceQuery);
        }
    };

    // Handle distance change
    const handleDistanceChange = (newDistance) => {
        setDistance(newDistance);
        if (selectedCategory) {
            performSearch(selectedCategory, selectedLocation, newDistance, serviceQuery);
        }
    };

    // Perform search with current filters
    const performSearch = async (category, location, dist, service) => {
        if (!category) return;

        setLoading(true);
        try {
            const params = { perPage: 20, page: 1 };
            if (category) params.category = category.name; // Use category name, not slug
            if (service) params.service = service;
            if (location?.lat) params.lat = location.lat;
            if (location?.lon) params.lon = location.lon;
            if (location?.lat && location?.lon) params.distance = dist;

            console.debug('[CategorySearchClient] Performing search with params:', params);
            const response = await searchVenues(params);
            console.debug('[CategorySearchClient] Search response:', response);
            setVenues(response.data || []);
            setVenuesMeta(response.meta || null);
        } catch (error) {
            console.error('[CategorySearchClient] Failed to fetch venues:', error);
            console.error('[CategorySearchClient] Error type:', error.code || 'UNKNOWN');
            
            if (error.response) {
                console.error('[CategorySearchClient] Response status:', error.response.status);
                console.error('[CategorySearchClient] Response data:', error.response.data);
            } else if (error.request) {
                console.error('[CategorySearchClient] No response received (Network Error)');
                console.error('[CategorySearchClient] Request URL:', error.config?.url);
                console.warn('[CategorySearchClient] DEBUGGING: Backend server may be unavailable');
            } else {
                console.error('[CategorySearchClient] Error message:', error.message);
            }
            setVenues([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch featured services for this category
    const fetchFeaturedServices = React.useCallback(async () => {
        if (!selectedCategory) {
            console.debug('[CategorySearchClient] Skipping featured services fetch: no category selected');
            return;
        }
        
        try {
            const params = {
                category: selectedCategory.name,
                perPage: 10,
            };
            // Add location if available for venue count filtering
            if (selectedLocation?.lat && selectedLocation?.lon) {
                params.lat = selectedLocation.lat;
                params.lon = selectedLocation.lon;
                params.distance = distance;
            }

            console.debug('[CategorySearchClient] Fetching featured services with params:', params);
            const response = await searchServices(params);
            console.debug('[CategorySearchClient] Featured services response:', response);
            const services = response.data || [];
            setFeaturedServices(services.slice(0, 10)); // Limit to 10 featured
        } catch (error) {
            console.error('[CategorySearchClient] Failed to fetch featured services:', error);
            console.error('[CategorySearchClient] Error message:', error.message);
            
            // Set featured services to empty array so UI doesn't break
            setFeaturedServices([]);
        }
    }, [selectedCategory, selectedLocation, distance]);

    // Search services in this category
    const searchServicesInCategory = React.useCallback(async (query) => {
        if (!selectedCategory || !query.trim()) {
            setServiceResults([]);
            return;
        }

        setServiceSearchLoading(true);
        try {
            const params = {
                q: query.trim(),
                category: selectedCategory.name,
                perPage: 10,
            };
            // Add location if available for venue count filtering
            if (selectedLocation?.lat && selectedLocation?.lon) {
                params.lat = selectedLocation.lat;
                params.lon = selectedLocation.lon;
                params.distance = distance;
            }

            console.debug('[CategorySearchClient] Searching services with params:', params);
            const response = await searchServices(params);
            console.debug('[CategorySearchClient] Service search response:', response);
            const results = response.data || [];
            setServiceResults(results);
        } catch (error) {
            console.error('[CategorySearchClient] Failed to search services:', error);
            console.error('[CategorySearchClient] Error message:', error.message);
            setServiceResults([]);
        } finally {
            setServiceSearchLoading(false);
        }
    }, [selectedCategory, selectedLocation, distance]);

    // Handle service query change with debounce
    const handleServiceQueryChange = (e) => {
        const val = e.target.value;
        setServiceQuery(val);
        clearTimeout(serviceDebounceRef.current);

        if (val.trim().length >= 1) {
            serviceDebounceRef.current = setTimeout(() => {
                if (!dropdownLockRef.current) {
                    void searchServicesInCategory(val);
                    setShowServiceDropdown(true);
                }
            }, 300);
        } else {
            // When clearing search input, show featured services
            setSelectedServiceOrSalon(false);
            setShowServiceDropdown(false);
            setServiceResults([]);
            
            // Fetch featured services on first clear if not already fetched
            if (!featuredServicesFetchedRef.current && selectedCategory && selectedLocation?.lat && selectedLocation?.lon) {
                featuredServicesFetchedRef.current = true;
                void fetchFeaturedServices();
            }
        }
    };

    // Handle service selection from dropdown
    const handleServiceSelect = (service) => {
        dropdownLockRef.current = true;
        suppressNextFocusRef.current = true;
        setShowServiceDropdown(false);
        setSelectedServiceOrSalon(true);
        setServiceQuery(service.name);
        setSelectedService(service);
        
        // Blur the input to prevent focus from affecting dropdown
        if (serviceSearchRef.current?.querySelector('input')) {
            serviceSearchRef.current.querySelector('input').blur();
        }

        // Unlock dropdown after a brief delay
        setTimeout(() => {
            dropdownLockRef.current = false;
        }, 50);
    };

    // Handle search button click
    const handleSearchButtonClick = () => {
        if (!serviceQuery.trim()) return;
        
        if (selectedCategory && selectedService) {
            // Perform search with the selected service
            performSearch(selectedCategory, selectedLocation, distance, selectedService.name);
        }
    };

    // Toggle opening hours visibility for a venue
    const toggleOpeningHours = (venueUuid) => {
        setExpandedOpeningHours((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(venueUuid)) {
                newSet.delete(venueUuid);
            } else {
                newSet.add(venueUuid);
            }
            return newSet;
        });
    };

    // Toggle service group expansion for a venue
    const toggleGroup = (venueUuid, groupKey) => {
        const groupId = `${venueUuid}::${groupKey}`;
        setExpandedGroups((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(groupId)) {
                newSet.delete(groupId);
            } else {
                newSet.add(groupId);
            }
            return newSet;
        });
    };

    // Get icon component
    const getIconComponent = (iconName) => {
        const IconComponent = LucideIcons[iconName];
        return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
    };

    // Fetch featured services when category changes
    React.useEffect(() => {
        if (!selectedCategory) {
            console.debug('[CategorySearchClient] Skipping featured fetch: no category');
            featuredServicesFetchedRef.current = false;
            return;
        }
        
        // Only fetch if we have location (for accurate venue counts)
        // If no location, skip featured services for now - user hasn't set location yet
        if (!selectedLocation?.lat || !selectedLocation?.lon) {
            console.debug('[CategorySearchClient] Skipping featured fetch: no location');
            featuredServicesFetchedRef.current = false;
            return;
        }
        
        // Reset the fetched flag when category changes, so we re-fetch featured services
        featuredServicesFetchedRef.current = false;
    }, [selectedCategory]);

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
                    <div ref={serviceSearchRef} className="relative">
                        <div className="hidden sm:flex h-11 items-center rounded-full border border-black/80 bg-white/95 px-2 shadow-[0_18px_45px_rgba(0,0,0,0.14)] ring-2 ring-black/10 backdrop-blur-xl">
                            {/* Search Services */}
                            <div className="flex items-center flex-1 px-3">
                                <Search className="w-4 h-4 text-black mr-2 flex-shrink-0" />
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
                                            // Fetch featured services on focus if not already fetched
                                            if (!featuredServicesFetchedRef.current && selectedCategory && selectedLocation?.lat && selectedLocation?.lon) {
                                                featuredServicesFetchedRef.current = true;
                                                void fetchFeaturedServices();
                                            }
                                        }
                                    }}
                                    placeholder={selectedCategory ? `Search services in ${selectedCategory.name}` : "Search services"}
                                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                                />
                                {serviceQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setServiceQuery('');
                                            setSelectedServiceOrSalon(false);
                                            setShowServiceDropdown(false);
                                            setSelectedService(null);
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

                            <span className="text-black/25 text-xs select-none">|</span>

                            <div className="flex items-center w-80 px-3">
                                <LocationSearch
                                    value={selectedLocation?.address || initialLocationLabel}
                                    onLocationChange={handleLocationChange}
                                    mapsReady={mapsReady}
                                />
                            </div>

                            {/* Search Button */}
                            <button
                                type="button"
                                onClick={handleSearchButtonClick}
                                disabled={!serviceQuery.trim()}
                                className="ml-2 h-8 px-4 rounded-full border border-black bg-black text-white shadow-sm transition hover:bg-neutral-800 hover:border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium shrink-0"
                                aria-label="Search"
                            >
                                Search
                            </button>
                        </div>

                        {/* Mobile Layout: Stacked */}
                        <div className="sm:hidden space-y-2 bg-transparent">
                            {/* Service Search Input */}
                            <div className="h-[35px] flex items-center rounded-md border border-black/70 bg-white px-2 shadow-sm">
                                <Search className="w-3.5 h-3.5 text-black mr-1.5 flex-shrink-0" />
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
                                            // Fetch featured services on focus if not already fetched
                                            if (!featuredServicesFetchedRef.current && selectedCategory && selectedLocation?.lat && selectedLocation?.lon) {
                                                featuredServicesFetchedRef.current = true;
                                                void fetchFeaturedServices();
                                            }
                                        }
                                    }}
                                    placeholder={selectedCategory ? `Search services in ${selectedCategory.name}` : "Search services..."}
                                    className="w-full bg-transparent outline-none text-xs text-gray-700 placeholder:text-sm placeholder-gray-400"
                                />
                                {serviceQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setServiceQuery('');
                                            setSelectedServiceOrSalon(false);
                                            setShowServiceDropdown(false);
                                            setSelectedService(null);
                                            featuredServicesFetchedRef.current = false;
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

                            {/* Location Input */}
                            <div className="h-[35px] flex items-center rounded-md border border-black/70 bg-white px-2 shadow-sm">
                                <LocationSearch
                                    value={selectedLocation?.address || initialLocationLabel}
                                    mapsReady={mapsReady}
                                    onLocationChange={handleLocationChange}
                                    placeholder="Location..."
                                    className="w-full"
                                />
                            </div>

                            {/* Search Button */}
                            <button
                                type="button"
                                onClick={handleSearchButtonClick}
                                disabled={!serviceQuery.trim()}
                                className="h-8 w-full rounded-md border border-black bg-black text-white transition hover:bg-neutral-800 hover:border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-medium"
                                aria-label="Search"
                            >
                                Search
                            </button>
                        </div>

                        {/* Service Dropdown */}
                        {showServiceDropdown && !selectedServiceOrSalon && (
                            <div className="absolute top-full mt-2 w-full bg-white border border-black/10 rounded-md shadow-lg z-[9999] max-h-96 overflow-y-auto">
                                {/* Service suggestions */}
                                {serviceQuery.trim().length === 0 ? (
                                    featuredServices.length > 0 ? (
                                        <>
                                            <div className="sticky top-0 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 border-b border-gray-200">Featured Services</div>
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
                                                                : ""}
                                                        </p>
                                                        {service.venue_count > 0 && (
                                                            <p className="text-xs text-gray-500">
                                                                {service.venue_count} {service.venue_count === 1 ? "location" : "locations"}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </>
                                    ) : null
                                ) : serviceSearchLoading ? (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            Searching...
                                        </div>
                                    </div>
                                ) : serviceResults.length > 0 ? (
                                    <>
                                        <div className="sticky top-0 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 border-b border-gray-200">Services</div>
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
                                                            : ""}
                                                    </p>
                                                    {service.venue_count > 0 && (
                                                        <p className="text-xs text-gray-500">
                                                            {service.venue_count} {service.venue_count === 1 ? "location" : "locations"}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                ) : serviceQuery.trim().length >= 1 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">No services found for "{serviceQuery}"</div>
                                ) : featuredServices.length > 0 ? (
                                    <>
                                        <div className="sticky top-0 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 border-b border-gray-200">Featured Services</div>
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
                                                            : ""}
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



            {/* ===== CATEGORY SELECTOR SECTION ===== */}
            <section className="bg-white border-b border-gray-200 py-8 md:py-12">
                <div className="max-w-6xl mx-auto px-4 md:px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                        Categories
                    </h2>

                    <div className="overflow-x-auto pb-2">
                        <div className="flex gap-2 flex-nowrap min-w-min">
                            {categories.map((category) => (
                                <button
                                    key={category.uuid}
                                    onClick={() => handleCategorySelect(category)}
                                    className={`flex-shrink-0 w-24 p-2 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 border-2 ${selectedCategory?.uuid === category.uuid
                                            ? 'bg-red-600 border-red-600 text-white shadow-lg'
                                            : 'bg-white border-black text-black hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-center">
                                        {getIconComponent(category.icon)}
                                    </div>
                                    <span className="text-xs font-medium text-center leading-tight">{category.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SEARCH RESULTS SECTION ===== */}
            {selectedCategory ? (
                <>
                    <section className="flex flex-1 overflow-hidden h-[calc(100vh-280px)] relative">
                    {/* Results Column */}
                    <div className={showMap ? "flex-1 md:flex-none md:w-1/2 overflow-y-auto pl-0 pr-4 py-4" : "w-full overflow-y-auto px-0 py-4"}>
                        <div className={showMap ? "max-w-2xl mx-auto" : ""}>
                            {/* Loading State */}
                            {loading && (
                                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                    <p className="text-gray-600">Loading salons...</p>
                                </div>
                            )}
                            
                            {/* Results Info and Distance Control */}
                            {!loading && venues.length > 0 && (
                                <div className="py-3 px-4 mb-4 bg-white/80 backdrop-blur-sm rounded-md">
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Left Column: Distance Select and Info Text (inline) */}
                                        <div className="flex-1 flex items-center gap-3">
                                            {/* Distance Select */}
                                            <div className="w-40 flex-shrink-0">
                                                <Select
                                                    instanceId="category-distance"
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
                                            
                                            {/* Info Text */}
                                            <p className="text-sm text-gray-700 font-medium">
                                                {venues.length} {venues.length === 1 ? 'salon' : 'salons'} provide{selectedService?.name ? ` ${selectedService.name}` : ' services'} in {selectedCategory?.name}
                                            </p>
                                        </div>
                                        
                                        {/* Right Column: Show Map Button */}
                                        <div className="flex-shrink-0">
                                            {/* Show Map Button - Desktop only */}
                                            <button
                                                type="button"
                                                onClick={() => setShowMap(!showMap)}
                                                className="hidden md:flex items-center gap-1.5 h-8 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors border border-gray-200"
                                            >
                                                <MapPin className="w-3.5 h-3.5" />
                                                {showMap ? "Hide Map" : "Show Map"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Venues Results */}
                            {!loading && venues.length > 0 ? (
                                <VenueSearchResultsList
                                    venues={venues}
                                    selectedLocation={selectedLocation}
                                    activeServiceName={selectedService?.name || ""}
                                    categoryName={selectedCategory?.name || ""}
                                    expandedOpeningHours={expandedOpeningHours}
                                    toggleOpeningHours={toggleOpeningHours}
                                    expandedGroups={expandedGroups}
                                    toggleGroup={toggleGroup}
                                    showMap={showMap}
                                />
                            ) : !loading ? (
                                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                    <p className="text-gray-600 mb-2">No salons found</p>
                                    <p className="text-sm text-gray-500">
                                        Try a different location or increase the search distance
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Map Column: Shows when map is enabled */}
                    {showMap && (
                        <div className="hidden md:block w-1/2 bg-white border-l border-gray-200 h-full overflow-hidden">
                            {(mapsReady || (typeof window !== 'undefined' && window?.google?.maps)) && venues.length > 0 ? (
                                <VenueMap
                                    venues={venues}
                                    selectedLocation={selectedLocation}
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
                </section>

                {/* Mobile Bottom Sheet for Map */}
                <div
                    className={cn(
                        "fixed left-0 right-0 md:hidden transition-all duration-300 z-50 bg-white flex flex-col overflow-hidden shadow-lg",
                        showMobileMap ? "bottom-16 h-3/4" : "bottom-16 h-0"
                    )}
                >
                    {showMobileMap && venues.length > 0 && (
                        <div className="flex-1 overflow-hidden relative">
                            {(mapsReady || (typeof window !== 'undefined' && window?.google?.maps)) ? (
                                <VenueMap
                                    venues={venues}
                                    selectedLocation={selectedLocation}
                                    router={router}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    Loading map...
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Sticky Toggle Button */}
                <button
                    type="button"
                    onClick={() => setShowMobileMap(!showMobileMap)}
                    className="fixed bottom-0 left-0 right-0 md:hidden w-full px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-colors z-50 border-t border-gray-200"
                >
                    {showMobileMap ? "Hide Map" : "Show Map"}
                </button>
                </>
            ) : null}
        </div>
    );
}
