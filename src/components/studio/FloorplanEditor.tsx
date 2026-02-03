import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Edit, Move, Trash2, Plus, CornerUpLeft, CornerDownRight, Zap, BoxSelect, GripHorizontal, Copy, Clipboard, Scissors, RotateCw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import Panorama360Viewer from './Panorama360Viewer';
import FloorplanTools from './FloorplanTools';
import FloorplanPropertyPanel from './FloorplanPropertyPanel';
import FloorplanContextMenu from './FloorplanContextMenu';
import FloorplanLayerPanel from './FloorplanLayerPanel';
import DoorComponent from './DoorComponent';
import WindowComponent from './WindowComponent';
import FurnitureComponent from './FurnitureComponent';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { calculateDistance, calculateArea, formatMeasurement, exportSVG, exportPNG, snapToGrid, snapToObject, generateId } from '../../utils/floorplanUtils';
import toast from 'react-hot-toast';

const SNAP_GRID = 10; // Snap movement to 10px grid

// --- TYPE DEFINITIONS ---

/**
 * Layout interface for rooms/structures
 */
interface Layout {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    name?: string;
    label?: string;
    rate?: number;
    panorama360Url?: string;
}

/**
 * Room interface
 */
interface Room {
    id: string;
    name?: string;
    layout: Layout;
    rate?: number;
    panorama360Url?: string;
}

/**
 * Structure interface (visual only areas)
 */
interface Structure {
    id: string;
    label?: string;
    layout: Layout;
}

/**
 * Wall interface
 */
interface Wall {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke?: string;
    strokeWidth?: number;
}

/**
 * Door interface
 */
interface Door {
    id: string;
    type: 'door';
    x: number;
    y: number;
    width: number;
    height: number;
    subType?: string;
    direction?: string;
    rotation?: number;
}

/**
 * Window interface
 */
interface Window {
    id: string;
    type: 'window';
    x: number;
    y: number;
    width: number;
    height: number;
    subType?: string;
    rotation?: number;
}

/**
 * Furniture interface
 */
interface Furniture {
    id: string;
    type: 'furniture';
    x: number;
    y: number;
    width: number;
    height: number;
    subType?: string;
    rotation?: number;
}

/**
 * Text label interface
 */
interface TextLabel {
    id: string;
    type: 'text';
    x: number;
    y: number;
    text: string;
    fontSize?: number;
    color?: string;
    bold?: boolean;
    selected?: boolean;
}

/**
 * Measurement interface
 */
interface Measurement {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    distance: string;
}

/**
 * Custom shape interface (circle, polygon)
 */
interface CustomShape {
    id: string;
    type: 'circle' | 'polygon';
    cx?: number;
    cy?: number;
    r?: number;
    points?: { x: number; y: number }[] | string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

/**
 * Layer state interface
 */
interface LayerState {
    visible: boolean;
    locked: boolean;
}

/**
 * Layers interface
 */
interface Layers {
    structures: LayerState;
    rooms: LayerState;
    walls: LayerState;
    doors: LayerState;
    windows: LayerState;
    furniture: LayerState;
    text: LayerState;
    measurements: LayerState;
    shapes?: LayerState;
}

/**
 * Room template interface
 */
interface RoomTemplate {
    name: string;
    width: number;
    height: number;
    color: string;
}

/**
 * Point interface
 */
interface Point {
    x: number;
    y: number;
}

/**
 * Context menu position
 */
interface ContextMenuPosition {
    x: number;
    y: number;
}

/**
 * Clipboard data
 */
interface ClipboardData {
    type: 'structure' | 'wall';
    data: Structure | Wall | Door | Window | Furniture;
}

/**
 * Pan state
 */
interface PanState {
    startX?: number;
    startY?: number;
}

/**
 * FloorplanEditor props
 */
export interface FloorplanEditorProps {
    rooms: Room[];
    walls?: Wall[];
    structures?: Structure[];
    onRoomClick?: (index: number) => void;
    onLayoutChange?: (roomId: string, layout: Layout) => void;
    onWallsChange?: (walls: Wall[]) => void;
    onStructuresChange?: (structures: Structure[]) => void;
}

/**
 * FloorplanEditor component for editing studio room layout via interactive SVG.
 */
export default function FloorplanEditor({
    rooms,
    walls: propWalls,
    structures: propStructures,
    onRoomClick,
    onLayoutChange,
    onWallsChange,
    onStructuresChange
}: FloorplanEditorProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // --- INTERACTION STATE ---
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isResizing, setIsResizing] = useState<string | boolean>(false); // 'br', 'bl', 'tr', 'tl', 't', 'r', 'b', 'l'
    const [cursorOffset, setCursorOffset] = useState<Point>({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState<boolean | PanState>(false);
    const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });

