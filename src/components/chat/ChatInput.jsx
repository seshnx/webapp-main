import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    ImagePlus,
    Trash2,
    Play,
    Pause,
    Square
} from 'lucide-react';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from './media/EmojiPicker';
import GifPicker from './media/GifPicker';
import VideoRecorder from './media/VideoRecorder';
import { formatTypingUsers } from '../../hooks/useTypingIndicator';

export default function ChatInput({ 
    activeChatId, 
    uid, 
    onSend, 
    replyingTo, 
    editingMessage, 
    onCancelReply,
    onCancelEdit, 
    typingUsers = [],
    onTyping,
    onStopTyping
}) {
    const [input, setInput] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showVideoRecorder, setShowVideoRecorder] = useState(false);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);
    
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const emojiPickerRef = useRef(null);
    const gifPickerRef = useRef(null);
    const recordingIntervalRef = useRef(null);
    const audioPreviewRef = useRef(null);
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
        
        // Update typing indicator via Convex
        if (onTyping && e.target.value.trim()) {
            onTyping();
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
            setRecordingDuration(0);
            
            mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
            mediaRecorder.current.onstop = () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });
                setAttachment({ 
                    file: audioFile, 
                    type: 'audio', 
                    previewUrl: URL.createObjectURL(audioBlob),
                    duration: recordingDuration
                });
                stream.getTracks().forEach(track => track.stop());
                if (recordingIntervalRef.current) {
                    clearInterval(recordingIntervalRef.current);
                }
            };
            
            mediaRecorder.current.start();
            setIsRecording(true);
            
            // Start duration timer
            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (e) { 
            alert("Microphone access denied. Please allow microphone permissions."); 
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    };

    const cancelRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            // Clear the chunks so nothing is saved
            audioChunks.current = [];
            setIsRecording(false);
            setRecordingDuration(0);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            // Stop the stream
            mediaRecorder.current.stream?.getTracks().forEach(track => track.stop());
        }
    };

    // Format duration as MM:SS
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Toggle audio preview playback
    const toggleAudioPreview = () => {
        if (!audioPreviewRef.current || !attachment?.previewUrl) return;
        
        if (isPlayingPreview) {
            audioPreviewRef.current.pause();
            setIsPlayingPreview(false);
        } else {
            audioPreviewRef.current.play();
            setIsPlayingPreview(true);
        }
    };

    // Cleanup recording on unmount
    useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            if (mediaRecorder.current && isRecording) {
                mediaRecorder.current.stop();
            }
        };
    }, []);

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
            if (res) {
                mediaData = { 
                    url: res.url, 
                    type: res.type, 
                    name: res.name,
                    duration: attachment.duration // Include duration for voice notes
                };
            }
        }

        onSend(input, mediaData);
        setInput('');
        setAttachment(null);
        setIsPlayingPreview(false);
        
        // Clear typing indicator via Convex
        if (onStopTyping) {
            onStopTyping();
        }
    };

    const handleCancel = () => {
        if (editingMessage) {
            setInput('');
            onCancelEdit?.();
        } else {
            onCancelReply?.();
        }
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
                            <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                            <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTypingUsers(typingUsers)}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Voice Recording UI */}
            <AnimatePresence>
                {isRecording && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="font-medium text-red-700 dark:text-red-400">
                                    Recording...
                                </span>
                                <span className="font-mono text-red-600 dark:text-red-300 text-sm">
                                    {formatDuration(recordingDuration)}
                                </span>
                            </div>
                            
                            {/* Recording Waveform Visualization */}
                            <div className="flex items-center gap-0.5 mx-4">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1 bg-red-400 rounded-full"
                                        animate={{
                                            height: [8, Math.random() * 20 + 8, 8],
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            repeat: Infinity,
                                            delay: i * 0.05,
                                        }}
                                    />
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={cancelRecording}
                                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition"
                                    title="Cancel recording"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={stopRecording}
                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                    title="Stop recording"
                                >
                                    <Square size={16} fill="white" />
                                </button>
                            </div>
                        </div>
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
                        ) : attachment.type === 'audio' ? (
                            <div className="flex items-center gap-3 flex-1">
                                {/* Audio preview with playback */}
                                <button
                                    type="button"
                                    onClick={toggleAudioPreview}
                                    className="h-12 w-12 bg-purple-500 text-white flex items-center justify-center rounded-full hover:bg-purple-600 transition shrink-0"
                                >
                                    {isPlayingPreview ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Mic size={14} className="text-purple-500" />
                                        <span className="text-sm font-bold dark:text-white">Voice Message</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        {/* Simple waveform visualization */}
                                        <div className="flex items-center gap-0.5 flex-1">
                                            {[...Array(30)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-1 bg-purple-300 dark:bg-purple-700 rounded-full"
                                                    style={{ height: `${Math.random() * 12 + 4}px` }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500 font-mono">
                                            {attachment.duration ? formatDuration(attachment.duration) : '0:00'}
                                        </span>
                                    </div>
                                </div>
                                <audio 
                                    ref={audioPreviewRef}
                                    src={attachment.previewUrl}
                                    onEnded={() => setIsPlayingPreview(false)}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <>
                                <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 text-gray-500 flex items-center justify-center rounded-lg">
                                    <FileText size={24}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold dark:text-white truncate">{attachment.file.name}</div>
                                    <div className="text-xs text-gray-500">{(attachment.file.size / 1024).toFixed(1)} KB</div>
                                </div>
                            </>
                        )}
                        <button 
                            onClick={() => {
                                setAttachment(null);
                                setIsPlayingPreview(false);
                            }}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition shrink-0"
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
