import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, doc, updateDoc } from 'firebase/firestore';
import { Search, Filter, Plus, Camera, DollarSign, Tag, X, CheckCircle, AlertTriangle, Loader2, MapPin, Wrench, Shield, Lock, Truck, CreditCard, Info, ToggleLeft, ToggleRight, Package } from 'lucide-react';
import { db, getPaths, appId } from '../../config/firebase';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { EQUIP_CATEGORIES, HIGH_VALUE_THRESHOLD, SAFE_EXCHANGE_STATUS, SAFE_EXCHANGE_REQUIREMENT, FULFILLMENT_METHOD, SHIPPING_VERIFICATION_STATUS } from '../../config/constants';
import InspectionEditor from '../tech/InspectionEditor';
import { InspectionSvg } from '../tech/InspectionDiagrams';
import SafeExchangeTransaction from './SafeExchangeTransaction';
import ShippingVerification from './ShippingVerification';

const CONDITIONS = ['Mint', 'Excellent', 'Good', 'Fair', 'Non-Functioning'];

// Helper to check if item requires escrow (high value)
const isHighValueItem = (price) => price >= HIGH_VALUE_THRESHOLD;

// Determine safe exchange requirement level
const getSafeExchangeRequirement = (price, sellerRequiresSafeExchange) => {
    if (price >= HIGH_VALUE_THRESHOLD) return SAFE_EXCHANGE_REQUIREMENT.REQUIRED;
    if (sellerRequiresSafeExchange) return SAFE_EXCHANGE_REQUIREMENT.SELLER_REQUIRED;
    return SAFE_EXCHANGE_REQUIREMENT.OPTIONAL;
};

