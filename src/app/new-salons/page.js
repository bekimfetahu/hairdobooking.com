import { fetchNewSalons } from '@/services/search/initialDataFetcher';
import NewSalonsClient from '@/components/new-salons/NewSalonsClient';
import PageShell from '@/components/layouts/PageShell';

/**
 * New Salons Page
 * 
 * SSR page displaying the latest salons added to the marketplace.
 * Fetches initial data server-side and renders with pagination support.
 */
export const metadata = {
  title: 'New to Hairdobooking | Latest Salons',
  description: 'Discover recently added beauty and hair salons on Hairdobooking',
};

// Avoid build-time failures/noise in environments where backend routes may lag deployment.
// Data is fetched on request instead of during static generation.
export const dynamic = 'force-dynamic';

export default async function NewSalonsPage() {
  // Fetch initial data server-side during SSR
  const { venues, meta } = await fetchNewSalons(12, 1);

  return (
    <PageShell>
      <NewSalonsClient initialVenues={venues} initialMeta={meta} />
    </PageShell>
  );
}
