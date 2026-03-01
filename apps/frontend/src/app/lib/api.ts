/**
 * Shared API helpers: base URL and authenticated fetch.
 */
const getBaseUrl = () =>
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function getApiUrl(path: string): string {
  const base = getBaseUrl().replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/** Backend origin (no /api) for media URLs. */
function getBackendOrigin(): string {
  const base = getBaseUrl().replace(/\/$/, '');
  return base.replace(/\/api\/?$/, '') || 'http://localhost:8000';
}

/**
 * Resolve a listing/media image URL. Backend media paths (e.g. /media/listings/...)
 * are relative to the API server; prepend backend origin so the image loads.
 * Frontend paths (e.g. /luxury-one.webp) and full URLs are returned unchanged.
 */
export function getMediaUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/media/')) return `${getBackendOrigin()}${url}`;
  return url;
}

/** Prefer access_token; fallback to accessToken for compatibility */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || localStorage.getItem('accessToken');
}

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ data?: T; ok: boolean; status: number; error?: string }> {
  const url = getApiUrl(path);
  const headers = { ...getAuthHeaders(), ...(options.headers as Record<string, string>) };
  try {
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    let data: T | undefined;
    if (text) {
      try {
        data = JSON.parse(text) as T;
      } catch {
        data = text as unknown as T;
      }
    }
    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('accessToken');
      }
      const err =
        data && typeof data === 'object' && data !== null && 'error' in data
          ? (data as { error?: { message?: string } }).error?.message
          : res.statusText;
      return { ok: false, status: res.status, data, error: err || res.statusText };
    }
    return { data, ok: true, status: res.status };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: e instanceof Error ? e.message : 'Network error',
    };
  }
}

/** Map FilterBar / UI property type label to API property_type value */
export function mapPropertyTypeToApi(value: string): string {
  const map: Record<string, string> = {
    Bedsitter: 'bedsitter',
    Singles: 'singles',
    Apartment: 'apartment',
    House: 'house',
    Condo: 'condo',
    Townhouse: 'townhouse',
    Land: 'land',
  };
  return map[value] || value.toLowerCase();
}

/** Parse price range "1000-2000" or "3000+" */
export function parsePriceRange(
  priceRange: string
): { min_price?: number; max_price?: number } {
  if (!priceRange) return {};
  if (priceRange === '3000+') return { min_price: 3000 };
  const [min, max] = priceRange.split('-').map((s) => parseInt(s, 10));
  if (!isNaN(min) && !isNaN(max)) return { min_price: min, max_price: max };
  return {};
}
