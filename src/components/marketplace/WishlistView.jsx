import { useState } from 'react';
import { 
    Heart, Bell, BellOff, Trash2, ExternalLink,
    ShoppingCart, DollarSign, TrendingDown, Loader2,
    Camera, Search, Filter
} from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import toast from 'react-hot-toast';

/**
 * Wishlist Item Card
 */
function WishlistItem({ 
    item, 
    onRemove, 
    onSetAlert, 
    onRemoveAlert, 
    onViewItem,
    onAddToCart 
}) {
    const [editingAlert, setEditingAlert] = useState(false);
    const [alertPrice, setAlertPrice] = useState(item.alertPrice || '');
    const [loading, setLoading] = useState(false);

    const handleSetAlert = async () => {
        if (!alertPrice || isNaN(parseFloat(alertPrice))) {
            toast.error('Enter a valid price');
            return;
        }
        setLoading(true);
        await onSetAlert(item.itemId, parseFloat(alertPrice));
        setLoading(false);
        setEditingAlert(false);
    };

    const handleRemoveAlert = async () => {
        setLoading(true);
        await onRemoveAlert(item.itemId);
        setLoading(false);
    };

    const formattedDate = item.addedAt?.toDate?.()?.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) || 'Recently added';

    return (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden hover:shadow-lg transition group">
            {/* Image */}
            <div 
                className="aspect-square bg-gray-100 dark:bg-gray-800 relative cursor-pointer"
                onClick={() => onViewItem?.(item)}
            >
                {item.image ? (
                    <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Camera size={32} className="text-gray-400" />
                    </div>
                )}

                {/* Price Badge */}
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-sm font-bold px-2 py-1 rounded">
                    ${item.price}
                </div>

                {/* Alert Badge */}
                {item.alertOnPriceDrop && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <Bell size={10} />
                        Alert at ${item.alertPrice}
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewItem?.(item); }}
                        className="p-2 bg-white rounded-full hover:scale-110 transition"
                    >
                        <ExternalLink size={18} className="text-gray-700" />
                    </button>
                    {item.itemType === 'fx' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddToCart?.(item); }}
                            className="p-2 bg-brand-blue rounded-full hover:scale-110 transition"
                        >
                            <ShoppingCart size={18} className="text-white" />
                        </button>
                    )}
                </div>
            </div>

            {/* Details */}
            <div className="p-4">
                {item.brand && (
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                        {item.brand}
                    </div>
                )}
                <h4 className="font-bold dark:text-white text-sm mb-1 line-clamp-2" title={item.title}>
                    {item.title}
                </h4>
                <div className="text-xs text-gray-500 mb-3">
                    Added {formattedDate}
                </div>

                {/* Price Alert Section */}
                {editingAlert ? (
                    <div className="space-y-2">
                        <div className="relative">
                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                value={alertPrice}
                                onChange={(e) => setAlertPrice(e.target.value)}
                                placeholder="Target price"
                                className="w-full pl-7 pr-3 py-2 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditingAlert(false)}
                                className="flex-1 py-1.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSetAlert}
                                disabled={loading}
                                className="flex-1 py-1.5 text-xs bg-yellow-500 text-white rounded font-medium disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Set Alert'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        {item.alertOnPriceDrop ? (
                            <button
                                onClick={handleRemoveAlert}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-1 py-2 text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition disabled:opacity-50"
                            >
                                <BellOff size={12} />
                                Remove Alert
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setAlertPrice(Math.floor(item.price * 0.9));
                                    setEditingAlert(true);
                                }}
                                className="flex-1 flex items-center justify-center gap-1 py-2 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/20 hover:text-yellow-700 dark:hover:text-yellow-400 transition"
                            >
                                <Bell size={12} />
                                Price Alert
                            </button>
                        )}
                        <button
                            onClick={() => onRemove(item.itemId)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            title="Remove from wishlist"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Main Wishlist View Component
 */
export default function WishlistView({ userId, onViewItem, onAddToCart }) {
    const { 
        wishlist, 
        loading, 
        removeFromWishlist, 
        setPriceAlert, 
        removePriceAlert,
        getItemsWithAlerts
    } = useWishlist(userId);

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'gear', 'fx', 'alerts'

    const alertItems = getItemsWithAlerts();

    const filteredItems = wishlist.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                              item.brand?.toLowerCase().includes(search.toLowerCase());
        
        if (filter === 'alerts') return matchesSearch && item.alertOnPriceDrop;
        if (filter === 'gear') return matchesSearch && item.itemType === 'gear';
        if (filter === 'fx') return matchesSearch && item.itemType === 'fx';
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Heart size={24} className="text-red-500" fill="currentColor" />
                        My Wishlist
                    </h2>
                    <p className="text-sm text-gray-500">
                        {wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}
                        {alertItems.length > 0 && (
                            <span className="ml-2 text-yellow-600">
                                • {alertItems.length} price alert{alertItems.length !== 1 ? 's' : ''} active
                            </span>
                        )}
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search wishlist..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-[#2c2e36] text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'all', label: 'All Items' },
                    { id: 'gear', label: 'Gear' },
                    { id: 'fx', label: 'SeshFx' },
                    { id: 'alerts', label: `Price Alerts (${alertItems.length})` }
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                            filter === f.id 
                                ? 'bg-brand-blue text-white' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Price Alert Banner */}
            {alertItems.length > 0 && filter !== 'alerts' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                            <TrendingDown size={20} className="text-yellow-600" />
                        </div>
                        <div>
                            <div className="font-medium text-yellow-800 dark:text-yellow-200">
                                {alertItems.length} Price Alert{alertItems.length !== 1 ? 's' : ''} Active
                            </div>
                            <div className="text-xs text-yellow-600 dark:text-yellow-400">
                                We&apos;ll notify you when prices drop
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setFilter('alerts')}
                        className="text-sm font-medium text-yellow-700 dark:text-yellow-400 hover:underline"
                    >
                        View All
                    </button>
                </div>
            )}

            {/* Grid */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700">
                    <Heart size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium dark:text-white mb-2">
                        {wishlist.length === 0 ? 'Your wishlist is empty' : 'No items match your search'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {wishlist.length === 0 
                            ? 'Save items you like to your wishlist' 
                            : 'Try adjusting your filters'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                        <WishlistItem
                            key={item.id}
                            item={item}
                            onRemove={removeFromWishlist}
                            onSetAlert={setPriceAlert}
                            onRemoveAlert={removePriceAlert}
                            onViewItem={onViewItem}
                            onAddToCart={onAddToCart}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
