'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Search, ChevronDown, Filter, X } from 'lucide-react';
import LocationSearch from '@/components/search/LocationSearch';
import { cn } from '@/lib/utils';
import { useVenueSearch } from '@/hooks/useVenueSearch';
import { useServiceSearch } from '@/hooks/useServiceSearch';
import { useFeaturedServices } from '@/hooks/useFeaturedServices';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { getIcon } from '@/lib/iconMap';

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Hero - Modern hero with search input, gradient background, and hero image
 * Client component for interactivity - integrates with Elasticsearch via Next.js proxy
 * Receives optional SSR data: initialLocation, initialVenues, initialServices
 */
export default function Hero({
  onSearch = null,
  showSearchInput = true,
  initialLocation = null,
  initialVenues = [],
  initialServices = [],
}) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState(initialLocation || null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [isLocationSearchFocused, setIsLocationSearchFocused] = React.useState(false);
  const [expandedFilter, setExpandedFilter] = React.useState(null);
  const [searchDistance, setSearchDistance] = React.useState('10km'); // 5km, 10km, or 15km
  const [isDefaultLocationLoaded, setIsDefaultLocationLoaded] = React.useState(!!initialVenues?.length);
  const [mapsReady, setMapsReady] = React.useState(false);
  const [selectedServiceOrSalon, setSelectedServiceOrSalon] = React.useState(false); // Track if service/salon is selected
  const searchRef = React.useRef(null);
  const debounceTimerRef = React.useRef(null);
  const geocoderRef = React.useRef(null);
  const suppressNextAutoSearchRef = React.useRef(false);
  const router = useRouter();
  
  const { results: venues, loading: venuesLoading, search: searchVenues } = useVenueSearch(initialVenues);
  const { results: services, loading: servicesLoading, search: searchServices } = useServiceSearch(initialServices);
  const { results: featuredServices, loading: featuredLoading, search: searchFeatured } = useFeaturedServices(initialServices);
  const {
    options: filterOptions,
    selectedFilters,
    toggleFilter,
    clearFilters,
    hasActiveFilters,
  } = useSearchFilters();

  // Combined search handler
  const handleSearch = React.useCallback(
    async (query, searchOptions = {}) => {
      const {
        location = selectedLocation,
        distance = searchDistance,
        force = false,
      } = searchOptions;

      // Check if we should perform a search
      const hasFilters = selectedFilters.categories?.length > 0 || selectedFilters.audiences?.length > 0;
      const hasQuery = query.length >= 1;

      // If no query and no filters, just close dropdown
      if (!force && !hasQuery && !hasFilters) {
        setShowDropdown(false);
        return;
      }

      try {
        // Search venues WITHOUT filters - always search all salons
        const venuePromise = searchVenues({
          q: query,
          lat: location?.lat,
          lon: location?.lon,
          distance,
          perPage: 5,
        });

        // Search services - include location and distance filtering
        const serviceSearchParams = {
          q: query,
          lat: location?.lat,
          lon: location?.lon,
          distance,
          perPage: 5,
        };

        if (hasFilters) {
          if (selectedFilters.categories?.length > 0) {
            serviceSearchParams.category = selectedFilters.categories.join(',');
          }
          if (selectedFilters.audiences?.length > 0) {
            serviceSearchParams.audience = selectedFilters.audiences.join(',');
          }
        }
        const servicePromise = searchServices(serviceSearchParams);

        // Execute searches in parallel
        await Promise.all([venuePromise, servicePromise]);

        setShowDropdown(true);

        if (onSearch) {
          onSearch({ query, location });
        }
      } catch (err) {
        // Search error - continue silently
      }
    },
    [selectedLocation, searchDistance, searchVenues, searchServices, onSearch, selectedFilters]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new debounce timer - wait 300ms after user stops typing
    if (value.length >= 1) {
      debounceTimerRef.current = setTimeout(() => {
        handleSearch(value);
      }, 300);
    } else {
      setShowDropdown(false);
    }
  };

  // Handle search button click - navigate to search results page
  const handleSearchButtonClick = () => {
    if (!searchQuery.trim()) return;
    
    const params = new URLSearchParams();
    params.set('q', searchQuery);
    
    // Pass location details if available
    if (selectedLocation?.address) params.set('loc', selectedLocation.address);
    if (selectedLocation?.lat !== undefined) params.set('lat', String(selectedLocation.lat));
    if (selectedLocation?.lon !== undefined) params.set('lon', String(selectedLocation.lon));
    
    // Pass search distance
    if (searchDistance) params.set('distance', searchDistance);
    
    // Pass filters if any
    if (selectedFilters.categories?.length) params.set('categories', selectedFilters.categories.join(','));
    if (selectedFilters.audiences?.length) params.set('audiences', selectedFilters.audiences.join(','));
    
    // Navigate to search page
    router.push(`/search/service?${params.toString()}`);
  };

  // Cleanup debounce timer on component unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Initialize with default London location and pre-fetch results in background
  React.useEffect(() => {
    if (isDefaultLocationLoaded) return; // Only run once

    const initializeDefaultLocation = async () => {
      try {
        console.log('[Hero] Initializing default London location...');
        
        // If SSR data already provided, use it directly
        if (initialLocation) {
          console.log('[Hero] Using SSR location:', initialLocation);
          setSelectedLocation(initialLocation);
          setIsDefaultLocationLoaded(true);
          return;
        }

        // Otherwise, geocode "London, UK" client-side
        const { Geocoder } = await window.google.maps.importLibrary('geocoding');
        geocoderRef.current = new Geocoder();

        // Geocode "London, UK" to get coordinates
        const results = await new Promise((resolve, reject) => {
          geocoderRef.current.geocode({ address: 'London, UK' }, (results, status) => {
            if (status === 'OK' && results.length > 0) {
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
          address: 'London, UK',
          placeId: results.place_id,
          postcode: null,
          country: 'UK',
          isDefaultLocation: true,
        };

        console.log('[Hero] Default location set:', defaultLocation);
        setSelectedLocation(defaultLocation);

        // Fetch venues and featured services with empty query in background (don't show yet)
        try {
          console.log('[Hero] Starting background search with empty query...');
          await Promise.all([
            searchVenues({
              q: '',
              lat: defaultLocation.lat,
              lon: defaultLocation.lon,
              distance: searchDistance,
              perPage: 5,
            }),
            searchFeatured({
              lat: defaultLocation.lat,
              lon: defaultLocation.lon,
              distance: searchDistance,
            }),
          ]);
          console.log('[Hero] Background search completed');
        } catch (err) {
          // Background search error - continue
        }

        setIsDefaultLocationLoaded(true);
      } catch (err) {
        // Default location initialization error
        setIsDefaultLocationLoaded(true);
      }
    };

    if (window.google?.maps) {
      initializeDefaultLocation();
    }
  }, [isDefaultLocationLoaded, initialLocation, searchVenues, searchFeatured, searchDistance]);

  const handleLocationChange = (locationData) => {
    // locationData contains: lat, lon, address, placeId, postcode, country
    setSelectedLocation(locationData);
    
    // If no search query, fetch featured services for new location
    // Otherwise, re-trigger regular search for the new location
    if (!searchQuery.trim()) {
      searchFeatured({
        lat: locationData.lat,
        lon: locationData.lon,
        distance: searchDistance,
      }).catch(() => {
        // Error fetching featured - continue silently
      });
    } else {
      handleSearch(searchQuery, {
        location: locationData,
        distance: searchDistance,
        force: true,
      });
    }
  };

  // Click outside handler
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Re-search when filters change
  React.useEffect(() => {
    if (suppressNextAutoSearchRef.current) {
      suppressNextAutoSearchRef.current = false;
      return;
    }

    if (searchQuery.length >= 1) {
      const timerId = window.setTimeout(() => {
        void handleSearch(searchQuery);
      }, 0);

      return () => window.clearTimeout(timerId);
    }
  }, [handleSearch, searchQuery, selectedFilters]);

  const handleFilterChange = (filterType, filterId) => {
    toggleFilter(filterType, filterId);
  };

  const handleServiceSelect = (service) => {
    setShowDropdown(false);
    setSelectedServiceOrSalon(true);
    suppressNextAutoSearchRef.current = true;
    setSearchQuery(service?.name || '');
  };

  const handleVenueSelect = (venue) => {
    setShowDropdown(false);
    setSelectedServiceOrSalon(true);
    suppressNextAutoSearchRef.current = true;
    setSearchQuery(venue?.name || '');
  };

  // Render filter toggle button
  const renderFilterToggle = () => {
    const hasFilters = selectedFilters.categories?.length > 0 || selectedFilters.audiences?.length > 0;
    const filterCount = (selectedFilters.categories?.length || 0) + (selectedFilters.audiences?.length || 0);
    return (
      <div className="flex items-center justify-end px-3 py-3 border-b border-gray-200">
        <button
          onClick={() => setExpandedFilter(expandedFilter === 'all' ? null : 'all')}
          className={cn(
            'flex items-center gap-2 px-2 py-1 rounded-lg border transition-all',
            hasFilters
              ? 'border-primary text-primary bg-blue-50'
              : 'border-gray-300 text-gray-700 bg-white hover:border-gray-400'
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">
            Filters {hasFilters && `(${filterCount})`}
          </span>
          <ChevronDown className={cn(
            'w-4 h-4 transition-transform',
            expandedFilter === 'all' && 'rotate-180'
          )} />
        </button>
      </div>
    );
  };

  // Render expandable filter categories
  const renderFilterCategories = () => {
    if (expandedFilter !== 'all') return null;

    return (
      <div className="p-3 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          {/* Categories - Left Column */}
          {filterOptions.categories?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-2">Categories</h4>
              <div className="space-y-2">
                {filterOptions.categories.map((cat) => {
                  const IconComponent = getIcon(cat.icon);
                  return (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters.categories?.includes(cat.id) || false}
                        onChange={() => handleFilterChange('categories', cat.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      {IconComponent && (
                        <IconComponent className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Audiences - Right Column */}
          {filterOptions.audiences?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-2">Audience</h4>
              <div className="space-y-2">
                {filterOptions.audiences.map((aud) => {
                  const IconComponent = getIcon(aud.icon);
                  return (
                    <label key={aud.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters.audiences?.includes(aud.id) || false}
                        onChange={() => handleFilterChange('audiences', aud.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      {IconComponent && (
                        <IconComponent className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-700">{aud.name}</span>
                    </label>
                  );
                })}
              </div>

              {/* Search Distance - Below Audiences */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-900 mb-3">Search Distance</h4>
                <div className="flex gap-4">
                  {['5km', '10km', '15km', '30km'].map((distance) => (
                    <label key={distance} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="search-distance"
                        value={distance}
                        checked={searchDistance === distance}
                        onChange={() => {
                          setSearchDistance(distance);
                          // If no search query, fetch featured services with new distance
                          // Otherwise, re-search with new distance
                          if (!searchQuery.trim()) {
                            // Fetch featured services with new distance
                            searchFeatured({
                              lat: selectedLocation?.lat,
                              lon: selectedLocation?.lon,
                              distance,
                            }).catch(() => {
                              // Error fetching featured - continue silently
                            });
                          } else {
                            // Re-search with new distance
                            handleSearch(searchQuery, {
                              location: selectedLocation,
                              distance,
                              force: true,
                            });
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{distance}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Apply and Clear Buttons */}
        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => {
              clearFilters();
              setSearchDistance('10km'); // Reset to default
              setExpandedFilter(null);
              // Re-trigger search with cleared filters
              handleSearch(searchQuery);
            }}
            className="px-4 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => {
              setExpandedFilter(null);
              // Apply should only close the filter panel and keep the search results open.
              handleSearch(searchQuery, { force: true });
            }}
            className="px-4 py-1.5 bg-brand-blue text-white text-xs font-medium rounded-md hover:opacity-90 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    );
  };

  // Render services section
  const renderServicesSection = () => {
    // Show featured services if no search query, otherwise show search results
    const servicesToShow = !searchQuery.trim() ? featuredServices : services;
    
    if (servicesToShow.length === 0) return null;

    return (
      <div>
        <div className="sticky top-0 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 border-b border-gray-200">
          {!searchQuery.trim() ? 'Featured Services' : 'Services'}
        </div>
        {servicesToShow.map((service, index) => (
          <button
            key={service.name || `service-${index}`}
            onClick={() => handleServiceSelect(service)}
            className="w-full h-16 px-4 flex flex-col justify-center text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
          >
            <p className="text-sm font-semibold text-gray-900 truncate">{service.name}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                {Array.isArray(service.categories) && service.categories.length > 0
                  ? service.categories.join(', ')
                  : service.category || ''}
              </p>
              {service.venueCount > 0 && (
                <p className="text-xs text-gray-500">{service.venueCount} {service.venueCount === 1 ? 'location' : 'locations'}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };

  // Render venues section with distance
  const renderVenuesSection = () => {
    if (venues.length === 0) return null;

    return (
      <div>
        <div className="sticky top-0 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 border-b border-gray-200">Nearby Salons</div>
        {venues.map((venue, index) => {
          // Calculate distance if location is selected and venue has location data
          let distance = null;
          let distanceLabel = null;
          
          // Debug logging
          if (venue.id === venues[0]?.id) {
            console.log('[Hero] Debug distance calculation:', {
              selectedLocation,
              venueLocation: venue.location,
              venue: venue
            });
          }
          
          if (selectedLocation && venue.location) {
            try {
              distance = calculateDistance(
                selectedLocation.lat,
                selectedLocation.lon,
                venue.location.lat || venue.location.lat,
                venue.location.lon || venue.location.lon
              );
              distanceLabel = distance.toFixed(1);
              
              if (venue.id === venues[0]?.id) {
                console.log('[Hero] Distance calculated:', distanceLabel, 'km');
              }
            } catch (err) {
              console.error('[Hero] Error calculating distance:', err, { selectedLocation, venue });
            }
          } else if (venue.id === venues[0]?.id) {
            console.log('[Hero] Cannot calculate distance - missing data:', {
              hasSelectedLocation: !!selectedLocation,
              hasVenueLocation: !!venue.location
            });
          }

          return (
            <button
              key={venue.id || `venue-${index}`}
              onClick={() => handleVenueSelect(venue)}
              className="flex items-center gap-3 w-full h-16 px-4 hover:bg-gray-50 text-left transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {venue.image ? (
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <span className="text-gray-400 text-xs hidden">No image</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {venue.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{venue.address}</p>
              </div>
              {distanceLabel ? (
                <div className="flex items-center gap-1 flex-shrink-0 px-2 py-1 bg-blue-50 rounded">
                  <span className="text-xs font-semibold text-blue-600">
                    {distanceLabel} km
                  </span>
                </div>
              ) : selectedLocation && !venue.location ? (
                <div className="flex-shrink-0 text-xs text-gray-400">
                  No location data
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    );
  };

  const renderTitleWithRedWord = (text) => {
    const redWord = 'booked';
    if (!redWord || !text.includes(redWord)) {
      return text;
    }
    const parts = text.split(redWord);
    return parts.map((part, idx) => (
      <React.Fragment key={idx}>
        {part}
        {idx < parts.length - 1 && (
          <span className="text-primary">{redWord}</span>
        )}
      </React.Fragment>
    ));
  };

  return (
    <section className="relative overflow-visible pt-5 pb-0 md:pt-8 md:pb-0">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}&libraries=maps,places&v=weekly&loading=async`}
        strategy="lazyOnload"
        onLoad={() => setMapsReady(true)}
      />
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(30, 30%, 99%) 0%, hsl(0, 30%, 97%) 40%, hsl(30, 25%, 98%) 70%, hsl(0, 20%, 96%) 100%)',
        }}
      />

      {/* Search Bar - Top, Centered, Spanning Full Width */}
      <div className="relative z-40 w-full flex justify-center px-3 sm:px-6 mb-8">
        <div className="max-w-4xl w-full">
          {/* Search Input */}
          {showSearchInput && (
            <div ref={searchRef} className="relative">
              {/* Desktop Layout: Inline */}
              <div className="hidden sm:flex h-11 items-center rounded-full border border-black/80 bg-white/95 px-2 shadow-[0_18px_45px_rgba(0,0,0,0.14)] ring-2 ring-black/10 backdrop-blur-xl">
                {/* Search Input */}
                <div className="flex items-center flex-1 px-3">
                  <Search className="w-4 h-4 text-black mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Services or Salons..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      setIsLocationSearchFocused(false);
                      setSelectedServiceOrSalon(false);
                      setShowDropdown(true);
                    }}
                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Divider */}
                <span className="text-black/25 text-xs select-none">|</span>

                {/* Location Input */}
                <div className="flex items-center w-56 px-3">
                  <LocationSearch
                    value={selectedLocation?.address || ''}
                    mapsReady={mapsReady}
                    onLocationChange={handleLocationChange}
                    onLocationFocus={() => {
                      setIsLocationSearchFocused(true);
                      setShowDropdown(false);
                    }}
                    onLocationBlur={() => {
                      setIsLocationSearchFocused(false);
                    }}
                    placeholder="Location..."
                    className="w-full"
                  />
                </div>

                {/* Search Button */}
                <button
                  type="button"
                  onClick={handleSearchButtonClick}
                  className="ml-2 h-8 px-4 rounded-full border border-black bg-black text-white shadow-sm transition hover:bg-neutral-800 hover:border-neutral-800 flex items-center justify-center text-sm font-medium shrink-0"
                  aria-label="Search"
                  title="Search"
                >
                  Search
                </button>
              </div>

              {/* Mobile Layout: Stacked */}
              <div className="sm:hidden space-y-2">
                {/* Search Input */}
                <div className="h-8 flex items-center rounded-md border border-black/70 bg-white px-2 shadow-sm">
                  <Search className="w-3.5 h-3.5 text-black mr-1.5 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Services or Salons..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      setIsLocationSearchFocused(false);
                      setSelectedServiceOrSalon(false);
                      setShowDropdown(true);
                    }}
                    className="w-full bg-transparent outline-none text-xs text-gray-700 placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-1"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Location Input + Search Button - Same Row */}
                <div className="h-8 flex items-center gap-1.5">
                  {/* Location Input */}
                  <div className="flex-1 flex items-center rounded-md border border-black/70 bg-white px-2 py-1 shadow-sm">
                    <LocationSearch
                      value={selectedLocation?.address || ''}
                      mapsReady={mapsReady}
                      onLocationChange={handleLocationChange}
                      onLocationFocus={() => {
                        setIsLocationSearchFocused(true);
                        setShowDropdown(false);
                      }}
                      onLocationBlur={() => {
                        setIsLocationSearchFocused(false);
                      }}
                      placeholder="Location..."
                      className="w-full"
                    />
                  </div>

                  {/* Search Button */}
                  <button
                    type="button"
                    onClick={handleSearchButtonClick}
                    className="h-8 px-3 rounded-md border border-black bg-black text-white transition hover:bg-neutral-800 hover:border-neutral-800 flex items-center justify-center text-xs font-medium shrink-0"
                    aria-label="Search"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Dropdown Results - Single Column Layout */}
              {showDropdown && !isLocationSearchFocused && !selectedServiceOrSalon && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-40 max-h-96 overflow-y-auto">
                  {/* Single unified column */}
                  <div className="flex flex-col">
                    <div className="border-b border-gray-200">
                      {renderServicesSection()}
                    </div>
                    <div>
                      {renderVenuesSection()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content + Image Layout - 2 Columns Below Search */}
      <div className="relative max-w-6xl mx-auto px-3 sm:px-6 flex flex-col lg:flex-row items-center gap-6">
        {/* Left Column - Text & Buttons */}
        <div className="flex-1">
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6 px-2 sm:px-4 text-center text-black">
            <div>Your <span className="text-accent">perfect</span> look</div>
            <div>{renderTitleWithRedWord('booked in seconds')}</div>
            {/* Red accent underline */}
            <span
              className="block w-24 h-1 rounded-full mt-4 bg-primary mx-auto"
            />
          </h1>

          {/* Subtitle */}
          <div className="mb-10 px-2 sm:px-4 text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Ready to Find Your Salon?
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6 max-w-lg mx-auto">
              Search hundreds of salons, compare services, and book your next appointment.
            </p>
            {/* CTA Buttons */}
            <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
              <button
                onClick={() => router.push('/salon/search')}
                className="px-4 py-1.5 sm:px-6 sm:py-2.5 text-xs sm:text-base bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Explore Salons
              </button>
              <button
                onClick={() => router.push('/search/service')}
                className="px-4 py-1.5 sm:px-6 sm:py-2.5 text-xs sm:text-base border-2 border-black text-black font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                Browse Services
              </button>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="hidden lg:flex flex-shrink-0">
          <img
            src="/images/hero-beauty.png"
            alt="Hero illustration"
            className="w-[300px] h-auto opacity-80"
            style={{
              maskImage: 'linear-gradient(to left, transparent 0%, black 30%)',
              WebkitMaskImage: 'linear-gradient(to left, transparent 0%, black 30%)',
            }}
          />
        </div>
      </div>
    </section>
  );
}