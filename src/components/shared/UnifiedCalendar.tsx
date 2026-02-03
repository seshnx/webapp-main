import React, { useState, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Ban,
    Clock,
    MapPin
} from 'lucide-react';

/**
 * Type Definitions
 */

// Booking status types
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | string;

// Time slot types for blocked dates
export type TimeSlotType = 'full' | 'custom';

// Base booking interface
export interface Booking {
    id: string | number;
    date?: Date | string;
    startTime?: string; // Format: "HH:mm"
    endTime?: string;
    duration?: number; // in minutes
    clientName?: string;
    roomName?: string;
    status?: BookingStatus;
    [key: string]: any; // Allow additional properties
}

// Blocked date interface
export interface BlockedDate {
    id?: string | number;
    date: Date | string;
    time_slot?: TimeSlotType;
    timeSlot?: TimeSlotType; // Alternative property name
    start_time?: string;
    startTime?: string; // Alternative property name
    end_time?: string;
    endTime?: string; // Alternative property name
    reason?: string;
    [key: string]: any; // Allow additional properties
}

// Calendar view types
export type CalendarView = 'month' | 'week' | 'day';

// Main component props
export interface UnifiedCalendarProps {
    currentDate?: Date;
    onDateChange?: (date: Date) => void;
    bookings?: Booking[];
    blockedDates?: BlockedDate[];
    onDateClick?: (date: Date) => void;
    onBookingClick?: (booking: Booking, date: Date) => void;
    view?: CalendarView;
    onViewChange?: (view: CalendarView) => void;
    showControls?: boolean;
    className?: string;
}

// Month view component props
interface MonthViewProps {
    date: Date;
    bookings: Booking[];
    blockedDates: BlockedDate[];
    onDateClick?: (date: Date) => void;
    onBookingClick?: (booking: Booking, date: Date) => void;
    getDayBookings: (date: Date) => Booking[];
    getDayBlocks: (date: Date) => BlockedDate[];
}

// Week view component props
interface WeekViewProps {
    date: Date;
    bookings: Booking[];
    blockedDates: BlockedDate[];
    onDateClick?: (date: Date) => void;
    onBookingClick?: (booking: Booking, date: Date) => void;
    getDayBookings: (date: Date) => Booking[];
    getDayBlocks: (date: Date) => BlockedDate[];
    getWeekDates: (date: Date) => Date[];
}

// Day view component props
interface DayViewProps {
    date: Date;
    bookings: Booking[];
    blockedDates: BlockedDate[];
    onDateClick?: (date: Date) => void;
    onBookingClick?: (booking: Booking, date: Date) => void;
    getDayBookings: (date: Date) => Booking[];
    getDayBlocks: (date: Date) => BlockedDate[];
}

/**
 * UnifiedCalendar - A single calendar component with day/week/month views
 * Based on Studio Manager calendar design
 *
 * @param props - Component props
 */
