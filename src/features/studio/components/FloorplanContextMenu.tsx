import React from 'react';
import { Copy, Clipboard, Scissors, Trash2, RotateCw, FlipHorizontal, FlipVertical, Lock, Unlock, BringToFront, SendToBack, LucideIcon } from 'lucide-react';

/**
 * Context menu action type
 */
export type ContextMenuAction =
    | 'copy'
    | 'paste'
    | 'cut'
    | 'delete'
    | 'rotate'
    | 'flipH'
    | 'flipV'
    | 'lock'
    | 'bringToFront'
    | 'sendToBack';

/**
 * Props for FloorplanContextMenu component
 */
export interface FloorplanContextMenuProps {
    x: number | null;
    y: number | null;
    onClose: () => void;
    onAction: (action: ContextMenuAction) => void;
    canCopy?: boolean;
    canPaste?: boolean;
    canCut?: boolean;
    canDelete?: boolean;
    canRotate?: boolean;
    canFlip?: boolean;
    isLocked?: boolean;
}

/**
 * Menu item interface
 */
interface MenuItem {
    id: ContextMenuAction | string;
    label: string;
    icon: LucideIcon;
    disabled?: boolean;
    shortcut?: string;
}

/**
 * ContextMenu - Right-click context menu for floor plan objects
 */
export default function FloorplanContextMenu({
    x,
    y,
    onClose,
    onAction,
    canCopy = false,
    canPaste = false,
    canCut = false,
    canDelete = false,
    canRotate = false,
    canFlip = false,
    isLocked = false
}: FloorplanContextMenuProps) {
    if (!x || !y) return null;

    const menuItems: (MenuItem | { id: string })[] = [
        { id: 'copy', label: 'Copy', icon: Copy, disabled: !canCopy, shortcut: 'Ctrl+C' },
        { id: 'paste', label: 'Paste', icon: Clipboard, disabled: !canPaste, shortcut: 'Ctrl+V' },
        { id: 'cut', label: 'Cut', icon: Scissors, disabled: !canCut, shortcut: 'Ctrl+X' },
        { id: 'separator1' },
        { id: 'delete', label: 'Delete', icon: Trash2, disabled: !canDelete, shortcut: 'Del' },
        { id: 'separator2' },
        { id: 'rotate', label: 'Rotate 90°', icon: RotateCw, disabled: !canRotate },
        { id: 'flipH', label: 'Flip Horizontal', icon: FlipHorizontal, disabled: !canFlip },
        { id: 'flipV', label: 'Flip Vertical', icon: FlipVertical, disabled: !canFlip },
        { id: 'separator3' },
        { id: 'lock', label: isLocked ? 'Unlock' : 'Lock', icon: isLocked ? Unlock : Lock },
        { id: 'separator4' },
        { id: 'bringToFront', label: 'Bring to Front', icon: BringToFront },
        { id: 'sendToBack', label: 'Send to Back', icon: SendToBack },
    ];

    return (
        <>
            <div
                className="fixed inset-0 z-50"
                onClick={onClose}
            />
            <div
                className="fixed z-50 bg-white dark:bg-[#2c2e36] border dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px]"
                style={{ left: `${x}px`, top: `${y}px` }}
            >
                {menuItems.map((item, index) => {
                    if (item.id.startsWith('separator')) {
                        return <div key={index} className="border-t dark:border-gray-700 my-1" />;
                    }

                    const menuItem = item as MenuItem;
                    const Icon = menuItem.icon;
                    return (
                        <button
                            key={menuItem.id}
                            onClick={() => {
                                onAction(menuItem.id as ContextMenuAction);
                                onClose();
                            }}
                            disabled={menuItem.disabled}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 dark:text-white"
                        >
                            <Icon size={16} />
                            <span className="flex-1">{menuItem.label}</span>
                            {menuItem.shortcut && (
                                <span className="text-xs text-gray-500">{menuItem.shortcut}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </>
    );
}
