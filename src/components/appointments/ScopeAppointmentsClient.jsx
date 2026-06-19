"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Swal from 'sweetalert2';
import { MapPin, Calendar, User, Clock, Sparkles, Store } from 'lucide-react';
import dynamic from 'next/dynamic';
const Pagination = dynamic(() => import('@/components/ui/Pagination'), { ssr: false });

function displayValue(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string' || typeof v === 'number') return v;
  if (typeof v === 'object') return v.name || v.title || v.display_name || JSON.stringify(v);
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

export default function ScopeAppointmentsClient({ scope = 'upcoming' }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

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
        const formatted = dateObj.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        setWhen(formatted);
      } catch (e) {
        setWhen(dateObj.toISOString());
      }
    }, [dtRaw]);

    const service = appt?.service?.display_name || appt?.service?.name || 'Service';
    const venue = appt?.venue?.name || '';
    const professional = appt?.employee?.full_name || '';
    const status = appt?.appointment_state?.name || 'Unknown';
    const requiresPayment = !!appt?.requires_payment;
    const paymentPending = appt?.payment?.status === 'pending';
    const address = appt?.venue?.line_address || '';

    const apptDate = dateObj || null;
    const isPast = apptDate ? apptDate < new Date(new Date().setHours(0, 0, 0, 0)) : false; // before today
    const isToday = apptDate ? isSameDay(apptDate, new Date()) : false;
    const canAct = !isPast && !isToday; // only after today
    const apptUuid = appt.uuid || appt.id;

    const cancelHandler = async () => {
      console.log('cancelHandler invoked for', apptUuid);
      if (!apptUuid) return;
      const confirmHtml = `<div style="text-center:left">` +
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
        // Optimistically remove
        setItems((prev) => prev.filter((x) => (x.uuid || x.id) !== apptUuid));
        // Refresh current page
        try { await fetchPage(page); } catch (e) { /* ignore */ }
      } catch (e) {
        console.error(e);
        await Swal.fire({ icon: 'error', title: 'Error', text: e.message || 'Failed to cancel appointment' });
      } finally {
        setCancelingId(null);
      }
    };

    return (
      <div className="w-full rounded-md border border-black/10 bg-white p-4 flex flex-col">
        <div className="min-w-0 flex-1">
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-700">

            {/* Venue */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full
      bg-gradient-to-br from-white to-blue-50
      text-blue-600 shadow-sm border border-blue-100">
                <Store size={16} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 text-sm">{venue || "—"}</div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full
      bg-gradient-to-br from-white to-rose-50
      text-rose-600 shadow-sm border border-rose-100">
                <MapPin size={16} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 text-sm">{address || "—"}</div>
            </div>

            {/* Service */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full
      bg-gradient-to-br from-white to-amber-50
      text-amber-600 shadow-sm border border-amber-100">
                <Sparkles size={16} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{service}</h3>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full
      bg-gradient-to-br from-white to-indigo-50
      text-indigo-600 shadow-sm border border-indigo-100">
                <Calendar size={16} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 text-sm">{when}</div>
            </div>

            {/* Practitioner */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full
      bg-gradient-to-br from-white to-green-50
      text-green-600 shadow-sm border border-green-100">
                <User size={16} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 text-sm">{professional || "—"}</div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full
      bg-gradient-to-br from-white to-gray-50
      text-gray-600 shadow-sm border border-gray-200">
                <Clock size={16} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 text-sm">
                Status: <strong>{status}</strong>
              </div>
            </div>

          </div>

        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
          <div className="sm:mr-2">
            {scope === 'upcoming' && paymentPending && (
              <Link href={`/checkout/${encodeURIComponent(apptUuid)}`} className="rounded bg-orange-600 px-3 py-1 text-xs text-white block sm:inline-block">
                Checkout to complete
              </Link>
            )}
            {scope === 'upcoming' && requiresPayment && !paymentPending && (
              <Link href={`/checkout?appointment=${encodeURIComponent(apptUuid)}`} className="rounded bg-primary px-3 py-1 text-xs text-white block sm:inline-block">
                Pay now
              </Link>
            )}
          </div>

          {!isPast && (
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  console.log('Cancel clicked', apptUuid, 'canAct=', canAct, 'cancelingId=', cancelingId);
                  if (!canAct) { Swal.fire({ icon: 'info', title: 'Cannot cancel', text: 'This appointment cannot be cancelled (same-day or past).' }); return; }
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
              <button disabled={!canAct} className={`rounded px-3 py-2 text-sm w-full sm:w-auto ${canAct ? 'bg-yellow-50 text-yellow-800 border border-yellow-300 hover:bg-yellow-100' : 'text-neutral-400 border border-neutral-200'}`}>Reschedule</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handlePage = async (p) => {
    await fetchPage(p);
    setPage(p);
  };

  return (
    <div className="my-6">
      <h2 className="text-lg font-medium capitalize">{scope.replace('_', ' ')}</h2>
      {loading && <p className="text-sm text-neutral-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="mt-4 space-y-3">
        {items.length === 0 && !loading && <p className="text-sm text-neutral-600">No appointments.</p>}
        {items.map((a) => (
          <AppointmentCard key={a.uuid || a.id} appt={a} showCheckout={scope === 'upcoming'} />
        ))}
      </div>

      {meta && (
        <Pagination
          current={meta?.current_page || page}
          last={meta?.last_page || 1}
          onPage={handlePage}
          maxPages={5}
        />
      )}
    </div>
  );
}
