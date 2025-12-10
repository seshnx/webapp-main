import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
    Search, Plus, Camera, DollarSign, X, CheckCircle, AlertTriangle, 
    Loader2, MapPin, Wrench, Star, MessageSquare, Shield, Package
} from 'lucide-react';
import { db, getPaths } from '../../config/firebase';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { EQUIP_CATEGORIES } from '../../config/constants';
import InspectionEditor from '../tech/InspectionEditor';
import { InspectionSvg } from '../tech/InspectionDiagrams';
import WishlistButton from './WishlistButton';
import SellerReviews, { SellerRatingBadge } from './SellerReviews';
import { EscrowInfoModal } from './EscrowSystem';
import { useWishlist } from '../../hooks/useWishlist';
import { useSellerRating } from '../../hooks/useSellerReviews';
import PickupVerification, { HighValuePurchaseModal } from './PickupVerification';
import { HIGH_VALUE_THRESHOLD } from '../../hooks/usePickupSession';
import toast from 'react-hot-toast';

const CONDITIONS = ['Mint', 'Excellent', 'Good', 'Fair', 'Non-Functioning'];

export default function GearExchange({ user, userData, onNavigateToChat }) {
    const [view, setView] = useState('browse'); // 'browse', 'create', 'detail'
    const [listings, setListings] = useState([]);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const { wishlistIds } = useWishlist(user?.uid);

    // Fetch Listings
    useEffect(() => {
        const q = query(collection(db, getPaths(user.uid).gearListings), orderBy('timestamp', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            setListings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [user.uid]);

    // Filtering
    const filteredListings = listings.filter(l => 
        (filter === 'All' || l.category === filter) &&
        (l.title?.toLowerCase().includes(search.toLowerCase()) || l.brand?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto pb-24 animate-in fade-in">
            {/* Navigation & Search Header */}
            {view === 'browse' && (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                                <Wrench className="text-orange-500" /> Gear Exchange
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Buy and sell verified studio equipment.
                            </p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                                <input 
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2c2e36] text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Search gear..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={() => setView('create')} 
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition"
                            >
                                <Plus size={16}/> Sell Gear
                            </button>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
                        <button onClick={() => setFilter('All')} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${filter === 'All' ? 'bg-white dark:bg-white text-black shadow' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>All Gear</button>
                        {EQUIP_CATEGORIES.map(cat => (
                            <button key={cat.id} onClick={() => setFilter(cat.id)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${filter === cat.id ? 'bg-white dark:bg-white text-black shadow' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredListings.map(item => (
                            <GearListingCard 
                                key={item.id}
                                item={item}
                                userId={user?.uid}
                                isInWishlist={wishlistIds.has(item.id)}
                                onClick={() => setSelectedItem(item)}
                            />
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredListings.length === 0 && (
                        <div className="text-center py-12">
                            <Camera size={48} className="mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium dark:text-white mb-2">No listings found</h3>
                            <p className="text-sm text-gray-500">
                                {search ? 'Try adjusting your search' : 'Be the first to list gear for sale!'}
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Create Listing View */}
            {view === 'create' && (
                <CreateListingForm 
                    user={user} 
                    userData={userData} 
                    onCancel={() => setView('browse')} 
                    onSuccess={() => setView('browse')}
                />
            )}

            {/* Detail Modal */}
            {selectedItem && (
                <ListingDetailModal 
                    item={selectedItem} 
                    onClose={() => setSelectedItem(null)} 
                    currentUser={user}
                    userData={userData}
                    onNavigateToChat={onNavigateToChat}
                />
            )}
        </div>
    );
}

// --- Gear Listing Card with Wishlist & Rating ---
function GearListingCard({ item, userId, isInWishlist, onClick }) {
    const { rating, reviewCount } = useSellerRating(item.sellerId);

    return (
        <div 
            onClick={onClick} 
            className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden hover:shadow-xl transition cursor-pointer group flex flex-col"
        >
            <div className="aspect-square bg-gray-100 dark:bg-black/40 relative flex items-center justify-center overflow-hidden">
                {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                ) : (
                    <Camera size={32} className="text-gray-400"/>
                )}
                
                {/* Price Badge */}
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md">
                    ${item.price}
                </div>
                
                {/* Wishlist Button */}
                <div className="absolute top-2 left-2" onClick={e => e.stopPropagation()}>
                    <WishlistButton 
                        item={{ ...item, itemType: 'gear' }} 
                        userId={userId} 
                        size="small"
                        showPriceAlert={true}
                    />
                </div>
                
                {/* Inspected Badge */}
                {item.conditionReport && (
                    <div className="absolute bottom-2 left-2 bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle size={10}/> Inspected
                    </div>
                )}

                {/* Escrow Recommended Badge */}
                {item.price >= 500 && (
                    <div className="absolute bottom-2 right-2 bg-green-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Shield size={10}/> Escrow
                    </div>
                )}
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">{item.brand}</div>
                <h4 className="font-bold dark:text-white text-sm mb-1 line-clamp-1">{item.title}</h4>
                <div className="text-xs text-gray-500 mb-2">{item.condition} Condition</div>
                
                {/* Seller Rating */}
                {rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        <Star size={12} fill="#facc15" className="text-yellow-400" />
                        <span className="text-xs font-medium dark:text-white">{rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({reviewCount})</span>
                    </div>
                )}
                
                <div className="mt-auto pt-3 border-t dark:border-gray-700 flex justify-between items-center text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin size={10}/> {item.location || 'Ships Anywhere'}</span>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: CREATE LISTING ---
function CreateListingForm({ user, userData, onCancel, onSuccess }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ 
        title: '', brand: '', category: EQUIP_CATEGORIES[0]?.id || 'microphones', condition: 'Good', price: '', 
        description: '', location: userData?.city || '',
        weight: '', length: '', width: '', height: ''
    });
    const [images, setImages] = useState([]);
    const [conditionReport, setConditionReport] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const { uploadMedia, uploading } = useMediaUpload();

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const res = await uploadMedia(file, `gear/${user.uid}`);
        if (res?.url) setImages([...images, res.url]);
    };

    const handleSubmit = async () => {
        if (!form.title || !form.price) {
            toast.error("Title and Price are required");
            return;
        }
        setSubmitting(true);
        try {
            await addDoc(collection(db, getPaths(user.uid).gearListings), {
                ...form,
                price: parseInt(form.price),
                images,
                conditionReport,
                sellerId: user.uid,
                sellerName: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'Anonymous',
                sellerPhoto: userData?.photoURL || null,
                timestamp: serverTimestamp(),
                status: 'Active'
            });
            toast.success("Listing posted successfully!");
            onSuccess();
        } catch (e) {
            console.error(e);
            toast.error("Failed to post listing.");
        }
        setSubmitting(false);
    };

    // Special View: Tech Inspection Tool embedded in the wizard
    if (step === 'inspection') {
        return (
            <div className="h-[600px]">
                <InspectionEditor 
                    type="Pre"
                    onSave={(report) => { setConditionReport(report); setStep(1); }} 
                    onCancel={() => setStep(1)} 
                />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#2c2e36] p-8 rounded-2xl border dark:border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold dark:text-white">List Gear for Sale</h3>
                <button onClick={onCancel}><X className="text-gray-400"/></button>
            </div>

            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Brand</label>
                        <input className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="e.g. Fender"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Model / Title</label>
                        <input className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Stratocaster"/>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Category</label>
                        <select className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                            {EQUIP_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Condition</label>
                        <select className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Price ($)</label>
                    <input type="number" className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white font-bold" value={form.price} onChange={e => setForm({...form, price: e.target.value})}/>
                </div>

                {/* Weight & Dimensions for Shipping */}
                <div className="grid grid-cols-4 gap-2">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Weight (lb)</label>
                        <input type="number" className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" placeholder="lbs" value={form.weight} onChange={e=>setForm({...form, weight: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">L (in)</label>
                        <input type="number" className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" placeholder="Len" value={form.length} onChange={e=>setForm({...form, length: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">W (in)</label>
                        <input type="number" className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" placeholder="Wid" value={form.width} onChange={e=>setForm({...form, width: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">H (in)</label>
                        <input type="number" className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" placeholder="Hgt" value={form.height} onChange={e=>setForm({...form, height: e.target.value})} />
                    </div>
                </div>

                {/* Condition Report Integration */}
                <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-800 flex justify-between items-center">
                    <div>
                        <div className="font-bold text-orange-800 dark:text-orange-400 text-sm mb-1">Tech Inspection Report</div>
                        <div className="text-xs text-orange-600 dark:text-orange-300">
                            {conditionReport 
                                ? <span className="flex items-center gap-1"><CheckCircle size={12}/> Report Attached ({conditionReport.markers?.length || 0} points)</span> 
                                : "Mark scratches, dents, or issues on a diagram to build trust."}
                        </div>
                    </div>
                    <button 
                        onClick={() => setStep('inspection')} 
                        className={`text-xs font-bold px-3 py-2 rounded-lg border transition ${conditionReport ? 'bg-white text-green-600 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200'}`}
                    >
                        {conditionReport ? "Edit Report" : "Create Report"}
                    </button>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Photos</label>
                    <div className="flex gap-2 flex-wrap">
                        {images.map((img, i) => (
                            <div key={i} className="relative">
                                <img src={img} alt={`Upload ${i + 1}`} className="w-16 h-16 rounded-lg object-cover border dark:border-gray-600"/>
                                <button 
                                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                            {uploading ? <Loader2 className="animate-spin text-gray-400"/> : <Plus className="text-gray-400"/>}
                            <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} accept="image/*"/>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                    <textarea 
                        className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white resize-none" 
                        rows={3}
                        value={form.description} 
                        onChange={e => setForm({...form, description: e.target.value})} 
                        placeholder="Describe your item, its history, any modifications..."
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button onClick={onCancel} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={submitting || uploading} className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                        {submitting ? <Loader2 className="animate-spin"/> : "Post Listing"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: DETAIL MODAL ---
function ListingDetailModal({ item, onClose, currentUser, userData, onNavigateToChat }) {
    const [viewReport, setViewReport] = useState(false);
    const [activeTab, setActiveTab] = useState('details'); // 'details', 'reviews'
    const [showEscrowInfo, setShowEscrowInfo] = useState(false);
    const [showHighValuePurchase, setShowHighValuePurchase] = useState(false);
    const [pickupSessionId, setPickupSessionId] = useState(null);
    
    const isHighValue = item.price >= HIGH_VALUE_THRESHOLD;
    const isOwner = item.sellerId === currentUser?.uid;

    const handleBuy = () => {
        if (isHighValue) {
            // High-value items require local pickup with 2-party verification
            setShowHighValuePurchase(true);
        } else {
            // Standard purchase flow for lower-value items
            toast.success('Starting purchase...');
            // TODO: Implement standard purchase flow
        }
    };

    const handleMessage = () => {
        if (onNavigateToChat) {
            onNavigateToChat(item.sellerId);
        }
    };

    const handleSessionCreated = (sessionId) => {
        setShowHighValuePurchase(false);
        setPickupSessionId(sessionId);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                <div className="bg-white dark:bg-[#2c2e36] w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border dark:border-gray-700">
                    
                    {/* Left: Gallery & Visuals */}
                    <div className="md:w-1/2 bg-black relative flex flex-col">
                        <div className="flex-1 flex items-center justify-center p-4 relative">
                            {/* Toggle between Photo and Diagram if Report Exists */}
                            {viewReport && item.conditionReport ? (
                                <div className="w-full h-full bg-white rounded-xl overflow-hidden">
                                    <InspectionSvg 
                                        type={item.conditionReport.gearType} 
                                        view="front" 
                                        markers={item.conditionReport.markers} 
                                        onClick={() => {}}
                                    />
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-full text-xs">
                                        Inspection View
                                    </div>
                                </div>
                            ) : (
                                item.images?.[0] ? (
                                    <img src={item.images[0]} alt={item.title} className="max-h-full max-w-full object-contain"/>
                                ) : (
                                    <Camera size={48} className="text-gray-600"/>
                                )
                            )}
                            
                            <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70">
                                <X size={20}/>
                            </button>

                            {/* Wishlist Button */}
                            <div className="absolute top-4 right-4">
                                <WishlistButton 
                                    item={{ ...item, itemType: 'gear' }} 
                                    userId={currentUser?.uid}
                                    showPriceAlert={true}
                                />
                            </div>
                        </div>
                        
                        {/* Visual Toggle Bar */}
                        {item.conditionReport && (
                            <div className="p-4 bg-[#1f2128] border-t border-gray-800 flex gap-2 justify-center">
                                <button onClick={() => setViewReport(false)} className={`px-4 py-2 rounded text-xs font-bold ${!viewReport ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Photos</button>
                                <button onClick={() => setViewReport(true)} className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-1 ${viewReport ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                    <AlertTriangle size={12}/> Condition Map
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="md:w-1/2 flex flex-col overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b dark:border-gray-700">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`flex-1 py-3 text-sm font-medium transition ${
                                    activeTab === 'details' 
                                        ? 'text-orange-600 border-b-2 border-orange-600' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Details
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-1 ${
                                    activeTab === 'reviews' 
                                        ? 'text-orange-600 border-b-2 border-orange-600' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Star size={14} />
                                Seller Reviews
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'details' ? (
                                <>
                                    {/* Header */}
                                    <div className="mb-6">
                                        <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{item.brand}</div>
                                        <h2 className="text-2xl font-extrabold dark:text-white mb-2">{item.title}</h2>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="text-xl font-bold text-green-600">${item.price}</span>
                                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-bold">{item.condition}</span>
                                            {item.location && (
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <MapPin size={12} />
                                                    {item.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* High-Value Item Banner */}
                                    {isHighValue && !isOwner && (
                                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
                                            <div className="flex items-start gap-3">
                                                <Shield className="text-green-600 shrink-0 mt-0.5" size={20} />
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-green-800 dark:text-green-200 mb-1">
                                                        Secure Local Pickup Required
                                                    </h4>
                                                    <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                                                        High-value items (${HIGH_VALUE_THRESHOLD}+) require local pickup with our 
                                                        two-party verification system to protect both buyer and seller.
                                                    </p>
                                                    <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                                                        <li className="flex items-center gap-1">
                                                            <CheckCircle size={10} /> Full deposit held securely
                                                        </li>
                                                        <li className="flex items-center gap-1">
                                                            <CheckCircle size={10} /> Photo verification from both parties
                                                        </li>
                                                        <li className="flex items-center gap-1">
                                                            <CheckCircle size={10} /> Mutual approval before funds release
                                                        </li>
                                                    </ul>
                                                    <button 
                                                        onClick={() => setShowEscrowInfo(true)}
                                                        className="mt-2 text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
                                                    >
                                                        Learn more →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Seller Info */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border dark:border-gray-700 my-4">
                                        {item.sellerPhoto ? (
                                            <img src={item.sellerPhoto} alt={item.sellerName} className="w-10 h-10 rounded-full object-cover"/>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-500">
                                                ?
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-500 uppercase font-bold">Seller</div>
                                            <div className="font-bold dark:text-white text-sm flex items-center gap-2">
                                                {item.sellerName}
                                                <SellerRatingBadge sellerId={item.sellerId} size="small" />
                                            </div>
                                        </div>
                                        {!isOwner && (
                                            <button 
                                                onClick={handleMessage}
                                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                                            >
                                                <MessageSquare size={18} className="text-gray-500" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Condition Notes */}
                                    {item.conditionReport?.notes && (
                                        <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-800/50 mb-4">
                                            <h4 className="font-bold text-orange-800 dark:text-orange-400 text-sm mb-2 flex items-center gap-2">
                                                <Wrench size={16}/> Tech Notes
                                            </h4>
                                            <p className="text-sm text-orange-900 dark:text-orange-200 italic">&quot;{item.conditionReport.notes}&quot;</p>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div className="prose dark:prose-invert text-sm text-gray-600 dark:text-gray-300 mb-4">
                                        <h4 className="font-bold dark:text-white text-sm uppercase">Description</h4>
                                        <p>{item.description || "No description provided."}</p>
                                    </div>

                                    {/* Specs */}
                                    {(item.weight || item.length) && (
                                        <div className="mb-4">
                                            <h4 className="font-bold dark:text-white text-sm uppercase mb-2">Specifications</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                {item.weight && (
                                                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                                        <span className="text-gray-500">Weight:</span>
                                                        <span className="ml-2 dark:text-white">{item.weight} lbs</span>
                                                    </div>
                                                )}
                                                {item.length && (
                                                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                                        <span className="text-gray-500">Dimensions:</span>
                                                        <span className="ml-2 dark:text-white">{item.length}×{item.width}×{item.height} in</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <SellerReviews sellerId={item.sellerId} currentUserId={currentUser?.uid} />
                            )}
                        </div>

                        {/* Buy Actions */}
                        <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-[#2c2e36]">
                            {isOwner ? (
                                <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold py-3 rounded-xl cursor-not-allowed">
                                    You own this listing
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={handleBuy}
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition transform hover:scale-[1.02]"
                                    >
                                        {isHighValue ? (
                                            <>
                                                <Shield size={18} />
                                                <Package size={18} />
                                                Secure Local Pickup - ${item.price}
                                            </>
                                        ) : (
                                            <>
                                                <DollarSign size={20}/> 
                                                Buy Now
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                                        <CheckCircle size={10}/> 
                                        {isHighValue 
                                            ? 'Protected by 2-Party Verification System' 
                                            : 'Purchases covered by SeshNx Buyer Protection'
                                        }
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Escrow Info Modal */}
                <EscrowInfoModal isOpen={showEscrowInfo} onClose={() => setShowEscrowInfo(false)} />
            </div>

            {/* High-Value Purchase Modal */}
            {showHighValuePurchase && (
                <HighValuePurchaseModal
                    item={item}
                    user={currentUser}
                    userData={userData}
                    onClose={() => setShowHighValuePurchase(false)}
                    onSessionCreated={handleSessionCreated}
                />
            )}

            {/* Pickup Verification Modal */}
            {pickupSessionId && (
                <PickupVerification
                    sessionId={pickupSessionId}
                    userId={currentUser?.uid}
                    onClose={() => {
                        setPickupSessionId(null);
                        onClose();
                    }}
                    onMessageOther={onNavigateToChat}
                />
            )}
        </>
    );
}
