'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import { fetchAppointments } from '@/services/appointments';

export default function AppointmentsClient({ initialUser, initialAppointments }) {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth.user);

  const [appointments, setAppointments] = useState(initialAppointments || []);
  const [loading, setLoading] = useState(false);

  // Hydrate Redux store from SSR data
  useEffect(() => {
    if (initialUser && !reduxUser) {
      dispatch(loginSuccess({ user: initialUser, token: initialUser?.token }));
    }
  }, [initialUser, reduxUser, dispatch]);

  // Client-side data fetching with refresh button
  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await fetchAppointments();
      setAppointments(data || []);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await fetch(`/api/appointments/${id}`, { method: 'DELETE', credentials: 'include' });
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      console.error('Failed to cancel:', e);
      alert('Failed to cancel appointment');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">My Appointments</h1>
      <div className="mb-4">
        <button className="btn" onClick={loadAppointments} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <ul>
          {appointments.map((appointment) => (
            <li key={appointment.id} className="py-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{appointment.service_name}</div>
                  <div className="text-sm text-neutral-600">{appointment.scheduled_for}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="btn btn-secondary" onClick={() => cancelAppointment(appointment.id)}>Cancel</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}