import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';

/**
 * Audio waveform visualizer component
 * Displays waveform for voice messages
 */
export default function AudioWaveform({ 
    audioUrl, 
    color = 'brand-blue',
    height = 40 
}) {
    const canvasRef = useRef(null);
    const audioRef = useRef(null);
    const animationRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!audioUrl || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const audio = new Audio(audioUrl);

        audioRef.current = audio;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = height;

        // Create audio context for visualization
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);

        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        // Visualize
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (audio.paused) {
                // Draw static waveform when paused
                drawStaticWaveform(ctx, canvas.width, canvas.height);
                return;
            }

            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = canvas.width / bufferLength * 2;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;

                const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, '#3b82f6'); // brand-blue
                gradient.addColorStop(1, '#8b5cf6'); // purple

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
                x += barWidth;
            }
        };

        audio.addEventListener('play', () => {
            setIsPlaying(true);
            draw();
        });

        audio.addEventListener('pause', () => {
            setIsPlaying(false);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            drawStaticWaveform(ctx, canvas.width, canvas.height);
        });

        audio.addEventListener('ended', () => {
            setIsPlaying(false);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            drawStaticWaveform(ctx, canvas.width, canvas.height);
        });

        // Initial static waveform
        drawStaticWaveform(ctx, canvas.width, canvas.height);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            audio.pause();
            audioContextRef.current?.close();
        };
    }, [audioUrl, height, isPlaying]);

    const drawStaticWaveform = (ctx, width, height) => {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#3b82f6';
        
        const barCount = 50;
        const barWidth = width / barCount;
        const gap = 2;

        for (let i = 0; i < barCount; i++) {
            const barHeight = Math.random() * height * 0.3 + height * 0.1;
            const x = i * barWidth;
            ctx.fillRect(x, height - barHeight, barWidth - gap, barHeight);
        }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center bg-brand-blue text-white rounded-full hover:bg-blue-600 transition shrink-0"
            >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <div className="flex-1">
                <canvas
                    ref={canvasRef}
                    className="w-full rounded"
                    style={{ height: `${height}px` }}
                />
                <audio ref={audioRef} src={audioUrl} />
            </div>
        </div>
    );
}

