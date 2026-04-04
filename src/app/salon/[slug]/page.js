"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import PageShell from "@/components/layouts/PageShell";
import { fetchSalonBySlug, fetchSalonProfessionals, fetchSalonTimeSlots, createSalonAppointment } from "@/services/salon/salonService";
import SalonDatePicker from "@/components/SalonDatePicker";
import StepSection from "@/components/StepSection";
import ImageSlider from "@/components/ui/ImageSlider";
import Select from "react-select";
import { useSelector, useDispatch } from "react-redux";
import {
  initBooking,
  selectBooking,
  setSelectedDate as setDate,
  setSelectedServiceUuid as setService,
  setSelectedCategoryUuid as setCategory,
  setSelectedAudienceUuid as setAudience,
  setSelectedProfessionalUuid as setProfessional,
  setSelectedTime as setTime,
  setSelectedComments as setComments,
  setServiceSearch as setSearch,
  setIsServiceSectionOpen as setServiceOpen,
  setIsProfessionalSectionOpen as setProfessionalOpen,
  setIsTimeSectionOpen as setTimeOpen,
  setIsCommentsSectionOpen as setCommentsOpen,
} from "@/store/slices/bookingSlice";

const TIME_GROUPS = [
  { key: "morning", label: "Morning", start: 0, end: 719 },
  { key: "midday", label: "Midday", start: 720, end: 899 },
  { key: "afternoon", label: "Afternoon", start: 900, end: 1439 },
];

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map((value) => Number.parseInt(value, 10));
  return hours * 60 + minutes;
}

function groupTimeSlots(slots) {
  const grouped = {
    morning: [],
    midday: [],
    afternoon: [],
  };

  for (const slot of Array.isArray(slots) ? slots : []) {
    const label = typeof slot === "string" ? slot : slot?.label;
    const value = typeof slot === "string" ? slot : slot?.value;

    if (typeof label !== "string" || !label.includes(":") || typeof value !== "string") {
      continue;
    }

    const minutes = timeToMinutes(label);
    const group = TIME_GROUPS.find((item) => minutes >= item.start && minutes <= item.end);
    if (group && grouped[group.key]) {
      grouped[group.key].push({ label, value });
    }
  }

  return grouped;
}

