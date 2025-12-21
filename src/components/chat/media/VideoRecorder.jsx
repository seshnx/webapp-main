import React, { useState, useRef, useEffect } from 'react';
import { Video, StopCircle, X, Check, Loader2, Camera, CameraOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Video message recorder component
 * Records short video clips for messages
 */
export default function VideoRecorder({ 
    onRecorded, 
    onClose,
    maxDuration = 60 // seconds
}) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [hasPermission, setHasPermission] = useState(null);
    const [error, setError] = useState(null);
    
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    // Request camera/mic access
    useEffect(() => {
        requestPermissions();
        return () => {
            cleanup();
        };
    }, []);

    const requestPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' },
                audio: true 
            });
            streamRef.current = stream;
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setHasPermission(true);
            setError(null);
        } catch (err) {
            console.error('Permission error:', err);
            setHasPermission(false);
            setError('Camera/microphone access denied');
        }
    };

    const cleanup = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    const startRecording = async () => {
        if (!streamRef.current) {
            await requestPermissions();
            return;
        }

        try {
            chunksRef.current = [];
            const options = {
                mimeType: 'video/webm;codecs=vp9,opus',
                videoBitsPerSecond: 2500000
            };

            mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
            
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                setRecordedBlob(blob);
                setIsRecording(false);
                setRecordingTime(0);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    const newTime = prev + 1;
                    if (newTime >= maxDuration) {
                        stopRecording();
                    }
                    return newTime;
                });
            }, 1000);

        } catch (err) {
            console.error('Recording error:', err);
            setError('Failed to start recording');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
    };

    const handleDiscard = () => {
        setRecordedBlob(null);
        setRecordingTime(0);
        setIsRecording(false);
    };

    const handleSend = () => {
        if (recordedBlob) {
            const file = new File([recordedBlob], `video_${Date.now()}.webm`, { type: 'video/webm' });
            onRecorded?.(file);
            cleanup();
            onClose?.();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!hasPermission && hasPermission !== null) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-[#2c2e36] rounded-2xl p-6 max-w-sm"
                >
                    <div className="text-center">
                        <CameraOff size={48} className="text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold dark:text-white mb-2">Camera Access Required</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Please allow camera and microphone access to record video messages.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={requestPermissions}
                                className="flex-1 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition"
                            >
                                Allow Access
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[80]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-2xl aspect-video bg-black rounded-2xl overflow-hidden"
            >
                {/* Video preview */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />

                {/* Recording overlay */}
                {isRecording && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-sm font-bold">{formatTime(recordingTime)}</span>
                    </div>
                )}

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-center gap-4">
                        {!recordedBlob ? (
                            <>
                                {!isRecording ? (
                                    <>
                                        <button
                                            onClick={onClose}
                                            className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition"
                                        >
                                            <X size={24} />
                                        </button>
                                        <button
                                            onClick={startRecording}
                                            className="p-4 bg-red-500 hover:bg-red-600 rounded-full text-white transition shadow-lg"
                                        >
                                            <Video size={28} />
                                        </button>
                                        <div className="w-12" /> {/* Spacer */}
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleDiscard}
                                            className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition"
                                        >
                                            <X size={24} />
                                        </button>
                                        <button
                                            onClick={stopRecording}
                                            className="p-4 bg-red-500 hover:bg-red-600 rounded-full text-white transition shadow-lg animate-pulse"
                                        >
                                            <StopCircle size={28} />
                                        </button>
                                        <div className="w-12" /> {/* Spacer */}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleDiscard}
                                    className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition"
                                >
                                    <X size={24} />
                                </button>
                                <button
                                    onClick={handleSend}
                                    className="p-4 bg-green-500 hover:bg-green-600 rounded-full text-white transition shadow-lg"
                                >
                                    <Check size={28} />
                                </button>
                                <div className="w-12" /> {/* Spacer */}
                            </>
                        )}
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
                        {error}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

