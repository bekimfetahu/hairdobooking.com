import PageShell from "@/components/layouts/PageShell";
import ServiceNameSearchClient from "@/components/search/ServiceNameSearchClient";
import laravelApp from "@/services/laravelApp";

/**
 * /salon/search?loc=London&lat=51.5&lon=-0.13&distance=10km&categories=1,2&audiences=3
 *
 * SSR: fetches venues from ES with optional filters
 * The client component allows browsing and filtering salons
 */
export default async function SalonSearchPage({ searchParams }) {
  const query = (await searchParams) || {};
  
  const lat = query.lat ? Number(query.lat) : null;
  const lon = query.lon ? Number(query.lon) : null;
  const distance = query.distance || "50km";
  const loc = query.loc || "";
  const categories = query.categories || null;
  const audiences = query.audiences || null;

  let initialVenues = [];

  try {
    // Fetch venues with optional filters
    const params = { perPage: 20, page: 1 };
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
      title="Explore Salons"
      contentClassName="mt-6"
    >
      <SalonSearchClient
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
