import { useState, useCallback } from 'react';
import { 
    Shield, Camera, Check, X, Clock, AlertTriangle, Upload,
    Calendar, MapPin, DollarSign, User, CheckCircle, Loader2,
    ChevronRight, Image, Eye, MessageSquare, Flag
} from 'lucide-react';
import { usePickupSession, usePickupSessionManager, PICKUP_STATUS, HIGH_VALUE_THRESHOLD } from '../../hooks/usePickupSession';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import toast from 'react-hot-toast';

// Status display configuration
const STATUS_CONFIG = {
    [PICKUP_STATUS.PENDING_DEPOSIT]: {
        label: 'Awaiting Deposit',
        color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
        icon: DollarSign,
        buyerAction: 'Pay full deposit to secure item',
        sellerAction: 'Waiting for buyer deposit'
    },
    [PICKUP_STATUS.DEPOSIT_RECEIVED]: {
        label: 'Deposit Received',
        color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
        icon: CheckCircle,
        buyerAction: 'Schedule pickup date with seller',
        sellerAction: 'Schedule pickup date with buyer'
    },
    [PICKUP_STATUS.PICKUP_SCHEDULED]: {
        label: 'Pickup Scheduled',
        color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
        icon: Calendar,
        buyerAction: 'Wait for pickup day',
        sellerAction: 'Prepare item and submit verification photos on pickup day'
    },
    [PICKUP_STATUS.SELLER_VERIFICATION_PENDING]: {
        label: 'Seller Verification Pending',
        color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
        icon: Camera,
        buyerAction: 'Wait for seller to verify item condition',
        sellerAction: 'Upload condition photos of item'
    },
    [PICKUP_STATUS.SELLER_VERIFIED]: {
        label: 'Seller Verified',
        color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
        icon: CheckCircle,
        buyerAction: 'Proceed to pickup and upload verification photos',
        sellerAction: 'Wait for buyer verification'
    },
    [PICKUP_STATUS.BUYER_VERIFICATION_PENDING]: {
        label: 'Buyer Verification Pending',
        color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
        icon: Camera,
        buyerAction: 'Upload verification photos of item',
        sellerAction: 'Wait for buyer verification'
    },
    [PICKUP_STATUS.BUYER_VERIFIED]: {
        label: 'Buyer Verified',
        color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
        icon: CheckCircle,
        buyerAction: 'Approve handover to complete',
        sellerAction: 'Approve handover to complete'
    },
    [PICKUP_STATUS.AWAITING_SELLER_APPROVAL]: {
        label: 'Awaiting Seller Approval',
        color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
        icon: Clock,
        buyerAction: 'Waiting for seller approval',
        sellerAction: 'Review and approve handover'
    },
    [PICKUP_STATUS.AWAITING_BUYER_APPROVAL]: {
        label: 'Awaiting Buyer Approval',
        color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
        icon: Clock,
        buyerAction: 'Review and approve handover',
        sellerAction: 'Waiting for buyer approval'
    },
    [PICKUP_STATUS.MUTUALLY_APPROVED]: {
        label: 'Mutually Approved',
        color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
        icon: CheckCircle,
        buyerAction: 'Transaction completing...',
        sellerAction: 'Transaction completing...'
    },
    [PICKUP_STATUS.COMPLETED]: {
        label: 'Completed',
        color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
        icon: CheckCircle,
        buyerAction: 'Pickup complete!',
        sellerAction: 'Funds released to your balance!'
    },
    [PICKUP_STATUS.DISPUTED]: {
        label: 'Disputed',
        color: 'text-red-600 bg-red-100 dark:bg-red-900/20',
        icon: AlertTriangle,
        buyerAction: 'Under review by our team',
        sellerAction: 'Under review by our team'
    },
    [PICKUP_STATUS.CANCELLED]: {
        label: 'Cancelled',
        color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20',
        icon: X,
        buyerAction: 'Session cancelled',
        sellerAction: 'Session cancelled'
    }
};

/**
 * Status Badge Component
 */
export function PickupStatusBadge({ status }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG[PICKUP_STATUS.PENDING_DEPOSIT];
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.color}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
}

