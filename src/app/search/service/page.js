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
  const distance = query.distance || "10km";
  const loc = query.loc || "";
  const categories = query.categories || null;
  const audiences = query.audiences || null;

  let initialVenues = [];
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
