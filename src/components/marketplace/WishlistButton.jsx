import { useState } from 'react';
import { Heart, Bell, BellOff, X, DollarSign } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';

/**
 * Wishlist button with optional price alert functionality
 */
export default function WishlistButton({ 
    item, 
    userId, 
    size = 'default', // 'small', 'default', 'large'
    showLabel = false,
    showPriceAlert = false 
}) {
    const { isInWishlist, toggleWishlist, setPriceAlert, removePriceAlert, wishlist } = useWishlist(userId);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertPrice, setAlertPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const inWishlist = isInWishlist(item.id);
    const wishlistItem = wishlist.find(w => w.itemId === item.id);
    const hasAlert = wishlistItem?.alertOnPriceDrop;

    const sizeClasses = {
        small: 'p-1.5',
        default: 'p-2',
        large: 'p-3'
    };

    const iconSizes = {
        small: 14,
        default: 18,
        large: 24
    };

    const handleToggle = async (e) => {
        e.stopPropagation();
        setLoading(true);
        await toggleWishlist(item);
        setLoading(false);
    };

    const handleSetAlert = async () => {
        if (!alertPrice || isNaN(parseFloat(alertPrice))) return;
        
        setLoading(true);
        await setPriceAlert(item.id, parseFloat(alertPrice));
        setLoading(false);
        setShowAlertModal(false);
    };

    const handleRemoveAlert = async (e) => {
        e.stopPropagation();
        setLoading(true);
        await removePriceAlert(item.id);
        setLoading(false);
    };

    return (
        <>
            <div className="flex items-center gap-1">
                <button
                    onClick={handleToggle}
                    disabled={loading}
                    className={`${sizeClasses[size]} rounded-full transition-all ${
                        inWishlist 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
                    } backdrop-blur-sm ${loading ? 'opacity-50' : ''}`}
                    title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart 
                        size={iconSizes[size]} 
                        fill={inWishlist ? 'currentColor' : 'none'}
                    />
                </button>

                {showLabel && (
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {inWishlist ? 'Saved' : 'Save'}
                    </span>
                )}

                {/* Price Alert Button */}
                {showPriceAlert && inWishlist && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (hasAlert) {
                                handleRemoveAlert(e);
                            } else {
                                setAlertPrice(item.price ? (item.price * 0.9).toFixed(0) : '');
                                setShowAlertModal(true);
                            }
                        }}
                        className={`${sizeClasses[size]} rounded-full transition-all ${
                            hasAlert
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-500'
                        } backdrop-blur-sm`}
                        title={hasAlert ? `Alert set at $${wishlistItem.alertPrice}` : 'Set price alert'}
                    >
                        {hasAlert ? <BellOff size={iconSizes[size]} /> : <Bell size={iconSizes[size]} />}
                    </button>
                )}
            </div>

            {/* Price Alert Modal */}
            {showAlertModal && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div 
                        className="bg-white dark:bg-[#2c2e36] rounded-xl p-6 w-full max-w-sm shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold dark:text-white">Set Price Alert</h3>
                            <button 
                                onClick={() => setShowAlertModal(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Get notified when <strong>{item.title}</strong> drops below your target price.
                            </p>
                            <p className="text-xs text-gray-500 mb-3">
                                Current price: <span className="font-bold text-green-600">${item.price}</span>
                            </p>

                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                Alert me when price drops to
                            </label>
                            <div className="relative">
                                <DollarSign 
                                    size={16} 
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                                />
                                <input
                                    type="number"
                                    value={alertPrice}
                                    onChange={(e) => setAlertPrice(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-lg font-bold"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowAlertModal(false)}
                                className="flex-1 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSetAlert}
                                disabled={loading || !alertPrice}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                            >
                                <Bell size={16} />
                                Set Alert
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
