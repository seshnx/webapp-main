import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wrench, Settings, Search } from 'lucide-react';
import TechServiceBoard from './tech/TechServiceBoard';
import TechSearch from './tech/TechSearch';
import TechBookingFlow from './tech/TechBookingFlow';
import TechGearDatabase from './tech/TechGearDatabase';
import type { UserData } from '../types';

/**
 * Tech service tabs - Streamlined to 3 tabs
 */
export type TechTab = 'board' | 'search' | 'database';

/**
 * Props for TechServices component
 */
export interface TechServicesProps {
    /** Current authenticated user */
    user: any;
    /** Current user's profile data */
    userData: UserData | null;
    /** Callback to open a public profile modal */
    openPublicProfile: (userId: string) => void;
}

/**
 * TechServices Component
 *
 * Streamlined hub for technician services with 3 tabs:
 * - Job Board: Browse open service requests
 * - Find a Tech: Search and hire technicians
 * - Gear DB: Equipment database and submissions
 *
 * @example
 * <TechServices
 *   user={currentUser}
 *   userData={userData}
 *   openPublicProfile={(userId) => setShowProfileModal(userId)}
 * />
 */
export default function TechServices({ user, userData, openPublicProfile }: TechServicesProps) {
    const location = useLocation();
    const navigate = useNavigate();

    // Get active tab from URL path
    const getTabFromPath = (path: string): TechTab => {
        const parts = path.split('/').filter(Boolean);
        if (parts[0] === 'tech' && parts[1]) {
            return parts[1] as TechTab;
        }
        return 'board';
    };

    const [activeTab, setActiveTab] = useState<TechTab>(() => getTabFromPath(location.pathname));
    const [selectedTechForBooking, setSelectedTechForBooking] = useState<any>(null);

    // Sync URL with active tab
    useEffect(() => {
        const currentPath = `/tech/${activeTab}`;
        if (location.pathname !== currentPath) {
            navigate(currentPath, { replace: true });
        }
    }, [activeTab, navigate, location.pathname]);

    // Update tab when URL changes
    useEffect(() => {
        const tabFromPath = getTabFromPath(location.pathname);
        if (tabFromPath !== activeTab) {
            setActiveTab(tabFromPath);
        }
    }, [location.pathname]);

    const handleRequestService = (tech: any) => {
        setSelectedTechForBooking(tech);
    };

    return (
        <div className="max-w-6xl mx-auto gap-fluid pb-20 container-fluid">
            <div className="bg-gradient-to-r from-orange-900 to-slate-900 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-end">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-orange-400 font-bold uppercase tracking-widest text-xs mb-2"><Wrench size={14}/> SeshNx Technical</div>
                    <h1 className="text-3xl font-extrabold mb-2">Studio Tech Services</h1>
                    <p className="text-slate-300 max-w-lg">Hire professionals for equipment repair, studio wiring, and acoustic calibration.</p>
                </div>
                <div className="flex flex-wrap gap-2 relative z-10 mt-4 md:mt-0">
                    <button onClick={() => setActiveTab('board')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'board' ? 'bg-orange-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>Job Board</button>
                    <button onClick={() => setActiveTab('search')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'search' ? 'bg-orange-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>Find a Tech</button>
                    <button onClick={() => setActiveTab('database')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'database' ? 'bg-orange-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>Gear DB</button>
                </div>
                <Settings size={200} className="absolute -right-10 -top-10 text-white opacity-5 rotate-12 pointer-events-none"/>
            </div>
            <div className="min-h-[400px]">
                {activeTab === 'board' && <TechServiceBoard user={user} userData={userData} />}
                {activeTab === 'search' && (
                    <TechSearch
                        user={user}
                        userData={userData}
                        openPublicProfile={openPublicProfile}
                        onRequestService={handleRequestService}
                    />
                )}
                {activeTab === 'database' && <TechGearDatabase user={user} isTech={userData?.accountTypes?.includes('Technician')} />}
            </div>

            {/* Booking Flow Modal */}
            {selectedTechForBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1f2128] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <TechBookingFlow
                            tech={selectedTechForBooking}
                            user={user}
                            userData={userData}
                            onSuccess={() => {
                                setSelectedTechForBooking(null);
                                setActiveTab('board');
                            }}
                            onCancel={() => setSelectedTechForBooking(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