export default function GearExchange({ user, userData, setActiveTab, openChat }) {
    const [view, setView] = useState('browse'); // 'browse', 'create', 'detail'
    const [listings, setListings] = useState([]);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    
    // Safe Exchange State
    const [activeTransaction, setActiveTransaction] = useState(null);
    const [userTransactions, setUserTransactions] = useState([]);

    // Fetch Listings
    useEffect(() => {
        const q = query(collection(db, getPaths(user.uid).gearListings), orderBy('timestamp', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            setListings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [user.uid]);

    // Fetch user's active safe exchange transactions
    useEffect(() => {
        if (!user?.uid) return;

        const qBuyer = query(
            collection(db, `artifacts/${appId}/public/data/safe_exchange_transactions`),
            where('buyerId', '==', user.uid)
        );
        const qSeller = query(
            collection(db, `artifacts/${appId}/public/data/safe_exchange_transactions`),
            where('sellerId', '==', user.uid)
        );

        const unsubBuyer = onSnapshot(qBuyer, (snap) => {
            setUserTransactions(prev => {
                const buyerTxns = snap.docs.map(d => ({ id: d.id, ...d.data(), role: 'buyer' }));
                const sellerTxns = prev.filter(t => t.role === 'seller');
                return [...buyerTxns, ...sellerTxns];
            });
        });

        const unsubSeller = onSnapshot(qSeller, (snap) => {
            setUserTransactions(prev => {
                const sellerTxns = snap.docs.map(d => ({ id: d.id, ...d.data(), role: 'seller' }));
                const buyerTxns = prev.filter(t => t.role === 'buyer');
                return [...buyerTxns, ...sellerTxns];
            });
        });

        return () => {
            unsubBuyer();
            unsubSeller();
        };
    }, [user?.uid]);

    // Handle initiating a safe exchange purchase
    const handleSafeExchangePurchase = async (item) => {
        try {
            // Create the safe exchange transaction
            const transactionRef = await addDoc(
                collection(db, `artifacts/${appId}/public/data/safe_exchange_transactions`),
                {
                    // Item details
                    listingId: item.id,
                    itemTitle: item.title,
                    itemBrand: item.brand,
                    itemDescription: item.description || '',
                    itemPhotos: item.images || [],
                    itemCondition: item.condition,
                    price: item.price,
                    
                    // Seller details
                    sellerId: item.sellerId,
                    sellerName: item.sellerName,
                    sellerPhoto: item.sellerPhoto,
                    
                    // Buyer details
                    buyerId: user.uid,
                    buyerName: `${userData.firstName} ${userData.lastName}`,
                    buyerPhoto: userData.photoURL || null,
                    
                    // Status
                    status: SAFE_EXCHANGE_STATUS.INTENT_CREATED,
                    statusHistory: {
                        [SAFE_EXCHANGE_STATUS.INTENT_CREATED]: {
                            timestamp: Date.now(),
                            userId: user.uid
                        }
                    },
                    
                    // Escrow (placeholder - in production this would integrate with payment processor)
                    escrowAmount: item.price,
                    escrowStatus: 'pending',
                    
                    // Approvals
                    sellerApproved: false,
                    buyerApproved: false,
                    
                    // Timestamps
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                }
            );

            // Update transaction to hold_placed status (simulating payment hold)
            await updateDoc(transactionRef, {
                status: SAFE_EXCHANGE_STATUS.HOLD_PLACED,
                [`statusHistory.${SAFE_EXCHANGE_STATUS.HOLD_PLACED}`]: {
                    timestamp: Date.now(),
                    userId: user.uid
                },
                escrowStatus: 'held'
            });

            // Notify seller
            await updateDoc(transactionRef, {
                status: SAFE_EXCHANGE_STATUS.SELLER_NOTIFIED,
                [`statusHistory.${SAFE_EXCHANGE_STATUS.SELLER_NOTIFIED}`]: {
                    timestamp: Date.now(),
                    userId: user.uid
                }
            });

            // Send notification to seller
            await addDoc(collection(db, getPaths(item.sellerId).notifications), {
                type: 'safe_exchange_intent',
                transactionId: transactionRef.id,
                message: `${userData.firstName} wants to purchase your ${item.title} for $${item.price}`,
                buyerName: `${userData.firstName} ${userData.lastName}`,
                itemTitle: item.title,
                price: item.price,
                read: false,
                createdAt: serverTimestamp()
            });

            // Open the transaction view
            setActiveTransaction(transactionRef.id);
            setSelectedItem(null);

        } catch (error) {
            console.error('Failed to create safe exchange:', error);
            alert('Failed to initiate purchase. Please try again.');
        }
    };

    // Filtering
    const filteredListings = listings.filter(l => 
        (filter === 'All' || l.category === filter) &&
        (l.title.toLowerCase().includes(search.toLowerCase()) || l.brand.toLowerCase().includes(search.toLowerCase()))
    );

    // Get active transactions that are not completed
    const pendingTransactions = userTransactions.filter(t => 
        t.status !== SAFE_EXCHANGE_STATUS.COMPLETED && 
        t.status !== SAFE_EXCHANGE_STATUS.CANCELLED
    );

    return (
        <div className="max-w-7xl mx-auto pb-24 animate-in fade-in">
            {/* Active Safe Exchange Transaction Modal */}
            {activeTransaction && (
                <SafeExchangeTransaction
                    transactionId={activeTransaction}
                    user={user}
                    userData={userData}
                    onClose={() => setActiveTransaction(null)}
                    onComplete={() => {
                        setActiveTransaction(null);
                        // Could trigger a refresh or show success message
                    }}
                    onMessage={(otherUserId) => {
                        // Open chat with other party
                        openChat?.(otherUserId);
                    }}
                />
            )}

            {/* Navigation & Search Header */}
            {view === 'browse' && (
                <>
                    {/* Pending Transactions Banner */}
                    {pendingTransactions.length > 0 && (
                        <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center gap-3 mb-3">
                                <Shield className="text-orange-600" size={24} />
                                <div>
                                    <h3 className="font-bold text-orange-800 dark:text-orange-300">Active Safe Exchanges</h3>
                                    <p className="text-sm text-orange-600 dark:text-orange-400">
                                        You have {pendingTransactions.length} pending transaction{pendingTransactions.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {pendingTransactions.map(txn => (
                                    <button
                                        key={txn.id}
                                        onClick={() => setActiveTransaction(txn.id)}
                                        className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${txn.role === 'buyer' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                                {txn.role === 'buyer' ? <CreditCard size={16} /> : <DollarSign size={16} />}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-sm dark:text-white">{txn.itemTitle}</div>
                                                <div className="text-xs text-gray-500">
                                                    {txn.role === 'buyer' ? 'Buying' : 'Selling'} • ${txn.price}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">
                                            {txn.status.replace(/_/g, ' ')}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

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
                        {filteredListings.map(item => {
                            const highValue = isHighValueItem(item.price);
                            return (
                                <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden hover:shadow-xl transition cursor-pointer group flex flex-col">
                                    <div className="aspect-square bg-gray-100 dark:bg-black/40 relative flex items-center justify-center overflow-hidden">
                                        {item.images?.[0] ? (
                                            <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                                        ) : (
                                            <Camera size={32} className="text-gray-400"/>
                                        )}
                                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md">
                                            ${item.price}
                                        </div>
                                        {highValue && (
                                            <div className="absolute top-2 left-2 bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                <Shield size={10}/> Safe Exchange
                                            </div>
                                        )}
                                        {item.conditionReport && (
                                            <div className="absolute bottom-2 left-2 bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                <CheckCircle size={10}/> Inspected
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">{item.brand}</div>
                                        <h4 className="font-bold dark:text-white text-sm mb-1 line-clamp-1">{item.title}</h4>
                                        <div className="text-xs text-gray-500 mb-3">{item.condition} Condition</div>
                                        
                                        <div className="mt-auto pt-3 border-t dark:border-gray-700 flex justify-between items-center text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                {highValue ? (
                                                    <><MapPin size={10}/> Local Pickup Only</>
                                                ) : (
                                                    <><Truck size={10}/> {item.location || 'Shipped'}</>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
                    currentUserData={userData}
                    onSafeExchangePurchase={handleSafeExchangePurchase}
                />
            )}
        </div>
    );
}

// --- SUB-COMPONENT: CREATE LISTING ---
function CreateListingForm({ user, userData, onCancel, onSuccess }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ 
        title: '', brand: '', category: EQUIP_CATEGORIES[0].id, condition: 'Good', price: '', 
        description: '', location: userData.city || '',
        weight: '', length: '', width: '', height: '' // Added dimensions
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
        if (!form.title || !form.price) return alert("Title and Price required.");
        setSubmitting(true);
        try {
            await addDoc(collection(db, getPaths(user.uid).gearListings), {
                ...form,
                price: parseInt(form.price),
                images,
                conditionReport, // Attach the inspection object directly
                sellerId: user.uid,
                sellerName: `${userData.firstName} ${userData.lastName}`,
                sellerPhoto: userData.photoURL || null,
                timestamp: serverTimestamp(),
                status: 'Active'
            });
            alert("Listing posted!");
            onSuccess();
        } catch (e) {
            console.error(e);
            alert("Failed to post listing.");
        }
        setSubmitting(false);
    };

    // Special View: Tech Inspection Tool embedded in the wizard
    if (step === 'inspection') {
        return (
            <div className="h-[600px]">
                <InspectionEditor 
                    type="Pre" // Using "Pre" template as base for condition report
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
                    
                    {/* High Value Warning */}
                    {form.price && parseInt(form.price) >= HIGH_VALUE_THRESHOLD && (
                        <div className="mt-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="flex items-start gap-3">
                                <Shield className="text-orange-500 shrink-0 mt-0.5" size={20}/>
                                <div>
                                    <h4 className="font-bold text-orange-800 dark:text-orange-300 text-sm">Safe Exchange Required</h4>
                                    <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                                        Items priced at ${HIGH_VALUE_THRESHOLD}+ require in-person exchange at a verified safe location (police station, bank, etc.). 
                                        Buyers will initiate a Safe Exchange with payment held in escrow until both parties approve.
                                    </p>
                                    <ul className="text-xs text-orange-600 dark:text-orange-400 mt-2 space-y-1">
                                        <li className="flex items-center gap-1"><Info size={10}/> No shipping available for high-value items</li>
                                        <li className="flex items-center gap-1"><Camera size={10}/> You must upload pre-departure photos</li>
                                        <li className="flex items-center gap-1"><MapPin size={10}/> GPS verification at exchange location</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
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
                                ? <span className="flex items-center gap-1"><CheckCircle size={12}/> Report Attached ({conditionReport.markers.length} points)</span> 
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
                    <div className="flex gap-2">
                        {images.map((img, i) => (
                            <img key={i} src={img} className="w-16 h-16 rounded-lg object-cover border dark:border-gray-600"/>
                        ))}
                        <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                            {uploading ? <Loader2 className="animate-spin text-gray-400"/> : <Plus className="text-gray-400"/>}
                            <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading}/>
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button onClick={onCancel} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={submitting || uploading} className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg flex items-center justify-center gap-2">
                        {submitting ? <Loader2 className="animate-spin"/> : "Post Listing"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: DETAIL MODAL ---
function ListingDetailModal({ item, onClose, currentUser, currentUserData, onSafeExchangePurchase }) {
    const [viewReport, setViewReport] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);

    const highValue = isHighValueItem(item.price);

    const handlePurchase = async () => {
        if (highValue) {
            setIsPurchasing(true);
            await onSafeExchangePurchase(item);
            setIsPurchasing(false);
        } else {
            // Standard purchase flow for low-value items
            alert('Standard purchase flow - coming soon!');
        }
    };

    return (
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
                                    onClick={() => {}} // Read-only
                                />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-full text-xs">
                                    Inspection View
                                </div>
                            </div>
                        ) : (
                            item.images?.[0] ? <img src={item.images[0]} className="max-h-full max-w-full object-contain"/> : <Camera size={48} className="text-gray-600"/>
                        )}
                        
                        <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"><X size={20}/></button>
                        
                        {/* High Value Badge */}
                        {highValue && (
                            <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg">
                                <Shield size={14}/> Safe Exchange Required
                            </div>
                        )}
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
                <div className="md:w-1/2 p-8 overflow-y-auto bg-white dark:bg-[#2c2e36]">
                    <div className="mb-6">
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{item.brand}</div>
                        <h2 className="text-3xl font-extrabold dark:text-white mb-2">{item.title}</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-green-600">${item.price}</span>
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-bold">{item.condition}</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* High Value Notice */}
                        {highValue && (
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-orange-500 rounded-lg">
                                        <Shield className="text-white" size={20}/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-orange-800 dark:text-orange-300 mb-1">Safe Exchange Protection</h4>
                                        <p className="text-sm text-orange-700 dark:text-orange-400 mb-3">
                                            High-value items (${HIGH_VALUE_THRESHOLD}+) require in-person exchange at a verified safe location.
                                        </p>
                                        <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-1">
                                            <li className="flex items-center gap-1"><Lock size={12}/> Payment held in escrow until exchange</li>
                                            <li className="flex items-center gap-1"><MapPin size={12}/> Meet at police station or safe zone</li>
                                            <li className="flex items-center gap-1"><Camera size={12}/> Photo verification required</li>
                                            <li className="flex items-center gap-1"><CheckCircle size={12}/> Both parties must approve</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Seller Info */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                            {item.sellerPhoto ? (
                                <img src={item.sellerPhoto} className="w-10 h-10 rounded-full bg-gray-300 object-cover"/>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                    {item.sellerName?.[0]}
                                </div>
                            )}
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Seller</div>
                                <div className="font-bold dark:text-white text-sm">{item.sellerName}</div>
                            </div>
                        </div>

                        {/* Fulfillment Method */}
                        <div className={`p-3 rounded-xl border ${highValue 
                            ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800' 
                            : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'}`}
                        >
                            <div className="flex items-center gap-2">
                                {highValue ? (
                                    <>
                                        <MapPin className="text-orange-600" size={18}/>
                                        <span className="font-bold text-orange-700 dark:text-orange-400">Local Pickup Only</span>
                                    </>
                                ) : (
                                    <>
                                        <Truck className="text-green-600" size={18}/>
                                        <span className="font-bold text-green-700 dark:text-green-400">Shipping Available</span>
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {highValue 
                                    ? 'You will coordinate a meetup at a verified safe exchange zone'
                                    : item.location || 'Contact seller for shipping details'}
                            </p>
                        </div>

                        {/* Condition Notes */}
                        {item.conditionReport?.notes && (
                            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-800/50">
                                <h4 className="font-bold text-orange-800 dark:text-orange-400 text-sm mb-2 flex items-center gap-2">
                                    <Wrench size={16}/> Tech Notes
                                </h4>
                                <p className="text-sm text-orange-900 dark:text-orange-200 italic">"{item.conditionReport.notes}"</p>
                            </div>
                        )}

                        <div className="prose dark:prose-invert text-sm text-gray-600 dark:text-gray-300">
                            <h4 className="font-bold dark:text-white text-sm uppercase">Description</h4>
                            <p>{item.description || "No description provided."}</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t dark:border-gray-700">
                        {item.sellerId === currentUser.uid ? (
                            <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold py-3 rounded-xl cursor-not-allowed">You own this listing</button>
                        ) : (
                            <button 
                                onClick={handlePurchase}
                                disabled={isPurchasing}
                                className={`w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${
                                    highValue 
                                        ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white' 
                                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                                }`}
                            >
                                {isPurchasing ? (
                                    <Loader2 className="animate-spin" size={20}/>
                                ) : highValue ? (
                                    <>
                                        <Shield size={20}/> Initiate Safe Exchange
                                    </>
                                ) : (
                                    <>
                                        <DollarSign size={20}/> Buy Now
                                    </>
                                )}
                            </button>
                        )}
                        <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                            {highValue ? (
                                <>
                                    <Lock size={10}/> Funds held in escrow • GPS verified exchange • Dual approval release
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={10}/> Purchases covered by SeshNx Buyer Protection
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
