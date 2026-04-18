'use client';
import React from 'react';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// Dummy salon data for search results
const DUMMY_SALONS = [
  {
    id: '1',
    name: 'Luxe Hair Studio',
    address: '45 Oxford Street, London',
    image: '/images/salon-1.jpg',
    services: ['Haircuts', 'Styling', 'Color'],
  },
  {
    id: '2',
    name: 'The Brick Room',
    address: '12 Shoreditch High St, London',
    image: '/images/salon-2.jpg',
    services: ['Barber', 'Beard Trim', 'Shave'],
  },
  {
    id: '3',
    name: 'Pure Beauty Spa',
    address: '88 Kings Road, Chelsea',
    image: '/images/salon-3.jpg',
    services: ['Skin Care', 'Facials', 'Massage'],
  },
  {
    id: '4',
    name: 'Neon Nails Bar',
    address: '23 Camden High St, London',
    image: '/images/salon-4.jpg',
    services: ['Nails', 'Gel Polish', 'Nail Art'],
  },
  {
    id: '5',
    name: 'Zen Wellness Salon',
    address: '56 Marylebone Lane, London',
    image: '/images/salon-5.jpg',
    services: ['Massage', 'Spa', 'Treatments'],
  },
  {
    id: '6',
    name: 'Heritage Barbers',
    address: '9 Savile Row, London',
    image: '/images/salon-6.jpg',
    services: ['Barber', 'Haircuts', 'Grooming'],
  },
  {
    id: '7',
    name: 'Glam Studio',
    address: '34 Covent Garden, London',
    image: '/images/salon-7.jpg',
    services: ['Makeup', 'Hair', 'Styling'],
  },
  {
    id: '8',
    name: 'White Rose Clinic',
    address: '71 Harley Street, London',
    image: '/images/salon-8.jpg',
    services: ['Skin Care', 'Treatments', 'Facials'],
  },
];

/**
 * Hero - Modern hero with search input, gradient background, and hero image
 * Client component for interactivity (search, dropdown)
 */
export default function Hero({
  onSearch = null,
  showSearchInput = true,
  salons = DUMMY_SALONS,
}) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [showDropdown, setShowDropdown] = React.useState(false);
  const searchRef = React.useRef(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(value.length >= 2);
    if (onSearch) {
      onSearch({ query: value, location });
    }
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    if (onSearch && searchQuery.length >= 2) {
      onSearch({ query: searchQuery, location: value });
    }
  };

  // Filter salons based on search query and location
  const filteredSalons = React.useMemo(() => {
    if (searchQuery.length < 2) return [];
    
    return salons.filter((salon) => {
      const matchesQuery =
        salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.services.some((sv) =>
          sv.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        salon.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLocation =
        !location ||
        location.length < 2 ||
        salon.address.toLowerCase().includes(location.toLowerCase());
      
      return matchesQuery && matchesLocation;
    });
  }, [searchQuery, location, salons]);

  // Click outside handler
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSalonSelect = (salonName) => {
    setSearchQuery(salonName);
    setShowDropdown(false);
    if (onSearch) {
      onSearch({ query: salonName, location });
    }
  };

  // Function to render title with red word highlighting
  const renderTitleWithRedWord = (text) => {
    const redWord = 'booked';
    if (!redWord || !text.includes(redWord)) {
      return text;
    }
    const parts = text.split(redWord);
    return parts.map((part, idx) => (
      <React.Fragment key={idx}>
        {part}
        {idx < parts.length - 1 && (
          <span className="text-primary">{redWord}</span>
        )}
      </React.Fragment>
    ));
  };

  return (
    <section className="relative overflow-visible pt-5 pb-0 md:pt-8 md:pb-0">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(30, 30%, 99%) 0%, hsl(0, 30%, 97%) 40%, hsl(30, 25%, 98%) 70%, hsl(0, 20%, 96%) 100%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 flex items-center gap-6">
        {/* Left Content */}
        <div className="flex-1 max-w-4xl">
          {/* Search Input */}
          {showSearchInput && (
            <div ref={searchRef} className="relative mb-10">
              <div className="flex gap-2 items-center bg-white rounded-full border border-gray-200 px-4 py-2 shadow-sm">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search salons or services..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                    className={cn(
                      'w-full h-12 pl-8 pr-2 rounded-full border-0 bg-transparent',
                      'text-gray-900 placeholder-gray-500',
                      'focus:outline-none',
                      'transition-all duration-200'
                    )}
                  />
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200"></div>

                {/* Location Input */}
                <div className="relative w-44">
                  <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="City or postcode"
                    value={location}
                    onChange={handleLocationChange}
                    className={cn(
                      'w-full h-12 pl-8 pr-2 rounded-full border-0 bg-transparent',
                      'text-gray-900 placeholder-gray-500',
                      'focus:outline-none',
                      'transition-all duration-200'
                    )}
                  />
                </div>

                {/* Button */}
                <Button
                  variant="default"
                  size="lg"
                  className="rounded-full px-6 whitespace-nowrap ml-2"
                  onClick={() => console.log('Clicked explore')}
                >
                  Explore Salons
                  <span className="ml-2">→</span>
                </Button>
              </div>

              {/* Dropdown Results */}
              {showDropdown && filteredSalons.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-lg z-[9999] overflow-hidden">
                  {filteredSalons.map((salon) => (
                    <button
                      key={salon.id}
                      onClick={() => handleSalonSelect(salon.name)}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <img
                        src={salon.image}
                        alt={salon.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {salon.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{salon.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results Message */}
              {showDropdown && searchQuery.length >= 2 && filteredSalons.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-lg z-50 p-4 text-center text-sm text-gray-500">
                  No salons found for "{searchQuery}"
                </div>
              )}
            </div>
          )}

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 px-4">
            <div>Your <span className="text-accent">perfect</span> look,</div>
            <div>{renderTitleWithRedWord('booked in seconds')}</div>
            {/* Red accent underline */}
            <span
              className="block w-24 h-1 rounded-full mt-4 bg-primary"
            />
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-accent leading-relaxed mb-10 max-w-lg px-4">
            Browse hundreds of hair & beauty salons.
          </p>
        </div>

        {/* Right Image */}
        <div className="hidden lg:flex flex-shrink-0">
          <img
            src="/images/hero-beauty.png"
            alt="Hero illustration"
            className="w-[300px] h-auto opacity-80"
            style={{
              maskImage: 'linear-gradient(to left, transparent 0%, black 30%)',
              WebkitMaskImage: 'linear-gradient(to left, transparent 0%, black 30%)',
            }}
          />
        </div>
      </div>
    </section>
  );
}

