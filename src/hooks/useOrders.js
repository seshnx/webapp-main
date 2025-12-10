import { useState, useEffect, useCallback } from 'react';
import { collection, doc, addDoc, updateDoc, onSnapshot, query, where, orderBy, serverTimestamp, writeBatch, getDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import toast from 'react-hot-toast';

const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    PAID: 'paid',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
    DISPUTED: 'disputed',
    // For physical goods (Gear Exchange)
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    // For escrow
    ESCROW_HELD: 'escrow_held',
    ESCROW_RELEASED: 'escrow_released'
};

/**
 * Hook for managing user orders
 */
export function useOrders(userId, role = 'buyer') {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const getOrdersPath = () => `artifacts/${appId}/orders`;

    // Fetch orders
    useEffect(() => {
        if (!userId) {
            setOrders([]);
            setLoading(false);
            return;
        }

        const ordersRef = collection(db, getOrdersPath());
        const fieldToQuery = role === 'seller' ? 'sellerId' : 'buyerId';
        const q = query(
            ordersRef,
            where(fieldToQuery, '==', userId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
            }));
            setOrders(ordersList);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching orders:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, role]);

    // Create a new order
    const createOrder = useCallback(async ({
        buyerId,
        buyerName,
        buyerEmail,
        sellerId,
        sellerName,
        items,
        subtotal,
        fees,
        total,
        paymentMethod,
        shippingAddress,
        orderType = 'digital', // 'digital' or 'physical'
        useEscrow = false
    }) => {
        try {
            const orderRef = await addDoc(collection(db, getOrdersPath()), {
                // Order parties
                buyerId,
                buyerName,
                buyerEmail,
                sellerId,
                sellerName,
                
                // Order details
                items,
                itemCount: items.length,
                subtotal,
                fees: fees || 0,
                total,
                
                // Payment
                paymentMethod,
                paymentStatus: 'pending',
                
                // Shipping (for physical goods)
                shippingAddress: shippingAddress || null,
                trackingNumber: null,
                shippingCarrier: null,
                
                // Order type and status
                orderType,
                status: useEscrow ? ORDER_STATUS.ESCROW_HELD : ORDER_STATUS.PENDING,
                useEscrow,
                escrowReleased: false,
                
                // Timestamps
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                completedAt: null,
                
                // For reviews
                buyerReviewed: false,
                sellerReviewed: false
            });

            return { success: true, orderId: orderRef.id };
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Failed to create order');
            return { success: false, error };
        }
    }, []);

    // Update order status
    const updateOrderStatus = useCallback(async (orderId, newStatus, additionalData = {}) => {
        try {
            const orderRef = doc(db, getOrdersPath(), orderId);
            
            const updateData = {
                status: newStatus,
                updatedAt: serverTimestamp(),
                ...additionalData
            };

            // Set completion timestamp if order is completed
            if (newStatus === ORDER_STATUS.COMPLETED || newStatus === ORDER_STATUS.DELIVERED) {
                updateData.completedAt = serverTimestamp();
            }

            await updateDoc(orderRef, updateData);
            toast.success(`Order status updated to ${newStatus}`);
            return true;
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
            return false;
        }
    }, []);

    // Add tracking information (for physical goods)
    const addTracking = useCallback(async (orderId, trackingNumber, carrier) => {
        try {
            const orderRef = doc(db, getOrdersPath(), orderId);
            await updateDoc(orderRef, {
                trackingNumber,
                shippingCarrier: carrier,
                status: ORDER_STATUS.SHIPPED,
                shippedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            toast.success('Tracking information added');
            return true;
        } catch (error) {
            console.error('Error adding tracking:', error);
            toast.error('Failed to add tracking');
            return false;
        }
    }, []);

    // Mark order as delivered
    const markDelivered = useCallback(async (orderId) => {
        return updateOrderStatus(orderId, ORDER_STATUS.DELIVERED, {
            deliveredAt: serverTimestamp()
        });
    }, [updateOrderStatus]);

    // Release escrow funds
    const releaseEscrow = useCallback(async (orderId) => {
        try {
            const orderRef = doc(db, getOrdersPath(), orderId);
            const orderDoc = await getDoc(orderRef);
            
            if (!orderDoc.exists()) {
                toast.error('Order not found');
                return false;
            }

            const orderData = orderDoc.data();
            if (!orderData.useEscrow) {
                toast.error('This order does not use escrow');
                return false;
            }

            if (orderData.escrowReleased) {
                toast.error('Escrow already released');
                return false;
            }

            await updateDoc(orderRef, {
                status: ORDER_STATUS.ESCROW_RELEASED,
                escrowReleased: true,
                escrowReleasedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // TODO: In production, trigger actual payment transfer to seller
            toast.success('Escrow funds released to seller');
            return true;
        } catch (error) {
            console.error('Error releasing escrow:', error);
            toast.error('Failed to release escrow');
            return false;
        }
    }, []);

    // Request refund / dispute
    const disputeOrder = useCallback(async (orderId, reason) => {
        try {
            const orderRef = doc(db, getOrdersPath(), orderId);
            await updateDoc(orderRef, {
                status: ORDER_STATUS.DISPUTED,
                disputeReason: reason,
                disputedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            toast.success('Dispute submitted. Our team will review your case.');
            return true;
        } catch (error) {
            console.error('Error disputing order:', error);
            toast.error('Failed to submit dispute');
            return false;
        }
    }, []);

    // Cancel order
    const cancelOrder = useCallback(async (orderId, reason) => {
        try {
            const orderRef = doc(db, getOrdersPath(), orderId);
            const orderDoc = await getDoc(orderRef);
            
            if (!orderDoc.exists()) {
                toast.error('Order not found');
                return false;
            }

            const orderData = orderDoc.data();
            
            // Only allow cancellation if order is pending or processing
            if (![ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING, ORDER_STATUS.ESCROW_HELD].includes(orderData.status)) {
                toast.error('This order cannot be cancelled');
                return false;
            }

            await updateDoc(orderRef, {
                status: ORDER_STATUS.CANCELLED,
                cancellationReason: reason,
                cancelledAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // If escrow was used, mark for refund
            if (orderData.useEscrow && !orderData.escrowReleased) {
                // TODO: Trigger refund process
            }

            toast.success('Order cancelled');
            return true;
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Failed to cancel order');
            return false;
        }
    }, []);

    // Get order by ID
    const getOrder = useCallback(async (orderId) => {
        try {
            const orderRef = doc(db, getOrdersPath(), orderId);
            const orderDoc = await getDoc(orderRef);
            
            if (!orderDoc.exists()) {
                return null;
            }

            return {
                id: orderDoc.id,
                ...orderDoc.data(),
                createdAt: orderDoc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: orderDoc.data().updatedAt?.toDate?.() || new Date()
            };
        } catch (error) {
            console.error('Error getting order:', error);
            return null;
        }
    }, []);

    // Filter orders by status
    const getOrdersByStatus = useCallback((status) => {
        return orders.filter(order => order.status === status);
    }, [orders]);

    // Get order stats
    const orderStats = {
        total: orders.length,
        pending: orders.filter(o => o.status === ORDER_STATUS.PENDING).length,
        processing: orders.filter(o => o.status === ORDER_STATUS.PROCESSING).length,
        completed: orders.filter(o => [ORDER_STATUS.COMPLETED, ORDER_STATUS.DELIVERED].includes(o.status)).length,
        disputed: orders.filter(o => o.status === ORDER_STATUS.DISPUTED).length
    };

    return {
        orders,
        loading,
        orderStats,
        ORDER_STATUS,
        createOrder,
        updateOrderStatus,
        addTracking,
        markDelivered,
        releaseEscrow,
        disputeOrder,
        cancelOrder,
        getOrder,
        getOrdersByStatus
    };
}

export default useOrders;
