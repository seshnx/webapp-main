import React from 'react';

/**
 * AnimatedNumber - Displays a formatted number
 * Simplified to avoid TDZ issues - animation removed temporarily
 */
export default function AnimatedNumber({ value }) {
    // Direct display without animation to avoid TDZ issues with useState during module initialization
    return <span>{value.toLocaleString()}</span>;
}

