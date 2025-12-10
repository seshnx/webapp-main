// src/components/marketplace/SafeExchangeTransaction.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
    doc, onSnapshot, updateDoc, serverTimestamp, addDoc, collection, getDoc 
} from 'firebase/firestore';
import { 
    Shield, MapPin, Camera, CheckCircle, Clock, AlertTriangle, 
    Navigation, Phone, MessageCircle, X, ChevronRight, User,
    DollarSign, Lock, Unlock, ArrowRight, Package, Loader2,
    Calendar, CreditCard, Map, Check, XCircle
} from 'lucide-react';
import { db, appId, getPaths } from '../../config/firebase';
import { 
    SAFE_EXCHANGE_STATUS, 
    SAFE_EXCHANGE_STEPS,
    HIGH_VALUE_THRESHOLD 
} from '../../config/constants';
import { useSafeZoneVerification } from '../../hooks/useSafeZoneVerification';
import PhotoVerification from './PhotoVerification';
import UserAvatar from '../shared/UserAvatar';

/**
 * SafeExchangeTransaction Component
 * Manages the complete workflow for high-value item exchanges
 */
export default function SafeExchangeTransaction({
    transactionId,
    user,
    userData,
    onClose,
    onComplete,
    onMessage // Function to open chat with other party
}) {
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedSafeZone, setSelectedSafeZone] = useState(null);
    const [meetupDate, setMeetupDate] = useState('');
    const [meetupTime, setMeetupTime] = useState('');
    const [showZonePicker, setShowZonePicker] = useState(false);
    const [nearbyZones, setNearbyZones] = useState([]);
    const [photoMode, setPhotoMode] = useState(null); // 'seller_depart' | 'buyer_inspect' | null

    // Get current role
    const isSeller = transaction?.sellerId === user?.uid;
    const isBuyer = transaction?.buyerId === user?.uid;
    const role = isSeller ? 'seller' : 'buyer';

    // GPS verification hook
    const {
        currentPosition,
        locationError,
        isInSafeZone,
        nearestSafeZone,
        otherPartyPosition,
        proximityToOther,
        isWithinProximity,
        startWatching,
        stopWatching,
        findNearbySafeZones,
        verifyArrival,
        verifyProximity
    } = useSafeZoneVerification(transactionId, user?.uid);

    // Subscribe to transaction updates
    useEffect(() => {
        if (!transactionId) return;

        const transactionRef = doc(db, `artifacts/${appId}/public/data/safe_exchange_transactions`, transactionId);
        const unsubscribe = onSnapshot(transactionRef, (snap) => {
            if (snap.exists()) {
                setTransaction({ id: snap.id, ...snap.data() });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [transactionId]);

    // Update user's position in transaction
    useEffect(() => {
        if (!transaction || !currentPosition) return;

        const updatePosition = async () => {
            try {
                const transactionRef = doc(db, `artifacts/${appId}/public/data/safe_exchange_transactions`, transactionId);
                await updateDoc(transactionRef, {
                    [`${role}Location`]: {
                        lat: currentPosition.lat,
                        lng: currentPosition.lng,
                        updatedAt: Date.now()
                    }
                });
            } catch (error) {
                console.error('Failed to update position:', error);
            }
        };

        updatePosition();
    }, [currentPosition, transaction, transactionId, role]);

    // Load nearby safe zones when zone picker is opened
    useEffect(() => {
        if (showZonePicker && currentPosition) {
            findNearbySafeZones().then(zones => setNearbyZones(zones));
        }
    }, [showZonePicker, currentPosition, findNearbySafeZones]);

    // Update transaction status
    const updateStatus = useCallback(async (newStatus, additionalData = {}) => {
        if (!transactionId) return;

        setActionLoading(true);
        try {
            const transactionRef = doc(db, `artifacts/${appId}/public/data/safe_exchange_transactions`, transactionId);
            await updateDoc(transactionRef, {
                status: newStatus,
                [`statusHistory.${newStatus}`]: {
                    timestamp: Date.now(),
                    userId: user.uid
                },
                ...additionalData,
                updatedAt: serverTimestamp()
            });

            // Send notification to other party
            await sendNotification(newStatus);
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update transaction. Please try again.');
        }
        setActionLoading(false);
    }, [transactionId, user?.uid]);

    // Send notification to other party
    const sendNotification = async (status) => {
        const otherUserId = isSeller ? transaction.buyerId : transaction.sellerId;
        const notificationRef = collection(db, getPaths(otherUserId).notifications);
        
        const messages = {
            [SAFE_EXCHANGE_STATUS.MEETUP_SCHEDULED]: `Meetup scheduled for ${transaction.meetupDate} at ${transaction.meetupTime}`,
            [SAFE_EXCHANGE_STATUS.SELLER_EN_ROUTE]: 'Seller is on their way to the exchange location',
            [SAFE_EXCHANGE_STATUS.BUYER_EN_ROUTE]: 'Buyer is on their way to the exchange location',
            [SAFE_EXCHANGE_STATUS.AT_SAFE_ZONE]: `${isSeller ? 'Seller' : 'Buyer'} has arrived at the safe zone`,
            [SAFE_EXCHANGE_STATUS.SELLER_PHOTOS_UPLOADED]: 'Seller has uploaded pre-departure photos',
            [SAFE_EXCHANGE_STATUS.BUYER_APPROVED]: 'Buyer has approved the exchange',
            [SAFE_EXCHANGE_STATUS.SELLER_APPROVED]: 'Seller has approved the exchange',
            [SAFE_EXCHANGE_STATUS.COMPLETED]: '🎉 Exchange completed! Funds have been released.',
            [SAFE_EXCHANGE_STATUS.DISPUTED]: '⚠️ A dispute has been raised on the transaction'
        };

        await addDoc(notificationRef, {
            type: 'safe_exchange',
            transactionId,
            message: messages[status] || `Transaction status updated: ${status}`,
            itemTitle: transaction.itemTitle,
            read: false,
            createdAt: serverTimestamp()
        });
    };

    // Schedule meetup
    const scheduleMeetup = async () => {
        if (!selectedSafeZone || !meetupDate || !meetupTime) {
            alert('Please select a safe zone and set a date/time.');
            return;
        }

        await updateStatus(SAFE_EXCHANGE_STATUS.MEETUP_SCHEDULED, {
            meetupLocation: selectedSafeZone,
            meetupDate,
            meetupTime
        });
        setShowZonePicker(false);
    };

    // Handle departure (seller)
    const handleSellerDepart = () => {
        setPhotoMode('seller_depart');
        startWatching();
    };

    // Handle seller photo submission
    const handleSellerPhotosSubmitted = async (photos, notes) => {
        await updateStatus(SAFE_EXCHANGE_STATUS.SELLER_PHOTOS_UPLOADED, {
            sellerDeparturePhotos: photos,
            sellerDepartureNotes: notes
        });
        setPhotoMode(null);
        await updateStatus(SAFE_EXCHANGE_STATUS.SELLER_EN_ROUTE);
    };

    // Handle buyer departure
    const handleBuyerDepart = () => {
        startWatching();
        updateStatus(SAFE_EXCHANGE_STATUS.BUYER_EN_ROUTE);
    };

    // Handle buyer inspection complete
    const handleBuyerInspectionComplete = async (result) => {
        await updateStatus(SAFE_EXCHANGE_STATUS.BUYER_PHOTOS_UPLOADED, {
            buyerInspectionResult: result.result,
            buyerInspectionPhotos: result.buyerPhotos,
            buyerInspectionNotes: result.notes
        });

        if (result.result === 'mismatch') {
            await updateStatus(SAFE_EXCHANGE_STATUS.DISPUTED);
        } else {
            await updateStatus(SAFE_EXCHANGE_STATUS.PENDING_DUAL_APPROVAL);
        }
        setPhotoMode(null);
    };

    // Handle approval
    const handleApprove = async () => {
        const approvalKey = isSeller ? 'sellerApproved' : 'buyerApproved';
        const newStatus = isSeller 
            ? SAFE_EXCHANGE_STATUS.SELLER_APPROVED 
            : SAFE_EXCHANGE_STATUS.BUYER_APPROVED;

        await updateStatus(newStatus, {
            [approvalKey]: true,
            [`${approvalKey}At`]: Date.now()
        });

        // Check if both approved
        const otherApproved = isSeller ? transaction.buyerApproved : transaction.sellerApproved;
        if (otherApproved) {
            await completeTransaction();
        }
    };

    // Complete transaction and release funds
    const completeTransaction = async () => {
        await updateStatus(SAFE_EXCHANGE_STATUS.COMPLETED, {
            completedAt: serverTimestamp()
        });

        // Release escrow funds (in production, this would call a cloud function)
        // For now, we mark it as released
        await updateDoc(
            doc(db, `artifacts/${appId}/public/data/safe_exchange_transactions`, transactionId),
            {
                fundsReleased: true,
                fundsReleasedAt: serverTimestamp()
            }
        );

        onComplete?.();
    };

    // Cancel transaction
    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this transaction? This may affect your seller rating.')) {
            return;
        }

        await updateStatus(SAFE_EXCHANGE_STATUS.CANCELLED, {
            cancelledBy: user.uid,
            cancelledAt: serverTimestamp()
        });

        onClose?.();
    };

    // Raise dispute
    const handleDispute = async (reason) => {
        await updateStatus(SAFE_EXCHANGE_STATUS.DISPUTED, {
            disputeReason: reason,
            disputeRaisedBy: user.uid,
            disputeRaisedAt: serverTimestamp()
        });
    };

    // Get current step index
    const getCurrentStepIndex = () => {
        const statusToStep = {
            [SAFE_EXCHANGE_STATUS.INTENT_CREATED]: 0,
            [SAFE_EXCHANGE_STATUS.HOLD_PLACED]: 1,
            [SAFE_EXCHANGE_STATUS.SELLER_NOTIFIED]: 1,
            [SAFE_EXCHANGE_STATUS.MEETUP_SCHEDULED]: 2,
            [SAFE_EXCHANGE_STATUS.SELLER_EN_ROUTE]: 3,
            [SAFE_EXCHANGE_STATUS.SELLER_PHOTOS_UPLOADED]: 3,
            [SAFE_EXCHANGE_STATUS.BUYER_EN_ROUTE]: 4,
            [SAFE_EXCHANGE_STATUS.AT_SAFE_ZONE]: 4,
            [SAFE_EXCHANGE_STATUS.BUYER_INSPECTING]: 5,
            [SAFE_EXCHANGE_STATUS.BUYER_PHOTOS_UPLOADED]: 5,
            [SAFE_EXCHANGE_STATUS.PENDING_DUAL_APPROVAL]: 6,
            [SAFE_EXCHANGE_STATUS.SELLER_APPROVED]: 6,
            [SAFE_EXCHANGE_STATUS.BUYER_APPROVED]: 6,
            [SAFE_EXCHANGE_STATUS.COMPLETED]: 7
        };
        return statusToStep[transaction?.status] || 0;
    };

    // Render loading state
    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[80]">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-orange-500" size={48} />
                    <p className="text-gray-600 dark:text-gray-300">Loading transaction...</p>
                </div>
            </div>
        );
    }

    // Render photo verification mode
    if (photoMode === 'seller_depart') {
        return (
            <div className="fixed inset-0 bg-black/90 z-[80] overflow-y-auto">
                <div className="min-h-screen p-4">
                    <div className="max-w-2xl mx-auto py-8">
                        <button 
                            onClick={() => setPhotoMode(null)}
                            className="mb-4 text-white flex items-center gap-2 hover:underline"
                        >
                            <X size={20} /> Cancel
                        </button>
                        <PhotoVerification
                            mode="capture"
                            role="seller"
                            listingPhotos={transaction.itemPhotos || []}
                            itemDescription={transaction.itemDescription}
                            onPhotosSubmitted={handleSellerPhotosSubmitted}
                            requiredPhotoCount={3}
                            userId={user.uid}
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (photoMode === 'buyer_inspect') {
        return (
            <div className="fixed inset-0 bg-black/90 z-[80] overflow-y-auto">
                <div className="min-h-screen p-4">
                    <div className="max-w-2xl mx-auto py-8">
                        <button 
                            onClick={() => setPhotoMode(null)}
                            className="mb-4 text-white flex items-center gap-2 hover:underline"
                        >
                            <X size={20} /> Cancel
                        </button>
                        <PhotoVerification
                            mode="compare"
                            role="buyer"
                            listingPhotos={transaction.itemPhotos || []}
                            sellerDeparturePhotos={transaction.sellerDeparturePhotos || []}
                            itemDescription={transaction.itemDescription}
                            onVerificationComplete={handleBuyerInspectionComplete}
                            requiredPhotoCount={2}
                            userId={user.uid}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Main transaction view
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#1f2128] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white relative overflow-hidden">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex items-center gap-2 text-orange-200 text-xs font-bold uppercase tracking-widest mb-2">
                        <Shield size={14} /> Safe Exchange
                    </div>
                    <h2 className="text-2xl font-bold mb-1">{transaction?.itemTitle}</h2>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                            <DollarSign size={16} /> ${transaction?.price?.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                            <Package size={16} /> {transaction?.itemBrand}
                        </span>
                    </div>
                    
                    <Shield size={150} className="absolute -right-10 -bottom-10 text-white opacity-10 rotate-12" />
                </div>

                {/* Progress Tracker */}
                <div className="p-6 border-b dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold dark:text-white">Transaction Progress</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            transaction?.status === SAFE_EXCHANGE_STATUS.COMPLETED 
                                ? 'bg-green-100 text-green-700'
                                : transaction?.status === SAFE_EXCHANGE_STATUS.DISPUTED
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-orange-700'
                        }`}>
                            {transaction?.status?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                    </div>

                    {/* Step indicators */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-2">
                        {SAFE_EXCHANGE_STEPS.map((step, index) => {
                            const currentStep = getCurrentStepIndex();
                            const isComplete = index < currentStep;
                            const isCurrent = index === currentStep;
                            
                            return (
                                <React.Fragment key={step.key}>
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            isComplete 
                                                ? 'bg-green-500 text-white' 
                                                : isCurrent 
                                                ? 'bg-orange-500 text-white animate-pulse'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                        }`}>
                                            {isComplete ? <Check size={16} /> : index + 1}
                                        </div>
                                        <span className={`text-[10px] mt-1 whitespace-nowrap ${
                                            isCurrent ? 'font-bold text-orange-600' : 'text-gray-500'
                                        }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < SAFE_EXCHANGE_STEPS.length - 1 && (
                                        <div className={`flex-1 h-1 min-w-[20px] rounded ${
                                            isComplete ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                                        }`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Escrow Status */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-full">
                                <Lock className="text-white" size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-green-800 dark:text-green-300">Escrow Protected</h4>
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    ${transaction?.price?.toLocaleString()} held securely until both parties approve
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Parties */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border ${isSeller ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'dark:border-gray-700'}`}>
                            <div className="text-xs font-bold text-gray-500 uppercase mb-2">
                                Seller {isSeller && '(You)'}
                            </div>
                            <div className="flex items-center gap-3">
                                <UserAvatar 
                                    src={transaction?.sellerPhoto}
                                    name={transaction?.sellerName}
                                    size="md"
                                />
                                <div>
                                    <div className="font-bold dark:text-white">{transaction?.sellerName}</div>
                                    {transaction?.sellerApproved && (
                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircle size={12} /> Approved
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl border ${isBuyer ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'dark:border-gray-700'}`}>
                            <div className="text-xs font-bold text-gray-500 uppercase mb-2">
                                Buyer {isBuyer && '(You)'}
                            </div>
                            <div className="flex items-center gap-3">
                                <UserAvatar 
                                    src={transaction?.buyerPhoto}
                                    name={transaction?.buyerName}
                                    size="md"
                                />
                                <div>
                                    <div className="font-bold dark:text-white">{transaction?.buyerName}</div>
                                    {transaction?.buyerApproved && (
                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircle size={12} /> Approved
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meetup Details (if scheduled) */}
                    {transaction?.meetupLocation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                            <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-3">
                                <MapPin size={18} /> Exchange Location
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                    <Shield size={16} />
                                    <span className="font-bold">{transaction.meetupLocation.name}</span>
                                    <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded">
                                        {transaction.meetupLocation.typeLabel}
                                    </span>
                                </div>
                                <p className="text-blue-600 dark:text-blue-400">{transaction.meetupLocation.address}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} /> {transaction.meetupDate}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} /> {transaction.meetupTime}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GPS Status (when tracking) */}
                    {currentPosition && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                            <h4 className="font-bold dark:text-white text-sm mb-3 flex items-center gap-2">
                                <Navigation size={16} className="text-blue-500" /> Live Location
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Your Position:</span>
                                    <div className="flex items-center gap-1 font-mono text-xs dark:text-white">
                                        {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
                                    </div>
                                </div>
                                {nearestSafeZone && (
                                    <div>
                                        <span className="text-gray-500">Safe Zone:</span>
                                        <div className="flex items-center gap-1">
                                            {isInSafeZone ? (
                                                <span className="text-green-600 font-bold flex items-center gap-1">
                                                    <CheckCircle size={14} /> In Zone
                                                </span>
                                            ) : (
                                                <span className="text-orange-600">
                                                    {Math.round(nearestSafeZone.distance)}m away
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons Based on Status and Role */}
                    <div className="space-y-3">
                        {/* Seller: Schedule Meetup */}
                        {isSeller && transaction?.status === SAFE_EXCHANGE_STATUS.SELLER_NOTIFIED && (
                            <button
                                onClick={() => setShowZonePicker(true)}
                                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition"
                            >
                                <Calendar size={20} /> Schedule Safe Exchange
                            </button>
                        )}

                        {/* Seller: Start Departure */}
                        {isSeller && transaction?.status === SAFE_EXCHANGE_STATUS.MEETUP_SCHEDULED && (
                            <button
                                onClick={handleSellerDepart}
                                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition"
                            >
                                <Camera size={20} /> Take Pre-Departure Photos
                            </button>
                        )}

                        {/* Buyer: Start Journey */}
                        {isBuyer && transaction?.status === SAFE_EXCHANGE_STATUS.SELLER_PHOTOS_UPLOADED && (
                            <button
                                onClick={handleBuyerDepart}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                            >
                                <Navigation size={20} /> I'm On My Way
                            </button>
                        )}

                        {/* Buyer: Start Inspection */}
                        {isBuyer && (transaction?.status === SAFE_EXCHANGE_STATUS.BUYER_EN_ROUTE || 
                                     transaction?.status === SAFE_EXCHANGE_STATUS.AT_SAFE_ZONE) && 
                         isInSafeZone && isWithinProximity && (
                            <button
                                onClick={() => setPhotoMode('buyer_inspect')}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                            >
                                <Camera size={20} /> Start Item Inspection
                            </button>
                        )}

                        {/* Dual Approval */}
                        {transaction?.status === SAFE_EXCHANGE_STATUS.PENDING_DUAL_APPROVAL && (
                            <div className="space-y-3">
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                                    <h4 className="font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                                        Final Approval Required
                                    </h4>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                        Both parties must approve to release funds.
                                    </p>
                                </div>

                                {((isSeller && !transaction.sellerApproved) || 
                                  (isBuyer && !transaction.buyerApproved)) && (
                                    <button
                                        onClick={handleApprove}
                                        disabled={actionLoading}
                                        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        {actionLoading ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle size={20} /> Approve & Release Funds
                                            </>
                                        )}
                                    </button>
                                )}

                                {((isSeller && transaction.sellerApproved) || 
                                  (isBuyer && transaction.buyerApproved)) && (
                                    <div className="text-center text-green-600 font-bold py-4">
                                        <CheckCircle className="inline mr-2" />
                                        You have approved. Waiting for other party...
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Completed */}
                        {transaction?.status === SAFE_EXCHANGE_STATUS.COMPLETED && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 text-center">
                                <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                                <h4 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">
                                    Exchange Completed!
                                </h4>
                                <p className="text-green-600 dark:text-green-400">
                                    {isSeller 
                                        ? 'Funds have been released to your account.'
                                        : 'Thank you for your purchase!'}
                                </p>
                            </div>
                        )}

                        {/* Disputed */}
                        {transaction?.status === SAFE_EXCHANGE_STATUS.DISPUTED && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800 text-center">
                                <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
                                <h4 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
                                    Dispute Raised
                                </h4>
                                <p className="text-red-600 dark:text-red-400 mb-4">
                                    Our support team will review this transaction.
                                </p>
                                <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold">
                                    Contact Support
                                </button>
                            </div>
                        )}

                        {/* Message Other Party */}
                        {transaction?.status !== SAFE_EXCHANGE_STATUS.COMPLETED && (
                            <button
                                onClick={() => onMessage?.(isSeller ? transaction.buyerId : transaction.sellerId)}
                                className="w-full border-2 border-gray-300 dark:border-gray-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition dark:text-white"
                            >
                                <MessageCircle size={18} /> Message {isSeller ? 'Buyer' : 'Seller'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between">
                    {transaction?.status !== SAFE_EXCHANGE_STATUS.COMPLETED && 
                     transaction?.status !== SAFE_EXCHANGE_STATUS.CANCELLED && (
                        <>
                            <button
                                onClick={handleCancel}
                                className="text-red-600 font-bold text-sm hover:underline"
                            >
                                Cancel Transaction
                            </button>
                            {transaction?.status !== SAFE_EXCHANGE_STATUS.DISPUTED && (
                                <button
                                    onClick={() => handleDispute('Item not as described')}
                                    className="text-orange-600 font-bold text-sm hover:underline"
                                >
                                    Raise Dispute
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Safe Zone Picker Modal */}
            {showZonePicker && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[75] p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl overflow-hidden">
                        <div className="p-6 border-b dark:border-gray-700">
                            <h3 className="text-xl font-bold dark:text-white">Select Safe Exchange Zone</h3>
                            <p className="text-sm text-gray-500 mt-1">Choose a verified safe location for the exchange</p>
                        </div>

                        <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
                            {nearbyZones.length > 0 ? (
                                nearbyZones.map(zone => (
                                    <button
                                        key={zone.id}
                                        onClick={() => setSelectedSafeZone(zone)}
                                        className={`w-full p-4 rounded-xl border text-left transition ${
                                            selectedSafeZone?.id === zone.id
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${
                                                selectedSafeZone?.id === zone.id
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                            }`}>
                                                <Shield size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold dark:text-white">{zone.name}</div>
                                                <div className="text-xs text-gray-500 truncate">{zone.address}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                                        {zone.typeLabel}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {(zone.distance / 1000).toFixed(1)} km away
                                                    </span>
                                                </div>
                                            </div>
                                            {selectedSafeZone?.id === zone.id && (
                                                <CheckCircle className="text-orange-500" size={20} />
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>Loading nearby safe zones...</p>
                                </div>
                            )}
                        </div>

                        {selectedSafeZone && (
                            <div className="p-4 border-t dark:border-gray-700 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date</label>
                                        <input
                                            type="date"
                                            value={meetupDate}
                                            onChange={(e) => setMeetupDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Time</label>
                                        <input
                                            type="time"
                                            value={meetupTime}
                                            onChange={(e) => setMeetupTime(e.target.value)}
                                            className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={scheduleMeetup}
                                    disabled={!meetupDate || !meetupTime || actionLoading}
                                    className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-orange-700 transition"
                                >
                                    {actionLoading ? 'Scheduling...' : 'Confirm & Notify Buyer'}
                                </button>
                            </div>
                        )}

                        <div className="p-4 border-t dark:border-gray-700">
                            <button
                                onClick={() => setShowZonePicker(false)}
                                className="w-full text-gray-500 font-bold hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
