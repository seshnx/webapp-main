// src/components/marketplace/ShippingVerification.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Package, Camera, Truck, MapPin, CheckCircle, Clock, AlertTriangle,
    X, Upload, ChevronRight, ChevronLeft, Loader2, Box, Scissors,
    Image as ImageIcon, Check, XCircle, ExternalLink, Copy
} from 'lucide-react';
import { SHIPPING_VERIFICATION_STATUS, SHIPPING_VERIFICATION_STEPS } from '../../config/constants';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import UserAvatar from '../shared/UserAvatar';

// Supabase has been migrated away - shipping verification features temporarily disabled
const supabase = null;

/**
 * ShippingVerification Component
 * Manages the photo verification workflow for shipped items
 */
export default function ShippingVerification({
    transactionId,
    user,
    userData,
    onClose,
    onComplete,
    onMessage
}) {
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [photoMode, setPhotoMode] = useState(null); // 'packaging' | 'dropoff' | 'pickup' | 'unboxing'
    const [photos, setPhotos] = useState([]);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('');
    const [notes, setNotes] = useState('');

    const { uploadMedia, uploading } = useMediaUpload();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [showCamera, setShowCamera] = useState(false);

    const userId = user?.id || user?.uid;
    const isSeller = transaction?.sellerId === userId;
    const isBuyer = transaction?.buyerId === userId;
    const role = isSeller ? 'seller' : 'buyer';

    // Subscribe to transaction updates
    useEffect(() => {
        if (!transactionId || !supabase) return;

        const channel = supabase
            .channel(`shipping-${transactionId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'shipping_transactions',
                filter: `id=eq.${transactionId}`
            }, () => {
                loadTransaction();
            })
            .subscribe();

        loadTransaction();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [transactionId]);

    const loadTransaction = async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data: transactionData, error } = await supabase
                .from('shipping_transactions')
                .select('*')
                .eq('id', transactionId)
                .single();
            
            if (error) throw error;
            
            if (transactionData) {
                setTransaction({
                    id: transactionData.id,
                    ...transactionData,
                    buyerId: transactionData.buyer_id,
                    sellerId: transactionData.seller_id,
                    listingId: transactionData.listing_id,
                    itemTitle: transactionData.item_title,
                    trackingNumber: transactionData.tracking_number
                });
            }
        } catch (error) {
            console.error('Error loading transaction:', error);
        }
        setLoading(false);
    };

    // Camera functions
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setShowCamera(true);
            }
        } catch (error) {
            console.error('Camera error:', error);
            alert('Unable to access camera.');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
    }, []);

    const capturePhoto = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        canvas.toBlob(async (blob) => {
            if (!blob) return;
            try {
                const file = new File([blob], `shipping_${photoMode}_${Date.now()}.jpg`, { type: 'image/jpeg' });
                const result = await uploadMedia(file, `shipping/${transactionId}/${role}`);
                if (result?.url) {
                    setPhotos(prev => [...prev, {
                        url: result.url,
                        timestamp: Date.now(),
                        type: photoMode
                    }]);
                }
            } catch (error) {
                console.error('Upload failed:', error);
            }
        }, 'image/jpeg', 0.9);
    }, [uploadMedia, transactionId, role, photoMode]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const result = await uploadMedia(file, `shipping/${transactionId}/${role}`);
            if (result?.url) {
                setPhotos(prev => [...prev, { url: result.url, timestamp: Date.now(), type: photoMode }]);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    // Update transaction status
    const updateStatus = async (newStatus, additionalData = {}) => {
        if (!transactionId || !supabase) return;
        setActionLoading(true);
        const userId = user?.id || user?.uid;
        try {
            const statusHistory = transaction?.status_history || {};
            statusHistory[newStatus] = { timestamp: Date.now(), userId: userId };
            
            // Convert camelCase keys to snake_case for Supabase
            const convertedData = Object.keys(additionalData).reduce((acc, key) => {
                const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                acc[snakeKey] = additionalData[key];
                return acc;
            }, {});
            
            await supabase
                .from('shipping_transactions')
                .update({
                    status: newStatus,
                    status_history: statusHistory,
                    updated_at: new Date().toISOString(),
                    ...convertedData
                })
                .eq('id', transactionId);

            // Notify other party
            const otherUserId = isSeller ? transaction.buyerId : transaction.sellerId;
            await supabase
                .from('notifications')
                .insert({
                    user_id: otherUserId,
                    type: 'shipping_verification',
                    transaction_id: transactionId,
                    message: getNotificationMessage(newStatus),
                    item_title: transaction.itemTitle,
                    read: false,
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update. Please try again.');
        }
        setActionLoading(false);
    };

    const getNotificationMessage = (status) => {
        const messages = {
            [SHIPPING_VERIFICATION_STATUS.SELLER_PACKAGING_PHOTOS]: 'Seller has uploaded packaging photos',
            [SHIPPING_VERIFICATION_STATUS.SELLER_DROPOFF_PHOTOS]: 'Package has been dropped off for shipping',
            [SHIPPING_VERIFICATION_STATUS.IN_TRANSIT]: `Package in transit - Tracking: ${transaction?.trackingNumber}`,
            [SHIPPING_VERIFICATION_STATUS.BUYER_PICKUP_PHOTOS]: 'Buyer has received and photographed the package',
            [SHIPPING_VERIFICATION_STATUS.BUYER_UNBOXING_PHOTOS]: 'Buyer has opened and photographed the contents',
            [SHIPPING_VERIFICATION_STATUS.BUYER_VERIFIED]: 'Buyer has verified the item!',
            [SHIPPING_VERIFICATION_STATUS.COMPLETED]: '🎉 Transaction completed successfully!',
            [SHIPPING_VERIFICATION_STATUS.DISPUTED]: '⚠️ A dispute has been raised'
        };
        return messages[status] || `Status updated: ${status}`;
    };

    // Submit packaging photos (seller)
    const submitPackagingPhotos = async () => {
        if (photos.length < 2) {
            alert('Please upload at least 2 photos showing the item and packaging.');
            return;
        }
        await updateStatus(SHIPPING_VERIFICATION_STATUS.SELLER_PACKAGING_PHOTOS, {
            packagingPhotos: photos,
            packagingNotes: notes
        });
        setPhotos([]);
        setNotes('');
        setPhotoMode(null);
        stopCamera();
    };

    // Submit dropoff photos (seller)
    const submitDropoffPhotos = async () => {
        if (photos.length < 1) {
            alert('Please upload at least 1 photo at the carrier dropoff.');
            return;
        }
        if (!trackingNumber) {
            alert('Please enter the tracking number.');
            return;
        }
        await updateStatus(SHIPPING_VERIFICATION_STATUS.SELLER_DROPOFF_PHOTOS, {
            dropoffPhotos: photos,
            trackingNumber,
            carrier,
            dropoffNotes: notes
        });
        await updateStatus(SHIPPING_VERIFICATION_STATUS.IN_TRANSIT);
        setPhotos([]);
        setNotes('');
        setPhotoMode(null);
        stopCamera();
    };

    // Submit pickup photos (buyer)
    const submitPickupPhotos = async () => {
        if (photos.length < 1) {
            alert('Please upload at least 1 photo of the sealed package.');
            return;
        }
        await updateStatus(SHIPPING_VERIFICATION_STATUS.BUYER_PICKUP_PHOTOS, {
            pickupPhotos: photos,
            pickupNotes: notes
        });
        setPhotos([]);
        setNotes('');
        setPhotoMode(null);
        stopCamera();
    };

    // Submit unboxing photos (buyer)
    const submitUnboxingPhotos = async (verified) => {
        if (photos.length < 2) {
            alert('Please upload at least 2 photos showing the opened package and contents.');
            return;
        }
        
        if (verified) {
            await updateStatus(SHIPPING_VERIFICATION_STATUS.BUYER_VERIFIED, {
                unboxingPhotos: photos,
                unboxingNotes: notes,
                buyerVerified: true
            });
            await updateStatus(SHIPPING_VERIFICATION_STATUS.COMPLETED);
            onComplete?.();
        } else {
            await updateStatus(SHIPPING_VERIFICATION_STATUS.DISPUTED, {
                unboxingPhotos: photos,
                unboxingNotes: notes,
                buyerVerified: false,
                disputeReason: notes || 'Item not as described or missing'
            });
        }
        setPhotos([]);
        setNotes('');
        setPhotoMode(null);
        stopCamera();
    };

    // Get current step
    const getCurrentStepIndex = () => {
        const statusMap = {
            [SHIPPING_VERIFICATION_STATUS.PENDING_SHIPMENT]: 0,
            [SHIPPING_VERIFICATION_STATUS.SELLER_PACKAGING_PHOTOS]: 0,
            [SHIPPING_VERIFICATION_STATUS.SELLER_DROPOFF_PHOTOS]: 1,
            [SHIPPING_VERIFICATION_STATUS.IN_TRANSIT]: 2,
            [SHIPPING_VERIFICATION_STATUS.DELIVERED]: 3,
            [SHIPPING_VERIFICATION_STATUS.BUYER_PICKUP_PHOTOS]: 3,
            [SHIPPING_VERIFICATION_STATUS.BUYER_UNBOXING_PHOTOS]: 4,
            [SHIPPING_VERIFICATION_STATUS.BUYER_VERIFIED]: 5,
            [SHIPPING_VERIFICATION_STATUS.COMPLETED]: 5
        };
        return statusMap[transaction?.status] || 0;
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[80]">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-500" size={48} />
                    <p className="text-gray-600 dark:text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    // Photo capture mode
    if (photoMode) {
        const modeConfig = {
            packaging: {
                title: '📦 Package Documentation',
                subtitle: 'Photograph the item and how it\'s packaged',
                tips: ['Show item before packaging', 'Show protective materials', 'Show sealed package'],
                minPhotos: 2,
                onSubmit: submitPackagingPhotos
            },
            dropoff: {
                title: '🚚 Carrier Dropoff',
                subtitle: 'Photograph the package at the shipping carrier',
                tips: ['Show package with label visible', 'Show carrier location/counter', 'Get receipt if possible'],
                minPhotos: 1,
                onSubmit: submitDropoffPhotos,
                showTracking: true
            },
            pickup: {
                title: '📬 Package Received',
                subtitle: 'Photograph the sealed package as received',
                tips: ['Show package is sealed/unopened', 'Show shipping label', 'Note any damage'],
                minPhotos: 1,
                onSubmit: submitPickupPhotos
            },
            unboxing: {
                title: '📦 Unboxing Verification',
                subtitle: 'Open and photograph the contents',
                tips: ['Show opening the package', 'Show all contents', 'Show item condition'],
                minPhotos: 2,
                onSubmit: null, // Special handling
                showVerify: true
            }
        };

        const config = modeConfig[photoMode];

        return (
            <div className="fixed inset-0 bg-black/90 z-[80] overflow-y-auto">
                <div className="min-h-screen p-4">
                    <div className="max-w-2xl mx-auto py-8">
                        <button 
                            onClick={() => { setPhotoMode(null); setPhotos([]); stopCamera(); }}
                            className="mb-4 text-white flex items-center gap-2 hover:underline"
                        >
                            <X size={20} /> Cancel
                        </button>

                        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                                <h3 className="text-xl font-bold">{config.title}</h3>
                                <p className="text-sm opacity-90">{config.subtitle}</p>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Tips */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                                    <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-2">📸 Photo Tips</h4>
                                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                                        {config.tips.map((tip, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <Check size={14} /> {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Camera/Preview */}
                                <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                                    {showCamera ? (
                                        <>
                                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                            <canvas ref={canvasRef} className="hidden" />
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                                                <button onClick={stopCamera} className="p-3 bg-white/20 rounded-full">
                                                    <X className="text-white" size={24} />
                                                </button>
                                                <button 
                                                    onClick={capturePhoto}
                                                    disabled={uploading}
                                                    className="p-5 bg-white rounded-full shadow-lg"
                                                >
                                                    <Camera className={uploading ? 'animate-pulse text-blue-500' : 'text-gray-900'} size={32} />
                                                </button>
                                                <div className="w-12" />
                                            </div>
                                        </>
                                    ) : photos.length > 0 ? (
                                        <img src={photos[photos.length - 1]?.url} className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                            <Camera size={64} className="mb-4 opacity-30" />
                                            <p>No photos captured yet</p>
                                        </div>
                                    )}
                                </div>

                                {/* Photo thumbnails */}
                                {photos.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {photos.map((photo, idx) => (
                                            <div key={idx} className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-500">
                                                <img src={photo.url} className="w-full h-full object-cover" />
                                                <button 
                                                    onClick={() => removePhoto(idx)}
                                                    className="absolute top-0 right-0 p-1 bg-red-500 rounded-bl"
                                                >
                                                    <X size={12} className="text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-3">
                                    {!showCamera && (
                                        <>
                                            <button onClick={startCamera} className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                                <Camera size={20} /> Camera
                                            </button>
                                            <label className="flex-1 bg-gray-100 dark:bg-gray-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer">
                                                <Upload size={20} /> Upload
                                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                            </label>
                                        </>
                                    )}
                                </div>

                                {/* Tracking info (dropoff only) */}
                                {config.showTracking && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tracking Number *</label>
                                            <input
                                                type="text"
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                                placeholder="Enter tracking number"
                                                className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Carrier</label>
                                            <select
                                                value={carrier}
                                                onChange={(e) => setCarrier(e.target.value)}
                                                className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                            >
                                                <option value="">Select carrier</option>
                                                <option value="usps">USPS</option>
                                                <option value="ups">UPS</option>
                                                <option value="fedex">FedEx</option>
                                                <option value="dhl">DHL</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Notes</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any additional notes..."
                                        className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none"
                                        rows={2}
                                    />
                                </div>

                                {/* Progress */}
                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-bold dark:text-white">Photos: {photos.length} / {config.minPhotos}+ required</span>
                                        {photos.length >= config.minPhotos && <CheckCircle className="text-green-500" size={18} />}
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                        <div 
                                            className="h-full bg-green-500 rounded-full transition-all"
                                            style={{ width: `${Math.min(100, (photos.length / config.minPhotos) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Submit buttons */}
                                {config.showVerify ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => submitUnboxingPhotos(false)}
                                            disabled={photos.length < config.minPhotos || actionLoading}
                                            className="py-4 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <XCircle size={20} /> Item Issue
                                        </button>
                                        <button
                                            onClick={() => submitUnboxingPhotos(true)}
                                            disabled={photos.length < config.minPhotos || actionLoading}
                                            className="py-4 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <CheckCircle size={20} /> Item Verified
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={config.onSubmit}
                                        disabled={photos.length < config.minPhotos || actionLoading || (config.showTracking && !trackingNumber)}
                                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                                        Submit Photos
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main transaction view
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#1f2128] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase mb-2">
                        <Truck size={14} /> Shipping Verification
                    </div>
                    <h2 className="text-xl font-bold">{transaction?.itemTitle}</h2>
                    <div className="flex items-center gap-4 text-sm mt-1">
                        <span>${transaction?.price}</span>
                        {transaction?.trackingNumber && (
                            <span className="flex items-center gap-1">
                                <Package size={14} /> {transaction.trackingNumber}
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress */}
                <div className="p-4 border-b dark:border-gray-700">
                    <div className="flex items-center gap-1 overflow-x-auto pb-2">
                        {SHIPPING_VERIFICATION_STEPS.map((step, index) => {
                            const current = getCurrentStepIndex();
                            const isComplete = index < current;
                            const isCurrent = index === current;
                            
                            return (
                                <React.Fragment key={step.key}>
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                            isComplete ? 'bg-green-500 text-white' 
                                            : isCurrent ? 'bg-blue-500 text-white animate-pulse'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                        }`}>
                                            {isComplete ? <Check size={14} /> : index + 1}
                                        </div>
                                        <span className={`text-[10px] mt-1 whitespace-nowrap ${isCurrent ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < SHIPPING_VERIFICATION_STEPS.length - 1 && (
                                        <div className={`flex-1 h-1 min-w-[16px] rounded ${isComplete ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
                    {/* Parties */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-xl border ${isSeller ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : 'dark:border-gray-700'}`}>
                            <div className="text-xs font-bold text-gray-500 mb-1">Seller {isSeller && '(You)'}</div>
                            <div className="font-bold dark:text-white text-sm">{transaction?.sellerName}</div>
                        </div>
                        <div className={`p-3 rounded-xl border ${isBuyer ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'dark:border-gray-700'}`}>
                            <div className="text-xs font-bold text-gray-500 mb-1">Buyer {isBuyer && '(You)'}</div>
                            <div className="font-bold dark:text-white text-sm">{transaction?.buyerName}</div>
                        </div>
                    </div>

                    {/* Tracking Info */}
                    {transaction?.trackingNumber && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase">Tracking Number</div>
                                    <div className="font-mono font-bold dark:text-white">{transaction.trackingNumber}</div>
                                    {transaction.carrier && (
                                        <div className="text-xs text-gray-500 mt-1">via {transaction.carrier.toUpperCase()}</div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(transaction.trackingNumber)}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                >
                                    <Copy size={18} className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Photo Evidence Sections */}
                    {transaction?.packagingPhotos?.length > 0 && (
                        <PhotoSection title="📦 Packaging Photos" photos={transaction.packagingPhotos} notes={transaction.packagingNotes} />
                    )}
                    {transaction?.dropoffPhotos?.length > 0 && (
                        <PhotoSection title="🚚 Dropoff Photos" photos={transaction.dropoffPhotos} notes={transaction.dropoffNotes} />
                    )}
                    {transaction?.pickupPhotos?.length > 0 && (
                        <PhotoSection title="📬 Pickup Photos" photos={transaction.pickupPhotos} notes={transaction.pickupNotes} />
                    )}
                    {transaction?.unboxingPhotos?.length > 0 && (
                        <PhotoSection title="📦 Unboxing Photos" photos={transaction.unboxingPhotos} notes={transaction.unboxingNotes} />
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                        {/* Seller: Package photos */}
                        {isSeller && transaction?.status === SHIPPING_VERIFICATION_STATUS.PENDING_SHIPMENT && (
                            <button
                                onClick={() => setPhotoMode('packaging')}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                <Camera size={20} /> Document Packaging
                            </button>
                        )}

                        {/* Seller: Dropoff photos */}
                        {isSeller && transaction?.status === SHIPPING_VERIFICATION_STATUS.SELLER_PACKAGING_PHOTOS && (
                            <button
                                onClick={() => setPhotoMode('dropoff')}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                <Truck size={20} /> Document Carrier Dropoff
                            </button>
                        )}

                        {/* Buyer: Pickup photos */}
                        {isBuyer && (transaction?.status === SHIPPING_VERIFICATION_STATUS.IN_TRANSIT || 
                                     transaction?.status === SHIPPING_VERIFICATION_STATUS.DELIVERED) && (
                            <button
                                onClick={() => setPhotoMode('pickup')}
                                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                <Package size={20} /> Document Package Received
                            </button>
                        )}

                        {/* Buyer: Unboxing photos */}
                        {isBuyer && transaction?.status === SHIPPING_VERIFICATION_STATUS.BUYER_PICKUP_PHOTOS && (
                            <button
                                onClick={() => setPhotoMode('unboxing')}
                                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                <Scissors size={20} /> Open & Verify Contents
                            </button>
                        )}

                        {/* Completed */}
                        {transaction?.status === SHIPPING_VERIFICATION_STATUS.COMPLETED && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl text-center">
                                <CheckCircle className="text-green-500 mx-auto mb-2" size={48} />
                                <h4 className="font-bold text-green-700 dark:text-green-300">Transaction Complete!</h4>
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    All verification photos have been documented.
                                </p>
                            </div>
                        )}

                        {/* Disputed */}
                        {transaction?.status === SHIPPING_VERIFICATION_STATUS.DISPUTED && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl text-center">
                                <AlertTriangle className="text-red-500 mx-auto mb-2" size={48} />
                                <h4 className="font-bold text-red-700 dark:text-red-300">Dispute Raised</h4>
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {transaction?.disputeReason || 'Issue with item'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <button
                        onClick={() => onMessage?.(isSeller ? transaction.buyerId : transaction.sellerId)}
                        className="w-full border-2 border-gray-300 dark:border-gray-600 py-2 rounded-xl font-bold flex items-center justify-center gap-2 dark:text-white"
                    >
                        Message {isSeller ? 'Buyer' : 'Seller'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Photo section helper component
function PhotoSection({ title, photos, notes }) {
    const [expanded, setExpanded] = useState(false);
    
    return (
        <div className="border dark:border-gray-700 rounded-xl overflow-hidden">
            <button 
                onClick={() => setExpanded(!expanded)}
                className="w-full p-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
                <span className="font-bold text-sm dark:text-white">{title}</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{photos.length} photos</span>
                    <ChevronRight className={`text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} size={16} />
                </div>
            </button>
            {expanded && (
                <div className="p-3 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                        {photos.map((photo, idx) => (
                            <img key={idx} src={photo.url} className="w-full aspect-square object-cover rounded-lg" />
                        ))}
                    </div>
                    {notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{notes}"</p>
                    )}
                </div>
            )}
        </div>
    );
}
