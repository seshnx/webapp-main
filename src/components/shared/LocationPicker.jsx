import React, { useState, useEffect } from 'react';
import { MapPin, Crosshair, Loader2 } from 'lucide-react';
import { fetchZipLocation } from '../../utils/geocode';

export default function LocationPicker({ 
    initialZip = '', 
    onLocationChange, 
    showMap = false, // Optional: Show mini-map or just inputs
    label = "Location"
}) {
    const [zip, setZip] = useState(initialZip);
    const [locationName, setLocationName] = useState('');
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState(null);

    // Sync internal state if prop changes
    useEffect(() => {
        if (initialZip && initialZip !== zip) {
            setZip(initialZip);
            handleZipChange(initialZip);
        }
    }, [initialZip]);

    const handleZipChange = async (val) => {
        const cleanZip = val.replace(/\D/g, '').slice(0, 5);
        setZip(cleanZip);

        if (cleanZip.length === 5) {
            setLoading(true);
            const loc = await fetchZipLocation(cleanZip);
            if (loc) {
                setLocationName(loc.cityState);
                setCoords({ lat: loc.lat, lng: loc.lng });
                onLocationChange({ zip: cleanZip, ...loc });
            } else {
                setLocationName('Unknown Location');
                onLocationChange({ zip: cleanZip, valid: false });
            }
            setLoading(false);
        } else {
            setLocationName('');
        }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) return alert("Geolocation not supported");
        
        setLoading(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
                // Reverse Geocode to get Zip
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                const foundZip = data.address.postcode;
                
                if (foundZip) {
                    const cleanZip = foundZip.split('-')[0]; // Handle 90210-1234 format
                    setZip(cleanZip);
                    // Trigger the standard lookup with the found zip to standardize data flow
                    handleZipChange(cleanZip); 
                } else {
                    // Fallback if no zip found but coords are valid
                    setCoords({ lat: latitude, lng: longitude });
                    setLocationName("Current Location");
                    onLocationChange({ lat: latitude, lng: longitude, name: "Current Location", valid: true });
                }
            } catch (e) {
                console.error(e);
                alert("Failed to determine location.");
            }
            setLoading(false);
        }, (err) => {
            console.warn(err);
            alert("Location access denied.");
            setLoading(false);
        });
    };

    return (
        <div className="w-full">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{label}</label>
            <div className="relative flex gap-2">
                <div className="relative flex-1">
                    <input 
                        className="w-full pl-9 p-2.5 bg-white dark:bg-[#1f2128] border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none dark:text-white transition-all text-sm" 
                        placeholder="Zip Code" 
                        maxLength={5} 
                        value={zip} 
                        onChange={e => handleZipChange(e.target.value)} 
                    />
                    <MapPin className={`absolute left-3 top-3 text-gray-400 ${loading ? 'animate-pulse' : ''}`} size={16} />
                </div>
                <button 
                    onClick={handleUseCurrentLocation}
                    disabled={loading}
                    className="p-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-brand-blue transition-colors"
                    title="Use my location"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Crosshair size={18} />}
                </button>
            </div>
            {locationName && (
                <div className="mt-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 animate-in fade-in">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {locationName}
                </div>
            )}
        </div>
    );
}
