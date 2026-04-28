import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Plus, Edit2, Trash2, Check, Clock, AlertCircle, X, Calendar } from 'lucide-react';

/**
 * BookingPayments - Manage payments, deposits, and partial payments
 * Phase 2: Advanced booking features
 */
export default function BookingPayments({ user, userData, bookingId }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [formData, setFormData] = useState({
        paymentType: 'deposit',
        amount: 100,
        dueDate: '',
        paymentIntentId: ''
    });

    useEffect(() => {
        fetchPayments();
    }, [bookingId]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const url = bookingId
                ? `/api/studio-ops/booking-payments?bookingId=${bookingId}`
                : `/api/studio-ops/booking-payments?studioId=${userData?.id}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setPayments(data.data);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePayment = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/studio-ops/booking-payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId,
                    paymentType: formData.paymentType,
                    amount: formData.amount,
                    dueDate: formData.dueDate || null,
                    paymentIntentId: formData.paymentIntentId || null
                })
            });

            const data = await response.json();

            if (data.success) {
                setPayments([...payments, data.data]);
                setShowAddModal(false);
                resetForm();
            } else {
                alert(`Error: ${data.error || 'Failed to create payment'}`);
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            alert('Failed to create payment. Please try again.');
        }
    };

    const handleUpdatePayment = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/studio-ops/booking-payments/${selectedPayment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setPayments(payments.map(p => p.id === selectedPayment.id ? data.data : p));
                setShowEditModal(false);
                setSelectedPayment(null);
                resetForm();
            } else {
                alert(`Error: ${data.error || 'Failed to update payment'}`);
            }
        } catch (error) {
            console.error('Error updating payment:', error);
            alert('Failed to update payment. Please try again.');
        }
    };

    const handleDeletePayment = async (paymentId) => {
        const payment = payments.find(p => p.id === paymentId);

        if (payment.status === 'completed') {
            alert('Cannot delete completed payments. Please create a refund instead.');
            return;
        }

        if (!confirm(`Are you sure you want to delete this ${payment.payment_type} payment of $${payment.amount}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/studio-ops/booking-payments/${paymentId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setPayments(payments.filter(p => p.id !== paymentId));
            } else {
                alert(`Error: ${data.error || 'Failed to delete payment'}`);
            }
        } catch (error) {
            console.error('Error deleting payment:', error);
            alert('Failed to delete payment. Please try again.');
        }
    };

    const handleConfirmPayment = async (paymentId) => {
        if (!confirm('Mark this payment as received? This will update payment records and booking status.')) {
            return;
        }

        try {
            const response = await fetch(`/api/studio-ops/booking-payments/${paymentId}/confirm`, {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                setPayments(payments.map(p => p.id === paymentId ? data.data.payment : p));
                alert(data.message);
            } else {
                alert(`Error: ${data.error || 'Failed to confirm payment'}`);
            }
        } catch (error) {
            console.error('Error confirming payment:', error);
            alert('Failed to confirm payment. Please try again.');
        }
    };

    const openEditModal = (payment) => {
        setSelectedPayment(payment);
        setFormData({
            paymentType: payment.payment_type,
            amount: parseFloat(payment.amount),
            dueDate: payment.due_date ? payment.due_date.split('T')[0] : '',
            paymentIntentId: payment.payment_intent_id || ''
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            paymentType: 'deposit',
            amount: 100,
            dueDate: '',
            paymentIntentId: ''
        });
    };

    const getStatusBadge = (payment) => {
        const statusConfig = {
            pending: {
                label: 'Pending',
                color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                icon: Clock
            },
            processing: {
                label: 'Processing',
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                icon: Clock
            },
            completed: {
                label: 'Paid',
                color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                icon: Check
            },
            failed: {
                label: 'Failed',
                color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                icon: X
            },
            refunded: {
                label: 'Refunded',
                color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                icon: X
            }
        };

        const config = statusConfig[payment.status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    const getPaymentTypeBadge = (type) => {
        const typeConfig = {
            deposit: {
                label: 'Deposit',
                color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            },
            partial: {
                label: 'Partial',
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            },
            full: {
                label: 'Full Payment',
                color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            },
            refund: {
                label: 'Refund',
                color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }
        };

        const config = typeConfig[type] || typeConfig.partial;

        return (
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No due date';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Calculate totals
    const totals = payments.reduce((acc, payment) => {
        const amount = parseFloat(payment.amount || 0);
        acc.total += amount;
        if (payment.status === 'completed') {
            acc.paid += amount;
        } else if (payment.status === 'pending' || payment.status === 'processing') {
            acc.pending += amount;
        }
        return acc;
    }, { total: 0, paid: 0, pending: 0 });

    const bookingTotal = payments[0]?.booking_total || 0;
    const remainingBalance = Math.max(0, bookingTotal - totals.paid);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                                <CreditCard size={20} />
                            </div>
                            Booking Payments
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage deposits, partial payments, and refunds
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                        <Plus size={18} />
                        Add Payment
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-2xl font-bold dark:text-white">{formatCurrency(bookingTotal)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Booking Total</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totals.paid)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Paid</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatCurrency(totals.pending)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(remainingBalance)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
                    </div>
                </div>
            </div>

            {/* Payments List */}
            {loading ? (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8 text-center text-gray-600 dark:text-gray-400">
                    Loading payments...
                </div>
            ) : payments.length === 0 ? (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8 text-center text-gray-600 dark:text-gray-400">
                    <CreditCard size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="font-semibold mb-2">No payments found</p>
                    <p className="text-sm">Add a payment to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {payments.map((payment) => (
                        <div
                            key={payment.id}
                            className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {/* Payment Info */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                                            <DollarSign size={20} className="text-green-600" />
                                            {formatCurrency(payment.amount)}
                                        </h3>
                                        {getPaymentTypeBadge(payment.payment_type)}
                                        {getStatusBadge(payment)}
                                    </div>

                                    {/* Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div className="text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">Due Date:</span> {formatDate(payment.due_date)}
                                        </div>
                                        {payment.paid_at && (
                                            <div className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Paid On:</span> {formatDate(payment.paid_at)}
                                            </div>
                                        )}
                                        {payment.client_name && (
                                            <div className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Client:</span> {payment.client_name}
                                            </div>
                                        )}
                                        {payment.booking_date && (
                                            <div className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Booking:</span> {payment.booking_date} at {payment.booking_start_time}
                                            </div>
                                        )}
                                        {payment.payment_intent_id && (
                                            <div className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Stripe Intent:</span> {payment.payment_intent_id}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 ml-4">
                                    {payment.status === 'pending' && (
                                        <button
                                            onClick={() => handleConfirmPayment(payment.id)}
                                            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                                        >
                                            <Check size={16} />
                                            Confirm
                                        </button>
                                    )}
                                    <button
                                        onClick={() => openEditModal(payment)}
                                        className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                        title="Edit payment"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeletePayment(payment.id)}
                                        className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                        title="Delete payment"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Payment Modal */}
            {showAddModal && (
                <PaymentFormModal
                    mode="add"
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleCreatePayment}
                    onClose={() => {
                        setShowAddModal(false);
                        resetForm();
                    }}
                />
            )}

            {/* Edit Payment Modal */}
            {showEditModal && selectedPayment && (
                <PaymentFormModal
                    mode="edit"
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleUpdatePayment}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedPayment(null);
                        resetForm();
                    }}
                />
            )}
        </div>
    );
}

/**
 * Payment Form Modal Component
 */
function PaymentFormModal({ mode, formData, setFormData, onSubmit, onClose }) {
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!formData.paymentType) {
            newErrors.paymentType = 'Payment type is required';
        }
        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(e);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-xl font-bold dark:text-white">
                        {mode === 'add' ? 'Add Payment' : 'Edit Payment'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                        <X size={20} className="dark:text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Payment Type *
                        </label>
                        <select
                            value={formData.paymentType}
                            onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 ${
                                errors.paymentType ? 'border-red-500' : 'dark:border-gray-600'
                            }`}
                        >
                            <option value="deposit">Deposit</option>
                            <option value="partial">Partial Payment</option>
                            <option value="full">Full Payment</option>
                            <option value="refund">Refund</option>
                        </select>
                        {errors.paymentType && <p className="text-sm text-red-600 mt-1">{errors.paymentType}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Amount ($) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 ${
                                errors.amount ? 'border-red-500' : 'dark:border-gray-600'
                            }`}
                        />
                        {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Stripe Payment Intent ID
                        </label>
                        <input
                            type="text"
                            value={formData.paymentIntentId}
                            onChange={(e) => setFormData({ ...formData, paymentIntentId: e.target.value })}
                            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500"
                            placeholder="pi_..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                            {mode === 'add' ? 'Add Payment' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
