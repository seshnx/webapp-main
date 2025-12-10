import { useState } from 'react';
import { 
    Shield, Lock, CheckCircle, AlertCircle, Clock,
    DollarSign, ArrowRight, Info, Loader2, X,
    FileText, User, Package
} from 'lucide-react';
import toast from 'react-hot-toast';

// Escrow threshold - items above this price suggest escrow
const ESCROW_THRESHOLD = 500;

// Escrow fee percentage
const ESCROW_FEE_PERCENT = 2.5;

/**
 * Escrow Information Banner
 */
export function EscrowInfoBanner({ price, onLearnMore }) {
    if (price < ESCROW_THRESHOLD) return null;

    return (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
                <Shield className="text-green-600 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                    <h4 className="font-bold text-green-800 dark:text-green-200 mb-1">
                        Escrow Protection Recommended
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                        For high-value items like this (${price}+), we recommend using SeshNx Escrow 
                        to protect both buyer and seller.
                    </p>
                    <button 
                        onClick={onLearnMore}
                        className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                    >
                        Learn more about Escrow <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Escrow Option Selector (during checkout)
 */
export function EscrowSelector({ price, selected, onChange }) {
    const escrowFee = Math.round(price * (ESCROW_FEE_PERCENT / 100) * 100) / 100;
    const showEscrow = price >= ESCROW_THRESHOLD;

    if (!showEscrow) return null;

    return (
        <div className="space-y-3">
            <h4 className="font-medium dark:text-white flex items-center gap-2">
                <Shield size={18} className="text-green-500" />
                Payment Protection
            </h4>

            {/* Standard Option */}
            <button
                type="button"
                onClick={() => onChange(false)}
                className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    !selected 
                        ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold dark:text-white">Direct Payment</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        !selected 
                            ? 'border-brand-blue bg-brand-blue' 
                            : 'border-gray-300'
                    }`}>
                        {!selected && <CheckCircle size={12} className="text-white" />}
                    </div>
                </div>
                <p className="text-sm text-gray-500">
                    Payment goes directly to seller. Standard buyer protection applies.
                </p>
                <div className="mt-2 text-sm font-medium text-green-600">No additional fee</div>
            </button>

            {/* Escrow Option */}
            <button
                type="button"
                onClick={() => onChange(true)}
                className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    selected 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold dark:text-white flex items-center gap-2">
                        <Shield size={16} className="text-green-500" />
                        Escrow Protection
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] px-1.5 py-0.5 rounded font-bold">
                            RECOMMENDED
                        </span>
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selected 
                            ? 'border-green-500 bg-green-500' 
                            : 'border-gray-300'
                    }`}>
                        {selected && <CheckCircle size={12} className="text-white" />}
                    </div>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                    Funds are held securely until you confirm receipt. Maximum protection for high-value items.
                </p>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    +${escrowFee.toFixed(2)} escrow fee ({ESCROW_FEE_PERCENT}%)
                </div>
            </button>
        </div>
    );
}

/**
 * Escrow Status Card (shown in order details)
 */
