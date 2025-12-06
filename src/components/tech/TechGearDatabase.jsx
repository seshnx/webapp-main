import React, { useState, useEffect } from 'react';
import { 
    collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, 
    doc, updateDoc, setDoc, arrayUnion, increment 
} from 'firebase/firestore';
import { 
    Database, CheckCircle, Loader2, User, ThumbsUp, ThumbsDown, Copy 
} from 'lucide-react';
import { db, getPaths, appId } from '../../config/firebase';
import { EQUIP_CATEGORIES } from '../../config/constants';

export default function TechGearDatabase({ user, isTech }) {
    const [view, setView] = useState('feed'); 
    const [pendingItems, setPendingItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, getPaths(user.uid).equipmentSubmissions), 
            where('status', '==', 'pending'),
            orderBy('timestamp', 'desc'),
            limit(20)
        );
        const unsub = onSnapshot(q, (snap) => {
            setPendingItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return () => unsub();
    }, [user.uid]);

    const handleVote = async (itemId, voteType, currentData) => {
        if (!isTech) return alert("Only verified Technicians can vote on gear accuracy.");
        
        try {
            const itemRef = doc(db, getPaths(user.uid).equipmentSubmissions, itemId);
            const userVoteField = `votes.${voteType}`;
            
            await updateDoc(itemRef, { [userVoteField]: arrayUnion(user.uid) });

            const YES_THRESHOLD = 3;
            const REJECT_THRESHOLD = 3;

            const yesVotes = (currentData.votes?.yes?.length || 0) + (voteType === 'yes' ? 1 : 0);
            const fakeVotes = (currentData.votes?.fake?.length || 0) + (voteType === 'fake' ? 1 : 0);
            const dupVotes = (currentData.votes?.duplicate?.length || 0) + (voteType === 'duplicate' ? 1 : 0);

            if (yesVotes >= YES_THRESHOLD) {
                const realDbRef = doc(db, `artifacts/${appId}/public/data/equipment_database/${currentData.category}/items`, currentData.model.replace(/\s+/g, '_'));
                await setDoc(realDbRef, {
                    name: currentData.model,
                    brand: currentData.brand,
                    category: currentData.category,
                    subCategory: currentData.subCategory,
                    specs: currentData.specs,
                    verifiedBy: arrayUnion(user.uid),
                    addedBy: currentData.submittedBy,
                    addedAt: serverTimestamp()
                });
                
                await updateDoc(itemRef, { status: 'approved' });
                await updateDoc(doc(db, getPaths(currentData.submittedBy).userWallet), { balance: increment(50) });
                await updateDoc(doc(db, getPaths(user.uid).userWallet), { balance: increment(5) });
                alert("Consensus reached! Item approved and rewards distributed.");

            } else if (fakeVotes >= REJECT_THRESHOLD || dupVotes >= REJECT_THRESHOLD) {
                await updateDoc(itemRef, { status: 'rejected' });
            }
        } catch (e) { console.error("Voting failed:", e); }
    };

    return (
        <div className="animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold dark:text-white flex items-center gap-2"><Database className="text-orange-500"/> Gear Knowledge Base</h3>
                    <p className="text-sm text-gray-500">Crowdsourced equipment specs verified by pros.</p>
                </div>
                <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button onClick={() => setView('feed')} className={`px-4 py-2 rounded-md text-xs font-bold transition ${view === 'feed' ? 'bg-white dark:bg-gray-600 shadow text-orange-600 dark:text-orange-400' : 'text-gray-500'}`}>The Bench (Queue)</button>
                    <button onClick={() => setView('submit')} className={`px-4 py-2 rounded-md text-xs font-bold transition ${view === 'submit' ? 'bg-white dark:bg-gray-600 shadow text-orange-600 dark:text-orange-400' : 'text-gray-500'}`}>Submit New Gear</button>
                </div>
            </div>

            {view === 'feed' && (
                <div className="grid grid-cols-1 gap-4">
                    {loading ? <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/></div> : 
                     pendingItems.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed dark:border-gray-700 rounded-xl">
                            <CheckCircle size={48} className="mx-auto text-green-500 mb-2 opacity-50"/>
                            <p className="text-gray-500">The bench is clear. No pending submissions.</p>
                        </div>
                     ) : (
                        pendingItems.map(item => (
                            <div key={item.id} className="bg-white dark:bg-[#2c2e36] p-5 rounded-xl border dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500">{item.brand}</span>
                                        <span className="text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded">{item.category?.replace(/_/g, ' ')}</span>
                                    </div>
                                    <h4 className="text-lg font-extrabold dark:text-white mb-2">{item.model}</h4>
                                    <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 mb-2 border dark:border-gray-700">{item.specs}</div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1"><User size={12}/> Submitted by {item.submitterName || 'Unknown'} • 50 TK Reward Pending</div>
                                </div>
                                <div className="w-full md:w-48 flex flex-col justify-center gap-2 border-l dark:border-gray-700 pl-0 md:pl-6">
                                    <button onClick={() => handleVote(item.id, 'yes', item)} disabled={item.votes?.yes?.includes(user.uid)} className="w-full py-2 bg-green-100 dark:bg-green-900/20 hover:bg-green-200 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"><ThumbsUp size={14}/> Yes ({item.votes?.yes?.length || 0})</button>
                                    <button onClick={() => handleVote(item.id, 'fake', item)} disabled={item.votes?.fake?.includes(user.uid)} className="w-full py-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 text-red-700 dark:text-red-400 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"><ThumbsDown size={14}/> Fake ({item.votes?.fake?.length || 0})</button>
                                    <button onClick={() => handleVote(item.id, 'duplicate', item)} disabled={item.votes?.duplicate?.includes(user.uid)} className="w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"><Copy size={14}/> Dup ({item.votes?.duplicate?.length || 0})</button>
                                </div>
                            </div>
                        ))
                     )}
                </div>
            )}

            {view === 'submit' && <GearSubmissionForm user={user} userData={userData} onSuccess={() => setView('feed')} />}
        </div>
    );
}

