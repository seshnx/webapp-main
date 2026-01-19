import { useState, useCallback } from 'react';
import { 
    Image, Upload, Trash2, Star, 
    Loader2, X, Plus, Eye, Move
} from 'lucide-react';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import toast from 'react-hot-toast';

/**
 * StudioGallery - Photo gallery management for studio
 */
export default function StudioGallery({ user, userData, onUpdate }) {
    const [photos, setPhotos] = useState(userData?.studioPhotos || []);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const { uploadMedia, uploading } = useMediaUpload();
    const userId = user?.id || user?.uid;

    const savePhotos = useCallback(async (updatedPhotos) => {
        if (!supabase) return false;
        try {
            await supabase
                .from('profiles')
                .update({ 
                    studio_photos: updatedPhotos,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);
            
            setPhotos(updatedPhotos);
            if (onUpdate) onUpdate({ studioPhotos: updatedPhotos });
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save photos');
            return false;
        }
    }, [userId, onUpdate]);

    const handleUpload = useCallback(async (files) => {
        if (!files || files.length === 0) return;
        
        const maxPhotos = 12;
        if (photos.length >= maxPhotos) {
            toast.error(`Maximum ${maxPhotos} photos allowed`);
            return;
        }

        const toastId = toast.loading('Uploading photos...');
        
        const newPhotos = [];
        
        for (const file of Array.from(files).slice(0, maxPhotos - photos.length)) {
            // Validate file
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image`);
                continue;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is too large (max 5MB)`);
                continue;
            }

            try {
                const timestamp = Date.now();
                const result = await uploadMedia(file, `studio/gallery/${userId}`);
                
                if (result?.url) {
                    newPhotos.push({
                        id: timestamp.toString(),
                        url: result.url,
                        path: result.storageRef || `studio/gallery/${userId}/${timestamp}_${file.name}`,
                        filename: file.name,
                        caption: '',
                        isCover: photos.length === 0 && newPhotos.length === 0, // First photo is cover
                        uploadedAt: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error('Upload error:', error);
                toast.error(`Failed to upload ${file.name}`);
            }
        }

        if (newPhotos.length > 0) {
            const success = await savePhotos([...photos, ...newPhotos]);
            if (success) {
                toast.success(`${newPhotos.length} photo(s) uploaded!`, { id: toastId });
            }
        } else {
            toast.dismiss(toastId);
        }
        
        setUploadProgress(0);
    }, [photos, userId, savePhotos, uploadMedia]);

    const handleDelete = async (photoIndex) => {
        const photo = photos[photoIndex];
        if (!confirm('Delete this photo?')) return;
        
        const toastId = toast.loading('Deleting...');
        
        try {
            // Note: File deletion from MinIO storage should be handled by backend API
            // For now, we just remove it from the database
            
            // Update photos array
            let updatedPhotos = photos.filter((_, i) => i !== photoIndex);
            
            // If we deleted the cover photo, make the first remaining photo the cover
            if (photo.isCover && updatedPhotos.length > 0) {
                updatedPhotos = updatedPhotos.map((p, i) => ({ ...p, isCover: i === 0 }));
            }
            
            await savePhotos(updatedPhotos);
            toast.success('Photo deleted', { id: toastId });
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete photo', { id: toastId });
        }
    };

    const handleSetCover = async (photoIndex) => {
        const updatedPhotos = photos.map((p, i) => ({ ...p, isCover: i === photoIndex }));
        await savePhotos(updatedPhotos);
        toast.success('Cover photo updated');
    };

    // Caption editing can be added as a future enhancement
    // const handleUpdateCaption = async (photoIndex, caption) => { ... }

    const handleDragStart = (index) => {
        setDraggingIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggingIndex === null || draggingIndex === index) return;
        
        const reorderedPhotos = [...photos];
        const [draggedPhoto] = reorderedPhotos.splice(draggingIndex, 1);
        reorderedPhotos.splice(index, 0, draggedPhoto);
        
        setPhotos(reorderedPhotos);
        setDraggingIndex(index);
    };

    const handleDragEnd = async () => {
        if (draggingIndex !== null) {
            await savePhotos(photos);
            setDraggingIndex(null);
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const files = e.dataTransfer?.files;
        if (files) handleUpload(files);
    };

    const coverPhoto = photos.find(p => p.isCover) || photos[0];

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Image className="text-brand-blue" size={24} />
                        Photo Gallery
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Showcase your studio with up to 12 photos
                    </p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {photos.length}/12 photos
                </span>
            </div>

            {/* Cover Photo Preview */}
            {coverPhoto && (
                <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800 group">
                    <img
                        src={coverPhoto.url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-4 left-4 text-white">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                Cover Photo
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    uploading 
                        ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-brand-blue hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                }`}
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                {uploading ? (
                    <div className="space-y-3">
                        <Loader2 className="mx-auto animate-spin text-brand-blue" size={40} />
                        <div className="w-full max-w-xs mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                                className="bg-brand-blue h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-500">Uploading... {Math.round(uploadProgress)}%</p>
                    </div>
                ) : (
                    <>
                        <Upload className="mx-auto text-gray-400 mb-3" size={40} />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                            Drag & drop images here, or
                        </p>
                        <label className="cursor-pointer">
                            <span className="text-brand-blue font-bold hover:underline">browse files</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleUpload(e.target.files)}
                                disabled={uploading}
                            />
                        </label>
                        <p className="text-xs text-gray-400 mt-2">
                            JPG, PNG or WebP. Max 5MB per file.
                        </p>
                    </>
                )}
            </div>

            {/* Photo Grid */}
            {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                        <div
                            key={photo.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`relative aspect-square rounded-xl overflow-hidden group bg-gray-100 dark:bg-gray-800 cursor-move ${
                                draggingIndex === index ? 'opacity-50 ring-2 ring-brand-blue' : ''
                            }`}
                        >
                            <img
                                src={photo.url}
                                alt={photo.caption || `Studio photo ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            
                            {/* Cover badge */}
                            {photo.isCover && (
                                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                    <Star size={12} className="fill-white" /> Cover
                                </div>
                            )}
                            
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setSelectedPhoto(photo)}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition"
                                    title="View"
                                >
                                    <Eye size={18} />
                                </button>
                                {!photo.isCover && (
                                    <button
                                        onClick={() => handleSetCover(index)}
                                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition"
                                        title="Set as cover"
                                    >
                                        <Star size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(index)}
                                    className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Drag handle */}
                            <div className="absolute top-2 right-2 p-1 bg-black/40 rounded text-white opacity-0 group-hover:opacity-100 transition">
                                <Move size={14} />
                            </div>
                        </div>
                    ))}

                    {/* Add more button */}
                    {photos.length < 12 && (
                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-blue transition cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-brand-blue">
                            <Plus size={32} />
                            <span className="text-xs mt-1">Add Photo</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleUpload(e.target.files)}
                                disabled={uploading}
                            />
                        </label>
                    )}
                </div>
            )}

            {/* Empty state */}
            {photos.length === 0 && !uploading && (
                <div className="text-center py-8 text-gray-400">
                    <Image size={48} className="mx-auto mb-3 opacity-30" />
                    <p>No photos uploaded yet</p>
                    <p className="text-sm">Add photos to attract more clients</p>
                </div>
            )}

            {/* Photo Lightbox */}
            {selectedPhoto && (
                <div 
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedPhoto.url}
                        alt={selectedPhoto.caption || 'Studio photo'}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {selectedPhoto.caption && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-xl">
                            {selectedPhoto.caption}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
