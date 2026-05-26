export async function saveSalon(venueUuid) {
  const response = await fetch(`/api/saved-salons/${venueUuid}`, {
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
    throw new Error(data?.message || 'Failed to save salon');
  }

  return data;
}

export async function unsaveSalon(venueUuid) {
  const response = await fetch(`/api/saved-salons/${venueUuid}`, {
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
    throw new Error(data?.message || 'Failed to remove saved salon');
  }

  return data;
}