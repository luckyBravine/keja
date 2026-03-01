'use client';

import React, { useState, useEffect, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { geocode, getRoute, type LatLng } from '@/app/lib/map';

// Fix default marker icon in Next.js (webpack doesn't resolve leaflet images)
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

const DEFAULT_CENTER: [number, number] = [-1.2921, 36.8219]; // Nairobi
const DEFAULT_ZOOM = 10;

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [map, points]);
  return null;
}

export interface MapWithDirectionsProps {
  origin: string;
  destination: string;
  onOriginChange?: (value: string) => void;
  onDestinationChange?: (value: string) => void;
  onGetDirections?: (origin: string, destination: string) => void;
  /** Initial map height (default 400px) */
  height?: string;
  /** Show the origin/destination form above the map */
  showForm?: boolean;
}

export default function MapWithDirections({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onGetDirections,
  height = '400px',
  showForm = true,
}: MapWithDirectionsProps) {
  const [originCoords, setOriginCoords] = useState<LatLng | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<LatLng | null>(null);
  const [routePoints, setRoutePoints] = useState<[number, number][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fitPoints, setFitPoints] = useState<LatLng[]>([]);

  const handleGetDirections = useCallback(async () => {
    if (!origin.trim() || !destination.trim()) {
      setError('Please enter both origin and destination.');
      return;
    }
    setLoading(true);
    setError(null);
    setRoutePoints(null);
    setOriginCoords(null);
    setDestinationCoords(null);
    setFitPoints([]);
    try {
      const [fromResult, toResult] = await Promise.all([
        geocode(origin),
        geocode(destination),
      ]);
      if (!fromResult) {
        setError(`Could not find location: "${origin}"`);
        setLoading(false);
        return;
      }
      if (!toResult) {
        setError(`Could not find location: "${destination}"`);
        setLoading(false);
        return;
      }
      setOriginCoords(fromResult);
      setDestinationCoords(toResult);
      const route = await getRoute(fromResult, toResult);
      if (route && route.length > 0) {
        setRoutePoints(route);
        setFitPoints([fromResult, toResult]);
      } else {
        setFitPoints([fromResult, toResult]);
      }
      onGetDirections?.(origin, destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get directions.');
    } finally {
      setLoading(false);
    }
  }, [origin, destination, onGetDirections]);

  const polylinePositions: [number, number][] = routePoints
    ? routePoints.map(([lng, lat]) => [lat, lng] as [number, number])
    : [];

  return (
    <div className="space-y-4">
      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGetDirections();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your location (origin)</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => onOriginChange?.(e.target.value)}
              placeholder="E.g. Your office, Nairobi"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination (property or address)</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => onDestinationChange?.(e.target.value)}
              placeholder="E.g. 123 Main St, Nairobi"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Getting directions...
                </>
              ) : (
                <>
                  <span className="text-lg">🔄</span>
                  Get Directions
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100" style={{ height }}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {fitPoints.length >= 2 && <FitBounds points={fitPoints} />}
          {originCoords && (
            <Marker position={[originCoords.lat, originCoords.lng]}>
              <Popup>Origin: {origin || 'Start'}</Popup>
            </Marker>
          )}
          {destinationCoords && (
            <Marker position={[destinationCoords.lat, destinationCoords.lng]}>
              <Popup>Destination: {destination || 'End'}</Popup>
            </Marker>
          )}
          {polylinePositions.length > 0 && (
            <Polyline positions={polylinePositions} color="#2563eb" weight={4} opacity={0.8} />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