export function EscrowStatusCard({ order }) {
    if (!order?.useEscrow) return null;

    const getStatusInfo = () => {
        if (order.escrowReleased) {
            return {
                status: 'released',
                title: 'Escrow Released',
                description: 'Funds have been released to the seller.',
                color: 'green',
                icon: CheckCircle
            };
        }
        if (order.status === 'disputed') {
            return {
                status: 'disputed',
                title: 'Under Review',
                description: 'A dispute has been opened. Our team is reviewing the case.',
                color: 'red',
                icon: AlertCircle
            };
        }
        if (order.status === 'delivered' || order.status === 'completed') {
            return {
                status: 'pending_release',
                title: 'Awaiting Release',
                description: 'Please confirm receipt to release funds to seller.',
                color: 'yellow',
                icon: Clock
            };
        }
        return {
            status: 'held',
            title: 'Funds Secured',
            description: 'Your payment is held safely in escrow until delivery is confirmed.',
            color: 'blue',
            icon: Lock
        };
    };

    const info = getStatusInfo();
    const Icon = info.icon;

    const colorClasses = {
        green: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
        red: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
        yellow: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
        blue: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
    };

    return (
        <div className={`rounded-xl border p-4 ${colorClasses[info.color]}`}>
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    info.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                    info.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                    info.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold mb-1 flex items-center gap-2">
                        <Shield size={16} />
                        {info.title}
                    </h4>
                    <p className="text-sm opacity-80">{info.description}</p>
                    <div className="mt-2 text-sm font-medium">
                        Amount in escrow: ${order.total}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Escrow Learn More Modal
 */
export function EscrowInfoModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white dark:bg-[#2c2e36] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <Shield size={24} className="text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold dark:text-white">SeshNx Escrow</h2>
                            <p className="text-sm text-gray-500">Secure payment protection</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <p className="text-gray-600 dark:text-gray-300">
                        Escrow protection ensures safe transactions for high-value items by holding 
                        payment until both parties are satisfied.
                    </p>

                    {/* How it Works */}
                    <div>
                        <h3 className="font-bold dark:text-white mb-4">How it Works</h3>
                        <div className="space-y-4">
                            {[
                                { 
                                    icon: DollarSign, 
                                    title: 'Buyer Pays', 
                                    desc: 'Payment is sent to SeshNx escrow, not directly to seller' 
                                },
                                { 
                                    icon: Package, 
                                    title: 'Seller Ships', 
                                    desc: 'Seller ships item knowing payment is secured' 
                                },
                                { 
                                    icon: User, 
                                    title: 'Buyer Confirms', 
                                    desc: 'Buyer inspects and confirms receipt' 
                                },
                                { 
                                    icon: CheckCircle, 
                                    title: 'Funds Released', 
                                    desc: 'Payment is released to seller' 
                                }
                            ].map((step, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-brand-blue/10 rounded-full flex items-center justify-center shrink-0">
                                        <step.icon size={16} className="text-brand-blue" />
                                    </div>
                                    <div>
                                        <div className="font-medium dark:text-white">{step.title}</div>
                                        <div className="text-sm text-gray-500">{step.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Protection Details */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <h4 className="font-bold dark:text-white mb-3 flex items-center gap-2">
                            <Shield size={16} className="text-green-500" />
                            What&apos;s Protected
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <li className="flex items-start gap-2">
                                <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                                Item not as described
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                                Item never arrives
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                                Undisclosed damage or defects
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                                Seller does not ship
                            </li>
                        </ul>
                    </div>

                    {/* Fees */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                        <div>
                            <div className="font-medium dark:text-white">Escrow Fee</div>
                            <div className="text-sm text-gray-500">One-time protection fee</div>
                        </div>
                        <div className="text-xl font-bold text-brand-blue">
                            {ESCROW_FEE_PERCENT}%
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        Escrow is recommended for items over ${ESCROW_THRESHOLD}. 
                        Disputes are resolved within 5-7 business days.
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 border-t dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="w-full bg-brand-blue hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition"
                    >
                        Got It
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Seller Escrow Dashboard Widget
 */
export function SellerEscrowSummary({ orders = [] }) {
    const escrowOrders = orders.filter(o => o.useEscrow);
    const pendingRelease = escrowOrders.filter(o => !o.escrowReleased && o.status !== 'cancelled');
    const totalPending = pendingRelease.reduce((sum, o) => sum + o.total, 0);

    if (escrowOrders.length === 0) return null;

    return (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-4">
            <h3 className="font-bold dark:text-white mb-3 flex items-center gap-2">
                <Shield size={18} className="text-green-500" />
                Escrow Summary
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-2xl font-bold text-green-600">${totalPending}</div>
                    <div className="text-xs text-gray-500">Pending Release</div>
                </div>
                <div>
                    <div className="text-2xl font-bold dark:text-white">{pendingRelease.length}</div>
                    <div className="text-xs text-gray-500">Orders in Escrow</div>
                </div>
                <div>
                    <div className="text-2xl font-bold dark:text-white">{escrowOrders.length}</div>
                    <div className="text-xs text-gray-500">Total Escrow Orders</div>
                </div>
            </div>
        </div>
    );
}

export default {
    EscrowInfoBanner,
    EscrowSelector,
    EscrowStatusCard,
    EscrowInfoModal,
    SellerEscrowSummary
};
