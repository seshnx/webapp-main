import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2, Navigation } from 'lucide-react';
import { useAddressSearch, type AddressResult } from '../../hooks/useAddressSearch';
import { reverseGeocode } from '../../utils/geocode';

/**
 * Selected address data interface
 */
export interface SelectedAddress {
  displayName: string;
  formattedAddress?: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  [key: string]: any;
}

/**
 * Address autocomplete component props
 */
export interface AddressAutocompleteProps {
  /** Callback when address is selected */
  onSelect: (addressData: SelectedAddress) => void;
  /** Controlled value for the input */
  value?: string;
  /** Controlled change handler */
  onChange?: (value: string) => void;
  /** Input placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Label text above input */
  label?: string;
  /** Show required indicator */
  required?: boolean;
  /** Show "Use my location" button */
  showGeolocation?: boolean;
  /** Limit results to country */
  countryCode?: string;
  /** Error message to display */
  error?: string;
}

/**
 * Address Autocomplete Component
 *
 * Provides address suggestions as user types using OpenStreetMap Nominatim,
 * with geolocation support.
 *
 * @param props - Address autocomplete props
 * @returns Address autocomplete component
 */
export default function AddressAutocomplete({
  onSelect,
  value,
  onChange,
  placeholder = "Start typing an address...",
  className = "",
  label = "Address",
  required = false,
  showGeolocation = true,
  countryCode = 'us',
  error: externalError,
}: AddressAutocompleteProps): React.ReactElement {
  const { search, results, loading, error: searchError, clearResults } = useAddressSearch({
    countryCode,
    debounceMs: 350,
    limit: 6,
  });

  const [localQuery, setLocalQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine displayed value (controlled vs uncontrolled)
  const displayValue = value !== undefined ? value : localQuery;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Update state
    if (onChange) onChange(val);
    else setLocalQuery(val);

    // Trigger search
    if (val.trim().length >= 3) {
      search(val);
      setIsOpen(true);
    } else {
      setIsOpen(false);
      clearResults();
    }
  };

  // Handle address selection
  const handleSelect = (item: AddressResult) => {
    const selectedAddress: SelectedAddress = {
      displayName: item.display_name,
      formattedAddress: item.display_name,
      lat: item.lat,
      lng: item.lon,
      ...item.address,
    };

    // Update input with formatted address
    const displayText = item.display_name;
    if (onChange) onChange(displayText);
    else setLocalQuery(displayText);

    // Callback with full address data
    if (onSelect) onSelect(selectedAddress);

    setIsOpen(false);
    clearResults();
  };

  // Handle geolocation
  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const locationData = await reverseGeocode(latitude, longitude);

          if (locationData) {
            const displayText = locationData.displayName;
            if (onChange) onChange(displayText);
            else setLocalQuery(displayText);

            if (onSelect) {
              onSelect({
                displayName: displayText,
                formattedAddress: displayText,
                lat: latitude,
                lng: longitude,
                city: locationData.city,
                state: locationData.state,
                zip: locationData.zip,
              });
            }
          }
        } catch (err) {
          console.error('Reverse geocode failed:', err);
        }

        setGeoLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert("Unable to get your location. Please enter address manually.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Clear input
  const handleClear = () => {
    if (onChange) onChange('');
    else setLocalQuery('');
    clearResults();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const hasError = externalError || searchError;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <MapPin
            className={`absolute left-3 top-3 ${loading ? 'text-brand-blue animate-pulse' : 'text-gray-400'}`}
            size={16}
          />
          <input
            ref={inputRef}
            type="text"
            className={`
                            w-full pl-9 pr-8 p-2.5 text-sm
                            bg-white dark:bg-[#1f2128]
                            border ${hasError ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:ring-brand-blue'}
                            rounded-lg focus:ring-2 outline-none
                            dark:text-white transition-all
                        `}
            placeholder={placeholder}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            autoComplete="off"
          />

          {/* Clear button */}
          {displayValue && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          )}

          {/* Loading indicator */}
          {loading && (
            <Loader2
              className="absolute right-3 top-3 text-brand-blue animate-spin"
              size={16}
            />
          )}
        </div>

        {/* Geolocation button */}
        {showGeolocation && (
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={geoLoading}
            className="p-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-brand-blue transition-colors disabled:opacity-50"
            title="Use my current location"
          >
            {geoLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Navigation size={18} />
            )}
          </button>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <p className="text-red-500 text-xs mt-1">{externalError || searchError}</p>
      )}

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#2c2e36] border dark:border-gray-600 rounded-xl shadow-xl max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {results.map((item) => (
              <button
                key={item.display_name}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b dark:border-gray-700/50 last:border-0 group"
              >
                <div className="flex items-start gap-3">
                  <MapPin
                    size={16}
                    className="text-gray-400 group-hover:text-brand-blue transition-colors mt-0.5 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm dark:text-white group-hover:text-brand-blue transition-colors truncate">
                      {item.address?.city || item.address?.road || item.display_name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {item.display_name}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Attribution (required by Nominatim) */}
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 text-[10px] text-gray-400 text-center">
            Powered by OpenStreetMap
          </div>
        </div>
      )}

      {/* Loading state for dropdown */}
      {isOpen && loading && results.length === 0 && displayValue.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#2c2e36] border dark:border-gray-600 rounded-xl shadow-xl p-4 text-center text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={16} />
          <span className="text-sm">Searching addresses...</span>
        </div>
      )}

      {/* No results state */}
      {isOpen && !loading && results.length === 0 && displayValue.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#2c2e36] border dark:border-gray-600 rounded-xl shadow-xl p-4 text-center text-gray-500 text-sm">
          No addresses found. Try a different search.
        </div>
      )}
    </div>
  );
}
