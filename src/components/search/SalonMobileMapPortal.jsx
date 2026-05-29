"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SalonMobileMapPortal({
  showMobileMap,
  setShowMobileMap,
  selectedLocation,
  distance,
  router,
  mapsReady,
  VenueMap,
}) {
  const [portalEl, setPortalEl] = React.useState(null);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const el = document.createElement('div');
    el.setAttribute('id', 'salon-mobile-map-portal');
    document.body.appendChild(el);
    setPortalEl(el);
    return () => {
      try { document.body.removeChild(el); } catch (e) {}
    };
  }, []);

  if (!portalEl) return null;

  return createPortal(
    <>
      {showMobileMap && (
        <div className="fixed inset-0 md:hidden z-40" onClick={() => setShowMobileMap(false)}>
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      <div className={cn(
        "fixed left-0 right-0 md:hidden transition-all duration-300 bg-white flex flex-col overflow-hidden shadow-lg",
        showMobileMap ? "bottom-16 h-3/4 z-50" : "bottom-16 h-0 z-0"
      )}>
        {showMobileMap ? (
          <div className="flex-1 overflow-hidden relative">
            {(mapsReady || (typeof window !== 'undefined' && window?.google?.maps)) ? (
              <VenueMap selectedLocation={selectedLocation} searchDistance={distance} router={router} mapsReady={mapsReady} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">Loading map...</div>
            )}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setShowMobileMap(!showMobileMap)}
        className="fixed bottom-0 left-0 right-0 md:hidden w-full px-4 py-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-semibold flex items-center justify-center gap-2 transition-colors z-50 border-t border-gray-200"
      >
        <MapPin className="w-5 h-5" />
        {showMobileMap ? "Hide Map" : "Show Map"}
      </button>
    </>,
    portalEl
  );
}
