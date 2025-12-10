import { useState, useEffect, useCallback } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, getDoc, getDocs, serverTimestamp, increment } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import toast from 'react-hot-toast';

/**
 * Hook for managing seller reviews and ratings
 */
export function useSellerReviews(sellerId) {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });
    const [loading, setLoading] = useState(true);

    const getReviewsPath = () => `artifacts/${appId}/sellerReviews`;
    const getSellerStatsPath = (id) => `artifacts/${appId}/users/${id}/profiles/main`;

    // Fetch reviews for seller
    useEffect(() => {
        if (!sellerId) {
            setReviews([]);
            setLoading(false);
            return;
        }

        const reviewsRef = collection(db, getReviewsPath());
        const q = query(
            reviewsRef,
            where('sellerId', '==', sellerId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));
            setReviews(reviewsList);
            
            // Calculate stats
            if (reviewsList.length > 0) {
                const total = reviewsList.length;
                const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0);
                const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                reviewsList.forEach(r => {
                    if (r.rating >= 1 && r.rating <= 5) {
                        distribution[r.rating]++;
                    }
                });
                
                setStats({
                    averageRating: Math.round((sum / total) * 10) / 10,
                    totalReviews: total,
                    ratingDistribution: distribution
                });
            } else {
                setStats({
                    averageRating: 0,
                    totalReviews: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                });
            }
            
            setLoading(false);
        }, (error) => {
            console.error('Error fetching reviews:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [sellerId]);

    // Submit a review
    const submitReview = useCallback(async ({
        reviewerId,
        reviewerName,
        reviewerPhoto,
        rating,
        title,
        comment,
        orderId,
        itemId,
        itemTitle
    }) => {
        if (!sellerId || !reviewerId) {
            toast.error('Unable to submit review');
            return false;
        }

        if (rating < 1 || rating > 5) {
            toast.error('Please select a rating between 1 and 5');
            return false;
        }

        try {
            // Check if user already reviewed this seller for this order
            const reviewsRef = collection(db, getReviewsPath());
            const existingQuery = query(
                reviewsRef,
                where('sellerId', '==', sellerId),
                where('reviewerId', '==', reviewerId),
                where('orderId', '==', orderId)
            );
            const existingDocs = await getDocs(existingQuery);
            
            if (!existingDocs.empty) {
                toast.error('You have already reviewed this seller for this order');
                return false;
            }

            // Add the review
            await addDoc(reviewsRef, {
                sellerId,
                reviewerId,
                reviewerName,
                reviewerPhoto: reviewerPhoto || null,
                rating,
                title: title || '',
                comment: comment || '',
                orderId: orderId || null,
                itemId: itemId || null,
                itemTitle: itemTitle || '',
                createdAt: serverTimestamp(),
                helpful: 0,
                reported: false
            });

            // Update seller's average rating in their profile
            await updateSellerRating(sellerId);

            toast.success('Review submitted successfully!');
            return true;
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review');
            return false;
        }
    }, [sellerId]);

    // Update seller's rating in their profile
    const updateSellerRating = async (sellerId) => {
        try {
            const reviewsRef = collection(db, getReviewsPath());
            const q = query(reviewsRef, where('sellerId', '==', sellerId));
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) return;

            const total = snapshot.size;
            const sum = snapshot.docs.reduce((acc, doc) => acc + doc.data().rating, 0);
            const average = Math.round((sum / total) * 10) / 10;

            const sellerRef = doc(db, getSellerStatsPath(sellerId));
            await updateDoc(sellerRef, {
                sellerRating: average,
                sellerReviewCount: total
            });
        } catch (error) {
            console.error('Error updating seller rating:', error);
        }
    };

    // Mark review as helpful
    const markHelpful = useCallback(async (reviewId) => {
        try {
            const reviewRef = doc(db, getReviewsPath(), reviewId);
            await updateDoc(reviewRef, {
                helpful: increment(1)
            });
        } catch (error) {
            console.error('Error marking helpful:', error);
        }
    }, []);

    // Report a review
    const reportReview = useCallback(async (reviewId, reason) => {
        try {
            const reviewRef = doc(db, getReviewsPath(), reviewId);
            await updateDoc(reviewRef, {
                reported: true,
                reportReason: reason,
                reportedAt: serverTimestamp()
            });
            toast.success('Review reported. Our team will review it.');
            return true;
        } catch (error) {
            console.error('Error reporting review:', error);
            toast.error('Failed to report review');
            return false;
        }
    }, []);

    // Delete own review
    const deleteReview = useCallback(async (reviewId, reviewerId) => {
        try {
            const reviewRef = doc(db, getReviewsPath(), reviewId);
            const reviewDoc = await getDoc(reviewRef);
            
            if (!reviewDoc.exists() || reviewDoc.data().reviewerId !== reviewerId) {
                toast.error('You can only delete your own reviews');
                return false;
            }

            await deleteDoc(reviewRef);
            await updateSellerRating(sellerId);
            toast.success('Review deleted');
            return true;
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
            return false;
        }
    }, [sellerId]);

    return {
        reviews,
        stats,
        loading,
        submitReview,
        markHelpful,
        reportReview,
        deleteReview
    };
}

/**
 * Hook to get seller rating summary (for display on listings)
 */
export function useSellerRating(sellerId) {
    const [rating, setRating] = useState(null);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!sellerId) {
            setLoading(false);
            return;
        }

        const sellerRef = doc(db, `artifacts/${appId}/users/${sellerId}/profiles/main`);
        const unsubscribe = onSnapshot(sellerRef, (doc) => {
            if (doc.exists()) {
                setRating(doc.data().sellerRating || null);
                setReviewCount(doc.data().sellerReviewCount || 0);
            }
            setLoading(false);
        }, () => {
            setLoading(false);
        });

        return () => unsubscribe();
    }, [sellerId]);

    return { rating, reviewCount, loading };
}

export default useSellerReviews;
