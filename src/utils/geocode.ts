/**
 * Geocoding and address utilities
 */

interface ZipLocation {
  lat: number;
  lng: number;
  name: string;
  state: string;
  cityState: string;
}

interface ReverseGeocodeResult {
  city: string;
  state: string;
  zip: string;
  displayName: string;
}

interface RegionalUserCount {
  count: number;
  density: string;
  label: string;
}

interface AddressSearchOptions {
  countryCode?: string;
  limit?: number;
  addressDetails?: boolean;
}

interface AddressSearchResult {
  id: string;
  displayName: string;
  shortName: string;
  lat: number;
  lng: number;
  type: string;
  category: string;
  address: {
    houseNumber: string;
    street: string;
    city: string;
    state: string;
    stateCode: string;
    zip: string;
    country: string;
    countryCode: string;
  };
  formattedAddress: string;
}

/**
 * Fetches location data for a US Zip Code using Zippopotam.us
 */
export const fetchZipLocation = async (zip: string): Promise<ZipLocation | null> => {
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
 * Converts Latitude and Longitude into a readable address
 */
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult | null> => {
  if (!lat || !lng) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const address = data.address;

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
 * Queries for the number of users in the wider region (Zip Prefix)
 */
export const fetchRegionalUserCount = async (zip: string): Promise<RegionalUserCount> => {
  if (!zip || zip.length < 3) return { count: 0, density: '#6B7280', label: 'Scanning...' };

  // TODO: Replace with actual database query
  // For now, return placeholder data
  return { count: 0, density: '#9CA3AF', label: 'Unknown Region' };
};

/**
 * Calculate the distance between two points on Earth using Haversine formula
 */
export const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Search for addresses using OpenStreetMap Nominatim API
 */
export const searchAddress = async (
  query: string,
  options: AddressSearchOptions = {}
): Promise<AddressSearchResult[]> => {
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
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      console.warn('Address search failed:', response.status);
      return [];
    }

    const data = await response.json();

    return data.map((place: any) => {
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
function formatShortAddress(place: any): string {
  const addr = place.address || {};
  const parts: string[] = [];

  if (addr.house_number && addr.road) {
    parts.push(`${addr.house_number} ${addr.road}`);
  } else if (addr.road) {
    parts.push(addr.road);
  }

  const city = addr.city || addr.town || addr.village || addr.hamlet;
  if (city) parts.push(city);

  const state = getStateCode(addr.state);
  if (state) parts.push(state);

  return parts.join(', ') || place.display_name.split(',').slice(0, 3).join(',');
}

/**
 * Format full street address from address components
 */
function formatFullAddress(address: any): string {
  const parts: string[] = [];

  if (address.house_number && address.road) {
    parts.push(`${address.house_number} ${address.road}`);
  } else if (address.road) {
    parts.push(address.road);
  }

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
function getStateCode(stateName: string): string {
  if (!stateName) return '';

  const stateMap: Record<string, string> = {
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

  if (stateName.length === 2) return stateName.toUpperCase();

  return stateMap[stateName.toLowerCase()] || stateName;
}
