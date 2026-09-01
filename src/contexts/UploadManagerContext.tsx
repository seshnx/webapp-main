import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useAction } from 'convex/react';
import { useUser } from '@clerk/react';
import { api } from '../../convex/_generated/api';
import {
    uploadToPresignedUrl,
    compressImage,
    COMPRESSION_PRESETS,
    STORAGE_FOLDERS,
    type StorageFolder,
    type ImageCompressionOptions
} from '../config/storage';

// =====================================================
// TYPES
// =====================================================

export type UploadStatus = 'uploading' | 'processing' | 'completed' | 'error';

export interface BackgroundUploadTask {
    id: string;
    name: string;
    size: number;
    type: 'video' | 'audio' | 'image' | 'file';
    progress: number;
    status: UploadStatus;
    error?: string;
    url?: string;
    previewUrl?: string;
    startedAt: number;
    completedAt?: number;
    cancel?: () => void;
}

export interface StartUploadOptions {
    folder?: StorageFolder | string;
    compress?: boolean;
    compressionOptions?: ImageCompressionOptions;
    onSuccess?: (url: string, task: BackgroundUploadTask) => void;
    onError?: (error: string) => void;
    onProgress?: (progress: number) => void;
}

export interface UploadManagerContextType {
    tasks: BackgroundUploadTask[];
    activeCount: number;
    overallProgress: number;
    justFinished: boolean;
    startBackgroundUpload: (file: File, options?: StartUploadOptions) => Promise<string>;
    cancelUpload: (id: string) => void;
    dismissTask: (id: string) => void;
    clearCompleted: () => void;
}

const UploadManagerContext = createContext<UploadManagerContextType | null>(null);

// =====================================================
// PROVIDER COMPONENT
// =====================================================

