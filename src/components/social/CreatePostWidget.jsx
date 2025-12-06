import React, { useState } from 'react';
import { Send, Image as ImageIcon, Music, Video, X, Sliders, Paperclip, Loader2 } from 'lucide-react';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { POPULAR_PLUGINS_LIST } from '../../config/constants';
import { MultiSelect } from '../shared/Inputs';

export default function CreatePostWidget({ user, userData, onPost }) {
    const [text, setText] = useState('');
    const [media, setMedia] = useState([]); // Array of {file, type, previewUrl}
    const [seshFxOpen, setSeshFxOpen] = useState(false);
    const [pluginsUsed, setPluginsUsed] = useState([]);
    const [presetFile, setPresetFile] = useState(null);
    const [isPosting, setIsPosting] = useState(false);

    const { uploadMedia } = useMediaUpload();

    const handleFileSelect = (e, type) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setMedia([...media, { file, type, previewUrl }]);
        }
    };

    const removeMedia = (index) => {
        setMedia(media.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!text.trim() && media.length === 0) return;
        setIsPosting(true);

        try {
            // Upload all media assets first
            const uploadedMedia = await Promise.all(media.map(async (m) => {
                const pathKey = m.type === 'video' ? 'postVideos' : (m.type === 'audio' ? 'postAudio' : 'postImages');
                const path = `artifacts/${user.uid}/${pathKey}`;
                
                const result = await uploadMedia(m.file, path);
                
                // CRITICAL FIX: Ensure we enforce the type selected by the user (m.type)
                // identifying mime-types automatically can sometimes fail or default to 'file'/'image'
                if (result) {
                    return { 
                        ...result, 
                        type: m.type // Override with explicit type (audio, video, image)
                    };
                }
                return null;
            }));

            let presetUrl = null;
            if (presetFile) {
                 const res = await uploadMedia(presetFile, `artifacts/${user.uid}/postPresets`);
                 presetUrl = res?.url;
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
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post. Please try again.");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-dark-card p-4 rounded-xl border dark:border-gray-700 shadow-sm mb-6">
            <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
                    {userData?.photoURL ? <img src={userData.photoURL} className="h-full w-full object-cover"/> : <div className="h-full w-full bg-brand-blue"></div>}
                </div>
                <div className="flex-1">
                    <textarea 
                        className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 min-h-[80px] resize-none"
                        placeholder="What's creating sound today? (#tags @mentions)"
                        value={text}
                        onChange={e => setText(e.target.value)}
                    />
                    
                    {/* Media Previews Grid */}
                    {media.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {media.map((m, i) => (
                                <div key={i} className="relative rounded-lg overflow-hidden bg-black/5 border dark:border-gray-600 aspect-video group flex items-center justify-center">
                                    {m.type === 'image' && <img src={m.previewUrl} className="h-full w-full object-cover"/>}
                                    {m.type === 'video' && <video src={m.previewUrl} className="h-full w-full object-cover"/>}
                                    {m.type === 'audio' && (
                                        <div className="flex flex-col items-center justify-center text-brand-blue bg-gray-100 dark:bg-gray-800 w-full h-full">
                                            <Music size={32}/>
                                            <span className="text-xs text-gray-500 mt-2 truncate max-w-[90%] px-2">{m.file.name}</span>
                                        </div>
                                    )}
                                    <button onClick={() => removeMedia(i)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-500"><X size={12}/></button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SeshFx Drawer */}
                    {seshFxOpen && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3 border border-blue-100 dark:border-blue-800/50 animate-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-brand-blue uppercase">SeshFx Data</span>
                                <button onClick={()=>setSeshFxOpen(false)}><X size={14} className="text-gray-400 hover:text-brand-blue"/></button>
                            </div>
                            <MultiSelect label="" options={POPULAR_PLUGINS_LIST} initialValues={pluginsUsed} onChange={(_, val) => setPluginsUsed(val)} />
                            <div className="mt-2 flex items-center gap-2">
                                <Paperclip size={14} className="text-gray-400"/>
                                <input type="file" className="text-xs text-gray-500 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-white dark:file:bg-gray-700 dark:file:text-white" onChange={e => setPresetFile(e.target.files[0])} />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
                        <div className="flex gap-1">
                            <label className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-brand-blue cursor-pointer transition" title="Add Image">
                                <ImageIcon size={20}/>
                                <input type="file" className="hidden" accept="image/*" onChange={e => handleFileSelect(e, 'image')}/>
                            </label>
                            <label className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-green-500 cursor-pointer transition" title="Add Video">
                                <Video size={20}/>
                                <input type="file" className="hidden" accept="video/*" onChange={e => handleFileSelect(e, 'video')}/>
                            </label>
                            <label className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-purple-500 cursor-pointer transition" title="Add Audio Track">
                                <Music size={20}/>
                                <input type="file" className="hidden" accept="audio/*" onChange={e => handleFileSelect(e, 'audio')}/>
                            </label>
                            <button onClick={()=>setSeshFxOpen(!seshFxOpen)} className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition ${seshFxOpen ? 'bg-blue-50 dark:bg-blue-900/20 text-brand-blue' : 'text-gray-400'}`} title="Add Plugin Data">
                                <Sliders size={20}/>
                            </button>
                        </div>
                        <button 
                            onClick={handleSubmit} 
                            disabled={isPosting || (!text && media.length === 0)}
                            className="bg-brand-blue text-white px-5 py-1.5 rounded-full font-bold text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
                        >
                            {isPosting ? <Loader2 className="animate-spin" size={16}/> : <>Post <Send size={14}/></>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
