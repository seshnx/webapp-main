import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import { Play, Pause, AlertCircle, Music, Lock, Loader2 } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import Fevicon from '../../assets/Fevicon.png';

// ============== TYPE DEFINITIONS ==============

/**
 * Represents a single star in the starfield animation
 */
interface Star {
    x: number;
    y: number;
    z: number;
}

/**
 * Theme configuration for dark and light modes
 */
interface ThemeColors {
    star: string;
    star2: string;
    special: string;
    wave: string;
}

interface ThemeConfig {
    dark: ThemeColors;
    light: ThemeColors;
}

/**
 * Internal state for the starfield animation
 */
interface StarFieldState {
    stars: Star[];
    avg: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
}

/**
 * Props for the StarFieldVisualizer component
 */
interface StarFieldVisualizerProps {
    /** URL of the audio file to visualize */
    audioUrl: string;
    /** Display name for the audio track */
    fileName?: string;
    /** Whether to disable interaction (preview mode) */
    previewMode?: boolean;
}

/**
 * Custom event for global audio play coordination
 */
interface AudioPlayEventDetail {
    id: string;
}

// ============== CONSTANTS ==============

const THEME_CONFIG: ThemeConfig = {
    dark: {
        star: "rgba(255, 255, 255, 0.5)",
        star2: "rgba(255, 255, 255, 0.8)",
        special: "#3D84ED",
        wave: "rgba(255, 255, 255, 0.3)"
    },
    light: {
        star: "rgba(0, 0, 0, 0.5)",
        star2: "rgba(0, 0, 0, 0.8)",
        special: "#2563EB",
        wave: "rgba(0, 0, 0, 0.2)"
    }
};

const TOTAL_STARS = 400;
const STARS_BREAK_POINT = 120;
const AVG_BREAK_POINT = 80;

// ============== COMPONENT ==============

/**
 * StarFieldVisualizer - An audio visualization component with animated starfield
 * Features:
 * - WaveSurfer.js integration for waveform display
 * - Canvas-based star field animation that reacts to audio frequencies
 * - Dark/light mode theme detection and switching
 * - Global audio coordination (only one player plays at a time)
 */
