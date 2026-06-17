"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function displayValue(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string" || typeof v === "number") return v;
  if (typeof v === "object") return v.name || v.title || v.display_name || JSON.stringify(v);
  return String(v);
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
    const isPast = apptDate ? apptDate < new Date(new Date().setHours(0,0,0,0)) : false; // before today
    const isToday = apptDate ? isSameDay(apptDate, new Date()) : false;
    const canAct = !isPast && !isToday; // only after today

    return (
      <div className="rounded-md border border-black/10 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold">{service}</h3>
            {venue && <p className="text-xs text-neutral-600">{venue}</p>}
            {professional && <p className="text-xs text-neutral-600">Professional: {professional}</p>}
            <p className="mt-2 text-xs text-neutral-700">{when}</p>
            <p className="mt-1 text-xs">Status: <strong>{status}</strong></p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {paymentPending && (
              <Link href={`/checkout/${encodeURIComponent(appt.uuid || appt.appointment_uuid || appt.id)}`} className="rounded bg-orange-600 px-3 py-1 text-xs text-white">
                Checkout to complete
              </Link>
            )}
            {showCheckout && requiresPayment && !paymentPending && (
              <Link href={`/checkout?appointment=${encodeURIComponent(appt.uuid || appt.appointment_uuid || appt.id)}`} className="rounded bg-primary px-3 py-1 text-xs text-white">
                Pay now
              </Link>
            )}
            {!isPast && (
              <div className="flex gap-2">
                <button disabled={!canAct} className={`rounded border px-3 py-1 text-xs ${canAct ? 'text-black' : 'text-neutral-400'}`}>Cancel</button>
                <button disabled={!canAct} className={`rounded border px-3 py-1 text-xs ${canAct ? 'text-black' : 'text-neutral-400'}`}>Reschedule</button>
              </div>
            )}
          </div>
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
    <div>
      <section className="mt-6">
        <h2 className="text-lg font-medium">Upcoming</h2>
        <div className="mt-4 space-y-3">
          {sliceFor(upcoming, upcomingPage).length === 0 ? (
            <p className="text-sm text-neutral-600">No upcoming appointments.</p>
          ) : (
            sliceFor(upcoming, upcomingPage).map((a) => <AppointmentCard key={a.uuid || a.id || a.appointment_uuid} appt={a} showCheckout={true} />)
          )}
        </div>
        {renderPagination('upcoming')}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Past</h2>
        <div className="mt-4 space-y-3">
          {sliceFor(past, pastPage).length === 0 ? (
            <p className="text-sm text-neutral-600">No past appointments.</p>
          ) : (
            sliceFor(past, pastPage).map((a) => <AppointmentCard key={a.uuid || a.id || a.appointment_uuid} appt={a} showCheckout={false} />)
          )}
        </div>
        {renderPagination('past')}
      </section>
    </div>
  );
}