    // Selection State
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
    const [activeStructureId, setActiveStructureId] = useState<string | null>(null);
    const [activeWallId, setActiveWallId] = useState<string | null>(null);
    const [activeDoorId, setActiveDoorId] = useState<string | null>(null);
    const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
    const [activeFurnitureId, setActiveFurnitureId] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set()); // Multi-select
    const [draggingWallHandle, setDraggingWallHandle] = useState<{ id: string; point: string } | null>(null);
    const [viewing360Room, setViewing360Room] = useState<Room | null>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null); // { x, y }
    const [showPropertyPanel, setShowPropertyPanel] = useState<boolean>(false);

    // --- DATA STATE ---
    const [walls, setWalls] = useState<Wall[]>(propWalls || []);
    const [structures, setStructures] = useState<Structure[]>(propStructures || []);
    const [doors, setDoors] = useState<Door[]>([]);
    const [windows, setWindows] = useState<Window[]>([]);
    const [furniture, setFurniture] = useState<Furniture[]>([]);
    const [textLabels, setTextLabels] = useState<TextLabel[]>([]);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
    const [customShapes, setCustomShapes] = useState<CustomShape[]>([]); // circles, polygons, etc.
    const [layers, setLayers] = useState<Layers>({
        structures: { visible: true, locked: false },
        rooms: { visible: true, locked: false },
        walls: { visible: true, locked: false },
        doors: { visible: true, locked: false },
        windows: { visible: true, locked: false },
        furniture: { visible: true, locked: false },
        text: { visible: true, locked: false },
        measurements: { visible: true, locked: false }
    });
    const [roomTemplates, setRoomTemplates] = useState<RoomTemplate[]>([
        { name: 'Control Room', width: 200, height: 150, color: '#3B82F6' },
        { name: 'Live Room', width: 300, height: 250, color: '#10B981' },
        { name: 'Isolation Booth', width: 120, height: 120, color: '#F59E0B' },
        { name: 'Lounge', width: 250, height: 200, color: '#8B5CF6' }
    ]);

    // --- TOOLS STATE ---
    const [activeTool, setActiveTool] = useState<string>('select');
    const [wallStartPoint, setWallStartPoint] = useState<Point | null>(null);
    const [measureStartPoint, setMeasureStartPoint] = useState<Point | null>(null);
    const [currentMeasurement, setCurrentMeasurement] = useState<Measurement | null>(null);

    // --- VIEW STATE ---
    const [zoom, setZoom] = useState<number>(1);
    const [viewBox, setViewBox] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 800, height: 600 });
    const [showGrid, setShowGrid] = useState<boolean>(true);
    const [gridSize, setGridSize] = useState<number>(SNAP_GRID);
    const [scale, setScale] = useState<number>(10); // pixels per foot
    const [measurementUnit, setMeasurementUnit] = useState<'ft' | 'm'>('ft');
    const [snapToObjects, setSnapToObjects] = useState<boolean>(true);

    // --- UNDO/REDO ---
    const floorplanState = {
        walls,
        structures,
        doors,
        windows,
        furniture,
        textLabels
    };
    const { state: historyState, setState: setHistoryState, undo, redo, canUndo, canRedo } = useUndoRedo(floorplanState);

    const width = 800;
    const height = 600;

    // Sync props to state when they change externally (e.g. initial load)
    useEffect(() => { setWalls(propWalls || []); }, [propWalls]);
    useEffect(() => { setStructures(propStructures || []); }, [propStructures]);

    // Utility function to get position relative to the SVG container
    const getCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, applyZoom = true): Point => {
        if (!svgRef.current) return { x: 0, y: 0 };

        const rect = svgRef.current.getBoundingClientRect();
        let clientX = 'clientX' in e ? e.clientX : ('touches' in e && e.touches.length > 0 ? e.touches[0].clientX : 0);
        let clientY = 'clientY' in e ? e.clientY : ('touches' in e && e.touches.length > 0 ? e.touches[0].clientY : 0);

        let x = (clientX - rect.left) / (applyZoom ? zoom : 1) - panOffset.x;
        let y = (clientY - rect.top) / (applyZoom ? zoom : 1) - panOffset.y;

        // Snap to grid
        const snapped = snapToGrid(x, y, gridSize);

        // Snap to objects if enabled
        if (snapToObjects && activeTool === 'select') {
            const allObjects: Array<{ x: number; y: number; width: number; height: number }> = [
                ...rooms.map(r => ({ x: r.layout.x, y: r.layout.y, width: r.layout.width, height: r.layout.height })),
                ...structures.map(s => ({ x: s.layout.x, y: s.layout.y, width: s.layout.width, height: s.layout.height })),
                ...walls.map(w => ({ x: w.x1, y: w.y1, width: w.x2 - w.x1, height: w.y2 - w.y1 }))
            ];
            return snapToObject(snapped.x, snapped.y, allObjects, 10);
        }

        return snapped;
    };

    // --- PERSISTENCE HELPERS ---
    const commitWalls = (newWalls: Wall[], saveToHistory = true) => {
        setWalls(newWalls);
        onWallsChange?.(newWalls);
        if (saveToHistory) {
            setHistoryState({ ...floorplanState, walls: newWalls });
        }
    };

    const commitStructures = (newStructures: Structure[], saveToHistory = true) => {
        setStructures(newStructures);
        onStructuresChange?.(newStructures);
        if (saveToHistory) {
            setHistoryState({ ...floorplanState, structures: newStructures });
        }
    };

    const commitDoors = (newDoors: Door[], saveToHistory = true) => {
        setDoors(newDoors);
        if (saveToHistory) {
            setHistoryState({ ...floorplanState, doors: newDoors });
        }
    };

    const commitWindows = (newWindows: Window[], saveToHistory = true) => {
        setWindows(newWindows);
        if (saveToHistory) {
            setHistoryState({ ...floorplanState, windows: newWindows });
        }
    };

    const commitFurniture = (newFurniture: Furniture[], saveToHistory = true) => {
        setFurniture(newFurniture);
        if (saveToHistory) {
            setHistoryState({ ...floorplanState, furniture: newFurniture });
        }
    };

    // --- CLIPBOARD & EDITING ACTIONS ---

    const handleDelete = useCallback(() => {
        if (activeStructureId) {
            const newStructs = structures.filter(s => s.id !== activeStructureId);
            commitStructures(newStructs);
            setActiveStructureId(null);
            setShowPropertyPanel(false);
        } else if (activeWallId) {
            const newWalls = walls.filter(w => w.id !== activeWallId);
            commitWalls(newWalls);
            setActiveWallId(null);
            setShowPropertyPanel(false);
        } else if (activeDoorId) {
            const newDoors = doors.filter(d => d.id !== activeDoorId);
            commitDoors(newDoors);
            setActiveDoorId(null);
            setShowPropertyPanel(false);
        } else if (activeWindowId) {
            const newWindows = windows.filter(w => w.id !== activeWindowId);
            commitWindows(newWindows);
            setActiveWindowId(null);
            setShowPropertyPanel(false);
        } else if (activeFurnitureId) {
            const newFurniture = furniture.filter(f => f.id !== activeFurnitureId);
            commitFurniture(newFurniture);
            setActiveFurnitureId(null);
            setShowPropertyPanel(false);
        } else if (activeRoomId) {
            // Room deletion handled by parent
            setActiveRoomId(null);
            setShowPropertyPanel(false);
        }
    }, [activeStructureId, activeWallId, activeDoorId, activeWindowId, activeFurnitureId, activeRoomId, structures, walls, doors, windows, furniture]);

    const handleCopy = useCallback(() => {
        if (activeStructureId) {
            const item = structures.find(s => s.id === activeStructureId);
            if (item) setClipboard({ type: 'structure', data: item });
        } else if (activeWallId) {
            const item = walls.find(w => w.id === activeWallId);
            if (item) setClipboard({ type: 'wall', data: item });
        }
    }, [activeStructureId, activeWallId, structures, walls]);

    const handlePaste = useCallback(() => {
        if (!clipboard) return;

        const offset = 20; // Visual offset for pasted item

        if (clipboard.type === 'structure') {
            const newStruct: Structure = {
                ...clipboard.data,
                id: `struct_${Date.now()}`,
                layout: {
                    ...clipboard.data.layout,
                    x: clipboard.data.layout.x + offset,
                    y: clipboard.data.layout.y + offset
                }
            };
            commitStructures([...structures, newStruct]);
            setActiveStructureId(newStruct.id);
        } else if (clipboard.type === 'wall') {
            const newWall: Wall = {
                ...clipboard.data,
                id: `wall_${Date.now()}`,
                x1: (clipboard.data as Wall).x1 + offset,
                y1: (clipboard.data as Wall).y1 + offset,
                x2: (clipboard.data as Wall).x2 + offset,
                y2: (clipboard.data as Wall).y2 + offset
            };
            commitWalls([...walls, newWall]);
            setActiveWallId(newWall.id);
        }
    }, [clipboard, structures, walls]);

    const handleCut = useCallback(() => {
        handleCopy();
        handleDelete();
    }, [handleCopy, handleDelete]);

    // Keyboard Shortcuts Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Undo/Redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
                return;
            }

            // Delete
            if (e.key === 'Delete' || e.key === 'Backspace') {
                handleDelete();
            }
            // Copy (Ctrl+C / Cmd+C)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                handleCopy();
            }
            // Paste (Ctrl+V / Cmd+V)
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                e.preventDefault();
                handlePaste();
            }
            // Cut (Ctrl+X / Cmd+X)
            if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
                e.preventDefault();
                handleCut();
            }
            // Zoom
            if ((e.ctrlKey || e.metaKey) && e.key === '=') {
                e.preventDefault();
                handleZoomIn();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === '-') {
                e.preventDefault();
                handleZoomOut();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === '0') {
                e.preventDefault();
                handleFitToView();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleDelete, handleCopy, handlePaste, handleCut, undo, redo]);


    // --- ROOM HANDLERS ---

    const startDragRoom = useCallback((e: React.MouseEvent | React.TouchEvent, room: Room) => {
        if (activeTool !== 'select') return;
        e.preventDefault();
        e.stopPropagation();

        const { x, y } = getCoords(e);

        setActiveRoomId(room.id);
        setActiveStructureId(null);
        setActiveWallId(null);
        setIsDragging(true);
        setIsResizing(false);
        setCursorOffset({
            x: x - room.layout.x,
            y: y - room.layout.y,
        });
    }, [activeTool]);

    const startResizeRoom = useCallback((e: React.MouseEvent, room: Room, direction: string) => {
        e.preventDefault();
        e.stopPropagation();

        setActiveRoomId(room.id);
        setActiveStructureId(null);
        setActiveWallId(null);
        setActiveDoorId(null);
        setActiveWindowId(null);
        setActiveFurnitureId(null);
        setIsDragging(false);
        setIsResizing(direction);
    }, []);

    const startPan = useCallback((e: React.MouseEvent) => {
        const nativeEvent = e.nativeEvent as KeyboardEvent & MouseEvent;
        if (activeTool === 'select' && (e.button === 1 || e.ctrlKey || e.metaKey || nativeEvent.code === 'Space')) {
            e.preventDefault();
            setIsPanning({ startX: e.clientX, startY: e.clientY });
        }
    }, [activeTool]);

    const stopPan = useCallback(() => {
        setIsPanning(false);
    }, []);

    // --- STRUCTURE HANDLERS (Visual Only Rooms) ---

    const addStructure = () => {
        const newStruct: Structure = {
            id: `struct_${Date.now()}`,
            label: 'Lobby / Area',
            layout: { x: 100, y: 100, width: 150, height: 100, color: '#94a3b8' } // Slate 400
        };
        commitStructures([...structures, newStruct]);
        setActiveTool('select'); // Reset tool
    };

    const startDragStructure = useCallback((e: React.MouseEvent | React.TouchEvent, struct: Structure) => {
        if (activeTool !== 'select') return;
        e.preventDefault();
        e.stopPropagation();

        const { x, y } = getCoords(e);

        setActiveStructureId(struct.id);
        setActiveRoomId(null); // Deselect rooms
        setActiveWallId(null);
        setIsDragging(true);
        setIsResizing(false);
        setCursorOffset({
            x: x - struct.layout.x,
            y: y - struct.layout.y,
        });
    }, [activeTool]);

    const startResizeStructure = useCallback((e: React.MouseEvent, struct: Structure, direction: string) => {
        e.preventDefault();
        e.stopPropagation();

        setActiveStructureId(struct.id);
        setActiveRoomId(null);
        setActiveWallId(null);
        setIsDragging(false);
        setIsResizing(direction);
    }, []);

    // --- WALL HANDLERS ---

    const startDragWallHandle = useCallback((e: React.MouseEvent, wallId: string, point: string) => {
        if (activeTool !== 'select') return;
        e.preventDefault();
        e.stopPropagation();
        setDraggingWallHandle({ id: wallId, point });
        setActiveRoomId(null);
        setActiveStructureId(null);
        setActiveWallId(wallId);
    }, [activeTool]);

    const selectWall = (e: React.MouseEvent, wallId: string) => {
        if (activeTool !== 'select') return;
        e.stopPropagation();
        setActiveWallId(wallId);
        setActiveRoomId(null);
        setActiveStructureId(null);
    };

    // --- GLOBAL MOVE HANDLER ---

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!svgRef.current) return;
        const { x, y } = getCoords(e); // Snapped coords

        // 1. WALL DRAWING PREVIEW
        if (activeTool === 'wall' && wallStartPoint) {
            const previewWall: Wall = {
                id: 'preview',
                x1: wallStartPoint.x,
                y1: wallStartPoint.y,
                x2: x,
                y2: y
            };
            // Just local state for preview, don't commit
            setWalls(prev => [...prev.filter(w => w.id !== 'preview'), previewWall]);
            return;
        }

        // 2. WALL EDITING (Moving Endpoints)
        if (draggingWallHandle) {
            // Update local state while dragging for smoothness
            setWalls(prev => prev.map(w => {
                if (w.id !== draggingWallHandle.id) return w;
                return draggingWallHandle.point === 'start'
                    ? { ...w, x1: x, y1: y }
                    : { ...w, x2: x, y2: y };
            }));
            return;
        }

        // 3. DRAGGING (Room, Structure, Door, Window, Furniture)
        if (isDragging) {
            const newPos = { x: x - cursorOffset.x, y: y - cursorOffset.y };

            if (activeRoomId) {
                const room = rooms.find(r => r.id === activeRoomId);
                if (room && onLayoutChange) onLayoutChange(activeRoomId, { ...room.layout, ...newPos });
            } else if (activeStructureId) {
                setStructures(prev => prev.map(s => s.id === activeStructureId ? { ...s, layout: { ...s.layout, ...newPos } } : s));
            } else if (activeDoorId) {
                setDoors(prev => prev.map(d => d.id === activeDoorId ? { ...d, x: newPos.x, y: newPos.y } : d));
            } else if (activeWindowId) {
                setWindows(prev => prev.map(w => w.id === activeWindowId ? { ...w, x: newPos.x, y: newPos.y } : w));
            } else if (activeFurnitureId) {
                setFurniture(prev => prev.map(f => f.id === activeFurnitureId ? { ...f, x: newPos.x, y: newPos.y } : f));
            }
        }

        // 4. RESIZING (Room or Structure) - Multi-handle support
        if (isResizing && typeof isResizing === 'string') {
            if (activeRoomId) {
                const room = rooms.find(r => r.id === activeRoomId);
                if (room && onLayoutChange) {
                    let newLayout = { ...room.layout };
                    const minSize = SNAP_GRID;

                    if (isResizing === 'br') {
                        newLayout.width = Math.max(minSize, x - room.layout.x);
                        newLayout.height = Math.max(minSize, y - room.layout.y);
                    } else if (isResizing === 'bl') {
                        newLayout.width = Math.max(minSize, room.layout.x + room.layout.width - x);
                        newLayout.height = Math.max(minSize, y - room.layout.y);
                        newLayout.x = Math.min(x, room.layout.x + room.layout.width - minSize);
                    } else if (isResizing === 'tr') {
                        newLayout.width = Math.max(minSize, x - room.layout.x);
                        newLayout.height = Math.max(minSize, room.layout.y + room.layout.height - y);
                        newLayout.y = Math.min(y, room.layout.y + room.layout.height - minSize);
                    } else if (isResizing === 'tl') {
                        newLayout.width = Math.max(minSize, room.layout.x + room.layout.width - x);
                        newLayout.height = Math.max(minSize, room.layout.y + room.layout.height - y);
                        newLayout.x = Math.min(x, room.layout.x + room.layout.width - minSize);
                        newLayout.y = Math.min(y, room.layout.y + room.layout.height - minSize);
                    } else if (isResizing === 't') {
                        newLayout.height = Math.max(minSize, room.layout.y + room.layout.height - y);
                        newLayout.y = Math.min(y, room.layout.y + room.layout.height - minSize);
                    } else if (isResizing === 'r') {
                        newLayout.width = Math.max(minSize, x - room.layout.x);
                    } else if (isResizing === 'b') {
                        newLayout.height = Math.max(minSize, y - room.layout.y);
                    } else if (isResizing === 'l') {
                        newLayout.width = Math.max(minSize, room.layout.x + room.layout.width - x);
                        newLayout.x = Math.min(x, room.layout.x + room.layout.width - minSize);
                    }

                    onLayoutChange(activeRoomId, newLayout);
                }
            } else if (activeStructureId) {
                const struct = structures.find(s => s.id === activeStructureId);
                if (struct) {
                    let newLayout = { ...struct.layout };
                    const minSize = SNAP_GRID;

                    if (isResizing === 'br') {
                        newLayout.width = Math.max(minSize, x - struct.layout.x);
                        newLayout.height = Math.max(minSize, y - struct.layout.y);
                    } else if (isResizing === 'bl') {
                        newLayout.width = Math.max(minSize, struct.layout.x + struct.layout.width - x);
                        newLayout.height = Math.max(minSize, y - struct.layout.y);
                        newLayout.x = Math.min(x, struct.layout.x + struct.layout.width - minSize);
                    } else if (isResizing === 'tr') {
                        newLayout.width = Math.max(minSize, x - struct.layout.x);
                        newLayout.height = Math.max(minSize, struct.layout.y + struct.layout.height - y);
                        newLayout.y = Math.min(y, struct.layout.y + struct.layout.height - minSize);
                    } else if (isResizing === 'tl') {
                        newLayout.width = Math.max(minSize, struct.layout.x + struct.layout.width - x);
                        newLayout.height = Math.max(minSize, struct.layout.y + struct.layout.height - y);
                        newLayout.x = Math.min(x, struct.layout.x + struct.layout.width - minSize);
                        newLayout.y = Math.min(y, struct.layout.y + struct.layout.height - minSize);
                    } else if (isResizing === 't') {
                        newLayout.height = Math.max(minSize, struct.layout.y + struct.layout.height - y);
                        newLayout.y = Math.min(y, struct.layout.y + struct.layout.height - minSize);
                    } else if (isResizing === 'r') {
                        newLayout.width = Math.max(minSize, x - struct.layout.x);
                    } else if (isResizing === 'b') {
                        newLayout.height = Math.max(minSize, y - struct.layout.y);
                    } else if (isResizing === 'l') {
                        newLayout.width = Math.max(minSize, struct.layout.x + struct.layout.width - x);
                        newLayout.x = Math.min(x, struct.layout.x + struct.layout.width - minSize);
                    }

                    setStructures(prev => prev.map(s => s.id === activeStructureId ? { ...s, layout: newLayout } : s));
                }
            }
        }

        // 5. MEASUREMENT TOOL
        if (activeTool === 'measure' && measureStartPoint) {
            const distance = calculateDistance(measureStartPoint.x, measureStartPoint.y, x, y);
            setCurrentMeasurement({
                x1: measureStartPoint.x,
                y1: measureStartPoint.y,
                x2: x,
                y2: y,
                distance: formatMeasurement(distance, scale, measurementUnit)
            });
        }

        // 6. PAN
        if (typeof isPanning === 'object' && isPanning !== null && (e.buttons === 1)) {
            const deltaX = e.movementX;
            const deltaY = e.movementY;
            setPanOffset(prev => ({
                x: prev.x + deltaX / zoom,
                y: prev.y + deltaY / zoom
            }));
        }

    }, [activeRoomId, activeStructureId, isDragging, isResizing, draggingWallHandle, cursorOffset, rooms, onLayoutChange, activeTool, wallStartPoint, isPanning, zoom, measureStartPoint, scale, measurementUnit, activeDoorId, activeWindowId, activeFurnitureId]);

    const stopInteraction = useCallback(() => {
        // Commit changes on mouse up
        if (isDragging || isResizing) {
            if (activeStructureId && onStructuresChange) {
                onStructuresChange(structures);
                setHistoryState({ ...floorplanState, structures });
            } else if (activeDoorId) {
                commitDoors(doors);
            } else if (activeWindowId) {
                commitWindows(windows);
            } else if (activeFurnitureId) {
                commitFurniture(furniture);
            }
        }
        if (draggingWallHandle && onWallsChange) {
            onWallsChange(walls);
            setHistoryState({ ...floorplanState, walls });
        }

        setIsDragging(false);
        setIsResizing(false);
        setDraggingWallHandle(null);
    }, [isDragging, isResizing, draggingWallHandle, activeStructureId, activeDoorId, activeWindowId, activeFurnitureId, structures, walls, doors, windows, furniture, onStructuresChange, onWallsChange, floorplanState, setHistoryState, commitDoors, commitWindows, commitFurniture]);

    // --- CANVAS CLICK HANDLER ---
    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        if (isDragging || isResizing || isPanning) return;

        const { x, y } = getCoords(e);

        // WALL TOOL
        if (activeTool === 'wall') {
            e.stopPropagation();
            if (!wallStartPoint) {
                setWallStartPoint({ x, y });
            } else {
                const newWall: Wall = {
                    id: generateId('wall'),
                    x1: wallStartPoint.x,
                    y1: wallStartPoint.y,
                    x2: x,
                    y2: y,
                    stroke: '#52525B',
                    strokeWidth: 5
                };
                commitWalls([...walls.filter(w => w.id !== 'preview'), newWall]);
                setWallStartPoint(null);
            }
            return;
        }

        // MEASUREMENT TOOL
        if (activeTool === 'measure') {
            e.stopPropagation();
            if (!measureStartPoint) {
                setMeasureStartPoint({ x, y });
            } else {
                const distance = calculateDistance(measureStartPoint.x, measureStartPoint.y, x, y);
                const newMeasurement: Measurement = {
                    id: generateId('measure'),
                    x1: measureStartPoint.x,
                    y1: measureStartPoint.y,
                    x2: x,
                    y2: y,
                    distance: formatMeasurement(distance, scale, measurementUnit)
                };
                setMeasurements(prev => [...prev, newMeasurement]);
                setMeasureStartPoint(null);
                setCurrentMeasurement(null);
            }
            return;
        }

        // DOOR TOOL
        if (activeTool === 'door') {
            e.stopPropagation();
            const newDoor: Door = {
                id: generateId('door'),
                type: 'door',
                x: x - 15,
                y: y - 30,
                width: 30,
                height: 60,
                subType: 'single',
                direction: 'left'
            };
            commitDoors([...doors, newDoor]);
            setActiveDoorId(newDoor.id);
            return;
        }

        // WINDOW TOOL
        if (activeTool === 'window') {
            e.stopPropagation();
            const newWindow: Window = {
                id: generateId('window'),
                type: 'window',
                x: x - 20,
                y: y - 30,
                width: 40,
                height: 60,
                subType: 'standard'
            };
            commitWindows([...windows, newWindow]);
            setActiveWindowId(newWindow.id);
            return;
        }

        // FURNITURE TOOL
        if (activeTool === 'furniture') {
            e.stopPropagation();
            const newFurniture: Furniture = {
                id: generateId('furniture'),
                type: 'furniture',
                x: x - 20,
                y: y - 20,
                width: 40,
                height: 40,
                subType: 'box',
                rotation: 0
            };
            commitFurniture([...furniture, newFurniture]);
            setActiveFurnitureId(newFurniture.id);
            return;
        }

        // TEXT TOOL
        if (activeTool === 'text') {
            e.stopPropagation();
            const newLabel: TextLabel = {
                id: generateId('text'),
                type: 'text',
                x: x,
                y: y,
                text: 'Label',
                fontSize: 14,
                color: '#000000'
            };
            setTextLabels(prev => [...prev, newLabel]);
            return;
        }

        // CIRCLE TOOL
        if (activeTool === 'circle') {
            e.stopPropagation();
            const newCircle: CustomShape = {
                id: generateId('circle'),
                type: 'circle',
                cx: x,
                cy: y,
                r: 30,
                fill: '#3B82F6',
                stroke: '#1E40AF',
                strokeWidth: 2
            };
            setCustomShapes(prev => [...prev, newCircle]);
            return;
        }

        // POLYGON TOOL
        if (activeTool === 'polygon') {
            e.stopPropagation();
            toast.info('Polygon tool: Click points, double-click to finish');
            return;
        }

        // Deselect if clicking empty space
        if (activeTool === 'select') {
            if (!e.ctrlKey && !e.metaKey) {
                setActiveRoomId(null);
                setActiveStructureId(null);
                setActiveWallId(null);
                setActiveDoorId(null);
                setActiveWindowId(null);
                setActiveFurnitureId(null);
                setSelectedItems(new Set());
                setShowPropertyPanel(false);
            }
        }
    }, [activeTool, wallStartPoint, measureStartPoint, isDragging, isResizing, isPanning, walls, doors, windows, furniture, scale, measurementUnit, commitWalls, commitDoors, commitWindows, commitFurniture]);

    // --- ZOOM HANDLERS ---
    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev * 1.2, 5));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev / 1.2, 0.1));
    };

    const handleFitToView = () => {
        setZoom(1);
        setPanOffset({ x: 0, y: 0 });
    };

    // --- EXPORT HANDLERS ---
    const handleExportSVG = () => {
        if (!svgRef.current) return;
        const { svgString, blob } = exportSVG(svgRef.current, width, height);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'floorplan.svg';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Floor plan exported as SVG');
    };

    const handleExportPNG = async () => {
        if (!svgRef.current) return;
        try {
            const blob = await exportPNG(svgRef.current, width, height, 2);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'floorplan.png';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Floor plan exported as PNG');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export PNG');
        }
    };

    const handleExportPDF = async () => {
        // PDF export requires jsPDF library - placeholder for now
        toast.error('PDF export coming soon');
    };

    // --- BACKGROUND IMAGE IMPORT ---
    const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setBackgroundImage(event.target?.result as string);
            toast.success('Background image loaded');
        };
        reader.readAsDataURL(file);
    };

    // --- TOOLBAR HANDLERS ---
    const setTool = (tool: string) => {
        setActiveTool(tool);
        setWallStartPoint(null);
        setMeasureStartPoint(null);
        setCurrentMeasurement(null);
        if (tool === 'structure') addStructure();
        else if (tool === 'room') addRoom();
        else {
            setWalls(prev => prev.filter(w => w.id !== 'preview')); // Clean preview
        }
    };

    const addRoom = (template: RoomTemplate | null = null) => {
        const baseRoom = template || {
            name: `Room ${rooms.length + 1}`,
            width: 150,
            height: 120,
            color: '#3B82F6'
        };

        const newRoom: Room = {
            id: generateId('room'),
            name: baseRoom.name,
            layout: {
                x: 100,
                y: 100,
                width: baseRoom.width,
                height: baseRoom.height,
                color: baseRoom.color
            }
        };
        // Room would be added to parent state
        setHistoryState({ ...floorplanState });
    };

    // Attach global listeners
    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopInteraction);
        document.addEventListener('touchmove', handleMouseMove);
        document.addEventListener('touchend', stopInteraction);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', stopInteraction);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', stopInteraction);
        };
    }, [handleMouseMove, stopInteraction]);

    // --- RENDER SUB-COMPONENTS ---

    const WallSegment = ({ wall }: { wall: Wall }) => {
        const isPreview = wall.id === 'preview';
        const isSelected = activeWallId === wall.id;
        return (
            <g onClick={(e) => selectWall(e, wall.id)} style={{ cursor: 'pointer' }}>
                {/* Invisible hit area for easier selection */}
                <line
                    x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2}
                    stroke="transparent"
                    strokeWidth="15"
                />
                <line
                    x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2}
                    stroke={isPreview ? '#ef4444' : (isSelected ? '#3D84ED' : wall.stroke)}
                    strokeWidth={wall.strokeWidth}
                    strokeLinecap="round"
                    opacity={isPreview ? 0.7 : 1}
                />
                {!isPreview && (
                    <>
                        {/* Start Handle */}
                        <circle
                            cx={wall.x1} cy={wall.y1} r={6}
                            fill="white" stroke="#52525B" strokeWidth={2}
                            className="cursor-move hover:fill-brand-blue"
                            onMouseDown={(e) => startDragWallHandle(e, wall.id, 'start')}
                        />
                        {/* End Handle */}
                        <circle
                            cx={wall.x2} cy={wall.y2} r={6}
                            fill="white" stroke="#52525B" strokeWidth={2}
                            className="cursor-move hover:fill-brand-blue"
                            onMouseDown={(e) => startDragWallHandle(e, wall.id, 'end')}
                        />
                    </>
                )}
            </g>
        );
    };

    // Generic Shape Renderer (Used for Rooms and Structures)
    const LayoutShape = ({ data, isStructure = false, onClick }: { data: Room | Structure; isStructure?: boolean; onClick: (item: Room | Structure, e?: React.MouseEvent) => void }) => {
        const { layout, name, rate, label } = data;
        const isActive = isStructure ? activeStructureId === data.id : activeRoomId === data.id;

        // Calculate area for display
        const area = layout.width && layout.height ? calculateArea(layout.width, layout.height, scale) : null;

        // Determine rounding based on wall locking
        const checkCornerLocked = (cx: number, cy: number): boolean => {
            const THRESHOLD = 12;
            return walls.some(w => {
                const dx = (w.x2 - w.x1);
                const dy = (w.y2 - w.y1);
                const len = Math.sqrt(dx * dx + dy * dy);
                const normalX = -dy / len;
                const normalY = dx / len;
                const dist = (cx - w.x1) * normalX + (cy - w.y1) * normalY;
                return Math.abs(dist) < THRESHOLD;
            });
        };

        const tlSharp = checkCornerLocked(layout.x, layout.y);
        const trSharp = checkCornerLocked(layout.x + layout.width, layout.y);
        const brSharp = checkCornerLocked(layout.x + layout.width, layout.y + layout.height);
        const blSharp = checkCornerLocked(layout.x, layout.y + layout.height);

        const r = 8;
        const pathD = [
            `M ${layout.x + (tlSharp ? 0 : r)} ${layout.y}`,
            `L ${layout.x + layout.width - (trSharp ? 0 : r)} ${layout.y}`,
            `Q ${layout.x + layout.width} ${layout.y} ${layout.x + layout.width} ${layout.y + (trSharp ? 0 : r)}`,
            `L ${layout.x + layout.width} ${layout.y + layout.height - (brSharp ? 0 : r)}`,
            `Q ${layout.x + layout.width} ${layout.y + layout.height} ${layout.x + layout.width - (brSharp ? 0 : r)} ${layout.y + layout.height}`,
            `L ${layout.x + (blSharp ? 0 : r)} ${layout.y + layout.height}`,
            `Q ${layout.x} ${layout.y + layout.height} ${layout.x} ${layout.y + layout.height - (blSharp ? 0 : r)}`,
            `L ${layout.x} ${layout.y + (tlSharp ? 0 : r)}`,
            `Q ${layout.x} ${layout.y} ${layout.x + (tlSharp ? 0 : r)} ${layout.y}`,
            `Z`
        ].join(' ');

        return (
            <g
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(data, e);
                }}
                style={{ cursor: isResizing ? 'default' : 'grab', filter: isActive ? `drop-shadow(0 0 5px ${layout.color})` : 'none' }}
                pointerEvents={activeTool !== 'select' ? 'none' : 'auto'}
            >
                <path
                    d={pathD}
                    fill={layout.color}
                    opacity={isStructure ? "0.5" : "0.8"}
                    stroke={layout.color}
                    strokeWidth="4"
                    strokeDasharray={isStructure ? "5,5" : "0"}
                    onMouseDown={(e) => isStructure ? startDragStructure(e, data as Structure) : startDragRoom(e, data as Room)}
                    onTouchStart={(e) => isStructure ? startDragStructure(e, data as Structure) : startDragRoom(e, data as Room)}
                />

                <text
                    x={layout.x + layout.width / 2}
                    y={layout.y + layout.height / 2}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                    <tspan x={layout.x + layout.width / 2} dy="-0.5em" fontWeight="bold" fontSize="14">
                        {isStructure ? (label || 'Area') : name}
                    </tspan>
                    {!isStructure && rate && (
                        <tspan x={layout.x + layout.width / 2} dy="1.2em" fontSize="12">
                            ${rate}/hr
                        </tspan>
                    )}
                    {area && (
                        <tspan x={layout.x + layout.width / 2} dy="1.2em" fontSize="10" opacity={0.8}>
                            {area.sqft.toFixed(0)} sq ft
                        </tspan>
                    )}
                </text>

                {/* 360° Image Indicator */}
                {!isStructure && (data as Room).panorama360Url && (
                    <g transform={`translate(${layout.x + layout.width - 20}, ${layout.y + 5})`}>
                        <circle cx="0" cy="0" r="8" fill="#10B981" opacity="0.9" />
                        <text x="0" y="3" fontSize="8" fill="white" textAnchor="middle" style={{ pointerEvents: 'none' }}>360</text>
                    </g>
                )}

                {/* Multi-handle Resize Handles */}
                {isActive && (
                    <>
                        {/* Corner Handles */}
                        <rect x={layout.x - 5} y={layout.y - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth={2} style={{ cursor: 'nwse-resize' }} onMouseDown={(e) => isStructure ? startResizeStructure(e, data as Structure, 'tl') : startResizeRoom(e, data as Room, 'tl')} />
                        <rect x={layout.x + layout.width - 5} y={layout.y - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth={2} style={{ cursor: 'nesw-resize' }} onMouseDown={(e) => isStructure ? startResizeStructure(e, data as Structure, 'tr') : startResizeRoom(e, data as Room, 'tr')} />
                        <rect x={layout.x + layout.width - 5} y={layout.y + layout.height - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth={2} style={{ cursor: 'nwse-resize' }} onMouseDown={(e) => isStructure ? startResizeStructure(e, data as Structure, 'br') : startResizeRoom(e, data as Room, 'br')} />
                        <rect x={layout.x - 5} y={layout.y + layout.height - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth={2} style={{ cursor: 'nesw-resize' }} onMouseDown={(e) => isStructure ? startResizeStructure(e, data as Structure, 'bl') : startResizeRoom(e, data as Room, 'bl')} />

                        {/* Edge Handles */}
                        <rect x={layout.x + layout.width / 2 - 5} y={layout.y - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth={2} style={{ cursor: 'ns-resize' }} onMouseDown={(e) => isStructure ? startResizeStructure(e, data as Structure, 't') : startResizeRoom(e, data as Room, 't')} />
                        <rect x={layout.x + layout.width - 5} y={layout.y + layout.height / 2 - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth={2} style={{ cursor: 'ew-resize' }} onMouseDown={(e) => isStructure ? startResizeStructure(e, data as Structure, 'r') : startResizeRoom(e, data as Room, 'r')} />
                        <rect x={layout.x + layout.width / 2 - 5} y={layout.y + layout.height - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth={2} style={{ cursor: 'ns-resize' }} onMouseDown={(e) => isStructure ? startResizeStructure(e, data as Structure, 'b') : startResizeRoom(e, data as Room, 'b')} />
                        <rect x={layout.x - 5} y={layout.y + layout.height / 2 - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth={2} style={{ cursor: 'ew-resize' }} onMouseDown={(e) => isStructure ? startResizeStructure(e, data as Structure, 'l') : startResizeRoom(e, data as Room, 'l')} />
                    </>
                )}
            </g>
        );
    };

    // Get selected item for property panel
    const getSelectedItem = (): Room | Structure | Wall | Door | Window | Furniture | null => {
        if (activeRoomId) return rooms.find(r => r.id === activeRoomId) || null;
        if (activeStructureId) return structures.find(s => s.id === activeStructureId) || null;
        if (activeWallId) return walls.find(w => w.id === activeWallId) || null;
        if (activeDoorId) return doors.find(d => d.id === activeDoorId) || null;
        if (activeWindowId) return windows.find(w => w.id === activeWindowId) || null;
        if (activeFurnitureId) return furniture.find(f => f.id === activeFurnitureId) || null;
        return null;
    };

    const handlePropertyUpdate = (updates: any) => {
        const item = getSelectedItem();
        if (!item) return;

        if (activeRoomId && onLayoutChange) {
            const room = rooms.find(r => r.id === activeRoomId);
            if (room) onLayoutChange(activeRoomId, updates.layout || room.layout);
        } else if (activeStructureId) {
            commitStructures(structures.map(s => s.id === activeStructureId ? { ...s, ...updates } : s), false);
        } else if (activeWallId) {
            commitWalls(walls.map(w => w.id === activeWallId ? { ...w, ...updates } : w), false);
        } else if (activeDoorId) {
            commitDoors(doors.map(d => d.id === activeDoorId ? { ...d, ...updates } : d), false);
        } else if (activeWindowId) {
            commitWindows(windows.map(w => w.id === activeWindowId ? { ...w, ...updates } : w), false);
        } else if (activeFurnitureId) {
            commitFurniture(furniture.map(f => f.id === activeFurnitureId ? { ...f, ...updates } : f), false);
        }
    };

    const handleLayerToggle = (layerKey: keyof Layers) => {
        setLayers(prev => ({
            ...prev,
            [layerKey]: { ...prev[layerKey], visible: !prev[layerKey]?.visible }
        }));
    };

    const handleLayerLock = (layerKey: keyof Layers) => {
        setLayers(prev => ({
            ...prev,
            [layerKey]: { ...prev[layerKey], locked: !prev[layerKey]?.locked }
        }));
    };

    const handleContextMenuAction = (action: string) => {
        const item = getSelectedItem();
        if (!item) return;

        switch (action) {
            case 'copy':
                handleCopy();
                break;
            case 'paste':
                handlePaste();
                break;
            case 'cut':
                handleCut();
                break;
            case 'delete':
                handleDelete();
                break;
            case 'rotate':
                if ('layout' in item || 'x' in item) {
                    const currentRotation = (item as Door | Window | Furniture).rotation || 0;
                    handlePropertyUpdate({ rotation: (currentRotation + 90) % 360 });
                }
                break;
            default:
                break;
        }
    };

    return (
        <div className="flex h-[650px]">
            {/* Tools Sidebar */}
            <FloorplanTools
                activeTool={activeTool}
                setActiveTool={setTool}
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onFitToView={handleFitToView}
                onExportSVG={handleExportSVG}
                onExportPNG={handleExportPNG}
                onExportPDF={handleExportPDF}
                showGrid={showGrid}
                toggleGrid={() => setShowGrid(!showGrid)}
                measurementUnit={measurementUnit}
                setMeasurementUnit={setMeasurementUnit}
                scale={scale}
                setScale={setScale}
                onBackgroundImageUpload={handleBackgroundImageUpload}
                onAddRoomTemplate={(template) => addRoom(template)}
            />

            <div className="flex flex-col flex-1">
                {/* Control Bar */}
                <div className='p-3 border-b dark:border-gray-700 flex justify-between items-center bg-white dark:bg-[#2c2e36] rounded-t-xl'>
                    <div className='flex gap-4 text-sm text-gray-500 font-medium'>
                        <button onClick={handleCopy} disabled={!activeStructureId && !activeWallId && !activeDoorId && !activeWindowId && !activeFurnitureId} className='hover:text-brand-blue disabled:opacity-50 flex items-center gap-1'><Copy size={14}/> Copy</button>
                        <button onClick={handlePaste} disabled={!clipboard} className='hover:text-brand-blue disabled:opacity-50 flex items-center gap-1'><Clipboard size={14}/> Paste</button>
                        <button onClick={handleCut} disabled={!activeStructureId && !activeWallId && !activeDoorId && !activeWindowId && !activeFurnitureId} className='hover:text-brand-blue disabled:opacity-50 flex items-center gap-1'><Scissors size={14}/> Cut</button>
                        <button onClick={handleDelete} disabled={!activeStructureId && !activeWallId && !activeDoorId && !activeWindowId && !activeFurnitureId} className='hover:text-red-500 disabled:opacity-50 flex items-center gap-1'><Trash2 size={14}/> Delete</button>
                    </div>

                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-500">Zoom: {(zoom * 100).toFixed(0)}%</span>
                        <button
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTool === 'structure' ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
                            onClick={() => setTool('structure')}
                        >
                            <BoxSelect size={16}/> Add Area
                        </button>
                        <button
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTool === 'wall' ? 'bg-red-500 text-white shadow-lg' : 'bg-brand-blue text-white hover:bg-blue-600'}`}
                            onClick={() => setTool(activeTool === 'wall' ? 'select' : 'wall')}
                        >
                            <Zap size={16}/> {activeTool === 'wall' ? (wallStartPoint ? 'Finish' : 'Wall') : 'Add Wall'}
                        </button>
                    </div>
                </div>

                {/* SVG Canvas */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-hidden bg-gray-50 dark:bg-[#1f2128] rounded-b-xl border-x border-b dark:border-gray-700 relative"
                    style={{ cursor: activeTool === 'wall' || activeTool === 'measure' ? 'crosshair' : typeof isPanning === 'object' && isPanning !== null ? 'grabbing' : 'default' }}
                    tabIndex={0}
                    onMouseDown={startPan}
                    onMouseUp={stopPan}
                    onMouseLeave={stopPan}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        const item = getSelectedItem();
                        if (item) {
                            setContextMenu({ x: e.clientX, y: e.clientY });
                        }
                    }}
                >
                    <svg
                        ref={svgRef}
                        width={width} height={height}
                        className="w-full h-full shadow-inner focus:outline-none"
                        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                        onMouseMove={handleMouseMove as any}
                        onMouseUp={(e) => { stopInteraction(); stopPan(); }}
                        onTouchMove={handleMouseMove as any}
                        onTouchEnd={(e) => { stopInteraction(); stopPan(); }}
                        onClick={handleCanvasClick}
                    >
                        {/* Background Image */}
                        {backgroundImage && (
                            <image
                                href={backgroundImage}
                                x={0}
                                y={0}
                                width={width}
                                height={height}
                                opacity="0.3"
                            />
                        )}

                        {/* Grid */}
                        {showGrid && (
                            <>
                                <pattern id="smallGrid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                                    <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                                </pattern>
                                <rect width="100%" height="100%" fill="url(#smallGrid)" />
                            </>
                        )}

                        {/* Layer 1: Structures (Lobbies) */}
                        {layers.structures?.visible !== false && structures.map((struct) => (
                            <LayoutShape
                                key={struct.id}
                                data={struct}
                                isStructure={true}
                                onClick={(s) => {
                                    setActiveStructureId(s.id);
                                    setShowPropertyPanel(true);
                                    setActiveRoomId(null);
                                    setActiveWallId(null);
                                    setActiveDoorId(null);
                                    setActiveWindowId(null);
                                    setActiveFurnitureId(null);
                                }}
                            />
                        ))}

                        {/* Layer 2: Functional Rooms */}
                        {layers.rooms?.visible !== false && rooms.map((room) => (
                            <LayoutShape
                                key={room.id}
                                data={room}
                                onClick={(r, e?) => {
                                    if (r.panorama360Url && (e?.ctrlKey || e?.metaKey)) {
                                        setViewing360Room(r);
                                    } else {
                                        setActiveRoomId(r.id);
                                        setShowPropertyPanel(true);
                                        setActiveStructureId(null);
                                        setActiveWallId(null);
                                        setActiveDoorId(null);
                                        setActiveWindowId(null);
                                        setActiveFurnitureId(null);
                                        onRoomClick?.(rooms.findIndex(rm => rm.id === r.id));
                                    }
                                }}
                            />
                        ))}

                        {/* Layer 3: Walls */}
                        {layers.walls?.visible !== false && walls.map((wall) => (
                            <WallSegment key={wall.id} wall={wall} />
                        ))}

                        {/* Layer 4: Doors */}
                        {layers.doors?.visible !== false && doors.map((door) => (
                            <DoorComponent
                                key={door.id}
                                door={door}
                                isSelected={activeDoorId === door.id}
                                onClick={() => {
                                    setActiveDoorId(door.id);
                                    setShowPropertyPanel(true);
                                    setActiveRoomId(null);
                                    setActiveStructureId(null);
                                    setActiveWallId(null);
                                    setActiveWindowId(null);
                                    setActiveFurnitureId(null);
                                }}
                                onMouseDown={(e) => {
                                    if (activeTool === 'select') {
                                        e.preventDefault();
                                        setActiveDoorId(door.id);
                                        setIsDragging(true);
                                        const { x, y } = getCoords(e);
                                        setCursorOffset({ x: x - door.x, y: y - door.y });
                                    }
                                }}
                            />
                        ))}

                        {/* Layer 5: Windows */}
                        {layers.windows?.visible !== false && windows.map((windowItem) => (
                            <WindowComponent
                                key={windowItem.id}
                                window={windowItem}
                                isSelected={activeWindowId === windowItem.id}
                                onClick={() => {
                                    setActiveWindowId(windowItem.id);
                                    setShowPropertyPanel(true);
                                    setActiveRoomId(null);
                                    setActiveStructureId(null);
                                    setActiveWallId(null);
                                    setActiveDoorId(null);
                                    setActiveFurnitureId(null);
                                }}
                                onMouseDown={(e) => {
                                    if (activeTool === 'select') {
                                        e.preventDefault();
                                        setActiveWindowId(windowItem.id);
                                        setIsDragging(true);
                                        const { x, y } = getCoords(e);
                                        setCursorOffset({ x: x - windowItem.x, y: y - windowItem.y });
                                    }
                                }}
                            />
                        ))}

                        {/* Layer 6: Furniture */}
                        {layers.furniture?.visible !== false && furniture.map((item) => (
                            <FurnitureComponent
                                key={item.id}
                                furniture={item}
                                isSelected={activeFurnitureId === item.id}
                                onClick={() => {
                                    setActiveFurnitureId(item.id);
                                    setShowPropertyPanel(true);
                                    setActiveRoomId(null);
                                    setActiveStructureId(null);
                                    setActiveWallId(null);
                                    setActiveDoorId(null);
                                    setActiveWindowId(null);
                                }}
                                onMouseDown={(e) => {
                                    if (activeTool === 'select') {
                                        e.preventDefault();
                                        setActiveFurnitureId(item.id);
                                        setIsDragging(true);
                                        const { x, y } = getCoords(e);
                                        setCursorOffset({ x: x - item.x, y: y - item.y });
                                    }
                                }}
                            />
                        ))}

                        {/* Layer 7: Text Labels */}
                        {layers.text?.visible !== false && textLabels.map((label) => (
                            <g key={label.id}>
                                <text
                                    x={label.x}
                                    y={label.y}
                                    fontSize={label.fontSize || 14}
                                    fill={label.color || "#000"}
                                    fontWeight={label.bold ? "bold" : "normal"}
                                    className="cursor-pointer"
                                    onClick={() => {
                                        // Edit text label - could open property panel
                                    }}
                                >
                                    {label.text}
                                </text>
                                {label.selected && (
                                    <rect
                                        x={label.x - 5}
                                        y={label.y - (label.fontSize || 14) - 5}
                                        width={label.text.length * ((label.fontSize || 14) * 0.6) + 10}
                                        height={(label.fontSize || 14) + 10}
                                        fill="none"
                                        stroke="#3D84ED"
                                        strokeWidth={2}
                                        strokeDasharray="5,5"
                                    />
                                )}
                            </g>
                        ))}

                        {/* Layer 8: Custom Shapes */}
                        {layers.shapes?.visible !== false && customShapes.map((shape) => {
                            if (shape.type === 'circle') {
                                return (
                                    <circle
                                        key={shape.id}
                                        cx={shape.cx}
                                        cy={shape.cy}
                                        r={shape.r}
                                        fill={shape.fill}
                                        stroke={shape.stroke}
                                        strokeWidth={shape.strokeWidth}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            // Select shape
                                        }}
                                    />
                                );
                            } else if (shape.type === 'polygon') {
                                return (
                                    <polygon
                                        key={shape.id}
                                        points={typeof shape.points === 'string' ? shape.points : shape.points.map(p => `${p.x},${p.y}`).join(' ')}
                                        fill={shape.fill}
                                        stroke={shape.stroke}
                                        strokeWidth={shape.strokeWidth}
                                        className="cursor-pointer"
                                    />
                                );
                            }
                            return null;
                        })}

                        {/* Layer 9: Measurements */}
                        {layers.measurements?.visible !== false && measurements.map((measure) => (
                            <g key={measure.id}>
                                <line
                                    x1={measure.x1}
                                    y1={measure.y1}
                                    x2={measure.x2}
                                    y2={measure.y2}
                                    stroke="#3D84ED"
                                    strokeWidth={2}
                                    strokeDasharray="5,5"
                                />
                                <circle cx={measure.x1} cy={measure.y1} r={4} fill="#3D84ED" />
                                <circle cx={measure.x2} cy={measure.y2} r={4} fill="#3D84ED" />
                                <text
                                    x={(measure.x1 + measure.x2) / 2}
                                    y={(measure.y1 + measure.y2) / 2 - 5}
                                    fontSize="12"
                                    fill="#3D84ED"
                                    textAnchor="middle"
                                    className="pointer-events-none"
                                >
                                    {measure.distance}
                                </text>
                            </g>
                        ))}

                        {/* Current Measurement Preview */}
                        {currentMeasurement && (
                            <g>
                                <line
                                    x1={currentMeasurement.x1}
                                    y1={currentMeasurement.y1}
                                    x2={currentMeasurement.x2}
                                    y2={currentMeasurement.y2}
                                    stroke="#3D84ED"
                                    strokeWidth={2}
                                    strokeDasharray="5,5"
                                />
                                <circle cx={currentMeasurement.x1} cy={currentMeasurement.y1} r={4} fill="#3D84ED" />
                                <circle cx={currentMeasurement.x2} cy={currentMeasurement.y2} r={4} fill="#3D84ED" />
                                <text
                                    x={(currentMeasurement.x1 + currentMeasurement.x2) / 2}
                                    y={(currentMeasurement.y1 + currentMeasurement.y2) / 2 - 5}
                                    fontSize="12"
                                    fill="#3D84ED"
                                    textAnchor="middle"
                                    className="pointer-events-none"
                                >
                                    {currentMeasurement.distance}
                                </text>
                            </g>
                        )}

                        {/* Info Overlay */}
                        <g className="pointer-events-none">
                            <text x="10" y="20" fontSize="10" fill="#9CA3AF">Grid: {gridSize}px | {walls.length} Walls | {rooms.length} Rooms</text>
                            <text x="10" y="35" fontSize="10" fill="#9CA3AF">Ctrl+Click room with 360° icon to view | Space+Drag to pan</text>
                            {activeRoomId && (() => {
                                const room = rooms.find(r => r.id === activeRoomId);
                                if (room && room.layout) {
                                    const area = calculateArea(room.layout.width, room.layout.height, scale);
                                    return (
                                        <text x="10" y="50" fontSize="10" fill="#9CA3AF">
                                            Area: {area.display}
                                        </text>
                                    );
                                }
                                return null;
                            })()}
                        </g>
                    </svg>
                </div>

                {/* 360° Viewer Modal */}
                {viewing360Room && (
                    <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-4xl">
                            <Panorama360Viewer
                                imageUrl={viewing360Room.panorama360Url}
                                title={viewing360Room.name || 'Room View'}
                                onClose={() => setViewing360Room(null)}
                            />
                        </div>
                    </div>
                )}

                {/* Context Menu */}
                {contextMenu && (
                    <FloorplanContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        onClose={() => setContextMenu(null)}
                        onAction={handleContextMenuAction}
                        canCopy={!!getSelectedItem()}
                        canPaste={!!clipboard}
                        canCut={!!getSelectedItem()}
                        canDelete={!!getSelectedItem()}
                        canRotate={!!getSelectedItem() && 'layout' in getSelectedItem()!}
                        canFlip={!!getSelectedItem() && 'layout' in getSelectedItem()!}
                        isLocked={false}
                    />
                )}

                {/* Property Panel */}
                {showPropertyPanel && getSelectedItem() && (
                    <FloorplanPropertyPanel
                        selectedItem={getSelectedItem() as any}
                        onClose={() => setShowPropertyPanel(false)}
                        onUpdate={handlePropertyUpdate}
                        scale={scale}
                        unit={measurementUnit}
                    />
                )}

                {/* Layer Panel */}
                <FloorplanLayerPanel
                    layers={layers}
                    onLayerToggle={handleLayerToggle}
                    onLayerLock={handleLayerLock}
                />
            </div>
        </div>
    );
}