export default function UnifiedCalendar({
    currentDate = new Date(),
    onDateChange,
    bookings = [],
    blockedDates = [],
    onDateClick,
    onBookingClick,
    view = 'month',
    onViewChange,
    showControls = true,
    className = ''
}: UnifiedCalendarProps): React.ReactElement {
    const [localDate, setLocalDate] = useState<Date>(currentDate);
    const [localView, setLocalView] = useState<CalendarView>(view);

    // Use local state if no controlled props
    const displayDate: Date = currentDate || localDate;
    const displayView: CalendarView = view || localView;

    const handleDateChange = (newDate: Date): void => {
        setLocalDate(newDate);
        if (onDateChange) onDateChange(newDate);
    };

    const handleViewChange = (newView: CalendarView): void => {
        setLocalView(newView);
        if (onViewChange) onViewChange(newView);
    };

    // Navigation
    const navigateDate = (direction: number): void => {
        const newDate = new Date(displayDate);

        if (displayView === 'month') {
            newDate.setMonth(newDate.getMonth() + direction);
        } else if (displayView === 'week') {
            newDate.setDate(newDate.getDate() + (direction * 7));
        } else if (displayView === 'day') {
            newDate.setDate(newDate.getDate() + direction);
        }

        handleDateChange(newDate);
    };

    const goToToday = (): void => {
        handleDateChange(new Date());
    };

    // Get week start (Sunday)
    const getWeekStart = (date: Date): Date => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    };

    // Get week dates
    const getWeekDates = (date: Date): Date[] => {
        const weekStart = getWeekStart(date);
        const week: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            week.push(day);
        }
        return week;
    };

    // Get bookings for a specific date
    const getDayBookings = (date: Date | null): Booking[] => {
        if (!date) return [];
        return bookings.filter((b: Booking) => {
            if (!b.date) return false;
            const bookingDate = b.date instanceof Date ? b.date : new Date(b.date);
            if (isNaN(bookingDate.getTime())) return false;
            return bookingDate.toDateString() === date.toDateString();
        });
    };

    // Get blocks for a specific date
    const getDayBlocks = (date: Date | null): BlockedDate[] => {
        if (!date) return [];
        return blockedDates.filter((b: BlockedDate) => {
            if (!b.date) return false;
            const blockDate = b.date instanceof Date ? b.date : new Date(b.date);
            if (isNaN(blockDate.getTime())) return false;
            return blockDate.toDateString() === date.toDateString();
        });
    };

    // Format date for display
    const formatDateRange = (): string => {
        if (displayView === 'month') {
            return displayDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        } else if (displayView === 'week') {
            const week = getWeekDates(displayDate);
            const start = week[0];
            const end = week[6];
            if (start.getMonth() === end.getMonth()) {
                return `${start.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric'
                })} - ${end.toLocaleDateString('en-US', {
                    day: 'numeric',
                    year: 'numeric'
                })}`;
            } else {
                return `${start.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                })} - ${end.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })}`;
            }
        } else {
            return displayDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        }
    };

    return (
        <div
            className={`bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden ${className}`}
        >
            {/* Header Controls */}
            {showControls && (
                <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-[#23262f]">
                    <div className="flex items-center justify-between mb-4">
                        {/* View Toggle */}
                        <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                            {(['month', 'week', 'day'] as CalendarView[]).map(
                                (v: CalendarView) => (
                                    <button
                                        key={v}
                                        onClick={() => handleViewChange(v)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition capitalize ${
                                            displayView === v
                                                ? 'bg-white dark:bg-gray-600 shadow text-brand-blue dark:text-white'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                    >
                                        {v}
                                    </button>
                                )
                            )}
                        </div>

                        {/* Date Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigateDate(-1)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                                aria-label="Previous"
                            >
                                <ChevronLeft
                                    size={20}
                                    className="text-gray-600 dark:text-gray-300"
                                />
                            </button>
                            <button
                                onClick={goToToday}
                                className="px-3 py-1.5 text-sm font-medium text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => navigateDate(1)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                                aria-label="Next"
                            >
                                <ChevronRight
                                    size={20}
                                    className="text-gray-600 dark:text-gray-300"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Date Range Display */}
                    <div className="text-center">
                        <h3 className="font-bold dark:text-white text-lg">
                            {formatDateRange()}
                        </h3>
                    </div>
                </div>
            )}

            {/* Calendar Content */}
            <div className="p-4">
                {displayView === 'month' && (
                    <MonthView
                        date={displayDate}
                        bookings={bookings}
                        blockedDates={blockedDates}
                        onDateClick={onDateClick}
                        onBookingClick={onBookingClick}
                        getDayBookings={getDayBookings}
                        getDayBlocks={getDayBlocks}
                    />
                )}

                {displayView === 'week' && (
                    <WeekView
                        date={displayDate}
                        bookings={bookings}
                        blockedDates={blockedDates}
                        onDateClick={onDateClick}
                        onBookingClick={onBookingClick}
                        getDayBookings={getDayBookings}
                        getDayBlocks={getDayBlocks}
                        getWeekDates={getWeekDates}
                    />
                )}

                {displayView === 'day' && (
                    <DayView
                        date={displayDate}
                        bookings={bookings}
                        blockedDates={blockedDates}
                        onDateClick={onDateClick}
                        onBookingClick={onBookingClick}
                        getDayBookings={getDayBookings}
                        getDayBlocks={getDayBlocks}
                    />
                )}
            </div>

            {/* Legend */}
            <div className="px-4 pb-4">
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t dark:border-gray-700 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Confirmed
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        Pending
                    </div>
                    <div className="flex items-center gap-1">
                        <Ban size={12} className="text-red-500" />
                        Blocked
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Month View Component
 */
function MonthView({
    date,
    bookings,
    blockedDates,
    onDateClick,
    onBookingClick,
    getDayBookings,
    getDayBlocks
}: MonthViewProps): React.ReactElement {
    const year: number = date.getFullYear();
    const month: number = date.getMonth();
    const today: Date = new Date();
    const firstDay: number = new Date(year, month, 1).getDay();
    const daysInMonth: number = new Date(year, month + 1, 0).getDate();

    const dayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    return (
        <>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day: string) => (
                    <div
                        key={day}
                        className="text-center text-sm font-bold text-gray-500 py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {days.map((day, i) => {
                    if (day === null) {
                        return (
                            <div
                                key={`empty-${i}`}
                                className="aspect-square"
                            ></div>
                        );
                    }

                    const dayDate: Date = new Date(year, month, day);
                    const isPast: boolean =
                        dayDate <
                        new Date(
                            today.getFullYear(),
                            today.getMonth(),
                            today.getDate()
                        );
                    const isToday: boolean =
                        dayDate.toDateString() === today.toDateString();
                    const dayBookings: Booking[] = getDayBookings(dayDate);
                    const dayBlocks: BlockedDate[] = getDayBlocks(dayDate);

                    const hasConfirmed: boolean = dayBookings.some(
                        (b: Booking) =>
                            (b.status || '').toLowerCase() === 'confirmed'
                    );
                    const hasPending: boolean = dayBookings.some(
                        (b: Booking) =>
                            (b.status || '').toLowerCase() === 'pending'
                    );
                    const isBlocked: boolean = dayBlocks.length > 0;

                    return (
                        <button
                            key={day}
                            onClick={() => {
                                if (!isPast && onDateClick) onDateClick(dayDate);
                                if (dayBookings.length > 0 && onBookingClick) {
                                    onBookingClick(dayBookings[0], dayDate);
                                }
                            }}
                            disabled={isPast}
                            className={`aspect-square p-1 rounded-xl flex flex-col items-center justify-center relative transition ${
                                isPast
                                    ? 'opacity-40 cursor-not-allowed'
                                    : isBlocked
                                    ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/40'
                                    : isToday
                                    ? 'bg-brand-blue text-white'
                                    : hasConfirmed || hasPending
                                    ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <span
                                className={`text-sm font-medium ${
                                    isToday
                                        ? 'text-white'
                                        : isBlocked
                                        ? 'text-red-700 dark:text-red-400'
                                        : 'dark:text-white'
                                }`}
                            >
                                {day}
                            </span>

                            {/* Indicators */}
                            <div className="flex gap-0.5 mt-0.5">
                                {hasConfirmed && (
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                )}
                                {hasPending && (
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                )}
                                {isBlocked && (
                                    <Ban
                                        size={10}
                                        className="text-red-600 dark:text-red-400"
                                    />
                                )}
                            </div>

                            {/* Booking count badge */}
                            {dayBookings.length > 0 && !isToday && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-blue text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                    {dayBookings.length}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </>
    );
}

/**
 * Week View Component
 */
function WeekView({
    date,
    bookings,
    blockedDates,
    onDateClick,
    onBookingClick,
    getDayBookings,
    getDayBlocks,
    getWeekDates
}: WeekViewProps): React.ReactElement {
    const weekDates: Date[] = getWeekDates(date);
    const today: Date = new Date();
    const dayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Time slots for the day (6 AM to 11 PM)
    const timeSlots: number[] = [];
    for (let hour = 6; hour <= 23; hour++) {
        timeSlots.push(hour);
    }

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[800px]">
                {/* Day Headers */}
                <div className="grid grid-cols-8 gap-2 mb-2 border-b dark:border-gray-700 pb-2">
                    <div className="text-sm font-bold text-gray-500">Time</div>
                    {weekDates.map((dayDate: Date, i: number) => {
                        const isToday: boolean =
                            dayDate.toDateString() === today.toDateString();
                        return (
                            <div key={i} className="text-center">
                                <div
                                    className={`text-xs font-medium text-gray-400 mb-1 ${isToday ? 'text-brand-blue' : ''}`}
                                >
                                    {dayNames[dayDate.getDay()]}
                                </div>
                                <div
                                    className={`text-sm font-bold ${isToday ? 'text-brand-blue' : 'dark:text-white'}`}
                                >
                                    {dayDate.getDate()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Time Grid */}
                <div className="grid grid-cols-8 gap-2">
                    {/* Time Column */}
                    <div className="space-y-1">
                        {timeSlots.map((hour: number) => (
                            <div
                                key={hour}
                                className="h-16 flex items-start pt-1 text-xs text-gray-400"
                            >
                                {hour.toString().padStart(2, '0')}:00
                            </div>
                        ))}
                    </div>

                    {/* Day Columns */}
                    {weekDates.map((dayDate: Date, dayIndex: number) => {
                        const dayBookings: Booking[] = getDayBookings(dayDate);
                        const dayBlocks: BlockedDate[] = getDayBlocks(dayDate);
                        const isToday: boolean =
                            dayDate.toDateString() === today.toDateString();

                        return (
                            <div key={dayIndex} className="relative">
                                {timeSlots.map((hour: number, hourIndex: number) => {
                                    const slotStart: Date = new Date(dayDate);
                                    slotStart.setHours(hour, 0, 0, 0);
                                    const slotEnd: Date = new Date(dayDate);
                                    slotEnd.setHours(hour + 1, 0, 0, 0);

                                    // Find bookings in this time slot
                                    const slotBookings: Booking[] = dayBookings.filter(
                                        (b: Booking) => {
                                            if (!b.startTime) return false;
                                            const bookingTime = new Date(
                                                `${dayDate.toDateString()} ${b.startTime}`
                                            );
                                            return (
                                                bookingTime >= slotStart &&
                                                bookingTime < slotEnd
                                            );
                                        }
                                    );

                                    // Check if this slot is blocked
                                    const isBlocked: boolean = dayBlocks.some(
                                        (block: BlockedDate) => {
                                            const timeSlot =
                                                block.time_slot ||
                                                block.timeSlot;
                                            if (timeSlot === 'full') return true;
                                            // Add more logic for time slot matching if needed
                                            return false;
                                        }
                                    );

                                    return (
                                        <div
                                            key={hourIndex}
                                            onClick={() =>
                                                onDateClick && onDateClick(slotStart)
                                            }
                                            className={`h-16 border-b dark:border-gray-700 cursor-pointer transition ${
                                                isToday
                                                    ? 'bg-blue-50 dark:bg-blue-900/10'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                            } ${isBlocked ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
                                        >
                                            {slotBookings.map(
                                                (booking: Booking, bi: number) => (
                                                    <div
                                                        key={bi}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (onBookingClick)
                                                                onBookingClick(
                                                                    booking,
                                                                    dayDate
                                                                );
                                                        }}
                                                        className={`text-xs p-1 m-0.5 rounded cursor-pointer ${
                                                            (booking.status ||
                                                                '').toLowerCase() ===
                                                            'confirmed'
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                        }`}
                                                    >
                                                        {booking.startTime || ''}{' '}
                                                        {booking.clientName ||
                                                            'Booking'}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/**
 * Day View Component
 */
function DayView({
    date,
    bookings,
    blockedDates,
    onDateClick,
    onBookingClick,
    getDayBookings,
    getDayBlocks
}: DayViewProps): React.ReactElement {
    const today: Date = new Date();
    const isToday: boolean = date.toDateString() === today.toDateString();

    const dayBookings: Booking[] = getDayBookings(date);
    const dayBlocks: BlockedDate[] = getDayBlocks(date);

    // Time slots for the day (6 AM to 11 PM)
    const timeSlots: number[] = [];
    for (let hour = 6; hour <= 23; hour++) {
        timeSlots.push(hour);
    }

    // Group bookings by hour
    const bookingsByHour: Record<number, Booking[]> = useMemo(() => {
        const grouped: Record<number, Booking[]> = {};
        dayBookings.forEach((booking: Booking) => {
            if (!booking.startTime) return;
            const hour: number = parseInt(
                booking.startTime.split(':')[0] || '0'
            );
            if (!grouped[hour]) grouped[hour] = [];
            grouped[hour].push(booking);
        });
        return grouped;
    }, [dayBookings]);

    return (
        <div className="space-y-4">
            {/* Day Header */}
            <div
                className={`p-4 rounded-lg border-2 ${
                    isToday
                        ? 'bg-brand-blue text-white border-brand-blue'
                        : 'bg-gray-50 dark:bg-[#1f2128] border-gray-200 dark:border-gray-700'
                }`}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg">
                            {date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </h3>
                        <p
                            className={`text-sm mt-1 ${isToday ? 'text-blue-100' : 'text-gray-500'}`}
                        >
                            {dayBookings.length} booking
                            {dayBookings.length !== 1 ? 's' : ''}
                            {dayBlocks.length > 0 &&
                                ` • ${dayBlocks.length} blocked slot${dayBlocks.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                    {dayBlocks.length > 0 && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Ban size={20} />
                            <span className="font-medium">Blocked</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Time Schedule */}
            <div className="grid grid-cols-12 gap-2">
                {/* Time Column */}
                <div className="col-span-2 space-y-1">
                    {timeSlots.map((hour: number) => (
                        <div
                            key={hour}
                            className="h-20 flex items-start pt-2 text-sm text-gray-500 font-medium"
                        >
                            {hour.toString().padStart(2, '0')}:00
                        </div>
                    ))}
                </div>

                {/* Schedule Column */}
                <div className="col-span-10 relative">
                    {timeSlots.map((hour: number, hourIndex: number) => {
                        const slotStart: Date = new Date(date);
                        slotStart.setHours(hour, 0, 0, 0);
                        const slotEnd: Date = new Date(date);
                        slotEnd.setHours(hour + 1, 0, 0, 0);

                        const slotBookings: Booking[] =
                            bookingsByHour[hour] || [];
                        const isBlocked: boolean = dayBlocks.some(
                            (block: BlockedDate) => {
                                const timeSlot =
                                    block.time_slot || block.timeSlot;
                                const startTime =
                                    block.start_time || block.startTime;
                                const endTime =
                                    block.end_time || block.endTime;

                                if (timeSlot === 'full') return true;
                                // Check if this hour falls within blocked time slot
                                if (
                                    timeSlot === 'custom' &&
                                    startTime &&
                                    endTime
                                ) {
                                    const blockStart: number = parseInt(
                                        startTime.split(':')[0]
                                    );
                                    const blockEnd: number = parseInt(
                                        endTime.split(':')[0]
                                    );
                                    return hour >= blockStart && hour < blockEnd;
                                }
                                return false;
                            }
                        );

                        return (
                            <div
                                key={hourIndex}
                                onClick={() =>
                                    onDateClick && onDateClick(slotStart)
                                }
                                className={`h-20 border-b dark:border-gray-700 cursor-pointer transition relative ${
                                    isToday
                                        ? 'bg-blue-50 dark:bg-blue-900/10'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                } ${isBlocked ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
                            >
                                {slotBookings.map((booking: Booking, bi: number) => (
                                    <div
                                        key={bi}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onBookingClick)
                                                onBookingClick(booking, date);
                                        }}
                                        className={`absolute left-1 right-1 p-2 rounded-lg cursor-pointer shadow-sm ${
                                            (booking.status ||
                                                '').toLowerCase() ===
                                            'confirmed'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                                        }`}
                                        style={{
                                            top: `${((parseInt((booking.startTime || '00:00').split(':')[1]) || 0) / 60) * 100}%`,
                                            height: `${((booking.duration || 1) / 60) * 100}%`
                                        }}
                                    >
                                        <div className="font-medium text-sm">
                                            {booking.startTime || ''}{' '}
                                            {booking.clientName || 'Booking'}
                                        </div>
                                        {booking.roomName && (
                                            <div className="text-xs opacity-75 flex items-center gap-1 mt-0.5">
                                                <MapPin size={10} />
                                                {booking.roomName}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bookings List (Alternative View) */}
            {dayBookings.length > 0 && (
                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <h4 className="font-bold text-sm dark:text-white mb-3">
                        All Bookings
                    </h4>
                    <div className="space-y-2">
                        {dayBookings.map((booking: Booking) => (
                            <div
                                key={booking.id}
                                onClick={() =>
                                    onBookingClick && onBookingClick(booking, date)
                                }
                                className={`p-3 rounded-lg cursor-pointer transition ${
                                    (booking.status ||
                                        '').toLowerCase() === 'confirmed'
                                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                        : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium dark:text-white">
                                            {booking.startTime || 'TBD'} -{' '}
                                            {booking.clientName || 'Unknown'}
                                        </div>
                                        {booking.roomName && (
                                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <MapPin size={10} />
                                                {booking.roomName}
                                            </div>
                                        )}
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-1 rounded font-medium ${
                                            (booking.status ||
                                                '').toLowerCase() ===
                                            'confirmed'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                        }`}
                                    >
                                        {booking.status || 'Pending'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