export function UploadManagerProvider({ children }: { children: React.ReactNode }) {
    const [tasks, setTasks] = useState<BackgroundUploadTask[]>([]);
    const [justFinished, setJustFinished] = useState<boolean>(false);
    const prevActiveCountRef = useRef<number>(0);
    const finishedTimerRef = useRef<NodeJS.Timeout | null>(null);

    const { user } = useUser();
    const generateUploadUrlAction = useAction(api.storage.generateUploadUrl);
    const xhrMapRef = useRef<Map<string, XMLHttpRequest>>(new Map());

    // Active tasks count
    const activeTasks = tasks.filter(t => t.status === 'uploading' || t.status === 'processing');
    const activeCount = activeTasks.length;

    // Calculate weighted / average progress of active tasks
    const overallProgress = activeCount > 0
        ? Math.round(activeTasks.reduce((acc, t) => acc + t.progress, 0) / activeCount)
        : 100;

    // Detect when active tasks finish to trigger flashing green checkmark
    useEffect(() => {
        if (prevActiveCountRef.current > 0 && activeCount === 0) {
            // Check if at least one was completed successfully
            const hasSuccess = tasks.some(t => t.status === 'completed');
            if (hasSuccess) {
                setJustFinished(true);
                if (finishedTimerRef.current) clearTimeout(finishedTimerRef.current);
                finishedTimerRef.current = setTimeout(() => {
                    setJustFinished(false);
                }, 3500);
            }
        }
        prevActiveCountRef.current = activeCount;
    }, [activeCount, tasks]);

    // Helper: update task by ID
    const updateTask = useCallback((id: string, updates: Partial<BackgroundUploadTask>) => {
        setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
    }, []);

    // Dismiss a single task
    const dismissTask = useCallback((id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    }, []);

    // Clear all completed / errored tasks
    const clearCompleted = useCallback(() => {
        setTasks(prev => prev.filter(t => t.status === 'uploading' || t.status === 'processing'));
    }, []);

    // Cancel an ongoing upload
    const cancelUpload = useCallback((id: string) => {
        const xhr = xhrMapRef.current.get(id);
        if (xhr) {
            xhr.abort();
            xhrMapRef.current.delete(id);
        }
        updateTask(id, { status: 'error', error: 'Upload cancelled' });
    }, [updateTask]);

    // Start a background upload task
    const startBackgroundUpload = useCallback(async (
        file: File,
        options: StartUploadOptions = {}
    ): Promise<string> => {
        const taskId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        let mediaType: 'video' | 'audio' | 'image' | 'file' = 'file';
        if (file.type.startsWith('video/')) mediaType = 'video';
        else if (file.type.startsWith('audio/')) mediaType = 'audio';
        else if (file.type.startsWith('image/')) mediaType = 'image';

        const previewUrl = mediaType === 'image' || mediaType === 'video'
            ? URL.createObjectURL(file)
            : undefined;

        const initialTask: BackgroundUploadTask = {
            id: taskId,
            name: file.name,
            size: file.size,
            type: mediaType,
            progress: 0,
            status: 'uploading',
            previewUrl,
            startedAt: Date.now(),
            cancel: () => cancelUpload(taskId),
        };

        setTasks(prev => [initialTask, ...prev]);

        // Begin upload pipeline
        (async () => {
            try {
                let fileToUpload = file;

                const targetFolder = (options.folder || STORAGE_FOLDERS.POST_MEDIA) as string;
                const cleanFolder = targetFolder.replace(/^\/+/, '');

                // Step 0: Compress image if applicable
                if (
                    (options.compress ?? true) &&
                    file.type.startsWith('image/') &&
                    file.type !== 'image/svg+xml' &&
                    file.type !== 'image/gif'
                ) {
                    updateTask(taskId, { progress: 5 });
                    const isAvatarFolder =
                        targetFolder === STORAGE_FOLDERS.PROFILE_PHOTOS ||
                        targetFolder === STORAGE_FOLDERS.AVATARS ||
                        targetFolder.includes('profile') ||
                        targetFolder.includes('avatar') ||
                        targetFolder.includes('logo');

                    const compressionOpts =
                        options.compressionOptions ||
                        (isAvatarFolder ? COMPRESSION_PRESETS.AVATAR : COMPRESSION_PRESETS.STANDARD);

                    fileToUpload = await compressImage(file, compressionOpts);
                }

                // Derive username & unique storage key
                const rawUserName =
                    user?.username ||
                    user?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
                    user?.id ||
                    'anonymous';
                const userFolder = rawUserName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

                const timestamp = Date.now();
                const sanitizedName = fileToUpload.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                const randomSuffix = Math.random().toString(36).substring(2, 8);
                const customFileName = `${timestamp}_${randomSuffix}_${sanitizedName}`;

                const key = cleanFolder.startsWith('user-media/')
                    ? `${cleanFolder}/${customFileName}`
                    : `user-media/${userFolder}/${cleanFolder}/${customFileName}`;

                // Step 1: Request presigned URL from Convex
                updateTask(taskId, { progress: 10 });
                const { uploadUrl, fileUrl, cacheControl } = await generateUploadUrlAction({
                    key,
                    contentType: fileToUpload.type || 'application/octet-stream',
                });

                // Step 2: Upload directly to R2 with XMLHttpRequest
                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhrMapRef.current.set(taskId, xhr);

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const percent = Math.round((event.loaded / event.total) * 85) + 10;
                            updateTask(taskId, { progress: percent });
                            options.onProgress?.(percent);
                        }
                    };

                    xhr.onload = () => {
                        xhrMapRef.current.delete(taskId);
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve();
                        } else {
                            reject(new Error(`Upload failed with status ${xhr.status}`));
                        }
                    };

                    xhr.onerror = () => {
                        xhrMapRef.current.delete(taskId);
                        reject(new Error('Network error during upload'));
                    };

                    xhr.onabort = () => {
                        xhrMapRef.current.delete(taskId);
                        reject(new Error('Upload aborted'));
                    };

                    xhr.open('PUT', uploadUrl);
                    xhr.setRequestHeader('Content-Type', fileToUpload.type || 'application/octet-stream');
                    if (cacheControl) {
                        xhr.setRequestHeader('Cache-Control', cacheControl);
                    }
                    xhr.send(fileToUpload);
                });

                // Step 3: Transition to processing state if large media
                if (mediaType === 'video' || file.size > 20 * 1024 * 1024) {
                    updateTask(taskId, { status: 'processing', progress: 95 });
                    await new Promise(r => setTimeout(r, 1200));
                }

                // Step 4: Complete
                updateTask(taskId, {
                    status: 'completed',
                    progress: 100,
                    url: fileUrl,
                    completedAt: Date.now(),
                });

                options.onSuccess?.(fileUrl, {
                    ...initialTask,
                    status: 'completed',
                    progress: 100,
                    url: fileUrl,
                    completedAt: Date.now(),
                });

                // Auto-dismiss completed task from notifications after 60 seconds
                setTimeout(() => {
                    dismissTask(taskId);
                }, 60000);

            } catch (err: any) {
                const errorMsg = err.message || 'Upload failed';
                updateTask(taskId, { status: 'error', error: errorMsg });
                options.onError?.(errorMsg);
            }
        })();

        return taskId;
    }, [user, generateUploadUrlAction, updateTask, cancelUpload, dismissTask]);

    return (
        <UploadManagerContext.Provider
            value={{
                tasks,
                activeCount,
                overallProgress,
                justFinished,
                startBackgroundUpload,
                cancelUpload,
                dismissTask,
                clearCompleted,
            }}
        >
            {children}
        </UploadManagerContext.Provider>
    );
}

// =====================================================
// HOOK
// =====================================================

export function useUploadManager() {
    const context = useContext(UploadManagerContext);
    if (!context) {
        throw new Error('useUploadManager must be used within an UploadManagerProvider');
    }
    return context;
}
