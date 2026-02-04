"use client";

import { MapContainer, TileLayer, Marker, Circle, CircleMarker, useMapEvents, useMap, Tooltip, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GeoZone } from "@/types/policy";
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

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

// Component to programmatically update map center and bounds
function MapController({ center, zones }: { center: [number, number], zones: GeoZone[] }) {
    const map = useMap();

    // Add Zoom Control to Bottom Left
    useEffect(() => {
        const zoomControl = L.control.zoom({ position: 'bottomleft' });
        zoomControl.addTo(map);
        return () => {
            zoomControl.remove();
        };
    }, [map]);

    // Handle Center Updates (Search/Locate Me)
    useEffect(() => {
        map.flyTo(center, 13);
    }, [center, map]);

    // Handle Bounds Updates (Show all zones)
    useEffect(() => {
        if (zones.length > 0) {
            const bounds = L.latLngBounds(zones.map(z => [z.latitude, z.longitude]));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [zones, map]);

    return null;
}

export default function AttendanceMap({ center, zones, onLocationSelect, selectedLocation, userLocation }: AttendanceMapProps & { selectedLocation?: { lat: number; lng: number } | null, userLocation?: { lat: number; lng: number } | null, onLocationSelect: (lat: number, lng: number) => void }) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = resolvedTheme === 'dark';
    const tileUrl = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attribution = isDark
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    if (!mounted) {
        return <div style={{ height: '100%', width: '100%', backgroundColor: 'hsl(var(--muted))' }} />;
    }

    return (
        <MapContainer
            center={center}
            zoom={13}
            zoomControl={false}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
            <TileLayer
                attribution={attribution}
                url={tileUrl}
            />
            <MapController center={center} zones={zones} />
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
                    <Circle
                        center={[zone.latitude, zone.longitude]}
                        radius={zone.radius}
                        pathOptions={{
                            color: 'blue',
                            fillColor: 'blue',
                            fillOpacity: 0.2,
                            weight: 1.5
                        }}
                    >
                        <Tooltip
                            permanent
                            direction="top"
                            offset={[0, -5]}
                            className="zone-label-tooltip"
                        >
                            {zone.name}
                        </Tooltip>
                    </Circle>
                </div>
            ))}
        </MapContainer>
    );
}
