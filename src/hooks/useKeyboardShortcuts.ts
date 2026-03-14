import { useEffect, useRef } from 'react';

/**
 * Keyboard shortcut configuration interface
 */
export interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  disabled?: boolean;
}

/**
 * Custom hook for handling keyboard shortcuts
 *
 * @param shortcuts - Array of shortcut configurations
 * @param options - Optional configuration
 *
 * @example
 * function MyComponent() {
 *   useKeyboardShortcuts([
 *     {
 *       key: 'z',
 *       ctrlKey: true,
 *       action: () => console.log('Undo'),
 *       description: 'Undo'
 *     },
 *     {
 *       key: 's',
 *       ctrlKey: true,
 *       action: () => console.log('Save'),
 *       description: 'Save'
 *     }
 *   ]);
 *
 *   return <div>Press Ctrl+Z or Ctrl+S</div>;
 * }
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  options?: {
    capture?: boolean;
    target?: HTMLElement | Document | Window | null;
    preventDefault?: boolean;
  }
): void {
  const { capture = false, target = typeof window !== 'undefined' ? window : null, preventDefault = true } = options || {};
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (!target) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const matchingShortcut = shortcutsRef.current.find(shortcut => {
        if (shortcut.disabled) return false;

        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.altKey ? e.altKey : !e.altKey;
        const metaMatch = shortcut.metaKey ? e.metaKey : !e.metaKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
      });

      if (matchingShortcut) {
        if (preventDefault) {
          e.preventDefault();
          e.stopPropagation();
        }
        matchingShortcut.action();
      }
    };

    target.addEventListener('keydown', handleKeyDown, capture);

    return () => {
      target.removeEventListener('keydown', handleKeyDown, capture);
    };
  }, [target, capture, preventDefault]);
}

/**
 * Helper function to create a shortcut configuration
 */
export function createShortcut(
  key: string,
  action: () => void,
  description: string,
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  }
): ShortcutConfig {
  return {
    key,
    action,
    description,
    ctrlKey: modifiers?.ctrl,
    shiftKey: modifiers?.shift,
    altKey: modifiers?.alt,
    metaKey: modifiers?.meta,
  };
}

/**
 * Common keyboard shortcut presets
 */
export const commonShortcuts = {
  undo: (action: () => void): ShortcutConfig => ({
    key: 'z',
    ctrlKey: true,
    shiftKey: false,
    action,
    description: 'Undo',
  }),

  redo: (action: () => void): ShortcutConfig => ({
    key: 'z',
    ctrlKey: true,
    shiftKey: true,
    action,
    description: 'Redo',
  }),

  save: (action: () => void): ShortcutConfig => ({
    key: 's',
    ctrlKey: true,
    action,
    description: 'Save',
  }),

  copy: (action: () => void): ShortcutConfig => ({
    key: 'c',
    ctrlKey: true,
    action,
    description: 'Copy',
  }),

  paste: (action: () => void): ShortcutConfig => ({
    key: 'v',
    ctrlKey: true,
    action,
    description: 'Paste',
  }),

  cut: (action: () => void): ShortcutConfig => ({
    key: 'x',
    ctrlKey: true,
    action,
    description: 'Cut',
  }),

  duplicate: (action: () => void): ShortcutConfig => ({
    key: 'd',
    ctrlKey: true,
    action,
    description: 'Duplicate',
  }),

  delete: (action: () => void): ShortcutConfig => ({
    key: 'Delete',
    action,
    description: 'Delete',
  }),

  backspace: (action: () => void): ShortcutConfig => ({
    key: 'Backspace',
    action,
    description: 'Delete',
  }),

  escape: (action: () => void): ShortcutConfig => ({
    key: 'Escape',
    action,
    description: 'Cancel',
  }),

  selectAll: (action: () => void): ShortcutConfig => ({
    key: 'a',
    ctrlKey: true,
    action,
    description: 'Select All',
  }),

  zoomIn: (action: () => void): ShortcutConfig => ({
    key: '=',
    ctrlKey: true,
    action,
    description: 'Zoom In',
  }),

  zoomOut: (action: () => void): ShortcutConfig => ({
    key: '-',
    ctrlKey: true,
    action,
    description: 'Zoom Out',
  }),

  zoomReset: (action: () => void): ShortcutConfig => ({
    key: '0',
    ctrlKey: true,
    action,
    description: 'Reset Zoom',
  }),

  find: (action: () => void): ShortcutConfig => ({
    key: 'f',
    ctrlKey: true,
    action,
    description: 'Find',
  }),
};
