import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { User, MessageCircle } from 'lucide-react';
import { db, appId } from '../../config/firebase';
import { SERVICE_CATALOGUE } from '../../config/constants';

export default function ServiceJobBoard({ user }) {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const q = query(collection(db, `artifacts/${appId}/public/data/service_requests`), orderBy('timestamp', 'desc'), limit(50));
        const unsub = onSnapshot(q, (snap) => setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        return () => unsub();
    }, []);

    return (
        <div className="animate-in fade-in">
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
                <button onClick={() => setFilter('All')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition ${filter === 'All' ? 'bg-orange-500 text-white border-orange-600' : 'bg-white dark:bg-dark-card border-gray-200 dark:border-gray-700 dark:text-gray-300'}`}>All Jobs</button>
                {SERVICE_CATALOGUE.map(cat => (
                    <button key={cat.id} onClick={() => setFilter(cat.label)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition ${filter === cat.label ? 'bg-orange-500 text-white border-orange-600' : 'bg-white dark:bg-dark-card border-gray-200 dark:border-gray-700 dark:text-gray-300'}`}>
                        {cat.label}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.filter(r => filter === 'All' || r.category === filter).map(req => (
                    <div key={req.id} className="bg-white dark:bg-[#2c2e36] p-5 rounded-xl border dark:border-gray-700 hover:border-orange-400 transition shadow-sm group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">{req.category}</span>
                            {req.budget && <span className="text-sm font-bold text-green-600 dark:text-green-400">${req.budget}</span>}
                        </div>
                        <h3 className="font-bold text-lg dark:text-white mb-1">{req.topic}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">{req.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 border-t dark:border-gray-700 pt-3">
                            <div className="flex items-center gap-2"><User size={12}/> {req.userName}</div>
                            {req.userId !== user.uid && <button className="bg-gray-900 dark:bg-white dark:text-black text-white px-3 py-1.5 rounded font-bold hover:opacity-80 flex items-center gap-1"><MessageCircle size={12}/> Message</button>}
                        </div>
                    </div>
                ))}
                {requests.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No active requests.</div>}
            </div>
        </div>
    );
}
