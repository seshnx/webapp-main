// src/hooks/useSafeZoneVerification.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../config/supabase';
import { 
    SAFE_ZONE_RADIUS_METERS, 
    PROXIMITY_THRESHOLD_METERS,
    SAFE_ZONE_TYPES 
} from '../config/constants';

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @returns Distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

/**
 * Hook for managing safe zone verification during high-value exchanges
 */
export function useSafeZoneVerification(transactionId, userId) {
    const [currentPosition, setCurrentPosition] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [isInSafeZone, setIsInSafeZone] = useState(false);
    const [nearestSafeZone, setNearestSafeZone] = useState(null);
    const [safeZones, setSafeZones] = useState([]);
    const [otherPartyPosition, setOtherPartyPosition] = useState(null);
    const [proximityToOther, setProximityToOther] = useState(null);
    const [isWithinProximity, setIsWithinProximity] = useState(false);
    const [loading, setLoading] = useState(true);
    const [watchId, setWatchId] = useState(null);

    const lastPositionUpdate = useRef(Date.now());

    // Load safe zones from database
    useEffect(() => {
        const loadSafeZones = async () => {
            if (!supabase) return;
            
            try {
                const { data, error } = await supabase
                    .from('safe_zones')
                    .select('*');

                if (error) throw error;
                
                setSafeZones((data || []).map(zone => ({
                    id: zone.id,
                    name: zone.name,
                    address: zone.address,
                    lat: zone.lat,
                    lng: zone.lng,
                    type: zone.type,
                    typeLabel: zone.type_label,
                    priority: zone.priority,
                    verified: zone.verified
                })));
            } catch (error) {
                console.error('Failed to load safe zones:', error);
            }
        };

        loadSafeZones();
    }, []);

    // Start watching GPS position
    const startWatching = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
        };

        const handleSuccess = (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            
            setCurrentPosition({
                lat: latitude,
                lng: longitude,
                accuracy,
                timestamp: Date.now()
            });
            setLocationError(null);
            setLoading(false);
            lastPositionUpdate.current = Date.now();
        };

        const handleError = (error) => {
            let message;
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Location permission denied. Please enable location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    message = 'Location request timed out.';
                    break;
                default:
                    message = 'An unknown error occurred getting location.';
            }
            setLocationError(message);
            setLoading(false);
        };

        // Start continuous watching
        const id = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
        setWatchId(id);

        return () => {
            if (id) {
                navigator.geolocation.clearWatch(id);
            }
        };
    }, []);

    // Stop watching GPS
    const stopWatching = useCallback(() => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
    }, [watchId]);

    // Check if current position is within a safe zone
    useEffect(() => {
        if (!currentPosition || safeZones.length === 0) {
            setIsInSafeZone(false);
            return;
        }

        let nearest = null;
        let nearestDistance = Infinity;
        let inZone = false;

        for (const zone of safeZones) {
            if (!zone.lat || !zone.lng) continue;

            const distance = calculateDistance(
                currentPosition.lat,
                currentPosition.lng,
                zone.lat,
                zone.lng
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = { ...zone, distance };
            }

            if (distance <= SAFE_ZONE_RADIUS_METERS) {
                inZone = true;
            }
        }

        setNearestSafeZone(nearest);
        setIsInSafeZone(inZone);
    }, [currentPosition, safeZones]);

    // Check proximity to other party
    useEffect(() => {
        if (!currentPosition || !otherPartyPosition) {
            setProximityToOther(null);
            setIsWithinProximity(false);
            return;
        }

        const distance = calculateDistance(
            currentPosition.lat,
            currentPosition.lng,
            otherPartyPosition.lat,
            otherPartyPosition.lng
        );

        setProximityToOther(distance);
        setIsWithinProximity(distance <= PROXIMITY_THRESHOLD_METERS);
    }, [currentPosition, otherPartyPosition]);

    // Update other party's position (called from transaction listener)
    const updateOtherPartyPosition = useCallback((position) => {
        setOtherPartyPosition(position);
    }, []);

    // Find nearby safe zones using Google Places API or similar
    const findNearbySafeZones = useCallback(async () => {
        if (!currentPosition) return [];

        try {
            // Query OpenStreetMap Nominatim for nearby police stations and public buildings
            const types = ['police', 'fire_station', 'bank', 'library', 'townhall'];
            const results = [];

            for (const type of types) {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?` +
                        `q=${type}&` +
                        `format=json&` +
                        `lat=${currentPosition.lat}&` +
                        `lon=${currentPosition.lng}&` +
                        `bounded=1&` +
                        `viewbox=${currentPosition.lng - 0.1},${currentPosition.lat + 0.1},${currentPosition.lng + 0.1},${currentPosition.lat - 0.1}&` +
                        `limit=5`,
                        { headers: { 'User-Agent': 'SeshNx-SafeExchange/1.0' } }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        for (const place of data) {
                            const distance = calculateDistance(
                                currentPosition.lat,
                                currentPosition.lng,
                                parseFloat(place.lat),
                                parseFloat(place.lon)
                            );

                            const zoneType = SAFE_ZONE_TYPES.find(z => 
                                type.includes(z.id.split('_')[0])
                            );

                            results.push({
                                id: `osm_${place.place_id}`,
                                name: place.display_name.split(',')[0],
                                address: place.display_name,
                                lat: parseFloat(place.lat),
                                lng: parseFloat(place.lon),
                                distance,
                                type: zoneType?.id || 'public_building',
                                typeLabel: zoneType?.label || 'Public Building',
                                priority: zoneType?.priority || 10
                            });
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to fetch ${type}:`, e);
                }
            }

            // Sort by priority and distance
            results.sort((a, b) => {
                if (a.priority !== b.priority) return a.priority - b.priority;
                return a.distance - b.distance;
            });

            return results.slice(0, 10);
        } catch (error) {
            console.error('Failed to find nearby safe zones:', error);
            return [];
        }
    }, [currentPosition]);

    // Create a new safe zone (admin function)
    const createSafeZone = useCallback(async (zoneData) => {
        if (!supabase) {
            throw new Error('Supabase not configured');
        }

        try {
            const { data, error } = await supabase
                .from('safe_zones')
                .insert({
                    name: zoneData.name,
                    address: zoneData.address,
                    lat: zoneData.lat,
                    lng: zoneData.lng,
                    type: zoneData.type,
                    type_label: zoneData.typeLabel,
                    priority: zoneData.priority || 10,
                    verified: false
                })
                .select('id')
                .single();

            if (error) throw error;
            return data.id;
        } catch (error) {
            console.error('Failed to create safe zone:', error);
            throw error;
        }
    }, []);

    // Verify arrival at safe zone
    const verifyArrival = useCallback(() => {
        if (!currentPosition || !nearestSafeZone) {
            return {
                verified: false,
                message: 'Unable to verify location'
            };
        }

        if (isInSafeZone) {
            return {
                verified: true,
                zone: nearestSafeZone,
                message: `Arrived at ${nearestSafeZone.name}`,
                timestamp: Date.now()
            };
        }

        return {
            verified: false,
            message: `Not within safe zone. ${Math.round(nearestSafeZone.distance)}m from ${nearestSafeZone.name}`,
            nearestZone: nearestSafeZone
        };
    }, [currentPosition, nearestSafeZone, isInSafeZone]);

    // Verify both parties are at the same location
    const verifyProximity = useCallback(() => {
        if (!currentPosition || !otherPartyPosition) {
            return {
                verified: false,
                message: 'Unable to verify proximity - waiting for other party location'
            };
        }

        if (isWithinProximity) {
            return {
                verified: true,
                distance: proximityToOther,
                message: `Both parties are within ${PROXIMITY_THRESHOLD_METERS}m`,
                timestamp: Date.now()
            };
        }

        return {
            verified: false,
            distance: proximityToOther,
            message: `Other party is ${Math.round(proximityToOther)}m away. Must be within ${PROXIMITY_THRESHOLD_METERS}m to proceed.`
        };
    }, [currentPosition, otherPartyPosition, isWithinProximity, proximityToOther]);

    return {
        // State
        currentPosition,
        locationError,
        loading,
        isInSafeZone,
        nearestSafeZone,
        safeZones,
        otherPartyPosition,
        proximityToOther,
        isWithinProximity,

        // Actions
        startWatching,
        stopWatching,
        findNearbySafeZones,
        createSafeZone,
        updateOtherPartyPosition,
        verifyArrival,
        verifyProximity,

        // Utils
        calculateDistance
    };
}

export default useSafeZoneVerification;
