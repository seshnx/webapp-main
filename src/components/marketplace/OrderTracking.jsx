import { useState } from 'react';
import { 
    Package, Truck, CheckCircle, Clock, AlertCircle,
    Download, MessageSquare, Star, ChevronDown, ChevronUp,
    X, ExternalLink, Shield, RefreshCw, Loader2
} from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { ReviewForm, StarRating } from './SellerReviews';

const STATUS_CONFIG = {
    pending: { 
        label: 'Pending', 
        color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
        icon: Clock,
        description: 'Waiting for confirmation'
    },
    processing: { 
        label: 'Processing', 
        color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
        icon: RefreshCw,
        description: 'Order is being prepared'
    },
    paid: { 
        label: 'Paid', 
        color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
        icon: CheckCircle,
        description: 'Payment confirmed'
    },
    shipped: { 
        label: 'Shipped', 
        color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
        icon: Truck,
        description: 'On the way to you'
    },
    delivered: { 
        label: 'Delivered', 
        color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
        icon: CheckCircle,
        description: 'Order delivered'
    },
    completed: { 
        label: 'Completed', 
        color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
        icon: CheckCircle,
        description: 'Order complete'
    },
    cancelled: { 
        label: 'Cancelled', 
        color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20',
        icon: X,
        description: 'Order was cancelled'
    },
    disputed: { 
        label: 'Disputed', 
        color: 'text-red-600 bg-red-100 dark:bg-red-900/20',
        icon: AlertCircle,
        description: 'Under review'
    },
    escrow_held: { 
        label: 'In Escrow', 
        color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
        icon: Shield,
        description: 'Funds held securely'
    },
    escrow_released: { 
        label: 'Escrow Released', 
        color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
        icon: CheckCircle,
        description: 'Funds released to seller'
    }
};

/**
 * Order Status Badge
 */
export function OrderStatusBadge({ status }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${config.color}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
}

/**
 * Order Progress Timeline
 */
