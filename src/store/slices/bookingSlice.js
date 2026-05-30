import { createSlice } from "@reduxjs/toolkit";

/*
 * Booking state is keyed by salon slug so each salon keeps its own
 * independent booking-in-progress. The shape for each slug entry:
 *
 *   {
 *     selectedDate:          "2026-04-02" | null,
 *     selectedServiceUuid:   "<uuid>" | null,
 *     selectedCategoryUuid:  "" | "<uuid>",
 *     selectedAudienceUuid:  "" | "<uuid>",
 *     selectedProfessionalUuid: null | "<uuid>",
 *     selectedTime:          null | "YYYY-MM-DD HH:MM:SS" (UTC),
 *     selectedComments:      "",
 *     serviceSearch:         "",
 *     isServiceSectionOpen:  true,
 *     isProfessionalSectionOpen: false,
 *     isTimeSectionOpen:     false,
 *     isCommentsSectionOpen:  false,
 *     voucherCode:           "",
 *     selectedVoucher:       null | { code, discount_type, discount_value, description },
 *     voucherError:          null | string,
 *     voucherValidating:     false,
 *   }
 */

const defaultBooking = {
  selectedDate: null,
  selectedServiceUuid: null,
  selectedCategoryUuids: [],
  selectedAudienceUuids: [],
  selectedProfessionalUuid: null,
  selectedTime: null,
  selectedComments: "",
  serviceSearch: "",
  isServiceSectionOpen: true,
  isProfessionalSectionOpen: false,
  isTimeSectionOpen: false,
  isCommentsSectionOpen: false,
  voucherCode: "",
  selectedVoucher: null,
  voucherError: null,
  voucherValidating: false,
  pendingAppointment: null,
  pendingPaymentIntent: null,
};

function getToday() {
  try {
    return new Date().toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    // { [slug]: { ...defaultBooking } }
    bySlug: {},
  },
  reducers: {
    initBooking(state, action) {
      const { slug } = action.payload;
      if (!state.bySlug[slug]) {
        state.bySlug[slug] = { ...defaultBooking, selectedDate: getToday() };
      }
    },
    setSelectedDate(state, action) {
      const { slug, date } = action.payload;
      if (state.bySlug[slug]) state.bySlug[slug].selectedDate = date;
    },
    setSelectedServiceUuid(state, action) {
      const { slug, uuid } = action.payload;
      if (state.bySlug[slug]) state.bySlug[slug].selectedServiceUuid = uuid;
    },
    setSelectedCategoryUuid(state, action) {
      const { slug, uuid } = action.payload;
      if (state.bySlug[slug]) {
        const uuids = state.bySlug[slug].selectedCategoryUuids || [];
        if (uuids.includes(uuid)) {
          state.bySlug[slug].selectedCategoryUuids = uuids.filter(u => u !== uuid);
        } else {
          state.bySlug[slug].selectedCategoryUuids = [...uuids, uuid];
        }
      }
    },
    setSelectedAudienceUuid(state, action) {
      const { slug, uuid } = action.payload;
      if (state.bySlug[slug]) {
        const uuids = state.bySlug[slug].selectedAudienceUuids || [];
        if (uuids.includes(uuid)) {
          state.bySlug[slug].selectedAudienceUuids = uuids.filter(u => u !== uuid);
        } else {
          state.bySlug[slug].selectedAudienceUuids = [...uuids, uuid];
        }
      }
    },
    setSelectedProfessionalUuid(state, action) {
      const { slug, uuid } = action.payload;
      if (state.bySlug[slug]) state.bySlug[slug].selectedProfessionalUuid = uuid;
    },
    setSelectedTime(state, action) {
      const { slug, time } = action.payload;
      if (state.bySlug[slug]) state.bySlug[slug].selectedTime = time;
    },
    setSelectedComments(state, action) {
      const { slug, comments } = action.payload;
      if (state.bySlug[slug]) state.bySlug[slug].selectedComments = comments;
    },
    setServiceSearch(state, action) {
      const { slug, query } = action.payload;
      if (state.bySlug[slug]) state.bySlug[slug].serviceSearch = query;
    },
    setIsServiceSectionOpen(state, action) {
      const { slug, open } = action.payload;
      if (state.bySlug[slug]) state.bySlug[slug].isServiceSectionOpen = open;
    },
    setIsProfessionalSectionOpen(state, action) {
      const { slug, open } = action.payload;
      if (state.bySlug[slug]) state.bySlug[slug].isProfessionalSectionOpen = open;
    },
    setIsTimeSectionOpen(state, action) {
      const { slug, open } = action.payload;
      if (state.bySlug[slug]) state.bySlug[slug].isTimeSectionOpen = open;
    },
    setIsCommentsSectionOpen(state, action) {
      const { slug, open } = action.payload;
      if (state.bySlug[slug]) state.bySlug[slug].isCommentsSectionOpen = open;
    },
    setVoucherCode(state, action) {
      const { slug, code } = action.payload;
      if (state.bySlug[slug]) {
        state.bySlug[slug].voucherCode = code;
        state.bySlug[slug].voucherError = null;
      }
    },
    setSelectedVoucher(state, action) {
      const { slug, voucher } = action.payload;
      if (state.bySlug[slug]) {
        state.bySlug[slug].selectedVoucher = voucher;
        state.bySlug[slug].voucherError = null;
      }
    },
    setVoucherError(state, action) {
      const { slug, error } = action.payload;
      if (state.bySlug[slug]) state.bySlug[slug].voucherError = error;
    },
    setVoucherValidating(state, action) {
      const { slug, validating } = action.payload;
      if (state.bySlug[slug]) state.bySlug[slug].voucherValidating = validating;
    },
    setPendingAppointment(state, action) {
      const { slug, appointment, payment_intent } = action.payload;
      if (state.bySlug[slug]) {
        state.bySlug[slug].pendingAppointment = appointment || null;
        state.bySlug[slug].pendingPaymentIntent = payment_intent || null;
      }
    },
    clearPendingAppointment(state, action) {
      const { slug } = action.payload;
      if (state.bySlug[slug]) {
        state.bySlug[slug].pendingAppointment = null;
        state.bySlug[slug].pendingPaymentIntent = null;
      }
    },
    clearBooking(state, action) {
      const { slug } = action.payload;
      // Reset booking state for the slug instead of deleting the key.
      // Keep `selectedDate` null so today's date is not auto-selected.
      state.bySlug[slug] = { ...defaultBooking };
    },
  },
});

// Stable fallback so the selector doesn't create a new object every call
const fallbackBooking = { ...defaultBooking, selectedDate: null };
fallbackBooking.pendingAppointment = null;
fallbackBooking.pendingPaymentIntent = null;

// Selector: get booking state for a given slug (returns stable default if missing)
export const selectBooking = (slug) => (state) =>
  state.booking.bySlug[slug] ?? fallbackBooking;

export const {
  initBooking,
  setSelectedDate,
  setSelectedServiceUuid,
  setSelectedCategoryUuid,
  setSelectedAudienceUuid,
  setSelectedProfessionalUuid,
  setSelectedTime,
  setSelectedComments,
  setServiceSearch,
  setIsServiceSectionOpen,
  setIsProfessionalSectionOpen,
  setIsTimeSectionOpen,
  setIsCommentsSectionOpen,
  setVoucherCode,
  setSelectedVoucher,
  setVoucherError,
  setVoucherValidating,
  setPendingAppointment,
  clearPendingAppointment,
  clearBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
