/**
 * Map utilities: geocoding (Nominatim) and routing (OSRM).
 * No API keys required for basic usage.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const OSRM_BASE = 'https://router.project-osrm.org';

/** Nominatim requires a User-Agent. Use a generic app name. */
const USER_AGENT = 'KejaPropertyApp/1.0';

/**
 * Geocode an address to coordinates using OpenStreetMap Nominatim.
 */
export async function geocode(address: string): Promise<GeocodeResult | null> {
  if (!address?.trim()) return null;
  const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(address.trim())}&limit=1`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const item = data[0];
  return {
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    displayName: item.display_name || address,
  };
}

/**
 * Get a driving route between two points using OSRM.
 * Returns an array of [lng, lat] for the route geometry (GeoJSON line format).
 */
export async function getRoute(from: LatLng, to: LatLng): Promise<[number, number][] | null> {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = `${OSRM_BASE}/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes?.[0]?.geometry?.coordinates) return null;
  return data.routes[0].geometry.coordinates;
}
