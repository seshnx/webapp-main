import { useState } from 'react';
import { 
    Store, ShoppingCart, Heart, Package, Wrench, Music
} from 'lucide-react';
import DistributionManager from './marketplace/DistributionManager';
import GearExchange from './marketplace/GearExchange';
import SeshFxStore from './marketplace/SeshFxStore';
import WishlistView from './marketplace/WishlistView';
import OrderTracking from './marketplace/OrderTracking';
import ShoppingCartPanel, { CartButton } from './marketplace/ShoppingCart';
import CheckoutFlow from './marketplace/CheckoutFlow';
import { CartProvider, useCart } from '../contexts/CartContext';

// Inner component that uses cart context
function MarketplaceContent({ user, userData, tokenBalance, refreshWallet, onNavigateToChat }) {
    const [subTab, setSubTab] = useState('gear');
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);

    const tabs = [
        { id: 'gear', label: 'Gear Exchange', icon: Wrench },
        { id: 'fx', label: 'SeshFX Store', icon: Music },
        { id: 'distribution', label: 'Distribution', icon: Store },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'orders', label: 'My Orders', icon: Package },
    ];

    const handleCheckout = () => {
        setShowCart(false);
        setShowCheckout(true);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Store className="text-brand-blue" />
                        Marketplace
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Buy, sell, and distribute your music and gear
                    </p>
                </div>
                
                {/* Cart Button */}
                <div className="flex items-center gap-3">
                    <CartButton onClick={() => setShowCart(true)} />
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 p-1 rounded-xl border dark:border-gray-700 flex gap-1 overflow-x-auto">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setSubTab(tab.id)}
                            className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                                subTab === tab.id 
                                    ? 'bg-brand-blue text-white shadow-md' 
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="min-h-[600px]">
                {subTab === 'distribution' && (
                    <DistributionManager user={user} userData={userData} />
                )}
                {subTab === 'gear' && (
                    <GearExchange 
                        user={user} 
                        userData={userData}
                        onNavigateToChat={onNavigateToChat}
                    />
                )}
                {subTab === 'fx' && (
                    <SeshFxStore 
                        user={user} 
                        userData={userData}
                        tokenBalance={tokenBalance} 
                        refreshWallet={refreshWallet}
                    />
                )}
                {subTab === 'wishlist' && (
                    <WishlistView 
                        userId={user?.uid}
                        onViewItem={(item) => {
                            // Navigate to appropriate tab based on item type
                            if (item.itemType === 'gear') {
                                setSubTab('gear');
                            } else {
                                setSubTab('fx');
                            }
                        }}
                    />
                )}
                {subTab === 'orders' && (
                    <OrderTracking 
                        user={user}
                        userData={userData}
                        onMessageSeller={onNavigateToChat}
                    />
                )}
            </div>

            {/* Shopping Cart Panel */}
            <ShoppingCartPanel
                isOpen={showCart}
                onClose={() => setShowCart(false)}
                onCheckout={handleCheckout}
                tokenBalance={tokenBalance}
            />

            {/* Checkout Flow */}
            {showCheckout && (
                <CheckoutFlow
                    user={user}
                    userData={userData}
                    tokenBalance={tokenBalance}
                    onClose={() => setShowCheckout(false)}
                    onSuccess={() => setShowCheckout(false)}
                    onViewOrders={() => {
                        setShowCheckout(false);
                        setSubTab('orders');
                    }}
                    refreshWallet={refreshWallet}
                />
            )}
        </div>
    );
}

// Main export with CartProvider wrapper
export default function Marketplace({ user, userData, tokenBalance, refreshWallet, onNavigateToChat }) {
    return (
        <CartProvider userId={user?.uid}>
            <MarketplaceContent 
                user={user}
                userData={userData}
                tokenBalance={tokenBalance}
                refreshWallet={refreshWallet}
                onNavigateToChat={onNavigateToChat}
            />
        </CartProvider>
    );
}
