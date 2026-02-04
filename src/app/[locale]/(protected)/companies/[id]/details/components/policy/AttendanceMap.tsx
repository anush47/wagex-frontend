"use client";

import { MapContainer, TileLayer, Marker, Circle, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GeoZone } from "@/types/policy";
import { useEffect } from 'react';

// Fix Leaflet default icon issue
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface AttendanceMapProps {
    center: [number, number];
    zones: GeoZone[];
    onLocationSelect: (lat: number, lng: number) => void;
}

function MapClickHandler({ onAddZone }: { onAddZone: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onAddZone(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Component to programmatically update map center
function MapController({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 13);
    }, [center, map]);
    return null;
}

export default function AttendanceMap({ center, zones, onLocationSelect, selectedLocation, userLocation }: AttendanceMapProps & { selectedLocation?: { lat: number; lng: number } | null, userLocation?: { lat: number; lng: number } | null, onLocationSelect: (lat: number, lng: number) => void }) {
    // Force re-render if center changes dramatically to prevent valid-but-stuck map states, 
    // although MapController handles flying. 
    // The key here ensures we get a fresh map instance if something major changes.
    // However, usually we want to keep the same map instance. 
    // We add an ID to the container to help Leaflet find it.

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            id="attendance-map-container"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={center} />
            <MapClickHandler onAddZone={onLocationSelect} />

            {/* User Location (Dot) - Reference only */}
            {userLocation && (
                <CircleMarker
                    center={[userLocation.lat, userLocation.lng]}
                    radius={8}
                    pathOptions={{ color: 'white', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }}
                >
                    <Circle
                        center={[userLocation.lat, userLocation.lng]}
                        radius={50}
                        pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 0 }}
                    />
                </CircleMarker>
            )}

            {/* Selected Location (Pin) - Target for adding */}
            {selectedLocation && (
                <Marker
                    position={[selectedLocation.lat, selectedLocation.lng]}
                    opacity={0.8}
                />
            )}

            {zones.map((zone) => (
                <div key={zone.id}>
                    <Marker position={[zone.latitude, zone.longitude]} />
                    <Circle
                        center={[zone.latitude, zone.longitude]}
                        radius={zone.radius}
                        pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
                    />
                </div>
            ))}
        </MapContainer>
    );
}
