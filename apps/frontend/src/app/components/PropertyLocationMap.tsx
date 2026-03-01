'use client';

import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { geocode, type LatLng } from '@/app/lib/map';

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

const DEFAULT_CENTER: [number, number] = [-1.2921, 36.8219];
const DEFAULT_ZOOM = 12;

function CenterToMarker({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 14);
  }, [map, position]);
  return null;
}

export interface PropertyLocationMapProps {
  /** Use when API provides coordinates */
  latitude?: number | null;
  longitude?: number | null;
  /** Use when no lat/lng; will geocode to show marker */
  address?: string | null;
  /** Label in popup */
  title?: string;
  height?: string;
  className?: string;
}

export default function PropertyLocationMap({
  latitude,
  longitude,
  address,
  title = 'Property location',
  height = '280px',
  className = '',
}: PropertyLocationMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    if (latitude != null && longitude != null && !isNaN(latitude) && !isNaN(longitude)) {
      setPosition([latitude, longitude]);
      setLoading(false);
      return;
    }
    if (address?.trim()) {
      setLoading(true);
      geocode(address.trim())
        .then((result) => {
          if (!cancelled && result) setPosition([result.lat, result.lng]);
          else if (!cancelled) setError('Location not found');
        })
        .catch(() => {
          if (!cancelled) setError('Could not load map');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => { cancelled = true; };
    }
    setLoading(false);
    setPosition(null);
  }, [latitude, longitude, address]);

  if (loading) {
    return (
      <div
        className={`rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <p className="text-gray-500 text-sm">Loading map...</p>
      </div>
    );
  }

  if (error || !position) {
    return (
      <div
        className={`rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <p className="text-gray-500 text-sm">{error || 'No location available'}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-200 ${className}`} style={{ height }}>
      <MapContainer
        center={position}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <CenterToMarker position={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
