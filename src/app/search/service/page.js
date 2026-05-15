import { notFound } from "next/navigation";
import PageShell from "@/components/layouts/PageShell";
import ServiceNameSearchClient from "@/components/search/ServiceNameSearchClient";
import laravelApp from "@/services/laravelApp";

/**
 * /search/service
 * - With service param: shows venues offering that service
 * - Without service param: shows service discovery/browsing interface
 * 
 * Examples:
 * - /search/service?service=Hair+Cut&loc=London&lat=51.5&lon=-0.13&distance=10km (from home search)
 * - /search/service (from Browse Services button - no parameters)
 */
export default async function ServiceNameSearchPage({ searchParams }) {
  const query = (await searchParams) || {};
  // Accept both 'q' (from Home Hero/Pills) and 'service' (legacy) parameter names
  const serviceName = query.q || query.service || null;

  const lat = query.lat ? Number(query.lat) : null;
  const lon = query.lon ? Number(query.lon) : null;
  const distance = query.distance || "50km";
  const loc = query.loc || "";
  // Support both singular and plural query param names: `category` or `categories`, `audience` or `audiences`.
  const categories = query.categories ?? query.category ?? null;
  const audiences = query.audiences ?? query.audience ?? null;

  let initialVenues = [];
  let initialVenuesMeta = null;
  let initialFeaturedServices = [];

  // Always fetch featured services (for pills that are always visible)
  try {
    const params = {};
    if (lat) params.lat = lat;
    if (lon) params.lon = lon;
    if (lat && lon) params.distance = distance;

    const response = await laravelApp.get("/client/search/featured-services", { params });
    initialFeaturedServices = response.data?.data || [];
  } catch {
    // Page still renders; client will retry
  }

  // Also fetch venues if a service is provided
  if (serviceName) {
    try {
      // Pass service name to backend, which will resolve all UUIDs with that name
      const params = { perPage: 20, page: 1 };
      if (serviceName) params.service = serviceName;
      if (lat) params.lat = lat;
      if (lon) params.lon = lon;
      if (lat && lon) params.distance = distance;
      if (categories) params.category = categories;
      if (audiences) params.audience = audiences;

      const response = await laravelApp.get("/client/search/venues", { params });
      initialVenues = response.data?.data || [];
      // Pass meta so the client can hydrate pagination state and avoid unnecessary loads
      initialVenuesMeta = response.data?.meta || null;
    } catch {
      // Page still renders; client will retry
    }
  }

  return (
    <PageShell
      variant="marketing"
      contentClassName="mt-0"
    >
      <ServiceNameSearchClient
        serviceName={serviceName}
        initialVenues={initialVenues}
        initialVenuesMeta={initialVenuesMeta}
        initialFeaturedServices={initialFeaturedServices}
        initialLocationLabel={loc}
        initialLocationLat={lat}
        initialLocationLon={lon}
        initialDistance={distance}
        initialCategories={categories}
        initialAudiences={audiences}
      />
    </PageShell>
  );
}
