import React, { useState } from 'react';
import { Calendar, Repeat, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation } from 'convex/react';
import { api } from '@convex/api';

/**
 * Recurrence pattern type
 */
type RecurrenceType = 'daily' | 'weekly' | 'monthly';

/**
 * Recurrence pattern interface
 */
interface RecurrencePattern {
    type: RecurrenceType;
    interval: number;
    daysOfWeek: number[] | null;
}

/**
 * Booking interface (minimal)
 */
interface Booking {
    id: string;
    date: string | Date;
    studio_owner_id?: string;
    target_id?: string;
    sender_id: string;
    [key: string]: any;
}

/**
 * RecurringBookingModal component props
 */
export interface RecurringBookingModalProps {
    booking: Booking;
    onClose: () => void;
    onSuccess?: () => void;
}

/**
 * RecurringBookingModal - Create recurring bookings
 */
export default function RecurringBookingModal({ booking, onClose, onSuccess }: RecurringBookingModalProps) {
    const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('weekly');
    const [interval, setInterval] = useState<number>(1); // Every X weeks/days/months
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]); // For weekly: [1,3,5] = Mon, Wed, Fri
    const [endDate, setEndDate] = useState<string>('');
    const [maxOccurrences, setMaxOccurrences] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // Convex mutation for creating bookings
    const createBooking = useMutation(api.sbookings.createBooking);

    const handleDayToggle = (day: number): void => {
        setDaysOfWeek(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day].sort((a, b) => a - b)
        );
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!booking) return;

        setLoading(true);
        const toastId = toast.loading('Creating recurring bookings...');

        try {
            const bookingDate = new Date(booking.date);
            if (isNaN(bookingDate.getTime())) {
                throw new Error('Invalid booking date');
            }

            // Calculate next occurrence
            let nextOccurrence = new Date(bookingDate);
            if (recurrenceType === 'weekly' && daysOfWeek.length > 0) {
                // Find next matching day of week
                const currentDay = bookingDate.getDay();
                const nextDay = daysOfWeek.find(d => d > currentDay) || daysOfWeek[0];
                const daysToAdd = nextDay - currentDay + (nextDay < currentDay ? 7 : 0);
                nextOccurrence = new Date(bookingDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
            } else if (recurrenceType === 'daily') {
                nextOccurrence = new Date(bookingDate.getTime() + (interval * 24 * 60 * 60 * 1000));
            } else if (recurrenceType === 'monthly') {
                nextOccurrence = new Date(bookingDate);
                nextOccurrence.setMonth(nextOccurrence.getMonth() + interval);
            }

            const recurrencePattern: RecurrencePattern = {
                type: recurrenceType,
                interval,
                daysOfWeek: recurrenceType === 'weekly' ? daysOfWeek : null,
            };

            // Create individual bookings for each occurrence using Convex
            const bookingsToCreate = [];
            let currentDate = new Date(bookingDate);
            const maxOccur = maxOccurrences ? parseInt(maxOccurrences) : 12;
            const end = endDate ? new Date(endDate) : null;

            for (let i = 0; i < maxOccur; i++) {
                if (end && currentDate > end) break;

                bookingsToCreate.push({
                    studioId: (booking.studio_owner_id || booking.target_id) as any,
                    clientId: booking.sender_id as any,
                    date: currentDate.toISOString().split('T')[0],
                    status: 'Confirmed',
                    notes: `Recurring booking (${recurrenceType}, occurrence ${i + 1}/${maxOccur})`,
                });

                // Calculate next occurrence date
                if (recurrenceType === 'weekly' && daysOfWeek.length > 0) {
                    const currentDay = currentDate.getDay();
                    const nextDay = daysOfWeek.find(d => d > currentDay) || daysOfWeek[0];
                    const daysToAdd = nextDay - currentDay + (nextDay < currentDay ? 7 : 0);
                    currentDate = new Date(currentDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
                } else if (recurrenceType === 'daily') {
                    currentDate = new Date(currentDate.getTime() + (interval * 24 * 60 * 60 * 1000));
                } else if (recurrenceType === 'monthly') {
                    currentDate = new Date(currentDate);
                    currentDate.setMonth(currentDate.getMonth() + interval);
                }
            }

            // Create all bookings
            await Promise.all(
                bookingsToCreate.map(bookingData =>
                    createBooking(bookingData)
                )
            );

            toast.success(`${bookingsToCreate.length} recurring booking(s) created!`, { id: toastId });
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Error creating recurring booking:', error);
            toast.error('Failed to create recurring booking: ' + error.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl max-w-md w-full">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold dark:text-white flex items-center gap-2">
                        <Repeat size={18} className="text-brand-blue" />
                        Create Recurring Booking
                    </h3>
                    <button onClick={onClose}>
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Recurrence Type */}
                    <div>
                        <label className="text-sm font-bold dark:text-white mb-2 block">Repeat</label>
                        <select
                            value={recurrenceType}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRecurrenceType(e.target.value as RecurrenceType)}
                            className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>

                    {/* Interval */}
                    <div>
                        <label className="text-sm font-bold dark:text-white mb-2 block">
                            Every {recurrenceType === 'daily' ? 'X days' : recurrenceType === 'weekly' ? 'X weeks' : 'X months'}
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={interval}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterval(parseInt(e.target.value) || 1)}
                            className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Days of Week (for weekly) */}
                    {recurrenceType === 'weekly' && (
                        <div>
                            <label className="text-sm font-bold dark:text-white mb-2 block">Days of Week</label>
                            <div className="grid grid-cols-7 gap-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleDayToggle(index)}
                                        className={`p-2 rounded-lg text-sm font-medium transition ${
                                            daysOfWeek.includes(index)
                                                ? 'bg-brand-blue text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* End Date */}
                    <div>
                        <label className="text-sm font-bold dark:text-white mb-2 block">End Date (optional)</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Max Occurrences */}
                    <div>
                        <label className="text-sm font-bold dark:text-white mb-2 block">Max Occurrences (optional)</label>
                        <input
                            type="number"
                            min="1"
                            value={maxOccurrences}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxOccurrences(e.target.value)}
                            placeholder="Unlimited if empty"
                            className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border dark:border-gray-600 rounded-lg font-bold dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (recurrenceType === 'weekly' && daysOfWeek.length === 0)}
                            className="flex-1 py-2.5 bg-brand-blue text-white rounded-lg font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save size={16} />
                            Create Recurring
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