function GearSubmissionForm({ user, userData, onSuccess }) {
    const [form, setForm] = useState({ brand: '', model: '', category: EQUIP_CATEGORIES[0].id, subCategory: '', specs: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!form.brand || !form.model || !form.specs) return alert("All fields required.");
        setSubmitting(true);
        try {
            await addDoc(collection(db, getPaths(user.uid).equipmentSubmissions), {
                ...form,
                submittedBy: user.uid,
                submitterName: `${userData.firstName} ${userData.lastName}`,
                status: 'pending',
                timestamp: serverTimestamp(),
                votes: { yes: [], fake: [], duplicate: [] }
            });
            alert("Submission Received! You'll earn 50 TK once verified.");
            onSuccess();
        } catch (e) { console.error(e); alert("Submission failed."); }
        setSubmitting(false);
    };

    return (
        <div className="max-w-xl mx-auto bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border border-orange-200 dark:border-gray-700 shadow-lg">
            <h4 className="font-bold text-lg dark:text-white mb-4">Submit New Equipment</h4>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Category</label>
                        <select className="w-full p-2 border rounded dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                            {EQUIP_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Sub-Category</label><input className="w-full p-2 border rounded dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" placeholder="e.g. Compressor" value={form.subCategory} onChange={e => setForm({...form, subCategory: e.target.value})}/></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Brand</label><input className="w-full p-2 border rounded dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" placeholder="e.g. Neve" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}/></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Model</label><input className="w-full p-2 border rounded dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" placeholder="e.g. 1073LB" value={form.model} onChange={e => setForm({...form, model: e.target.value})}/></div>
                </div>
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Specs / Description</label><textarea className="w-full p-2 border rounded dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm h-24" placeholder="Brief technical specs..." value={form.specs} onChange={e => setForm({...form, specs: e.target.value})}/></div>
                <button onClick={handleSubmit} disabled={submitting} className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-bold hover:bg-orange-700 flex items-center justify-center gap-2">{submitting ? <Loader2 className="animate-spin"/> : "Submit for Verification"}</button>
            </div>
        </div>
    );
}
