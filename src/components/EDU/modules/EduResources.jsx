import React, { useState, useEffect } from 'react';
import { 
    collection, getDocs, addDoc, deleteDoc, doc 
} from 'firebase/firestore';
import { Lock, Plus, Trash2 } from 'lucide-react';
import { db } from '../../../config/firebase';

export default function EduResources({ schoolId, logAction }) {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [ruleForm, setRuleForm] = useState({ 
        resource: '', 
        limit: 4, 
        unit: 'hours/week', 
        role: 'Student' 
    });

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchRules = async () => {
            setLoading(true);
            try {
                const snap = await getDocs(collection(db, `schools/${schoolId}/rules`));
                setRules(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (e) {
                console.error("Error loading rules:", e);
            }
            setLoading(false);
        };
        if (schoolId) fetchRules();
    }, [schoolId]);

    // --- ACTIONS ---

    const handleAddRule = async () => {
        if (!ruleForm.resource) return alert("Resource name required.");
        
        try {
            const docRef = await addDoc(collection(db, `schools/${schoolId}/rules`), ruleForm);
            const newRule = { id: docRef.id, ...ruleForm };
            
            setRules(prev => [...prev, newRule]);
            await logAction('Add Resource Rule', `Set ${ruleForm.limit} ${ruleForm.unit} limit for ${ruleForm.resource}`);
            
            // Reset default
            setRuleForm({ resource: '', limit: 4, unit: 'hours/week', role: 'Student' });
        } catch (e) {
            console.error("Add rule failed:", e);
        }
    };

    const handleDeleteRule = async (id, resourceName) => {
        if(!confirm("Delete this rule?")) return;
        try {
            await deleteDoc(doc(db, `schools/${schoolId}/rules/${id}`));
            setRules(prev => prev.filter(r => r.id !== id));
            await logAction('Delete Rule', `Removed rule for ${resourceName}`);
        } catch (e) {
            console.error("Delete failed:", e);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Rules...</div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Add Rule Form */}
            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-sm">
                <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                    <Lock size={18} className="text-indigo-600"/> Add Restriction / Quota
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Resource Name</label>
                        <input 
                            className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" 
                            placeholder="e.g. Studio A, SSL Room" 
                            value={ruleForm.resource} 
                            onChange={e => setRuleForm({...ruleForm, resource: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Limit</label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                className="w-20 p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" 
                                value={ruleForm.limit} 
                                onChange={e => setRuleForm({...ruleForm, limit: e.target.value})}
                            />
                            <select 
                                className="flex-1 p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm"
                                value={ruleForm.unit}
                                onChange={e => setRuleForm({...ruleForm, unit: e.target.value})}
                            >
                                <option value="hours/week">Hrs/Wk</option>
                                <option value="hours/term">Hrs/Term</option>
                                <option value="bookings/week">Bookings/Wk</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={handleAddRule} 
                            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
                        >
                            <Plus size={18}/> Add Rule
                        </button>
                    </div>
                </div>
                <div className="mt-3">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Applies To Role</label>
                    <select 
                        className="w-full md:w-1/2 p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white"
                        value={ruleForm.role}
                        onChange={e => setRuleForm({...ruleForm, role: e.target.value})}
                    >
                        <option value="Student">All Students</option>
                        <option value="Senior">Seniors Only</option>
                        <option value="Junior">Juniors Only</option>
                        <option value="Probation">Probationary</option>
                    </select>
                </div>
            </div>

            {/* Rules List */}
            <div className="space-y-3">
                {rules.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 border-2 border-dashed dark:border-gray-700 rounded-xl">
                        No active restrictions. Students have default access.
                    </div>
                ) : (
                    rules.map(r => (
                        <div key={r.id} className="bg-white dark:bg-[#2c2e36] p-4 rounded-xl border dark:border-gray-700 flex justify-between items-center shadow-sm hover:shadow-md transition">
                            <div>
                                <h4 className="font-bold dark:text-white text-lg">{r.resource}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                                        {r.limit} {r.unit}
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span>Applies to: <strong>{r.role}</strong></span>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDeleteRule(r.id, r.resource)} 
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            >
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
