// src/components/marketplace/PhotoVerification.jsx
import React, { useState, useRef, useCallback } from 'react';
import { 
    Camera, Upload, Check, X, AlertTriangle, RotateCcw, 
    ZoomIn, ChevronLeft, ChevronRight, Maximize2, Image as ImageIcon,
    CheckCircle, XCircle, HelpCircle
} from 'lucide-react';
import { useMediaUpload } from '../../hooks/useMediaUpload';

/**
 * PhotoVerification Component
 * Used for seller pre-departure photos and buyer inspection photos
 * Supports side-by-side comparison with original listing photos
 */
export default function PhotoVerification({
    mode = 'capture', // 'capture' | 'compare' | 'review'
    role = 'seller', // 'seller' | 'buyer'
    listingPhotos = [],
    sellerDeparturePhotos = [],
    itemDescription = '',
    onPhotosSubmitted,
    onVerificationComplete,
    requiredPhotoCount = 3,
    userId
}) {
    const [photos, setPhotos] = useState([]);
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const [comparisonMode, setComparisonMode] = useState(false);
    const [comparisonIndex, setComparisonIndex] = useState(0);
    const [verificationResult, setVerificationResult] = useState(null); // null | 'match' | 'mismatch' | 'unsure'
    const [notes, setNotes] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const { uploadMedia, uploading } = useMediaUpload();

    // Start camera stream
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment', // Prefer rear camera
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setShowCamera(true);
            }
        } catch (error) {
            console.error('Failed to access camera:', error);
            alert('Unable to access camera. Please check permissions.');
        }
    }, []);

    // Stop camera stream
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
    }, []);

    // Capture photo from camera
    const capturePhoto = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        // Convert to blob
        canvas.toBlob(async (blob) => {
            if (!blob) return;

            // Upload immediately
            try {
                const file = new File([blob], `verification_${Date.now()}.jpg`, { type: 'image/jpeg' });
                const result = await uploadMedia(file, `safe_exchange/${userId}/verification`);
                
                if (result?.url) {
                    setPhotos(prev => [...prev, {
                        url: result.url,
                        timestamp: Date.now(),
                        type: role === 'seller' ? 'departure' : 'inspection'
                    }]);
                }
            } catch (error) {
                console.error('Failed to upload photo:', error);
            }
        }, 'image/jpeg', 0.9);
    }, [uploadMedia, userId, role]);

    // Handle file upload (alternative to camera)
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const result = await uploadMedia(file, `safe_exchange/${userId}/verification`);
            if (result?.url) {
                setPhotos(prev => [...prev, {
                    url: result.url,
                    timestamp: Date.now(),
                    type: role === 'seller' ? 'departure' : 'inspection'
                }]);
            }
        } catch (error) {
            console.error('Failed to upload photo:', error);
        }
    };

    // Remove a photo
    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        if (activePhotoIndex >= photos.length - 1) {
            setActivePhotoIndex(Math.max(0, photos.length - 2));
        }
    };

    // Submit photos
    const handleSubmitPhotos = async () => {
        if (photos.length < requiredPhotoCount) {
            alert(`Please capture at least ${requiredPhotoCount} photos.`);
            return;
        }

        setIsSubmitting(true);
        try {
            await onPhotosSubmitted?.(photos, notes);
        } finally {
            setIsSubmitting(false);
            stopCamera();
        }
    };

    // Submit verification result (buyer only)
    const handleVerificationSubmit = async (result) => {
        setVerificationResult(result);
        setIsSubmitting(true);
        
        try {
            await onVerificationComplete?.({
                result,
                notes,
                buyerPhotos: photos,
                timestamp: Date.now()
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render photo capture interface
    const renderCaptureMode = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-xl text-white">
                <h3 className="text-xl font-bold mb-2">
                    {role === 'seller' ? '📦 Pre-Departure Photos' : '🔍 Inspection Photos'}
                </h3>
                <p className="text-sm opacity-90">
                    {role === 'seller' 
                        ? 'Take clear photos of the item before leaving for the exchange. These will be shown to the buyer for verification.'
                        : 'Take photos of the item as received. Compare with seller\'s photos to verify condition.'}
                </p>
            </div>

            {/* Camera / Preview Area */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                {showCamera ? (
                    <>
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        
                        {/* Camera controls overlay */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                            <button 
                                onClick={stopCamera}
                                className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition"
                            >
                                <X className="text-white" size={24} />
                            </button>
                            <button 
                                onClick={capturePhoto}
                                disabled={uploading}
                                className="p-5 bg-white rounded-full shadow-lg hover:scale-110 transition disabled:opacity-50"
                            >
                                <Camera className={uploading ? 'animate-pulse text-orange-500' : 'text-gray-900'} size={32} />
                            </button>
                            <button className="p-3 bg-white/20 rounded-full opacity-0 pointer-events-none">
                                <X size={24} />
                            </button>
                        </div>
                    </>
                ) : photos.length > 0 ? (
                    <>
                        <img 
                            src={photos[activePhotoIndex]?.url} 
                            alt={`Photo ${activePhotoIndex + 1}`}
                            className="w-full h-full object-contain"
                        />
                        
                        {/* Navigation arrows */}
                        {photos.length > 1 && (
                            <>
                                <button 
                                    onClick={() => setActivePhotoIndex(Math.max(0, activePhotoIndex - 1))}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70"
                                    disabled={activePhotoIndex === 0}
                                >
                                    <ChevronLeft className="text-white" />
                                </button>
                                <button 
                                    onClick={() => setActivePhotoIndex(Math.min(photos.length - 1, activePhotoIndex + 1))}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70"
                                    disabled={activePhotoIndex === photos.length - 1}
                                >
                                    <ChevronRight className="text-white" />
                                </button>
                            </>
                        )}

                        {/* Photo counter */}
                        <div className="absolute top-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                            {activePhotoIndex + 1} / {photos.length}
                        </div>

                        {/* Remove button */}
                        <button 
                            onClick={() => removePhoto(activePhotoIndex)}
                            className="absolute top-4 left-4 p-2 bg-red-600 rounded-full hover:bg-red-700"
                        >
                            <X className="text-white" size={16} />
                        </button>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <Camera size={64} className="mb-4 opacity-30" />
                        <p>No photos captured yet</p>
                    </div>
                )}
            </div>

            {/* Thumbnail strip */}
            {photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {photos.map((photo, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActivePhotoIndex(idx)}
                            className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                                idx === activePhotoIndex 
                                    ? 'border-orange-500 ring-2 ring-orange-500/30' 
                                    : 'border-transparent hover:border-gray-400'
                            }`}
                        >
                            <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                    
                    {/* Add more button */}
                    {photos.length < 10 && (
                        <button
                            onClick={startCamera}
                            className="shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
                        >
                            <Camera className="text-gray-400" size={20} />
                        </button>
                    )}
                </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
                {!showCamera && (
                    <>
                        <button
                            onClick={startCamera}
                            className="flex-1 bg-gray-900 dark:bg-white dark:text-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition"
                        >
                            <Camera size={20} /> Open Camera
                        </button>
                        
                        <label className="flex-1 bg-gray-100 dark:bg-gray-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            <Upload size={20} /> Upload Photo
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                    </>
                )}
            </div>

            {/* Notes field */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                    Additional Notes (Optional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={role === 'seller' 
                        ? 'Any notes about current condition...'
                        : 'Note any concerns or observations...'}
                    className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none"
                    rows={3}
                />
            </div>

            {/* Progress indicator */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold dark:text-white">
                        Photos: {photos.length} / {requiredPhotoCount} required
                    </span>
                    {photos.length >= requiredPhotoCount && (
                        <CheckCircle className="text-green-500" size={20} />
                    )}
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, (photos.length / requiredPhotoCount) * 100)}%` }}
                    />
                </div>
            </div>

            {/* Submit button */}
            <button
                onClick={handleSubmitPhotos}
                disabled={photos.length < requiredPhotoCount || isSubmitting}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition shadow-lg"
            >
                {isSubmitting ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>
                        <Check size={20} /> Submit Photos
                    </>
                )}
            </button>
        </div>
    );

    // Render comparison mode (for buyer to compare with seller photos)
    const renderCompareMode = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl text-white">
                <h3 className="text-xl font-bold mb-2">🔍 Verify Item Condition</h3>
                <p className="text-sm opacity-90">
                    Compare the seller's pre-departure photos with the item in front of you. 
                    Does it match the listing description?
                </p>
            </div>

            {/* Side-by-side comparison */}
            <div className="grid grid-cols-2 gap-4">
                {/* Seller's photo */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                        Seller's Photo ({comparisonIndex + 1}/{sellerDeparturePhotos.length})
                    </label>
                    <div className="relative bg-black rounded-xl overflow-hidden aspect-square">
                        {sellerDeparturePhotos[comparisonIndex] ? (
                            <img 
                                src={sellerDeparturePhotos[comparisonIndex].url}
                                alt="Seller's photo"
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No photo available
                            </div>
                        )}
                    </div>
                </div>

                {/* Listing photo for reference */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                        Original Listing ({comparisonIndex + 1}/{listingPhotos.length})
                    </label>
                    <div className="relative bg-black rounded-xl overflow-hidden aspect-square">
                        {listingPhotos[comparisonIndex] ? (
                            <img 
                                src={listingPhotos[comparisonIndex]}
                                alt="Listing photo"
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No photo available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Comparison navigation */}
            <div className="flex justify-center gap-2">
                {Array.from({ length: Math.max(sellerDeparturePhotos.length, listingPhotos.length) }).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setComparisonIndex(idx)}
                        className={`w-3 h-3 rounded-full transition ${
                            idx === comparisonIndex 
                                ? 'bg-blue-600' 
                                : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                    />
                ))}
            </div>

            {/* Item description reference */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                <h4 className="font-bold text-sm dark:text-white mb-2">📋 Listing Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {itemDescription || 'No description provided'}
                </p>
            </div>

            {/* Verification buttons */}
            <div className="space-y-3">
                <p className="text-sm font-bold dark:text-white text-center">
                    Does the item match the photos and description?
                </p>
                
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => handleVerificationSubmit('match')}
                        disabled={isSubmitting}
                        className="p-4 bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-xl flex flex-col items-center gap-2 hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                    >
                        <CheckCircle className="text-green-600" size={32} />
                        <span className="font-bold text-green-700 dark:text-green-400">Yes, Matches</span>
                    </button>
                    
                    <button
                        onClick={() => handleVerificationSubmit('unsure')}
                        disabled={isSubmitting}
                        className="p-4 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500 rounded-xl flex flex-col items-center gap-2 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition"
                    >
                        <HelpCircle className="text-yellow-600" size={32} />
                        <span className="font-bold text-yellow-700 dark:text-yellow-400">Unsure</span>
                    </button>
                    
                    <button
                        onClick={() => handleVerificationSubmit('mismatch')}
                        disabled={isSubmitting}
                        className="p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-xl flex flex-col items-center gap-2 hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                    >
                        <XCircle className="text-red-600" size={32} />
                        <span className="font-bold text-red-700 dark:text-red-400">No, Different</span>
                    </button>
                </div>
            </div>

            {/* Notes for concerns */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                    Describe Any Concerns
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Note any differences, damage, or concerns..."
                    className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none"
                    rows={3}
                />
            </div>
        </div>
    );

    // Main render
    return (
        <div className="max-w-2xl mx-auto">
            {mode === 'capture' && renderCaptureMode()}
            {mode === 'compare' && renderCompareMode()}
        </div>
    );
}
