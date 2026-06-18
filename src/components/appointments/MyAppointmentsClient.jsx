"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Swal from 'sweetalert2';
import { MapPin, Calendar, User, Clock, Scissors } from 'lucide-react';

function displayValue(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string" || typeof v === "number") return v;
  if (typeof v === "object") return v.name || v.title || v.display_name || JSON.stringify(v);
  return String(v);
}

function escapeHtml(input) {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isSameDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export default function MyAppointmentsClient({ initialUpcoming = [], initialPast = [], initialUpcomingMeta = null, initialPastMeta = null, perPage = 5 }) {
  const [upcoming, setUpcoming] = useState(initialUpcoming);
  const [past, setPast] = useState(initialPast);

  const [cancelingId, setCancelingId] = useState(null);

  const [upcomingPage, setUpcomingPage] = useState(initialUpcomingMeta?.current_page || 1);
  const [pastPage, setPastPage] = useState(initialPastMeta?.current_page || 1);
  const [upcomingLastPage, setUpcomingLastPage] = useState(initialUpcomingMeta?.last_page || Math.max(1, Math.ceil(initialUpcoming.length / perPage)));
  const [pastLastPage, setPastLastPage] = useState(initialPastMeta?.last_page || Math.max(1, Math.ceil(initialPast.length / perPage)));

  const [loading, setLoading] = useState(false);

  const [upcomingPerPage] = useState(perPage);

  const now = useMemo(() => new Date(), []);

  const sliceFor = (items, page) => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  };

  const parseResponseItemsAndMeta = (data) => {
    // support multiple response shapes
    // Laravel paginated: { data: [...], meta: { current_page, last_page, total } }
    // Or older shapes: { appointments: [...] } or array
    if (!data) return { items: [], meta: null };
    if (Array.isArray(data)) return { items: data, meta: null };
    if (data.data && Array.isArray(data.data)) {
      return { items: data.data, meta: data.meta || null };
    }
    const items = data.appointments || data.appointment || data.items || data?.data || [];
    return { items: Array.isArray(items) ? items : (items?.data || []), meta: data.meta || null };
  };

  const fetchScopePage = async (scope, page) => {
    setLoading(true);
    try {
      const url = `/api/appointments?scope=${encodeURIComponent(scope)}&page=${encodeURIComponent(page)}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Failed to fetch appointments');
      }
      const data = await res.json();
      const { items, meta } = parseResponseItemsAndMeta(data);

      if (scope === 'upcoming') {
        setUpcoming(items);
        setUpcomingPage(page);
        if (meta && meta.last_page) setUpcomingLastPage(meta.last_page);
        else if (items.length < perPage) setUpcomingLastPage(page);
      } else {
        setPast(items);
        setPastPage(page);
        if (meta && meta.last_page) setPastLastPage(meta.last_page);
        else if (items.length < perPage) setPastLastPage(page);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // keep current page within bounds when items change locally
    if (upcomingPage > Math.ceil(upcoming.length / perPage)) setUpcomingPage(1);
    if (pastPage > Math.ceil(past.length / perPage)) setPastPage(1);
  }, [upcoming.length, past.length]);

  const AppointmentCard = ({ appt, showCheckout = false }) => {
    const dtRaw = appt.from_time || appt.start_time || appt.datetime || null;
    const dateObj = dtRaw ? new Date(dtRaw) : null;
    const [when, setWhen] = useState(dateObj ? dateObj.toISOString() : 'TBD');
    useEffect(() => {
      if (!dateObj) return;
      try {
        const formatted = dateObj.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric' });
        setWhen(formatted);
      } catch (e) {
        setWhen(dateObj.toISOString());
      }
    }, [dtRaw]);

    const service = displayValue(appt.service_name || appt.service || appt?.service_display_name) || 'Service';
    const venue = displayValue(appt.venue_name || appt.venue || appt?.salon_name) || '';
    const professional = displayValue(appt.employee?.full_name || appt.employee_name || appt?.professional_name) || '';
    const status = displayValue(appt.status || appt.appointment_state || appt.state) || 'Unknown';
    const requiresPayment = appt.requires_payment || appt.payment_required || appt.requires_payment_intent || false;
    const paymentPending = appt.payment && appt.payment.status === 'pending';

    const apptDate = dateObj || null;
    const isPast = apptDate ? apptDate < new Date(new Date().setHours(0, 0, 0, 0)) : false; // before today
    const isToday = apptDate ? isSameDay(apptDate, new Date()) : false;
    const canAct = !isPast && !isToday; // only after today

    const apptUuid = appt.uuid || appt.appointment_uuid || appt.id;

    const cancelHandler = async () => {
      console.log('cancelHandler invoked for', apptUuid);
      if (!apptUuid) return;
      const confirmHtml = `<div style="text-align:left">` +
        `<strong>Service:</strong> ${escapeHtml(service)}<br/>` +
        `${venue ? `<strong>Venue:</strong> ${escapeHtml(venue)}<br/>` : ''}` +
        `${professional ? `<strong>Professional:</strong> ${escapeHtml(professional)}<br/>` : ''}` +
        `<strong>When:</strong> ${escapeHtml(when)}` +
        `</div>`;

      const confirmRes = await Swal.fire({
        title: 'Cancel appointment',
        html: confirmHtml,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, cancel',
        cancelButtonText: 'No, keep it',
        focusConfirm: false,
      });
      if (!confirmRes.isConfirmed) return;

      try {
        setCancelingId(apptUuid);
        const res = await fetch(`/api/appointments/${encodeURIComponent(apptUuid)}`, { method: 'DELETE', credentials: 'include' });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || 'Failed to cancel appointment');
        }
        // Remove from upcoming list (optimistic)
        setUpcoming((prev) => prev.filter((x) => (x.uuid || x.appointment_uuid || x.id) !== apptUuid));
        // refresh current page meta/items from server to stay consistent
        try { await fetchScopePage('upcoming', upcomingPage); } catch (e) { /* ignore */ }
      } catch (e) {
        console.error(e);
        await Swal.fire({ icon: 'error', title: 'Error', text: e.message || 'Failed to cancel appointment' });
      } finally {
        setCancelingId(null);
      }
    };

    return (

      <div className="rounded-md border border-black/10 bg-white p-4 shadow-sm flex flex-col overflow-hidden w-full">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-black/5 text-black">
              <Scissors size={16} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold">{service}</h3>
              {venue && <p className="text-xs text-neutral-600 line-clamp-1">{venue}</p>}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <Calendar size={14} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 text-sm">{when}</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                <MapPin size={14} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 text-sm">{venue || '—'}</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-green-50 text-green-600">
                <User size={14} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 text-sm">{professional || '—'}</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-50 text-gray-600">
                <Clock size={14} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 text-sm">Status: <strong>{status}</strong></div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
          <div className="sm:mr-2">
            {paymentPending && (
              <Link href={`/checkout/${encodeURIComponent(appt.uuid || appt.appointment_uuid || appt.id)}`} className="rounded bg-orange-600 px-3 py-1 text-xs text-white block sm:inline-block">
                Checkout to complete
              </Link>
            )}
            {showCheckout && requiresPayment && !paymentPending && (
              <Link href={`/checkout?appointment=${encodeURIComponent(appt.uuid || appt.appointment_uuid || appt.id)}`} className="rounded bg-primary px-3 py-1 text-xs text-white block sm:inline-block">
                Pay now
              </Link>
            )}
          </div>

          {!isPast && (
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
              <button
                onClick={(e) => {
                  console.log('Cancel clicked', apptUuid, 'canAct=', canAct, 'cancelingId=', cancelingId);
                  if (!canAct) {
                    Swal.fire({ icon: 'info', title: 'Cannot cancel', text: 'This appointment cannot be cancelled (same-day or past).' });
                    return;
                  }
                  if (cancelingId === apptUuid) return;
                  cancelHandler();
                }}
                aria-disabled={!canAct || cancelingId === apptUuid}
                aria-busy={cancelingId === apptUuid}
                className={`rounded px-3 py-2 text-sm inline-flex items-center justify-center gap-2 w-full sm:w-auto ${canAct ? 'bg-white text-red-600 border border-red-600 hover:bg-red-50' : 'text-neutral-400 border border-neutral-200'}`}>
                {cancelingId === apptUuid ? (
                  <>
                    <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  'Cancel'
                )}
              </button>
              <button
                disabled={!canAct}
                onClick={async () => {
                  if (!canAct) { Swal.fire({ icon: 'info', title: 'Cannot reschedule', text: 'This appointment cannot be rescheduled (same-day or past).' }); return; }
                  const html = `<div style="text-align:left">` +
                    `<strong>Service:</strong> ${escapeHtml(service)}<br/>` +
                    `${venue ? `<strong>Venue:</strong> ${escapeHtml(venue)}<br/>` : ''}` +
                    `${professional ? `<strong>Professional:</strong> ${escapeHtml(professional)}<br/>` : ''}` +
                    `<strong>When:</strong> ${escapeHtml(when)}` +
                    `</div>`;
                  const r = await Swal.fire({ title: 'Reschedule appointment', html, icon: 'question', showCancelButton: true, confirmButtonText: 'Start reschedule', cancelButtonText: 'Keep appointment' });
                  if (r.isConfirmed) {
                    const dest = `/reschedule/${encodeURIComponent(apptUuid)}`;
                    window.location.href = dest;
                  }
                }}
                className={`rounded px-3 py-2 text-sm w-full sm:w-auto ${canAct ? 'bg-yellow-50 text-yellow-800 border border-yellow-300 hover:bg-yellow-100' : 'text-neutral-400 border border-neutral-200'}`}>
                Reschedule
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPagination = (scope) => {
    const current = scope === 'upcoming' ? upcomingPage : pastPage;
    const last = scope === 'upcoming' ? upcomingLastPage : pastLastPage;
    const onClick = (p) => (scope === 'upcoming' ? setUpcomingPage(p) : setPastPage(p));

    const pages = [];
    for (let i = 1; i <= last; i++) pages.push(i);

    const handlePage = async (p) => {
      await fetchScopePage(scope, p);
      onClick(p);
    };

    return (
      <div className="mt-3 flex items-center justify-center gap-2">
        <button disabled={current <= 1} onClick={async () => handlePage(Math.max(1, current - 1))} className={`rounded px-3 py-1 text-sm border border-neutral-300 bg-white ${current <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50'}`}>
          Previous
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={async () => handlePage(p)}
            className={`rounded px-3 py-1 text-sm border ${p === current ? 'bg-black text-white border-black' : 'bg-white border-neutral-300 hover:bg-neutral-50'}`}>
            {p}
          </button>
        ))}
        <button disabled={current >= last} onClick={async () => handlePage(Math.min(last, current + 1))} className={`rounded px-3 py-1 text-sm border border-neutral-300 bg-white ${current >= last ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50'}`}>
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="w-full p-4 sm:px-6 sm:py-8 flex flex-col">
      <div className="mt-6">
        <h2 className="text-lg font-medium">Upcoming</h2>
        <div className="mt-4 space-y-3">
          {sliceFor(upcoming, upcomingPage).length === 0 ? (
            <p className="text-sm text-neutral-600">No upcoming appointments.</p>
          ) : (
            sliceFor(upcoming, upcomingPage).map((a) => <AppointmentCard key={a.uuid || a.id || a.appointment_uuid} appt={a} showCheckout={true} />)
          )}
        </div>
        {renderPagination('upcoming')}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium">Past</h2>
        <div className="mt-4 space-y-3">
          {sliceFor(past, pastPage).length === 0 ? (
            <p className="text-sm text-neutral-600">No past appointments.</p>
          ) : (
            sliceFor(past, pastPage).map((a) => <AppointmentCard key={a.uuid || a.id || a.appointment_uuid} appt={a} showCheckout={false} />)
          )}
        </div>
        {renderPagination('past')}
      </div>
    </div>
  );
}
