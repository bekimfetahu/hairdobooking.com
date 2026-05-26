export async function likeSalon(venueUuid) {
  const response = await fetch(`/api/liked-salons/${venueUuid}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      method: 'post',
      access_type: 'laravelApi',
      data: {},
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Failed to like salon');
  }

  return data;
}

export async function unlikeSalon(venueUuid) {
  const response = await fetch(`/api/liked-salons/${venueUuid}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      method: 'delete',
      access_type: 'laravelApi',
      data: {},
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Failed to remove like');
  }

  return data;
}