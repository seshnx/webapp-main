import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Video, FileText, Music, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { rtdb } from '../../../config/firebase';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Media gallery component to view all shared media in a chat
 */
export default function MediaGallery({ 
    chatId, 
    onClose,
    onMediaSelect 
}) {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all' | 'images' | 'videos' | 'audio' | 'files'

    useEffect(() => {
        if (!chatId || !rtdb) return;

        const messagesRef = query(
            ref(rtdb, `messages/${chatId}`),
            orderByChild('t'),
            limitToLast(500)
        );

        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messages = Object.entries(data).map(([id, msg]) => ({
                    id,
                    ...msg
                }));
                const mediaItems = messages
                    .filter(msg => msg.media && !msg.deleted && !msg.deletedForAll)
                    .map(msg => ({
                        id: msg.id,
                        ...msg.media,
                        messageId: msg.id,
                        timestamp: msg.t,
                        sender: msg.n
                    }))
                    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)); // Sort by timestamp ascending (oldest first)
                
                setMedia(mediaItems);
            } else {
                setMedia([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [chatId, rtdb]);

    const filteredMedia = filter === 'all' 
        ? media 
        : media.filter(item => {
            if (filter === 'images') return item.type === 'image';
            if (filter === 'videos') return item.type === 'video';
            if (filter === 'audio') return item.type === 'audio';
            if (filter === 'files') return item.type === 'file';
            return true;
        });

    const handleMediaClick = (item) => {
        setSelectedMedia(item);
        if (onMediaSelect) {
            onMediaSelect(item);
        }
    };

    const handleDownload = (item) => {
        const link = document.createElement('a');
        link.href = item.url;
        link.download = item.name || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#2c2e36] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-lg dark:text-white">Media Gallery</h3>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-3 border-b dark:border-gray-700 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
                    {[
                        { key: 'all', label: 'All', icon: null },
                        { key: 'images', label: 'Images', icon: ImageIcon },
                        { key: 'videos', label: 'Videos', icon: Video },
                        { key: 'audio', label: 'Audio', icon: Music },
                        { key: 'files', label: 'Files', icon: FileText }
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                                filter === f.key
                                    ? 'bg-brand-blue text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                            }`}
                        >
                            {f.icon && <f.icon size={16} />}
                            {f.label}
                            <span className="text-xs opacity-70">
                                ({filteredMedia.filter(m => f.key === 'all' || m.type === f.key).length})
                            </span>
                        </button>
                    ))}
                </div>

                {/* Media Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mb-2" />
                            <p className="text-sm text-gray-500">Loading media...</p>
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ImageIcon size={48} className="mb-4 opacity-30" />
                            <p className="text-sm">No media found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {filteredMedia.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleMediaClick(item)}
                                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group"
                                >
                                    {item.type === 'image' ? (
                                        <img 
                                            src={item.url} 
                                            alt="Media" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : item.type === 'video' ? (
                                        <video 
                                            src={item.url} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : item.type === 'audio' ? (
                                        <div className="w-full h-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                                            <Music size={32} className="text-purple-600 dark:text-purple-400" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                                            <FileText size={32} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                                        <Download 
                                            size={20} 
                                            className="text-white opacity-0 group-hover:opacity-100 transition"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Media Viewer Modal */}
            <AnimatePresence>
                {selectedMedia && (
                    <MediaViewer
                        media={selectedMedia}
                        onClose={() => setSelectedMedia(null)}
                        onDownload={handleDownload}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Full-screen media viewer
 */
function MediaViewer({ media, onClose, onDownload }) {
    const [allMedia, setAllMedia] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Get all media items from gallery context (simplified - in real app, pass from parent)
        // For now, just show the selected media
        setAllMedia([media]);
        setCurrentIndex(0);
    }, [media]);

    const nextMedia = () => {
        if (currentIndex < allMedia.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevMedia = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const current = allMedia[currentIndex] || media;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[90] flex items-center justify-center"
            onClick={onClose}
        >
            <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition z-10"
                >
                    <X size={24} />
                </button>

                {current.type === 'image' && (
                    <img 
                        src={current.url} 
                        alt="Media" 
                        className="max-w-full max-h-full object-contain rounded-lg"
                    />
                )}

                {current.type === 'video' && (
                    <video 
                        src={current.url} 
                        controls 
                        className="max-w-full max-h-full rounded-lg"
                        autoPlay
                    />
                )}

                {current.type === 'audio' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md">
                        <div className="w-32 h-32 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Music size={48} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <audio src={current.url} controls className="w-full" autoPlay />
                        <p className="text-center mt-4 text-sm text-gray-500">{current.name}</p>
                    </div>
                )}

                {current.type === 'file' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md text-center">
                        <FileText size={64} className="text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                        <h4 className="text-lg font-bold dark:text-white mb-2">{current.name}</h4>
                        <a 
                            href={current.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block mt-4 px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition"
                        >
                            Open File
                        </a>
                    </div>
                )}

                {/* Navigation arrows */}
                {allMedia.length > 1 && (
                    <>
                        <button
                            onClick={prevMedia}
                            disabled={currentIndex === 0}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-30 transition"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextMedia}
                            disabled={currentIndex === allMedia.length - 1}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-30 transition"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Download button */}
                <button
                    onClick={() => onDownload(current)}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                >
                    <Download size={20} />
                </button>
            </div>
        </motion.div>
    );
}

