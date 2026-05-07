"use client";

import React from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Filter, ChevronDown, MapPin, Search } from "lucide-react";
import LocationSearch from "@/components/search/LocationSearch";
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

export default function ServiceNameSearchClient({
  serviceName,
  initialVenues = [],
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
  const [mapsReady, setMapsReady] = React.useState(false);
  const [expandedFilter, setExpandedFilter] = React.useState(null);
  const [searchDistance, setSearchDistance] = React.useState(initialDistance);
  const [selectedLocation, setSelectedLocation] = React.useState(
    Number.isFinite(initialLocationLat) && Number.isFinite(initialLocationLon)
      ? { lat: initialLocationLat, lon: initialLocationLon, address: initialLocationLabel }
      : null
  );

  // Service search input state
  const [serviceQuery, setServiceQuery] = React.useState(serviceName);
  const [activeServiceName, setActiveServiceName] = React.useState(serviceName);
  const [showServiceDropdown, setShowServiceDropdown] = React.useState(false);
  // Tracks which service groups are expanded: Set of "venueUuid::groupKey"
  const [expandedGroups, setExpandedGroups] = React.useState(new Set());
  const serviceSearchRef = React.useRef(null);
  const serviceDebounceRef = React.useRef(null);

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
        void searchServices({ q: val.trim(), perPage: 8 });
        setShowServiceDropdown(true);
      }, 300);
    } else {
      setShowServiceDropdown(false);
    }
  };

  const handleServiceSelect = (service) => {
    setShowServiceDropdown(false);
    setServiceQuery(service.name);
    setActiveServiceName(service.name);
    setActiveServiceName(service.name);
    // Update URL silently — no navigation, results update client-side
    const params = new URLSearchParams();
    params.set("service", service.name);
    if (selectedLocation?.address) params.set("loc", selectedLocation.address);
    if (selectedLocation?.lat != null) params.set("lat", String(selectedLocation.lat));
    if (selectedLocation?.lon != null) params.set("lon", String(selectedLocation.lon));
    params.set("distance", searchDistance);
    if (selectedFilters.categories?.length) params.set("categories", selectedFilters.categories.join(","));
    if (selectedFilters.audiences?.length) params.set("audiences", selectedFilters.audiences.join(","));
    router.replace(`/search/service?${params.toString()}`, { scroll: false });
    // Fetch venues for the newly selected service
    void fetchVenues({ activeService: service.name });
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

  const hasActiveFilters =
    (selectedFilters.categories?.length || 0) > 0 ||
    (selectedFilters.audiences?.length || 0) > 0;

  const fetchVenues = React.useCallback(
    async ({
      location = selectedLocation,
      distance = searchDistance,
      filters = selectedFilters,
      activeService,
    } = {}) => {
      // Assign defaults if not provided
      if (typeof activeService === 'undefined') activeService = activeServiceName;
      setLoading(true);
      try {
        const params = {
          lat: location?.lat,
          lon: location?.lon,
          distance,
          category: filters.categories?.length ? filters.categories.join(",") : undefined,
          audience: filters.audiences?.length ? filters.audiences.join(",") : undefined,
          perPage: 48,
        };
        if (activeService) {
          params.service = activeService;
        }
        const response = await searchVenues(params);
        setVenues(response?.data || []);
      } catch (err) {
        setVenues([]);
        console.error('[ServiceNameSearchClient] fetchVenues error:', err);
      } finally {
        setLoading(false);
      }
    },
    [activeServiceName, selectedLocation, searchDistance, selectedFilters]
  );

  const handleLocationChange = (locationData) => {
    setSelectedLocation(locationData);
    void fetchVenues({ location: locationData });
  };

  const handleServiceClick = (venue, service) => {
    if (!venue?.venue?.slug || !service?.uuid) return;
    router.push(`/salon/${venue.venue.slug}/service/${service.uuid}`);
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

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}&libraries=maps,places&v=weekly&loading=async`}
        strategy="lazyOnload"
        onLoad={() => setMapsReady(true)}
      />

      {/* Hero-style pill search bar — centered */}
      <div className="max-w-2xl mx-auto mb-8">
        <div ref={serviceSearchRef} className="relative">
          <div className="flex items-center bg-white rounded-full border border-gray-200 px-2 sm:px-4 py-0.5 shadow-sm overflow-visible">
            {/* Service search — 60% */}
            <div className="w-3/5 flex items-center">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={serviceQuery}
                  onChange={handleServiceQueryChange}
                  onFocus={() => setShowServiceDropdown(true)}
                  placeholder="Search Services or Salons..."
                  className="w-full h-8 sm:h-9 pl-6 sm:pl-8 pr-1 sm:pr-2 rounded-full border-0 bg-transparent text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-5 sm:h-6 bg-gray-200 w-px flex-shrink-0" />

            {/* Location — 40% */}
            <div className="w-2/5 flex items-center">
              <LocationSearch
                value={selectedLocation?.address || initialLocationLabel}
                mapsReady={mapsReady}
                onLocationChange={(loc) => {
                  setSelectedLocation(loc);
                  setShowServiceDropdown(false);
                  void fetchVenues({ location: loc });
                }}
                onLocationFocus={() => setShowServiceDropdown(false)}
                placeholder="Location..."
                className="w-full"
              />
            </div>
          </div>

          {/* Dropdown */}
          {showServiceDropdown && (
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
                      onClick={() => handleServiceSelect(service)}
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
              ) : serviceQuery.trim().length >= 1 ? (
                <div className="p-4 text-center text-sm text-gray-500">No services found for &quot;{serviceQuery}&quot;</div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Result count (only venues with at least one matched service) */}
      {!loading && venues.length > 0 && (() => {
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
          <p className="text-sm text-gray-500 mb-4">
            {venuesWithMatch.length} {venuesWithMatch.length === 1 ? "venue" : "venues"} offer &quot;{activeServiceName}&quot;
            {hasActiveFilters && " with selected filters"}
          </p>
        );
      })()}

      {/* Venue cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent mr-3" />
          Searching venues...
        </div>
      ) : venues.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          No venues found offering &quot;{activeServiceName}&quot;
          {hasActiveFilters && " with the selected filters"}.
        </div>
      ) : (
        <div className="space-y-4">
          {venues.map((venue, vi) => {
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

            let distanceKm = null;
            const vLat = venue.address?.location?.lat;
            const vLon = venue.address?.location?.lon;
            if (selectedLocation?.lat && vLat && vLon) {
              distanceKm = calcDistance(
                selectedLocation.lat,
                selectedLocation.lon,
                vLat,
                vLon
              ).toFixed(1);
            }

            return (
              <div
                key={venue.venue?.uuid || vi}
                className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                {/* Venue header */}
                <div className="flex items-center gap-4 px-4 py-4 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {venue.primary_image?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={venue.primary_image.url}
                        alt={venue.venue?.name || ""}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{venue.venue?.name}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{address}</span>
                      {distanceKm && (
                        <span className="flex-shrink-0 ml-2 font-medium text-gray-700">
                          {distanceKm} km
                        </span>
                      )}
                    </div>
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
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
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
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0 flex-1 flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {group.label}
                            </p>
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 flex-shrink-0">
                              {group.items.length}
                            </span>
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
                          <div className="bg-gray-50 divide-y divide-gray-100">
                            {group.items.map((service, si) => {
                              const meta = [service.category, service.audience].filter(Boolean).join(" · ");
                              return (
                              <button
                                key={service.uuid || si}
                                type="button"
                                onClick={() => handleServiceClick(venue, service)}
                                className="w-full pl-8 pr-4 py-2.5 text-left hover:bg-gray-100 transition-colors flex items-center justify-between gap-4"
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
    </div>
  );
}
