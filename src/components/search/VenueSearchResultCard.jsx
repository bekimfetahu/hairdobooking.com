"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Clock, MapPin } from "lucide-react";

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

function getMatchedServices(venue, serviceName) {
  const all = venue?.services || [];
  if (serviceName) {
    const lower = serviceName.toLowerCase();
    return all.filter((service) => (service.name || "").toLowerCase() === lower);
  }
  return all;
}

function groupMatchedServices(services) {
  if (services.length === 0) return [];
  const label = services[0].name || "";
  return [{ key: label, label, items: services }];
}

function VenueSearchResultCard({
  venue,
  index,
  activeServiceName,
  selectedFilters,
  selectedLocation,
  expandedOpeningHours,
  toggleOpeningHours,
  expandedGroups,
  toggleGroup,
  handleServiceClick,
}) {
  const matched = getMatchedServices(venue, activeServiceName).filter((service) => {
    if (selectedFilters.categories?.length && !selectedFilters.categories.includes(Number(service.category_id))) return false;
    if (selectedFilters.audiences?.length && !selectedFilters.audiences.includes(Number(service.audience_id))) return false;
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

  const venueUuid = venue.venue?.uuid || "";
  const venueSlug = venue.venue?.slug || "";
  return (
    <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
      <div className="relative w-full flex flex-col md:flex-row md:items-start gap-2 p-3 md:p-4 text-left">
        <div className="absolute inset-0 rounded-sm bg-gray-50 opacity-0 transition-opacity duration-150 peer-hover:opacity-100 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-2 flex-1 min-w-0">
          <Link
            href={venueSlug ? `/salon/${venueSlug}` : "#"}
            onClick={(event) => {
              if (!venueSlug) {
                event.preventDefault();
              }
            }}
            className="peer w-full md:w-48 h-40 md:h-32 bg-gray-100 flex-shrink-0 overflow-hidden rounded-sm cursor-pointer transition-opacity hover:opacity-95"
          >
            {venue.primary_image?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={venue.primary_image.url}
                alt={venue.venue?.name || ""}
                className="w-full h-full object-cover"
                onError={(event) => { event.target.style.display = "none"; }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </Link>

          <div className="flex-1 min-w-0 py-0 md:py-0">
            <p className="font-semibold text-gray-900 truncate">{venue.venue?.name}</p>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <div className="flex items-center gap-1.5 text-sm text-gray-600 min-w-0">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{address}</span>
              </div>
              {distanceMiles && (
                <div className="text-sm font-medium text-gray-700 flex-shrink-0">
                  {distanceMiles} mi
                </div>
              )}
            </div>

            {venue.opening_hours && venue.opening_hours.length > 0 && (() => {
              const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
              const todayHours = venue.opening_hours.find((hours) => hours.day === today);
              const isHoursExpanded = expandedOpeningHours.has(venueUuid);

              const formatTime = (time) => {
                if (!time) return "";
                const [hourString, minuteString] = time.split(":");
                const hour = Number(hourString);
                const minute = minuteString;
                const period = hour >= 12 ? "pm" : "am";
                const displayHour = hour % 12 || 12;
                return minute === "00" ? `${displayHour}${period}` : `${displayHour}:${minute}${period}`;
              };

              return (
                <div className="mt-2 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleOpeningHours(venueUuid)}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      {todayHours
                        ? `${todayHours.day} ${formatTime(todayHours.open)} - ${formatTime(todayHours.close)}`
                        : "Closed"}
                    </span>
                    {isHoursExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                  </button>

                  {isHoursExpanded && (() => {
                    const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                    return (
                      <div className="mt-2 pl-5 border-l border-gray-200">
                        <div className="space-y-1">
                          {allDays.map((day) => {
                            const hours = venue.opening_hours.find((hour) => hour.day === day);
                            const isClosed = !hours || !hours.open || !hours.close;
                            return (
                              <div key={day} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isClosed ? "bg-gray-300" : "bg-green-500"}`} />
                                  <span className={`font-medium ${isClosed ? "text-gray-400" : "text-gray-600"}`}>{day}</span>
                                </div>
                                <span className={isClosed ? "text-gray-400" : "text-gray-500"}>
                                  {isClosed
                                    ? "Closed"
                                    : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
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
      </div>

      <div className="divide-y divide-gray-100 border-t border-gray-100">
        {groupMatchedServices(matched).map((group) => {
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
                className="w-full px-3 md:px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {service.display_name || service.name}
                  </p>
                  {meta && <p className="text-xs text-gray-500 mt-0.5">{meta}</p>}
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

          const prices = group.items
            .map((service) => Number(service.price))
            .filter((price) => !Number.isNaN(price));
          const minPrice = prices.length ? Math.min(...prices) : null;

          return (
            <div key={group.key}>
              <button
                type="button"
                onClick={() => toggleGroup(venueUuid, group.key)}
                className="w-full px-3 md:px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
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
                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="divide-y divide-gray-100">
                  {group.items.map((service, serviceIndex) => {
                    const meta = [service.category, service.audience].filter(Boolean).join(" · ");

                    return (
                      <button
                        key={service.uuid || serviceIndex}
                        type="button"
                        onClick={() => handleServiceClick(venue, service)}
                        className="w-full pl-10 pr-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-700 truncate">
                            {service.display_name || service.name}
                          </p>
                          {meta && <p className="text-xs text-gray-500 mt-0.5">{meta}</p>}
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
}

export default VenueSearchResultCard;