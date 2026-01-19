import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, DollarSign, User, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Download, Plus } from 'lucide-react';

/**
 * ClientPortal - Self-service client portal
 * Phase 2: Advanced booking features
 *
 * Allows clients to:
 * - View upcoming and past bookings
 * - Rebook sessions from templates
 * - View payment history and invoices
 * - Update their profile information
 */
export default function ClientPortal({ user, userData }) {
    const { studioId } = useParams();
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'rebook', 'invoices', 'profile'
    const [bookings, setBookings] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [payments, setPayments] = useState([]);
    const [clientInfo, setClientInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && studioId) {
            Promise.all([
                fetchBookings(),
                fetchTemplates(),
                fetchPayments(),
                fetchClientInfo()
            ]).finally(() => setLoading(false));
        }
    }, [user, studioId]);

    const fetchBookings = async () => {
        try {
            const response = await fetch(`/api/studio-ops/bookings?studioId=${studioId}&clientId=${user.id}&limit=20`);
            const data = await response.json();

            if (data.success) {
                setBookings(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const fetchTemplates = async () => {
        try {
            const response = await fetch(`/api/studio-ops/booking-templates?studioId=${studioId}`);
            const data = await response.json();

            if (data.success) {
                setTemplates(data.data.filter(t => t.is_active));
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const fetchPayments = async () => {
        try {
            const response = await fetch(`/api/studio-ops/booking-payments?studioId=${studioId}`);
            const data = await response.json();

            if (data.success) {
                // Filter payments for this client's bookings
                const clientBookingIds = bookings.map(b => b.id);
                const clientPayments = (data.data || []).filter(p => clientBookingIds.includes(p.booking_id));
                setPayments(clientPayments);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const fetchClientInfo = async () => {
        try {
            const response = await fetch(`/api/studio-ops/clients?studioId=${studioId}&clientId=${user.id}`);
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                setClientInfo(data.data[0]);
            }
        } catch (error) {
            console.error('Error fetching client info:', error);
        }
    };

    const handleRebook = async (template) => {
        const date = prompt('Enter preferred date (YYYY-MM-DD):');
        if (!date) return;

        const time = prompt('Enter preferred start time (HH:MM, e.g., 10:00):');
        if (!time) return;

        try {
            const response = await fetch(`/api/studio-ops/booking-templates/${template.id}/use`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studioId,
                    clientId: user.id,
                    date,
                    startTime: time
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(`Booking created successfully from "${template.name}" template!`);
                fetchBookings();
                setActiveTab('bookings');
            } else {
                alert(`Error: ${data.error || 'Failed to create booking'}`);
            }
        } catch (error) {
            console.error('Error rebooking:', error);
            alert('Failed to create booking. Please try again.');
        }
    };

    const handleDownloadInvoice = async (booking) => {
        // Placeholder for invoice generation
        alert(`Invoice download for booking on ${booking.date} - Feature coming soon!`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Confirmed': { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
            'Completed': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle },
            'Cancelled': { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: XCircle },
            'Declined': { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
            'Pending': { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock }
        };

        const config = statusConfig[status] || statusConfig['Pending'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <RefreshCw className="animate-spin mx-auto mb-4 text-gray-400" size={32} />
                    <p className="text-gray-600 dark:text-gray-400">Loading your portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-[#2c2e36] border-b dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold dark:text-white">Client Portal</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Welcome, {clientInfo?.name || user?.username || 'Client'}
                            </p>
                        </div>
                        {clientInfo && (
                            <div className="text-right">
                                <div className="text-sm text-gray-600 dark:text-gray-400">Client Type</div>
                                <div className="text-lg font-semibold dark:text-white capitalize">
                                    {clientInfo.client_type}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-[#2c2e36] border-b dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'bookings'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            <Calendar size={16} className="inline mr-2" />
                            My Bookings
                        </button>
                        <button
                            onClick={() => setActiveTab('rebook')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'rebook'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            <Plus size={16} className="inline mr-2" />
                            Book a Session
                        </button>
                        <button
                            onClick={() => setActiveTab('invoices')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'invoices'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            <DollarSign size={16} className="inline mr-2" />
                            Invoices & Payments
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'profile'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            <User size={16} className="inline mr-2" />
                            My Profile
                        </button>
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'bookings' && (
                    <BookingsTab
                        bookings={bookings}
                        formatDate={formatDate}
                        getStatusBadge={getStatusBadge}
                        onDownloadInvoice={handleDownloadInvoice}
                    />
                )}

                {activeTab === 'rebook' && (
                    <RebookTab
                        templates={templates}
                        onRebook={handleRebook}
                        formatCurrency={formatCurrency}
                    />
                )}

                {activeTab === 'invoices' && (
                    <InvoicesTab
                        payments={payments}
                        bookings={bookings}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                    />
                )}

                {activeTab === 'profile' && (
                    <ProfileTab
                        clientInfo={clientInfo}
                        user={user}
                        formatCurrency={formatCurrency}
                    />
                )}
            </div>
        </div>
    );
}

/**
 * Bookings Tab Component
 */
function BookingsTab({ bookings, formatDate, getStatusBadge, onDownloadInvoice }) {
    const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'all'

    const now = new Date();

    const filteredBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        if (filter === 'upcoming') return bookingDate >= now;
        if (filter === 'past') return bookingDate < now;
        return true;
    });

    const upcomingCount = bookings.filter(b => new Date(b.date) >= now).length;
    const pastCount = bookings.filter(b => new Date(b.date) < now).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold dark:text-white">My Bookings</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                            filter === 'upcoming'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        Upcoming ({upcomingCount})
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                            filter === 'past'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        Past ({pastCount})
                    </button>
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8 text-center">
                    <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">
                        {filter === 'upcoming' ? 'No upcoming bookings' : filter === 'past' ? 'No past bookings' : 'No bookings found'}
                    </p>
                    {filter === 'upcoming' && (
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Book a Session
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredBookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-lg font-semibold dark:text-white">
                                            {formatDate(booking.date)}
                                        </h3>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div>
                                            <span className="font-medium">Time:</span> {booking.start_time} - {booking.end_time}
                                        </div>
                                        {booking.venue_name && (
                                            <div>
                                                <span className="font-medium">Room:</span> {booking.venue_name}
                                            </div>
                                        )}
                                        {booking.offer_amount && (
                                            <div>
                                                <span className="font-medium">Total:</span> {formatCurrency(booking.offer_amount)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onDownloadInvoice(booking)}
                                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                    <Download size={16} />
                                    Invoice
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Rebook Tab Component
 */
function RebookTab({ templates, onRebook, formatCurrency }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold dark:text-white mb-2">Book a Session</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Choose from our pre-configured booking templates for quick and easy scheduling
                </p>
            </div>

            {templates.length === 0 ? (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8 text-center">
                    <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">No booking templates available</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-5 hover:shadow-lg transition-shadow"
                        >
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold dark:text-white mb-2">{template.name}</h3>
                                {template.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {template.description}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 mb-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Clock size={16} />
                                    {template.duration_hours} hour{template.duration_hours !== 1 ? 's' : ''}
                                </div>
                                <div className="flex items-center gap-2 font-semibold text-green-600 dark:text-green-400">
                                    <span className="text-base">${template.base_price}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => onRebook(template)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <Plus size={16} />
                                Book Now
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Invoices Tab Component
 */
function InvoicesTab({ payments, bookings, formatCurrency, formatDate }) {
    // Group payments by booking
    const paymentsByBooking = payments.reduce((acc, payment) => {
        if (!acc[payment.booking_id]) {
            const booking = bookings.find(b => b.id === payment.booking_id);
            acc[payment.booking_id] = {
                booking,
                payments: [],
                total: 0,
                paid: 0
            };
        }
        acc[payment.booking_id].payments.push(payment);
        acc[payment.booking_id].total += parseFloat(booking?.offer_amount || 0);
        acc[payment.booking_id].paid += payment.status === 'completed' ? parseFloat(payment.amount) : 0;
        return acc;
    }, {});

    const bookingPayments = Object.values(paymentsByBooking);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold dark:text-white mb-2">Invoices & Payments</h2>
                <p className="text-gray-600 dark:text-gray-400">View your payment history and booking invoices</p>
            </div>

            {bookingPayments.length === 0 ? (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8 text-center">
                    <DollarSign size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">No payment history found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookingPayments.map(({ booking, payments: bookingPs, total, paid }) => {
                        const remaining = total - paid;
                        const isFullyPaid = remaining <= 0;

                        return (
                            <div
                                key={booking?.id}
                                className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-5"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold dark:text-white">
                                            {formatDate(booking?.date)}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {booking?.venue_name || 'Studio Session'}
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1 text-sm font-medium rounded-full ${
                                        isFullyPaid
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                        {isFullyPaid ? 'Paid in Full' : 'Payment Pending'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                                    <div>
                                        <div className="text-gray-600 dark:text-gray-400">Total</div>
                                        <div className="text-lg font-semibold dark:text-white">{formatCurrency(total)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600 dark:text-gray-400">Paid</div>
                                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                                            {formatCurrency(paid)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600 dark:text-gray-400">Remaining</div>
                                        <div className={`text-lg font-semibold ${
                                            isFullyPaid
                                                ? 'text-gray-600 dark:text-gray-400'
                                                : 'text-yellow-600 dark:text-yellow-400'
                                        }`}>
                                            {formatCurrency(Math.max(0, remaining))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment History</div>
                                    {bookingPs.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2"
                                        >
                                            <div>
                                                <span className="font-medium dark:text-white capitalize">{payment.payment_type}</span>
                                                <span className="text-gray-600 dark:text-gray-400 ml-2">
                                                    {payment.status === 'completed' ? `paid on ${formatDate(payment.paid_at)}` : `due ${formatDate(payment.due_date)}`}
                                                </span>
                                            </div>
                                            <span className="font-semibold dark:text-white">{formatCurrency(payment.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/**
 * Profile Tab Component
 */
function ProfileTab({ clientInfo, user, formatCurrency }) {
    if (!clientInfo) {
        return (
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8 text-center">
                <User size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">Client profile not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold dark:text-white mb-2">My Profile</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage your client profile information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Info */}
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold dark:text-white mb-4">Contact Information</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400">Name</label>
                            <div className="font-medium dark:text-white">{clientInfo.name || '-'}</div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                            <div className="font-medium dark:text-white">{clientInfo.email || user?.email || '-'}</div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400">Phone</label>
                            <div className="font-medium dark:text-white">{clientInfo.phone || '-'}</div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400">Company</label>
                            <div className="font-medium dark:text-white">{clientInfo.company || '-'}</div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold dark:text-white mb-4">Booking Statistics</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Bookings</span>
                            <span className="font-semibold dark:text-white">{clientInfo.total_bookings || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Spent</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(clientInfo.total_spent || 0)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Client Type</span>
                            <span className="font-semibold dark:text-white capitalize">{clientInfo.client_type}</span>
                        </div>
                        {clientInfo.first_booking_date && (
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">First Booking</span>
                                <span className="font-medium dark:text-white">
                                    {new Date(clientInfo.first_booking_date).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {clientInfo.last_booking_date && (
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Last Booking</span>
                                <span className="font-medium dark:text-white">
                                    {new Date(clientInfo.last_booking_date).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes */}
                {clientInfo.notes && (
                    <div className="md:col-span-2 bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold dark:text-white mb-4">Notes</h3>
                        <p className="text-gray-600 dark:text-gray-400">{clientInfo.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
