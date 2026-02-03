import React, { useState } from 'react';
import { Send, Image as ImageIcon, Music, Video, X, Sliders, Paperclip, Loader2 } from 'lucide-react';
import { useVercelUpload } from '../../hooks/useVercelUpload';
import { POPULAR_PLUGINS_LIST } from '../../config/constants';
import { MultiSelect } from '../shared/Inputs';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Media attachment interface
 */
interface MediaAttachment {
    file: File;
    type: 'image' | 'video' | 'audio';
    previewUrl: string;
}

/**
 * Upload progress interface
 */
interface UploadProgress {
    current: number;
    total: number;
    percent: number;
}

/**
 * CreatePostWidget props
 */
export interface CreatePostWidgetProps {
    user?: any;
    userData?: any;
    subProfiles?: Record<string, any>;
    onPost?: (payload: {
        text: string;
        attachments: Array<{ url: string; type: string }>;
        seshFx: {
            plugins: string[];
            presetUrl: string | null;
            presetName: string | null;
        } | null;
    }) => void | Promise<void>;
}

export default function CreatePostWidget({ user, userData, subProfiles = {}, onPost }: CreatePostWidgetProps) {
    const [text, setText] = useState<string>('');
    const [media, setMedia] = useState<MediaAttachment[]>([]); // Array of {file, type, previewUrl}
    const [seshFxOpen, setSeshFxOpen] = useState<boolean>(false);
    const [pluginsUsed, setPluginsUsed] = useState<string[]>([]);
    const [presetFile, setPresetFile] = useState<File | null>(null);
    const [isPosting, setIsPosting] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ current: 0, total: 0, percent: 0 });

    // Get active profile info
    const activeRole = userData?.activeProfileRole || userData?.accountTypes?.[0] || 'Fan';
    const activeProfile = subProfiles?.[activeRole] || {};
    const getDisplayRole = (role: string | undefined): string => {
        if (!role || role === 'User' || role === 'Fan') return role || 'User';
        if (role === 'Talent') {
            const talentSub = subProfiles?.['Talent'];
            const subRole = talentSub?.profile_data?.talentSubRole || talentSub?.talentSubRole;
            if (subRole && subRole !== '') return subRole;
        }
        return role;
    };
    const displayRole = getDisplayRole(activeRole);

    const { uploadMedia } = useVercelUpload('post-media');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setMedia([...media, { file, type, previewUrl }]);
        }
    };

    const removeMedia = (index: number) => {
        setMedia(media.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!text.trim() && media.length === 0) return;
        setIsPosting(true);

        try {
            // Calculate total uploads needed
            const totalUploads = media.length + (presetFile ? 1 : 0);
            let completedUploads = 0;

            // Update progress helper
            const updateProgress = () => {
                completedUploads++;
                setUploadProgress({
                    current: completedUploads,
                    total: totalUploads,
                    percent: Math.round((completedUploads / totalUploads) * 100)
                });
            };

            // Reset progress
            setUploadProgress({ current: 0, total: totalUploads, percent: 0 });

            // Upload all media assets one by one to track progress
            const uploadedMedia: Array<{ url: string; type: string }> = [];
            for (const m of media) {
                // Vercel Blob automatically handles storage organization
                const result = await uploadMedia(m.file);

                // CRITICAL FIX: Ensure we enforce the type selected by the user (m.type)
                if (result) {
                    uploadedMedia.push({
                        url: result.url, // Vercel Blob returns { url } object
                        type: m.type // Override with explicit type (audio, video, image)
                    });
                }
                updateProgress();
            }

            let presetUrl: string | null = null;
            if (presetFile) {
                const res = await uploadMedia(presetFile);
                presetUrl = res?.url || null;
                updateProgress();
            }

            const postPayload = {
                text,
                attachments: uploadedMedia.filter(m => m !== null), // Clean failed uploads
                seshFx: (seshFxOpen && (pluginsUsed.length > 0 || presetUrl)) ? {
                    plugins: pluginsUsed,
                    presetUrl,
                    presetName: presetFile ? presetFile.name : null
                } : null
            };

            await onPost(postPayload);

            // Reset Form
            setText('');
            setMedia([]);
            setSeshFxOpen(false);
            setPluginsUsed([]);
            setPresetFile(null);
            setUploadProgress({ current: 0, total: 0, percent: 0 });
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post. Please try again.");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-dark-card p-4 rounded-xl border dark:border-gray-700 shadow-sm mb-6">
            {/* Upload Progress Overlay */}
            <AnimatePresence>
                {isPosting && uploadProgress.total > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="relative">
                                    <Loader2 className="animate-spin text-brand-blue" size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                        Getting Post Ready...
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Uploading {uploadProgress.current} of {uploadProgress.total} files
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-brand-blue to-purple-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress.percent}%` }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                />
                            </div>

                            {/* Percentage */}
                            <div className="flex justify-end mt-1">
                                <span className="text-xs font-semibold text-brand-blue">
                                    {uploadProgress.percent}%
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-3">
                <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
                        {activeProfile?.photo_url || userData?.photoURL ? (
                            <img src={activeProfile?.photo_url || userData?.photoURL} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-brand-blue"></div>
                        )}
                    </div>
                    {/* Profile Badge */}
                    {activeRole && activeRole !== 'Fan' && (
                        <div className="absolute -bottom-1 -right-1 bg-brand-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#2c2e36]">
                            {displayRole}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <textarea
                        className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 min-h-[80px] resize-none"
                        placeholder="What's creating sound today? (#tags @mentions)"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        disabled={isPosting}
                    />

                    {/* Media Previews Grid */}
                    {media.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {media.map((m, i) => (
                                <div key={i} className="relative rounded-lg overflow-hidden bg-black/5 border dark:border-gray-600 aspect-video group flex items-center justify-center">
                                    {m.type === 'image' && <img src={m.previewUrl} className="h-full w-full object-cover" alt={m.file.name} />}
                                    {m.type === 'video' && <video src={m.previewUrl} className="h-full w-full object-cover" />}
                                    {m.type === 'audio' && (
                                        <div className="flex flex-col items-center justify-center text-brand-blue bg-gray-100 dark:bg-gray-800 w-full h-full">
                                            <Music size={32} />
                                            <span className="text-xs text-gray-500 mt-2 truncate max-w-[90%] px-2">{m.file.name}</span>
                                        </div>
                                    )}
                                    {!isPosting && (
                                        <button onClick={() => removeMedia(i)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-500"><X size={12} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SeshFx Drawer */}
                    {seshFxOpen && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3 border border-blue-100 dark:border-blue-800/50 animate-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-brand-blue uppercase">SeshFx Data</span>
                                <button onClick={() => setSeshFxOpen(false)}><X size={14} className="text-gray-400 hover:text-brand-blue" /></button>
                            </div>
                            <MultiSelect label="" options={POPULAR_PLUGINS_LIST} initialValues={pluginsUsed} onChange={(_, val) => setPluginsUsed(val)} />
                            <div className="mt-2 flex items-center gap-2">
                                <Paperclip size={14} className="text-gray-400" />
                                <input type="file" className="text-xs text-gray-500 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-white dark:file:bg-gray-700 dark:file:text-white" onChange={e => setPresetFile((e.target.files?.[0] || null))} />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
                        <div className="flex gap-1">
                            <label className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-brand-blue cursor-pointer transition ${isPosting ? 'opacity-50 pointer-events-none' : ''}`} title="Add Image">
                                <ImageIcon size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={e => handleFileSelect(e, 'image')} disabled={isPosting} />
                            </label>
                            <label className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-green-500 cursor-pointer transition ${isPosting ? 'opacity-50 pointer-events-none' : ''}`} title="Add Video">
                                <Video size={20} />
                                <input type="file" className="hidden" accept="video/*" onChange={e => handleFileSelect(e, 'video')} disabled={isPosting} />
                            </label>
                            <label className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-purple-500 cursor-pointer transition ${isPosting ? 'opacity-50 pointer-events-none' : ''}`} title="Add Audio Track">
                                <Music size={20} />
                                <input type="file" className="hidden" accept="audio/*" onChange={e => handleFileSelect(e, 'audio')} disabled={isPosting} />
                            </label>
                            <button onClick={() => setSeshFxOpen(!seshFxOpen)} disabled={isPosting} className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition ${seshFxOpen ? 'bg-blue-50 dark:bg-blue-900/20 text-brand-blue' : 'text-gray-400'} ${isPosting ? 'opacity-50' : ''}`} title="Add Plugin Data">
                                <Sliders size={20} />
                            </button>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isPosting || (!text && media.length === 0)}
                            className="bg-brand-blue text-white px-5 py-1.5 rounded-full font-bold text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
                        >
                            {isPosting ? <Loader2 className="animate-spin" size={16} /> : <><span>Post</span> <Send size={14} /></>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
