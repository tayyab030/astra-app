import * as Location from 'expo-location';

export type DeviceLocationPayload = {
  label: string;
  latitude: number;
  longitude: number;
};

function formatAddress(place: Location.LocationGeocodedAddress): string | null {
  const city = place.city || place.subregion || place.district || place.name;
  const region = place.region;
  const country = place.country;

  const parts = [city, region, country].filter(
    (part, index, arr): part is string =>
      Boolean(part) && arr.indexOf(part) === index,
  );

  if (parts.length === 0) return null;
  return parts.join(', ');
}

function formatCoords(latitude: number, longitude: number) {
  return `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
}

/**
 * Reads device GPS for the dashboard location row.
 * Returns null when permission is denied or location cannot be read.
 */
export async function getDeviceLocationPayload(): Promise<DeviceLocationPayload | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = position.coords;
    let label = formatCoords(latitude, longitude);

    try {
      const places = await Location.reverseGeocodeAsync({ latitude, longitude });
      const formatted = places[0] ? formatAddress(places[0]) : null;
      if (formatted) label = formatted;
    } catch {
      // Keep coordinates if reverse geocoding is unavailable.
    }

    return { label, latitude, longitude };
  } catch {
    return null;
  }
}
