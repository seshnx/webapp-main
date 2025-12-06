import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

/**
 * Fetches location data for a US Zip Code using Zippopotam.us
 * @param {string} zip - 5-digit US Zip Code
 * @returns {Promise<{lat: number, lng: number, name: string, state: string, cityState: string}|null>}
 */
export const fetchZipLocation = async (zip) => {
  if (!zip || zip.length < 5) return null;

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!response.ok) return null;

    const data = await response.json();
    const place = data.places[0];

    return {
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude),
      name: place['place name'],
      state: place['state abbreviation'],
      cityState: `${place['place name']}, ${place['state abbreviation']}`
    };
  } catch (error) {
    console.warn("Geocoding failed:", error);
    return null;
  }
};

/**
 * Converts Latitude and Longitude into a readable address (City, State, Zip)
 * Uses OpenStreetMap Nominatim API (No Key Required for low volume)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{city: string, state: string, zip: string, displayName: string}|null>}
 */
export const reverseGeocode = async (lat, lng) => {
  if (!lat || !lng) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    
    if (!response.ok) return null;

    const data = await response.json();
    const address = data.address;

    // Nominatim address fields can vary, so we try fallback keys
    const city = address.city || address.town || address.village || address.hamlet || "Unknown Location";
    const state = address.state || "";
    const zip = address.postcode || "";
    
    return {
      city,
      state,
      zip,
      displayName: `${city}, ${state} ${zip}`.trim()
    };
  } catch (error) {
    console.warn("Reverse geocoding failed:", error);
    return null;
  }
};

/**
 * Queries Firestore for the number of users in the wider region (Zip Prefix)
 * This simulates a "25 mile radius" heatmap without expensive geospatial math.
 * @param {string} zip - The 5-digit Zip Code to check
 * @returns {Promise<{count: number, density: string, label: string}>}
 */
export const fetchRegionalUserCount = async (zip) => {
  // If zip is incomplete, return a neutral "Scanning" state
  if (!zip || zip.length < 3) return { count: 0, density: '#6B7280', label: 'Scanning...' };

  try {
    // 1. Use the first 3 digits to define the "Region" (approx 20-50 miles)
    const regionPrefix = zip.substring(0, 3);
    const endPrefix = regionPrefix + '\uf8ff'; // Unicode trick for "starts with" query in Firestore

    const profilesRef = collection(db, 'artifacts', appId, 'public', 'data', 'profiles');
    
    // Query: Zip starts with "902..."
    const q = query(
        profilesRef, 
        where("zip", ">=", regionPrefix),
        where("zip", "<=", endPrefix)
    );
    
    const snapshot = await getCountFromServer(q);
    const count = snapshot.data().count;

    // 2. Determine Density Color based on regional count
    let color = '#3D84ED'; // Blue (Quiet)
    let label = 'Quiet Area';
    
    if (count > 25) { color = '#10B981'; label = 'Active Area'; } // Green
    if (count > 100) { color = '#F59E0B'; label = 'Buzzing'; }    // Orange
    if (count > 500) { color = '#EF4444'; label = 'Hotspot'; }    // Red

    return { count, density: color, label };

  } catch (error) {
    console.warn("Regional stats failed:", error);
    // Return 0 count but "Unknown" status so the UI doesn't break
    return { count: 0, density: '#9CA3AF', label: 'Unknown Region' };
  }
};

/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};
