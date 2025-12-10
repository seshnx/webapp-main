import { useState, useEffect } from 'react';
import { 
    Shield, Package, Calendar, Clock, ChevronRight,
    AlertTriangle, CheckCircle, Loader2, User
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';
import { PickupStatusBadge } from './PickupVerification';
import { PICKUP_STATUS } from '../../hooks/usePickupSession';

/**
 * List of pickup sessions for a user (both as buyer and seller)
 */
export default function PickupSessionsList({ userId, onSelectSession }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'buying', 'selling', 'active', 'completed'

    useEffect(() => {
        if (!userId) {
            setSessions([]);
            setLoading(false);
            return;
        }

        // Listen to sessions where user is buyer or seller
        const sessionsRef = collection(db, `artifacts/${appId}/pickupSessions`);
        
        // We'll query for both buyer and seller sessions separately
        const buyerQuery = query(
            sessionsRef,
            where('buyerId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const sellerQuery = query(
            sessionsRef,
            where('sellerId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        let buyerSessions = [];
        let sellerSessions = [];

        const unsubBuyer = onSnapshot(buyerQuery, (snapshot) => {
            buyerSessions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                userRole: 'buyer',
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));
            updateSessions();
        });

        const unsubSeller = onSnapshot(sellerQuery, (snapshot) => {
            sellerSessions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                userRole: 'seller',
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));
            updateSessions();
        });

        const updateSessions = () => {
            // Combine and deduplicate (in case user is both buyer and seller somehow)
            const combined = [...buyerSessions, ...sellerSessions];
            const unique = combined.filter((session, index, self) =>
                index === self.findIndex(s => s.id === session.id)
            );
            // Sort by date
            unique.sort((a, b) => b.createdAt - a.createdAt);
            setSessions(unique);
            setLoading(false);
        };

        return () => {
            unsubBuyer();
            unsubSeller();
        };
    }, [userId]);

    // Filter sessions
    const filteredSessions = sessions.filter(session => {
        if (filter === 'all') return true;
        if (filter === 'buying') return session.userRole === 'buyer';
        if (filter === 'selling') return session.userRole === 'seller';
        if (filter === 'active') return ![PICKUP_STATUS.COMPLETED, PICKUP_STATUS.CANCELLED].includes(session.status);
        if (filter === 'completed') return session.status === PICKUP_STATUS.COMPLETED;
        return true;
    });

    // Stats
    const stats = {
        total: sessions.length,
        active: sessions.filter(s => ![PICKUP_STATUS.COMPLETED, PICKUP_STATUS.CANCELLED].includes(s.status)).length,
        buying: sessions.filter(s => s.userRole === 'buyer').length,
        selling: sessions.filter(s => s.userRole === 'seller').length
    };

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
                        <Shield size={24} className="text-green-500" />
                        Secure Pickups
                    </h2>
                    <p className="text-sm text-gray-500">
                        Manage your high-value item transactions
                    </p>
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                    <div className="text-center px-4">
                        <div className="text-2xl font-bold text-yellow-600">{stats.active}</div>
                        <div className="text-xs text-gray-500">Active</div>
                    </div>
                    <div className="text-center px-4 border-l dark:border-gray-700">
                        <div className="text-2xl font-bold text-blue-600">{stats.buying}</div>
                        <div className="text-xs text-gray-500">Buying</div>
                    </div>
                    <div className="text-center px-4 border-l dark:border-gray-700">
                        <div className="text-2xl font-bold text-green-600">{stats.selling}</div>
                        <div className="text-xs text-gray-500">Selling</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'all', label: 'All Pickups' },
                    { id: 'active', label: 'Active' },
                    { id: 'buying', label: 'Buying' },
                    { id: 'selling', label: 'Selling' },
                    { id: 'completed', label: 'Completed' }
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                            filter === f.id 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Sessions List */}
            {filteredSessions.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700">
                    <Shield size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium dark:text-white mb-2">No pickup sessions</h3>
                    <p className="text-sm text-gray-500">
                        {filter === 'all' 
                            ? 'Purchase or sell high-value items to create secure pickup sessions' 
                            : `No ${filter} pickup sessions`}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredSessions.map((session) => (
                        <PickupSessionCard
                            key={session.id}
                            session={session}
                            onClick={() => onSelectSession?.(session.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Individual pickup session card
 */
function PickupSessionCard({ session, onClick }) {
    const isActive = ![PICKUP_STATUS.COMPLETED, PICKUP_STATUS.CANCELLED].includes(session.status);
    const isBuyer = session.userRole === 'buyer';
    const otherParty = isBuyer 
        ? { name: session.sellerName, photo: session.sellerPhoto, role: 'Seller' }
        : { name: session.buyerName, photo: session.buyerPhoto, role: 'Buyer' };

    const formattedDate = session.createdAt instanceof Date 
        ? session.createdAt.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        })
        : 'Unknown date';

    // Determine what action is needed
    const getActionNeeded = () => {
        const s = session.status;
        if (s === PICKUP_STATUS.COMPLETED) return null;
        if (s === PICKUP_STATUS.CANCELLED) return null;
        
        if (isBuyer) {
            if (s === PICKUP_STATUS.PENDING_DEPOSIT) return 'Pay deposit';
            if (s === PICKUP_STATUS.DEPOSIT_RECEIVED) return 'Schedule pickup';
            if (s === PICKUP_STATUS.SELLER_VERIFIED) return 'Upload verification photos';
            if (s === PICKUP_STATUS.BUYER_VERIFIED && !session.buyerApproved) return 'Approve handover';
            if (s === PICKUP_STATUS.AWAITING_BUYER_APPROVAL) return 'Approve handover';
        } else {
            if (s === PICKUP_STATUS.PICKUP_SCHEDULED && !session.sellerVerification?.completed) return 'Upload condition photos';
            if (s === PICKUP_STATUS.BUYER_VERIFIED && !session.sellerApproved) return 'Approve handover';
            if (s === PICKUP_STATUS.AWAITING_SELLER_APPROVAL) return 'Approve handover';
        }
        return 'View progress';
    };

    const actionNeeded = getActionNeeded();

    return (
        <button
            onClick={onClick}
            className="w-full bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-4 hover:shadow-lg transition text-left"
        >
            <div className="flex items-start gap-4">
                {/* Item Image */}
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0">
                    {session.itemImages?.[0] ? (
                        <img 
                            src={session.itemImages[0]} 
                            alt={session.itemTitle}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold dark:text-white truncate">{session.itemTitle}</h3>
                        <PickupStatusBadge status={session.status} />
                    </div>
                    
                    <div className="text-lg font-bold text-green-600 mb-2">
                        ${session.itemPrice}
                    </div>

                    {/* Other Party */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isBuyer 
                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                                : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        }`}>
                            {isBuyer ? 'BUYING' : 'SELLING'}
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            {otherParty.photo ? (
                                <img src={otherParty.photo} alt="" className="w-4 h-4 rounded-full" />
                            ) : (
                                <User size={12} />
                            )}
                            {otherParty.role}: {otherParty.name}
                        </div>
                    </div>

                    {/* Date and Action */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar size={12} />
                            {session.scheduledDate 
                                ? `Pickup: ${session.scheduledDate?.toDate?.()?.toLocaleDateString?.() || 'Scheduled'}`
                                : `Created: ${formattedDate}`
                            }
                        </div>
                        
                        {actionNeeded && isActive && (
                            <div className="flex items-center gap-1 text-xs font-medium text-brand-blue">
                                <AlertTriangle size={12} />
                                {actionNeeded}
                            </div>
                        )}
                    </div>
                </div>

                <ChevronRight size={20} className="text-gray-400 shrink-0" />
            </div>
        </button>
    );
}
