import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for undo/redo functionality
 * @param {*} initialState - Initial state value
 * @param {number} maxHistory - Maximum number of history entries (default: 50)
 * @returns {Object} - { state, setState, undo, redo, canUndo, canRedo, clearHistory }
 */
export function useUndoRedo(initialState, maxHistory = 50) {
    const [state, setState] = useState(initialState);
    const historyRef = useRef([initialState]);
    const historyIndexRef = useRef(0);

    const setStateWithHistory = useCallback((newState) => {
        // If we're not at the end of history, remove future states
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        }

        // Add new state to history
        historyRef.current.push(newState);

        // Limit history size
        if (historyRef.current.length > maxHistory) {
            historyRef.current.shift();
        } else {
            historyIndexRef.current++;
        }

        setState(newState);
    }, [maxHistory]);

    const undo = useCallback(() => {
        if (historyIndexRef.current > 0) {
            historyIndexRef.current--;
            setState(historyRef.current[historyIndexRef.current]);
        }
    }, []);

    const redo = useCallback(() => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current++;
            setState(historyRef.current[historyIndexRef.current]);
        }
    }, []);

    const canUndo = historyIndexRef.current > 0;
    const canRedo = historyIndexRef.current < historyRef.current.length - 1;

    const clearHistory = useCallback(() => {
        historyRef.current = [state];
        historyIndexRef.current = 0;
    }, [state]);

    return {
        state,
        setState: setStateWithHistory,
        undo,
        redo,
        canUndo,
        canRedo,
        clearHistory
    };
}

