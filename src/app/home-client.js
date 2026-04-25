'use client';
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/search/Hero';
import CardCarousel from '@/components/content/CardCarousel';
import CategoryCarousel from '@/components/content/CategoryCarousel';
import { TestimonialCard } from '@/components/content/Card';
import BlackButton from '@/components/ui/BlackButton';
import BlueButton from '@/components/ui/BlueButton';

/**
 * Home Page Client Component
 * Marketplace landing page with hero, categories, salons, and testimonials
 * Receives initial data from server component
 */

const testimonials = [
  {
    name: 'Sarah M.',
    text: 'Found my perfect salon in seconds! The booking was so easy and my hair looks amazing.',
    rating: 5,
    role: 'Client',
  },
  {
    name: 'Emma L.',
    text: 'Love how simple it is to discover new salons. Never going anywhere else!',
    rating: 5,
    role: 'Client',
  },
  {
    name: 'Jessica K.',
    text: 'So many great salons to choose from. The search feature is incredibly helpful!',
    rating: 5,
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
    rating: 4.8,
    badge: 'Top Rated',
  },
  {
    id: '2',
    name: 'The Brick Room',
    subtitle: '12 Shoreditch, London',
    description: 'Classic barber experience',
    image: '/images/salon-2.jpg',
    rating: 4.6,
    badge: 'New',
  },
  {
    id: '3',
    name: 'Pure Beauty Spa',
    subtitle: '88 Kings Road, Chelsea',
    description: 'Skin care and facials',
    image: '/images/salon-3.jpg',
    rating: 4.9,
    badge: 'Popular',
  },
  {
    id: '4',
    name: 'Neon Nails Bar',
    subtitle: '23 Camden High St, London',
    description: 'Nail art and polish',
    image: '/images/salon-4.jpg',
    rating: 4.7,
  },
];

const categories = [
  { name: 'Hair', image: '/images/category-hair.jpg' },
  { name: 'Barber', image: '/images/category-barber.jpg' },
  { name: 'Nails', image: '/images/category-nails.jpg' },
  { name: 'Skin Care', image: '/images/category-skincare.jpg' },
  { name: 'Massage', image: '/images/category-massage.jpg' },
  { name: 'Makeup', image: '/images/category-makeup.jpg' },
];

export default function HomeClient({ initialLocation, initialVenues, initialServices }) {
  const handleSearch = (searchData) => {
    console.log('Search query:', searchData.query);
    console.log('Location:', searchData.location);
    // TODO: Implement search logic / API call
  };

  const handleCategoryClick = (cat) => {
    console.log(`Clicked ${cat.name}`);
    // TODO: Navigate to category page
  };

  const handleNavigate = (direction) => {
    console.log(`Scrolled ${direction}`);
  };

  const handleCardClick = (salon) => {
    console.log('Clicked salon:', salon.name);
    // TODO: Navigate to salon detail page
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO SECTION ===== */}
      <Hero 
        onSearch={handleSearch}
        initialLocation={initialLocation}
        initialVenues={initialVenues}
        initialServices={initialServices}
      />

      {/* ===== CATEGORY CAROUSEL SECTION ===== */}
      <section className="py-12 md:py-16 bg-white" id="categories">
        <div className="max-w-6xl mx-auto px-6">
          <CategoryCarousel
            title="Popular Categories"
            categories={categories}
            onCategoryClick={handleCategoryClick}
            onNavigate={handleNavigate}
          />
        </div>
      </section>

      {/* ===== NEW SALONS CAROUSEL ===== */}
      <section className="py-12 md:py-16 bg-[#FDFBF8]" id="new-salons">
        <div className="max-w-6xl mx-auto px-6">
          <CardCarousel
            title="New to HairdoBooking"
            cards={salonData}
            cardWidth={280}
            showRating={true}
            onCardClick={handleCardClick}
            onNavigate={handleNavigate}
          />
        </div>
      </section>

      {/* ===== POPULAR SALONS CAROUSEL ===== */}
      <section className="py-12 md:py-16 bg-white" id="popular">
        <div className="max-w-6xl mx-auto px-6">
          <CardCarousel
            title="Popular Salons"
            cards={salonData.slice(0, 3)}
            cardWidth={280}
            showRating={true}
            onCardClick={handleCardClick}
            onNavigate={handleNavigate}
          />
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="py-12 md:py-16 bg-[#FDFBF8]" id="testimonials">
        <div className="max-w-6xl mx-auto px-6">
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
                rating={testimonial.rating}
                role={testimonial.role}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-black mb-4">
            Ready to Find Your Perfect Salon?
          </h2>
          <p className="text-accent mb-8 max-w-md mx-auto">
            Search hundreds of salons, compare services, and book your next appointment in
            seconds.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <BlackButton sizeClass="text-base px-8 py-3" onClick={() => console.log('Explore')}>
              Explore Salons
              <ArrowRight className="w-5 h-5" />
            </BlackButton>
            <BlueButton sizeClass="text-base px-8 py-3" onClick={() => console.log('Browse')}>
              Browse Services
              <ArrowRight className="w-5 h-5" />
            </BlueButton>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
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
