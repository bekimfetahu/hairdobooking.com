export async function fetchSalonBySlug(slug) {
  const response = await fetch("/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "get",
      access_type: "laravelApp",
      url: `client/salons/${slug}`,
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
  const response = await fetch("/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "get",
      access_type: "laravelApp",
      url: `client/salons/${slug}/professionals`,
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
  const response = await fetch("/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "get",
      access_type: "laravelApp",
      url: `client/salons/${slug}/time-slots`,
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

export async function createSalonAppointment(slug, payload) {
  const response = await fetch("/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "post",
      access_type: "laravelApi",
      url: `client/salons/${slug}/appointments`,
      data: payload,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to create appointment");
  }

  return data;
}
