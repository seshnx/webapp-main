import React, { useState, useEffect } from 'react';
import { 
    ChevronRight, ChevronLeft, Upload, Music, Image as ImageIcon, 
    CheckCircle, AlertCircle, Loader2, Info, X, Calendar 
} from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { DDEX_GENRES, DISTRIBUTION_STORES, RELEASE_TYPES } from '../../config/constants';

// --- SUB-COMPONENTS FOR STEPS ---

const Step1Metadata = ({ data, setData }) => (
    <div className="space-y-4 animate-in slide-in-from-right-4">
        <h3 className="text-lg font-bold dark:text-white mb-4">Release Essentials</h3>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Release Title</label>
                <input className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={data.title} onChange={e => setData({...data, title: e.target.value})} placeholder="e.g. Dark Side of the Moon"/>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Primary Artist</label>
                <input className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={data.primaryArtist} onChange={e => setData({...data, primaryArtist: e.target.value})} placeholder="e.g. Pink Floyd"/>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Release Type</label>
                <select className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={data.type} onChange={e => setData({...data, type: e.target.value})}>
                    {RELEASE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Primary Genre</label>
                <select className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={data.genre} onChange={e => setData({...data, genre: e.target.value})}>
                    <option value="">Select Genre...</option>
                    {DDEX_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Release Date</label>
                <input type="date" className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={data.releaseDate} onChange={e => setData({...data, releaseDate: e.target.value})} />
                <p className="text-[10px] text-gray-400 mt-1">Standard: 2 weeks out. Express: 48hrs.</p>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Label Name</label>
                <input className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={data.labelName} onChange={e => setData({...data, labelName: e.target.value})} placeholder="Optional (Default: Independent)" />
            </div>
        </div>
    </div>
);

const Step2Artwork = ({ data, setData, user }) => {
    const { uploadMedia: uploadImage, uploading } = useMediaUpload(); 
    const [preview, setPreview] = useState(data.artworkUrl || null);
    const [validationMsg, setValidationMsg] = useState('');

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Client-side Validation (3000px check)
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
            if (img.width < 3000 || img.height < 3000) {
                setValidationMsg("Error: Image must be at least 3000 x 3000 pixels.");
                return;
            }
            if (img.width !== img.height) {
                setValidationMsg("Warning: Image should be a perfect square (1:1 ratio).");
            } else {
                setValidationMsg("");
            }

            // Proceed to upload
            const res = await uploadImage(file, `distribution/${user.uid}/artwork`);
            if (res?.url) {
                setPreview(res.url);
                setData({ ...data, artworkUrl: res.url });
            }
        };
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-6 animate-in slide-in-from-right-4">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-bold dark:text-white">Upload Cover Art</h3>
                <p className="text-sm text-gray-500">3000 x 3000 px • JPG or PNG • No Blurry Text</p>
            </div>

            <div className="relative group w-64 h-64 bg-gray-100 dark:bg-[#1f2128] rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                {preview ? (
                    <img src={preview} className="w-full h-full object-cover" />
                ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                        <ImageIcon size={48} className="mb-2"/>
                        <span className="text-xs font-bold">Click to Upload</span>
                    </div>
                )}
                
                <label className="absolute inset-0 cursor-pointer bg-black/0 hover:bg-black/20 transition flex items-center justify-center">
                    <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFile} disabled={uploading}/>
                    {uploading && <Loader2 className="animate-spin text-white" size={32}/>}
                </label>
            </div>

            {validationMsg && (
                <div className="text-red-500 text-sm font-bold flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                    <AlertCircle size={16}/> {validationMsg}
                </div>
            )}
        </div>
    );
};

