import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedNumber - Animates a number from 0 to the target value
 * Separated into its own file to avoid TDZ issues during module initialization
 */
export default function AnimatedNumber({ value, duration = 1000 }) {
    const [displayValue, setDisplayValue] = useState(0);
    const animationFrameRef = useRef(null);
    
    useEffect(() => {
        let startTime;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setDisplayValue(Math.floor(progress * value));
            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };
        animationFrameRef.current = requestAnimationFrame(animate);
        
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [value, duration]);
    
    return <span>{displayValue.toLocaleString()}</span>;
}

