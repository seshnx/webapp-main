import React, { useState, useEffect } from 'react';
import { User, MessageCircle, LucideIcon } from 'lucide-react';
import { SERVICE_CATALOGUE } from '../../config/constants';

/**
 * Service request data interface
 */
export interface ServiceRequest {
    id: string;
    category: string;
    topic: string;
    description: string;
    budget?: string;
    userId: string;
    userName: string;
    timestamp: string;
    [key: string]: any;
}

/**
 * Props for ServiceJobBoard component
 */
export interface ServiceJobBoardProps {
    user?: any;
}

/**
 * ServiceJobBoard - Job board for technician service requests
 * TODO: Migrate to Neon database - currently disabled
 */
export default function ServiceJobBoard({ user }: ServiceJobBoardProps) {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [filter, setFilter] = useState<string>('All');

    useEffect(() => {
        // TODO: Implement Neon query for service_requests table
        console.warn('ServiceJobBoard: Neon database integration not yet implemented');

        // Placeholder: Return empty array until migration is complete
        setRequests([]);
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
                            {req.userId !== (user?.id || user?.uid) && <button className="bg-gray-900 dark:bg-white dark:text-black text-white px-3 py-1.5 rounded font-bold hover:opacity-80 flex items-center gap-1"><MessageCircle size={12}/> Message</button>}
                        </div>
                    </div>
                ))}
                {requests.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        <p>No active service requests.</p>
                        <p className="text-xs mt-2">Service board will be available once Neon migration is complete.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