const Step3Tracks = ({ data, setData, user }) => {
    const { uploadMedia, uploading } = useMediaUpload();
    
    const addTrack = async (file) => {
        if (!file.name.toLowerCase().endsWith('.wav')) {
            alert("Only .WAV files are accepted for distribution.");
            return;
        }

        const newTrack = {
            id: Date.now(),
            title: file.name.replace('.wav', ''),
            fileUrl: '', // Will be filled after upload
            status: 'uploading',
            isExplicit: false,
            isInstrumental: false
        };

        // Optimistic UI
        const updatedTracks = [...(data.tracks || []), newTrack];
        setData({ ...data, tracks: updatedTracks });

        // Start Upload
        try {
            // Upload to a private "Vault" path
            const res = await uploadMedia(file, `distribution/${user.uid}/audio_vault`);
            if (res?.url) {
                const finalTracks = updatedTracks.map(t => 
                    t.id === newTrack.id ? { ...t, fileUrl: res.url, status: 'ready', duration: 0 } : t
                );
                setData({ ...data, tracks: finalTracks });
            }
        } catch (e) {
            console.error("Track upload failed", e);
            alert("Upload failed.");
        }
    };

    const removeTrack = (id) => {
        setData({ ...data, tracks: data.tracks.filter(t => t.id !== id) });
    };

    const updateTrackMeta = (id, field, val) => {
        setData({
            ...data,
            tracks: data.tracks.map(t => t.id === id ? { ...t, [field]: val } : t)
        });
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-lg font-bold dark:text-white">Upload Audio</h3>
                    <p className="text-sm text-gray-500">Stereo WAV files only (16-bit / 44.1kHz minimum)</p>
                </div>
                <label className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-2 transition">
                    <Upload size={14}/> Add Track
                    <input type="file" className="hidden" accept=".wav" onChange={e => addTrack(e.target.files[0])} disabled={uploading}/>
                </label>
            </div>

            <div className="space-y-3">
                {data.tracks?.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed dark:border-gray-700 rounded-xl text-gray-400">
                        No tracks added yet.
                    </div>
                )}
                
                {data.tracks?.map((track, idx) => (
                    <div key={track.id} className="bg-white dark:bg-[#1f2128] p-4 rounded-xl border dark:border-gray-700 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-500 font-mono text-xs">
                                    #{idx + 1}
                                </div>
                                <div className="font-bold dark:text-white text-sm">
                                    {track.status === 'uploading' ? <span className="flex items-center gap-2 text-brand-blue"><Loader2 className="animate-spin" size={14}/> Uploading...</span> : track.title}
                                </div>
                            </div>
                            <button onClick={() => removeTrack(track.id)} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                        </div>
                        
                        {track.status === 'ready' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <input 
                                    className="col-span-2 p-2 text-xs border rounded bg-transparent dark:border-gray-600 dark:text-white" 
                                    placeholder="Track Title" 
                                    value={track.title} 
                                    onChange={e => updateTrackMeta(track.id, 'title', e.target.value)}
                                />
                                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-800 rounded cursor-pointer">
                                    <input type="checkbox" checked={track.isExplicit} onChange={e => updateTrackMeta(track.id, 'isExplicit', e.target.checked)}/> Explicit
                                </label>
                                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-800 rounded cursor-pointer">
                                    <input type="checkbox" checked={track.isInstrumental} onChange={e => updateTrackMeta(track.id, 'isInstrumental', e.target.checked)}/> Instrumental
                                </label>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const Step4Stores = ({ data, setData }) => {
    const toggleStore = (storeId) => {
        const current = data.stores || [];
        const updated = current.includes(storeId) 
            ? current.filter(s => s !== storeId) 
            : [...current, storeId];
        setData({ ...data, stores: updated });
    };

    const toggleAll = () => {
        if (data.stores?.length === DISTRIBUTION_STORES.length) setData({ ...data, stores: [] });
        else setData({ ...data, stores: DISTRIBUTION_STORES.map(s => s.id) });
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold dark:text-white">Select Stores</h3>
                <button onClick={toggleAll} className="text-xs font-bold text-brand-blue hover:underline">
                    {data.stores?.length === DISTRIBUTION_STORES.length ? 'Deselect All' : 'Select All'}
                </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DISTRIBUTION_STORES.map(store => {
                    const isSelected = data.stores?.includes(store.id);
                    return (
                        <div 
                            key={store.id} 
                            onClick={() => toggleStore(store.id)}
                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-brand-blue dark:bg-blue-900/20' : 'bg-white dark:bg-[#1f2128] dark:border-gray-700 hover:border-gray-300'}`}
                        >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-brand-blue border-brand-blue' : 'border-gray-400'}`}>
                                {isSelected && <CheckCircle size={12} className="text-white"/>}
                            </div>
                            <span className={`text-sm font-bold ${isSelected ? 'text-brand-blue dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{store.name}</span>
                        </div>
                    );
                })}
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-3">
                <Info size={18} className="mt-0.5 shrink-0"/>
                <p>Deliveries usually take 2-5 days for Spotify/Apple, and up to 2 weeks for other stores. Please plan your release date accordingly.</p>
            </div>
        </div>
    );
};

// --- MAIN WIZARD COMPONENT ---

export default function ReleaseBuilder({ user, userData, initialData, onCancel, onSuccess }) {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    
    // Initial State Template
    const [formData, setFormData] = useState(initialData || {
        title: '',
        primaryArtist: `${userData.firstName} ${userData.lastName}`, // Default to user
        type: 'single',
        genre: '',
        releaseDate: '',
        labelName: '',
        artworkUrl: '',
        tracks: [],
        stores: DISTRIBUTION_STORES.map(s => s.id), // Default all selected
        status: 'Draft'
    });

    const isStepValid = () => {
        if (step === 1) return formData.title && formData.primaryArtist && formData.genre && formData.releaseDate;
        if (step === 2) return !!formData.artworkUrl;
        if (step === 3) return formData.tracks.length > 0 && formData.tracks.every(t => t.status === 'ready');
        if (step === 4) return formData.stores.length > 0;
        return true;
    };

    const handleFinalSubmit = async () => {
        if (!supabase) return;
        setSubmitting(true);
        const userId = user?.id || user?.uid;
        try {
            const payload = {
                uploader_id: userId,
                title: formData.title,
                primary_artist: formData.primaryArtist,
                type: formData.type,
                genre: formData.genre,
                release_date: formData.releaseDate,
                label_name: formData.labelName || null,
                artwork_url: formData.artworkUrl || null,
                tracks: formData.tracks || [],
                updated_at: new Date().toISOString(),
                status: 'Processing' // Move to processing queue
            };

            if (initialData?.id) {
                // Update existing
                await supabase
                    .from('distribution_releases')
                    .update(payload)
                    .eq('id', initialData.id)
                    .eq('uploader_id', userId);
            } else {
                // Create new
                await supabase
                    .from('distribution_releases')
                    .insert({
                        ...payload,
                        created_at: new Date().toISOString()
                    });
            }
            
            alert("Release submitted successfully! It is now in the review queue.");
            onSuccess();
        } catch (e) {
            console.error("Submission error:", e);
            alert("Failed to submit release.");
        }
        setSubmitting(false);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-[#2c2e36] rounded-2xl shadow-xl overflow-hidden border dark:border-gray-700 min-h-[600px] flex flex-col">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-[#23262f] p-6 border-b dark:border-gray-700 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-extrabold dark:text-white">New Release</h2>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">Step {step} of 4</p>
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X/></button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-200 dark:bg-gray-700 w-full">
                <div className="h-full bg-brand-blue transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
            </div>

            {/* Body */}
            <div className="flex-1 p-8 overflow-y-auto">
                {step === 1 && <Step1Metadata data={formData} setData={setFormData} />}
                {step === 2 && <Step2Artwork data={formData} setData={setFormData} user={user} />}
                {step === 3 && <Step3Tracks data={formData} setData={setFormData} user={user} />}
                {step === 4 && <Step4Stores data={formData} setData={setFormData} />}
            </div>

            {/* Footer Controls */}
            <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-[#23262f] flex justify-between items-center">
                {step > 1 ? (
                    <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-800 dark:hover:text-white transition">
                        <ChevronLeft size={18}/> Back
                    </button>
                ) : <div></div>}

                {step < 4 ? (
                    <button 
                        onClick={() => setStep(step + 1)} 
                        disabled={!isStepValid()}
                        className="bg-brand-blue text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition"
                    >
                        Next Step <ChevronRight size={18}/>
                    </button>
                ) : (
                    <button 
                        onClick={handleFinalSubmit} 
                        disabled={submitting || !isStepValid()}
                        className="bg-green-600 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 hover:bg-green-700 transition shadow-lg"
                    >
                        {submitting ? <Loader2 className="animate-spin"/> : "Submit Release"}
                    </button>
                )}
            </div>
        </div>
    );
}
