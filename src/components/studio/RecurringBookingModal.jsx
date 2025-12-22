import React, { useState } from 'react';
import { Calendar, Repeat, X, Save } from 'lucide-react';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';

/**
 * RecurringBookingModal - Create recurring bookings
 */
export default function RecurringBookingModal({ booking, onClose, onSuccess }) {
    const [recurrenceType, setRecurrenceType] = useState('weekly');
    const [interval, setInterval] = useState(1); // Every X weeks/days/months
    const [daysOfWeek, setDaysOfWeek] = useState([]); // For weekly: [1,3,5] = Mon, Wed, Fri
    const [endDate, setEndDate] = useState('');
    const [maxOccurrences, setMaxOccurrences] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDayToggle = (day) => {
        setDaysOfWeek(prev => 
            prev.includes(day) 
                ? prev.filter(d => d !== day)
                : [...prev, day].sort()
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!booking || !supabase) return;

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

            const recurrencePattern = {
                type: recurrenceType,
                interval,
                daysOfWeek: recurrenceType === 'weekly' ? daysOfWeek : null,
            };

            // Create recurring booking record
            const { data: recurringBooking, error } = await supabase
                .from('recurring_bookings')
                .insert({
                    parent_booking_id: booking.id,
                    studio_id: booking.studio_owner_id || booking.target_id,
                    sender_id: booking.sender_id,
                    recurrence_type: recurrenceType,
                    recurrence_pattern: recurrencePattern,
                    start_date: bookingDate.toISOString().split('T')[0],
                    end_date: endDate || null,
                    next_occurrence: nextOccurrence.toISOString().split('T')[0],
                    max_occurrences: maxOccurrences ? parseInt(maxOccurrences) : null,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;

            toast.success('Recurring booking created!', { id: toastId });
            onSuccess?.();
            onClose();
        } catch (error) {
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
                            onChange={(e) => setRecurrenceType(e.target.value)}
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
                            onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
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
                            onChange={(e) => setEndDate(e.target.value)}
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
                            onChange={(e) => setMaxOccurrences(e.target.value)}
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

