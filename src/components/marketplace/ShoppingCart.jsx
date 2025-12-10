import { useState } from 'react';
import { 
    ShoppingCart as CartIcon, X, Plus, Minus, Trash2, 
    Loader2, Zap, ArrowRight, ShoppingBag, AlertCircle
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

/**
 * Cart Icon with Badge
 */
export function CartButton({ onClick }) {
    const { cartCount } = useCart();

    return (
        <button
            onClick={onClick}
            className="relative p-2 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
            <CartIcon size={20} className="dark:text-white" />
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-blue text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                </span>
            )}
        </button>
    );
}

/**
 * Cart Item Row
 */
function CartItem({ item, onUpdateQuantity, onRemove }) {
    const [updating, setUpdating] = useState(false);

    const handleQuantityChange = async (newQuantity) => {
        if (newQuantity < 1) return;
        setUpdating(true);
        await onUpdateQuantity(item.cartId, newQuantity);
        setUpdating(false);
    };

    return (
        <div className="flex gap-4 p-4 bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700">
            {/* Image/Icon */}
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                {item.image ? (
                    <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover rounded-lg"
                    />
                ) : (
                    <ShoppingBag size={24} className="text-gray-400" />
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <h4 className="font-medium dark:text-white truncate">{item.title}</h4>
                <div className="text-xs text-gray-500 mb-2">{item.type}</div>
                
                <div className="flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleQuantityChange(item.quantity - 1)}
                            disabled={updating || item.quantity <= 1}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-medium dark:text-white">
                            {updating ? <Loader2 size={14} className="animate-spin mx-auto" /> : item.quantity}
                        </span>
                        <button
                            onClick={() => handleQuantityChange(item.quantity + 1)}
                            disabled={updating}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-bold">
                        <Zap size={12} fill="currentColor" />
                        {item.price * item.quantity}
                    </div>
                </div>
            </div>

            {/* Remove Button */}
            <button
                onClick={() => onRemove(item.cartId)}
                className="p-1 text-gray-400 hover:text-red-500 transition self-start"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}

/**
 * Cart Summary
 */
function CartSummary({ subtotal, fees = 0, total, onCheckout, loading }) {
    return (
        <div className="bg-gray-50 dark:bg-[#1f2128] rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="flex items-center gap-1 dark:text-white">
                    <Zap size={12} className="text-yellow-500" fill="currentColor" />
                    {subtotal}
                </span>
            </div>
            
            {fees > 0 && (
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Processing Fee</span>
                    <span className="flex items-center gap-1 dark:text-white">
                        <Zap size={12} className="text-yellow-500" fill="currentColor" />
                        {fees}
                    </span>
                </div>
            )}
            
            <div className="border-t dark:border-gray-700 pt-3 flex justify-between">
                <span className="font-bold dark:text-white">Total</span>
                <span className="flex items-center gap-1 font-bold text-lg text-yellow-600 dark:text-yellow-400">
                    <Zap size={16} fill="currentColor" />
                    {total}
                </span>
            </div>

            <button
                onClick={onCheckout}
                disabled={loading}
                className="w-full bg-brand-blue hover:bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
                {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : (
                    <>
                        Checkout
                        <ArrowRight size={18} />
                    </>
                )}
            </button>
        </div>
    );
}

/**
 * Full Shopping Cart Slide-out Panel
 */
export default function ShoppingCart({ isOpen, onClose, onCheckout, tokenBalance = 0 }) {
    const { cartItems, loading, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const [checkingOut, setCheckingOut] = useState(false);

    const insufficientFunds = tokenBalance < cartTotal;

    const handleCheckout = async () => {
        if (insufficientFunds) return;
        setCheckingOut(true);
        await onCheckout?.(cartItems, cartTotal);
        setCheckingOut(false);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#23252b] z-[71] shadow-2xl flex flex-col animate-in slide-in-from-right">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <CartIcon size={20} className="dark:text-white" />
                        <h2 className="text-lg font-bold dark:text-white">Shopping Cart</h2>
                        {cartItems.length > 0 && (
                            <span className="bg-brand-blue text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {cartItems.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                        <X size={20} className="dark:text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={32} className="animate-spin text-gray-400" />
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className="text-center py-12">
                            <CartIcon size={48} className="mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium dark:text-white mb-2">
                                Your cart is empty
                            </h3>
                            <p className="text-sm text-gray-500">
                                Browse the store and add items to your cart
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-6 py-2 bg-brand-blue text-white rounded-lg font-medium hover:bg-blue-600 transition"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cartItems.map((item) => (
                                <CartItem
                                    key={item.cartId}
                                    item={item}
                                    onUpdateQuantity={updateQuantity}
                                    onRemove={removeFromCart}
                                />
                            ))}

                            {/* Clear Cart */}
                            <button
                                onClick={clearCart}
                                className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition"
                            >
                                Clear Cart
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-4 border-t dark:border-gray-700 space-y-3">
                        {/* Token Balance Warning */}
                        {insufficientFunds && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <div>
                                    <strong>Insufficient tokens.</strong>
                                    <br />
                                    You need <span className="font-bold">{cartTotal - tokenBalance}</span> more tokens.
                                </div>
                            </div>
                        )}

                        {/* Token Balance */}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Your Token Balance</span>
                            <span className="flex items-center gap-1 font-medium dark:text-white">
                                <Zap size={12} className="text-yellow-500" fill="currentColor" />
                                {tokenBalance}
                            </span>
                        </div>

                        <CartSummary
                            subtotal={cartTotal}
                            fees={0}
                            total={cartTotal}
                            onCheckout={handleCheckout}
                            loading={checkingOut}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
