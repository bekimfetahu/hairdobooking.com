"use client";

export default function SalonHeader({ salon }) {
  const venueName = salon?.venue?.name || "Salon";
  const venueAddress = salon?.venue?.address?.formatted || "";

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

      {/* Right column removed: gallery thumbnail is no longer shown on scroll */}
    </div>
  );
}
