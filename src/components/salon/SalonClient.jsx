"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import dayjs from "dayjs";
import { Calendar, Sparkles, Banknote, User, Clock, ChevronDown, MapPin, Filter, X } from "lucide-react";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/iconMap";
import {
  fetchSalonBySlug,
  fetchSalonProfessionals,
  fetchSalonTimeSlots,
  fetchSalonAvailabilityByDateRange,
  createSalonAppointment,
  validateSalonVoucher,
  fetchAppointmentPaymentStatus,
} from "@/services/salon/salonService";
import SalonDatePicker from "@/components/booking/SalonDatePicker";
import StepSection from "@/components/booking/StepSection";
import StripePaymentContainer from "@/components/booking/StripePaymentContainer";
import ImageSlider from "@/components/ui/ImageSlider";
import BookingAuthModal from "@/components/modals/BookingAuthModal";
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
  setVoucherCode,
  setSelectedVoucher,
  setVoucherError,
  setVoucherValidating,
  setPendingAppointment,
  clearPendingAppointment,
  clearBooking,
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

export default function SalonClient({ slug, initialSalon, initialServiceUuid = null }) {
  const dispatch = useDispatch();
  const booking = useSelector(selectBooking(slug));
  const isAuthenticated = useSelector((state) => !!state.auth.user);
  const {
    selectedDate,
    selectedServiceUuid,
    selectedCategoryUuids,
    selectedAudienceUuids,
    selectedProfessionalUuid,
    selectedTime,
    selectedComments,
    serviceSearch,
    isServiceSectionOpen,
    isProfessionalSectionOpen,
    isTimeSectionOpen,
    voucherCode,
    selectedVoucher,
    voucherError,
    voucherValidating,
  } = booking;

  // Initialize booking state for this slug on first render
  useEffect(() => {
    if (slug) dispatch(initBooking({ slug }));
  }, [slug, dispatch]);

  

  useEffect(() => {
    if (!slug || !initialServiceUuid) return;

    const shouldApplyService = selectedServiceUuid !== initialServiceUuid;
    if (!shouldApplyService) return;

    dispatch(setService({ slug, uuid: initialServiceUuid }));
    dispatch(setProfessional({ slug, uuid: null }));
    dispatch(setTime({ slug, time: null }));
    dispatch(setComments({ slug, comments: "" }));
    dispatch(setServiceOpen({ slug, open: false }));
    dispatch(setProfessionalOpen({ slug, open: false }));
    dispatch(setTimeOpen({ slug, open: false }));
    dispatch(setCommentsOpen({ slug, open: false }));
  }, [slug, initialServiceUuid, selectedServiceUuid, dispatch]);

  // Restore booking state from localStorage if it exists (for auth redirect recovery)
  useEffect(() => {
    if (!slug) return;

    try {
      const savedBookingState = localStorage.getItem(`booking_${slug}`);
      if (savedBookingState) {
        const bookingState = JSON.parse(savedBookingState);
        
        // Restore all booking selections to Redux
        if (bookingState.selectedDate) {
          dispatch(setDate({ slug, date: bookingState.selectedDate }));
        }
        if (bookingState.selectedServiceUuid) {
          dispatch(setService({ slug, uuid: bookingState.selectedServiceUuid }));
          // Keep service section closed to show summary
          dispatch(setServiceOpen({ slug, open: false }));
        }
        if (bookingState.selectedCategoryUuids?.length) {
          bookingState.selectedCategoryUuids.forEach((uuid) => {
            dispatch(setCategory({ slug, uuid }));
          });
        }
        if (bookingState.selectedAudienceUuids?.length) {
          bookingState.selectedAudienceUuids.forEach((uuid) => {
            dispatch(setAudience({ slug, uuid }));
          });
        }
        if (bookingState.selectedProfessionalUuid) {
          dispatch(setProfessional({ slug, uuid: bookingState.selectedProfessionalUuid }));
          // Keep professional section closed to show summary
          dispatch(setProfessionalOpen({ slug, open: false }));
        }
        if (bookingState.selectedTime) {
          dispatch(setTime({ slug, time: bookingState.selectedTime }));
          // Keep time section closed to show summary
          dispatch(setTimeOpen({ slug, open: false }));
        }
        if (bookingState.selectedComments) {
          dispatch(setComments({ slug, comments: bookingState.selectedComments }));
        }
        if (bookingState.serviceSearch) {
          dispatch(setSearch({ slug, query: bookingState.serviceSearch }));
        }
        if (bookingState.selectedVoucher) {
          dispatch(setSelectedVoucher(bookingState.selectedVoucher));
        }
        if (bookingState.voucherCode) {
          dispatch(setVoucherCode(bookingState.voucherCode));
        }

        console.log('✓ Restored booking state for', slug, bookingState);
        setRestorationComplete(true);
      } else {
        // No saved state, restoration is done
        setRestorationComplete(true);
      }
    } catch (err) {
      console.error('Failed to restore booking state from localStorage:', err);
      setRestorationComplete(true);
    }
  }, [slug, dispatch]);

  // Separate voucher persistence - save selected voucher to localStorage whenever it changes
  useEffect(() => {
    if (!slug || !selectedVoucher) return;
    
    try {
      localStorage.setItem(`voucher_${slug}`, JSON.stringify(selectedVoucher));
      console.log('✓ Saved voucher to localStorage for', slug, selectedVoucher);
    } catch (err) {
      console.error('Failed to save voucher to localStorage:', err);
    }
  }, [slug, selectedVoucher]);

  // Restore voucher from localStorage on page load
  useEffect(() => {
    if (!slug) return;

    try {
      const savedVoucher = localStorage.getItem(`voucher_${slug}`);
      if (savedVoucher) {
        const voucher = JSON.parse(savedVoucher);
        dispatch(setSelectedVoucher({ slug, voucher }));
        console.log('✓ Restored voucher from localStorage for', slug, voucher);
      }
    } catch (err) {
      console.error('Failed to restore voucher from localStorage:', err);
    }
  }, [slug, dispatch]);

  const [loading, setLoading] = useState(initialSalon ? false : true);
  const [error, setError] = useState("");
  const [salon, setSalon] = useState(initialSalon || null);
  const [professionals, setProfessionals] = useState([]);
  const [professionalsLoading, setProfessionalsLoading] = useState(false);
  const [professionalsError, setProfessionalsError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const [timeSlotsError, setTimeSlotsError] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [serviceAvailableDates, setServiceAvailableDates] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [expandedServices, setExpandedServices] = useState({});
  const [expandedFilter, setExpandedFilter] = useState(null);
  const searchInputRef = useRef(null);
  const justAuthenticatedRef = useRef(false);
  const [restorationComplete, setRestorationComplete] = useState(false);
  
  // Payment flow state
  const [paymentRequired, setPaymentRequired] = useState(false);

  // NOTE: We intentionally do NOT persist pending appointment/payment intent
  // to localStorage to avoid stale client_secret/payment_intent loops.
  // Pending appointments live in Redux for the lifetime of the page.

  const toggleFilter = useCallback(() => {
    setExpandedFilter(expandedFilter === 'filters' ? null : 'filters');
  }, [expandedFilter]);

  const hasFilters = selectedCategoryUuids?.length > 0 || selectedAudienceUuids?.length > 0;

  const handleCategoryToggle = useCallback(
    (categoryUuid) => {
      ensureCanModify(() => dispatch(setCategory({ slug, uuid: categoryUuid })));
    },
    [slug, dispatch]
  );

  const handleAudienceToggle = useCallback(
    (audienceUuid) => {
      ensureCanModify(() => dispatch(setAudience({ slug, uuid: audienceUuid })));
    },
    [slug, dispatch]
  );

  // Prevent multiple simultaneous decision prompts
  const decisionPendingRef = useRef(false);

  // Ensure modifications are allowed when an active reservation exists.
  const ensureCanModify = useCallback(async (changeCallback) => {
    const reservationUuid = booking?.reservationUuid;
    if (!reservationUuid) {
      changeCallback();
      return;
    }

    // If a decision prompt is already visible, show a short toast and do nothing
    if (decisionPendingRef.current) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Please choose Cancel or Keep your active reservation first',
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    decisionPendingRef.current = true;

    try {
      const result = await Swal.fire({
        title: 'You have an active reservation',
        text: 'You already have an ongoing appointment reservation. Cancel it to make a new selection, or keep it to continue with your current selection?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Cancel Reservation',
        cancelButtonText: 'Keep Reservation',
        focusCancel: true,
        allowOutsideClick: false,
      });

      if (result.isConfirmed) {
        try {
          setBookingSubmitting(true);
          const res = await fetch(`/api/appointments/${reservationUuid}`, { method: 'DELETE' });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            if (res.status === 404) {
              const force = await Swal.fire({
                title: 'Server cancel unavailable',
                text: 'Could not cancel on server. Force-clear local reservation and continue? Server slot may remain reserved.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Force continue',
                cancelButtonText: 'Go to payment',
                focusCancel: true,
              });

              if (force.isConfirmed) {
                dispatch(clearPendingAppointment({ slug }));
                changeCallback();
              } else {
                window.location.href = `/checkout/${reservationUuid}`;
              }
              setBookingSubmitting(false);
              return;
            }
            throw new Error(body.message || 'Failed to cancel reservation');
          }
          dispatch(clearPendingAppointment({ slug }));
          changeCallback();
        } catch (e) {
          setBookingError(e.message || 'Failed to cancel reservation');
        } finally {
          setBookingSubmitting(false);
        }
      } else {
        // User chose to keep reservation — do nothing
      }
    } finally {
      decisionPendingRef.current = false;
    }
  }, [booking, dispatch, slug]);

  const clearFilters = useCallback(() => {
    selectedCategoryUuids?.forEach((uuid) => {
      dispatch(setCategory({ slug, uuid }));
    });
    selectedAudienceUuids?.forEach((uuid) => {
      dispatch(setAudience({ slug, uuid }));
    });
  }, [slug, selectedCategoryUuids, selectedAudienceUuids, dispatch]);

  useEffect(() => {
    if (!slug || initialSalon) return;

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
  }, [slug, initialSalon]);

  const venueName = salon?.venue?.name || "Salon";
  const venueAddress = salon?.venue?.address?.formatted || "";
  const images = salon?.images || [];
  const n = images.length;
  const unavailableDates = salon?.availability?.unavailable_dates || [];
  const services = Array.isArray(salon?.services) ? salon.services : [];

  const categoryOptions = useMemo(() => {
    const seen = new Map();
    const counts = new Map();
    for (const s of services) {
      if (s.category && s.category.uuid && s.category.name) {
        if (!seen.has(s.category.uuid)) {
          seen.set(s.category.uuid, { name: s.category.name, icon: s.category.icon });
        }
        counts.set(s.category.uuid, (counts.get(s.category.uuid) || 0) + 1);
      }
    }
    return Array.from(seen.entries()).map(([uuid, data]) => ({ 
      uuid, 
      name: data.name, 
      icon: data.icon,
      count: counts.get(uuid) || 0 
    }));
  }, [services]);

  const audienceOptions = useMemo(() => {
    const seen = new Map();
    const counts = new Map();
    for (const s of services) {
      if (s.audience && s.audience.uuid && s.audience.name) {
        if (!seen.has(s.audience.uuid)) {
          seen.set(s.audience.uuid, { name: s.audience.name, icon: s.audience.icon });
        }
        counts.set(s.audience.uuid, (counts.get(s.audience.uuid) || 0) + 1);
      }
    }
    return Array.from(seen.entries()).map(([uuid, data]) => ({ 
      uuid, 
      name: data.name, 
      icon: data.icon,
      count: counts.get(uuid) || 0 
    }));
  }, [services]);

  const filteredServices = useMemo(() => {
    if (!services.length) return [];
    const q = serviceSearch.trim().toLowerCase();

    // Stopwords to ignore in search (common words that don't add meaning)
    const stopwords = new Set(['and', 'or', 'the', 'a', 'an', 'is', 'to', 'in', 'of', 'for', 'with', 'by', 'at', 'on']);

    return services.filter((service) => {
      const name = service.display_name || service.service_name || service.name || "";
      
      // Split search query into words and normalize (remove special chars like - and &)
      const normalizeText = (text) => text.toLowerCase().replace(/[-&]/g, ' ').replace(/\s+/g, ' ').trim();
      const queryWords = normalizeText(q).split(' ').filter(w => w.length > 0 && !stopwords.has(w));
      const serviceName = normalizeText(name);
      
      // Match if search is empty or ALL query words are found in service name (substring match for each word)
      const matchesSearch = !q || queryWords.length === 0 || queryWords.every(word => serviceName.includes(word));

      // If no category filters selected, all services match
      let matchesCategory = true;
      if (selectedCategoryUuids && selectedCategoryUuids.length > 0) {
        // Match if service's category is in any of the selected categories (OR logic)
        matchesCategory = selectedCategoryUuids.includes(service.category?.uuid);
      }

      // If no audience filters selected, all services match
      let matchesAudience = true;
      if (selectedAudienceUuids && selectedAudienceUuids.length > 0) {
        // Match if service's audience is in any of the selected audiences (OR logic)
        matchesAudience = selectedAudienceUuids.includes(service.audience?.uuid);
      }

      return matchesSearch && matchesCategory && matchesAudience;
    }).sort((a, b) => {
      // Sort by order field (ascending), with 0 or undefined treated as last
      const orderA = a.order ?? Number.MAX_VALUE;
      const orderB = b.order ?? Number.MAX_VALUE;
      return orderA - orderB;
    });
  }, [services, serviceSearch, selectedCategoryUuids, selectedAudienceUuids]);

  const selectedService = useMemo(() => services.find((s) => s.uuid === selectedServiceUuid) || null, [services, selectedServiceUuid]);

  const selectedProfessional = useMemo(() => professionals.find((professional) => professional.uuid === selectedProfessionalUuid) || null, [professionals, selectedProfessionalUuid]);

  const minProfessionalPrice = useMemo(() => {
    if (professionals.length === 0) return null;
    const prices = professionals
      .map((p) => p.price)
      .filter((price) => price !== null && price !== undefined);
    if (prices.length === 0) return null;
    return Math.min(...prices);
  }, [professionals]);

  const selectedTimeSlot = useMemo(() => timeSlots.find((slot) => (slot?.value ?? slot) === selectedTime) || null, [timeSlots, selectedTime]);

  const groupedTimeSlots = useMemo(() => groupTimeSlots(timeSlots), [timeSlots]);

  useEffect(() => {
    if (!slug || !selectedDate || !selectedServiceUuid) {
      setProfessionals([]);
      setProfessionalsError("");
      setProfessionalsLoading(false);
      return;
    }

    // If we have availability data for the service and the selected date is not available,
    // do not fetch professionals (show closed info in the datepicker instead).
    if (Array.isArray(serviceAvailableDates) && !serviceAvailableDates.includes(selectedDate)) {
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
          const profs = Array.isArray(data.professionals) ? data.professionals : [];
          setProfessionals(profs);
          // Open professionals selection once fetch completes and there are professionals
          if (profs.length > 0) {
            dispatch(setProfessionalOpen({ slug, open: true }));
          }
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
  }, [slug, selectedDate, selectedServiceUuid, serviceAvailableDates, dispatch]);

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

  // Fetch availability for a service across a date range in one API call.
  // Returns: { "2026-04-01": { available: true, professionals: [...] }, ... }
  async function fetchAvailableDatesInRange(startIso, endIso, serviceUuid) {
    if (!slug || !serviceUuid) return {};
    setAvailabilityLoading(true);
    try {
      // Try the optimized batch endpoint first
      try {
        const response = await fetchSalonAvailabilityByDateRange(slug, {
          start_date: startIso,
          end_date: endIso,
          service_uuid: serviceUuid,
        });

        // Response is already in the format { "2026-04-01": { available: true, professionals: [...] }, ... }
        // Extract just the available dates array for backward compatibility
        const availableDates = Object.keys(response).filter((date) => response[date]?.available === true);
        return { availabilityMap: response, availableDates };
      } catch (batchErr) {
        // Fallback to the old method if batch endpoint doesn't exist yet
        console.warn("Batch endpoint not available, falling back to individual date checks:", batchErr?.message);
        return await fallbackCheckAvailableDates(startIso, endIso, serviceUuid);
      }
    } catch (err) {
      console.error("Error in fetchAvailableDatesInRange:", err);
      return {};
    } finally {
      setAvailabilityLoading(false);
    }
  }

  // Fallback method: Check each date individually (slower but works with old backend)
  async function fallbackCheckAvailableDates(startIso, endIso, serviceUuid) {
    const start = dayjs(startIso);
    const end = dayjs(endIso);
    const days = [];
    for (let d = start.clone(); d.isBefore(end) || d.isSame(end, "day"); d = d.add(1, "day")) {
      days.push(d.format("YYYY-MM-DD"));
    }

    const availableDates = [];
    const availabilityMap = {};

    // For each date, check if ANY professional has available slots
    for (const date of days) {
      try {
        // Step 1: Fetch all professionals available for this service on this date
        const profData = await fetchSalonProfessionals(slug, {
          date,
          service_uuid: serviceUuid,
        });

        const professionals = Array.isArray(profData.professionals) ? profData.professionals : [];

        // If no professionals are available on this date, skip it
        if (professionals.length === 0) {
          availabilityMap[date] = { available: false, professionals: [] };
          continue;
        }

        // Step 2: Check if ANY professional has available slots
        const slotChecks = await Promise.allSettled(
          professionals.map((prof) =>
            fetchSalonTimeSlots(slug, {
              date,
              service_uuid: serviceUuid,
              employee_uuid: prof.uuid,
            })
          )
        );

        // Mark date as available if at least one professional has slots
        let dateHasSlots = false;
        for (const result of slotChecks) {
          if (result.status === "fulfilled") {
            const data = result.value;
            const slots = Array.isArray(data.slots) ? data.slots : data?.slots?.data ?? [];
            if (Array.isArray(slots) && slots.length > 0) {
              dateHasSlots = true;
              break;
            }
          }
        }

        if (dateHasSlots) {
          availableDates.push(date);
          availabilityMap[date] = { available: true, professionals };
        } else {
          availabilityMap[date] = { available: false, professionals: [] };
        }
      } catch (err) {
        console.warn(`Error checking availability for ${date}:`, err?.message);
        availabilityMap[date] = { available: false, professionals: [] };
      }
    }

    return { availabilityMap, availableDates };
  }

  // When service changes, prefetch availability for the coming two weeks
  useEffect(() => {
    if (!selectedServiceUuid) {
      setServiceAvailableDates(null);
      return;
    }

    let cancelled = false;
    (async () => {
      const start = dayjs().startOf("day");
      const end = start.add(13, "day");
      const result = await fetchAvailableDatesInRange(start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"), selectedServiceUuid);
      if (!cancelled) setServiceAvailableDates(result.availableDates || []);
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, selectedServiceUuid]);

  // Called by the datepicker when the visible month changes so we can fetch month availability
  const handleDatepickerMonthChange = useCallback(async (monthIso) => {
    if (!selectedServiceUuid) return;
    let start = dayjs(monthIso).startOf("month");
    const today = dayjs().startOf("day");
    // Defensive: ensure start_date is never before today (backend requires this)
    if (start.isBefore(today)) {
      start = today;
    }
    const end = dayjs(monthIso).endOf("month");
    const result = await fetchAvailableDatesInRange(start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"), selectedServiceUuid);
    setServiceAvailableDates(result.availableDates || []);
  }, [selectedServiceUuid]);

  const handleApplyVoucher = useCallback(async () => {
    if (!voucherCode.trim() || !selectedServiceUuid) {
      return;
    }

    dispatch(setVoucherValidating({ slug, validating: true }));
    dispatch(setVoucherError({ slug, error: null }));

    try {
      const response = await validateSalonVoucher(slug, {
        code: voucherCode.trim(),
        service_uuid: selectedServiceUuid,
      });

      if (response.success && response.voucher) {
        dispatch(setSelectedVoucher({ slug, voucher: response.voucher }));
      } else {
        dispatch(setVoucherError({ slug, error: response.message || "Failed to apply voucher" }));
      }
    } catch (error) {
      dispatch(setVoucherError({ slug, error: error?.message || "Failed to apply voucher" }));
    } finally {
      dispatch(setVoucherValidating({ slug, validating: false }));
    }
  }, [slug, voucherCode, selectedServiceUuid, dispatch]);

  const handleBookNow = useCallback(async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save current booking state to localStorage before redirecting to auth
      const bookingState = {
        selectedDate,
        selectedServiceUuid,
        selectedCategoryUuids,
        selectedAudienceUuids,
        selectedProfessionalUuid,
        selectedTime,
        selectedComments,
        serviceSearch,
        selectedVoucher,
        voucherCode,
      };
      localStorage.setItem(`booking_${slug}`, JSON.stringify(bookingState));
      console.log('Saved booking state to localStorage for', slug, bookingState);
      setShowAuthModal(true);
      return;
    }

    if (!selectedServiceUuid || !selectedProfessionalUuid || !selectedTime || !selectedDate) {
      return;
    }

    // Reservation/Modification rules
    const reservationUuid = booking?.reservationUuid;
    const hasUserModifiedSelection = !!booking?.hasUserModifiedSelection;

    if (reservationUuid) {
      // 1) reservation exists and selection unchanged -> reopen Stripe immediately
      if (!hasUserModifiedSelection) {
        const pendingPaymentIntent = booking?.pendingPaymentIntent;
        if (pendingPaymentIntent) {
          setPaymentRequired(true);
          return;
        }

        // Try refreshing payment intent from server
        try {
          const status = await fetchAppointmentPaymentStatus(reservationUuid);
          if (status?.payment_intent) {
            dispatch(setPendingAppointment({ slug, appointment: status.appointment, payment_intent: status.payment_intent, snapshot: booking?.pendingAppointmentSnapshot }));
            setPaymentRequired(true);
            return;
          }
        } catch (err) {
          console.warn('Failed to refresh payment intent for reservation', err?.message);
        }

        // Fallback: open checkout page for reservation
        window.location.href = `/checkout/${reservationUuid}`;
        return;
      }

      // 2) reservation exists and user modified selection -> prompt cancel or keep
      const result = await Swal.fire({
        title: 'You have an active reservation',
        text: 'You already have a reserved appointment. Cancel it and continue with a new selection?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, cancel & continue',
        cancelButtonText: 'No, keep reservation',
        focusCancel: true,
      });

      if (result.isConfirmed) {
        try {
          setBookingSubmitting(true);
          const res = await fetch(`/api/appointments/${reservationUuid}`, { method: 'DELETE' });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            if (res.status === 404) {
              const force = await Swal.fire({
                title: 'Server cancel unavailable',
                text: 'Could not cancel on server. Force-clear local reservation and continue? Server slot may remain reserved.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Force continue',
                cancelButtonText: 'Go to payment',
              });

              if (force.isConfirmed) {
                dispatch(clearPendingAppointment({ slug }));
              } else {
                window.location.href = `/checkout/${reservationUuid}`;
                return;
              }
            } else {
              throw new Error(body.message || 'Failed to cancel reservation');
            }
          } else {
            dispatch(clearPendingAppointment({ slug }));
          }
        } catch (e) {
          setBookingError(e.message || 'Failed to cancel reservation');
          setBookingSubmitting(false);
          return;
        }
        // proceed to create new appointment
      } else {
        // User kept reservation: revert selection to snapshot and open payment
        const snapshot = booking?.pendingAppointmentSnapshot;
        if (snapshot) {
          if (snapshot.service_uuid) dispatch(setService({ slug, uuid: snapshot.service_uuid }));
          if (snapshot.employee_uuid) dispatch(setProfessional({ slug, uuid: snapshot.employee_uuid }));
          if (snapshot.date) dispatch(setDate({ slug, date: snapshot.date }));
          if (snapshot.time) dispatch(setTime({ slug, time: snapshot.time }));
        }
        setPaymentRequired(true);
        return;
      }
    }

    setBookingSubmitting(true);
    setBookingError("");
    setBookingSuccess("");

    try {
      const payload = {
        from_time: selectedTime,
        service_uuid: selectedServiceUuid,
        employee_uuid: selectedProfessionalUuid,
        comments: selectedComments,
        voucher_code: selectedVoucher?.code || null,
      };

      const response = await createSalonAppointment(slug, payload);

      const successMessage = response?.message || "Appointment created successfully!";
      console.log('✓ Booking successful:', successMessage);
      console.log('Full API response:', JSON.stringify(response, null, 2));
      
      dispatch(setCommentsOpen({ slug, open: false }));
      
      // Check if payment is required
      if (response?.payment_intent) {
        // Payment required - show payment form
        console.log('Payment required for appointment:', response.appointment.uuid);
        console.log('Payment intent data:', response.payment_intent);
        // Persist pending appointment + payment intent into Redux (in-memory only)
        // Save a snapshot of the user's selection so we can tell if they change it later
        const snapshot = {
          service_uuid: selectedServiceUuid,
          employee_uuid: selectedProfessionalUuid,
          date: selectedDate,
          time: (selectedTime || '').slice(0,5),
        };
        dispatch(setPendingAppointment({ slug, appointment: response.appointment, payment_intent: response.payment_intent, snapshot }));
        setPaymentRequired(true);
        setBookingSubmitting(false);
        return;
      }

      // No payment required - show success
      // Clear all booking state from Redux and localStorage after successful booking
      dispatch(clearBooking({ slug }));
      localStorage.removeItem(`booking_${slug}`);
      localStorage.removeItem(`voucher_${slug}`);
      console.log('Cleared booking state for', slug);

      // Show SweetAlert success message - only closes by user clicking button
      await Swal.fire({
        icon: 'success',
        title: 'Booking Confirmed!',
        text: successMessage,
        confirmButtonText: 'Close',
        confirmButtonColor: '#000000',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          // Disable outside click to prevent accidental closure
          Swal.getContainer().style.zIndex = '9999';
        },
      });

      // Clear success message state
      setBookingSuccess("");
    } catch (error) {
      const errorMessage = error?.message || "Failed to create appointment";
      setBookingError(errorMessage);
      console.error('✗ Booking failed:', errorMessage);

      // Clear error message after 5 seconds
      const timer = setTimeout(() => {
        setBookingError("");
      }, 5000);

      return () => clearTimeout(timer);
    } finally {
      setBookingSubmitting(false);
    }
  }, [slug, selectedServiceUuid, selectedProfessionalUuid, selectedTime, selectedDate, selectedComments, selectedVoucher, voucherCode, isAuthenticated, booking?.pendingAppointment, booking?.pendingPaymentIntent, dispatch]);

  // Auto-submit booking after successful authentication when booking state is ready
  useEffect(() => {
    if (!justAuthenticatedRef.current) return;
    if (!restorationComplete) return;
    if (!isAuthenticated) return;
    if (!selectedServiceUuid || !selectedProfessionalUuid || !selectedTime || !selectedDate) return;

    // Booking state is ready, submit the booking
    justAuthenticatedRef.current = false;
    setRestorationComplete(false);
    console.log('✓ Auto-submitting booking after authentication...');
    
    // Small delay to ensure all state updates are processed
    const timeoutId = setTimeout(() => {
      handleBookNow();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, selectedServiceUuid, selectedProfessionalUuid, selectedTime, selectedDate, restorationComplete, handleBookNow]);

  const handlePaymentSuccess = useCallback(async () => {
    console.log('✓ Payment successful');
    
    // Clear all booking state from Redux and localStorage
    dispatch(clearBooking({ slug }));
    localStorage.removeItem(`booking_${slug}`);
    localStorage.removeItem(`voucher_${slug}`);
    console.log('Cleared booking state for', slug);

    // Reset payment state
    setPaymentRequired(false);
    dispatch(clearPendingAppointment({ slug }));

    // Show success message
    await Swal.fire({
      icon: 'success',
      title: 'Payment Successful!',
      text: 'Your appointment has been confirmed and payment processed.',
      confirmButtonText: 'Close',
      confirmButtonColor: '#000000',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.getContainer().style.zIndex = '9999';
      },
    });
  }, [slug, dispatch]);

  const handlePaymentError = useCallback((error) => {
    console.error('✗ Payment failed:', error);
    // Do NOT close the modal - let the payment form show the error with retry option
    // User can click "Try Again" in the payment form to retry
  }, []);

  const handlePaymentCancel = useCallback(() => {
    console.log('Payment cancelled by user');
    // Close the payment modal but keep the pending appointment/payment intent so user can retry
    setPaymentRequired(false);
    // pending appointment stored in Redux remains so user can retry during this session
  }, []);

  const handleSkipPayment = useCallback(async () => {
    console.log('✓ Payment skipped - proceeding with booking without payment');
    
    // For optional payment, booking is already created. Just close the modal and show success.
    dispatch(clearBooking({ slug }));
    localStorage.removeItem(`booking_${slug}`);
    localStorage.removeItem(`voucher_${slug}`);
    console.log('Cleared booking state for', slug);

    // Reset payment state
    setPaymentRequired(false);
    dispatch(clearPendingAppointment({ slug }));

    // Show success message
    await Swal.fire({
      icon: 'success',
      title: 'Booking Confirmed!',
      text: 'Your appointment has been confirmed. You can pay at the salon when you arrive.',
      confirmButtonText: 'Close',
      confirmButtonColor: '#000000',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.getContainer().style.zIndex = '9999';
      },
    });
  }, [slug, dispatch]);

  return (
    <>
      {loading && (
        <div className="rounded-md border border-black/10 bg-white p-6 text-sm text-neutral-600">Loading salon...</div>
      )}

      {error && !loading && (
        <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Gallery slider */}
          <section className="relative">
            {images.length === 0 && (
              <p className="mt-2 text-sm text-neutral-500">This salon has not added any gallery images yet.</p>
            )}

            {images.length > 0 && (
              <ImageSlider
                slides={images.map((img) => ({ src: img.path ? `${process.env.NEXT_PUBLIC_LARAVEL_URL}/storage/${img.path}` : "", label: img.caption || "" }))}
                sliderHeight={300}
                sliderHeightMobile={180}
                fullBleed
                showLabel={false}
                showDots
              />
            )}
          </section>

          {/* Booking layout */}
          <section className="grid gap-6 lg:flex lg:items-start">
            {/* Left column: booking steps (visually left on large screens) */}
            <div className="space-y-4 lg:order-1 lg:w-[58%]">
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
                        {selectedDate && selectedProfessionalUuid ? (
                          <span className="text-[11px] text-neutral-500">
                            {selectedService.duration || selectedService.display_duration || `${selectedService.duration} min`}
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-900">
                          <span className="text-[11px] font-normal text-neutral-500">from</span>
                          <span>
                            {selectedService.currency?.symbol && `${selectedService.currency.symbol}`}
                            {typeof selectedService.price === "number" ? selectedService.price.toFixed(2) : selectedService.price}
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
                <div className="flex flex-col gap-3">
                  {/* Search and Filter Row - 2/3 search, 1/3 filters on desktop, stacked on mobile */}
                  <div className="flex flex-col lg:flex-row gap-2 lg:gap-2">
                    {/* Search Input - Full width on mobile, 2/3 on desktop */}
                    <div className="flex-[2]">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={serviceSearch}
                        onChange={(e) => dispatch(setSearch({ slug, query: e.target.value }))}
                        placeholder="Search services by name"
                        className="w-full h-[38px] rounded-md border border-black/10 bg-white px-3 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-black/40 focus:outline-none focus:ring-0"
                      />
                    </div>

                    {/* Filter Button and Clear - 1/3 on desktop, full width on mobile */}
                    <div className="flex flex-1 gap-2">
                      {(categoryOptions.length > 0 || audienceOptions.length > 0) && (
                        <button
                          onClick={toggleFilter}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-2 px-2 py-1 rounded-md border transition-all text-xs font-medium',
                            hasFilters
                              ? 'border-blue-300 text-blue-700 bg-blue-50'
                              : 'border-gray-300 text-gray-700 bg-white hover:border-gray-400'
                          )}
                        >
                          <Filter className="w-4 h-4" />
                          <span>
                            Filters {hasFilters && `(${(selectedCategoryUuids?.length || 0) + (selectedAudienceUuids?.length || 0)})`}
                          </span>
                          <ChevronDown
                            className={cn(
                              'w-4 h-4 transition-transform',
                              expandedFilter === 'filters' && 'rotate-180'
                            )}
                          />
                        </button>
                      )}

                      {hasFilters && (
                        <button
                          onClick={clearFilters}
                          className="inline-flex items-center justify-center rounded-md border border-red-300 bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100 transition-colors"
                          title="Clear all filters"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Filter Section */}
                  {expandedFilter === 'filters' && (
                    <div className="border border-gray-200 rounded-lg bg-gray-50 p-3">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Categories - Left Column */}
                        {categoryOptions.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 mb-2">Categories</h4>
                            <div className="space-y-2">
                              {categoryOptions.map((category) => {
                                const IconComponent = getIcon(category.icon);
                                return (
                                  <label key={category.uuid} className="flex items-center gap-2 cursor-pointer hover:bg-white/50 p-1 rounded transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={selectedCategoryUuids?.includes(category.uuid) || false}
                                      onChange={() => handleCategoryToggle(category.uuid)}
                                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    {IconComponent && (
                                      <IconComponent className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                    )}
                                    <span className="text-xs text-gray-700 flex-1">{category.name}</span>
                                    <span className="text-xs text-gray-500 font-medium">({category.count})</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Audiences - Right Column */}
                        {audienceOptions.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 mb-2">Audiences</h4>
                            <div className="space-y-2">
                              {audienceOptions.map((audience) => {
                                const IconComponent = getIcon(audience.icon);
                                return (
                                  <label key={audience.uuid} className="flex items-center gap-2 cursor-pointer hover:bg-white/50 p-1 rounded transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={selectedAudienceUuids?.includes(audience.uuid) || false}
                                      onChange={() => handleAudienceToggle(audience.uuid)}
                                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    {IconComponent && (
                                      <IconComponent className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                    )}
                                    <span className="text-xs text-gray-700 flex-1">{audience.name}</span>
                                    <span className="text-xs text-gray-500 font-medium">({audience.count})</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Apply and Clear Buttons */}
                      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            clearFilters();
                            setExpandedFilter(null);
                          }}
                          className="px-4 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setExpandedFilter(null)}
                          className="px-4 py-1.5 bg-brand-blue text-white text-xs font-medium rounded-md hover:opacity-90 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {services.length > 0 && filteredServices.length === 0 && (
                  <p className="mt-3 text-xs text-neutral-500">No services match your search.</p>
                )}

                {filteredServices.length > 0 && (
                  <div className="mt-3 max-h-[600px] space-y-2 overflow-y-auto pt-1">
                    {filteredServices.map((service) => {
                      const isSelected = service.uuid === selectedServiceUuid;
                      const isExpanded = !!expandedServices[service.uuid];
                      const name = service.display_name || service.service_name || service.name;
                      const durationLabel =
                        service.duration ||
                        service.display_duration ||
                        (service.duration ? `${service.duration} min` : null);
                      const priceLabel = typeof service.price === "number" ? service.price.toFixed(2) : service.price;
                      const currencySymbol = service.currency?.symbol || "";
                      const description = service.description || "";

                      return (
                        <div
                          key={service.uuid}
                          className={`overflow-hidden rounded-md border transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary/80 bg-primary/5"
                              : "border-neutral-200 bg-white hover:border-primary/40 hover:bg-primary/[0.04] hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
                          }`}
                        >
                          <div className="px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              {/* Service info - clickable to select */}
                              <div
                                onClick={() => ensureCanModify(() => {
                                  const todayIso = dayjs().format('YYYY-MM-DD');
                                  dispatch(setService({ slug, uuid: service.uuid }));
                                  // Ensure date is set to today so professionals are fetched for today immediately
                                  dispatch(setDate({ slug, date: todayIso }));
                                  dispatch(setProfessional({ slug, uuid: null }));
                                  dispatch(setTime({ slug, time: null }));
                                  dispatch(setComments({ slug, comments: "" }));
                                  dispatch(setServiceOpen({ slug, open: false }));
                                  // Do not auto-open professionals UI; we only fetch them
                                  dispatch(setProfessionalOpen({ slug, open: false }));
                                  dispatch(setTimeOpen({ slug, open: false }));
                                  dispatch(setCommentsOpen({ slug, open: false }));
                                })}
                                className="flex-1 min-w-0"
                              >
                                <p className={`truncate text-sm font-medium ${isSelected ? "text-primary" : "text-neutral-900"}`}>
                                  {name}
                                </p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-neutral-600">
                                  {durationLabel && <span>{durationLabel}</span>}
                                  <span className="inline-flex items-center gap-1 font-semibold text-neutral-900">
                                    <span className="text-[12px] font-normal text-neutral-500">from</span>
                                    <span>
                                      {currencySymbol && `${currencySymbol}`}
                                      {priceLabel}
                                    </span>
                                  </span>
                                </div>
                              </div>

                              {/* Dropdown button - inline with service name */}
                              {description && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedServices((prev) => ({
                                      ...prev,
                                      [service.uuid]: !prev[service.uuid],
                                    }));
                                  }}
                                  className="flex-shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 bg-neutral-50 transition-colors hover:border-primary/60 hover:bg-primary/10"
                                >
                                  <ChevronDown
                                    size={14}
                                    strokeWidth={2}
                                    className={`text-neutral-600 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                </button>
                              )}
                            </div>
                          </div>

                          {description && isExpanded && (
                            <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-3">
                              <p className="text-sm text-neutral-700">{description}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </StepSection>

              {/* Step 2: Select Date - only show when a service is selected */}
              {selectedService && (
                <StepSection
                  stepNumber={2}
                  title={selectedDate && !isTimeSectionOpen ? "Date" : "Select Date"}
                  isOpen={true}
                  headerSummary={
                    selectedDate && !isTimeSectionOpen ? (
                      <p className="text-xs text-neutral-700">{dayjs(selectedDate).format('dddd, D MMM YYYY')}</p>
                    ) : null
                  }
                >
                <SalonDatePicker
                  value={selectedDate}
                  onChange={(val) => ensureCanModify(() => {
                    dispatch(setDate({ slug, date: val }));
                    dispatch(setProfessional({ slug, uuid: null }));
                    dispatch(setTime({ slug, time: null }));
                    dispatch(setComments({ slug, comments: "" }));
                    dispatch(setTimeOpen({ slug, open: false }));
                    dispatch(setCommentsOpen({ slug, open: false }));
                    // show professionals once a date has been selected
                    dispatch(setProfessionalOpen({ slug, open: true }));
                  })}
                  unavailableDates={unavailableDates}
                  availableDates={serviceAvailableDates}
                  onMonthChange={handleDatepickerMonthChange}
                  isLoading={availabilityLoading}
                />
              </StepSection>
              )}

              {/* Step 3: Choose a professional (collapsible, placeholder for now) */}
              <StepSection
                stepNumber={3}
                title={selectedProfessional && !isProfessionalSectionOpen ? "Professional" : "Choose Professional"}
                isOpen={!!selectedService && !!selectedDate && isProfessionalSectionOpen}
                headerSummary={
                  !selectedService ? (
                    <p className="text-xs text-neutral-600">First select a service to see available professionals.</p>
                  ) : !selectedDate ? (
                    <p className="text-xs text-neutral-600">Select a date to see available professionals.</p>
                  ) : selectedProfessional ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-[10px] font-semibold text-neutral-700">
                        {selectedProfessional.avatar ? (
                          <img src={selectedProfessional.avatar} alt={selectedProfessional.full_name} className="h-full w-full object-cover" />
                        ) : (
                          <span>{(selectedProfessional.full_name || "P").slice(0, 1)}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-neutral-900">{selectedProfessional.full_name}</p>
                        {selectedProfessional.position && <p className="truncate text-[11px] text-neutral-500">{selectedProfessional.position}</p>}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-600">Choose the professional who will handle this service.</p>
                  )
                }
              >
                {selectedService && (
                  <div className="space-y-3">
                    {professionalsLoading && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-3">
                            <div className="h-10 w-10 rounded-full bg-neutral-200 animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-3/4 bg-neutral-200 rounded animate-pulse" />
                              <div className="h-3 w-1/2 bg-neutral-200 rounded animate-pulse" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {professionalsError && !professionalsLoading && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{professionalsError}</div>
                    )}

                    {!professionalsLoading && !professionalsError && professionals.length === 0 && (
                      <div className="rounded-lg border border-dashed border-black/15 bg-neutral-50 p-3 text-xs text-neutral-600">No professionals are available for this service on the selected date.</div>
                    )}

                    {!professionalsLoading && !professionalsError && professionals.length > 0 && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {professionals.map((professional) => {
                          const isSelectedProfessional = professional.uuid === selectedProfessionalUuid;

                          return (
                              <button
                              key={professional.uuid}
                              type="button"
                              onClick={() => ensureCanModify(() => {
                                dispatch(setProfessional({ slug, uuid: professional.uuid }));
                                dispatch(setProfessionalOpen({ slug, open: false }));
                                dispatch(setTime({ slug, time: null }));
                                dispatch(setTimeOpen({ slug, open: true }));
                                dispatch(setComments({ slug, comments: "" }));
                                dispatch(setCommentsOpen({ slug, open: false }));
                              })}
                              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                                isSelectedProfessional ? "border-primary/60 bg-primary/5" : "border-black/10 bg-white hover:border-black/20 hover:bg-neutral-50"
                              }`}
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700">
                                  {professional.avatar ? (
                                    <img src={professional.avatar} alt={professional.full_name} className="h-full w-full object-cover" />
                                  ) : (
                                    <span>{(professional.full_name || "P").slice(0, 1)}</span>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-neutral-950">{professional.full_name}</p>
                                  {professional.position && <p className="truncate text-xs text-neutral-500">{professional.position}</p>}
                                </div>
                              </div>

                              {professional.price !== undefined && professional.price !== null && (
                                <div className="flex-shrink-0 text-right">
                                  <p className="text-xs font-bold text-emerald-600">
                                    {selectedService.currency?.symbol && `${selectedService.currency.symbol}`}
                                    {typeof professional.price === "number" ? professional.price.toFixed(2) : professional.price}
                                  </p>
                                </div>
                              )}
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
                headerSummary={!selectedProfessional ? (<p className="text-xs text-neutral-600">First choose a professional to see available booking times.</p>) : selectedTime ? (<p className="text-xs font-medium text-neutral-900">{selectedTimeSlot?.label || selectedTime}</p>) : (<p className="text-xs text-neutral-600">Choose the time that works best for you.</p>)}
              >
                {selectedProfessional && (
                  <div className="space-y-3">
                    {timeSlotsLoading && (
                      <div className="rounded-lg border border-dashed border-black/15 bg-neutral-50 p-3 text-xs text-neutral-600">Loading time slots...</div>
                    )}

                    {timeSlotsError && !timeSlotsLoading && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{timeSlotsError}</div>
                    )}

                    {!timeSlotsLoading && !timeSlotsError && timeSlots.length === 0 && (
                      <div className="rounded-lg border border-dashed border-black/15 bg-neutral-50 p-3 text-xs text-neutral-600">No available times for the selected professional and service.</div>
                    )}

                    {!timeSlotsLoading && !timeSlotsError && timeSlots.length > 0 && (
                      <div className="grid gap-5 lg:grid-cols-3">
                        {TIME_GROUPS.map((group) => {
                          const slotsForGroup = groupedTimeSlots[group.key] || [];

                          return (
                            <div key={group.key} className="rounded-xl border border-black/10 bg-neutral-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700">{group.label}</p>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {slotsForGroup.length > 0 ? (
                                  slotsForGroup.map((slot) => {
                                    const isSelectedTime = slot.value === selectedTime;

                                    return (
                                      <button
                                        key={slot.value}
                                        type="button"
                                          onClick={() => ensureCanModify(() => {
                                            dispatch(setTime({ slug, time: slot.value }));
                                            dispatch(setTimeOpen({ slug, open: false }));
                                            dispatch(setCommentsOpen({ slug, open: true }));
                                          })}
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                                          isSelectedTime ? "border-primary/60 bg-primary/5 text-neutral-900 shadow-sm" : "border-black/15 bg-white text-neutral-900 hover:border-black/30 hover:bg-neutral-50"
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
            </div>

            {/* Right column: selection summary (visually right on large screens) */}
            <div className="space-y-4 lg:order-2 lg:w-[42%]">
              <div className="rounded-md border border-black/10 bg-white p-4 shadow-sm">
                <div className="border-b border-black/8 bg-gradient-to-r from-neutral-50 to-white px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <MapPin size={18} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-neutral-950">{venueName}</p>
                      {venueAddress && (
                        <p className="mt-0 text-xs text-neutral-600 line-clamp-2">{venueAddress}</p>
                      )}
                    </div>
                  </div>
                </div>

                {!selectedService && (
                  <div className="p-5">
                    {selectedDate ? (
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <Calendar size={18} strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">Date</p>
                          <p className="mt-1 text-sm font-semibold text-neutral-950">
                            {dayjs(selectedDate).format('dddd, D MMMM YYYY')}
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">Choose a service to start your booking.</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500">Choose a service to start your booking.</p>
                    )}
                  </div>
                )}

                {selectedService && (
                  <div className="divide-y divide-black/5 p-5">
                    {/* Service */}
                    <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                        <Sparkles size={18} strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">Service</p>
                        <p className="mt-1 text-sm font-semibold text-neutral-950">
                          {selectedService.display_name || selectedService.service_name || selectedService.name} 
                          <span className="text-neutral-500 font-normal"> — {selectedService.duration || selectedService.display_duration || `${selectedService.duration} min`}</span>
                        </p>
                      </div>
                    </div>

          

                    {/* Date + Time combined */}
                    {selectedTime && (
                      <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <Calendar size={18} strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">Date & Time</p>
                          <p className="mt-1 text-sm font-semibold text-neutral-950">
                            {dayjs(selectedDate).format("dddd, D MMMM")} at {selectedTimeSlot?.label || selectedTime}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Date only (when time not selected yet) */}
                    {!selectedTime && selectedDate && (
                      <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <Calendar size={18} strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">Date</p>
                          <p className="mt-1 text-sm font-semibold text-neutral-950">
                            {dayjs(selectedDate).format("dddd, D MMMM YYYY")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Professional */}
                    {selectedProfessional && (
                      <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                          <User size={18} strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">Professional</p>
                          <p className="mt-1 text-sm font-semibold text-neutral-950">{selectedProfessional.full_name}</p>
                        </div>
                      </div>
                    )}
                     {/* Price - From professionals or Selected professional */}
                    {(minProfessionalPrice !== null || (selectedProfessional && selectedProfessional.price !== undefined && selectedProfessional.price !== null)) && (
                      <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                          <Banknote size={18} strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          {selectedProfessional && selectedProfessional.price !== undefined && selectedProfessional.price !== null ? (
                            <>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                                {selectedVoucher ? "Original Price" : "Price"}
                              </p>
                              <p className={`mt-1 text-sm font-bold ${selectedVoucher ? "text-neutral-500 line-through" : "text-neutral-950"}`}>
                                {selectedService.currency?.symbol && `${selectedService.currency.symbol}`}
                                {typeof selectedProfessional.price === "number"
                                  ? selectedProfessional.price.toFixed(2)
                                  : selectedProfessional.price}
                              </p>

                              {/* Voucher discount breakdown */}
                              {selectedVoucher && (
                                <>
                                  <div className="mt-2 pt-2 border-t border-neutral-200">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Discount</p>
                                    <p className="mt-1 text-xs text-emerald-700 font-medium">
                                      -{selectedService.currency?.symbol}
                                      {selectedVoucher.discount_type === "percent"
                                        ? ((selectedProfessional.price * selectedVoucher.discount_value) / 100).toFixed(2)
                                        : parseFloat(selectedVoucher.discount_value).toFixed(2)}
                                    </p>
                                  </div>

                                  <div className="mt-2 pt-2 border-t border-neutral-200">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">Final Price</p>
                                    <p className="mt-1 text-sm font-bold text-emerald-700">
                                      {selectedService.currency?.symbol}
                                      {(
                                        selectedProfessional.price -
                                        (selectedVoucher.discount_type === "percent"
                                          ? (selectedProfessional.price * selectedVoucher.discount_value) / 100
                                          : selectedVoucher.discount_value)
                                      ).toFixed(2)}
                                    </p>
                                  </div>
                                </>
                              )}
                            </>
                          ) : minProfessionalPrice !== null ? (
                            <>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">From Price</p>
                              <p className="mt-1 text-sm font-bold text-neutral-950">
                                {selectedService.currency?.symbol && `${selectedService.currency.symbol}`}
                                {typeof minProfessionalPrice === "number"
                                  ? minProfessionalPrice.toFixed(2)
                                  : minProfessionalPrice}
                              </p>
                              <p className="mt-0.5 text-xs text-neutral-500">(Select professional for exact price)</p>
                            </>
                          ) : null}
                        </div>
                      </div>
                    )}

                    {/* Comments section */}
                    {selectedTime && (
                      <div className="pt-4 mt-2 space-y-3">
                        <textarea
                          value={selectedComments}
                          onChange={(e) => {
                            const v = e.target.value;
                            ensureCanModify(() => dispatch(setComments({ slug, comments: v })));
                          }}
                          placeholder="Comments (optional)"
                          rows={3}
                          className="w-full rounded-md border border-black/10 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-black/30 focus:outline-none focus:ring-0"
                        />

                        {/* Voucher section */}
                        {!selectedVoucher && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={voucherCode}
                              onChange={(e) => dispatch(setVoucherCode({ slug, code: e.target.value }))}
                              placeholder="Have voucher?"
                              className="flex-1 rounded-md border border-black/10 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-black/30 focus:outline-none focus:ring-0"
                            />
                            <button
                              onClick={handleApplyVoucher}
                              disabled={voucherValidating || !voucherCode.trim()}
                              className="px-3 py-2 bg-black text-white rounded-md text-xs font-semibold hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                              {voucherValidating ? "Checking..." : "Apply"}
                            </button>
                          </div>
                        )}

                        {/* Selected voucher display */}
                        {selectedVoucher && (
                          <div className="border border-emerald-300 bg-emerald-50 rounded-md p-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <p className="font-semibold text-emerald-900">{selectedVoucher.code}</p>
                                <p className="text-xs text-emerald-700 mt-0.5">
                                  {selectedVoucher.discount_type === "percent"
                                    ? `${selectedVoucher.discount_value}% off`
                                    : `$${parseFloat(selectedVoucher.discount_value).toFixed(2)} off`}
                                </p>
                              </div>
                              <button
                                onClick={() => dispatch(setSelectedVoucher({ slug, voucher: null }))}
                                className="text-emerald-600 hover:text-emerald-800 text-sm font-semibold"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Voucher error */}
                        {voucherError && (
                          <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
                            {voucherError}
                          </div>
                        )}

                        {bookingSuccess && (
                          <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700 flex items-start gap-2">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {bookingSuccess}
                          </div>
                        )}

                        {bookingError && (
                          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 flex items-start gap-2">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {bookingError}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleBookNow}
                          disabled={bookingSubmitting || !!bookingSuccess}
                          className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {bookingSubmitting ? "Booking..." : bookingSuccess ? "Appointment Booked ✓" : "Book now"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Authentication Modal for Booking */}
      <BookingAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          setShowAuthModal(false);
          // Mark that user just authenticated - will trigger auto-submit when booking state is ready
          justAuthenticatedRef.current = true;
        }}
        salonName={salon?.venue?.name || "this salon"}
        salonSlug={slug}
      />

      {/* Payment Modal for Marketplace Appointments */}
      {paymentRequired && booking?.pendingAppointment && booking?.pendingPaymentIntent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">
                {booking.pendingPaymentIntent.payment_optional ? 'Payment (Optional)' : 'Complete Payment'}
              </h2>
              <button
                onClick={handlePaymentCancel}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {booking.pendingPaymentIntent.payment_optional && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Payment is optional.</span> You can pay now or at the salon when you arrive.
                  </p>
                </div>
              )}
              <StripePaymentContainer
                appointmentId={booking.pendingAppointment.uuid}
                amount={booking.pendingPaymentIntent.amount}
                currency={booking.pendingPaymentIntent.currency || booking.pendingPaymentIntent.currency_code}
                ownerName={salon?.venue?.name || "Salon"}
                serviceName={selectedService?.display_name || selectedService?.name || "Service"}
                clientEmail={localStorage.getItem('user_email') || ''}
                clientSecret={booking.pendingPaymentIntent.client_secret}
                paymentIntentId={booking.pendingPaymentIntent.payment_intent_id}
                paymentOptional={booking.pendingPaymentIntent.payment_optional}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                onSkipPayment={booking.pendingPaymentIntent.payment_optional ? handleSkipPayment : null}
                onClose={handlePaymentCancel}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
