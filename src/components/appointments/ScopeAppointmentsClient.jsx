"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

function displayValue(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string' || typeof v === 'number') return v;
  if (typeof v === 'object') return v.name || v.title || v.display_name || JSON.stringify(v);
  return String(v);
}

function isSameDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export default function ScopeAppointmentsClient({ scope = 'upcoming' }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments?scope=${encodeURIComponent(scope)}&page=${p}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Failed to load ${scope}`);
      }
      const data = await res.json();
      setItems(data?.data || []);
      setMeta(data?.meta || null);
      setPage(data?.meta?.current_page || p);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const gotoPage = (p) => {
    if (!meta) return;
    const last = meta.last_page || 1;
    const target = Math.max(1, Math.min(p, last));
    if (target === page) return;
    fetchPage(target);
  };

  const AppointmentCard = ({ appt }) => {
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
            {requiresPayment && !paymentPending && (
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

  const renderPagination = () => {
    const current = meta?.current_page || page;
    const last = meta?.last_page || 1;
    const pages = [];
    for (let i = 1; i <= last; i++) pages.push(i);

    const handlePage = async (p) => {
      await fetchPage(p);
      setPage(p);
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
    <div className="my-6">
      <h2 className="text-lg font-medium capitalize">{scope.replace('_', ' ')}</h2>
      {loading && <p className="text-sm text-neutral-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="mt-4 space-y-3">
        {items.length === 0 && !loading && <p className="text-sm text-neutral-600">No appointments.</p>}
        {items.map((a) => (
          <AppointmentCard key={a.uuid || a.id || a.appointment_uuid} appt={a} showCheckout={scope === 'upcoming'} />
        ))}
      </div>

      {meta && renderPagination()}
    </div>
  );
}
