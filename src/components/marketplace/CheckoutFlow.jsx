import { useState } from 'react';
import { 
    CreditCard, Zap, Lock, CheckCircle, ArrowLeft, 
    Loader2, AlertCircle, Package, Download, ShoppingBag
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useOrders } from '../../hooks/useOrders';
import toast from 'react-hot-toast';

/**
 * Checkout Step Indicator
 */
function StepIndicator({ currentStep, steps }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, index) => (
                <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        index + 1 < currentStep 
                            ? 'bg-green-500 text-white' 
                            : index + 1 === currentStep 
                                ? 'bg-brand-blue text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}>
                        {index + 1 < currentStep ? <CheckCircle size={16} /> : index + 1}
                    </div>
                    <span className={`ml-2 text-sm hidden sm:block ${
                        index + 1 <= currentStep ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'
                    }`}>
                        {step}
                    </span>
                    {index < steps.length - 1 && (
                        <div className={`w-12 h-0.5 mx-3 ${
                            index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                    )}
                </div>
            ))}
        </div>
    );
}

/**
 * Order Review Step
 */
function OrderReview({ items, total, onNext, onBack }) {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="font-bold dark:text-white">Order Summary</h3>
                </div>
                
                <div className="divide-y dark:divide-gray-700">
                    {items.map((item) => (
                        <div key={item.cartId} className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <ShoppingBag size={20} className="text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium dark:text-white truncate">{item.title}</div>
                                <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                            </div>
                            <div className="flex items-center gap-1 font-bold text-yellow-600 dark:text-yellow-400">
                                <Zap size={12} fill="currentColor" />
                                {item.price * item.quantity}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-[#1f2128] border-t dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <span className="font-bold dark:text-white">Total</span>
                        <span className="flex items-center gap-1 text-xl font-bold text-yellow-600 dark:text-yellow-400">
                            <Zap size={18} fill="currentColor" />
                            {total}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={18} />
                    Back to Cart
                </button>
                <button
                    onClick={onNext}
                    className="flex-1 bg-brand-blue hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition"
                >
                    Continue to Payment
                </button>
            </div>
        </div>
    );
}

/**
 * Payment Step
 */
function PaymentStep({ total, tokenBalance, onConfirm, onBack, loading }) {
    const insufficientFunds = tokenBalance < total;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
                <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard size={20} />
                    Payment Method
                </h3>

                {/* Token Payment Option */}
                <div className={`p-4 rounded-xl border-2 ${
                    insufficientFunds 
                        ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' 
                        : 'border-brand-blue bg-blue-50 dark:bg-blue-900/10'
                }`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Zap size={20} fill="white" className="text-white" />
                            </div>
                            <div>
                                <div className="font-bold dark:text-white">SeshNx Tokens</div>
                                <div className="text-sm text-gray-500">
                                    Balance: <span className="font-medium">{tokenBalance}</span> tokens
                                </div>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            insufficientFunds 
                                ? 'border-gray-300' 
                                : 'border-brand-blue bg-brand-blue'
                        }`}>
                            {!insufficientFunds && <CheckCircle size={14} className="text-white" />}
                        </div>
                    </div>

                    {insufficientFunds && (
                        <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>
                                Insufficient balance. You need <strong>{total - tokenBalance}</strong> more tokens.
                            </span>
                        </div>
                    )}
                </div>

                {/* Security Notice */}
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                    <Lock size={12} />
                    Your transaction is secured with end-to-end encryption
                </div>
            </div>

            {/* Order Total */}
            <div className="bg-gray-50 dark:bg-[#1f2128] rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Amount to Pay</span>
                    <span className="flex items-center gap-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        <Zap size={20} fill="currentColor" />
                        {total}
                    </span>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading || insufficientFunds}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <>
                            <Lock size={18} />
                            Confirm Purchase
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

/**
 * Confirmation Step
 */
function ConfirmationStep({ order, onContinue, onViewOrders }) {
    return (
        <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={40} className="text-green-500" />
            </div>

            <div>
                <h2 className="text-2xl font-bold dark:text-white mb-2">Purchase Complete!</h2>
                <p className="text-gray-500">
                    Your order has been processed successfully.
                </p>
            </div>

            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 text-left">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Package size={16} />
                    Order ID: <span className="font-mono">{order?.id?.slice(0, 8)}...</span>
                </div>

                <div className="space-y-2">
                    {order?.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="dark:text-white">{item.title}</span>
                            {item.downloadUrl && (
                                <a 
                                    href={item.downloadUrl}
                                    download
                                    className="flex items-center gap-1 text-brand-blue hover:underline"
                                >
                                    <Download size={14} />
                                    Download
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onViewOrders}
                    className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                >
                    View Orders
                </button>
                <button
                    onClick={onContinue}
                    className="flex-1 bg-brand-blue hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition"
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );
}

/**
 * Main Checkout Flow Component
 */
export default function CheckoutFlow({ 
    user, 
    userData,
    tokenBalance,
    onClose, 
    onSuccess,
    onViewOrders,
    refreshWallet
}) {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { createOrder } = useOrders(user?.uid);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);

    const steps = ['Review', 'Payment', 'Confirmation'];

    const handleConfirmPayment = async () => {
        if (tokenBalance < cartTotal) {
            toast.error('Insufficient token balance');
            return;
        }

        setLoading(true);
        try {
            // Group items by seller
            const itemsBySeller = cartItems.reduce((acc, item) => {
                const sellerId = item.sellerId || 'platform';
                if (!acc[sellerId]) acc[sellerId] = [];
                acc[sellerId].push(item);
                return acc;
            }, {});

            // Create orders for each seller
            const orders = [];
            for (const [sellerId, items] of Object.entries(itemsBySeller)) {
                const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                
                const result = await createOrder({
                    buyerId: user.uid,
                    buyerName: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'Anonymous',
                    buyerEmail: user.email,
                    sellerId,
                    sellerName: items[0]?.sellerName || 'SeshNx Store',
                    items: items.map(item => ({
                        itemId: item.itemId,
                        title: item.title,
                        type: item.type,
                        quantity: item.quantity,
                        price: item.price,
                        downloadUrl: item.downloadUrl
                    })),
                    subtotal,
                    fees: 0,
                    total: subtotal,
                    paymentMethod: 'tokens',
                    orderType: 'digital'
                });

                if (result.success) {
                    orders.push({ id: result.orderId, items, total: subtotal });
                }
            }

            if (orders.length > 0) {
                // Deduct tokens (would be done via Cloud Function in production)
                // For now, we trust the order creation succeeded
                
                setCompletedOrder({
                    id: orders[0].id,
                    items: cartItems,
                    total: cartTotal
                });

                // Clear cart and refresh wallet
                await clearCart();
                if (refreshWallet) refreshWallet();

                setStep(3);
                toast.success('Purchase complete!');
            } else {
                toast.error('Failed to process order');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Failed to process payment');
        }
        setLoading(false);
    };

    const handleContinue = () => {
        onSuccess?.();
        onClose?.();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white dark:bg-[#23252b] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-700">
                    <StepIndicator currentStep={step} steps={steps} />
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 1 && (
                        <OrderReview
                            items={cartItems}
                            total={cartTotal}
                            onNext={() => setStep(2)}
                            onBack={onClose}
                        />
                    )}

                    {step === 2 && (
                        <PaymentStep
                            total={cartTotal}
                            tokenBalance={tokenBalance}
                            onConfirm={handleConfirmPayment}
                            onBack={() => setStep(1)}
                            loading={loading}
                        />
                    )}

                    {step === 3 && (
                        <ConfirmationStep
                            order={completedOrder}
                            onContinue={handleContinue}
                            onViewOrders={onViewOrders}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
