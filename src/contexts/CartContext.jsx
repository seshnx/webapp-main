import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

/**
 * Cart Provider for SeshFx Store
 * Manages shopping cart state and operations
 */
export function CartProvider({ children, userId }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const getCartPath = () => `artifacts/${appId}/users/${userId}/cart`;

    // Fetch cart items
    useEffect(() => {
        if (!userId) {
            setCartItems([]);
            setLoading(false);
            return;
        }

        const cartRef = collection(db, getCartPath());
        const unsubscribe = onSnapshot(cartRef, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                cartId: doc.id,
                ...doc.data()
            }));
            setCartItems(items);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching cart:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    // Add item to cart
    const addToCart = useCallback(async (item, quantity = 1) => {
        if (!userId) {
            toast.error('Please sign in to add items to cart');
            return false;
        }

        try {
            // Check if item already in cart
            const existingItem = cartItems.find(ci => ci.itemId === item.id);
            
            if (existingItem) {
                // Update quantity
                const cartItemRef = doc(db, getCartPath(), existingItem.cartId);
                await setDoc(cartItemRef, {
                    quantity: existingItem.quantity + quantity
                }, { merge: true });
                toast.success('Updated cart quantity');
            } else {
                // Add new item
                const cartItemRef = doc(collection(db, getCartPath()));
                await setDoc(cartItemRef, {
                    itemId: item.id,
                    title: item.title,
                    type: item.type || 'digital',
                    price: item.price,
                    quantity,
                    image: item.coverImage || item.images?.[0] || null,
                    sellerId: item.sellerId || item.authorId,
                    sellerName: item.sellerName || item.author,
                    downloadUrl: item.downloadUrl || null,
                    addedAt: serverTimestamp()
                });
                toast.success('Added to cart');
            }
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart');
            return false;
        }
    }, [userId, cartItems]);

    // Remove item from cart
    const removeFromCart = useCallback(async (cartId) => {
        if (!userId) return false;

        try {
            const cartItemRef = doc(db, getCartPath(), cartId);
            await deleteDoc(cartItemRef);
            toast.success('Removed from cart');
            return true;
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error('Failed to remove from cart');
            return false;
        }
    }, [userId]);

    // Update item quantity
    const updateQuantity = useCallback(async (cartId, quantity) => {
        if (!userId || quantity < 1) return false;

        try {
            const cartItemRef = doc(db, getCartPath(), cartId);
            await setDoc(cartItemRef, { quantity }, { merge: true });
            return true;
        } catch (error) {
            console.error('Error updating quantity:', error);
            return false;
        }
    }, [userId]);

    // Clear entire cart
    const clearCart = useCallback(async () => {
        if (!userId || cartItems.length === 0) return;

        try {
            const batch = writeBatch(db);
            cartItems.forEach(item => {
                const cartItemRef = doc(db, getCartPath(), item.cartId);
                batch.delete(cartItemRef);
            });
            await batch.commit();
            toast.success('Cart cleared');
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear cart');
        }
    }, [userId, cartItems]);

    // Check if item is in cart
    const isInCart = useCallback((itemId) => {
        return cartItems.some(item => item.itemId === itemId);
    }, [cartItems]);

    // Calculate totals
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const value = {
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        cartTotal,
        cartCount
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

export default CartContext;