export default function SalonPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const booking = useSelector(selectBooking(slug));
  const {
    selectedDate,
    selectedServiceUuid,
    selectedCategoryUuid,
    selectedAudienceUuid,
    selectedProfessionalUuid,
    selectedTime,
    selectedComments,
    serviceSearch,
    isServiceSectionOpen,
    isProfessionalSectionOpen,
    isTimeSectionOpen,
    isCommentsSectionOpen,
  } = booking;

  // Initialize booking state for this slug on first render
  useEffect(() => {
    if (slug) dispatch(initBooking({ slug }));
  }, [slug, dispatch]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [salon, setSalon] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [professionalsLoading, setProfessionalsLoading] = useState(false);
  const [professionalsError, setProfessionalsError] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const [timeSlotsError, setTimeSlotsError] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

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
    [services, selectedServiceUuid],
  );

  const selectedProfessional = useMemo(
    () => professionals.find((professional) => professional.uuid === selectedProfessionalUuid) || null,
    [professionals, selectedProfessionalUuid],
  );

  const selectedTimeSlot = useMemo(
    () => timeSlots.find((slot) => (slot?.value ?? slot) === selectedTime) || null,
    [timeSlots, selectedTime],
  );

  const groupedTimeSlots = useMemo(() => groupTimeSlots(timeSlots), [timeSlots]);

  useEffect(() => {
    if (!slug || !selectedDate || !selectedServiceUuid) {
      setProfessionals([]);
      setProfessionalsError("");
      setProfessionalsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfessionals() {
      setProfessionalsLoading(true);
      setProfessionalsError("");

      try {
        const data = await fetchSalonProfessionals(slug, {
          date: selectedDate,
          service_uuid: selectedServiceUuid,
        });

        if (!cancelled) {
          setProfessionals(Array.isArray(data.professionals) ? data.professionals : []);
        }
      } catch (err) {
        if (!cancelled) {
          setProfessionals([]);
          setProfessionalsError(err?.message || "Failed to load professionals");
        }
      } finally {
        if (!cancelled) {
          setProfessionalsLoading(false);
        }
      }
    }

    loadProfessionals();

    return () => {
      cancelled = true;
    };
  }, [slug, selectedDate, selectedServiceUuid]);

  useEffect(() => {
    if (!slug || !selectedDate || !selectedServiceUuid || !selectedProfessionalUuid) {
      setTimeSlots([]);
      setTimeSlotsError("");
      setTimeSlotsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadTimeSlots() {
      setTimeSlotsLoading(true);
      setTimeSlotsError("");

      try {
        const data = await fetchSalonTimeSlots(slug, {
          date: selectedDate,
          service_uuid: selectedServiceUuid,
          employee_uuid: selectedProfessionalUuid,
        });

        if (!cancelled) {
          setTimeSlots(Array.isArray(data.slots) ? data.slots : []);
        }
      } catch (err) {
        if (!cancelled) {
          setTimeSlots([]);
          setTimeSlotsError(err?.message || "Failed to load time slots");
        }
      } finally {
        if (!cancelled) {
          setTimeSlotsLoading(false);
        }
      }
    }

    loadTimeSlots();

    return () => {
      cancelled = true;
    };
  }, [slug, selectedDate, selectedServiceUuid, selectedProfessionalUuid]);

  async function handleBookNow() {
    if (!selectedServiceUuid || !selectedProfessionalUuid || !selectedTime || !selectedDate) {
      return;
    }

    setBookingSubmitting(true);
    setBookingError("");
    setBookingSuccess("");

    try {
      const response = await createSalonAppointment(slug, {
        from_time: selectedTime,
        service_uuid: selectedServiceUuid,
        employee_uuid: selectedProfessionalUuid,
        comments: selectedComments,
      });

      setBookingSuccess(response?.message || "Appointment created successfully.");
      dispatch(setCommentsOpen({ slug, open: false }));
    } catch (error) {
      setBookingError(error?.message || "Failed to create appointment");
    } finally {
      setBookingSubmitting(false);
    }
  }


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
          {/* Gallery slider */}
          <section className="relative">
            {images.length === 0 && (
              <p className="mt-2 text-sm text-neutral-500">
                This salon has not added any gallery images yet.
              </p>
            )}

            {images.length > 0 && (
              <ImageSlider
                slides={images.map((img) => ({
                  src: img.path ? `${process.env.NEXT_PUBLIC_LARAVEL_URL}/storage/${img.path}` : "",
                  label: img.caption || "",
                }))}
                sliderHeight={300}
                sliderHeightMobile={180}
                fullBleed
                showLabel={false}
                showDots
              />
            )}
          </section>

          {/* Booking layout */}
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
            {/* Left column: date + summary */}
            <div className="space-y-4">
              <StepSection stepNumber={1} title="Select Date" isOpen>
                <SalonDatePicker
                  value={selectedDate}
                  onChange={(val) => {
                    dispatch(setDate({ slug, date: val }));
                    dispatch(setProfessional({ slug, uuid: null }));
                    dispatch(setTime({ slug, time: null }));
                    dispatch(setComments({ slug, comments: "" }));
                    dispatch(setTimeOpen({ slug, open: false }));
                    dispatch(setCommentsOpen({ slug, open: false }));
                    if (selectedServiceUuid) {
                      dispatch(setProfessionalOpen({ slug, open: true }));
                    }
                  }}
                  unavailableDates={unavailableDates}
                />
              </StepSection>

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

                    {selectedProfessional && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                          Professional
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-900">
                          {selectedProfessional.full_name}
                        </p>
                      </div>
                    )}

                    {selectedTime && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                          Time
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-900">
                          {selectedTimeSlot?.label || selectedTime}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right column: booking steps */}
            <div className="space-y-4">
              {/* Step 1: Select a service (collapsible) */}
              <StepSection
                stepNumber={1}
                title={selectedService && !isServiceSectionOpen ? "Service" : "Select Service"}
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
                        dispatch(setServiceOpen({ slug, open: true }));
                        dispatch(setProfessionalOpen({ slug, open: false }));
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
                    onChange={(e) => dispatch(setSearch({ slug, query: e.target.value }))}
                    placeholder="Search services by name"
                    className="h-[38px] flex-1 min-w-[160px] rounded-md border border-black/10 bg-white px-3 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-black/40 focus:outline-none focus:ring-0"
                  />

                  {categoryOptions.length > 0 && (
                    <div className="ml-2 min-w-[160px]">
                      <Select
                        options={categoryOptions.map((c) => ({ value: c.uuid, label: c.name }))}
                        value={
                          selectedCategoryUuid
                            ? { value: selectedCategoryUuid, label: categoryOptions.find((c) => c.uuid === selectedCategoryUuid)?.name }
                            : null
                        }
                        onChange={(opt) => dispatch(setCategory({ slug, uuid: opt ? opt.value : "" }))}
                        isClearable
                        placeholder="All categories"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({ ...base, minHeight: 32, fontSize: 12 }),
                          placeholder: (base) => ({ ...base, fontSize: 12 }),
                          option: (base) => ({ ...base, fontSize: 12 }),
                        }}
                      />
                    </div>
                  )}

                  {audienceOptions.length > 0 && (
                    <div className="ml-2 min-w-[160px]">
                      <Select
                        options={audienceOptions.map((a) => ({ value: a.uuid, label: a.name }))}
                        value={
                          selectedAudienceUuid
                            ? { value: selectedAudienceUuid, label: audienceOptions.find((a) => a.uuid === selectedAudienceUuid)?.name }
                            : null
                        }
                        onChange={(opt) => dispatch(setAudience({ slug, uuid: opt ? opt.value : "" }))}
                        isClearable
                        placeholder="All audiences"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({ ...base, minHeight: 32, fontSize: 12 }),
                          placeholder: (base) => ({ ...base, fontSize: 12 }),
                          option: (base) => ({ ...base, fontSize: 12 }),
                        }}
                      />
                    </div>
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
                              dispatch(setService({ slug, uuid: service.uuid }));
                              dispatch(setProfessional({ slug, uuid: null }));
                              dispatch(setTime({ slug, time: null }));
                              dispatch(setComments({ slug, comments: "" }));
                              dispatch(setServiceOpen({ slug, open: false }));
                              dispatch(setProfessionalOpen({ slug, open: true }));
                              dispatch(setTimeOpen({ slug, open: false }));
                              dispatch(setCommentsOpen({ slug, open: false }));
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
                title={selectedProfessional && !isProfessionalSectionOpen ? "Professional" : "Choose Professional"}
                isOpen={!!selectedService && isProfessionalSectionOpen}
                headerSummary={
                  !selectedService ? (
                    <p className="text-xs text-neutral-600">
                      First select a service to see available professionals.
                    </p>
                  ) : selectedProfessional ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-[10px] font-semibold text-neutral-700">
                        {selectedProfessional.avatar ? (
                          <img
                            src={selectedProfessional.avatar}
                            alt={selectedProfessional.full_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{(selectedProfessional.full_name || "P").slice(0, 1)}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-neutral-900">{selectedProfessional.full_name}</p>
                        {selectedProfessional.position && (
                          <p className="truncate text-[11px] text-neutral-500">{selectedProfessional.position}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-600">
                      Choose the professional who will handle this service.
                    </p>
                  )
                }
                headerRight={
                  selectedService ? (
                    <button
                      type="button"
                      onClick={() => dispatch(setProfessionalOpen({ slug, open: !isProfessionalSectionOpen }))}
                      className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-900 shadow-sm hover:border-black/30 hover:bg-neutral-50"
                    >
                      {selectedProfessional && !isProfessionalSectionOpen ? "Change" : isProfessionalSectionOpen ? "Hide" : "Show"}
                    </button>
                  ) : null
                }
              >
                {selectedService && (
                  <div className="space-y-3">
                    {professionalsLoading && (
                      <div className="rounded-lg border border-dashed border-black/15 bg-neutral-50 p-3 text-xs text-neutral-600">
                        Loading professionals...
                      </div>
                    )}

                    {professionalsError && !professionalsLoading && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        {professionalsError}
                      </div>
                    )}

                    {!professionalsLoading && !professionalsError && professionals.length === 0 && (
                      <div className="rounded-lg border border-dashed border-black/15 bg-neutral-50 p-3 text-xs text-neutral-600">
                        No professionals are available for this service on the selected date.
                      </div>
                    )}

                    {!professionalsLoading && !professionalsError && professionals.length > 0 && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {professionals.map((professional) => {
                          const isSelectedProfessional = professional.uuid === selectedProfessionalUuid;

                          return (
                            <button
                              key={professional.uuid}
                              type="button"
                              onClick={() => {
                                dispatch(setProfessional({ slug, uuid: professional.uuid }));
                                dispatch(setProfessionalOpen({ slug, open: false }));
                                dispatch(setTime({ slug, time: null }));
                                dispatch(setTimeOpen({ slug, open: true }));
                                dispatch(setComments({ slug, comments: "" }));
                                dispatch(setCommentsOpen({ slug, open: false }));
                              }}
                              className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                                isSelectedProfessional
                                  ? "border-primary/60 bg-primary/5"
                                  : "border-black/10 bg-white hover:border-black/20 hover:bg-neutral-50"
                              }`}
                            >
                              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700">
                                {professional.avatar ? (
                                  <img
                                    src={professional.avatar}
                                    alt={professional.full_name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span>{(professional.full_name || "P").slice(0, 1)}</span>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-neutral-950">
                                  {professional.full_name}
                                </p>
                                {professional.position && (
                                  <p className="truncate text-xs text-neutral-500">{professional.position}</p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </StepSection>

              <StepSection
                stepNumber={4}
                title={selectedTime && !isTimeSectionOpen ? "Time" : "Choose Time"}
                isOpen={!!selectedProfessional && isTimeSectionOpen}
                headerSummary={
                  !selectedProfessional ? (
                    <p className="text-xs text-neutral-600">
                      First choose a professional to see available booking times.
                    </p>
                  ) : selectedTime ? (
                    <p className="text-xs font-medium text-neutral-900">
                      {selectedTimeSlot?.label || selectedTime}
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-600">Choose the time that works best for you.</p>
                  )
                }
                headerRight={
                  selectedProfessional ? (
                    <button
                      type="button"
                      onClick={() => dispatch(setTimeOpen({ slug, open: !isTimeSectionOpen }))}
                      className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-900 shadow-sm hover:border-black/30 hover:bg-neutral-50"
                    >
                      {selectedTime && !isTimeSectionOpen ? "Change" : isTimeSectionOpen ? "Hide" : "Show"}
                    </button>
                  ) : null
                }
              >
                {selectedProfessional && (
                  <div className="space-y-3">
                    {timeSlotsLoading && (
                      <div className="rounded-lg border border-dashed border-black/15 bg-neutral-50 p-3 text-xs text-neutral-600">
                        Loading time slots...
                      </div>
                    )}

                    {timeSlotsError && !timeSlotsLoading && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        {timeSlotsError}
                      </div>
                    )}

                    {!timeSlotsLoading && !timeSlotsError && timeSlots.length === 0 && (
                      <div className="rounded-lg border border-dashed border-black/15 bg-neutral-50 p-3 text-xs text-neutral-600">
                        No available times for the selected professional and service.
                      </div>
                    )}

                    {!timeSlotsLoading && !timeSlotsError && timeSlots.length > 0 && (
                      <div className="grid gap-4 lg:grid-cols-3">
                        {TIME_GROUPS.map((group) => {
                          const slotsForGroup = groupedTimeSlots[group.key] || [];

                          return (
                            <div key={group.key} className="rounded-xl border border-black/10 bg-neutral-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700">
                                {group.label}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {slotsForGroup.length > 0 ? (
                                  slotsForGroup.map((slot) => {
                                    const isSelectedTime = slot.value === selectedTime;

                                    return (
                                      <button
                                        key={slot.value}
                                        type="button"
                                        onClick={() => {
                                          dispatch(setTime({ slug, time: slot.value }));
                                          dispatch(setTimeOpen({ slug, open: false }));
                                            dispatch(setCommentsOpen({ slug, open: true }));
                                        }}
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                                          isSelectedTime
                                            ? "border-primary/60 bg-primary/5 text-neutral-900 shadow-sm"
                                            : "border-black/15 bg-white text-neutral-900 hover:border-black/30 hover:bg-neutral-50"
                                        }`}
                                      >
                                        {slot.label}
                                      </button>
                                    );
                                  })
                                ) : (
                                  <p className="text-xs text-neutral-500">No slots.</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </StepSection>

              <StepSection
                stepNumber={5}
                title={selectedTime && !isCommentsSectionOpen ? "Comments" : "Add Comments"}
                isOpen={!!selectedTime && isCommentsSectionOpen}
                headerSummary={
                  !selectedTime ? (
                    <p className="text-xs text-neutral-600">
                      Choose a time first to add comments and book.
                    </p>
                  ) : bookingSuccess ? (
                    <p className="text-xs font-medium text-neutral-900">{bookingSuccess}</p>
                  ) : (
                    <p className="text-xs text-neutral-600">Add any notes for the service booking.</p>
                  )
                }
                headerRight={
                  selectedTime ? (
                    <button
                      type="button"
                      onClick={() => dispatch(setCommentsOpen({ slug, open: !isCommentsSectionOpen }))}
                      className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-900 shadow-sm hover:border-black/30 hover:bg-neutral-50"
                    >
                      {isCommentsSectionOpen ? "Hide" : "Show"}
                    </button>
                  ) : null
                }
              >
                {selectedTime && (
                  <div className="space-y-3">
                    <textarea
                      value={selectedComments}
                      onChange={(e) => dispatch(setComments({ slug, comments: e.target.value }))}
                      placeholder="Comments"
                      rows={4}
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-black/30 focus:outline-none focus:ring-0"
                    />

                    {bookingError && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        {bookingError}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleBookNow}
                      disabled={bookingSubmitting}
                      className="inline-flex w-full items-center justify-center rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {bookingSubmitting ? "Booking..." : "Book now"}
                    </button>
                  </div>
                )}
              </StepSection>
            </div>
          </section>
        </div>
      )}
    </PageShell>
  );
}
