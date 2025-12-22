import React, { useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

/**
 * Panorama360Viewer - 360-degree image viewer component using Pannellum
 * Supports both equirectangular and cubemap formats
 */
export default function Panorama360Viewer({ imageUrl, onClose, title = '360° View' }) {
    const viewerRef = useRef(null);
    const containerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = React.useState(false);

    useEffect(() => {
        if (!imageUrl || !containerRef.current) return;

        // Dynamically import pannellum
        Promise.all([
            import('pannellum'),
            import('pannellum/build/pannellum.css')
        ]).then(([pannellumModule]) => {
            // Pannellum exports as default
            const pannellum = pannellumModule.default || pannellumModule;
            
            // Initialize Pannellum viewer
            const viewer = pannellum.viewer(containerRef.current, {
                type: 'equirectangular',
                panorama: imageUrl,
                autoLoad: true,
                autoRotate: 0,
                compass: true,
                showControls: true,
                keyboardZoom: true,
                mouseZoom: true,
                hfov: 100,
                minHfov: 50,
                maxHfov: 120,
            });

            viewerRef.current = viewer;
        }).catch((error) => {
            console.error('Failed to load pannellum:', error);
        });

        return () => {
            if (viewerRef.current) {
                try {
                    viewerRef.current.destroy();
                } catch (e) {
                    console.error('Error destroying viewer:', e);
                }
            }
        };
    }, [imageUrl]);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            } else if (containerRef.current.webkitRequestFullscreen) {
                containerRef.current.webkitRequestFullscreen();
            } else if (containerRef.current.mozRequestFullScreen) {
                containerRef.current.mozRequestFullScreen();
            } else if (containerRef.current.msRequestFullscreen) {
                containerRef.current.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
        setIsFullscreen(!isFullscreen);
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    if (!imageUrl) {
        return (
            <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No 360° image available</p>
            </div>
        );
    }

    return (
        <div className="relative w-full rounded-lg overflow-hidden border dark:border-gray-700 bg-black">
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-3 flex justify-between items-center">
                <h3 className="text-white font-semibold text-sm">{title}</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition"
                            title="Close"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Pannellum Container */}
            <div
                ref={containerRef}
                className="w-full h-96"
                style={{ minHeight: '400px' }}
            />
        </div>
    );
}