export default function StarFieldVisualizer({
    audioUrl,
    fileName = "Audio Track",
    previewMode = false
}: StarFieldVisualizerProps) {
    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);
    const animationRef = useRef<number | null>(null);

    // Unique ID for this player instance to identify itself in global events
    const playerId = useRef(Math.random().toString(36).substr(2, 9));

    // Audio Context Refs
    const contextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    // State
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [corsError, setCorsError] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // Theme Detection State
    const [isDarkMode, setIsDarkMode] = useState<boolean>(
        document.documentElement.classList.contains('dark')
    );
    const themeRef = useRef<boolean>(isDarkMode);

    // Starfield State
    const state = useRef<StarFieldState>({
        stars: [],
        avg: 0,
        width: 0,
        height: 0,
        cx: 0,
        cy: 0
    });

    // ============== THEME LISTENER ==============
    useEffect(() => {
        const observer = new MutationObserver((mutations: MutationRecord[]) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isDark = document.documentElement.classList.contains('dark');
                    setIsDarkMode(isDark);
                    themeRef.current = isDark;
                    if (wavesurfer.current) {
                        wavesurfer.current.setOptions({
                            waveColor: isDark ? THEME_CONFIG.dark.wave : THEME_CONFIG.light.wave
                        });
                    }
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, []);

    // ============== WAVESURFER & GLOBAL AUDIO MANAGEMENT ==============
    useEffect(() => {
        if (!audioRef.current || !waveformRef.current) return;

        const currentTheme = isDarkMode ? THEME_CONFIG.dark : THEME_CONFIG.light;

        wavesurfer.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: currentTheme.wave,
            progressColor: '#3D84ED',
            cursorColor: '#3D84ED',
            barWidth: 4,
            barGap: 3,
            barRadius: 3,
            height: 100,
            normalize: true,
            backend: 'MediaElement',
            media: audioRef.current,
            minPxPerSec: 50,
            fillParent: true,
            interact: !previewMode,
            cursorWidth: 2,
            barAlign: 'bottom',
        } as any);

        // --- GLOBAL EVENT LISTENER ---
        // When another player starts, this function runs. If the ID doesn't match ours, we pause.
        const handleGlobalPlay = (e: Event) => {
            const customEvent = e as CustomEvent<AudioPlayEventDetail>;
            if (
                customEvent.detail.id !== playerId.current &&
                wavesurfer.current &&
                wavesurfer.current.isPlaying()
            ) {
                wavesurfer.current.pause();
            }
        };

        window.addEventListener('seshnx-audio-play', handleGlobalPlay);

        wavesurfer.current.on('ready', () => setIsReady(true));

        wavesurfer.current.on('play', () => {
            setIsPlaying(true);
            // Broadcast to all other players that WE are playing
            window.dispatchEvent(
                new CustomEvent('seshnx-audio-play', { detail: { id: playerId.current } })
            );
        });

        wavesurfer.current.on('pause', () => setIsPlaying(false));

        wavesurfer.current.on('finish', () => {
            setIsPlaying(false);
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
            }
        });

        return () => {
            window.removeEventListener('seshnx-audio-play', handleGlobalPlay);
            if (wavesurfer.current) wavesurfer.current.destroy();
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [audioUrl, previewMode, isDarkMode]);

    // ============== STARFIELD SETUP ==============
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                canvasRef.current.width = clientWidth;
                canvasRef.current.height = clientHeight;
                state.current.width = clientWidth;
                state.current.height = clientHeight;
                state.current.cx = clientWidth / 2;
                state.current.cy = clientHeight / 2;
                initStars();
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (contextRef.current && contextRef.current.state !== 'closed') {
                contextRef.current.close();
            }
        };
    }, []);

    const initStars = () => {
        state.current.stars = [];
        for (let i = 0; i < TOTAL_STARS; i++) {
            state.current.stars.push({
                x: Math.random() * state.current.width - state.current.cx,
                y: Math.random() * state.current.height - state.current.cy,
                z: Math.random() * state.current.width
            });
        }
    };

    const setupAudioAnalysis = () => {
        if (isInitialized || corsError || !audioRef.current) return;

        try {
            const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
            contextRef.current = new AudioContextCtor();
            analyserRef.current = contextRef.current.createAnalyser();
            analyserRef.current.fftSize = 2048;
            sourceRef.current = contextRef.current.createMediaElementSource(audioRef.current);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(contextRef.current.destination);
            setIsInitialized(true);
        } catch (e) {
            console.warn("Audio Context Error:", e);
        }
    };

    const togglePlay = async (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        if (!isInitialized) setupAudioAnalysis();
        if (contextRef.current?.state === 'suspended') {
            await contextRef.current.resume();
        }
        if (wavesurfer.current) wavesurfer.current.playPause();
        if (!isPlaying) renderLoop();
    };

    const renderLoop = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const { width: w, height: h, cx, cy, stars } = state.current;

        let avg = 0;
        if (analyserRef.current) {
            const bufferLength = analyserRef.current.frequencyBinCount;
            const freqData = new Uint8Array(bufferLength);
            analyserRef.current.getByteFrequencyData(freqData);
            let sum = 0;
            for (let i = 0; i < freqData.length; i++) sum += freqData[i];
            avg = sum / freqData.length;
        }
        state.current.avg = avg;

        // Clear canvas
        ctx.clearRect(0, 0, w, h);

        const theme = themeRef.current ? THEME_CONFIG.dark : THEME_CONFIG.light;
        const speed = avg > AVG_BREAK_POINT ? avg / 10 : avg / 30 + 0.5;

        stars.forEach((star) => {
            star.z -= speed;
            if (star.z <= 0) {
                star.z = w;
                star.x = Math.random() * w - cx;
                star.y = Math.random() * h - cy;
            }

            const x = (star.x / star.z) * w + cx;
            const y = (star.y / star.z) * h + cy;
            const size = (1 - star.z / w) * 2.5;

            if (x >= 0 && x <= w && y >= 0 && y <= h) {
                ctx.fillStyle = avg > STARS_BREAK_POINT ? theme.special : theme.star;
                ctx.globalAlpha = 1 - star.z / w;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        });

        if (wavesurfer.current && wavesurfer.current.isPlaying()) {
            animationRef.current = requestAnimationFrame(renderLoop);
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-32 rounded-xl overflow-hidden group bg-transparent transition-colors"
        >
            {/* 1. BACKGROUND: Transparent Starfield */}
            <canvas
                ref={canvasRef}
                className="w-full h-full absolute inset-0 z-0 pointer-events-none"
            />

            {/* 2. FOREGROUND: Wavesurfer */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end pointer-events-none">
                <div
                    ref={waveformRef}
                    className="w-full pointer-events-auto opacity-80 hover:opacity-100 transition-opacity"
                />
            </div>

            {/* 3. OVERLAY: Header Info */}
            <div className="absolute top-0 left-0 right-0 p-3 z-30 flex justify-between items-start pointer-events-none">
                <div className="flex items-center gap-2 text-black dark:text-white/90">
                    <Music size={16} className="text-brand-blue" />
                    <span className="text-sm font-medium truncate max-w-[200px] shadow-sm">
                        {fileName}
                    </span>
                    {previewMode && (
                        <span className="text-[10px] bg-yellow-500 text-black px-2 rounded font-bold flex items-center gap-1">
                            <Lock size={8} /> PREVIEW
                        </span>
                    )}
                </div>
                {corsError && (
                    <div className="bg-red-500/80 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertCircle size={10} /> Visuals Disabled
                    </div>
                )}
            </div>

            {/* 4. BRANDING: Favicon (Bottom Left) */}
            <div className="absolute bottom-2 left-2 z-30 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none">
                <img src={Fevicon} alt="SeshNx" className="w-5 h-5 object-contain" />
            </div>

            {/* 5. OVERLAY: Controls Layer */}
            <div
                className={`absolute inset-0 z-40 flex items-center justify-center transition-opacity duration-300 pointer-events-none
                ${isPlaying ? 'opacity-0 group-hover:opacity-100 bg-white/20 dark:bg-black/20' : 'opacity-100 bg-white/10 dark:bg-black/10'}`}
            >
                {!isReady ? (
                    <Loader2 className="animate-spin text-brand-blue" size={32} />
                ) : (
                    <button
                        onClick={togglePlay}
                        className="w-14 h-14 bg-white/80 dark:bg-black/40 rounded-full flex items-center justify-center border border-gray-200 dark:border-white/40 text-brand-blue shadow-lg hover:scale-110 transition-transform pointer-events-auto"
                    >
                        {isPlaying ? (
                            <Pause fill="currentColor" className="ml-0.5" size={24} />
                        ) : (
                            <Play fill="currentColor" className="ml-1" size={24} />
                        )}
                    </button>
                )}
            </div>

            {/* HIDDEN AUDIO ELEMENT */}
            <audio
                ref={audioRef}
                src={audioUrl}
                crossOrigin="anonymous"
                onError={() => setCorsError(true)}
            />
        </div>
    );
}
