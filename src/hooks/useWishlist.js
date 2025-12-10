import { useState, useEffect, useCallback } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import toast from 'react-hot-toast';

/**
 * Hook for managing user's wishlist
 * Supports both Gear Exchange and SeshFx Store items
 */
export function useWishlist(userId) {
    const [wishlist, setWishlist] = useState([]);
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    // Collection path for wishlist
    const getWishlistPath = () => `artifacts/${appId}/users/${userId}/wishlist`;

    // Fetch wishlist items
    useEffect(() => {
        if (!userId) {
            setWishlist([]);
            setWishlistIds(new Set());
            setLoading(false);
            return;
        }

        const wishlistRef = collection(db, getWishlistPath());
        const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setWishlist(items);
            setWishlistIds(new Set(items.map(item => item.itemId)));
            setLoading(false);
        }, (error) => {
            console.error('Error fetching wishlist:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    // Check if item is in wishlist
    const isInWishlist = useCallback((itemId) => {
        return wishlistIds.has(itemId);
    }, [wishlistIds]);

    // Add item to wishlist
    const addToWishlist = useCallback(async (item) => {
        if (!userId) {
            toast.error('Please sign in to use wishlist');
            return false;
        }

        try {
            const wishlistItemRef = doc(db, getWishlistPath(), item.id);
            await setDoc(wishlistItemRef, {
                itemId: item.id,
                itemType: item.itemType || 'gear', // 'gear' or 'fx'
                title: item.title,
                brand: item.brand || '',
                price: item.price,
                image: item.images?.[0] || item.coverImage || null,
                sellerId: item.sellerId || item.authorId,
                sellerName: item.sellerName || item.author,
                addedAt: serverTimestamp(),
                // For price alerts
                alertOnPriceDrop: false,
                alertPrice: null
            });
            toast.success('Added to wishlist');
            return true;
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            toast.error('Failed to add to wishlist');
            return false;
        }
    }, [userId]);

    // Remove item from wishlist
    const removeFromWishlist = useCallback(async (itemId) => {
        if (!userId) return false;

        try {
            const wishlistItemRef = doc(db, getWishlistPath(), itemId);
            await deleteDoc(wishlistItemRef);
            toast.success('Removed from wishlist');
            return true;
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove from wishlist');
            return false;
        }
    }, [userId]);

    // Toggle wishlist status
    const toggleWishlist = useCallback(async (item) => {
        if (isInWishlist(item.id)) {
            return removeFromWishlist(item.id);
        } else {
            return addToWishlist(item);
        }
    }, [isInWishlist, addToWishlist, removeFromWishlist]);

    // Set price alert for wishlist item
    const setPriceAlert = useCallback(async (itemId, targetPrice) => {
        if (!userId) return false;

        try {
            const wishlistItemRef = doc(db, getWishlistPath(), itemId);
            await setDoc(wishlistItemRef, {
                alertOnPriceDrop: true,
                alertPrice: targetPrice,
                alertSetAt: serverTimestamp()
            }, { merge: true });
            toast.success(`Price alert set for $${targetPrice}`);
            return true;
        } catch (error) {
            console.error('Error setting price alert:', error);
            toast.error('Failed to set price alert');
            return false;
        }
    }, [userId]);

    // Remove price alert
    const removePriceAlert = useCallback(async (itemId) => {
        if (!userId) return false;

        try {
            const wishlistItemRef = doc(db, getWishlistPath(), itemId);
            await setDoc(wishlistItemRef, {
                alertOnPriceDrop: false,
                alertPrice: null,
                alertSetAt: null
            }, { merge: true });
            toast.success('Price alert removed');
            return true;
        } catch (error) {
            console.error('Error removing price alert:', error);
            return false;
        }
    }, [userId]);

    // Get wishlist items with active price alerts
    const getItemsWithAlerts = useCallback(() => {
        return wishlist.filter(item => item.alertOnPriceDrop && item.alertPrice);
    }, [wishlist]);

    return {
        wishlist,
        wishlistIds,
        loading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        setPriceAlert,
        removePriceAlert,
        getItemsWithAlerts,
        wishlistCount: wishlist.length
    };
}

export default useWishlist;
