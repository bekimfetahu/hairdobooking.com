import PageShell from "@/components/layouts/PageShell";
import CategorySearchClient from "@/components/search/CategorySearchClient";
import laravelApp from "@/services/laravelApp";

/**
 * /search/category?category={slug}
 * Service search within a specific category domain
 * 
 * Shows category selector with initial search filtered by:
 * - Selected category (pre-selected from URL)
 * - Location and distance (user-configurable)
 * 
 * URL params:
 * - category: Category slug (optional, e.g., 'hair', 'nails')
 * - lat/lon: Location for distance filtering
 * - distance: Search radius (default 50mi)
 * - loc: Location label for display
 * - service: Optional service name within category
 * 
 * Examples:
 * - /search/category (shows all categories, user selects one)
 * - /search/category?category=hair (Hair pre-selected)
 * - /search/category?category=hair&service=Hair+Cut&lat=51.5&lon=-0.13
 */
export default async function CategorySearchPage({ searchParams }) {
  const query = (await searchParams) || {};

  const categorySlug = query.category || null;
  const serviceName = query.service || null;

  const lat = query.lat ? Number(query.lat) : null;
  const lon = query.lon ? Number(query.lon) : null;
  const distance = query.distance || "50mi";
  const loc = query.loc || "";

  let allCategories = [];
  let initialVenues = [];
  let initialVenuesMeta = null;

  // Fetch all categories
  try {
    const response = await laravelApp.get("/client/categories");
    allCategories = response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  // Fetch venues if category is provided (with or without location)
  if (categorySlug) {
    try {
      // Find the category name from the slug
      const category = allCategories.find(cat => cat.slug === categorySlug);
      const categoryName = category?.name || categorySlug;
      
      const params = { perPage: 20, page: 1 };
      params.category = categoryName; // Use category name instead of slug
      if (serviceName) params.service = serviceName;
      if (lat) params.lat = lat;
      if (lon) params.lon = lon;
      if (lat && lon) params.distance = distance;

      const response = await laravelApp.get("/client/search/venues", { params });
      initialVenues = response.data?.data || [];
      initialVenuesMeta = response.data?.meta || null;
    } catch (error) {
      console.error("Failed to fetch venues:", error);
    }
  }

  return (
    <PageShell
      variant="marketing"
      contentClassName="mt-0"
    >
      <CategorySearchClient
        categories={allCategories}
        selectedCategorySlug={categorySlug}
        initialVenues={initialVenues}
        initialVenuesMeta={initialVenuesMeta}
        initialLocationLabel={loc}
        initialLocationLat={lat}
        initialLocationLon={lon}
        initialDistance={distance}
      />
    </PageShell>
  );
}