/**
 * Photo Upload Component for Verification
 */
function PhotoUploader({ 
    photos, 
    onPhotosChange, 
    minPhotos = 2, 
    maxPhotos = 6,
    title = 'Verification Photos',
    description = 'Upload clear photos'
}) {
    const { uploadMedia, uploading } = useMediaUpload();

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (photos.length >= maxPhotos) {
            toast.error(`Maximum ${maxPhotos} photos allowed`);
            return;
        }

        const result = await uploadMedia(file, 'pickup-verification');
        if (result?.url) {
            onPhotosChange([...photos, result.url]);
        }
    };

    const removePhoto = (index) => {
        onPhotosChange(photos.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div>
                <h4 className="font-medium dark:text-white flex items-center gap-2">
                    <Camera size={18} />
                    {title}
                </h4>
                <p className="text-sm text-gray-500">
                    {description} (min {minPhotos}, max {maxPhotos})
                </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square">
                        <img 
                            src={photo} 
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border dark:border-gray-700"
                        />
                        <button
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                        >
                            ×
                        </button>
                    </div>
                ))}
                
                {photos.length < maxPhotos && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        {uploading ? (
                            <Loader2 size={24} className="animate-spin text-gray-400" />
                        ) : (
                            <>
                                <Upload size={24} className="text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500">Add Photo</span>
                            </>
                        )}
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                    </label>
                )}
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all ${
                            photos.length >= minPhotos ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(100, (photos.length / minPhotos) * 100)}%` }}
                    />
                </div>
                <span className={`text-xs font-medium ${
                    photos.length >= minPhotos ? 'text-green-600' : 'text-yellow-600'
                }`}>
                    {photos.length}/{minPhotos} required
                </span>
            </div>
        </div>
    );
}

/**
 * Photo Gallery Viewer
 */
function PhotoGallery({ photos, title }) {
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    if (!photos || photos.length === 0) return null;

    return (
        <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">{title}</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedPhoto(photo)}
                        className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border dark:border-gray-700 hover:ring-2 hover:ring-brand-blue transition"
                    >
                        <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>

            {/* Lightbox */}
            {selectedPhoto && (
                <div 
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[90] p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <button 
                        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <X size={24} />
                    </button>
                    <img 
                        src={selectedPhoto} 
                        alt="Full size" 
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}

/**
 * Progress Timeline Component
 */
function PickupTimeline({ session, isSeller }) {
    const steps = [
        { 
            key: 'deposit', 
            label: 'Deposit Paid',
            complete: session.depositPaid
        },
        { 
            key: 'scheduled', 
            label: 'Pickup Scheduled',
            complete: !!session.scheduledDate
        },
        { 
            key: 'seller_verify', 
            label: 'Seller Verification',
            complete: session.sellerVerification?.completed
        },
        { 
            key: 'buyer_verify', 
            label: 'Buyer Verification',
            complete: session.buyerVerification?.completed
        },
        { 
            key: 'mutual_approve', 
            label: 'Mutual Approval',
            complete: session.sellerApproved && session.buyerApproved
        },
        { 
            key: 'complete', 
            label: 'Completed',
            complete: session.status === PICKUP_STATUS.COMPLETED
        }
    ];

    const currentStepIndex = steps.findIndex(s => !s.complete);

    return (
        <div className="relative">
            {/* Progress line */}
            <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700" />
            <div 
                className="absolute left-3 top-4 w-0.5 bg-green-500 transition-all"
                style={{ height: `${Math.max(0, currentStepIndex - 1) * 20}%` }}
            />

            <div className="space-y-4">
                {steps.map((step, index) => {
                    const isCurrent = index === currentStepIndex;
                    const isComplete = step.complete;

                    return (
                        <div key={step.key} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center relative z-10 ${
                                isComplete 
                                    ? 'bg-green-500 text-white' 
                                    : isCurrent 
                                        ? 'bg-brand-blue text-white animate-pulse' 
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                            }`}>
                                {isComplete ? <Check size={14} /> : <span className="text-xs">{index + 1}</span>}
                            </div>
                            <span className={`text-sm ${
                                isComplete 
                                    ? 'text-green-600 font-medium' 
                                    : isCurrent 
                                        ? 'text-gray-900 dark:text-white font-medium' 
                                        : 'text-gray-400'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Main Pickup Verification Component
 */
export default function PickupVerification({ 
    sessionId, 
    userId, 
    onClose,
    onMessageOther
}) {
    const { session, loading } = usePickupSession(sessionId);
    const { 
        recordDeposit,
        schedulePickup,
        submitSellerVerification,
        submitBuyerVerification,
        sellerApprove,
        buyerApprove,
        openDispute,
        cancelSession
    } = usePickupSessionManager(userId);

    // Form states
    const [sellerPhotos, setSellerPhotos] = useState([]);
    const [sellerNotes, setSellerNotes] = useState('');
    const [buyerPhotos, setBuyerPhotos] = useState([]);
    const [buyerNotes, setBuyerNotes] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [disputeReason, setDisputeReason] = useState('');
    const [showDispute, setShowDispute] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[80]">
                <Loader2 size={32} className="animate-spin text-white" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl p-6 text-center">
                    <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-lg font-bold dark:text-white mb-2">Session Not Found</h3>
                    <p className="text-gray-500 mb-4">This pickup session may have been cancelled or doesn&apos;t exist.</p>
                    <button onClick={onClose} className="px-4 py-2 bg-brand-blue text-white rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const isSeller = session.sellerId === userId;
    const isBuyer = session.buyerId === userId;
    const statusConfig = STATUS_CONFIG[session.status] || STATUS_CONFIG[PICKUP_STATUS.PENDING_DEPOSIT];
    const currentAction = isSeller ? statusConfig.sellerAction : statusConfig.buyerAction;

    // Action handlers
    const handlePayDeposit = async () => {
        setActionLoading(true);
        // In production, this would integrate with payment processor
        await recordDeposit(sessionId);
        setActionLoading(false);
    };

    const handleSchedulePickup = async () => {
        if (!scheduledDate || !scheduledTime) {
            toast.error('Please select date and time');
            return;
        }
        setActionLoading(true);
        const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        await schedulePickup(sessionId, dateTime, session.pickupLocation);
        setActionLoading(false);
    };

    const handleSellerSubmit = async () => {
        setActionLoading(true);
        await submitSellerVerification(sessionId, sellerPhotos, sellerNotes);
        setActionLoading(false);
    };

    const handleBuyerSubmit = async () => {
        setActionLoading(true);
        await submitBuyerVerification(sessionId, buyerPhotos, buyerNotes);
        setActionLoading(false);
    };

    const handleApprove = async () => {
        setActionLoading(true);
        if (isSeller) {
            await sellerApprove(sessionId);
        } else {
            await buyerApprove(sessionId);
        }
        setActionLoading(false);
    };

    const handleOpenDispute = async () => {
        if (!disputeReason.trim()) {
            toast.error('Please provide a reason for the dispute');
            return;
        }
        setActionLoading(true);
        await openDispute(sessionId, disputeReason, userId);
        setShowDispute(false);
        setActionLoading(false);
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this pickup session?')) return;
        setActionLoading(true);
        await cancelSession(sessionId, 'User requested cancellation', userId);
        setActionLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
            <div className="bg-white dark:bg-[#2c2e36] w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <Shield size={20} className="text-green-600" />
                        </div>
                        <div>
                            <h2 className="font-bold dark:text-white">Secure Pickup</h2>
                            <p className="text-xs text-gray-500">Two-Party Verification</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <PickupStatusBadge status={session.status} />
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Item Info */}
                    <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        {session.itemImages?.[0] && (
                            <img 
                                src={session.itemImages[0]} 
                                alt={session.itemTitle}
                                className="w-20 h-20 rounded-lg object-cover"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="font-bold dark:text-white">{session.itemTitle}</h3>
                            <div className="text-lg font-bold text-green-600">${session.itemPrice}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin size={12} />
                                {session.pickupLocation || 'Location to be confirmed'}
                            </div>
                        </div>
                    </div>

                    {/* Parties */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-xl border ${isSeller ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Seller</div>
                            <div className="flex items-center gap-2">
                                {session.sellerPhoto ? (
                                    <img src={session.sellerPhoto} alt="" className="w-8 h-8 rounded-full" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                        <User size={14} />
                                    </div>
                                )}
                                <span className="font-medium dark:text-white text-sm">{session.sellerName}</span>
                                {isSeller && <span className="text-[10px] bg-brand-blue text-white px-1 rounded">You</span>}
                            </div>
                        </div>
                        <div className={`p-3 rounded-xl border ${isBuyer ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Buyer</div>
                            <div className="flex items-center gap-2">
                                {session.buyerPhoto ? (
                                    <img src={session.buyerPhoto} alt="" className="w-8 h-8 rounded-full" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                        <User size={14} />
                                    </div>
                                )}
                                <span className="font-medium dark:text-white text-sm">{session.buyerName}</span>
                                {isBuyer && <span className="text-[10px] bg-brand-blue text-white px-1 rounded">You</span>}
                            </div>
                        </div>
                    </div>

                    {/* Progress Timeline */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <h4 className="font-medium dark:text-white mb-3">Progress</h4>
                        <PickupTimeline session={session} isSeller={isSeller} />
                    </div>

                    {/* Current Action */}
                    <div className="p-4 bg-brand-blue/10 border border-brand-blue/20 rounded-xl">
                        <div className="text-sm font-medium text-brand-blue mb-1">Your Next Step</div>
                        <div className="font-bold dark:text-white">{currentAction}</div>
                    </div>

                    {/* Action Forms based on status */}
                    
                    {/* Pay Deposit */}
                    {session.status === PICKUP_STATUS.PENDING_DEPOSIT && isBuyer && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800">
                            <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">Pay Full Deposit</h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                                Pay ${session.depositAmount} to secure this item. Funds will be held until pickup is complete.
                            </p>
                            <button
                                onClick={handlePayDeposit}
                                disabled={actionLoading}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" /> : <DollarSign size={18} />}
                                Pay ${session.depositAmount} Deposit
                            </button>
                        </div>
                    )}

                    {/* Schedule Pickup */}
                    {session.status === PICKUP_STATUS.DEPOSIT_RECEIVED && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
                            <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                                <Calendar size={18} />
                                Schedule Pickup
                            </h4>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date</label>
                                    <input
                                        type="date"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Time</label>
                                    <input
                                        type="time"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                        className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSchedulePickup}
                                disabled={actionLoading || !scheduledDate || !scheduledTime}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" /> : 'Confirm Schedule'}
                            </button>
                        </div>
                    )}

                    {/* Scheduled Info */}
                    {session.scheduledDate && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center gap-3">
                            <Calendar size={24} className="text-brand-blue" />
                            <div>
                                <div className="text-xs text-gray-500">Scheduled Pickup</div>
                                <div className="font-bold dark:text-white">
                                    {session.scheduledDate?.toLocaleDateString?.('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    }) || 'Date set'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Seller Verification */}
                    {(session.status === PICKUP_STATUS.PICKUP_SCHEDULED || 
                      session.status === PICKUP_STATUS.SELLER_VERIFICATION_PENDING) && 
                      isSeller && !session.sellerVerification?.completed && (
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800">
                            <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-2">
                                Day of Pickup - Seller Verification
                            </h4>
                            <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                                Upload at least 3 clear photos showing the current condition of the item. 
                                Include all angles and any existing damage.
                            </p>
                            
                            <PhotoUploader
                                photos={sellerPhotos}
                                onPhotosChange={setSellerPhotos}
                                minPhotos={3}
                                maxPhotos={8}
                                title="Condition Photos"
                                description="Take clear photos from multiple angles"
                            />

                            <div className="mt-4">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    value={sellerNotes}
                                    onChange={(e) => setSellerNotes(e.target.value)}
                                    placeholder="Any notes about the item condition..."
                                    className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white resize-none"
                                    rows={2}
                                />
                            </div>

                            <button
                                onClick={handleSellerSubmit}
                                disabled={actionLoading || sellerPhotos.length < 3}
                                className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" /> : 'Submit Verification'}
                            </button>
                        </div>
                    )}

                    {/* Show Seller Verification Photos */}
                    {session.sellerVerification?.completed && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle size={18} className="text-green-600" />
                                <h4 className="font-bold text-green-800 dark:text-green-200">
                                    Seller Verification Complete
                                </h4>
                            </div>
                            <PhotoGallery photos={session.sellerVerification.photos} title="Seller's Condition Photos" />
                            {session.sellerVerification.notes && (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 italic">
                                    &quot;{session.sellerVerification.notes}&quot;
                                </p>
                            )}
                        </div>
                    )}

                    {/* Buyer Verification */}
                    {session.sellerVerification?.completed && 
                     isBuyer && 
                     !session.buyerVerification?.completed && (
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-800">
                            <h4 className="font-bold text-purple-800 dark:text-purple-200 mb-2">
                                Buyer Verification - At Pickup
                            </h4>
                            <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                                Upload at least 2 photos of the item when you receive it. 
                                This confirms the handover.
                            </p>
                            
                            <PhotoUploader
                                photos={buyerPhotos}
                                onPhotosChange={setBuyerPhotos}
                                minPhotos={2}
                                maxPhotos={6}
                                title="Handover Photos"
                                description="Photos proving you received the item"
                            />

                            <div className="mt-4">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={buyerNotes}
                                    onChange={(e) => setBuyerNotes(e.target.value)}
                                    placeholder="Any notes about receiving the item..."
                                    className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white resize-none"
                                    rows={2}
                                />
                            </div>

                            <button
                                onClick={handleBuyerSubmit}
                                disabled={actionLoading || buyerPhotos.length < 2}
                                className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" /> : 'Submit Verification'}
                            </button>
                        </div>
                    )}

                    {/* Show Buyer Verification Photos */}
                    {session.buyerVerification?.completed && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle size={18} className="text-green-600" />
                                <h4 className="font-bold text-green-800 dark:text-green-200">
                                    Buyer Verification Complete
                                </h4>
                            </div>
                            <PhotoGallery photos={session.buyerVerification.photos} title="Buyer's Handover Photos" />
                            {session.buyerVerification.notes && (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 italic">
                                    &quot;{session.buyerVerification.notes}&quot;
                                </p>
                            )}
                        </div>
                    )}

                    {/* Approval Section */}
                    {session.buyerVerification?.completed && 
                     session.status !== PICKUP_STATUS.COMPLETED &&
                     session.status !== PICKUP_STATUS.DISPUTED && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                            <h4 className="font-bold text-green-800 dark:text-green-200 mb-3">
                                Approve Handover
                            </h4>
                            
                            <div className="flex items-center justify-between mb-4 text-sm">
                                <span className="text-gray-600 dark:text-gray-300">Seller Approval</span>
                                {session.sellerApproved ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <CheckCircle size={14} /> Approved
                                    </span>
                                ) : (
                                    <span className="text-yellow-600">Pending</span>
                                )}
                            </div>
                            
                            <div className="flex items-center justify-between mb-4 text-sm">
                                <span className="text-gray-600 dark:text-gray-300">Buyer Approval</span>
                                {session.buyerApproved ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <CheckCircle size={14} /> Approved
                                    </span>
                                ) : (
                                    <span className="text-yellow-600">Pending</span>
                                )}
                            </div>

                            {((isSeller && !session.sellerApproved) || (isBuyer && !session.buyerApproved)) && (
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" /> : (
                                        <>
                                            <CheckCircle size={18} />
                                            Approve Handover
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Completed State */}
                    {session.status === PICKUP_STATUS.COMPLETED && (
                        <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800 text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                                Pickup Complete!
                            </h3>
                            <p className="text-green-700 dark:text-green-300">
                                {isSeller 
                                    ? `$${session.depositAmount} has been added to your withdrawal balance.`
                                    : 'Thank you for using SeshNx Secure Pickup!'
                                }
                            </p>
                        </div>
                    )}

                    {/* Dispute Section */}
                    {showDispute && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
                            <h4 className="font-bold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                                <Flag size={18} />
                                Open Dispute
                            </h4>
                            <textarea
                                value={disputeReason}
                                onChange={(e) => setDisputeReason(e.target.value)}
                                placeholder="Describe the issue..."
                                className="w-full p-3 border border-red-200 dark:border-red-800 rounded-lg dark:bg-[#1f2128] dark:text-white resize-none mb-3"
                                rows={3}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowDispute(false)}
                                    className="flex-1 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleOpenDispute}
                                    disabled={actionLoading || !disputeReason.trim()}
                                    className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                                >
                                    Submit Dispute
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t dark:border-gray-700 flex gap-2">
                    {onMessageOther && (
                        <button
                            onClick={() => onMessageOther(isSeller ? session.buyerId : session.sellerId)}
                            className="flex-1 py-2.5 border dark:border-gray-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <MessageSquare size={18} />
                            Message {isSeller ? 'Buyer' : 'Seller'}
                        </button>
                    )}
                    
                    {session.status !== PICKUP_STATUS.COMPLETED && 
                     session.status !== PICKUP_STATUS.CANCELLED &&
                     session.status !== PICKUP_STATUS.DISPUTED && (
                        <button
                            onClick={() => setShowDispute(!showDispute)}
                            className="px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium flex items-center gap-1"
                        >
                            <Flag size={16} />
                            Dispute
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * High-Value Item Purchase Modal - Initial Flow
 */
export function HighValuePurchaseModal({ 
    item, 
    user, 
    userData,
    onClose, 
    onSessionCreated 
}) {
    const { createPickupSession } = usePickupSessionManager(user?.uid);
    const [pickupLocation, setPickupLocation] = useState(item.location || '');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [creating, setCreating] = useState(false);

    const handleInitiatePurchase = async () => {
        if (!pickupLocation.trim()) {
            toast.error('Please enter a pickup location');
            return;
        }
        if (!agreedToTerms) {
            toast.error('Please agree to the terms');
            return;
        }

        setCreating(true);
        const result = await createPickupSession({
            orderId: `ORD-${Date.now()}`,
            itemId: item.id,
            itemTitle: item.title,
            itemPrice: item.price,
            itemImages: item.images,
            sellerId: item.sellerId,
            sellerName: item.sellerName,
            sellerPhoto: item.sellerPhoto,
            buyerId: user.uid,
            buyerName: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'Anonymous',
            buyerPhoto: userData?.photoURL,
            pickupLocation
        });
        setCreating(false);

        if (result.success) {
            onSessionCreated?.(result.sessionId);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
            <div className="bg-white dark:bg-[#2c2e36] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-700 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <Shield size={20} className="text-green-600" />
                    </div>
                    <div>
                        <h2 className="font-bold dark:text-white">High-Value Purchase</h2>
                        <p className="text-xs text-gray-500">Secure 2-Party Pickup Required</p>
                    </div>
                    <button onClick={onClose} className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Item Info */}
                    <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        {item.images?.[0] && (
                            <img src={item.images[0]} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                        )}
                        <div>
                            <h3 className="font-medium dark:text-white">{item.title}</h3>
                            <div className="text-lg font-bold text-green-600">${item.price}</div>
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">
                            How Secure Pickup Works
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                Pay full deposit (${item.price}) to secure the item
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                Schedule local pickup with seller
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                Seller uploads condition photos on pickup day
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                                You upload verification photos at handover
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">5</span>
                                Both approve → Seller receives funds
                            </li>
                        </ul>
                    </div>

                    {/* Pickup Location */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                            Pickup Location
                        </label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={pickupLocation}
                                onChange={(e) => setPickupLocation(e.target.value)}
                                placeholder="City, neighborhood, or meeting point"
                                className="w-full pl-10 pr-4 py-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Local pickup only. Exact location confirmed after deposit.
                        </p>
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-1"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            I understand that this purchase requires local pickup and mutual verification. 
                            My deposit will be held until both parties confirm the handover.
                        </span>
                    </label>
                </div>

                {/* Actions */}
                <div className="p-4 border-t dark:border-gray-700 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleInitiatePurchase}
                        disabled={creating || !pickupLocation.trim() || !agreedToTerms}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {creating ? <Loader2 className="animate-spin" /> : (
                            <>
                                <Shield size={18} />
                                Initiate Purchase
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
