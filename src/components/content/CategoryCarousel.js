'use client';
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ImageOverlayCard } from '@/components/content/Card';

/**
 * CategoryCarousel - Horizontal scrolling carousel for categories
 * Responsive: 2 items visible on mobile, 6 items visible on desktop
 */
export default function CategoryCarousel({
  title = 'Categories',
  categories = [],
  onCategoryClick = null,
  onNavigate = null,
}) {
  const scrollRef = useRef(null);
  const [isMobile, setIsMobile] = useState(true);

  // Handle responsive breakpoint
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
    if (onNavigate) {
      onNavigate(direction);
    }
  };

  return (
    <div>
      {/* Header with Title and Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-black flex-1">
          {title}
        </h2>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        className={`flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-4 ${
          isMobile ? 'snap-x' : ''
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div
              key={cat.name}
              className="flex-shrink-0 rounded-lg overflow-hidden"
              style={{
                height: '200px',
                aspectRatio: '253 / 300',
              }}
            >
              <ImageOverlayCard
                image={cat.image}
                title={cat.name}
                overlayColor="from-black/60 via-black/10 to-transparent"
                onClick={() => onCategoryClick?.(cat)}
                className="cursor-pointer transition-transform hover:scale-105 h-full"
              />
            </div>
          ))
        ) : (
          <div className="w-full text-center py-8 text-accent">
            No categories to display
          </div>
        )}
      </div>

      {/* Hide scrollbar for all browsers */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}


