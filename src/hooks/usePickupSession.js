import { useState, useEffect, useCallback } from 'react';
import { doc, collection, addDoc, updateDoc, onSnapshot, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import toast from 'react-hot-toast';

// High-value threshold requiring local pickup
export const HIGH_VALUE_THRESHOLD = 500;

// Pickup session status flow
export const PICKUP_STATUS = {
    // Initial states
    PENDING_DEPOSIT: 'pending_deposit',
    DEPOSIT_RECEIVED: 'deposit_received',
    
    // Scheduling
    PICKUP_SCHEDULED: 'pickup_scheduled',
    
    // Day of pickup - Seller verification
    SELLER_VERIFICATION_PENDING: 'seller_verification_pending',
    SELLER_VERIFIED: 'seller_verified',
    
    // Buyer verification at pickup
    BUYER_VERIFICATION_PENDING: 'buyer_verification_pending',
    BUYER_VERIFIED: 'buyer_verified',
    
    // Mutual approval
    AWAITING_SELLER_APPROVAL: 'awaiting_seller_approval',
    AWAITING_BUYER_APPROVAL: 'awaiting_buyer_approval',
    
    // Completion
    MUTUALLY_APPROVED: 'mutually_approved',
    COMPLETED: 'completed',
    
    // Issues
    DISPUTED: 'disputed',
    CANCELLED: 'cancelled'
};

/**
 * Hook for managing pickup sessions for high-value items
 */
export function usePickupSession(sessionId) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const getSessionPath = (id) => `artifacts/${appId}/pickupSessions/${id}`;

    // Listen to session updates
    useEffect(() => {
        if (!sessionId) {
            setSession(null);
            setLoading(false);
            return;
        }

        const sessionRef = doc(db, getSessionPath(sessionId));
        const unsubscribe = onSnapshot(sessionRef, (snapshot) => {
            if (snapshot.exists()) {
                setSession({
                    id: snapshot.id,
                    ...snapshot.data(),
                    createdAt: snapshot.data().createdAt?.toDate?.() || new Date(),
                    scheduledDate: snapshot.data().scheduledDate?.toDate?.() || null,
                    updatedAt: snapshot.data().updatedAt?.toDate?.() || new Date()
                });
            } else {
                setSession(null);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching pickup session:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [sessionId]);

    return { session, loading };
}

/**
 * Hook for creating and managing pickup sessions
 */
export function usePickupSessionManager(userId) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const getSessionsPath = () => `artifacts/${appId}/pickupSessions`;

    // Create a new pickup session when buyer initiates high-value purchase
    const createPickupSession = useCallback(async ({
        orderId,
        itemId,
        itemTitle,
        itemPrice,
        itemImages,
        sellerId,
        sellerName,
        sellerPhoto,
        buyerId,
        buyerName,
        buyerPhoto,
        pickupLocation
    }) => {
        try {
            const sessionRef = await addDoc(collection(db, getSessionsPath()), {
                // Order reference
                orderId,
                itemId,
                itemTitle,
                itemPrice,
                itemImages: itemImages || [],
                
                // Parties
                sellerId,
                sellerName,
                sellerPhoto: sellerPhoto || null,
                buyerId,
                buyerName,
                buyerPhoto: buyerPhoto || null,
                
                // Pickup details
                pickupLocation,
                scheduledDate: null,
                
                // Deposit
                depositAmount: itemPrice, // Full deposit
                depositPaid: false,
                depositPaidAt: null,
                
                // Status
                status: PICKUP_STATUS.PENDING_DEPOSIT,
                
                // Seller verification (day of pickup)
                sellerVerification: {
                    completed: false,
                    photos: [],
                    notes: '',
                    timestamp: null
                },
                
                // Buyer verification (at pickup)
                buyerVerification: {
                    completed: false,
                    photos: [],
                    notes: '',
                    timestamp: null
                },
                
                // Approvals
                sellerApproved: false,
                sellerApprovedAt: null,
                buyerApproved: false,
                buyerApprovedAt: null,
                
                // Completion
                completedAt: null,
                fundsReleasedAt: null,
                
                // Dispute
                disputed: false,
                disputeReason: null,
                disputedAt: null,
                
                // Timestamps
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            toast.success('Pickup session created');
            return { success: true, sessionId: sessionRef.id };
        } catch (error) {
            console.error('Error creating pickup session:', error);
            toast.error('Failed to create pickup session');
            return { success: false, error };
        }
    }, []);

    // Record deposit payment
    const recordDeposit = useCallback(async (sessionId) => {
        try {
            const sessionRef = doc(db, getSessionsPath(), sessionId);
            await updateDoc(sessionRef, {
                depositPaid: true,
                depositPaidAt: serverTimestamp(),
                status: PICKUP_STATUS.DEPOSIT_RECEIVED,
                updatedAt: serverTimestamp()
            });
            toast.success('Deposit recorded');
            return true;
        } catch (error) {
            console.error('Error recording deposit:', error);
            toast.error('Failed to record deposit');
            return false;
        }
    }, []);

    // Schedule pickup date and time
    const schedulePickup = useCallback(async (sessionId, scheduledDate, location) => {
        try {
            const sessionRef = doc(db, getSessionsPath(), sessionId);
            await updateDoc(sessionRef, {
                scheduledDate,
                pickupLocation: location,
                status: PICKUP_STATUS.PICKUP_SCHEDULED,
                updatedAt: serverTimestamp()
            });
            toast.success('Pickup scheduled');
            return true;
        } catch (error) {
            console.error('Error scheduling pickup:', error);
            toast.error('Failed to schedule pickup');
            return false;
        }
    }, []);

    // Seller submits verification photos (day of pickup)
    const submitSellerVerification = useCallback(async (sessionId, photos, notes = '') => {
        if (!photos || photos.length < 3) {
            toast.error('Please upload at least 3 condition photos');
            return false;
        }

        try {
            const sessionRef = doc(db, getSessionsPath(), sessionId);
            await updateDoc(sessionRef, {
                sellerVerification: {
                    completed: true,
                    photos,
                    notes,
                    timestamp: serverTimestamp()
                },
                status: PICKUP_STATUS.SELLER_VERIFIED,
                updatedAt: serverTimestamp()
            });
            toast.success('Seller verification submitted');
            return true;
        } catch (error) {
            console.error('Error submitting seller verification:', error);
            toast.error('Failed to submit verification');
            return false;
        }
    }, []);

    // Buyer initiates pickup and submits verification photos
    const submitBuyerVerification = useCallback(async (sessionId, photos, notes = '') => {
        if (!photos || photos.length < 2) {
            toast.error('Please upload at least 2 verification photos');
            return false;
        }

        try {
            const sessionRef = doc(db, getSessionsPath(), sessionId);
            await updateDoc(sessionRef, {
                buyerVerification: {
                    completed: true,
                    photos,
                    notes,
                    timestamp: serverTimestamp()
                },
                status: PICKUP_STATUS.BUYER_VERIFIED,
                updatedAt: serverTimestamp()
            });
            toast.success('Buyer verification submitted');
            return true;
        } catch (error) {
            console.error('Error submitting buyer verification:', error);
            toast.error('Failed to submit verification');
            return false;
        }
    }, []);

    // Seller approves the handover
    const sellerApprove = useCallback(async (sessionId) => {
        try {
            const sessionRef = doc(db, getSessionsPath(), sessionId);
            const sessionDoc = await getDoc(sessionRef);
            
            if (!sessionDoc.exists()) {
                toast.error('Session not found');
                return false;
            }

            const sessionData = sessionDoc.data();
            const buyerAlreadyApproved = sessionData.buyerApproved;

            await updateDoc(sessionRef, {
                sellerApproved: true,
                sellerApprovedAt: serverTimestamp(),
                status: buyerAlreadyApproved 
                    ? PICKUP_STATUS.MUTUALLY_APPROVED 
                    : PICKUP_STATUS.AWAITING_BUYER_APPROVAL,
                updatedAt: serverTimestamp()
            });

            if (buyerAlreadyApproved) {
                // Both approved - complete the transaction
                await completePickup(sessionId);
            }

            toast.success('Seller approval recorded');
            return true;
        } catch (error) {
            console.error('Error recording seller approval:', error);
            toast.error('Failed to record approval');
            return false;
        }
    }, []);

    // Buyer approves the handover
    const buyerApprove = useCallback(async (sessionId) => {
        try {
            const sessionRef = doc(db, getSessionsPath(), sessionId);
            const sessionDoc = await getDoc(sessionRef);
            
            if (!sessionDoc.exists()) {
                toast.error('Session not found');
                return false;
            }

            const sessionData = sessionDoc.data();
            const sellerAlreadyApproved = sessionData.sellerApproved;

            await updateDoc(sessionRef, {
                buyerApproved: true,
                buyerApprovedAt: serverTimestamp(),
                status: sellerAlreadyApproved 
                    ? PICKUP_STATUS.MUTUALLY_APPROVED 
                    : PICKUP_STATUS.AWAITING_SELLER_APPROVAL,
                updatedAt: serverTimestamp()
            });

            if (sellerAlreadyApproved) {
                // Both approved - complete the transaction
                await completePickup(sessionId);
            }

            toast.success('Buyer approval recorded');
            return true;
        } catch (error) {
            console.error('Error recording buyer approval:', error);
            toast.error('Failed to record approval');
            return false;
        }
    }, []);

    // Complete the pickup and release funds
    const completePickup = useCallback(async (sessionId) => {
        try {
            const sessionRef = doc(db, getSessionsPath(), sessionId);
            const sessionDoc = await getDoc(sessionRef);
            
            if (!sessionDoc.exists()) return false;
            
            const sessionData = sessionDoc.data();

            // Update session to completed
            await updateDoc(sessionRef, {
                status: PICKUP_STATUS.COMPLETED,
                completedAt: serverTimestamp(),
                fundsReleasedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Add funds to seller's withdrawal balance
            const sellerWalletRef = doc(db, `artifacts/${appId}/users/${sessionData.sellerId}/wallet/main`);
            const sellerWalletDoc = await getDoc(sellerWalletRef);
            
            if (sellerWalletDoc.exists()) {
                const currentBalance = sellerWalletDoc.data().withdrawableBalance || 0;
                await updateDoc(sellerWalletRef, {
                    withdrawableBalance: currentBalance + sessionData.depositAmount,
                    lastUpdated: serverTimestamp()
                });
            } else {
                // Create wallet document if it doesn't exist
                const { setDoc } = await import('firebase/firestore');
                await setDoc(sellerWalletRef, {
                    withdrawableBalance: sessionData.depositAmount,
                    pendingBalance: 0,
                    totalEarnings: sessionData.depositAmount,
                    lastUpdated: serverTimestamp()
                });
            }

            toast.success('Pickup completed! Funds released to seller.');
            return true;
        } catch (error) {
            console.error('Error completing pickup:', error);
            toast.error('Failed to complete pickup');
            return false;
        }
    }, []);

    // Open a dispute
    const openDispute = useCallback(async (sessionId, reason, userId) => {
        try {
            const sessionRef = doc(db, getSessionsPath(), sessionId);
            await updateDoc(sessionRef, {
                status: PICKUP_STATUS.DISPUTED,
                disputed: true,
                disputeReason: reason,
                disputedBy: userId,
                disputedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            toast.success('Dispute opened. Our team will review this case.');
            return true;
        } catch (error) {
            console.error('Error opening dispute:', error);
            toast.error('Failed to open dispute');
            return false;
        }
    }, []);

    // Cancel pickup session
    const cancelSession = useCallback(async (sessionId, reason, userId) => {
        try {
            const sessionRef = doc(db, getSessionsPath(), sessionId);
            await updateDoc(sessionRef, {
                status: PICKUP_STATUS.CANCELLED,
                cancellationReason: reason,
                cancelledBy: userId,
                cancelledAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            toast.success('Pickup session cancelled');
            return true;
        } catch (error) {
            console.error('Error cancelling session:', error);
            toast.error('Failed to cancel session');
            return false;
        }
    }, []);

    return {
        sessions,
        loading,
        createPickupSession,
        recordDeposit,
        schedulePickup,
        submitSellerVerification,
        submitBuyerVerification,
        sellerApprove,
        buyerApprove,
        completePickup,
        openDispute,
        cancelSession,
        PICKUP_STATUS
    };
}

export default usePickupSession;
