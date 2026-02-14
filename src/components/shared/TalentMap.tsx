import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L, { Icon, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Navigation2 } from 'lucide-react';

// Fix for default marker icons in Leaflet with React - using URL imports for Vite
const markerIcon = L.icon({
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = markerIcon;

interface Location {
    lat: number;
    lng: number;
}

interface MapItem {
    id: string;
    name: string;
    location?: Location;
    avatar?: string;
    type?: string;
    budget?: number;
    [key: string]: any;
}

interface TalentMapProps {
    items: MapItem[];
    userLocation?: Location | null;
    onLocationSelect?: (location: Location) => void;
    onItemClick?: (item: MapItem) => void;
    radius?: number; // in miles
    center?: Location;
    itemType?: 'talent' | 'booking';
}

// Custom marker icon
const createCustomIcon = (color: string = '#3D84ED') => divIcon({
    className: 'custom-marker',
    html: `<div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
    ">
        <div style="
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
        "></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

function MapClickHandler({ onLocationSelect }: { onLocationSelect?: (location: Location) => void }) {
    useMapEvents({
        click(e) {
            if (onLocationSelect) {
                onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
            }
        },
    });
    return null;
}

function RadiusCircle({ center, radius }: { center: Location; radius: number }) {
    const map = useMapEvents({});
    const [circle, setCircle] = useState<L.Circle | null>(null);

    React.useEffect(() => {
        if (map && center && radius > 0 && radius < 5000) {
            if (circle) {
                map.removeLayer(circle);
            }
            const newCircle = L.circle(center, {
                radius: radius * 1609.34, // Convert miles to meters
                color: '#3D84ED',
                fillColor: '#3D84ED',
                fillOpacity: 0.1,
                weight: 2,
            }).addTo(map);
            setCircle(newCircle);
        }
        return () => {
            if (circle) {
                map.removeLayer(circle);
            }
        };
    }, [map, center, radius]);

    return null;
}

export default function TalentMap({
    items,
    userLocation,
    onLocationSelect,
    onItemClick,
    radius = 50,
    center,
    itemType = 'talent'
}: TalentMapProps) {
    // Default center: if user location exists, use it, otherwise use US center
    const mapCenter = center || userLocation || { lat: 39.8283, lng: -98.5795 };

    // Filter items with valid locations
    const validItems = useMemo(() => {
        return items.filter(item =>
            item.location &&
            typeof item.location.lat === 'number' &&
            typeof item.location.lng === 'number'
        );
    }, [items]);

    return (
        <div className="w-full h-full min-h-[500px] relative">
            <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={userLocation ? 10 : 4}
                className="w-full h-full rounded-xl z-0"
                style={{ height: '100%', minHeight: '500px' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler onLocationSelect={onLocationSelect} />

                {/* Radius circle when filtering by location */}
                {userLocation && radius && radius < 5000 && (
                    <RadiusCircle center={userLocation} radius={radius} />
                )}

                {/* User location marker */}
                {userLocation && (
                    <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={createCustomIcon('#22c55e')}
                    >
                        <Popup>
                            <div className="text-center p-2">
                                <div className="font-semibold text-sm">Your Location</div>
                                {radius > 0 && radius < 5000 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        Search radius: {radius} miles
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Item markers */}
                {validItems.map((item) => (
                    <Marker
                        key={item.id}
                        position={[item.location!.lat, item.location!.lng]}
                        icon={createCustomIcon(itemType === 'booking' ? '#f59e0b' : '#3D84ED')}
                        eventHandlers={{
                            click: () => {
                                if (onItemClick) {
                                    onItemClick(item);
                                }
                            },
                        }}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <div className="font-semibold text-sm mb-1">{item.name}</div>
                                {item.type && (
                                    <div className="text-xs text-gray-500 mb-1">{item.type}</div>
                                )}
                                {item.budget && (
                                    <div className="text-xs font-medium text-green-600">
                                        ${item.budget}
                                    </div>
                                )}
                                <button
                                    onClick={() => onItemClick?.(item)}
                                    className="mt-2 w-full bg-brand-blue text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-600 transition"
                                >
                                    {itemType === 'booking' ? 'View Details' : 'View Profile'}
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-[#2c2e36] p-3 rounded-lg shadow-lg border dark:border-gray-700 z-[1000]">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Legend</div>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: '#22c55e' }}
                        ></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Your Location</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: itemType === 'booking' ? '#f59e0b' : '#3D84ED' }}
                        ></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            {itemType === 'booking' ? 'Bookings' : 'Talent'}
                        </span>
                    </div>
                    {radius > 0 && radius < 5000 && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border-2 border-brand-blue bg-blue-100 dark:bg-blue-900"></div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">Search Radius ({radius} mi)</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
