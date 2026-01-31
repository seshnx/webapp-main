import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wrench, Settings } from 'lucide-react';
import ServiceJobBoard from './tech/ServiceJobBoard';
import TechDirectory from './tech/TechDirectory';
import TechBroadcastBuilder from './tech/TechBroadcastBuilder';
import TechGearDatabase from './tech/TechGearDatabase';
import TechProfileEditor from './tech/TechProfileEditor';

export default function TechServices({ user, userData, openPublicProfile }) {
    const location = useLocation();
    const navigate = useNavigate();

    // Get active tab from URL path
    const getTabFromPath = (path) => {
        const parts = path.split('/').filter(Boolean);
        if (parts[0] === 'tech' && parts[1]) {
            return parts[1];
        }
        return 'board';
    };

    const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));
    const isTech = userData?.accountTypes?.includes('Technician');

    // Sync URL with active tab
    useEffect(() => {
        const currentPath = `/tech/${activeTab}`;
        if (location.pathname !== currentPath) {
            navigate(currentPath, { replace: true });
        }
    }, [activeTab]);

    // Update tab when URL changes
    useEffect(() => {
        const tabFromPath = getTabFromPath(location.pathname);
        if (tabFromPath !== activeTab) {
            setActiveTab(tabFromPath);
        }
    }, [location.pathname]);

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
                    <button onClick={() => setActiveTab('directory')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'directory' ? 'bg-orange-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>Find a Tech</button>
                    <button onClick={() => setActiveTab('broadcast')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'broadcast' ? 'bg-orange-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>Post Request</button>
                    <button onClick={() => setActiveTab('database')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'database' ? 'bg-orange-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>Gear DB</button>
                    {isTech && <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'profile' ? 'bg-orange-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>Tech Portal</button>}
                </div>
                <Settings size={200} className="absolute -right-10 -top-10 text-white opacity-5 rotate-12 pointer-events-none"/>
            </div>
            <div className="min-h-[400px]">
                {activeTab === 'board' && <ServiceJobBoard user={user} />}
                {activeTab === 'directory' && <TechDirectory user={user} userData={userData} openPublicProfile={openPublicProfile} />}
                {activeTab === 'broadcast' && <TechBroadcastBuilder user={user} userData={userData} onSuccess={() => setActiveTab('board')} onCancel={() => setActiveTab('board')} />}
                {activeTab === 'database' && <TechGearDatabase user={user} isTech={isTech} />}
                {activeTab === 'profile' && isTech && <TechProfileEditor user={user} />}
            </div>
        </div>
    );
}
