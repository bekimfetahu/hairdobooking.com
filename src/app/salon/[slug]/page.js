"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import PageShell from "@/components/layouts/PageShell";
import { fetchSalonBySlug } from "@/services/salon/salonService";
import SalonDatePicker from "@/components/SalonDatePicker";
import StepSection from "@/components/StepSection";

export default function SalonPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [salon, setSalon] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      return new Date().toISOString().slice(0, 10);
    } catch (e) {
      return null;
    }
  });
  const [selectedServiceUuid, setSelectedServiceUuid] = useState(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const [isServiceSectionOpen, setIsServiceSectionOpen] = useState(true);
  const [isProfessionalSectionOpen, setIsProfessionalSectionOpen] = useState(false);
  const [virtualIndex, setVirtualIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const trackRef = useRef(null);
  const slideRefs = useRef([]);
  const [offsets, setOffsets] = useState([]);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchSalonBySlug(slug);
        if (!cancelled) {
          setSalon(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load salon");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const venueName = salon?.venue?.name || "Salon";
  const venueAddress = salon?.venue?.address?.formatted || "";
  const images = salon?.images || [];
  const n = images.length;
  const unavailableDates = salon?.availability?.unavailable_dates || [];
  const services = Array.isArray(salon?.services) ? salon.services : [];

  const categoryOptions = useMemo(() => {
    const seen = new Map();
    for (const s of services) {
      if (s.category && s.category.uuid && s.category.name && !seen.has(s.category.uuid)) {
        seen.set(s.category.uuid, s.category.name);
      }
    }
    return Array.from(seen.entries()).map(([uuid, name]) => ({ uuid, name }));
  }, [services]);

  const audienceOptions = useMemo(() => {
    const seen = new Map();
    for (const s of services) {
      if (s.audience && s.audience.uuid && s.audience.name && !seen.has(s.audience.uuid)) {
        seen.set(s.audience.uuid, s.audience.name);
      }
    }
    return Array.from(seen.entries()).map(([uuid, name]) => ({ uuid, name }));
  }, [services]);

  const [selectedCategoryUuid, setSelectedCategoryUuid] = useState("");
  const [selectedAudienceUuid, setSelectedAudienceUuid] = useState("");

  const filteredServices = useMemo(() => {
    if (!services.length) return [];
    const q = serviceSearch.trim().toLowerCase();

    return services.filter((service) => {
      const name = service.display_name || service.service_name || service.name || "";
      const matchesSearch = !q || name.toLowerCase().includes(q);

      const matchesCategory =
        !selectedCategoryUuid || service.category?.uuid === selectedCategoryUuid;

      const matchesAudience =
        !selectedAudienceUuid || service.audience?.uuid === selectedAudienceUuid;

      return matchesSearch && matchesCategory && matchesAudience;
    });
  }, [services, serviceSearch, selectedCategoryUuid, selectedAudienceUuid]);

  const selectedService = useMemo(
    () => services.find((s) => s.uuid === selectedServiceUuid) || null,
    [services, selectedServiceUuid]
  );

  const extendedImages = n ? [...images, ...images, ...images] : [];

  const getImageUrl = (image) => {
    if (!image?.path) return "";
    return `${process.env.NEXT_PUBLIC_LARAVEL_URL}/storage/${image.path}`;
  };

  // compute offsets of each slide relative to track
  const computeOffsets = () => {
    const track = trackRef.current;
    if (!track) return;
    const offs = slideRefs.current.map((el) => (el ? el.offsetLeft : 0));
    setOffsets(offs);
  };

  useEffect(() => {
    if (!n) return;
    // start from the middle copy
    setVirtualIndex(n);
  }, [n]);

  useEffect(() => {
    computeOffsets();
    const onResize = () => computeOffsets();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [n]);

  useEffect(() => {
    const imgs = slideRefs.current.map((el) => (el ? el.querySelector("img") : null));
    let loaded = 0;
    if (!imgs.length) {
      computeOffsets();
      return;
    }
    imgs.forEach((img) => {
      if (!img) return;
      if (img.complete) {
        loaded += 1;
        if (loaded === imgs.length) computeOffsets();
      } else {
        img.addEventListener(
          "load",
          () => {
            loaded += 1;
            if (loaded === imgs.length) computeOffsets();
          },
          { once: true }
        );
      }
    });
  }, [n]);

  const handlePrevImage = () => {
    if (!n) return;
    setVirtualIndex((v) => v - 1);
  };

  const handleNextImage = () => {
    if (!n) return;
    setVirtualIndex((v) => v + 1);
  };

  const getTransform = () => {
    if (!offsets.length) return "translateX(0px)";
    const x = offsets[virtualIndex] || 0;
    return `translateX(${-x}px)`;
  };

  useEffect(() => {
    if (!n) return;

    // if virtualIndex goes beyond the second copy, reset to middle copy silently
    if (virtualIndex <= n - 1) {
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        const snapped = n + (virtualIndex % n);
        setVirtualIndex(snapped);
        setTimeout(() => setTransitionEnabled(true), 40);
      }, 510);
      return () => clearTimeout(timer);
    }

    if (virtualIndex >= 2 * n) {
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        const snapped = n + (virtualIndex % n);
        setVirtualIndex(snapped);
        setTimeout(() => setTransitionEnabled(true), 40);
      }, 510);
      return () => clearTimeout(timer);
    }
  }, [virtualIndex, n]);

  // Keyboard navigation: left/right arrows
  useEffect(() => {
    if (!n) return;

    const onKey = (e) => {
      if (e.key === "ArrowRight") {
        setVirtualIndex((v) => v + 1);
      }
      if (e.key === "ArrowLeft") {
        setVirtualIndex((v) => v - 1);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n]);

  return (
    <PageShell
      variant="dashboard"
      eyebrow="Your salon"
      title={venueName}
      description={venueAddress}
      contentClassName="mt-6"
    >
      {loading && (
        <div className="rounded-3xl border border-black/10 bg-white p-6 text-sm text-neutral-600">
          Loading salon...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Gallery slider: images only with navigation, peek next slide */}
          <section className="relative">
            {images.length === 0 && (
              <p className="mt-2 text-sm text-neutral-500">
                This salon has not added any gallery images yet.
              </p>
            )}

            {images.length > 0 && (
              <div className="relative w-full overflow-hidden">
                <div
                  ref={trackRef}
                  className="flex will-change-transform"
                  style={{
                    transform: getTransform(),
                    transition: transitionEnabled ? "transform 500ms ease-in-out" : "none",
                  }}
                >
                  {extendedImages.map((image, index) => (
                    <div
                      key={`${image.uuid || image.path || 'slide'}-${index}`}
                      ref={(el) => (slideRefs.current[index] = el)}
                      className="flex h-[380px] w-[70%] flex-shrink-0 items-center justify-start"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(image)}
                        alt={image.caption || venueName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {images.length > 1 && (
                  <div className="pointer-events-none absolute inset-y-0 flex w-full items-center justify-between px-4">
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="pointer-events-auto inline-flex items-center justify-center rounded-md border border-black/10 bg-white/70 px-3 py-2 text-xs font-medium text-neutral-800 shadow-sm hover:bg-white"
                    >
                      &#10094;
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="pointer-events-auto inline-flex items-center justify-center rounded-md border border-black/10 bg-white/70 px-3 py-2 text-xs font-medium text-neutral-800 shadow-sm hover:bg-white"
                    >
                      &#10095;
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Booking layout */}
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
            {/* Left column: date + summary */}
            <div className="space-y-4 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Date
                </label>
                <div className="mt-2">
                  <SalonDatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    unavailableDates={unavailableDates}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-black/15 bg-neutral-50 p-4 text-sm text-neutral-600">
                <p className="font-semibold text-neutral-900">Your selection</p>

                {!selectedService && (
                  <p className="mt-1 text-xs text-neutral-500">
                    Choose a date and a service to start your booking.
                  </p>
                )}

                {selectedService && (
                  <div className="mt-2 space-y-2 text-xs text-neutral-700">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                        Date
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-900">{selectedDate}</p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                        Service
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-900">
                        {selectedService.display_name || selectedService.service_name || selectedService.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-neutral-500">
                        {selectedService.duration || selectedService.display_duration || `${selectedService.duration} min`}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                        From price
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-neutral-900">
                        {selectedService.currency?.symbol && `${selectedService.currency.symbol}`}
                        {typeof selectedService.price === "number"
                          ? selectedService.price.toFixed(2)
                          : selectedService.price}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column: booking steps */}
            <div className="space-y-4">
              {/* Step 1: Select a service (collapsible) */}
              <StepSection
                stepNumber={1}
                title="Select a service"
                isOpen={isServiceSectionOpen}
                headerSummary={
                  selectedService && !isServiceSectionOpen ? (
                    <>
                      <p className="truncate text-xs font-medium text-neutral-900">
                        {selectedService.display_name || selectedService.service_name || selectedService.name}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-[11px] text-neutral-500">
                          {selectedService.duration ||
                            selectedService.display_duration ||
                            `${selectedService.duration} min`}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-900">
                          <span className="text-[11px] font-normal text-neutral-500">from</span>
                          <span>
                            {selectedService.currency?.symbol && `${selectedService.currency.symbol}`}
                            {typeof selectedService.price === "number"
                              ? selectedService.price.toFixed(2)
                              : selectedService.price}
                          </span>
                        </span>
                      </div>
                    </>
                  ) : !selectedService && !services.length ? (
                    <p className="text-xs text-neutral-500">This salon has not added any services yet.</p>
                  ) : null
                }
                headerRight={
                  selectedService && !isServiceSectionOpen ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsServiceSectionOpen(true);
                        setIsProfessionalSectionOpen(false);
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-900 shadow-sm hover:border-black/30 hover:bg-neutral-50"
                    >
                      Change
                    </button>
                  ) : null
                }
              >
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Search services by name"
                    className="h-8 flex-1 min-w-[160px] rounded-md border border-black/10 bg-white px-3 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-black/40 focus:outline-none focus:ring-0"
                  />

                  {categoryOptions.length > 0 && (
                    <select
                      value={selectedCategoryUuid}
                      onChange={(e) => setSelectedCategoryUuid(e.target.value)}
                      className="h-8 rounded-md border border-black/10 bg-white px-2 text-xs text-neutral-800 focus:border-black/40 focus:outline-none focus:ring-0"
                    >
                      <option value="">All categories</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat.uuid} value={cat.uuid}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {audienceOptions.length > 0 && (
                    <select
                      value={selectedAudienceUuid}
                      onChange={(e) => setSelectedAudienceUuid(e.target.value)}
                      className="h-8 rounded-md border border-black/10 bg-white px-2 text-xs text-neutral-800 focus:border-black/40 focus:outline-none focus:ring-0"
                    >
                      <option value="">All audiences</option>
                      {audienceOptions.map((aud) => (
                        <option key={aud.uuid} value={aud.uuid}>
                          {aud.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {services.length > 0 && filteredServices.length === 0 && (
                  <p className="mt-3 text-xs text-neutral-500">No services match your search.</p>
                )}

                {filteredServices.length > 0 && (
                  <div className="mt-3 max-h-80 space-y-1 overflow-y-auto pt-1">
                    {filteredServices.map((service) => {
                      const isSelected = service.uuid === selectedServiceUuid;
                      const name = service.display_name || service.service_name || service.name;
                      const durationLabel =
                        service.duration ||
                        service.display_duration ||
                        (service.duration ? `${service.duration} min` : null);
                      const priceLabel =
                        typeof service.price === "number" ? service.price.toFixed(2) : service.price;
                      const currencySymbol = service.currency?.symbol || "";

                      return (
                        <div
                          key={service.uuid}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors ${
                            isSelected
                              ? "border-primary/60 bg-primary/5"
                              : "border-black/5 bg-white hover:border-black/15 hover:bg-neutral-50"
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="truncate text-xs font-medium text-neutral-900">{name}</p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-neutral-500">
                              {durationLabel && <span>{durationLabel}</span>}
                              <span className="inline-flex items-center gap-1 font-semibold text-neutral-900">
                                <span className="text-[11px] font-normal text-neutral-500">from</span>
                                <span>
                                  {currencySymbol && `${currencySymbol}`}
                                  {priceLabel}
                                </span>
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedServiceUuid(service.uuid);
                              setIsServiceSectionOpen(false);
                              setIsProfessionalSectionOpen(true);
                              // TODO: trigger fetch of professionals for this service and date
                            }}
                            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                              isSelected
                                ? "border border-primary/60 bg-primary/5 text-neutral-900 shadow-sm"
                                : "border border-black/15 bg-white text-neutral-900 hover:border-black/30 hover:bg-neutral-50"
                            }`}
                          >
                            {isSelected ? "Selected" : "Select"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </StepSection>

              {/* Step 2: Choose a professional (collapsible, placeholder for now) */}
              <StepSection
                stepNumber={2}
                title="Choose a professional"
                isOpen={!!selectedService && isProfessionalSectionOpen}
                headerSummary={
                  !selectedService ? (
                    <p className="text-xs text-neutral-600">
                      First select a service to see available professionals.
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-600">
                      Professionals for: {selectedService.display_name || selectedService.service_name || selectedService.name}
                    </p>
                  )
                }
                headerRight={
                  selectedService ? (
                    <button
                      type="button"
                      onClick={() => setIsProfessionalSectionOpen((open) => !open)}
                      className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-900 shadow-sm hover:border-black/30 hover:bg-neutral-50"
                    >
                      {isProfessionalSectionOpen ? "Hide" : "Show"}
                    </button>
                  ) : null
                }
              >
                {selectedService && (
                  <div className="rounded-lg border border-dashed border-black/15 bg-neutral-50 p-3 text-xs text-neutral-600">
                    Placeholder: professionals offering this service on the selected date will be listed here.
                  </div>
                )}
              </StepSection>

              <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Step 3
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-950">Pick a time</p>
                <p className="mt-2 text-sm text-neutral-600">
                  Morning, midday and afternoon time slots will be shown here as buttons.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </PageShell>
  );
}
