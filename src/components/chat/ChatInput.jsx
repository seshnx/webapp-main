import React, { useState, useRef, useEffect } from 'react';
import { update, ref } from 'firebase/database';
import { 
    Paperclip, 
    Send, 
    X, 
    Loader2, 
    FileAudio, 
    CheckCircle, 
    Mic, 
    StopCircle,
    CornerUpLeft,
    Pencil,
    Smile,
    Image as ImageIcon,
    Video,
    FileText,
    ImagePlus
} from 'lucide-react';
import { rtdb } from '../../config/firebase';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from './media/EmojiPicker';
import GifPicker from './media/GifPicker';
import VideoRecorder from './media/VideoRecorder';

export default function ChatInput({ 
    activeChatId, 
    uid, 
    onSend, 
    replyingTo, 
    editingMessage, 
    onCancelReply, 
    typingUsers = [] 
}) {
    const [input, setInput] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showVideoRecorder, setShowVideoRecorder] = useState(false);
    
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const emojiPickerRef = useRef(null);
    const gifPickerRef = useRef(null);
    const { uploadMedia, uploading } = useMediaUpload();

    // Set input when editing
    useEffect(() => { 
        if (editingMessage) {
            setInput(editingMessage.b || '');
            textareaRef.current?.focus();
        }
    }, [editingMessage]);

    // Focus on reply
    useEffect(() => {
        if (replyingTo) {
            textareaRef.current?.focus();
        }
    }, [replyingTo]);

    // Close pickers on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
                setShowEmojiPicker(false);
            }
            if (gifPickerRef.current && !gifPickerRef.current.contains(e.target)) {
                setShowGifPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle GIF selection
    const handleGifSelect = async (gifData) => {
        try {
            // Convert GIF URL to file-like object for upload
            const response = await fetch(gifData.url);
            const blob = await response.blob();
            const file = new File([blob], `gif_${Date.now()}.gif`, { type: 'image/gif' });
            
            const res = await uploadMedia(file, `chat_media/${activeChatId}`);
            if (res) {
                const gifMediaData = { 
                    url: res.url, 
                    type: 'image', 
                    name: gifData.title || 'GIF',
                    gif: true // Flag to indicate it's a GIF
                };
                onSend('', gifMediaData);
            }
        } catch (error) {
            console.error('GIF upload error:', error);
            alert('Failed to send GIF');
        }
        setShowGifPicker(false);
    };

    // Handle video recording
    const handleVideoRecorded = async (videoFile) => {
        try {
            const res = await uploadMedia(videoFile, `chat_media/${activeChatId}`);
            if (res) {
                const videoMediaData = { 
                    url: res.url, 
                    type: 'video', 
                    name: videoFile.name 
                };
                onSend('', videoMediaData);
            }
        } catch (error) {
            console.error('Video upload error:', error);
            alert('Failed to send video');
        }
        setShowVideoRecorder(false);
    };

    // --- TEXT & TYPING ---
    const handleTyping = (e) => {
        setInput(e.target.value);
        
        // Update typing indicator
        if (activeChatId && uid && rtdb) {
            update(ref(rtdb, `chats/${activeChatId}/typing`), { [uid]: true });
            
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                if (rtdb) {
                    update(ref(rtdb, `chats/${activeChatId}/typing`), { [uid]: false });
                }
            }, 2000);
        }
    };

    // Insert emoji at cursor position
    const insertEmoji = (emoji) => {
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newValue = input.substring(0, start) + emoji + input.substring(end);
            setInput(newValue);
            
            // Set cursor position after emoji
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
                textarea.focus();
            }, 0);
        } else {
            setInput(prev => prev + emoji);
        }
    };

    // --- AUDIO RECORDING ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];
            
            mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
            mediaRecorder.current.onstop = () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/mp3' });
                const audioFile = new File([audioBlob], `voice_note_${Date.now()}.mp3`, { type: 'audio/mp3' });
                setAttachment({ file: audioFile, type: 'audio', previewUrl: URL.createObjectURL(audioBlob) });
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (e) { 
            alert("Microphone access denied."); 
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current) mediaRecorder.current.stop();
        setIsRecording(false);
    };

    // --- DRAG & DROP ---
    const handleDrag = (e) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else {
            setDragActive(false);
        }
    };
    
    const handleDrop = (e) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (file) => {
        const type = file.type.startsWith('image/') ? 'image' : 
                     file.type.startsWith('video/') ? 'video' :
                     file.type.startsWith('audio/') ? 'audio' : 'file';
        setAttachment({ 
            file, 
            type, 
            previewUrl: URL.createObjectURL(file) 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((!input.trim() && !attachment) || uploading) return;

        let mediaData = null;
        if (attachment) {
            const res = await uploadMedia(attachment.file, `chat_media/${activeChatId}`);
            if (res) mediaData = { url: res.url, type: res.type, name: res.name };
        }

        onSend(input, mediaData);
        setInput('');
        setAttachment(null);
        
        // Clear typing indicator
        if (activeChatId && uid && rtdb) {
            update(ref(rtdb, `chats/${activeChatId}/typing`), { [uid]: false });
        }
    };

    const handleCancel = () => {
        if (editingMessage) {
            setInput('');
        }
        onCancelReply?.();
    };

    // Get reply/edit preview text
    const getContextPreview = () => {
        if (editingMessage) {
            return editingMessage.b?.substring(0, 50) || 'Message';
        }
        if (replyingTo) {
            return replyingTo.b?.substring(0, 50) || 'Media';
        }
        return '';
    };

    return (
        <div 
            className={`p-3 bg-white dark:bg-[#2c2e36] border-t dark:border-gray-700 shrink-0 transition-colors ${
                dragActive ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400' : ''
            }`}
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag} 
            onDragOver={handleDrag} 
            onDrop={handleDrop}
        >
            {/* Typing Indicator */}
            <AnimatePresence>
                {typingUsers.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mb-2 px-2 flex items-center gap-2"
                    >
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        </div>
                        <span className="text-xs text-gray-400 italic">
                            {typingUsers.length > 1 ? 'Multiple people are' : 'Someone is'} typing...
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reply/Edit Context Header */}
            <AnimatePresence>
                {(replyingTo || editingMessage) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-2.5 px-4 rounded-xl border-l-4 border-brand-blue mb-2"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {editingMessage ? (
                                <Pencil size={16} className="text-brand-blue shrink-0" />
                            ) : (
                                <CornerUpLeft size={16} className="text-brand-blue shrink-0" />
                            )}
                            <div className="min-w-0">
                                <span className="text-xs font-bold text-brand-blue block">
                                    {editingMessage ? 'Editing Message' : `Replying to ${replyingTo?.n || 'User'}`}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">
                                    {getContextPreview()}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={handleCancel}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
                        >
                            <X size={16} className="text-gray-400 hover:text-red-500"/>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Attachment Preview */}
            <AnimatePresence>
                {attachment && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl mb-2 border dark:border-gray-700"
                    >
                        {attachment.type === 'image' ? (
                            <img src={attachment.previewUrl} className="h-14 w-14 object-cover rounded-lg"/>
                        ) : attachment.type === 'video' ? (
                            <video src={attachment.previewUrl} className="h-14 w-14 object-cover rounded-lg"/>
                        ) : (
                            <div className="h-14 w-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center rounded-lg">
                                <FileAudio size={24}/>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold dark:text-white truncate">{attachment.file.name}</div>
                            <div className="text-xs text-gray-500">{(attachment.file.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <button 
                            onClick={() => setAttachment(null)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
                        >
                            <X size={18} className="text-gray-400 hover:text-red-500"/>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Input Row */}
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
                {/* Attachment button with dropdown */}
                <div className="relative">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.zip" 
                        onChange={(e) => handleFileSelect(e.target.files[0])} 
                    />
                    
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        className="p-2.5 text-gray-500 hover:text-brand-blue hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition shrink-0"
                        title="Attach file"
                    >
                        <Paperclip size={20}/>
                    </button>
                </div>

                {/* Media options */}
                <div className="flex items-center gap-1 border-r dark:border-gray-700 pr-2">
                    <button
                        type="button"
                        onClick={() => {
                            setShowVideoRecorder(true);
                            setShowEmojiPicker(false);
                            setShowGifPicker(false);
                        }}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                        title="Record video"
                    >
                        <Video size={18} />
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => {
                            setShowGifPicker(!showGifPicker);
                            setShowEmojiPicker(false);
                        }}
                        className="p-2 text-gray-500 hover:text-purple-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition relative"
                        title="GIF"
                        ref={gifPickerRef}
                    >
                        <ImagePlus size={18} />
                        {showGifPicker && (
                            <GifPicker
                                onSelect={handleGifSelect}
                                onClose={() => setShowGifPicker(false)}
                                position="bottom"
                            />
                        )}
                    </button>
                </div>
                
                {/* Input field with emoji button */}
                <div className="flex-1 bg-gray-100 dark:bg-[#1f2128] rounded-2xl border dark:border-gray-700 focus-within:ring-2 focus-within:ring-brand-blue transition-all flex items-end relative">
                    <textarea 
                        ref={textareaRef}
                        className="w-full bg-transparent p-3 max-h-32 min-h-[44px] text-sm resize-none outline-none dark:text-white custom-scrollbar pr-20" 
                        placeholder={
                            editingMessage ? "Update message..." : 
                            dragActive ? "Drop files here..." : 
                            "Type a message..."
                        } 
                        value={input} 
                        onChange={handleTyping} 
                        onKeyDown={e => { 
                            if(e.key === 'Enter' && !e.shiftKey) { 
                                e.preventDefault(); 
                                handleSubmit(e); 
                            }
                        }}
                        rows={1}
                    />
                    
                    {/* Right-side buttons inside input */}
                    <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                        {/* Full Emoji picker */}
                        <div className="relative" ref={emojiPickerRef}>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setShowEmojiPicker(!showEmojiPicker);
                                    setShowGifPicker(false);
                                }}
                                className={`p-1.5 rounded-full transition ${
                                    showEmojiPicker 
                                        ? 'bg-brand-blue/20 text-brand-blue' 
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                                title="Emoji"
                            >
                                <Smile size={18}/>
                            </button>
                            
                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <EmojiPicker
                                        onSelect={insertEmoji}
                                        onClose={() => setShowEmojiPicker(false)}
                                        position="bottom"
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Voice record button */}
                        <button 
                            type="button" 
                            onClick={isRecording ? stopRecording : startRecording} 
                            className={`p-1.5 rounded-full transition ${
                                isRecording 
                                    ? 'bg-red-500 text-white animate-pulse' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        >
                            {isRecording ? <StopCircle size={18}/> : <Mic size={18}/>}
                        </button>
                    </div>
                </div>

                {/* Send button */}
                <button 
                    type="submit" 
                    disabled={(!input.trim() && !attachment) || uploading} 
                    className={`p-2.5 text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 ${
                        editingMessage 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-brand-blue hover:bg-blue-600'
                    }`}
                >
                    {uploading ? (
                        <Loader2 size={20} className="animate-spin"/>
                    ) : editingMessage ? (
                        <CheckCircle size={20}/>
                    ) : (
                        <Send size={20}/>
                    )}
                </button>
            </form>

            {/* Video Recorder Modal */}
            {showVideoRecorder && (
                <VideoRecorder
                    onRecorded={handleVideoRecorded}
                    onClose={() => setShowVideoRecorder(false)}
                    maxDuration={60}
                />
            )}
        </div>
    );
}
