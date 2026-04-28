'use client';
import React from 'react';
import { Search, MapPin } from 'lucide-react';
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
];

export default function PreferredSalonSearch({ initialSearch = '' }) {
  const [searchQuery, setSearchQuery] = React.useState(initialSearch);
  const [location, setLocation] = React.useState('');
  const [showDropdown, setShowDropdown] = React.useState(false);
  const searchRef = React.useRef(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(value.length >= 2);
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
  };

  // Filter salons based on search query and location
  const filteredSalons = React.useMemo(() => {
    if (searchQuery.length < 2) return [];
    
    return DUMMY_SALONS.filter((salon) => {
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
  }, [searchQuery, location]);

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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div ref={searchRef} className="relative mb-10">
          <div className="flex gap-1 sm:gap-2 items-center bg-white rounded-full border border-gray-200 px-2 sm:px-4 py-2 shadow-sm overflow-hidden">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search salons..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                className={cn(
                  'w-full h-10 sm:h-12 pl-6 sm:pl-8 pr-1 sm:pr-2 rounded-full border-0 bg-transparent',
                  'text-sm sm:text-base text-gray-900 placeholder-gray-500',
                  'focus:outline-none',
                  'transition-all duration-200'
                )}
              />
            </div>

            {/* Divider */}
            <div className="w-px h-5 sm:h-6 bg-gray-200 flex-shrink-0"></div>

            {/* Location Input */}
            <div className="relative flex-1 min-w-0 sm:w-auto">
              <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Location..."
                value={location}
                onChange={handleLocationChange}
                className={cn(
                  'w-full h-10 sm:h-12 pl-6 sm:pl-8 pr-1 sm:pr-2 rounded-full border-0 bg-transparent',
                  'text-sm sm:text-base text-gray-900 placeholder-gray-500',
                  'focus:outline-none',
                  'transition-all duration-200'
                )}
              />
            </div>

            {/* Button */}
            <Button
              variant="default"
              size="lg"
              className="rounded-full px-3 sm:px-6 py-2 whitespace-nowrap ml-1 sm:ml-2 text-sm sm:text-base flex-shrink-0"
              onClick={() => console.log('Clicked explore')}
            >
              <span className="hidden sm:inline">Search</span>
              <span className="sm:hidden">→</span>
              <span className="ml-2 hidden sm:inline">→</span>
            </Button>
          </div>

          {/* Dropdown Results */}
          {showDropdown && filteredSalons.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-[9999] overflow-hidden">
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
            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4 text-center text-sm text-gray-500">
              No salons found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
