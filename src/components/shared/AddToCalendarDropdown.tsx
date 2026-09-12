import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check, Download, ExternalLink } from 'lucide-react';
import {
  CalendarEventDetails,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  getOffice365CalendarUrl,
  getYahooCalendarUrl,
  downloadIcsFile,
  formatBookingForCalendar
} from '../../utils/calendarIntegration';
import toast from 'react-hot-toast';

export interface AddToCalendarDropdownProps {
  booking?: any;
  event?: CalendarEventDetails;
  perspective?: 'talent' | 'client' | 'studio';
  buttonSize?: 'sm' | 'md';
  className?: string;
  variant?: 'outline' | 'solid' | 'ghost';
}

export default function AddToCalendarDropdown({
  booking,
  event: propEvent,
  perspective = 'talent',
  buttonSize = 'sm',
  className = '',
  variant = 'outline'
}: AddToCalendarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const eventDetails: CalendarEventDetails = propEvent || (booking ? formatBookingForCalendar(booking, perspective) : {
    title: 'SeshNx Studio Session',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7200000),
    location: 'SeshNx Studio',
  });

  const handleGoogle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getGoogleCalendarUrl(eventDetails);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    toast.success('Opening Google Calendar');
  };

  const handleAppleIcs = (e: React.MouseEvent) => {
    e.stopPropagation();
    const safeTitle = (eventDetails.title || 'session').toLowerCase().replace(/[^a-z0-9]/g, '-');
    downloadIcsFile(eventDetails, `seshnx-${safeTitle}.ics`);
    setIsOpen(false);
    toast.success('Downloaded Apple Calendar (.ics) file');
  };

  const handleOutlook = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getOutlookCalendarUrl(eventDetails);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    toast.success('Opening Outlook Calendar');
  };

  const handleOffice365 = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getOffice365CalendarUrl(eventDetails);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    toast.success('Opening Office 365');
  };

  const handleYahoo = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getYahooCalendarUrl(eventDetails);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    toast.success('Opening Yahoo Calendar');
  };

  const sizeClasses = buttonSize === 'sm'
    ? 'px-2.5 py-1.5 text-xs'
    : 'px-3.5 py-2 text-sm';

  const variantClasses = variant === 'solid'
    ? 'bg-brand-blue text-white hover:bg-blue-600 shadow-sm'
    : variant === 'ghost'
    ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-2xs';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-1.5 font-medium rounded-lg transition-colors ${sizeClasses} ${variantClasses}`}
        title="Add to Google, Apple, or Outlook Calendar"
      >
        <Calendar size={buttonSize === 'sm' ? 13 : 15} className="text-brand-blue dark:text-blue-400" />
        <span>Add to Calendar</span>
        <ChevronDown size={buttonSize === 'sm' ? 12 : 14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-white dark:bg-[#252830] border border-gray-200 dark:border-gray-700 shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100 focus:outline-none">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-750 mb-1">
            Choose Calendar
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-brand-blue dark:hover:text-blue-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Google Calendar
            </span>
            <ExternalLink size={11} className="text-gray-400" />
          </button>

          <button
            type="button"
            onClick={handleAppleIcs}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-brand-blue dark:hover:text-blue-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Apple / iCal (.ics)
            </span>
            <Download size={11} className="text-gray-400" />
          </button>

          <button
            type="button"
            onClick={handleOutlook}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-brand-blue dark:hover:text-blue-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Outlook Web
            </span>
            <ExternalLink size={11} className="text-gray-400" />
          </button>

          <button
            type="button"
            onClick={handleOffice365}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-brand-blue dark:hover:text-blue-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Office 365
            </span>
            <ExternalLink size={11} className="text-gray-400" />
          </button>

          <button
            type="button"
            onClick={handleYahoo}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-brand-blue dark:hover:text-blue-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Yahoo Calendar
            </span>
            <ExternalLink size={11} className="text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
}
