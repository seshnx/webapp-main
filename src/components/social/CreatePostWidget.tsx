import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Music, Video, X, Sliders, Paperclip, Loader2, Calendar, Building2, Search, Upload, Sparkles } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUpload } from '../../hooks/useUpload';
import { POPULAR_PLUGINS_LIST } from '../../config/constants';
import { MultiSelect } from '../shared/Inputs';
import UserAvatar from '../shared/UserAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import ScheduledPostsModal, { ScheduledPostItem } from './ScheduledPostsModal';

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
        attachments: Array<{ url: string; type: string; name?: string }>;
        taggedStudio?: { id?: string; name: string } | null;
        isBoosted?: boolean;
        boostRadiusMiles?: number;
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
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [taggedStudio, setTaggedStudio] = useState<{ id?: string; name: string } | null>(null);
    const [showStudioPicker, setShowStudioPicker] = useState<boolean>(false);
    const [studioSearch, setStudioSearch] = useState<string>('');
    const [isBoosted, setIsBoosted] = useState<boolean>(false);
    const [boostRadius, setBoostRadius] = useState<number>(25);
    const [showBoostPicker, setShowBoostPicker] = useState<boolean>(false);
    const [seshFxOpen, setSeshFxOpen] = useState<boolean>(false);
    const [pluginsUsed, setPluginsUsed] = useState<string[]>([]);
    const [presetFile, setPresetFile] = useState<File | null>(null);
    const [isPosting, setIsPosting] = useState<boolean>(false);
    const [showScheduledModal, setShowScheduledModal] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ current: 0, total: 0, percent: 0 });

    // Fetch studios for tagging
    const availableStudios = useQuery(api.social.discoverStudios, { limit: 30 }) || [];

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

    const { uploadMedia } = useUpload('post-media');

    // Batch add files with automatic MIME detection
    const addFiles = (files: File[] | FileList) => {
        const newItems: MediaAttachment[] = [];
        Array.from(files).forEach((file) => {
            let type: 'image' | 'video' | 'audio' = 'image';
            if (file.type.startsWith('video/')) type = 'video';
            else if (file.type.startsWith('audio/')) type = 'audio';
            else if (file.type.startsWith('image/')) type = 'image';
            else return;

            const previewUrl = URL.createObjectURL(file);
            newItems.push({ file, type, previewUrl });
        });

        if (newItems.length > 0) {
            setMedia((prev) => [...prev, ...newItems]);
            setIsFocused(true);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const previewUrl = URL.createObjectURL(file);
            setMedia((prev) => [...prev, { file, type, previewUrl }]);
            setIsFocused(true);
        }
    };

    // Drag and drop handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files);
        }
    };

    // Clipboard paste handler
    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const pastedFiles: File[] = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    pastedFiles.push(file);
                }
            }
        }

        if (pastedFiles.length > 0) {
            e.preventDefault();
            addFiles(pastedFiles);
        }
    };

    const removeMedia = (index: number) => {
        setMedia((prev) => {
            const item = prev[index];
            if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
            return prev.filter((_, i) => i !== index);
        });
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
            const uploadedMedia: Array<{ url: string; type: string; name?: string }> = [];
            for (const m of media) {
                const result = await uploadMedia(m.file);

                if (result) {
                    uploadedMedia.push({
                        url: result.url,
                        type: m.type, // Override with explicit type (audio, video, image)
                        name: m.file.name
                    });
                }
                updateProgress();
            }

            // If user attached media but all uploads failed, abort submission
            if (media.length > 0 && uploadedMedia.length === 0) {
                alert("Failed to upload media attachments. Please check your storage / CORS configuration and try again.");
                setIsPosting(false);
                return;
            }

            let presetUrl: string | null = null;
            if (presetFile) {
                const res = await uploadMedia(presetFile);
                presetUrl = res?.url || null;
                updateProgress();
            }

            const postPayload = {
                text,
                attachments: uploadedMedia,
                taggedStudio: taggedStudio || null,
                isBoosted: isBoosted || false,
                boostRadiusMiles: isBoosted ? boostRadius : undefined,
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
            setTaggedStudio(null);
            setShowStudioPicker(false);
            setIsBoosted(false);
            setShowBoostPicker(false);
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

    const [isFocused, setIsFocused] = useState<boolean>(false);
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    // Is the composer active / expanded?
    const isExpanded = isFocused || text.length > 0 || media.length > 0 || seshFxOpen || taggedStudio !== null || showStudioPicker || isBoosted || showBoostPicker;

    // Handle clicks outside to collapse if empty
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (!text.trim() && media.length === 0 && !seshFxOpen && !taggedStudio && !showStudioPicker && !isBoosted && !showBoostPicker) {
                    setIsFocused(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [text, media.length, seshFxOpen, taggedStudio, showStudioPicker, isBoosted, showBoostPicker]);

    // Filter studios based on search
    const filteredStudios = availableStudios.filter((s: any) =>
        s.displayName?.toLowerCase().includes(studioSearch.toLowerCase()) ||
        s.location?.toLowerCase().includes(studioSearch.toLowerCase())
    );

    return (
        <div
            ref={containerRef}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onPaste={handlePaste}
            className={`bg-white dark:bg-dark-card p-3 sm:p-4 rounded-2xl border shadow-sm mb-6 transition-all duration-300 focus-within:ring-2 focus-within:ring-brand-blue/20 focus-within:border-brand-blue/40 relative ${
                dragActive ? 'border-brand-blue ring-2 ring-brand-blue/20 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-800'
            }`}
        >
            {/* Visual Drag and Drop Overlay for PC */}
            <AnimatePresence>
                {dragActive && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="absolute inset-0 z-30 rounded-2xl bg-brand-blue/15 dark:bg-brand-blue/25 backdrop-blur-sm border-2 border-dashed border-brand-blue flex flex-col items-center justify-center p-6 text-center pointer-events-none"
                    >
                        <div className="p-3 bg-brand-blue text-white rounded-full mb-2 shadow-lg animate-bounce">
                            <Upload size={24} />
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Drop media here to attach to post</p>
                        <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">Supports images, video clips, and audio files</p>
                    </motion.div>
                )}
            </AnimatePresence>

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

            <div className="flex gap-3 items-start">
                <div className="relative shrink-0">
                    <UserAvatar
                        user={user}
                        userData={userData}
                        subProfile={activeProfile}
                        name={activeProfile?.display_name || userData?.displayName || user?.fullName}
                        size="md"
                        className="h-9 w-9 sm:h-10 sm:w-10"
                    />
                    {/* Profile Badge */}
                    {activeRole && activeRole !== 'Fan' && (
                        <div className="absolute -bottom-1 -right-1 bg-brand-blue text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border-2 border-white dark:border-[#2c2e36]">
                            {displayRole}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Collapsed view pill input vs Expanded Textarea */}
                    {!isExpanded ? (
                        <div
                            onClick={() => setIsFocused(true)}
                            className="w-full bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200/70 dark:border-gray-700/60 rounded-full px-4 py-2 text-xs sm:text-sm text-gray-500 cursor-pointer flex items-center justify-between transition group"
                        >
                            <span className="truncate">What's creating sound today? (#tags @mentions)</span>
                            <div className="flex items-center gap-2 text-gray-400 group-hover:text-brand-blue transition shrink-0 ml-2">
                                <ImageIcon size={15} />
                                <Music size={15} />
                                <Video size={15} />
                                <Building2 size={15} />
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                        >
                            <textarea
                                autoFocus
                                className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 min-h-[75px] sm:min-h-[85px] text-xs sm:text-sm resize-none"
                                placeholder="What's creating sound today? (#tags @mentions or paste screenshots)"
                                value={text}
                                onChange={e => setText(e.target.value)}
                                onPaste={handlePaste}
                                onFocus={() => setIsFocused(true)}
                                disabled={isPosting}
                            />

                            {/* Tagged Studio & Boost Badges */}
                            <div className="flex items-center gap-2 flex-wrap mb-2.5">
                                {taggedStudio && (
                                    <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-xl text-xs font-semibold">
                                        <Building2 size={13} className="text-purple-500 shrink-0" />
                                        <span>Recorded at: <strong>{taggedStudio.name}</strong></span>
                                        <button
                                            type="button"
                                            onClick={() => setTaggedStudio(null)}
                                            className="ml-1 hover:text-red-500 transition p-0.5 rounded-full"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}

                                {isBoosted && (
                                    <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-brand-blue px-3 py-1 rounded-xl text-xs font-semibold">
                                        <Sparkles size={13} className="text-brand-blue shrink-0" />
                                        <span>Boosted Reach: <strong>{boostRadius} mi</strong></span>
                                        <button
                                            type="button"
                                            onClick={() => setIsBoosted(false)}
                                            className="ml-1 hover:text-red-500 transition p-0.5 rounded-full"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Media Previews Grid */}
                            {media.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {media.map((m, i) => (
                                        <div key={i} className="relative rounded-xl overflow-hidden bg-black/5 border dark:border-gray-700 aspect-video group flex items-center justify-center">
                                            {m.type === 'image' && <img src={m.previewUrl} className="h-full w-full object-cover" alt={m.file.name} />}
                                            {m.type === 'video' && <video src={m.previewUrl} className="h-full w-full object-cover" />}
                                            {m.type === 'audio' && (
                                                <div className="flex flex-col items-center justify-center text-brand-blue bg-gray-100 dark:bg-gray-800 w-full h-full p-2">
                                                    <Music size={28} />
                                                    <span className="text-xs text-gray-500 mt-1 truncate max-w-[90%] px-2">{m.file.name}</span>
                                                </div>
                                            )}
                                            {!isPosting && (
                                                <button onClick={() => removeMedia(i)} className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-500"><X size={12} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* SeshFx Drawer */}
                            {seshFxOpen && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl mb-3 border border-blue-100 dark:border-blue-800/50 animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-brand-blue uppercase">SeshFx Data</span>
                                        <button onClick={() => setSeshFxOpen(false)}><X size={14} className="text-gray-400 hover:text-brand-blue" /></button>
                                    </div>
                                    <MultiSelect fieldKey="pluginsUsed" label="" options={POPULAR_PLUGINS_LIST} initialValues={pluginsUsed} onChange={(_, val) => setPluginsUsed(val)} />
                                    <div className="mt-2 flex items-center gap-2">
                                        <Paperclip size={14} className="text-gray-400" />
                                        <input type="file" className="text-xs text-gray-500 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-white dark:file:bg-gray-700 dark:file:text-white" onChange={e => setPresetFile((e.target.files?.[0] || null))} />
                                    </div>
                                </div>
                            )}

                            {/* Studio Tagging Selector Popover */}
                            {showStudioPicker && (
                                <div className="bg-purple-50/70 dark:bg-purple-950/30 p-3 rounded-2xl mb-3 border border-purple-200/80 dark:border-purple-800/40 animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1.5">
                                            <Building2 size={14} /> Tag Recording Studio / Facility
                                        </span>
                                        <button onClick={() => setShowStudioPicker(false)}><X size={14} className="text-gray-400 hover:text-purple-600" /></button>
                                    </div>

                                    {/* Search Input */}
                                    <div className="relative mb-2">
                                        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={studioSearch}
                                            onChange={(e) => setStudioSearch(e.target.value)}
                                            placeholder="Search studios or enter name..."
                                            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>

                                    {/* Quick Studios List */}
                                    <div className="max-h-36 overflow-y-auto space-y-1">
                                        {filteredStudios.map((s: any) => (
                                            <div
                                                key={s.clerkId || s.displayName}
                                                onClick={() => {
                                                    setTaggedStudio({ id: s.clerkId, name: s.displayName });
                                                    setShowStudioPicker(false);
                                                }}
                                                className="flex items-center justify-between p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 hover:bg-purple-100 dark:hover:bg-purple-900/40 cursor-pointer transition text-xs border border-purple-100 dark:border-purple-900/30"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-600">
                                                        <Building2 size={12} />
                                                    </div>
                                                    <span className="font-semibold dark:text-white">{s.displayName}</span>
                                                </div>
                                                {s.location && <span className="text-[10px] text-gray-400">{s.location}</span>}
                                            </div>
                                        ))}

                                        {/* Custom name write-in option if search has value */}
                                        {studioSearch.trim() && !filteredStudios.some((s: any) => s.displayName?.toLowerCase() === studioSearch.toLowerCase()) && (
                                            <div
                                                onClick={() => {
                                                    setTaggedStudio({ name: studioSearch.trim() });
                                                    setShowStudioPicker(false);
                                                }}
                                                className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 hover:opacity-90 cursor-pointer transition text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5"
                                            >
                                                <Building2 size={12} />
                                                <span>Tag custom studio: "{studioSearch.trim()}"</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Boost Reach Selector Popover */}
                            {showBoostPicker && (
                                <div className="bg-blue-50/70 dark:bg-blue-950/30 p-3 rounded-2xl mb-3 border border-blue-200/80 dark:border-blue-800/40 animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-brand-blue flex items-center gap-1.5">
                                            <Sparkles size={14} /> Boost Post Reach & Geo-Radius
                                        </span>
                                        <button onClick={() => setShowBoostPicker(false)}><X size={14} className="text-gray-400 hover:text-brand-blue" /></button>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="boost-toggle"
                                                checked={isBoosted}
                                                onChange={(e) => setIsBoosted(e.target.checked)}
                                                className="w-4 h-4 text-brand-blue rounded"
                                            />
                                            <label htmlFor="boost-toggle" className="font-semibold dark:text-white cursor-pointer">
                                                Enable Priority Feed Boost
                                            </label>
                                        </div>
                                        {isBoosted && (
                                            <select
                                                value={boostRadius}
                                                onChange={(e) => setBoostRadius(Number(e.target.value))}
                                                className="bg-white dark:bg-gray-800 border dark:border-gray-700 text-xs font-bold rounded-xl px-2.5 py-1 outline-none text-gray-900 dark:text-white"
                                            >
                                                <option value={15}>15 Miles</option>
                                                <option value={25}>25 Miles</option>
                                                <option value={50}>50 Miles</option>
                                                <option value={100}>100 Miles</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Toolbar */}
                            <div className="flex justify-between items-center pt-2.5 border-t dark:border-gray-800">
                                <div className="flex items-center gap-1">
                                    <label className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-brand-blue cursor-pointer transition ${isPosting ? 'opacity-50 pointer-events-none' : ''}`} title="Add Image">
                                        <ImageIcon size={18} />
                                        <input type="file" className="hidden" accept="image/*" onChange={e => handleFileSelect(e, 'image')} disabled={isPosting} />
                                    </label>
                                    <label className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-emerald-500 cursor-pointer transition ${isPosting ? 'opacity-50 pointer-events-none' : ''}`} title="Add Video">
                                        <Video size={18} />
                                        <input type="file" className="hidden" accept="video/*" onChange={e => handleFileSelect(e, 'video')} disabled={isPosting} />
                                    </label>
                                    <label className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-purple-500 cursor-pointer transition ${isPosting ? 'opacity-50 pointer-events-none' : ''}`} title="Add Audio Track">
                                        <Music size={18} />
                                        <input type="file" className="hidden" accept="audio/*" onChange={e => handleFileSelect(e, 'audio')} disabled={isPosting} />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowStudioPicker(!showStudioPicker)}
                                        disabled={isPosting}
                                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition ${taggedStudio || showStudioPicker ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600' : 'text-gray-400'} ${isPosting ? 'opacity-50' : ''}`}
                                        title="Tag a Studio / Recording Facility"
                                    >
                                        <Building2 size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowBoostPicker(!showBoostPicker)}
                                        disabled={isPosting}
                                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition ${isBoosted || showBoostPicker ? 'bg-blue-50 dark:bg-blue-900/30 text-brand-blue' : 'text-gray-400'} ${isPosting ? 'opacity-50' : ''}`}
                                        title="Boost Post Reach / Geo-Target Radius"
                                    >
                                        <Sparkles size={18} />
                                    </button>
                                    <button onClick={() => setSeshFxOpen(!seshFxOpen)} disabled={isPosting} className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition ${seshFxOpen ? 'bg-blue-50 dark:bg-blue-900/20 text-brand-blue' : 'text-gray-400'} ${isPosting ? 'opacity-50' : ''}`} title="Add Plugin Data">
                                        <Sliders size={18} />
                                    </button>
                                    <button onClick={() => setShowScheduledModal(true)} disabled={isPosting} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-amber-500 rounded-xl transition" title="Scheduled Posts & Drafts">
                                        <Calendar size={18} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!text.trim() && media.length === 0 && !seshFxOpen && !taggedStudio && !showStudioPicker && !isBoosted && !showBoostPicker && (
                                        <button
                                            type="button"
                                            onClick={() => setIsFocused(false)}
                                            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-2 py-1 transition"
                                        >
                                            Cancel
                                        </button>
                                    )}

                                    <button
                                        onClick={handleSubmit}
                                        disabled={isPosting || (!text.trim() && media.length === 0)}
                                        className="bg-brand-blue text-white px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition shadow-sm"
                                    >
                                        {isPosting ? <Loader2 className="animate-spin" size={14} /> : <><span>Post</span> <Send size={12} /></>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Scheduled Posts & Drafts Modal */}
            {showScheduledModal && (
                <ScheduledPostsModal
                    onClose={() => setShowScheduledModal(false)}
                    onPublishNow={async (item) => {
                        setText(item.text);
                        setShowScheduledModal(false);
                    }}
                />
            )}
        </div>
    );
}
