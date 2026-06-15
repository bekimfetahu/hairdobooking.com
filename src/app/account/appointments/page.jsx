"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/account/appointments');
        if (!res.ok) throw new Error('Failed to load appointments');
        const data = await res.json();
        // Expecting an array `appointments` or top-level array
        setAppointments(data.appointments || data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading appointments...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Appointments</h1>
      {appointments.length === 0 && <div>No appointments found.</div>}
      <div className="space-y-4">
        {appointments.map((a) => (
          <div key={a.uuid} className="p-4 border rounded-lg flex items-center justify-between">
            <div>
              <div className="font-semibold">{a.service_name} — {a.employee_name}</div>
              <div className="text-sm text-gray-600">{a.date_time}</div>
              <div className="text-sm mt-1">Status: <span className="font-medium">{a.status || a.payment_status || 'unknown'}</span></div>
            </div>
            <div className="space-x-2">
              {a.payment_required || a.payment_status === 'pending' ? (
                <Link href={`/checkout/${a.uuid}`} className="bg-black text-white px-4 py-2 rounded">Pay Now</Link>
              ) : (
                <Link href={`/checkout/${a.uuid}`} className="bg-gray-100 text-gray-800 px-4 py-2 rounded">View</Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
