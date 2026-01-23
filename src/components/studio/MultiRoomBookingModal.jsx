import React, { useState, useEffect } from 'react';
import { Home, Plus, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { query as neonQuery } from '../../config/neon.js';

/**
 * MultiRoomBookingModal - Assign booking to multiple rooms
 */
export default function MultiRoomBookingModal({ booking, rooms, onClose, onSuccess }) {
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [roomTimeSlots, setRoomTimeSlots] = useState({}); // { roomId: { start, end } }
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Initialize with booking's time if available
        if (booking?.booking_start && booking?.duration) {
            const start = new Date(booking.booking_start);
            const end = new Date(start.getTime() + (booking.duration * 60 * 60 * 1000));
            
            const initialSlots = {};
            selectedRooms.forEach(roomId => {
                initialSlots[roomId] = {
                    start: start.toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format
                    end: end.toISOString().slice(0, 16)
                };
            });
            setRoomTimeSlots(initialSlots);
        }
    }, [selectedRooms, booking]);

    const handleRoomToggle = (roomId) => {
        setSelectedRooms(prev => 
            prev.includes(roomId)
                ? prev.filter(id => id !== roomId)
                : [...prev, roomId]
        );
    };

    const handleTimeChange = (roomId, field, value) => {
        setRoomTimeSlots(prev => ({
            ...prev,
            [roomId]: {
                ...prev[roomId],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!booking || selectedRooms.length === 0) return;

        setLoading(true);
        const toastId = toast.loading('Assigning rooms...');

        try {
            // Create room booking records
            const roomBookings = selectedRooms.map(roomId => {
                const slot = roomTimeSlots[roomId];
                const startTime = slot?.start ? new Date(slot.start) : new Date(booking.booking_start || booking.date);
                const endTime = slot?.end ? new Date(slot.end) : new Date(startTime.getTime() + (booking.duration * 60 * 60 * 1000));

                const room = rooms.find(r => r.id === roomId);
                return {
                    booking_id: booking.id,
                    room_id: roomId,
                    room_name: room?.name || `Room ${roomId}`,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString()
                };
            });

            // Insert room bookings using Neon
            await Promise.all(
                roomBookings.map(rb =>
                    neonQuery(`
                        INSERT INTO room_bookings (
                            booking_id, room_id, room_name, start_time, end_time
                        ) VALUES ($1, $2, $3, $4, $5)
                    `, [
                        rb.booking_id,
                        rb.room_id,
                        rb.room_name,
                        rb.start_time,
                        rb.end_time
                    ])
                )
            );

            toast.success(`${selectedRooms.length} room(s) assigned!`, { id: toastId });
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error assigning rooms:', error);
            toast.error('Failed to assign rooms: ' + error.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold dark:text-white flex items-center gap-2">
                        <Home size={18} className="text-brand-blue" />
                        Assign Rooms
                    </h3>
                    <button onClick={onClose}>
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Room Selection */}
                    <div>
                        <label className="text-sm font-bold dark:text-white mb-2 block">Select Rooms</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {rooms.map(room => (
                                <div
                                    key={room.id}
                                    className={`p-3 border rounded-lg cursor-pointer transition ${
                                        selectedRooms.includes(room.id)
                                            ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                    }`}
                                    onClick={() => handleRoomToggle(room.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium dark:text-white">{room.name}</div>
                                            <div className="text-xs text-gray-500">
                                                ${room.rate}/hr • {room.capacity} people
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedRooms.includes(room.id)}
                                            onChange={() => handleRoomToggle(room.id)}
                                            className="w-4 h-4 text-brand-blue"
                                        />
                                    </div>
                                    
                                    {/* Time Slot (if selected) */}
                                    {selectedRooms.includes(room.id) && (
                                        <div className="mt-3 pt-3 border-t dark:border-gray-600 grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Start</label>
                                                <input
                                                    type="datetime-local"
                                                    value={roomTimeSlots[room.id]?.start || ''}
                                                    onChange={(e) => handleTimeChange(room.id, 'start', e.target.value)}
                                                    className="w-full p-1.5 text-sm border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">End</label>
                                                <input
                                                    type="datetime-local"
                                                    value={roomTimeSlots[room.id]?.end || ''}
                                                    onChange={(e) => handleTimeChange(room.id, 'end', e.target.value)}
                                                    className="w-full p-1.5 text-sm border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
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
                            disabled={loading || selectedRooms.length === 0}
                            className="flex-1 py-2.5 bg-brand-blue text-white rounded-lg font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save size={16} />
                            Assign {selectedRooms.length > 0 ? `(${selectedRooms.length})` : ''}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

