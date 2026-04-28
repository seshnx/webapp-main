import { useState } from 'react';
import {
    Home, MapPin, DollarSign, Users, Calendar,
    AlertCircle, CheckCircle, Star, ChevronLeft, ChevronRight
} from 'lucide-react';

/**
 * Room interface
 */
interface Room {
    name: string;
    capacity: number;
    rate: number;
    equipment?: string;
}

/**
 * Stats interface
 */
interface StudioStats {
    pendingBookings?: number;
    recentBookings?: Booking[];
}

/**
 * Booking interface
 */
interface Booking {
    clientName?: string;
    date: string | Date;
    status?: string;
}

/**
 * User data interface
 */
interface UserData {
    studioName?: string;
    profileName?: string;
    city?: string;
    state?: string;
    studioDescription?: string;
    rooms?: Room[];
    amenities?: string[];
}

/**
 * MiniCalendar props
 */
interface MiniCalendarProps {
    currentDate: Date;
    bookings?: Booking[];
    onNavigate?: (tab: string) => void;
}

/**
 * StudioOverview props
 */
export interface StudioOverviewProps {
    userData?: UserData;
    stats?: StudioStats;
    onNavigate?: (tab: string) => void;
}

/**
 * StudioOverview - Dashboard view for studio stats and quick actions
 */
