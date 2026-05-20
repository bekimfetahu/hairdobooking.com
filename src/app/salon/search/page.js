import PageShell from "@/components/layouts/PageShell";
import SalonSearchClient from "@/components/search/SalonSearchClient";
import laravelApp from "@/services/laravelApp";

/**
 * /salon/search?loc=London&lat=51.5&lon=-0.13&distance=10mi&categories=1,2&audiences=3
 *
 * SSR: fetches venues from ES with optional filters
 * The client component allows browsing and filtering salons
 */
export default async function SalonSearchPage({ searchParams }) {
  const query = (await searchParams) || {};
  
  // Default to London, UK if no location provided
  const lat = query.lat ? Number(query.lat) : 51.5074;
  const lon = query.lon ? Number(query.lon) : -0.1278;
  const distance = query.distance || "50mi";
  const loc = query.loc || "London, UK";
  const categories = null;
  const audiences = null;

  let initialVenues = [];

  try {
    // Fetch venues with location and distance filters
    // Use high perPage to populate the map with all venues in the search radius
    const params = { perPage: 100, page: 1 };
    params.lat = lat;
    params.lon = lon;
    params.distance = distance;
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
       contentClassName="mt-0"
     >
      <SalonSearchClient
        initialVenues={initialVenues}
        initialLocationLabel={loc}
        initialLocationLat={lat}
        initialLocationLon={lon}
        initialDistance={distance}
      />
    </PageShell>
  );
}
