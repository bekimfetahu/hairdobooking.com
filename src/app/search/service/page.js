import { notFound } from "next/navigation";
import PageShell from "@/components/layouts/PageShell";
import ServiceNameSearchClient from "@/components/search/ServiceNameSearchClient";
import laravelApp from "@/services/laravelApp";

/**
 * /search/service?name=Hair+Cut&loc=London&lat=51.5&lon=-0.13&distance=10km&categories=1,2&audiences=3
 *
 * SSR: fetches venues from ES via `q={name}` so all venues offering the
 * searched service name (across any category/audience) are returned.
 * The client component then shows per-venue the specific matched services.
 */
export default async function ServiceNameSearchPage({ searchParams }) {
  const query = (await searchParams) || {};
  const name = query.name || "";
  const serviceUuid = query.service_uuid || null;

  if (!name && !serviceUuid) {
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
    // Prefer filtering by service_uuid if present
    const params = { perPage: 20, page: 1 };
    if (serviceUuid) params.service = serviceUuid;
    else if (name) params.q = name;
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
      title={`${name} near you`}
      contentClassName="mt-6"
    >
      <ServiceNameSearchClient
        serviceName={name}
        serviceUuid={serviceUuid}
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