export default function StudioOverview({ userData, stats, onNavigate }: StudioOverviewProps) {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const studioName = userData?.studioName || userData?.profileName || 'My Studio';
    const rooms = userData?.rooms || [];
    const amenities = userData?.amenities || [];

    // Calculate stats
    const totalCapacity = rooms.reduce((sum: number, r: Room) => sum + (r.capacity || 0), 0);
    const avgRate = rooms.length > 0
        ? Math.round(rooms.reduce((sum: number, r: Room) => sum + (r.rate || 0), 0) / rooms.length)
        : 0;

    const quickStats = [
        {
            label: 'Active Rooms',
            value: rooms.length,
            icon: <Home size={20} />,
            color: 'blue',
            onClick: () => onNavigate?.('rooms')
        },
        {
            label: 'Total Capacity',
            value: `${totalCapacity} ppl`,
            icon: <Users size={20} />,
            color: 'green'
        },
        {
            label: 'Avg. Rate',
            value: `$${avgRate}/hr`,
            icon: <DollarSign size={20} />,
            color: 'purple'
        },
        {
            label: 'Amenities',
            value: amenities.length,
            icon: <Star size={20} />,
            color: 'amber'
        },
    ];

    const pendingBookings = stats?.pendingBookings || 0;

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Studio Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Home size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{studioName}</h1>
                            <p className="text-blue-100 text-sm flex items-center gap-1">
                                <MapPin size={14} />
                                {userData?.city && userData?.state
                                    ? `${userData.city}, ${userData.state}`
                                    : 'Location not set'}
                            </p>
                        </div>
                    </div>
                    {userData?.studioDescription && (
                        <p className="text-blue-100 text-sm mt-4 max-w-2xl line-clamp-2">
                            {userData.studioDescription}
                        </p>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickStats.map((stat, i) => (
                    <button
                        key={i}
                        onClick={stat.onClick}
                        className={`bg-white dark:bg-[#2c2e36] p-5 rounded-xl border dark:border-gray-700 shadow-sm text-left transition-all ${stat.onClick ? 'hover:shadow-md hover:border-brand-blue cursor-pointer' : ''}`}
                    >
                        <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400 mb-3`}>
                            {stat.icon}
                        </div>
                        <div className="text-2xl font-bold dark:text-white">{stat.value}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium tracking-wide">
                            {stat.label}
                        </div>
                    </button>
                ))}
            </div>

            {/* Alerts & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Actions */}
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-[#23262f]">
                        <h3 className="font-bold dark:text-white flex items-center gap-2">
                            <AlertCircle size={18} className="text-amber-500" />
                            Pending Actions
                        </h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {pendingBookings > 0 ? (
                            <button
                                onClick={() => onNavigate?.('bookings')}
                                className="w-full flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-amber-600" size={18} />
                                    <span className="text-sm font-medium dark:text-amber-300">
                                        {pendingBookings} Pending Booking{pendingBookings > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <span className="text-xs text-amber-600 font-bold">Review →</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <CheckCircle className="text-green-600" size={18} />
                                <span className="text-sm text-green-700 dark:text-green-300">All caught up!</span>
                            </div>
                        )}

                        {!userData?.studioDescription && (
                            <button
                                onClick={() => onNavigate?.('settings')}
                                className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                            >
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Add studio description</span>
                                <span className="text-xs text-blue-600 font-bold">Setup →</span>
                            </button>
                        )}

                        {rooms.length === 0 && (
                            <button
                                onClick={() => onNavigate?.('rooms')}
                                className="w-full flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
                            >
                                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Add your first room</span>
                                <span className="text-xs text-purple-600 font-bold">Add →</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Room Summary */}
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-[#23262f] flex justify-between items-center">
                        <h3 className="font-bold dark:text-white flex items-center gap-2">
                            <Home size={18} className="text-brand-blue" />
                            Rooms
                        </h3>
                        <button
                            onClick={() => onNavigate?.('rooms')}
                            className="text-xs text-brand-blue font-bold hover:underline"
                        >
                            Manage →
                        </button>
                    </div>
                    <div className="p-4">
                        {rooms.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                <Home size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No rooms configured yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {rooms.slice(0, 4).map((room, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1f2128] rounded-lg"
                                    >
                                        <div>
                                            <div className="font-medium dark:text-white text-sm">{room.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {room.capacity} people • {room.equipment ? room.equipment.split(',').length : 0} gear items
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-green-600 dark:text-green-400">${room.rate}/hr</div>
                                        </div>
                                    </div>
                                ))}
                                {rooms.length > 4 && (
                                    <p className="text-xs text-center text-gray-400 pt-2">
                                        +{rooms.length - 4} more rooms
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Amenities Preview */}
            {amenities.length > 0 && (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-5">
                    <h3 className="font-bold dark:text-white mb-3 flex items-center gap-2">
                        <Star size={18} className="text-amber-500" />
                        Studio Amenities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {amenities.map((amenity, i) => (
                            <span
                                key={i}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                            >
                                {amenity}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Calendar Preview */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-[#23262f] flex justify-between items-center">
                    <h3 className="font-bold dark:text-white flex items-center gap-2">
                        <Calendar size={18} className="text-brand-blue" />
                        Booking Calendar
                    </h3>
                    <button
                        onClick={() => onNavigate?.('bookings')}
                        className="text-xs text-brand-blue font-bold hover:underline"
                    >
                        View All →
                    </button>
                </div>
                <div className="p-4">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                            <ChevronLeft size={18} className="text-gray-500" />
                        </button>
                        <span className="font-bold dark:text-white">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                            <ChevronRight size={18} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <MiniCalendar
                        currentDate={currentDate}
                        bookings={stats?.recentBookings || []}
                        onNavigate={onNavigate}
                    />

                    {/* Upcoming Bookings */}
                    {stats?.recentBookings && stats.recentBookings.length > 0 && (
                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                            <div className="text-xs font-bold text-gray-500 uppercase mb-2">Upcoming Sessions</div>
                            <div className="space-y-2">
                                {stats.recentBookings.slice(0, 3).map((booking, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#1f2128] rounded-lg text-sm"
                                    >
                                        <div>
                                            <span className="font-medium dark:text-white">{booking.clientName || 'Client'}</span>
                                            <span className="text-gray-500 ml-2">
                                                {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            booking.status === 'confirmed'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                        }`}>
                                            {booking.status || 'pending'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Mini Calendar Component
function MiniCalendar({ currentDate, bookings = [], onNavigate }: MiniCalendarProps) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create calendar days array
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    // Check if a day has bookings
    const getDayBookings = (day: number | null): Booking[] => {
        if (!day) return [];
        const dayDate = new Date(year, month, day);
        return bookings.filter((b: Booking) => {
            const bookingDate = new Date(b.date);
            return bookingDate.getDate() === day &&
                   bookingDate.getMonth() === month &&
                   bookingDate.getFullYear() === year;
        });
    };

    const isToday = (day: number | null): boolean => {
        if (!day) return false;
        return day === today.getDate() &&
               month === today.getMonth() &&
               year === today.getFullYear();
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-gray-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    const dayBookings = getDayBookings(day);
                    const hasBookings = dayBookings.length > 0;
                    const hasConfirmed = dayBookings.some((b: Booking) => b.status === 'confirmed');
                    const hasPending = dayBookings.some((b: Booking) => b.status === 'pending');

                    return (
                        <button
                            key={i}
                            onClick={() => day && hasBookings && onNavigate?.('bookings')}
                            disabled={!day}
                            className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative transition ${
                                !day ? '' :
                                isToday(day) ? 'bg-brand-blue text-white font-bold' :
                                hasBookings ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer' :
                                'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {day}
                            {hasBookings && !isToday(day) && (
                                <div className="flex gap-0.5 mt-0.5">
                                    {hasConfirmed && <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>}
                                    {hasPending && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Confirmed
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    Pending
                </div>
            </div>
        </div>
    );
}
