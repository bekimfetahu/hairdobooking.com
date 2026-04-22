'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, Filter } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useVenueSearch } from '@/hooks/useVenueSearch';
import { useServiceSearch } from '@/hooks/useServiceSearch';
import { useSearchFilters } from '@/hooks/useSearchFilters';

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
 */
export default function Hero({
  onSearch = null,
  showSearchInput = true,
}) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [userLocation, setUserLocation] = React.useState(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [expandedFilter, setExpandedFilter] = React.useState(null);
  const searchRef = React.useRef(null);
  const router = useRouter();
  
  const { results: venues, loading: venuesLoading, search: searchVenues } = useVenueSearch();
  const { results: services, loading: servicesLoading, search: searchServices } = useServiceSearch();
  const {
    options: filterOptions,
    selectedFilters,
    toggleFilter,
    clearFilters,
    getFilterQueryParams,
    hasActiveFilters,
  } = useSearchFilters();

  // Get user's geolocation on mount
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          console.debug('Geolocation permission denied');
        }
      );
    }
  }, []);

  // Combined search handler
  const handleSearch = React.useCallback(
    async (query) => {
      if (query.length < 1) {
        setShowDropdown(false);
        return;
      }

      try {
        console.log('[Hero] Starting search with query:', query);
        const hasFilters = selectedFilters.categories?.length > 0 || selectedFilters.audiences?.length > 0;
        
        // Search venues WITHOUT filters - always search all salons
        const venuePromise = searchVenues({
          q: query,
          lat: userLocation?.lat,
          lon: userLocation?.lon,
          distance: '10km',
          perPage: 5,
        });

        // Search services - only apply filters if filters are selected
        const serviceSearchParams = {
          q: query,
          perPage: 5,
        };

        if (hasFilters) {
          if (selectedFilters.categories?.length > 0) {
            serviceSearchParams.categories = selectedFilters.categories.join(',');
          }
          if (selectedFilters.audiences?.length > 0) {
            serviceSearchParams.audiences = selectedFilters.audiences.join(',');
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
        console.error('[Hero] Search failed:', err);
      }
    },
    [userLocation, searchVenues, searchServices, onSearch, selectedFilters]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length >= 1) {
      handleSearch(value);
    }
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
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
    if (searchQuery.length >= 1) {
      handleSearch(searchQuery);
    }
  }, [selectedFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (filterType, filterId) => {
    toggleFilter(filterType, filterId);
  };

  const handleClearAllFilters = () => {
    clearFilters();
  };

  const handleServiceSelect = (service) => {
    setShowDropdown(false);
    router.push(`/search/service/${service.uuid}`);
  };

  const handleVenueSelect = (venue) => {
    setShowDropdown(false);
    router.push(`/salon/${venue.slug}`);
  };

  // Render filter toggle button
  const renderFilterToggle = () => {
    const hasFilters = selectedFilters.categories?.length > 0 || selectedFilters.audiences?.length > 0;
    return (
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-900">Search All</span>
        <button
          onClick={() => setExpandedFilter(expandedFilter === 'all' ? null : 'all')}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
            hasFilters
              ? 'border-primary text-primary bg-blue-50'
              : 'border-gray-300 text-gray-700 bg-white hover:border-gray-400'
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
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
      <div className="p-3 border-b border-gray-200 space-y-3">
        {/* Categories */}
        {filterOptions.categories?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-900 mb-2">Categories</h4>
            <div className="space-y-2">
              {filterOptions.categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters.categories?.includes(cat.id) || false}
                    onChange={() => handleFilterChange('categories', cat.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{cat.name}</span>
                  <span className="text-xs text-gray-500">({cat.count})</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Audiences */}
        {filterOptions.audiences?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-900 mb-2">Audience</h4>
            <div className="space-y-2">
              {filterOptions.audiences.map((aud) => (
                <label key={aud.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters.audiences?.includes(aud.id) || false}
                    onChange={() => handleFilterChange('audiences', aud.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{aud.name}</span>
                  <span className="text-xs text-gray-500">({aud.count})</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render services section
  const renderServicesSection = () => {
    if (services.length === 0) return null;

    return (
      <div className="border-b border-gray-200">
        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600">Services</div>
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => handleServiceSelect(service)}
            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
          >
            <p className="text-sm font-semibold text-gray-900">{service.name}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">{service.category}</p>
              {service.venueCount > 0 && (
                <p className="text-xs text-gray-500">{service.venueCount} locations</p>
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
        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600">Salons</div>
        {venues.map((venue) => {
          const distance = userLocation && venue.location
            ? calculateDistance(
                userLocation.lat,
                userLocation.lon,
                venue.location.lat,
                venue.location.lon
              ).toFixed(1)
            : null;

          return (
            <button
              key={venue.id}
              onClick={() => handleVenueSelect(venue)}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-100 last:border-b-0"
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
              {distance && (
                <span className="text-xs font-medium text-gray-600 flex-shrink-0">
                  {distance} km
                </span>
              )}
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
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(30, 30%, 99%) 0%, hsl(0, 30%, 97%) 40%, hsl(30, 25%, 98%) 70%, hsl(0, 20%, 96%) 100%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-3 sm:px-6 flex flex-col lg:flex-row items-center gap-6">
        {/* Left Content */}
        <div className="flex-1 max-w-4xl">
          {/* Search Input */}
          {showSearchInput && (
            <div ref={searchRef} className="relative mb-10">
              <div className="flex gap-1 sm:gap-2 items-center bg-white rounded-full border border-gray-200 px-2 sm:px-4 py-2 shadow-sm overflow-hidden">
                {/* Search Input */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Services or Salons..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowDropdown(true)}
                    className={cn(
                      'w-full h-10 sm:h-12 pl-6 sm:pl-8 pr-1 sm:pr-2 rounded-full border-0 bg-transparent',
                      'text-sm sm:text-base text-gray-900 placeholder-gray-500',
                      'focus:outline-none',
                      'transition-all duration-200'
                    )}
                  />
                </div>

                {/* Divider */}
                <div className="w-px h-5 sm:h-6 bg-gray-200 flex-shrink-0"></div>

                {/* Location Input */}
                <div className="relative flex-1 min-w-0 sm:w-auto">
                  <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Location..."
                    value={location}
                    onChange={handleLocationChange}
                    className={cn(
                      'w-full h-10 sm:h-12 pl-6 sm:pl-8 pr-1 sm:pr-2 rounded-full border-0 bg-transparent',
                      'text-sm sm:text-base text-gray-900 placeholder-gray-500',
                      'focus:outline-none',
                      'transition-all duration-200'
                    )}
                  />
                </div>

                {/* Button */}
                <Button
                  variant="default"
                  size="lg"
                  className="rounded-full px-3 sm:px-6 py-2 whitespace-nowrap ml-1 sm:ml-2 text-sm sm:text-base flex-shrink-0"
                  onClick={() => console.log('Clicked explore')}
                >
                  <span className="hidden sm:inline">Explore</span>
                  <span className="sm:hidden">→</span>
                  <span className="ml-2 hidden sm:inline">→</span>
                </Button>
              </div>

              {/* Dropdown Results with Inline Filters */}
              {showDropdown && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-lg z-[9999] overflow-hidden max-h-96 overflow-y-auto">
                  {/* Filter Toggle */}
                  {renderFilterToggle()}
                  
                  {/* Expandable Filter Categories */}
                  {renderFilterCategories()}

                  {/* Search Results */}
                  {searchQuery.length >= 1 && !venuesLoading && !servicesLoading && (
                    <>
                      {renderServicesSection()}
                      {renderVenuesSection()}
                    </>
                  )}

                  {/* Loading State */}
                  {searchQuery.length >= 1 && (venuesLoading || servicesLoading) && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Searching...
                      </div>
                    </div>
                  )}

                  {/* No Results Message */}
                  {searchQuery.length >= 1 && !venuesLoading && !servicesLoading && venues.length === 0 && services.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  )}

                  {/* Empty State - Just Focused */}
                  {searchQuery.length === 0 && !venuesLoading && !servicesLoading && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Start typing to search services and salons
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 px-2 sm:px-4">
            <div>Your <span className="text-accent">perfect</span> look</div>
            <div>{renderTitleWithRedWord('booked in seconds')}</div>
            {/* Red accent underline */}
            <span
              className="block w-24 h-1 rounded-full mt-4 bg-primary"
            />
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-10 max-w-lg px-2 sm:px-4">
            Browse hundreds of hair & beauty salons.
          </p>
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