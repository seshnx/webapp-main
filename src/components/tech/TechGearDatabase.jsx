import React, { useState } from 'react';
import {
    Database, CheckCircle, Loader2, User, ThumbsUp, ThumbsDown, Copy, Plus, Cpu
} from 'lucide-react';
import { EQUIP_CATEGORIES } from '../../config/constants';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import toast from 'react-hot-toast';

export default function TechGearDatabase({ user, userData, isTech }) {
    const [view, setView] = useState('feed');

    const pendingItems = useQuery(api.equipment.getPendingEquipmentSubmissions, { limit: 50 });
    const voteMutation = useMutation(api.equipment.voteEquipmentSubmission);

    const userId = user?.id || user?.uid || userData?.clerkId;
    const isTechnician = isTech ?? Boolean(userData?.accountTypes?.includes('Technician') || userData?.isTechnician);

    const handleVote = async (itemId, voteType, currentVotes) => {
        if (!isTechnician) {
            toast.error("Only verified Technicians can vote on gear accuracy.");
            return;
        }

        if (!userId) {
            toast.error("Please sign in to vote.");
            return;
        }

        const existingVoters = [
            ...(currentVotes?.yes || []),
            ...(currentVotes?.fake || []),
            ...(currentVotes?.duplicate || []),
        ];

        if (existingVoters.includes(userId)) {
            toast.error("You have already voted on this item.");
            return;
        }

        try {
            const res = await voteMutation({
                submissionId: itemId,
                voteType,
                voterId: userId,
            });

            if (res.status === 'approved') {
                toast.success("Consensus reached! Item approved and added to database.");
            } else if (res.status === 'rejected') {
                toast.success("Submission marked as rejected by community votes.");
            } else {
                toast.success("Vote recorded!");
            }
        } catch (e) {
            console.error("Voting failed:", e);
            toast.error(e.message || "Voting failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Database className="text-orange-500" /> Gear Knowledge Base
                    </h3>
                    <p className="text-sm text-gray-500">Crowdsourced equipment specs verified by audio professionals.</p>
                </div>
                <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setView('feed')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                            view === 'feed'
                                ? 'bg-white dark:bg-[#1f2128] shadow text-orange-600 dark:text-orange-400'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        The Bench ({pendingItems?.length || 0})
                    </button>
                    <button
                        onClick={() => setView('submit')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            view === 'submit'
                                ? 'bg-white dark:bg-[#1f2128] shadow text-orange-600 dark:text-orange-400'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <Plus size={13} /> Submit New Gear
                    </button>
                </div>
            </div>

            {view === 'feed' && (
                <div className="grid grid-cols-1 gap-4">
                    {pendingItems === undefined ? (
                        <div className="p-12 text-center">
                            <Loader2 className="animate-spin mx-auto text-orange-500 w-8 h-8" />
                            <p className="text-xs text-gray-500 mt-2">Loading submissions queue...</p>
                        </div>
                    ) : pendingItems.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white/50 dark:bg-[#1f2128]/50">
                            <CheckCircle size={48} className="mx-auto text-emerald-500 mb-2 opacity-60" />
                            <h4 className="font-bold dark:text-white text-sm">The bench is clear</h4>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                                No pending equipment submissions waiting for verification. Be the first to add new gear to the knowledge base!
                            </p>
                            <button
                                onClick={() => setView('submit')}
                                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition"
                            >
                                Submit Hardware
                            </button>
                        </div>
                    ) : (
                        pendingItems.map((item) => {
                            const userHasVoted = Boolean(
                                userId && (
                                    item.votes?.yes?.includes(userId) ||
                                    item.votes?.fake?.includes(userId) ||
                                    item.votes?.duplicate?.includes(userId)
                                )
                            );

                            return (
                                <div
                                    key={item._id}
                                    className="bg-white dark:bg-[#1f2128] p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col md:flex-row gap-6 justify-between"
                                >
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full text-gray-600 dark:text-gray-300">
                                                {item.brand}
                                            </span>
                                            <span className="text-[10px] font-black uppercase bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-2.5 py-0.5 rounded-full">
                                                {item.category?.replace(/_/g, ' ')}
                                            </span>
                                            {item.subcategory && (
                                                <span className="text-[10px] text-gray-400 font-semibold">
                                                    • {item.subcategory}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-lg font-black dark:text-white">{item.model}</h4>
                                        <div className="bg-gray-50 dark:bg-[#252830] p-3.5 rounded-2xl text-xs text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
                                            {item.specs}
                                        </div>
                                        <div className="text-xs text-gray-400 flex items-center gap-1.5 pt-1">
                                            <User size={13} />
                                            <span>Submitted by {item.submitterName || 'Contributor'}</span>
                                            <span>•</span>
                                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-52 flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6 shrink-0">
                                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center md:text-left mb-1">
                                            Peer Verification
                                        </div>
                                        <button
                                            onClick={() => handleVote(item._id, 'yes', item.votes)}
                                            disabled={userHasVoted}
                                            className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                                        >
                                            <ThumbsUp size={14} /> Accurate ({item.votes?.yes?.length || 0}/3)
                                        </button>
                                        <button
                                            onClick={() => handleVote(item._id, 'fake', item.votes)}
                                            disabled={userHasVoted}
                                            className="w-full py-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-700 dark:text-red-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                                        >
                                            <ThumbsDown size={14} /> Inaccurate ({item.votes?.fake?.length || 0}/3)
                                        </button>
                                        <button
                                            onClick={() => handleVote(item._id, 'duplicate', item.votes)}
                                            disabled={userHasVoted}
                                            className="w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                                        >
                                            <Copy size={14} /> Duplicate ({item.votes?.duplicate?.length || 0}/3)
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {view === 'submit' && (
                <GearSubmissionForm
                    user={user}
                    userData={userData}
                    onSuccess={() => setView('feed')}
                />
            )}
        </div>
    );
}

function GearSubmissionForm({ user, userData, onSuccess }) {
    const createSubmissionMutation = useMutation(api.equipment.createEquipmentSubmission);

    const [form, setForm] = useState({
        brand: '',
        model: '',
        category: EQUIP_CATEGORIES?.[0]?.id || 'preamps',
        subCategory: '',
        specs: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!form.brand.trim() || !form.model.trim() || !form.specs.trim()) {
            toast.error("Please fill in Brand, Model, and Specs.");
            return;
        }

        const userId = user?.id || user?.uid || userData?.clerkId;
        if (!userId) {
            toast.error("Please log in to submit equipment.");
            return;
        }

        setSubmitting(true);
        try {
            const submitterName = userData?.displayName ||
                userData?.profileName ||
                `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() ||
                user?.displayName ||
                'Audio Engineer';

            await createSubmissionMutation({
                brand: form.brand.trim(),
                model: form.model.trim(),
                category: form.category,
                subcategory: form.subCategory.trim() || undefined,
                specs: form.specs.trim(),
                submittedBy: userId,
                submitterName: submitterName,
            });

            toast.success("Equipment submitted! It will appear on The Bench for peer verification.");
            onSuccess();
        } catch (e) {
            console.error(e);
            toast.error(e.message || "Failed to submit equipment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white dark:bg-[#1f2128] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-4">
            <div>
                <h4 className="font-black text-lg dark:text-white flex items-center gap-2">
                    <Cpu className="text-orange-500" size={20} /> Submit Equipment to Database
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                    Help build the open audio hardware directory. Fellow technicians will verify your entry.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Category *</label>
                        <select
                            className="w-full p-2.5 border rounded-xl dark:bg-[#252830] dark:border-gray-700 dark:text-white text-xs"
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                        >
                            {(EQUIP_CATEGORIES || []).map(c => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Sub-Category</label>
                        <input
                            className="w-full p-2.5 border rounded-xl dark:bg-[#252830] dark:border-gray-700 dark:text-white text-xs placeholder-gray-400"
                            placeholder="e.g. Optical Compressor"
                            value={form.subCategory}
                            onChange={e => setForm({ ...form, subCategory: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Brand *</label>
                        <input
                            required
                            className="w-full p-2.5 border rounded-xl dark:bg-[#252830] dark:border-gray-700 dark:text-white text-xs placeholder-gray-400"
                            placeholder="e.g. Teletronix / Neve"
                            value={form.brand}
                            onChange={e => setForm({ ...form, brand: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Model *</label>
                        <input
                            required
                            className="w-full p-2.5 border rounded-xl dark:bg-[#252830] dark:border-gray-700 dark:text-white text-xs placeholder-gray-400"
                            placeholder="e.g. LA-2A"
                            value={form.model}
                            onChange={e => setForm({ ...form, model: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Specs / Technical Notes *</label>
                    <textarea
                        required
                        className="w-full p-2.5 border rounded-xl dark:bg-[#252830] dark:border-gray-700 dark:text-white text-xs h-24 placeholder-gray-400"
                        placeholder="Tube complement, frequency response, input transformer type, common failure modes..."
                        value={form.specs}
                        onChange={e => setForm({ ...form, specs: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : "Submit for Verification"}
                </button>
            </form>
        </div>
    );
}
