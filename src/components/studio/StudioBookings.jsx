import { useState, useEffect } from 'react';
import { 
    Calendar, User, Check, X, MessageSquare, 
    Search, RefreshCw,
    CheckCircle, XCircle, Clock3, Eye
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    pending: { 
        label: 'Pending', 
        color: 'amber', 
        icon: Clock3,
        bgClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
    },
    confirmed: { 
        label: 'Confirmed', 
        color: 'green', 
        icon: CheckCircle,
        bgClass: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    },
    cancelled: { 
        label: 'Cancelled', 
        color: 'red', 
        icon: XCircle,
        bgClass: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    },
    completed: { 
        label: 'Completed', 
        color: 'blue', 
        icon: Check,
        bgClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    },
};

/**
 * StudioBookings - Manage incoming bookings for the studio
 */
export default function StudioBookings({ user, onNavigateToChat }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [updating, setUpdating] = useState(null);

    // Fetch bookings from Firestore
    useEffect(() => {
        if (!user?.uid) return;

        const bookingsRef = collection(db, `artifacts/${appId}/bookings`);
        const q = query(
            bookingsRef,
            where('studioOwnerId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const bookingsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore timestamps
                date: doc.data().date?.toDate?.() || new Date(doc.data().date),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));
            setBookings(bookingsData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching bookings:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    const handleUpdateStatus = async (bookingId, newStatus) => {
        setUpdating(bookingId);
        const toastId = toast.loading(`Updating booking...`);
        
        try {
            const bookingRef = doc(db, `artifacts/${appId}/bookings/${bookingId}`);
            await updateDoc(bookingRef, { 
                status: newStatus,
                updatedAt: Timestamp.now(),
                [`${newStatus}At`]: Timestamp.now()
            });
            toast.success(`Booking ${newStatus}!`, { id: toastId });
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update booking', { id: toastId });
        } finally {
            setUpdating(null);
        }
    };

    // Filter and search bookings
    const filteredBookings = bookings.filter(booking => {
        const matchesFilter = filter === 'all' || booking.status === filter;
        const matchesSearch = !searchTerm || 
            booking.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.roomName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Group bookings by date
    const groupedBookings = filteredBookings.reduce((groups, booking) => {
        const dateKey = booking.date.toDateString();
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(booking);
        return groups;
    }, {});

    // Stats
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const todayBookings = bookings.filter(b => {
        const today = new Date().toDateString();
        return b.date.toDateString() === today && b.status === 'confirmed';
    }).length;
    const upcomingRevenue = bookings
        .filter(b => b.status === 'confirmed' && b.date >= new Date())
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="animate-spin text-brand-blue" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Calendar className="text-brand-blue" size={24} />
                        Booking Management
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {bookings.length} total bookings
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</div>
                    <div className="text-sm text-amber-700 dark:text-amber-300">Pending Approval</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{todayBookings}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Today&apos;s Sessions</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">${upcomingRevenue.toLocaleString()}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Upcoming Revenue</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-[#2c2e36] p-4 rounded-xl border dark:border-gray-700">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by client or room..."
                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                                filter === status
                                    ? 'bg-brand-blue text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            {status === 'pending' && pendingCount > 0 && (
                                <span className="ml-1.5 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-12 text-center">
                    <Calendar size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-bold dark:text-white mb-2">No Bookings Found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        {filter !== 'all' ? `No ${filter} bookings` : 'Bookings will appear here when clients book your studio'}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedBookings).map(([dateKey, dateBookings]) => (
                        <div key={dateKey}>
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <Calendar size={14} />
                                {new Date(dateKey).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                                <span className="text-gray-400">({dateBookings.length})</span>
                            </h3>
                            <div className="space-y-3">
                                {dateBookings.map(booking => {
                                    const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                                    
                                    return (
                                        <div 
                                            key={booking.id}
                                            className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden"
                                        >
                                            <div className="p-4 flex items-center gap-4">
                                                {/* Time */}
                                                <div className="text-center min-w-[70px]">
                                                    <div className="text-lg font-bold dark:text-white">
                                                        {booking.startTime}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {booking.duration}h
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold dark:text-white truncate">
                                                            {booking.clientName || 'Unknown Client'}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bgClass}`}>
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {booking.roomName || 'Main Room'} • ${booking.totalPrice || 0}
                                                    </div>
                                                    {booking.notes && (
                                                        <div className="text-xs text-gray-400 mt-1 truncate">
                                                            Note: {booking.notes}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    {booking.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                                disabled={updating === booking.id}
                                                                className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                                                                title="Approve"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                                disabled={updating === booking.id}
                                                                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                                                                title="Decline"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {booking.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                                            disabled={updating === booking.id}
                                                            className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition text-sm font-medium"
                                                        >
                                                            Mark Complete
                                                        </button>
                                                    )}
                                                    {booking.clientId && onNavigateToChat && (
                                                        <button
                                                            onClick={() => onNavigateToChat(booking.clientId)}
                                                            className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                            title="Message Client"
                                                        >
                                                            <MessageSquare size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedBooking(booking)}
                                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#2c2e36] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold dark:text-white">Booking Details</h3>
                            <button onClick={() => setSelectedBooking(null)}>
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center">
                                    <User className="text-brand-blue" size={24} />
                                </div>
                                <div>
                                    <div className="font-bold dark:text-white">{selectedBooking.clientName}</div>
                                    <div className="text-sm text-gray-500">{selectedBooking.clientEmail}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-[#1f2128] p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Date</div>
                                    <div className="dark:text-white">
                                        {selectedBooking.date.toLocaleDateString('en-US', { 
                                            weekday: 'short', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#1f2128] p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Time</div>
                                    <div className="dark:text-white">
                                        {selectedBooking.startTime} ({selectedBooking.duration}h)
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#1f2128] p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Room</div>
                                    <div className="dark:text-white">{selectedBooking.roomName}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#1f2128] p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Total</div>
                                    <div className="dark:text-white font-bold text-green-600">${selectedBooking.totalPrice}</div>
                                </div>
                            </div>

                            {selectedBooking.notes && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                                    <div className="text-xs text-amber-600 uppercase font-bold mb-1">Client Notes</div>
                                    <div className="text-amber-800 dark:text-amber-300 text-sm">{selectedBooking.notes}</div>
                                </div>
                            )}

                            <div className="text-xs text-gray-400">
                                Booked {selectedBooking.createdAt.toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
