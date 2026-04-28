import { useEffect, useRef, useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@convex/api';
import type { Id } from '@convex/dataModel';
import toast from 'react-hot-toast';

/**
 * Floor plan data interface
 */
export interface FloorplanData {
  rooms?: any[];
  walls?: any[];
  structures?: any[];
  text?: any[];
  measurements?: any[];
  shapes?: any[];
  layerVisibility?: Record<string, boolean>;
  layerLocks?: Record<string, boolean>;
}

/**
 * Auto-save state
 */
type AutoSaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Hook options
 */
interface UseFloorplanAutoSaveOptions {
  studioId: Id<'studios'>;
  roomId?: Id<'rooms'>;
  clerkId?: string;
  debounceMs?: number;
  enabled?: boolean;
  onSave?: (data: FloorplanData) => void;
}

/**
 * Hook return value
 */
interface UseFloorplanAutoSaveReturn {
  save: (data: FloorplanData) => void;
  saveNow: (data: FloorplanData) => Promise<void>;
  state: AutoSaveState;
  lastSavedAt: number | null;
  isDirty: boolean;
  clearDirty: () => void;
}

/**
 * useFloorplanAutoSave - Auto-save hook for floor plan data
 *
 * Features:
 * - Debounced saves (default 2 seconds)
 * - Tracks last saved state to avoid unnecessary saves
 * - Shows saving indicators
 * - Handles save errors gracefully
 * - Manual save trigger
 * - Dirty state tracking
 *
 * @example
 * ```tsx
 * const { save, state, lastSavedAt, isDirty, clearDirty } = useFloorplanAutoSave({
 *   studioId: studio._id,
 *   clerkId: user?.clerkId,
 *   debounceMs: 2000,
 *   enabled: true,
 * });
 *
 * // Auto-save on changes
 * useEffect(() => {
 *   if (isDirty) {
 *     save({
 *       rooms: roomsData,
 *       walls: wallsData,
 *       structures: structuresData,
 *     });
 *   }
 * }, [roomsData, wallsData, structuresData, isDirty, save]);
 * ```
 */
export function useFloorplanAutoSave({
  studioId,
  roomId,
  clerkId,
  debounceMs = 2000,
  enabled = true,
  onSave,
}: UseFloorplanAutoSaveOptions): UseFloorplanAutoSaveReturn {
  const saveMutation = useMutation(api.studioManager.saveFloorplan);
  const [state, setState] = useState<AutoSaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Track the last saved data to avoid duplicate saves
  const lastSavedDataRef = useRef<FloorplanData | null>(null);
  const pendingSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveDataRef = useRef<FloorplanData | null>(null);

  /**
   * Clear dirty state
   */
  const clearDirty = useCallback(() => {
    setIsDirty(false);
  }, []);

  /**
   * Perform the actual save operation
   */
  const performSave = useCallback(async (data: FloorplanData) => {
    if (!clerkId) {
      console.warn('Cannot save floor plan: No clerkId provided');
      setState('error');
      return;
    }

    try {
      setState('saving');

      // Call the save mutation
      await saveMutation({
        clerkId,
        studioId,
        roomId,
        ...data,
      });

      // Update state
      setState('saved');
      setLastSavedAt(Date.now());
      lastSavedDataRef.current = data;
      setIsDirty(false);

      // Call custom onSave callback if provided
      if (onSave) {
        onSave(data);
      }

      // Reset to idle after a short delay
      setTimeout(() => {
        setState('idle');
      }, 1000);
    } catch (error) {
      console.error('Failed to save floor plan:', error);
      setState('error');
      toast.error('Failed to save floor plan');

      // Reset to idle after a short delay
      setTimeout(() => {
        setState('idle');
      }, 3000);
    }
  }, [clerkId, studioId, roomId, saveMutation, onSave]);

  /**
   * Save with debouncing
   */
  const save = useCallback((data: FloorplanData) => {
    if (!enabled) {
      return;
    }

    // Mark as dirty
    setIsDirty(true);

    // Store pending save data
    pendingSaveDataRef.current = data;

    // Clear any pending timeout
    if (pendingSaveTimeoutRef.current) {
      clearTimeout(pendingSaveTimeoutRef.current);
    }

    // Check if data has actually changed
    const dataStr = JSON.stringify(data);
    const lastSavedStr = JSON.stringify(lastSavedDataRef.current);

    if (dataStr === lastSavedStr) {
      // Data hasn't changed, don't save
      setIsDirty(false);
      return;
    }

    // Set new timeout for debounced save
    pendingSaveTimeoutRef.current = setTimeout(() => {
      if (pendingSaveDataRef.current) {
        performSave(pendingSaveDataRef.current);
        pendingSaveDataRef.current = null;
      }
    }, debounceMs);
  }, [enabled, debounceMs, performSave]);

  /**
   * Save immediately without debouncing
   */
  const saveNow = useCallback(async (data: FloorplanData) => {
    if (!enabled) {
      return;
    }

    // Clear any pending timeout
    if (pendingSaveTimeoutRef.current) {
      clearTimeout(pendingSaveTimeoutRef.current);
      pendingSaveTimeoutRef.current = null;
    }

    pendingSaveDataRef.current = null;

    await performSave(data);
  }, [enabled, performSave]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (pendingSaveTimeoutRef.current) {
        clearTimeout(pendingSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    save,
    saveNow,
    state,
    lastSavedAt,
    isDirty,
    clearDirty,
  };
}

/**
 * Helper hook to display save status indicator
 */
export function useFloorplanSaveStatus(state: AutoSaveState, lastSavedAt: number | null) {
  const [statusText, setStatusText] = useState<string>('');
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (state === 'saving') {
      setStatusText('Saving...');
      setShowStatus(true);
    } else if (state === 'saved') {
      setStatusText('Saved');
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 2000);
    } else if (state === 'error') {
      setStatusText('Save failed');
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    } else {
      setShowStatus(false);
    }
  }, [state]);

  const getLastSavedTime = useCallback(() => {
    if (!lastSavedAt) return null;

    const seconds = Math.floor((Date.now() - lastSavedAt) / 1000);

    if (seconds < 60) {
      return `Saved ${seconds}s ago`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `Saved ${minutes}m ago`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `Saved ${hours}h ago`;
    }
  }, [lastSavedAt]);

  return {
    statusText,
    showStatus,
    getLastSavedTime,
  };
}

export default useFloorplanAutoSave;
