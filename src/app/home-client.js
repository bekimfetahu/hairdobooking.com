'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/search/Hero';
import CardCarousel from '@/components/content/CardCarousel';
import CategoryCarousel from '@/components/content/CategoryCarousel';
import { TestimonialCard } from '@/components/content/Card';

/**
 * Home Page Client Component
 * Marketplace landing page with hero, categories, popular salons, and testimonials
 * Receives initial data from server component
 */

const testimonials = [
  {
    name: 'Sarah M.',
    text: 'Found my perfect salon in seconds! The booking was so easy and my hair looks amazing.',
    role: 'Client',
  },
  {
    name: 'Emma L.',
    text: 'Love how simple it is to discover new salons. Never going anywhere else!',
    role: 'Client',
  },
  {
    name: 'Jessica K.',
    text: 'So many great salons to choose from. The search feature is incredibly helpful!',
    role: 'Client',
  },
];

const salonData = [
  {
    id: '1',
    name: 'Luxe Hair Studio',
    subtitle: '45 Oxford Street, London',
    description: 'Premium haircuts and styling',
    image: '/images/salon-1.jpg',
  },
  {
    id: '2',
    name: 'The Brick Room',
    subtitle: '12 Shoreditch, London',
    description: 'Classic barber experience',
    image: '/images/salon-2.jpg',
  },
  {
    id: '3',
    name: 'Pure Beauty Spa',
    subtitle: '88 Kings Road, Chelsea',
    description: 'Skin care and facials',
    image: '/images/salon-3.jpg',
  },
  {
    id: '4',
    name: 'Neon Nails Bar',
    subtitle: '23 Camden High St, London',
    description: 'Nail art and polish',
    image: '/images/salon-4.jpg',
  },
];

const categories = [
  { name: 'Hair', slug: 'hair', image: '/images/category-hair.png' },
  { name: 'Barbering', slug: 'barbering', image: '/images/category-barber.png' },
  { name: 'Makeup', slug: 'makeup', image: '/images/category-makeup.png' },
  { name: 'Brows & Lashes', slug: 'brows-lashes', image: '/images/category-brows-and-lashes.png' },
  { name: 'Nails', slug: 'nails', image: '/images/category-nails.png' },
  { name: 'Skin Care', slug: 'skin-care', image: '/images/category-skincare.png' },
  { name: 'Face', slug: 'face', image: '/images/category-face.png' },
  { name: 'Massage', slug: 'massage', image: '/images/category-massage.png' },
  { name: 'Body', slug: 'body', image: '/images/category-body.png' },
];

export default function HomeClient({ initialLocation, initialVenues, initialServices }) {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = React.useState(initialLocation || null);
  const [newSalons, setNewSalons] = React.useState([]);
  const [loadingNewSalons, setLoadingNewSalons] = React.useState(false);

  // Fetch new salons on mount
  React.useEffect(() => {
    const fetchNewSalons = async () => {
      setLoadingNewSalons(true);
      try {
        const response = await fetch('/api/new-salons');
        if (response.ok) {
          const data = await response.json();
          // Transform API response to CardCarousel format
          const transformedSalons = (data.data || []).map(salon => ({
            id: salon.venue.uuid,
            name: salon.venue.name,
            slug: salon.venue.slug,
            subtitle: salon.address?.formatted || 'Address not available',
            image: salon.primary_image?.url || '/images/placeholder.jpg',
          }));
          setNewSalons(transformedSalons);
        }
      } catch (error) {
        console.error('Failed to fetch new salons:', error);
      } finally {
        setLoadingNewSalons(false);
      }
    };

    fetchNewSalons();
  }, []);

  const handleSearch = (searchData) => {
    console.log('Search query:', searchData.query);
    console.log('Location:', searchData.location);
    // TODO: Implement search logic / API call
  };

  const handleLocationChange = (newLocation) => {
    setCurrentLocation(newLocation);
  };

  const handleCategoryClick = (cat) => {
    // Navigate to category search page with category slug and current location
    const params = new URLSearchParams();
    params.set('category', cat.slug);
    
    // Add location parameters if available
    if (currentLocation?.lat) params.set('lat', currentLocation.lat);
    if (currentLocation?.lon) params.set('lon', currentLocation.lon);
    if (currentLocation?.address) params.set('loc', currentLocation.address);
    
    router.push(`/search/category?${params.toString()}`);
  };

  const handleNavigate = (direction) => {
    console.log(`Scrolled ${direction}`);
  };

  const handleCardClick = (salon) => {
    if (!salon?.slug) {
      return;
    }

    router.push(`/salon/${salon.slug}`);
  };

  return (
    <div className="min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <Hero 
        onSearch={handleSearch}
        onLocationChange={handleLocationChange}
        initialLocation={initialLocation}
        initialVenues={initialVenues}
        initialServices={initialServices}
      />

      {/* ===== CATEGORY CAROUSEL SECTION ===== */}
      <section className="py-6 md:py-16 bg-white" id="categories">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <CategoryCarousel
            title="Popular Categories"
            categories={categories}
            onCategoryClick={handleCategoryClick}
            onNavigate={handleNavigate}
          />
        </div>
      </section>

      {/* ===== NEW TO HAIRDOBOOKING CAROUSEL (REAL DATA) ===== */}
      {!loadingNewSalons && newSalons.length > 0 && (
        <section className="py-6 md:py-16 bg-white" id="new-to-hairdobooking">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <CardCarousel
              title="New to Hairdobooking"
              cards={newSalons.slice(0, 6)}
              cardWidth={280}
              onCardClick={handleCardClick}
              onNavigate={handleNavigate}
              cardButtonClassName="focus:ring-0 focus:ring-offset-0"
            />
          </div>
        </section>
      )}

      {/* ===== POPULAR SALONS CAROUSEL ===== */}
      <section className="py-6 md:py-16 bg-white" id="popular">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <CardCarousel
            title="Popular Salons"
            cards={salonData.slice(0, 3)}
            cardWidth={280}
            onCardClick={handleCardClick}
            onNavigate={handleNavigate}
          />
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="py-6 md:py-16 bg-[#FDFBF8]" id="testimonials">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* Section Title */}
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-black mb-4">
              What Our Users Say
            </h2>
            <p className="text-accent max-w-md mx-auto">
              Real reviews from real users
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.name}
                name={testimonial.name}
                text={testimonial.text}
                role={testimonial.role}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 md:py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="font-bold text-lg mb-4">
                <span className="text-brand-black">Hairdo</span>
                <span className="text-primary">Booking</span>
              </h3>
              <p className="text-sm text-accent">
                Your perfect salon booking experience.
              </p>
            </div>

            {/* Links Columns */}
            {[
              { title: 'Product', items: ['Features', 'Pricing', 'Security'] },
              { title: 'Company', items: ['About', 'Blog', 'Careers'] },
              { title: 'Support', items: ['Help', 'Contact', 'Docs'] },
            ].map((column) => (
              <div key={column.title}>
                <h4 className="font-semibold mb-4 text-sm">{column.title}</h4>
                <ul className="space-y-2">
                  {column.items.map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm text-accent hover:text-brand-black transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-8">
            <p className="text-sm text-accent">
              © 2024 HairdoBooking. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