function OrderTimeline({ order }) {
    const isDigital = order.orderType === 'digital';
    
    const digitalSteps = [
        { key: 'pending', label: 'Order Placed' },
        { key: 'paid', label: 'Payment Confirmed' },
        { key: 'completed', label: 'Download Ready' }
    ];

    const physicalSteps = [
        { key: 'pending', label: 'Order Placed' },
        { key: 'processing', label: 'Processing' },
        { key: 'shipped', label: 'Shipped' },
        { key: 'delivered', label: 'Delivered' }
    ];

    const steps = isDigital ? digitalSteps : physicalSteps;
    const currentIndex = steps.findIndex(s => s.key === order.status);

    return (
        <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700" />
            <div 
                className="absolute left-3 top-4 w-0.5 bg-green-500 transition-all"
                style={{ height: `${Math.max(0, currentIndex) * 100 / (steps.length - 1)}%` }}
            />

            {/* Steps */}
            <div className="space-y-6">
                {steps.map((step, index) => {
                    const isComplete = index <= currentIndex && currentIndex >= 0;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={step.key} className="flex items-start gap-4">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center relative z-10 ${
                                isComplete 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                            }`}>
                                {isComplete ? <CheckCircle size={14} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                            </div>
                            <div className={`flex-1 ${isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                <div className={`font-medium ${isCurrent ? 'text-green-600' : ''}`}>
                                    {step.label}
                                </div>
                                {isCurrent && order.status === 'shipped' && order.trackingNumber && (
                                    <div className="text-sm mt-1">
                                        <span className="text-gray-500">Tracking: </span>
                                        <a 
                                            href={`https://www.google.com/search?q=${order.shippingCarrier}+tracking+${order.trackingNumber}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-brand-blue hover:underline flex items-center gap-1 inline-flex"
                                        >
                                            {order.trackingNumber}
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Single Order Card
 */
function OrderCard({ order, userId, userName, userPhoto, onMessageSeller }) {
    const [expanded, setExpanded] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [disputeReason, setDisputeReason] = useState('');
    const [showDisputeForm, setShowDisputeForm] = useState(false);
    const { releaseEscrow, disputeOrder, markDelivered, loading } = useOrders(userId);

    const canDispute = ['paid', 'shipped', 'escrow_held'].includes(order.status);
    const canReleaseEscrow = order.useEscrow && order.status === 'escrow_held';
    const canMarkDelivered = order.status === 'shipped';
    const canReview = ['completed', 'delivered', 'escrow_released'].includes(order.status) && !order.buyerReviewed;

    const formattedDate = order.createdAt instanceof Date 
        ? order.createdAt.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'Unknown date';

    return (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div 
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <Package size={20} className="text-gray-400" />
                        </div>
                        <div>
                            <div className="font-medium dark:text-white flex items-center gap-2">
                                Order #{order.id.slice(0, 8)}
                                <OrderStatusBadge status={order.status} />
                            </div>
                            <div className="text-xs text-gray-500">{formattedDate}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="font-bold dark:text-white">${order.total}</div>
                            <div className="text-xs text-gray-500">{order.itemCount} item{order.itemCount > 1 ? 's' : ''}</div>
                        </div>
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="border-t dark:border-gray-700">
                    {/* Items */}
                    <div className="p-4 space-y-3">
                        <h4 className="text-sm font-bold text-gray-500 uppercase">Items</h4>
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                <div>
                                    <div className="font-medium dark:text-white">{item.title}</div>
                                    <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-medium dark:text-white">${item.price}</span>
                                    {item.downloadUrl && order.status !== 'cancelled' && (
                                        <a 
                                            href={item.downloadUrl}
                                            download
                                            className="flex items-center gap-1 text-brand-blue hover:underline text-sm"
                                        >
                                            <Download size={14} />
                                            Download
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Timeline */}
                    <div className="p-4 border-t dark:border-gray-700">
                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">Order Progress</h4>
                        <OrderTimeline order={order} />
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                        <div className="p-4 border-t dark:border-gray-700 bg-purple-50 dark:bg-purple-900/10">
                            <h4 className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
                                <Truck size={16} />
                                Tracking Information
                            </h4>
                            <div className="text-sm">
                                <span className="text-gray-500">Carrier: </span>
                                <span className="dark:text-white">{order.shippingCarrier}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-gray-500">Tracking #: </span>
                                <a 
                                    href={`https://www.google.com/search?q=${order.shippingCarrier}+tracking+${order.trackingNumber}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-blue hover:underline"
                                >
                                    {order.trackingNumber}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="p-4 border-t dark:border-gray-700 space-y-3">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => onMessageSeller?.(order.sellerId)}
                                className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                            >
                                <MessageSquare size={14} />
                                Message Seller
                            </button>

                            {canMarkDelivered && (
                                <button
                                    onClick={() => markDelivered(order.id)}
                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition"
                                >
                                    <CheckCircle size={14} />
                                    Confirm Delivery
                                </button>
                            )}

                            {canReleaseEscrow && (
                                <button
                                    onClick={() => releaseEscrow(order.id)}
                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition"
                                >
                                    <Shield size={14} />
                                    Release Escrow
                                </button>
                            )}

                            {canReview && (
                                <button
                                    onClick={() => setShowReviewForm(true)}
                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition"
                                >
                                    <Star size={14} />
                                    Leave Review
                                </button>
                            )}

                            {canDispute && (
                                <button
                                    onClick={() => setShowDisputeForm(true)}
                                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                    <AlertCircle size={14} />
                                    Report Issue
                                </button>
                            )}
                        </div>

                        {/* Dispute Form */}
                        {showDisputeForm && (
                            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg">
                                <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Report an Issue</h4>
                                <textarea
                                    value={disputeReason}
                                    onChange={(e) => setDisputeReason(e.target.value)}
                                    placeholder="Describe the issue with your order..."
                                    className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white resize-none"
                                    rows={3}
                                />
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => setShowDisputeForm(false)}
                                        className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            disputeOrder(order.id, disputeReason);
                                            setShowDisputeForm(false);
                                        }}
                                        disabled={!disputeReason.trim()}
                                        className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                                    >
                                        Submit Dispute
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Review Form Modal */}
                        {showReviewForm && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
                                <div className="w-full max-w-md">
                                    <ReviewForm
                                        sellerId={order.sellerId}
                                        userId={userId}
                                        userName={userName}
                                        userPhoto={userPhoto}
                                        orderId={order.id}
                                        itemId={order.items?.[0]?.itemId}
                                        itemTitle={order.items?.[0]?.title}
                                        onSuccess={() => setShowReviewForm(false)}
                                        onCancel={() => setShowReviewForm(false)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Main Order Tracking View
 */
export default function OrderTracking({ user, userData, onMessageSeller }) {
    const { orders, loading, orderStats } = useOrders(user?.uid, 'buyer');
    const [filter, setFilter] = useState('all');

    const filteredOrders = filter === 'all' 
        ? orders 
        : orders.filter(o => o.status === filter);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Package size={24} />
                        My Orders
                    </h2>
                    <p className="text-sm text-gray-500">
                        Track and manage your purchases
                    </p>
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                    <div className="text-center px-4">
                        <div className="text-2xl font-bold dark:text-white">{orderStats.total}</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center px-4 border-l dark:border-gray-700">
                        <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
                        <div className="text-xs text-gray-500">Pending</div>
                    </div>
                    <div className="text-center px-4 border-l dark:border-gray-700">
                        <div className="text-2xl font-bold text-green-600">{orderStats.completed}</div>
                        <div className="text-xs text-gray-500">Completed</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'all', label: 'All Orders' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'processing', label: 'Processing' },
                    { id: 'shipped', label: 'Shipped' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'disputed', label: 'Disputed' }
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                            filter === f.id 
                                ? 'bg-brand-blue text-white' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-gray-400" />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium dark:text-white mb-2">No orders found</h3>
                    <p className="text-sm text-gray-500">
                        {filter === 'all' 
                            ? "You haven't made any purchases yet" 
                            : `No ${filter} orders`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            userId={user?.uid}
                            userName={`${userData?.firstName || ''} ${userData?.lastName || ''}`}
                            userPhoto={userData?.photoURL}
                            onMessageSeller={onMessageSeller}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
