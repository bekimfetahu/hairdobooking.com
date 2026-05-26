'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { transformVenueToSalon } from '@/services/search/searchService';

/**
 * NewSalonsClient
 * 
 * Client component for displaying latest salons added to the marketplace.
 * Fetches initial data server-side via SSR, supports pagination and interactive loading.
 */
export default function NewSalonsClient({ initialVenues, initialMeta }) {
  const [venues, setVenues] = useState(initialVenues || []);
  const [meta, setMeta] = useState(initialMeta || {});
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch venues when page changes
  const fetchVenues = async (page) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/new-salons?perPage=12&page=${page}`);
      const data = await response.json();
      
      if (data.data) {
        const transformedVenues = data.data.map(transformVenueToSalon);
        setVenues(transformedVenues);
        setMeta(data.meta);
        setCurrentPage(page);
        
        // Scroll to top of venues
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error fetching new salons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (meta.current_page > 1) {
      fetchVenues(meta.current_page - 1);
    }
  };

  const handleNextPage = () => {
    if (meta.current_page < meta.last_page) {
      fetchVenues(meta.current_page + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-950 mb-3">
          New to Hairdobooking
        </h1>
        <p className="text-base text-neutral-600 max-w-2xl">
          Discover recently added beauty and hair salons. Find your next favorite salon with our latest additions to the platform.
        </p>
      </div>

      {/* Venues Grid */}
      <div className="mb-12">
        {venues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <Link
                key={venue.uuid}
                href={`/salon/${venue.slug}`}
                className="group block"
              >
                <div className="rounded-lg overflow-hidden border border-black/10 bg-white shadow-sm hover:shadow-md transition-shadow">
                  {/* Image Container */}
                  <div className="relative w-full aspect-[3/2] overflow-hidden bg-neutral-100">
                    {venue.primary_image?.url ? (
                      <img
                        src={venue.primary_image.url}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                        <span className="text-neutral-400 text-sm">No image available</span>
                      </div>
                    )}
                    
                    {/* Badge - New */}
                    <div className="absolute top-3 left-3 inline-flex items-center px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-black/10 shadow-sm">
                      <span className="text-xs font-semibold text-neutral-900">New</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-neutral-950 group-hover:text-neutral-900 truncate">
                      {venue.name}
                    </h3>
                    
                    {/* Address */}
                    {venue.address?.formatted && (
                      <p className="text-xs text-neutral-600 mt-1.5 truncate">
                        {venue.address.formatted}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-neutral-100">
                      {/* Service count or category info could go here */}
                      <span className="text-xs text-neutral-500">
                        {venue.services && venue.services.length > 0
                          ? `${venue.services.length} service${venue.services.length !== 1 ? 's' : ''}`
                          : 'Services available'
                        }
                      </span>

                      {/* Phone or contact indicator */}
                      {venue.phone && (
                        <span className="text-xs text-neutral-500">
                          {venue.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-500">No salons available at this time.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta.total > 12 && (
        <div className="flex items-center justify-center gap-4 pt-8 border-t border-neutral-100">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={handlePrevPage}
            disabled={meta.current_page <= 1 || isLoading}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-sm text-neutral-600 font-medium">
            Page {meta.current_page} of {meta.last_page}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={handleNextPage}
            disabled={meta.current_page >= meta.last_page || isLoading}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-40 pointer-events-none">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-950 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
