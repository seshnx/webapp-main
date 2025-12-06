import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to update map view when markers change
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function StudioMap({ 
    locations = [], 
    center = [34.0522, -118.2437], 
    zoom = 10, 
    height = "400px",
    drawRadius = false,
    radiusMiles = 0 
}) {
  const visibleLocations = locations.filter(loc => 
    loc.lat && loc.lng && (!loc.hideAddress || loc.forceReveal)
  );

  const radiusMeters = radiusMiles * 1609.34;

  return (
    // Added z-0 relative to ensure new stacking context, lower than sidebar
    <div className="rounded-xl overflow-hidden shadow-inner border dark:border-gray-700 relative z-0" style={{ height, width: '100%' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={zoom} />
        
        {drawRadius && radiusMiles > 0 && (
             <Circle
                center={center}
                pathOptions={{ fillColor: '#3D84ED', color: '#3D84ED', fillOpacity: 0.2 }}
                radius={radiusMeters}
             />
        )}
        
        {visibleLocations.map(loc => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>
              <div className="text-sm">
                <strong className="block mb-1">{loc.name}</strong>
                <span className="text-xs text-gray-500">{loc.address || "Location Hidden"}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
