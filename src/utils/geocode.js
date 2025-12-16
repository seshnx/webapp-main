import { supabase } from '../config/supabase';

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
 * Queries Supabase for the number of users in the wider region (Zip Prefix)
 * This simulates a "25 mile radius" heatmap without expensive geospatial math.
 * @param {string} zip - The 5-digit Zip Code to check
 * @returns {Promise<{count: number, density: string, label: string}>}
 */
export const fetchRegionalUserCount = async (zip) => {
  // If zip is incomplete, return a neutral "Scanning" state
  if (!zip || zip.length < 3) return { count: 0, density: '#6B7280', label: 'Scanning...' };

  if (!supabase) {
    return { count: 0, density: '#9CA3AF', label: 'Unknown Region' };
  }

  try {
    // 1. Use the first 3 digits to define the "Region" (approx 20-50 miles)
    const regionPrefix = zip.substring(0, 3);
    
    // Query: Zip starts with "902..." using Supabase pattern matching
    const { count, error } = await supabase
      .from('public_profiles')
      .select('*', { count: 'exact', head: true })
      .like('zip_code', `${regionPrefix}%`);

    if (error) throw error;

    const userCount = count || 0;

    // 2. Determine Density Color based on regional count
    let color = '#3D84ED'; // Blue (Quiet)
    let label = 'Quiet Area';
    
    if (userCount > 25) { color = '#10B981'; label = 'Active Area'; } // Green
    if (userCount > 100) { color = '#F59E0B'; label = 'Buzzing'; }    // Orange
    if (userCount > 500) { color = '#EF4444'; label = 'Hotspot'; }    // Red

    return { count: userCount, density: color, label };

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

/**
 * Search for addresses using OpenStreetMap Nominatim API
 * Free API for geocoding/address search (no API key required for low volume)
 * Rate limited to 1 request per second
 * @param {string} query - Search query (partial address, city name, etc.)
 * @param {Object} options - Search options
 * @param {string} options.countryCode - Limit results to specific country (e.g., 'us')
 * @param {number} options.limit - Max number of results (default 5)
 * @param {boolean} options.addressDetails - Include detailed address breakdown
 * @returns {Promise<Array<{displayName: string, lat: number, lng: number, address: Object, type: string}>>}
 */
export const searchAddress = async (query, options = {}) => {
  if (!query || query.trim().length < 3) return [];

  const {
    countryCode = 'us',
    limit = 5,
    addressDetails = true
  } = options;

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: addressDetails ? '1' : '0',
      limit: limit.toString(),
      countrycodes: countryCode,
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          // Nominatim requires a valid User-Agent
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      console.warn('Address search failed:', response.status);
      return [];
    }

    const data = await response.json();

    return data.map(place => {
      const address = place.address || {};
      
      return {
        id: place.place_id,
        displayName: place.display_name,
        shortName: formatShortAddress(place),
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        type: place.type,
        category: place.category,
        address: {
          houseNumber: address.house_number || '',
          street: address.road || address.street || '',
          city: address.city || address.town || address.village || address.hamlet || '',
          state: address.state || '',
          stateCode: getStateCode(address.state),
          zip: address.postcode || '',
          country: address.country || '',
          countryCode: address.country_code || '',
        },
        // Formatted address line
        formattedAddress: formatFullAddress(address),
      };
    });
  } catch (error) {
    console.warn('Address search error:', error);
    return [];
  }
};

/**
 * Format a short, readable address from Nominatim place data
 */
function formatShortAddress(place) {
  const addr = place.address || {};
  const parts = [];
  
  // Street address
  if (addr.house_number && addr.road) {
    parts.push(`${addr.house_number} ${addr.road}`);
  } else if (addr.road) {
    parts.push(addr.road);
  }
  
  // City
  const city = addr.city || addr.town || addr.village || addr.hamlet;
  if (city) parts.push(city);
  
  // State abbreviation
  const state = getStateCode(addr.state);
  if (state) parts.push(state);
  
  return parts.join(', ') || place.display_name.split(',').slice(0, 3).join(',');
}

/**
 * Format full street address from address components
 */
function formatFullAddress(address) {
  const parts = [];
  
  // Street line
  if (address.house_number && address.road) {
    parts.push(`${address.house_number} ${address.road}`);
  } else if (address.road) {
    parts.push(address.road);
  }
  
  // City, State ZIP
  const city = address.city || address.town || address.village || '';
  const state = getStateCode(address.state);
  const zip = address.postcode || '';
  
  const cityStateZip = [city, state].filter(Boolean).join(', ');
  if (cityStateZip) {
    parts.push(zip ? `${cityStateZip} ${zip}` : cityStateZip);
  }
  
  return parts.join(', ');
}

/**
 * Convert full state name to abbreviation (US only)
 */
function getStateCode(stateName) {
  if (!stateName) return '';
  
  const stateMap = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
    'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
    'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
    'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
    'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
    'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
    'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
    'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
    'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
    'wisconsin': 'WI', 'wyoming': 'WY', 'district of columbia': 'DC',
  };
  
  // If already a 2-letter code, return as-is
  if (stateName.length === 2) return stateName.toUpperCase();
  
  return stateMap[stateName.toLowerCase()] || stateName;
}
