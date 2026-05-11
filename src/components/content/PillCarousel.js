'use client';

import React, { useRef } from 'react';

/**
 * PillCarousel Component
 * Lightweight horizontal scrolling carousel for button pills
 * Perfect for featured services, tags, or thin UI elements
 */
export default function PillCarousel({
  title = 'Explore',
  pills = [],
  activePillId = null,
  onPillClick = () => {},
}) {
  const scrollContainerRef = useRef(null);

  return (
    <div className="w-full">
      {/* Title */}
      {title && (
        <h3 className="text-lg md:text-xl font-semibold text-brand-black mb-3">
          {title}
        </h3>
      )}

      {/* Pills Container - Simple horizontal scroll */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-visible scroll-smooth flex gap-2 -mx-6 px-6 py-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {pills.map((pill, index) => {
          const isActive = activePillId && (pill.id === activePillId || pill.name === activePillId);
          return (
            <button
              key={pill.id || index}
              onClick={() => onPillClick(pill)}
              className={`flex-shrink-0 cursor-pointer inline-flex items-center justify-center rounded-full font-normal gap-1 transition ease-in-out duration-150 text-xs px-3 py-1 whitespace-nowrap border outline-none ${
                isActive
                  ? 'bg-black text-white border-black hover:bg-gray-800'
                  : 'bg-gray-100 text-black border-gray-200 hover:bg-gray-150 active:bg-gray-175'
              }`}
            >
              {pill.icon && <span className="text-base">{pill.icon}</span>}
              {pill.name || pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
