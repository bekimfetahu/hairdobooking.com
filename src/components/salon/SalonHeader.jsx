"use client";

import { useSalonSlider } from "@/context/SalonSliderContext";

export default function SalonHeader({ salon }) {
  const { showImageSlider, setShowImageSlider } = useSalonSlider();
  const venueName = salon?.venue?.name || "Salon";
  const venueAddress = salon?.venue?.address?.formatted || "";
  const images = salon?.images || [];

  return (
    <div className="grid gap-6 items-start lg:items-end lg:grid-cols-[1fr_auto]">
      {/* Left column: Salon info - always visible */}
      <div className="flex flex-col gap-2 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          Your salon
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
          {venueName}
        </h1>
        {venueAddress && (
          <p className="text-base leading-8 text-neutral-600 md:text-lg">
            {venueAddress}
          </p>
        )}
      </div>

      {/* Right column: Thumbnail - only shown when slider is hidden (desktop only) */}
      {images.length > 0 && !showImageSlider && (
        <button
          type="button"
          onClick={() => setShowImageSlider(true)}
          className="hidden lg:block group relative h-24 w-32 overflow-hidden rounded-lg flex-shrink-0"
        >
          <img
            src={images[0]?.path ? `${process.env.NEXT_PUBLIC_LARAVEL_URL}/storage/${images[0].path}` : ""}
            alt="Salon thumbnail"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-[10px] font-semibold">
              View
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
