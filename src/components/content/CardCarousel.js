'use client';
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * CardCarousel - Lovable Design Pattern
 * Horizontal scrolling carousel with smooth navigation
 * 
 * Usage:
 * <CardCarousel
 *   title="Popular Salons"
 *   cards={salonData}
 *   cardWidth={280}
 *   onCardClick={handleClick}
 *   renderCard={customCardRenderer}
 * />
 */
export default function CardCarousel({
  title = 'Featured Items',
  cards = [],
  cardWidth = 280,
  cardHeight = 'auto',
  showRating = true,
  onCardClick = null,
  onNavigate = null,
  renderCard = null,
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
    if (onNavigate) {
      onNavigate(direction);
    }
  };

  // Default card renderer
  const defaultRenderCard = (card, idx) => (
    <button
      key={card.id || idx}
      onClick={() => onCardClick?.(card)}
      className="flex-shrink-0 group text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E62E2E] rounded-2xl"
    >
      {/* Card Image Container */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 mb-3">
        <div
          className="bg-gray-200 aspect-video overflow-hidden"
          style={{ width: cardWidth }}
        >
          {card.image ? (
            <img
              src={card.image}
              alt={card.name || card.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Rating Badge */}
        {showRating && card.rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium shadow-sm">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {card.rating}
          </div>
        )}
      </div>

      {/* Card Content */}
      <h3 className="font-semibold text-sm truncate text-gray-900">
        {card.name || card.title}
      </h3>
      {card.subtitle && (
        <p className="text-xs text-gray-500 truncate mt-0.5">{card.subtitle}</p>
      )}
      {card.description && (
        <p className="text-xs text-gray-600 truncate mt-1 line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Additional info */}
      {card.badge && (
        <div className="mt-2 inline-block">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            {card.badge}
          </span>
        </div>
      )}
    </button>
  );

  const cardRenderer = renderCard || defaultRenderCard;

  return (
    <div>
      {/* Header with Title and Navigation */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 flex-1">
          {title}
        </h2>
        <div className="flex gap-2 flex-shrink-0 pt-0.5">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-9 w-9"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-9 w-9"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        className="flex items-start gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-2 -mx-6 px-6"
        style={{ scrollbarWidth: 'none' }}
      >
        {cards.length > 0 ? (
          cards.map((card, idx) => cardRenderer(card, idx))
        ) : (
          <div className="w-full text-center py-8 text-gray-500">
            No items to display
          </div>
        )}
      </div>
    </div>
  );
}
