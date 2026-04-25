/**
 * Extract location coordinates and address from Google Place
 * Used for location-based venue search
 */
export async function extractLocationFromPlace(place) {
  const location = {
    lat: place.location.lat(),
    lon: place.location.lng(),
    address: place.formattedAddress,
    placeId: place.id ?? null,
  };

  // Extract postal code if available
  if (place.addressComponents) {
    place.addressComponents.forEach((comp) => {
      if (comp.types.includes('postal_code')) {
        location.postcode = comp.longText;
      }
      if (comp.types.includes('country')) {
        location.country = comp.shortText;
      }
    });
  }

  return location;
}

/**
 * Format location display text
 */
export function formatLocationDisplay(location) {
  if (!location) return '';
  return location.address || '';
}
