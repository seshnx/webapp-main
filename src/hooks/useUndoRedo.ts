import { useState, useCallback, useRef } from 'react';

/**
 * Undo/Redo hook return value
 */
export interface UseUndoRedoReturn<T> {
  state: T;
  setState: (newState: T | ((prevState: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
}

/**
 * Custom hook for undo/redo functionality
 *
 * @param initialState - Initial state value
 * @param maxHistory - Maximum number of history entries (default: 50)
 * @returns Undo/redo state and controls
 *
 * @example
 * function TextEditor() {
 *   const { state: text, setState, undo, redo, canUndo, canRedo } = useUndoRedo('', 100);
 *
 *   return (
 *     <div>
 *       <textarea
 *         value={text}
 *         onChange={(e) => setState(e.target.value)}
 *       />
 *       <button onClick={undo} disabled={!canUndo}>Undo</button>
 *       <button onClick={redo} disabled={!canRedo}>Redo</button>
 *     </div>
 *   );
 * }
 */
export function useUndoRedo<T>(
  initialState: T,
  maxHistory: number = 50
): UseUndoRedoReturn<T> {
  const [state, setState] = useState<T>(initialState);
  const historyRef = useRef<T[]>([initialState]);
  const historyIndexRef = useRef<number>(0);

  const setStateWithHistory = useCallback((newState: T | ((prevState: T) => T)) => {
    const resolvedState = typeof newState === 'function'
      ? (newState as ((prevState: T) => T))(historyRef.current[historyIndexRef.current])
      : newState;

    // If we're not at the end of history, remove future states
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }

    // Add new state to history
    historyRef.current.push(resolvedState);

    // Limit history size
    if (historyRef.current.length > maxHistory) {
      historyRef.current.shift();
    } else {
      historyIndexRef.current++;
    }

    setState(resolvedState);
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
