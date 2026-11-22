"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SalonClient from "@/components/salon/SalonClient";
import { fetchRescheduleAppointment } from "@/services/salon/salonService";

export default function RescheduleAppointmentClient({
  slug,
  appointmentUuid,
  initialSalon,
}) {
  const router = useRouter();
  const [rescheduleContext, setRescheduleContext] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetchRescheduleAppointment(appointmentUuid)
      .then(({ appointment }) => {
        if (!active) return;
        if (appointment.venue_slug !== slug || !appointment.can_reschedule) {
          throw new Error("This appointment can no longer be rescheduled at this salon.");
        }
        setRescheduleContext(appointment);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, [appointmentUuid, slug]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-lg font-semibold text-red-900">Unable to reschedule</h1>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => router.push("/my-appointments")}
          className="mt-5 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          Back to appointments
        </button>
      </div>
    );
  }

  if (!rescheduleContext) {
    return <p className="py-16 text-center text-sm text-neutral-500">Checking reschedule options...</p>;
  }

  return (
    <SalonClient
      slug={slug}
      initialSalon={initialSalon}
      rescheduleContext={rescheduleContext}
    />
  );
}
