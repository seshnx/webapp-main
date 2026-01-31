import React, { useState, useEffect } from 'react';
import { Search, Plus, Camera, DollarSign, X, CheckCircle, AlertTriangle, Loader2, MapPin, Wrench, Shield, Lock, Truck, CreditCard, Info, ToggleLeft, ToggleRight, Package, Star, MessageCircle, Send, Clock, ThumbsUp, ThumbsDown, BadgeCheck, ShoppingCart, ArrowRight, Home, BoxIcon, Receipt, ChevronRight, WrenchIcon } from 'lucide-react';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { useGearListings, useGearOrders, useGearOffers, useSafeExchangeTransactions, useMarketplaceMutations } from '../../hooks/useMarketplace';
import { EQUIP_CATEGORIES, HIGH_VALUE_THRESHOLD, SAFE_EXCHANGE_STATUS, SAFE_EXCHANGE_REQUIREMENT, FULFILLMENT_METHOD, SHIPPING_VERIFICATION_STATUS } from '../../config/constants';
import InspectionEditor from '../tech/InspectionEditor';
import { InspectionSvg } from '../tech/InspectionDiagrams';
import SafeExchangeTransaction from './SafeExchangeTransaction';
import ShippingVerification from './ShippingVerification';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const CONDITIONS = ['Mint', 'Excellent', 'Good', 'Fair', 'Non-Functioning'];

// Order status constants for standard purchases
const ORDER_STATUS = {
    PENDING: 'pending',           // Order placed, awaiting seller confirmation
    CONFIRMED: 'confirmed',       // Seller confirmed the order
    SHIPPED: 'shipped',           // Item has been shipped
    DELIVERED: 'delivered',       // Item delivered
    COMPLETED: 'completed',       // Buyer confirmed receipt, transaction complete
    CANCELLED: 'cancelled',       // Order cancelled
    REFUNDED: 'refunded',         // Order refunded
};

// Order status display config
const ORDER_STATUS_CONFIG = {
    [ORDER_STATUS.PENDING]: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
    [ORDER_STATUS.CONFIRMED]: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle },
    [ORDER_STATUS.SHIPPED]: { label: 'Shipped', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Truck },
    [ORDER_STATUS.DELIVERED]: { label: 'Delivered', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Package },
    [ORDER_STATUS.COMPLETED]: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
    [ORDER_STATUS.CANCELLED]: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: X },
    [ORDER_STATUS.REFUNDED]: { label: 'Refunded', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: Receipt },
};

// Service fee configuration - Mutual 1% fee on both buyer and seller
const SERVICE_FEE_RATE = 0.01; // 1% service fee (applied to both parties)

// Calculate service fee and totals
// Buyer pays: item price + 1% fee
// Seller receives: item price - 1% fee
const calculateFees = (itemPrice) => {
    const price = parseFloat(itemPrice) || 0;
    const serviceFee = Math.round(price * SERVICE_FEE_RATE * 100) / 100; // Round to 2 decimal places
    const buyerTotal = Math.round((price + serviceFee) * 100) / 100; // Buyer pays price + 1%
    const sellerPayout = Math.round((price - serviceFee) * 100) / 100; // Seller receives price - 1%
    return {
        itemPrice: price,
        serviceFee,
        serviceFeeRate: SERVICE_FEE_RATE,
        buyerTotal,
        sellerPayout
    };
};

// Seller Rating Component
const SellerRating = ({ rating, reviewCount, size = 'sm' }) => {
    if (!rating && !reviewCount) return null;
    
    const sizes = {
        sm: { star: 12, text: 'text-xs' },
        md: { star: 14, text: 'text-sm' },
        lg: { star: 16, text: 'text-base' }
    };
    const s = sizes[size];
    
    return (
        <div className={`flex items-center gap-1 ${s.text}`}>
            <Star size={s.star} className="text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-yellow-600 dark:text-yellow-400">
                {rating?.toFixed(1) || '—'}
            </span>
            {reviewCount > 0 && (
                <span className="text-gray-400">({reviewCount} sale{reviewCount !== 1 ? 's' : ''})</span>
            )}
        </div>
    );
};

