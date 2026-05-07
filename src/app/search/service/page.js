import { notFound } from "next/navigation";
import PageShell from "@/components/layouts/PageShell";
import ServiceNameSearchClient from "@/components/search/ServiceNameSearchClient";
import laravelApp from "@/services/laravelApp";

/**
 * /search/service?service=Hair+Cut&loc=London&lat=51.5&lon=-0.13&distance=10km&categories=1,2&audiences=3
 *
 * SSR: fetches venues from ES via service name parameter
 * Backend resolves all global service UUIDs with that name and finds venues offering any variant
 * The client component then shows per-venue the specific matched services.
 */
export default async function ServiceNameSearchPage({ searchParams }) {
  const query = (await searchParams) || {};
  const serviceName = query.service || null;

  if (!serviceName) {
    notFound();
  }

  const lat = query.lat ? Number(query.lat) : null;
  const lon = query.lon ? Number(query.lon) : null;
  const distance = query.distance || "10km";
  const loc = query.loc || "";
  const categories = query.categories || null;
  const audiences = query.audiences || null;

  let initialVenues = [];

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

  return (
    <PageShell
      variant="marketing"
      title={`${serviceName} near you`}
      contentClassName="mt-6"
    >
      <ServiceNameSearchClient
        serviceName={serviceName}
        initialVenues={initialVenues}
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
