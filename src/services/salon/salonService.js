export async function fetchSalonBySlug(slug) {
  const response = await fetch(`/api/salons/${slug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "get",
      access_type: "laravelApp",
      data: {},
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load salon");
  }

  return data;
}

export async function fetchSalonProfessionals(slug, { date, service_uuid }) {
  const response = await fetch(`/api/salons/${slug}/professionals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "get",
      access_type: "laravelApp",
      data: {
        date,
        service_uuid,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load professionals");
  }

  return {
    ...data,
    professionals: data?.professionals?.data ?? data?.professionals ?? [],
  };
}

export async function fetchSalonTimeSlots(slug, { date, service_uuid, employee_uuid }) {
  const response = await fetch(`/api/salons/${slug}/time-slots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "get",
      access_type: "laravelApp",
      data: {
        date,
        service_uuid,
        employee_uuid,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load time slots");
  }

  return data;
}

export async function fetchSalonAvailabilityByDateRange(slug, { start_date, end_date, service_uuid }) {
  const response = await fetch(`/api/salons/${slug}/availability-range`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "get",
      access_type: "laravelApp",
      data: {
        start_date,
        end_date,
        service_uuid,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load availability range");
  }

  // Response format: { "2026-04-01": { available: true, professionals: [...] }, ... }
  return data;
}

export async function createSalonAppointment(slug, payload) {
  // Use a dedicated appointments proxy so the client can't supply arbitrary URLs
  const response = await fetch("/api/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      slug,
      data: payload,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to create appointment");
  }

  return data;
}

export async function validateSalonVoucher(slug, { code, service_uuid }) {
  const response = await fetch("/api/vouchers/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      slug,
      code,
      service_uuid,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to validate voucher");
  }

  return data;
}