// Offer Status Badge
const OfferStatusBadge = ({ status }) => {
    const statusConfig = {
        pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
        accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
        declined: { label: 'Declined', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
        countered: { label: 'Countered', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
        expired: { label: 'Expired', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${config.color}`}>
            {config.label}
        </span>
    );
};

// Helper to check if item requires escrow (high value)
const isHighValueItem = (price) => price >= HIGH_VALUE_THRESHOLD;

// Determine safe exchange requirement level
const getSafeExchangeRequirement = (price, sellerRequiresSafeExchange) => {
    if (price >= HIGH_VALUE_THRESHOLD) return SAFE_EXCHANGE_REQUIREMENT.REQUIRED;
    if (sellerRequiresSafeExchange) return SAFE_EXCHANGE_REQUIREMENT.SELLER_REQUIRED;
    return SAFE_EXCHANGE_REQUIREMENT.OPTIONAL;
};

export default function GearExchange({ user, userData, setActiveTab, openChat }) {
    // Use profile UUID from userData instead of Clerk user ID
    // Only proceed if we have a valid profile UUID (not Clerk user ID)
    const userId = userData?.id;
    const hasValidUserId = userId && !userId.startsWith('user_');

    // Fetch data with polling hooks (only if we have valid user ID)
    const { data: rawListings } = useGearListings({ status: 'active' });
    const { data: rawTransactions } = useSafeExchangeTransactions(hasValidUserId ? userId : null);
    const { data: rawOrders } = useGearOrders(hasValidUserId ? userId : null);

    // Mutation functions
    const {
        createListing,
        updateListingStatus,
        createOrder,
        updateOrderStatus,
        createOffer,
        respondToOffer,
        createTransaction,
        updateTransaction
    } = useMarketplaceMutations();

    const [view, setView] = useState('browse'); // 'browse', 'create', 'detail', 'orders'
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    // Safe Exchange State
    const [activeTransaction, setActiveTransaction] = useState(null);

    // Standard Orders State
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Transform raw listings
    const listings = (rawListings || []).map(l => ({
        id: l.id,
        ...l,
        sellerId: l.seller_id,
        sellerName: l.seller_name,
        sellerPhoto: l.seller_photo,
        sellerRating: l.seller_rating,
        sellerSalesCount: l.seller_sales_count,
        sellerVerified: l.seller_verified,
        sellerResponseTime: l.seller_response_time,
        minimumOffer: l.minimum_offer,
        conditionReport: l.condition_report,
        timestamp: l.timestamp
    }));

    // Transform raw transactions with role tagging
    const userTransactions = [
        ...(rawTransactions || []).map(t => {
            const isBuyer = t.parties?.buyer === userId;
            return {
                id: t.id,
                ...t,
                buyerId: t.parties?.buyer,
                sellerId: t.parties?.seller,
                listingId: t.item_id,
                role: isBuyer ? 'buyer' : 'seller'
            };
        })
    ];

    // Transform raw orders with role tagging
    const userOrders = (rawOrders || []).map(o => {
        const isBuyer = o.buyer_id === userId;
        return {
            id: o.id,
            ...o,
            buyerId: o.buyer_id,
            sellerId: o.seller_id,
            listingId: o.listing_id,
            itemTitle: o.item_title,
            itemBrand: o.item_brand,
            itemDescription: o.item_description,
            itemPhotos: o.item_photos,
            itemCondition: o.item_condition,
            itemPrice: o.item_price,
            serviceFee: o.service_fee,
            serviceFeeRate: o.service_fee_rate,
            buyerTotal: o.buyer_total,
            sellerPayout: o.seller_payout,
            buyerName: o.buyer_name,
            buyerPhoto: o.buyer_photo,
            sellerName: o.seller_name,
            sellerPhoto: o.seller_photo,
            fulfillmentMethod: o.fulfillment_method,
            shippingAddress: o.shipping_address,
            shippingPhone: o.shipping_phone,
            shippingNotes: o.shipping_notes,
            statusHistory: o.status_history,
            createdAt: o.created_at,
            updatedAt: o.updated_at,
            role: isBuyer ? 'buyer' : 'seller'
        };
    }).sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
    });

    // Handle initiating a safe exchange purchase
    const handleSafeExchangePurchase = async (item) => {
        // Must have valid profile UUID to proceed
        const userId = userData?.id;
        if (!userId || userId.startsWith('user_')) {
            alert('User profile not loaded. Please wait a moment and try again.');
            return;
        }

        // Calculate fees
        const fees = calculateFees(item.price);

        try {
            // Create the safe exchange transaction with JSONB structure
            const statusHistory = {
                [SAFE_EXCHANGE_STATUS.INTENT_CREATED]: {
                    timestamp: Date.now(),
                    userId: userId
                }
            };

            const transaction = await createTransaction({
                itemId: item.id,
                transactionType: 'gear_sale',
                parties: {
                    buyer: userId,
                    seller: item.sellerId,
                    buyerName: userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Buyer' : 'Buyer',
                    buyerPhoto: userData.photoURL || null,
                    sellerName: item.sellerName,
                    sellerPhoto: item.sellerPhoto
                },
                itemDetails: {
                    title: item.title,
                    brand: item.brand,
                    description: item.description || null,
                    photos: item.images || [],
                    condition: item.condition,
                    price: item.price,
                    itemPrice: fees.itemPrice,
                    serviceFee: fees.serviceFee,
                    serviceFeeRate: fees.serviceFeeRate,
                    buyerTotal: fees.buyerTotal,
                    sellerPayout: fees.sellerPayout
                },
                verificationData: {
                    statusHistory: statusHistory,
                    escrowAmount: fees.buyerTotal,
                    escrowStatus: 'held',
                    sellerApproved: false,
                    buyerApproved: false
                },
                status: SAFE_EXCHANGE_STATUS.SELLER_NOTIFIED
            });

            // Open the transaction view
            setActiveTransaction(transaction.id);
            setSelectedItem(null);
            toast.success('Purchase initiated! Seller will be notified.');

        } catch (error) {
            console.error('Failed to create safe exchange:', error);
            alert('Failed to initiate purchase. Please try again.');
        }
    };

    // Handle standard purchase for low-value items
    const handleStandardPurchase = async (item, shippingDetails) => {
        const toastId = toast.loading('Processing your order...');

        // Must have valid profile UUID to proceed
        const userId = userData?.id;
        if (!userId || userId.startsWith('user_')) {
            toast.error('User profile not loaded. Please wait a moment and try again.', { id: toastId });
            return;
        }

        // Calculate fees
        const fees = calculateFees(item.price);

        try {
            // Create the order
            const order = await createOrder({
                listing_id: item.id,
                buyer_id: userId,
                seller_id: item.sellerId,
                total_price: fees.buyerTotal,
                item_title: item.title,
                item_brand: item.brand,
                item_description: item.description || null,
                item_photos: item.images || [],
                item_condition: item.condition,
                item_price: fees.itemPrice,
                service_fee: fees.serviceFee,
                service_fee_rate: fees.serviceFeeRate,
                seller_payout: fees.sellerPayout,
                buyer_name: userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Buyer' : 'Buyer',
                buyer_photo: userData.photoURL || null,
                seller_name: item.sellerName,
                seller_photo: item.sellerPhoto,
                fulfillment_method: shippingDetails.method,
                shipping_address: shippingDetails.method === 'shipping' ? shippingDetails.address : null,
                shipping_phone: shippingDetails.phone || null,
                shipping_notes: shippingDetails.notes || null,
                status_history: [{
                    status: ORDER_STATUS.PENDING,
                    timestamp: Date.now(),
                    note: 'Order placed by buyer'
                }]
            });

            // Update listing status to pending sale
            await updateListingStatus(item.id, 'Pending Sale');

            toast.success('Order placed successfully!', { id: toastId });
            setSelectedItem(null);
            setView('orders'); // Switch to orders view

            return order.id;
        } catch (error) {
            console.error('Failed to create order:', error);
            toast.error('Failed to place order. Please try again.', { id: toastId });
            return null;
        }
    };

    // Update order status (for sellers)
    const handleUpdateOrderStatus = async (orderId, newStatus, trackingInfo = null) => {
        const toastId = toast.loading('Updating order...');

        try {
            // Find the order first to get its status history
            const order = userOrders.find(o => o.id === orderId);
            if (!order) {
                toast.error('Order not found', { id: toastId });
                return;
            }

            const statusHistory = order.statusHistory || [];

            // Prepare update data
            const updateData = {
                status: newStatus,
                status_history: [...statusHistory, {
                    status: newStatus,
                    timestamp: Date.now(),
                    note: `Status updated to ${newStatus}`
                }]
            };

            // Add tracking info if provided
            if (trackingInfo) {
                updateData.tracking_number = trackingInfo.trackingNumber;
                updateData.tracking_carrier = trackingInfo.carrier;
            }

            await updateOrderStatus(orderId, newStatus);

            toast.success(`Order ${newStatus}!`, { id: toastId });
        } catch (error) {
            console.error('Failed to update order:', error);
            toast.error('Failed to update order. Please try again.', { id: toastId });
        }
    };

    // Get pending orders count
    const pendingOrders = userOrders.filter(o =>
        o.status !== ORDER_STATUS.COMPLETED &&
        o.status !== ORDER_STATUS.CANCELLED &&
        o.status !== ORDER_STATUS.REFUNDED
    );

    // Filtering
    const filteredListings = listings.filter(l => 
        (filter === 'All' || l.category === filter) &&
        (l.title.toLowerCase().includes(search.toLowerCase()) || l.brand.toLowerCase().includes(search.toLowerCase()))
    );

    // Get active transactions that are not completed
    const pendingTransactions = userTransactions.filter(t => 
        t.status !== SAFE_EXCHANGE_STATUS.COMPLETED && 
        t.status !== SAFE_EXCHANGE_STATUS.CANCELLED
    );

    return (
        <div className="max-w-7xl mx-auto pb-24 animate-in fade-in">
            {/* Active Safe Exchange Transaction Modal */}
            {activeTransaction && (
                <SafeExchangeTransaction
                    transactionId={activeTransaction}
                    user={user}
                    userData={userData}
                    onClose={() => setActiveTransaction(null)}
                    onComplete={() => {
                        setActiveTransaction(null);
                        // Could trigger a refresh or show success message
                    }}
                    onMessage={(otherUserId) => {
                        // Open chat with other party
                        openChat?.(otherUserId);
                    }}
                />
            )}

            {/* Navigation & Search Header */}
            {view === 'browse' && (
                <>
                    {/* Pending Transactions Banner */}
                    {pendingTransactions.length > 0 && (
                        <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center gap-3 mb-3">
                                <Shield className="text-orange-600" size={24} />
                                <div>
                                    <h3 className="font-bold text-orange-800 dark:text-orange-300">Active Safe Exchanges</h3>
                                    <p className="text-sm text-orange-600 dark:text-orange-400">
                                        You have {pendingTransactions.length} pending transaction{pendingTransactions.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {pendingTransactions.map(txn => (
                                    <button
                                        key={txn.id}
                                        onClick={() => setActiveTransaction(txn.id)}
                                        className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${txn.role === 'buyer' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                                {txn.role === 'buyer' ? <CreditCard size={16} /> : <DollarSign size={16} />}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-sm dark:text-white">{txn.itemTitle}</div>
                                                <div className="text-xs text-gray-500">
                                                    {txn.role === 'buyer' ? 'Buying' : 'Selling'} • ${txn.price}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">
                                            {txn.status.replace(/_/g, ' ')}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                                <Wrench className="text-orange-500" /> Gear Exchange
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Buy and sell verified studio equipment.
                            </p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                                <input 
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2c2e36] text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Search gear..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={() => setView('orders')} 
                                className="relative bg-white dark:bg-[#2c2e36] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition"
                            >
                                <BoxIcon size={16}/> Orders
                                {pendingOrders.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                        {pendingOrders.length}
                                    </span>
                                )}
                            </button>
                            <button 
                                onClick={() => setView('create')} 
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition"
                            >
                                <Plus size={16}/> Sell Gear
                            </button>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
                        <button onClick={() => setFilter('All')} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${filter === 'All' ? 'bg-white dark:bg-white text-black shadow' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>All Gear</button>
                        {EQUIP_CATEGORIES.map(cat => (
                            <button key={cat.id} onClick={() => setFilter(cat.id)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${filter === cat.id ? 'bg-white dark:bg-white text-black shadow' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredListings.map(item => {
                            const highValue = isHighValueItem(item.price);
                            return (
                                <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden hover:shadow-xl transition cursor-pointer group flex flex-col">
                                    <div className="aspect-square bg-gray-100 dark:bg-black/40 relative flex items-center justify-center overflow-hidden">
                                        {item.images?.[0] ? (
                                            <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                                        ) : (
                                            <Camera size={32} className="text-gray-400"/>
                                        )}
                                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md">
                                            ${item.price}
                                        </div>
                                        {highValue && (
                                            <div className="absolute top-2 left-2 bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                <Shield size={10}/> Safe Exchange
                                            </div>
                                        )}
                                        {item.conditionReport && (
                                            <div className="absolute bottom-2 left-2 bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                <CheckCircle size={10}/> Inspected
                                            </div>
                                        )}
                                        {item.acceptsOffers && (
                                            <div className="absolute bottom-2 right-2 bg-blue-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                <MessageCircle size={10}/> Offers
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">{item.brand}</div>
                                        <h4 className="font-bold dark:text-white text-sm mb-1 line-clamp-1">{item.title}</h4>
                                        <div className="text-xs text-gray-500 mb-2">{item.condition} Condition</div>
                                        
                                        {/* Seller Rating */}
                                        {item.sellerRating && (
                                            <div className="mb-2">
                                                <SellerRating rating={item.sellerRating} reviewCount={item.sellerSalesCount} size="sm" />
                                            </div>
                                        )}
                                        
                                        <div className="mt-auto pt-3 border-t dark:border-gray-700 flex justify-between items-center text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                {highValue ? (
                                                    <><MapPin size={10}/> Local Pickup</>
                                                ) : (
                                                    <><Truck size={10}/> {item.location || 'Ships'}</>
                                                )}
                                            </span>
                                            {item.sellerVerified && (
                                                <BadgeCheck size={14} className="text-blue-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Create Listing View */}
            {view === 'create' && (
                <CreateListingForm 
                    user={user} 
                    userData={userData} 
                    onCancel={() => setView('browse')} 
                    onSuccess={() => setView('browse')}
                />
            )}

            {/* Orders View */}
            {view === 'orders' && (
                <OrdersView 
                    orders={userOrders}
                    user={user}
                    userData={userData}
                    onBack={() => setView('browse')}
                    onUpdateStatus={handleUpdateOrderStatus}
                    openChat={openChat}
                />
            )}

            {/* Detail Modal */}
            {selectedItem && (
                <ListingDetailModal 
                    item={selectedItem} 
                    onClose={() => setSelectedItem(null)} 
                    currentUser={user}
                    currentUserData={userData}
                    onSafeExchangePurchase={handleSafeExchangePurchase}
                    onStandardPurchase={handleStandardPurchase}
                />
            )}
        </div>
    );
}

// --- SUB-COMPONENT: CREATE LISTING ---
function CreateListingForm({ user, userData, onCancel, onSuccess }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ 
        title: '', brand: '', category: EQUIP_CATEGORIES[0].id, condition: 'Good', price: '', 
        description: '', location: userData.city || '',
        weight: '', length: '', width: '', height: '', // Added dimensions
        acceptsOffers: true, // Enable offers by default
        minimumOffer: '' // Optional minimum offer percentage
    });
    const [images, setImages] = useState([]);
    const [conditionReport, setConditionReport] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const { uploadMedia, uploading } = useMediaUpload();

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const res = await uploadMedia(file, `gear/${user.uid}`);
        if (res?.url) setImages([...images, res.url]);
    };

    const handleSubmit = async () => {
        if (!form.title || !form.price) {
            alert("Title and Price required.");
            return;
        }

        // Must have valid profile UUID to proceed
        const userId = userData?.id;
        if (!userId || userId.startsWith('user_')) {
            alert('User profile not loaded. Please wait a moment and try again.');
            return;
        }

        setSubmitting(true);
        try {
            await createListing({
                seller_id: userId,
                title: form.title,
                brand: form.brand,
                category: form.category,
                condition: form.condition,
                price: parseInt(form.price),
                description: form.description || null,
                location: form.location || null,
                weight: form.weight || null,
                length: form.length || null,
                width: form.width || null,
                height: form.height || null,
                accepts_offers: form.acceptsOffers || false,
                minimum_offer: form.minimumOffer ? parseInt(form.minimumOffer) : null,
                images: images || [],
                condition_report: conditionReport
            });
            toast.success("Listing posted!");
            onSuccess();
        } catch (e) {
            console.error(e);
            toast.error("Failed to post listing.");
        }
        setSubmitting(false);
    };

    // Special View: Tech Inspection Tool embedded in the wizard
    if (step === 'inspection') {
        return (
            <div className="h-[600px]">
                <InspectionEditor 
                    type="Pre" // Using "Pre" template as base for condition report
                    onSave={(report) => { setConditionReport(report); setStep(1); }} 
                    onCancel={() => setStep(1)} 
                />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#2c2e36] p-8 rounded-2xl border dark:border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold dark:text-white">List Gear for Sale</h3>
                <button onClick={onCancel}><X className="text-gray-400"/></button>
            </div>

            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Brand</label>
                        <input className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="e.g. Fender"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Model / Title</label>
                        <input className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Stratocaster"/>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Category</label>
                        <select className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                            {EQUIP_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Condition</label>
                        <select className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Price ($)</label>
                    <input type="number" className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white font-bold" value={form.price} onChange={e => setForm({...form, price: e.target.value})}/>
                    
                    {/* High Value Warning */}
                    {form.price && parseInt(form.price) >= HIGH_VALUE_THRESHOLD && (
                        <div className="mt-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="flex items-start gap-3">
                                <Shield className="text-orange-500 shrink-0 mt-0.5" size={20}/>
                                <div>
                                    <h4 className="font-bold text-orange-800 dark:text-orange-300 text-sm">Safe Exchange Required</h4>
                                    <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                                        Items priced at ${HIGH_VALUE_THRESHOLD}+ require in-person exchange at a verified safe location (police station, bank, etc.). 
                                        Buyers will initiate a Safe Exchange with payment held in escrow until both parties approve.
                                    </p>
                                    <ul className="text-xs text-orange-600 dark:text-orange-400 mt-2 space-y-1">
                                        <li className="flex items-center gap-1"><Info size={10}/> No shipping available for high-value items</li>
                                        <li className="flex items-center gap-1"><Camera size={10}/> You must upload pre-departure photos</li>
                                        <li className="flex items-center gap-1"><MapPin size={10}/> GPS verification at exchange location</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Accept Offers Toggle */}
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-blue-800 dark:text-blue-400 text-sm flex items-center gap-2">
                                <MessageCircle size={16} />
                                Accept Offers
                            </h4>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                Allow buyers to negotiate on price
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setForm({...form, acceptsOffers: !form.acceptsOffers})}
                            className="p-1"
                        >
                            {form.acceptsOffers ? (
                                <ToggleRight size={32} className="text-blue-600" />
                            ) : (
                                <ToggleLeft size={32} className="text-gray-400" />
                            )}
                        </button>
                    </div>
                    
                    {form.acceptsOffers && form.price && (
                        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                Minimum Acceptable Offer (Optional)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder={`e.g., ${Math.round(parseInt(form.price) * 0.8)}`}
                                    value={form.minimumOffer}
                                    onChange={e => setForm({...form, minimumOffer: e.target.value})}
                                    className="flex-1 p-2 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm"
                                />
                                <span className="text-sm text-gray-500">
                                    {form.minimumOffer && form.price ? `(${Math.round((parseInt(form.minimumOffer) / parseInt(form.price)) * 100)}%)` : ''}
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">
                                Offers below this will be flagged as "Low Offer" to buyers
                            </p>
                        </div>
                    )}
                </div>

                {/* Weight & Dimensions for Shipping */}
                <div className="grid grid-cols-4 gap-2">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Weight (lb)</label>
                        <input type="number" className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" placeholder="lbs" value={form.weight} onChange={e=>setForm({...form, weight: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">L (in)</label>
                        <input type="number" className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" placeholder="Len" value={form.length} onChange={e=>setForm({...form, length: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">W (in)</label>
                        <input type="number" className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" placeholder="Wid" value={form.width} onChange={e=>setForm({...form, width: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">H (in)</label>
                        <input type="number" className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" placeholder="Hgt" value={form.height} onChange={e=>setForm({...form, height: e.target.value})} />
                    </div>
                </div>

                {/* Condition Report Integration */}
                <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-800 flex justify-between items-center">
                    <div>
                        <div className="font-bold text-orange-800 dark:text-orange-400 text-sm mb-1">Tech Inspection Report</div>
                        <div className="text-xs text-orange-600 dark:text-orange-300">
                            {conditionReport 
                                ? <span className="flex items-center gap-1"><CheckCircle size={12}/> Report Attached ({conditionReport.markers.length} points)</span> 
                                : "Mark scratches, dents, or issues on a diagram to build trust."}
                        </div>
                    </div>
                    <button 
                        onClick={() => setStep('inspection')} 
                        className={`text-xs font-bold px-3 py-2 rounded-lg border transition ${conditionReport ? 'bg-white text-green-600 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200'}`}
                    >
                        {conditionReport ? "Edit Report" : "Create Report"}
                    </button>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Photos</label>
                    <div className="flex gap-2">
                        {images.map((img, i) => (
                            <img key={i} src={img} className="w-16 h-16 rounded-lg object-cover border dark:border-gray-600"/>
                        ))}
                        <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                            {uploading ? <Loader2 className="animate-spin text-gray-400"/> : <Plus className="text-gray-400"/>}
                            <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading}/>
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button onClick={onCancel} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={submitting || uploading} className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg flex items-center justify-center gap-2">
                        {submitting ? <Loader2 className="animate-spin"/> : "Post Listing"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: DETAIL MODAL ---
function ListingDetailModal({ item, onClose, currentUser, currentUserData, onSafeExchangePurchase, onStandardPurchase }) {
    const [viewReport, setViewReport] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [offerAmount, setOfferAmount] = useState('');
    const [offerMessage, setOfferMessage] = useState('');
    const [submittingOffer, setSubmittingOffer] = useState(false);
    const [existingOffers, setExistingOffers] = useState([]);
    const [loadingOffers, setLoadingOffers] = useState(true);
    
    // Checkout form state
    const [checkoutStep, setCheckoutStep] = useState(1); // 1: method, 2: details, 3: confirm
    const [fulfillmentMethod, setFulfillmentMethod] = useState('shipping');
    const [shippingForm, setShippingForm] = useState({
        street: currentUserData?.address?.street || '',
        city: currentUserData?.city || '',
        state: currentUserData?.state || '',
        zip: currentUserData?.zip || '',
        phone: currentUserData?.phone || '',
        notes: ''
    });

    const highValue = isHighValueItem(item.price);

    // Fetch existing offers for this listing
    useEffect(() => {
        if (!item.id || !currentUser?.uid) {
            setLoadingOffers(false);
            return;
        }

        if (!supabase) return;
        const userId = currentUserData?.id || currentUser?.id || currentUser?.uid;

        const channel = supabase
            .channel(`gear-offers-${item.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'gear_offers',
                filter: `listing_id=eq.${item.id}`
            }, () => {
                loadOffers();
            })
            .subscribe();

        loadOffers();

        return () => {
            supabase.removeChannel(channel);
        };
        
        async function loadOffers() {
            if (!supabase) return;
            const userId = currentUserData?.id || currentUser?.id || currentUser?.uid;
            setLoadingOffers(true);
            try {
                const { data: offersData, error } = await supabase
                    .from('gear_offers')
                    .select('*')
                    .eq('listing_id', item.id)
                    .eq('buyer_id', userId)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                const offers = (offersData || []).map(o => ({
                    id: o.id,
                    ...o,
                    listingId: o.listing_id,
                    buyerId: o.buyer_id,
                    sellerId: o.seller_id,
                    itemTitle: o.item_title,
                    itemBrand: o.item_brand,
                    askingPrice: o.asking_price,
                    offerAmount: o.offer_amount,
                    buyerName: o.buyer_name,
                    buyerPhoto: o.buyer_photo,
                    sellerName: o.seller_name,
                    createdAt: o.created_at ? new Date(o.created_at) : new Date(),
                    expiresAt: o.expires_at
                }));
                setExistingOffers(offers);
            } catch (error) {
                console.error('Error fetching offers:', error);
            }
            setLoadingOffers(false);
        }
    }, [item.id, currentUser?.uid]);

    const handlePurchase = async () => {
        if (highValue) {
            setIsPurchasing(true);
            await onSafeExchangePurchase(item);
            setIsPurchasing(false);
        } else {
            // Open checkout flow for standard purchase
            setShowCheckout(true);
            setCheckoutStep(1);
        }
    };

    const handleCheckoutComplete = async () => {
        setIsPurchasing(true);
        
        const shippingDetails = {
            method: fulfillmentMethod,
            address: fulfillmentMethod === 'shipping' ? {
                street: shippingForm.street,
                city: shippingForm.city,
                state: shippingForm.state,
                zip: shippingForm.zip
            } : null,
            phone: shippingForm.phone,
            notes: shippingForm.notes
        };
        
        const success = await onStandardPurchase(item, shippingDetails);
        
        if (success) {
            setShowCheckout(false);
            onClose();
        }
        
        setIsPurchasing(false);
    };

    const validateShippingForm = () => {
        if (fulfillmentMethod === 'shipping') {
            return shippingForm.street && shippingForm.city && shippingForm.state && shippingForm.zip;
        }
        return true;
    };

    const handleSubmitOffer = async () => {
        if (!offerAmount || parseFloat(offerAmount) <= 0) {
            toast.error('Please enter a valid offer amount');
            return;
        }

        const offer = parseFloat(offerAmount);
        if (offer >= item.price) {
            toast.error('Offer must be less than the asking price');
            return;
        }

        setSubmittingOffer(true);
        const toastId = toast.loading('Submitting offer...');
        const userId = currentUserData?.id || currentUser?.id || currentUser?.uid;

        try {
            await createOffer({
                listing_id: item.id,
                offeror_id: userId,
                recipient_id: item.sellerId,
                offer_amount: offer,
                message: offerMessage || null
            });

            toast.success('Offer submitted!', { id: toastId });
            setShowOfferForm(false);
            setOfferAmount('');
            setOfferMessage('');
        } catch (error) {
            console.error('Failed to submit offer:', error);
            toast.error('Failed to submit offer', { id: toastId });
        }

        setSubmittingOffer(false);
    };

    // Calculate offer percentage
    const getOfferPercentage = (offer) => {
        return Math.round((offer / item.price) * 100);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white dark:bg-[#2c2e36] w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border dark:border-gray-700">
                
                {/* Left: Gallery & Visuals */}
                <div className="md:w-1/2 bg-black relative flex flex-col">
                    <div className="flex-1 flex items-center justify-center p-4 relative">
                        {/* Toggle between Photo and Diagram if Report Exists */}
                        {viewReport && item.conditionReport ? (
                            <div className="w-full h-full bg-white rounded-xl overflow-hidden">
                                <InspectionSvg 
                                    type={item.conditionReport.gearType} 
                                    view="front" 
                                    markers={item.conditionReport.markers} 
                                    onClick={() => {}} // Read-only
                                />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-full text-xs">
                                    Inspection View
                                </div>
                            </div>
                        ) : (
                            item.images?.[0] ? <img src={item.images[0]} className="max-h-full max-w-full object-contain"/> : <Camera size={48} className="text-gray-600"/>
                        )}
                        
                        <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"><X size={20}/></button>
                        
                        {/* High Value Badge */}
                        {highValue && (
                            <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg">
                                <Shield size={14}/> Safe Exchange Required
                            </div>
                        )}
                    </div>
                    
                    {/* Visual Toggle Bar */}
                    {item.conditionReport && (
                        <div className="p-4 bg-[#1f2128] border-t border-gray-800 flex gap-2 justify-center">
                            <button onClick={() => setViewReport(false)} className={`px-4 py-2 rounded text-xs font-bold ${!viewReport ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Photos</button>
                            <button onClick={() => setViewReport(true)} className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-1 ${viewReport ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                <AlertTriangle size={12}/> Condition Map
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Info */}
                <div className="md:w-1/2 p-8 overflow-y-auto bg-white dark:bg-[#2c2e36]">
                    <div className="mb-6">
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{item.brand}</div>
                        <h2 className="text-3xl font-extrabold dark:text-white mb-2">{item.title}</h2>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xl font-bold text-green-600">${item.price}</span>
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-bold">{item.condition}</span>
                            {item.acceptsOffers && (
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                    <MessageCircle size={12}/> Open to Offers
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* High Value Notice */}
                        {highValue && (
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-orange-500 rounded-lg">
                                        <Shield className="text-white" size={20}/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-orange-800 dark:text-orange-300 mb-1">Safe Exchange Protection</h4>
                                        <p className="text-sm text-orange-700 dark:text-orange-400 mb-3">
                                            High-value items (${HIGH_VALUE_THRESHOLD}+) require in-person exchange at a verified safe location.
                                        </p>
                                        <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-1">
                                            <li className="flex items-center gap-1"><Lock size={12}/> Payment held in escrow until exchange</li>
                                            <li className="flex items-center gap-1"><MapPin size={12}/> Meet at police station or safe zone</li>
                                            <li className="flex items-center gap-1"><Camera size={12}/> Photo verification required</li>
                                            <li className="flex items-center gap-1"><CheckCircle size={12}/> Both parties must approve</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Seller Info with Rating */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                {item.sellerPhoto ? (
                                    <img src={item.sellerPhoto} className="w-12 h-12 rounded-full bg-gray-300 object-cover"/>
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                                        {item.sellerName?.[0]}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold dark:text-white">{item.sellerName}</span>
                                        {item.sellerVerified && (
                                            <BadgeCheck size={16} className="text-blue-500" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <SellerRating 
                                            rating={item.sellerRating} 
                                            reviewCount={item.sellerSalesCount} 
                                            size="md"
                                        />
                                        {item.sellerResponseTime && (
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={12} />
                                                Responds in {item.sellerResponseTime}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* My Offers Section */}
                        {existingOffers.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-3 flex items-center gap-2">
                                    <MessageCircle size={16} />
                                    Your Offers
                                </h4>
                                <div className="space-y-2">
                                    {existingOffers.map(offer => (
                                        <div 
                                            key={offer.id}
                                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold dark:text-white">${offer.offerAmount}</span>
                                                    <span className="text-xs text-gray-500">
                                                        ({getOfferPercentage(offer.offerAmount)}% of asking)
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {offer.createdAt.toLocaleDateString()}
                                                </div>
                                            </div>
                                            <OfferStatusBadge status={offer.status} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Fulfillment Method */}
                        <div className={`p-3 rounded-xl border ${highValue 
                            ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800' 
                            : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'}`}
                        >
                            <div className="flex items-center gap-2">
                                {highValue ? (
                                    <>
                                        <MapPin className="text-orange-600" size={18}/>
                                        <span className="font-bold text-orange-700 dark:text-orange-400">Local Pickup Only</span>
                                    </>
                                ) : (
                                    <>
                                        <Truck className="text-green-600" size={18}/>
                                        <span className="font-bold text-green-700 dark:text-green-400">Shipping Available</span>
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {highValue 
                                    ? 'You will coordinate a meetup at a verified safe exchange zone'
                                    : item.location || 'Contact seller for shipping details'}
                            </p>
                        </div>

                        {/* Condition Notes */}
                        {item.conditionReport?.notes && (
                            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-800/50">
                                <h4 className="font-bold text-orange-800 dark:text-orange-400 text-sm mb-2 flex items-center gap-2">
                                    <Wrench size={16}/> Tech Notes
                                </h4>
                                <p className="text-sm text-orange-900 dark:text-orange-200 italic">"{item.conditionReport.notes}"</p>
                            </div>
                        )}

                        <div className="prose dark:prose-invert text-sm text-gray-600 dark:text-gray-300">
                            <h4 className="font-bold dark:text-white text-sm uppercase">Description</h4>
                            <p>{item.description || "No description provided."}</p>
                        </div>
                    </div>

                    {/* Make Offer Form */}
                    {showOfferForm && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                            <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-3 flex items-center gap-2">
                                <MessageCircle size={16} />
                                Make an Offer
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Your Offer ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="number"
                                            value={offerAmount}
                                            onChange={e => setOfferAmount(e.target.value)}
                                            placeholder={`Asking: $${item.price}`}
                                            className="w-full pl-9 pr-4 py-2.5 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    {offerAmount && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {getOfferPercentage(parseFloat(offerAmount))}% of asking price
                                            {parseFloat(offerAmount) < item.price * 0.7 && (
                                                <span className="text-amber-600 ml-1">(Low offer)</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Message (Optional)</label>
                                    <textarea
                                        value={offerMessage}
                                        onChange={e => setOfferMessage(e.target.value)}
                                        placeholder="Add a message to the seller..."
                                        rows={2}
                                        className="w-full p-2.5 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm resize-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowOfferForm(false)}
                                        className="flex-1 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitOffer}
                                        disabled={submittingOffer || !offerAmount}
                                        className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {submittingOffer ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <>
                                                <Send size={16} /> Submit Offer
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                    <Clock size={10} />
                                    Offers expire after 48 hours if not responded to
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Checkout Flow */}
                    <AnimatePresence>
                        {showCheckout && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border border-green-200 dark:border-green-800"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
                                        <ShoppingCart size={18} />
                                        Checkout
                                    </h4>
                                    <button 
                                        onClick={() => setShowCheckout(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Step Indicator */}
                                <div className="flex items-center gap-2 mb-6">
                                    {[1, 2, 3].map((step) => (
                                        <React.Fragment key={step}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                                checkoutStep >= step 
                                                    ? 'bg-green-500 text-white' 
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                            }`}>
                                                {checkoutStep > step ? <CheckCircle size={16} /> : step}
                                            </div>
                                            {step < 3 && (
                                                <div className={`flex-1 h-1 rounded ${
                                                    checkoutStep > step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                                                }`} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>

                                {/* Step 1: Fulfillment Method */}
                                {checkoutStep === 1 && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">How would you like to receive this item?</p>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => setFulfillmentMethod('shipping')}
                                                className={`p-4 rounded-xl border-2 transition-all ${
                                                    fulfillmentMethod === 'shipping'
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                }`}
                                            >
                                                <Truck size={24} className={fulfillmentMethod === 'shipping' ? 'text-green-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
                                                <div className="font-bold text-sm dark:text-white">Ship to Me</div>
                                                <div className="text-xs text-gray-500">Delivered to your door</div>
                                            </button>
                                            
                                            <button
                                                onClick={() => setFulfillmentMethod('pickup')}
                                                className={`p-4 rounded-xl border-2 transition-all ${
                                                    fulfillmentMethod === 'pickup'
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                }`}
                                            >
                                                <Home size={24} className={fulfillmentMethod === 'pickup' ? 'text-green-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
                                                <div className="font-bold text-sm dark:text-white">Local Pickup</div>
                                                <div className="text-xs text-gray-500">Meet the seller</div>
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => setCheckoutStep(2)}
                                            className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
                                        >
                                            Continue <ArrowRight size={16} />
                                        </button>
                                    </div>
                                )}

                                {/* Step 2: Shipping Details */}
                                {checkoutStep === 2 && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {fulfillmentMethod === 'shipping' ? 'Enter your shipping address' : 'Add your contact details'}
                                        </p>
                                        
                                        {fulfillmentMethod === 'shipping' && (
                                            <>
                                                <input
                                                    type="text"
                                                    placeholder="Street Address"
                                                    value={shippingForm.street}
                                                    onChange={e => setShippingForm({...shippingForm, street: e.target.value})}
                                                    className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                                />
                                                <div className="grid grid-cols-3 gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="City"
                                                        value={shippingForm.city}
                                                        onChange={e => setShippingForm({...shippingForm, city: e.target.value})}
                                                        className="p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="State"
                                                        value={shippingForm.state}
                                                        onChange={e => setShippingForm({...shippingForm, state: e.target.value})}
                                                        className="p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="ZIP"
                                                        value={shippingForm.zip}
                                                        onChange={e => setShippingForm({...shippingForm, zip: e.target.value})}
                                                        className="p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                                    />
                                                </div>
                                            </>
                                        )}
                                        
                                        <input
                                            type="tel"
                                            placeholder="Phone Number"
                                            value={shippingForm.phone}
                                            onChange={e => setShippingForm({...shippingForm, phone: e.target.value})}
                                            className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                        />
                                        
                                        <textarea
                                            placeholder="Notes for seller (optional)"
                                            value={shippingForm.notes}
                                            onChange={e => setShippingForm({...shippingForm, notes: e.target.value})}
                                            rows={2}
                                            className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white resize-none"
                                        />

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCheckoutStep(1)}
                                                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={() => setCheckoutStep(3)}
                                                disabled={!validateShippingForm()}
                                                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                Review Order <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Confirm */}
                                {checkoutStep === 3 && (() => {
                                    const fees = calculateFees(item.price);
                                    return (
                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700">
                                            <h5 className="font-bold text-sm dark:text-white mb-3">Order Summary</h5>
                                            
                                            <div className="flex items-center gap-3 pb-3 border-b dark:border-gray-700">
                                                {item.images?.[0] && (
                                                    <img src={item.images[0]} className="w-16 h-16 rounded-lg object-cover" />
                                                )}
                                                <div className="flex-1">
                                                    <div className="font-bold dark:text-white">{item.title}</div>
                                                    <div className="text-xs text-gray-500">{item.brand} • {item.condition}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="pt-3 space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Item Price</span>
                                                    <span className="dark:text-white">${fees.itemPrice.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 flex items-center gap-1">
                                                        Service Fee 
                                                        <span className="text-[10px] text-gray-400">(1% buyer fee)</span>
                                                    </span>
                                                    <span className="dark:text-white">${fees.serviceFee.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Fulfillment</span>
                                                    <span className="dark:text-white capitalize">{fulfillmentMethod}</span>
                                                </div>
                                                {fulfillmentMethod === 'shipping' && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Ship to</span>
                                                        <span className="dark:text-white text-right text-xs">
                                                            {shippingForm.city}, {shippingForm.state} {shippingForm.zip}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between pt-2 border-t dark:border-gray-700 font-bold">
                                                    <span className="dark:text-white">Total</span>
                                                    <span className="text-green-600">${fees.buyerTotal.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                                            <Shield size={14} className="shrink-0 mt-0.5" />
                                            <span>Your purchase is protected by SeshNx Buyer Protection. If there&apos;s an issue with your order, we&apos;ve got your back.</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCheckoutStep(2)}
                                                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleCheckoutComplete}
                                                disabled={isPurchasing}
                                                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isPurchasing ? (
                                                    <Loader2 className="animate-spin" size={18} />
                                                ) : (
                                                    <>
                                                        <CreditCard size={18} /> Place Order
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    );
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Purchase Buttons (hidden when checkout is open) */}
                    {!showCheckout && (
                        <div className="mt-8 pt-6 border-t dark:border-gray-700">
                            {item.sellerId === currentUser.uid ? (
                                <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold py-3 rounded-xl cursor-not-allowed">You own this listing</button>
                            ) : (
                                <div className="space-y-3">
                                    <button 
                                        onClick={handlePurchase}
                                        disabled={isPurchasing}
                                        className={`w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${
                                            highValue 
                                                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white' 
                                                : 'bg-orange-600 hover:bg-orange-700 text-white'
                                        }`}
                                    >
                                        {isPurchasing ? (
                                            <Loader2 className="animate-spin" size={20}/>
                                        ) : highValue ? (
                                            <>
                                                <Shield size={20}/> Initiate Safe Exchange
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart size={20}/> Buy Now - ${item.price}
                                            </>
                                        )}
                                    </button>
                                    
                                    {/* Make Offer Button */}
                                    {!showOfferForm && item.acceptsOffers !== false && (
                                        <button
                                            onClick={() => setShowOfferForm(true)}
                                            className="w-full py-3 border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle size={18} />
                                            Make an Offer
                                        </button>
                                    )}
                                </div>
                            )}
                            <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                                {highValue ? (
                                    <>
                                        <Lock size={10}/> Funds held in escrow • GPS verified exchange • Dual approval release
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={10}/> Purchases covered by SeshNx Buyer Protection
                                    </>
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: ORDERS VIEW ---
function OrdersView({ orders, user, userData, onBack, onUpdateStatus, openChat }) {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingCarrier, setTrackingCarrier] = useState('usps');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'buying', 'selling'

    const carriers = [
        { id: 'usps', label: 'USPS' },
        { id: 'ups', label: 'UPS' },
        { id: 'fedex', label: 'FedEx' },
        { id: 'dhl', label: 'DHL' },
        { id: 'other', label: 'Other' },
    ];

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'buying') return order.role === 'buyer';
        if (activeTab === 'selling') return order.role === 'seller';
        return true;
    });

    const handleMarkShipped = async () => {
        if (!trackingNumber) {
            toast.error('Please enter a tracking number');
            return;
        }
        await onUpdateStatus(selectedOrder.id, ORDER_STATUS.SHIPPED, {
            trackingNumber,
            carrier: trackingCarrier
        });
        setShowShippingModal(false);
        setTrackingNumber('');
        setSelectedOrder(null);
    };

    const handleConfirmDelivery = async (order) => {
        await onUpdateStatus(order.id, ORDER_STATUS.COMPLETED);
    };

    const getStatusIcon = (status) => {
        const config = ORDER_STATUS_CONFIG[status];
        if (config) {
            const IconComponent = config.icon;
            return <IconComponent size={16} />;
        }
        return <Clock size={16} />;
    };

    return (
        <div className="animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                        <ChevronRight className="rotate-180 text-gray-500" size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                            <Receipt className="text-orange-500" /> My Orders
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Track your purchases and sales
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {[
                    { id: 'all', label: 'All Orders' },
                    { id: 'buying', label: 'Buying' },
                    { id: 'selling', label: 'Selling' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                            activeTab === tab.id
                                ? 'bg-orange-600 text-white shadow'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-[#2c2e36] rounded-2xl border dark:border-gray-700">
                    <BoxIcon size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-bold dark:text-white mb-2">No orders yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {activeTab === 'buying' 
                            ? "You haven't purchased anything yet" 
                            : activeTab === 'selling'
                            ? "You haven't received any orders yet"
                            : "Start shopping or selling to see your orders here"}
                    </p>
                    <button
                        onClick={onBack}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition"
                    >
                        Browse Gear
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map(order => {
                        const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG[ORDER_STATUS.PENDING];
                        const isSeller = order.role === 'seller';
                        const isBuyer = order.role === 'buyer';
                        
                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden hover:shadow-lg transition"
                            >
                                <div className="p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Item Image */}
                                        <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                                            {order.itemPhotos?.[0] ? (
                                                <img src={order.itemPhotos[0]} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="text-gray-400" size={24} />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Order Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h4 className="font-bold dark:text-white truncate">{order.itemTitle}</h4>
                                                    <p className="text-sm text-gray-500">{order.itemBrand}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusConfig.color}`}>
                                                    {getStatusIcon(order.status)}
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                                                {isBuyer ? (
                                                    <span className="font-bold text-green-600">
                                                        ${order.buyerTotal?.toFixed(2) || order.price}
                                                        {order.serviceFee && (
                                                            <span className="text-[10px] text-gray-400 font-normal ml-1">
                                                                (incl. ${order.serviceFee?.toFixed(2)} fee)
                                                            </span>
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="font-bold text-green-600">
                                                        ${order.sellerPayout?.toFixed(2) || order.price}
                                                        {order.serviceFee && (
                                                            <span className="text-[10px] text-gray-400 font-normal ml-1">
                                                                (after ${order.serviceFee?.toFixed(2)} fee)
                                                            </span>
                                                        )}
                                                    </span>
                                                )}
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                    isBuyer 
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                                                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                    {isBuyer ? 'Purchasing' : 'Selling'}
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {order.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}
                                                </span>
                                            </div>
                                            
                                            {/* Fulfillment Info */}
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                {order.fulfillmentMethod === 'shipping' ? (
                                                    <>
                                                        <Truck size={12} />
                                                        <span>Shipping to {order.shippingAddress?.city}, {order.shippingAddress?.state}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Home size={12} />
                                                        <span>Local Pickup</span>
                                                    </>
                                                )}
                                            </div>
                                            
                                            {/* Tracking Info */}
                                            {order.trackingNumber && (
                                                <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-xs">
                                                    <span className="text-purple-700 dark:text-purple-400 font-bold">
                                                        Tracking: {order.trackingCarrier?.toUpperCase()} - {order.trackingNumber}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                                        {/* Seller Actions */}
                                        {isSeller && order.status === ORDER_STATUS.PENDING && (
                                            <button
                                                onClick={() => onUpdateStatus(order.id, ORDER_STATUS.CONFIRMED)}
                                                className="flex-1 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={16} /> Confirm Order
                                            </button>
                                        )}
                                        
                                        {isSeller && order.status === ORDER_STATUS.CONFIRMED && order.fulfillmentMethod === 'shipping' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowShippingModal(true);
                                                }}
                                                className="flex-1 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                                            >
                                                <Truck size={16} /> Mark as Shipped
                                            </button>
                                        )}
                                        
                                        {isSeller && order.status === ORDER_STATUS.CONFIRMED && order.fulfillmentMethod === 'pickup' && (
                                            <button
                                                onClick={() => onUpdateStatus(order.id, ORDER_STATUS.COMPLETED)}
                                                className="flex-1 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={16} /> Mark as Picked Up
                                            </button>
                                        )}
                                        
                                        {/* Buyer Actions */}
                                        {isBuyer && (order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED) && (
                                            <button
                                                onClick={() => handleConfirmDelivery(order)}
                                                className="flex-1 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={16} /> Confirm Receipt
                                            </button>
                                        )}
                                        
                                        {/* Contact Button */}
                                        <button
                                            onClick={() => openChat?.(isBuyer ? order.sellerId : order.buyerId)}
                                            className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2"
                                        >
                                            <MessageCircle size={16} /> 
                                            Contact {isBuyer ? 'Seller' : 'Buyer'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Shipping Modal */}
            <AnimatePresence>
                {showShippingModal && selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
                        onClick={() => setShowShippingModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-[#2c2e36] rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <h3 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
                                <Truck className="text-purple-600" /> Add Shipping Info
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Carrier</label>
                                    <select
                                        value={trackingCarrier}
                                        onChange={e => setTrackingCarrier(e.target.value)}
                                        className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                    >
                                        {carriers.map(c => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tracking Number</label>
                                    <input
                                        type="text"
                                        value={trackingNumber}
                                        onChange={e => setTrackingNumber(e.target.value)}
                                        placeholder="Enter tracking number"
                                        className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                                    <Info size={12} className="inline mr-1" />
                                    The buyer will be notified with the tracking information
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowShippingModal(false)}
                                        className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleMarkShipped}
                                        className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition flex items-center justify-center gap-2"
                                    >
                                        <Truck size={16} /> Confirm Shipment
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
