import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useSoftwareSearch, type SoftwareSearchResult } from '../../hooks/useSoftwareSearch';

/**
 * Software autocomplete component props
 */
export interface SoftwareAutocompleteProps {
  /** Selection callback */
  onSelect?: (item: SoftwareSearchResult & { fullName: string }) => void;
  /** Input placeholder */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Controlled value */
  value?: string;
  /** Controlled change handler */
  onChange?: (value: string) => void;
  /** Enable comma-separated list behavior */
  multi?: boolean;
}

/**
 * Software Autocomplete Component
 *
 * Provides software search with autocomplete suggestions.
 *
 * @param props - Software autocomplete props
 * @returns Autocomplete component
 */
export default function SoftwareAutocomplete({
  onSelect,
  placeholder = "Search for software (e.g. Pro Tools, Kontakt)...",
  className = "",
  value,
  onChange,
  multi = false
}: SoftwareAutocompleteProps): React.ReactElement {
  const { searchSoftware, results, loading } = useSoftwareSearch();
  const [localQuery, setLocalQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Determine value to display (Controlled vs Uncontrolled)
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
  }, [wrapperRef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Update State/Parent
    if (onChange) onChange(val);
    else setLocalQuery(val);

    // Determine Search Term
    // If multi, search only the text after the last comma
    const searchTerm = multi ? val.split(',').pop().trim() : val;

    if (searchTerm.length >= 2) {
      searchSoftware(searchTerm);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (item: SoftwareSearchResult) => {
    // Construct a full display name
    const fullName = item.brand !== 'Various' && item.brand !== 'Unknown'
      ? `${item.brand} ${item.name}`
      : item.name;

    if (multi) {
      // Split by comma, remove the partial term being typed
      const terms = displayValue.split(',');
      terms.pop();

      // Clean up existing terms and append the new selection
      const cleanTerms = terms.map(t => t.trim()).filter(Boolean);
      const newValue = [...cleanTerms, fullName].join(', ') + ', ';

      if (onChange) onChange(newValue);
      else setLocalQuery(newValue);
    } else {
      // Standard single select behavior
      if (onSelect) onSelect({ ...item, fullName });
      if (onChange) onChange(fullName);
      else setLocalQuery(fullName);
    }

    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
        <input
          className="w-full pl-9 pr-8 p-3 text-sm border rounded-xl bg-white dark:bg-[#1f2128] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none transition-all"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={(e) => handleInputChange(e)} // Trigger search on focus if text exists
        />
        {displayValue && (
          <button
            type="button"
            onClick={() => {
              if(onChange) onChange('');
              else setLocalQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={16}/>
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#2c2e36] border dark:border-gray-600 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
          <div className="py-1">
            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b dark:border-gray-700/50 last:border-0 group"
              >
                <div className="font-bold text-sm dark:text-white group-hover:text-brand-blue transition-colors">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <span className="font-medium text-gray-600 dark:text-gray-400">{item.brand}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                  <span className="opacity-75">{item.subCategory?.replace(/_/g, ' ')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && loading && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#2c2e36] border dark:border-gray-600 rounded-xl shadow-xl p-4 text-center text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={16}/> Searching database...
        </div>
      )}
    </div>
  );
}
