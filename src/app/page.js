import { fetchInitialData } from '@/services/search/initialDataFetcher';
import HomeClient from '@/app/home-client';

/**
 * Home Page - Server Component
 * Fetches initial data (London salons and services) on the server
 * Passes data to HomeClient component for rendering
 */

export const metadata = {
  title: 'HairdoBooking - Find Your Perfect Salon',
  description: 'Book your next salon appointment online. Search salons, compare services, and get instant availability.',
};

export default async function Home() {
  // Fetch initial data for London on the server
  const { initialLocation, initialVenues, initialServices } = await fetchInitialData('10km');

  return (
    <HomeClient 
      initialLocation={initialLocation}
      initialVenues={initialVenues}
      initialServices={initialServices}
    />
  );
}
