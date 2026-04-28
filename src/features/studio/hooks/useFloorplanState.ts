import { useState, useRef, useCallback, useEffect } from 'react';
import { calculateDistance, formatMeasurement, snapToGrid, snapToObject, generateId } from '@/utils/floorplanUtils';
import toast from 'react-hot-toast';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useKeyboardShortcuts, commonShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { Layout, Room, Structure, Wall, Door, Window, Furniture, TextLabel, Measurement, CustomShape, LayerState, Layers, RoomTemplate, Point, ContextMenuPosition, ClipboardData, PanState, FloorplanEditorProps } from '@/types/floorplan';

const SNAP_GRID = 10;

/**
 * useFloorplanState hook for managing the state and interactions of the FloorplanEditor.
 */
export function useFloorplanState({
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
    const [isResizing, setIsResizing] = useState<string | boolean>(false);
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
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [draggingWallHandle, setDraggingWallHandle] = useState<{ id: string; point: string } | null>(null);
    const [viewing360Room, setViewing360Room] = useState<Room | null>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
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
    const [customShapes, setCustomShapes] = useState<CustomShape[]>([]);
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
    const [scale, setScale] = useState<number>(10);
    const [measurementUnit, setMeasurementUnit] = useState<'ft' | 'm'>('ft');
    const [snapToObjects, setSnapToObjects] = useState<boolean>(true);
    const [showMeasurements, setShowMeasurements] = useState<boolean>(true);

    // --- UNDO/REDO ---
    const floorplanState = {
        walls,
        structures,
        doors,
        windows,
        furniture,
        textLabels
    };
    const { state: historyState, setState: setHistoryState, undo, redo, canUndo, canRedo, clearHistory } = useUndoRedo(floorplanState, 100);

    // Sync historyState back
    useEffect(() => {
        if (historyState && historyState !== floorplanState) {
            setWalls(historyState.walls || []);
            setStructures(historyState.structures || []);
            setDoors(historyState.doors || []);
            setWindows(historyState.windows || []);
            setFurniture(historyState.furniture || []);
            setTextLabels(historyState.textLabels || []);
        }
    }, [historyState]);

    const width = 800;
    const height = 600;

    useEffect(() => {
        if (propWalls && propWalls !== walls) {
            setWalls(propWalls);
            clearHistory();
        }
    }, [propWalls]);

    useEffect(() => {
        if (propStructures && propStructures !== structures) {
            setStructures(propStructures);
        }
    }, [propStructures]);

    const getCoords = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, applyZoom = true): Point => {
        if (!svgRef.current) return { x: 0, y: 0 };

        const rect = svgRef.current.getBoundingClientRect();
        let clientX = 'clientX' in e ? (e as any).clientX : ('touches' in e && (e as any).touches.length > 0 ? (e as any).touches[0].clientX : 0);
        let clientY = 'clientY' in e ? (e as any).clientY : ('touches' in e && (e as any).touches.length > 0 ? (e as any).touches[0].clientY : 0);

        let x = (clientX - rect.left) / (applyZoom ? zoom : 1) - panOffset.x;
        let y = (clientY - rect.top) / (applyZoom ? zoom : 1) - panOffset.y;

        const snapped = snapToGrid(x, y, gridSize);

        if (snapToObjects && activeTool === 'select') {
            const allObjects: any[] = [
                ...rooms.map(r => ({ x: r.layout.x, y: r.layout.y, width: r.layout.width, height: r.layout.height })),
                ...structures.map(s => ({ x: s.layout.x, y: s.layout.y, width: s.layout.width, height: s.layout.height })),
                ...walls.map(w => ({ x: w.x1, y: w.y1, width: w.x2 - w.x1, height: w.y2 - w.y1 }))
            ];
            return snapToObject(snapped.x, snapped.y, allObjects, 10);
        }

        return snapped;
    }, [zoom, panOffset, gridSize, snapToObjects, activeTool, rooms, structures, walls]);

    const commitWalls = useCallback((newWalls: Wall[], saveToHistory = true) => {
        setWalls(newWalls);
        onWallsChange?.(newWalls);
        if (saveToHistory) {
            setHistoryState({ ...floorplanState, walls: newWalls });
        }
    }, [onWallsChange, floorplanState, setHistoryState]);

    const commitStructures = useCallback((newStructures: Structure[], saveToHistory = true) => {
        setStructures(newStructures);
        onStructuresChange?.(newStructures);
        if (saveToHistory) {
            setHistoryState({ ...floorplanState, structures: newStructures });
        }
    }, [onStructuresChange, floorplanState, setHistoryState]);

    const commitDoors = useCallback((newDoors: Door[], saveToHistory = true) => {
        setDoors(newDoors);
        if (saveToHistory) {
            setHistoryState({ ...floorplanState, doors: newDoors });
        }
    }, [floorplanState, setHistoryState]);

    const commitWindows = useCallback((newWindows: Window[], saveToHistory = true) => {
        setWindows(newWindows);
        if (saveToHistory) {
            setHistoryState({ ...floorplanState, windows: newWindows });
        }
    }, [floorplanState, setHistoryState]);

    const commitFurniture = useCallback((newFurniture: Furniture[], saveToHistory = true) => {
        setFurniture(newFurniture);
        if (saveToHistory) {
            setHistoryState({ ...floorplanState, furniture: newFurniture });
        }
    }, [floorplanState, setHistoryState]);

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
            setActiveRoomId(null);
            setShowPropertyPanel(false);
        }
    }, [activeStructureId, activeWallId, activeDoorId, activeWindowId, activeFurnitureId, activeRoomId, structures, walls, doors, windows, furniture, commitStructures, commitWalls, commitDoors, commitWindows, commitFurniture]);

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
        const offset = 20;
        if (clipboard.type === 'structure') {
            const newStruct: Structure = {
                ...clipboard.data as Structure,
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
                ...clipboard.data as Wall,
                id: `wall_${Date.now()}`,
                x1: (clipboard.data as Wall).x1 + offset,
                y1: (clipboard.data as Wall).y1 + offset,
                x2: (clipboard.data as Wall).x2 + offset,
                y2: (clipboard.data as Wall).y2 + offset
            };
            commitWalls([...walls, newWall]);
            setActiveWallId(newWall.id);
        }
    }, [clipboard, structures, walls, commitStructures, commitWalls]);

    const handleCut = useCallback(() => {
        handleCopy();
        handleDelete();
    }, [handleCopy, handleDelete]);

    const handleDeselect = useCallback(() => {
        setActiveRoomId(null);
        setActiveStructureId(null);
        setActiveWallId(null);
        setActiveDoorId(null);
        setActiveWindowId(null);
        setActiveFurnitureId(null);
        setSelectedItems(new Set());
        setShowPropertyPanel(false);
    }, []);

    const handleDuplicate = useCallback(() => {
        handleCopy();
        setTimeout(() => handlePaste(), 0);
    }, [handleCopy, handlePaste]);

    const handleSave = useCallback(() => {
        toast.success('Floor plan saved to history');
    }, []);

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev * 1.2, 5));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev / 1.2, 0.1));
    }, []);

    const handleFitToView = useCallback(() => {
        setZoom(1);
        setPanOffset({ x: 0, y: 0 });
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!svgRef.current) return;
        const { x, y } = getCoords(e);

        if (activeTool === 'wall' && wallStartPoint) {
            const previewWall: Wall = {
                id: 'preview',
                x1: wallStartPoint.x,
                y1: wallStartPoint.y,
                x2: x,
                y2: y
            };
            setWalls(prev => [...prev.filter(w => w.id !== 'preview'), previewWall]);
            return;
        }

        if (draggingWallHandle) {
            setWalls(prev => prev.map(w => {
                if (w.id !== draggingWallHandle.id) return w;
                return draggingWallHandle.point === 'start'
                    ? { ...w, x1: x, y1: y }
                    : { ...w, x2: x, y2: y };
            }));
            return;
        }

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

        if (activeTool === 'measure' && measureStartPoint) {
            const distance = calculateDistance(measureStartPoint.x, measureStartPoint.y, x, y);
            setCurrentMeasurement({
                id: 'current',
                x1: measureStartPoint.x,
                y1: measureStartPoint.y,
                x2: x,
                y2: y,
                distance: formatMeasurement(distance, scale, measurementUnit)
            });
        }

        if (typeof isPanning === 'object' && isPanning !== null && (e.buttons === 1)) {
            const deltaX = e.movementX;
            const deltaY = e.movementY;
            setPanOffset(prev => ({
                x: prev.x + deltaX / zoom,
                y: prev.y + deltaY / zoom
            }));
        }
    }, [getCoords, activeTool, wallStartPoint, draggingWallHandle, isDragging, cursorOffset, activeRoomId, rooms, onLayoutChange, activeStructureId, activeDoorId, activeWindowId, activeFurnitureId, isResizing, structures, measureStartPoint, scale, measurementUnit, isPanning, zoom]);

    const stopInteraction = useCallback(() => {
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

    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        if (isDragging || isResizing || isPanning) return;
        const { x, y } = getCoords(e);

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

        if (activeTool === 'select') {
            if (!e.ctrlKey && !e.metaKey) {
                handleDeselect();
            }
        }
    }, [isDragging, isResizing, isPanning, getCoords, activeTool, wallStartPoint, walls, measureStartPoint, scale, measurementUnit, doors, windows, furniture, commitWalls, commitDoors, commitWindows, commitFurniture, handleDeselect]);

    const handleExportPNG = useCallback(async () => {
        // Placeholder for PNG export
        toast.info('PNG export triggered');
    }, []);

    const handleExportPDF = useCallback(async () => {
        toast.error('PDF export coming soon');
    }, []);

    const handleBackgroundImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            setBackgroundImage(event.target?.result as string);
            toast.success('Background image loaded');
        };
        reader.readAsDataURL(file);
    }, []);

    const addStructure = useCallback(() => {
        const newStruct: Structure = {
            id: `struct_${Date.now()}`,
            label: 'Lobby / Area',
            layout: { x: 100, y: 100, width: 150, height: 100, color: '#94a3b8' }
        };
        commitStructures([...structures, newStruct]);
        setActiveTool('select');
    }, [structures, commitStructures]);

    const addRoom = useCallback((template: RoomTemplate | null = null) => {
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
        // Room would be added via onRoomClick/parent in reality
        setHistoryState({ ...floorplanState });
    }, [rooms.length, floorplanState, setHistoryState]);

    const setTool = useCallback((tool: string) => {
        setActiveTool(tool);
        setWallStartPoint(null);
        setMeasureStartPoint(null);
        setCurrentMeasurement(null);
        if (tool === 'structure') addStructure();
        else if (tool === 'room') addRoom();
        else {
            setWalls(prev => prev.filter(w => w.id !== 'preview'));
        }
    }, [addStructure, addRoom]);

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
        setCursorOffset({ x: x - room.layout.x, y: y - room.layout.y });
    }, [activeTool, getCoords]);

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
        if (activeTool === 'select' && (e.button === 1 || e.ctrlKey || e.metaKey || (nativeEvent as any).code === 'Space')) {
            e.preventDefault();
            setIsPanning({ startX: e.clientX, startY: e.clientY });
        }
    }, [activeTool]);

    const stopPan = useCallback(() => {
        setIsPanning(false);
    }, []);

    const startDragStructure = useCallback((e: React.MouseEvent | React.TouchEvent, struct: Structure) => {
        if (activeTool !== 'select') return;
        e.preventDefault();
        e.stopPropagation();
        const { x, y } = getCoords(e);
        setActiveStructureId(struct.id);
        setActiveRoomId(null);
        setActiveWallId(null);
        setIsDragging(true);
        setIsResizing(false);
        setCursorOffset({ x: x - struct.layout.x, y: y - struct.layout.y });
    }, [activeTool, getCoords]);

    const startResizeStructure = useCallback((e: React.MouseEvent, struct: Structure, direction: string) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveStructureId(struct.id);
        setActiveRoomId(null);
        setActiveWallId(null);
        setIsDragging(false);
        setIsResizing(direction);
    }, []);

    const startDragWallHandle = useCallback((e: React.MouseEvent, wallId: string, point: string) => {
        if (activeTool !== 'select') return;
        e.preventDefault();
        e.stopPropagation();
        setDraggingWallHandle({ id: wallId, point });
        setActiveRoomId(null);
        setActiveStructureId(null);
        setActiveWallId(wallId);
    }, [activeTool]);

    const selectWall = useCallback((e: React.MouseEvent, wallId: string) => {
        if (activeTool !== 'select') return;
        e.stopPropagation();
        setActiveWallId(wallId);
        setActiveRoomId(null);
        setActiveStructureId(null);
    }, [activeTool]);

    const startDragDoor = useCallback((e: React.MouseEvent, door: Door) => {
        if (activeTool === 'select') {
            e.preventDefault();
            setActiveDoorId(door.id);
            setIsDragging(true);
            const { x, y } = getCoords(e);
            setCursorOffset({ x: x - door.x, y: y - door.y });
        }
    }, [activeTool, getCoords]);

    const startDragWindow = useCallback((e: React.MouseEvent, windowItem: Window) => {
        if (activeTool === 'select') {
            e.preventDefault();
            setActiveWindowId(windowItem.id);
            setIsDragging(true);
            const { x, y } = getCoords(e);
            setCursorOffset({ x: x - windowItem.x, y: y - windowItem.y });
        }
    }, [activeTool, getCoords]);

    const startDragFurniture = useCallback((e: React.MouseEvent, item: Furniture) => {
        if (activeTool === 'select') {
            e.preventDefault();
            setActiveFurnitureId(item.id);
            setIsDragging(true);
            const { x, y } = getCoords(e);
            setCursorOffset({ x: x - item.x, y: y - item.y });
        }
    }, [activeTool, getCoords]);

    useKeyboardShortcuts([
        commonShortcuts.undo(undo),
        commonShortcuts.redo(redo),
        commonShortcuts.save(handleSave),
        commonShortcuts.copy(handleCopy),
        commonShortcuts.paste(handlePaste),
        commonShortcuts.cut(handleCut),
        commonShortcuts.duplicate(handleDuplicate),
        commonShortcuts.delete(handleDelete),
        commonShortcuts.backspace(handleDelete),
        commonShortcuts.escape(handleDeselect),
        commonShortcuts.zoomIn(handleZoomIn),
        commonShortcuts.zoomOut(handleZoomOut),
        commonShortcuts.zoomReset(handleFitToView),
    ]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', stopInteraction);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopInteraction);
        };
    }, [handleMouseMove, stopInteraction]);

    return {
        svgRef,
        containerRef,
        isDragging,
        setIsDragging,
        isResizing,
        setIsResizing,
        cursorOffset,
        setCursorOffset,
        isPanning,
        setIsPanning,
        panOffset,
        setPanOffset,
        activeRoomId,
        setActiveRoomId,
        activeStructureId,
        setActiveStructureId,
        activeWallId,
        setActiveWallId,
        activeDoorId,
        setActiveDoorId,
        activeWindowId,
        setActiveWindowId,
        activeFurnitureId,
        setActiveFurnitureId,
        selectedItems,
        setSelectedItems,
        draggingWallHandle,
        setDraggingWallHandle,
        viewing360Room,
        setViewing360Room,
        contextMenu,
        setContextMenu,
        showPropertyPanel,
        setShowPropertyPanel,
        walls,
        setWalls,
        structures,
        setStructures,
        doors,
        setDoors,
        windows,
        setWindows,
        furniture,
        setFurniture,
        textLabels,
        setTextLabels,
        measurements,
        setMeasurements,
        backgroundImage,
        setBackgroundImage,
        clipboard,
        setClipboard,
        customShapes,
        setCustomShapes,
        layers,
        setLayers,
        roomTemplates,
        setRoomTemplates,
        activeTool,
        setActiveTool,
        wallStartPoint,
        setWallStartPoint,
        measureStartPoint,
        setMeasureStartPoint,
        currentMeasurement,
        setCurrentMeasurement,
        zoom,
        setZoom,
        viewBox,
        setViewBox,
        showGrid,
        setShowGrid,
        gridSize,
        setGridSize,
        scale,
        setScale,
        measurementUnit,
        setMeasurementUnit,
        snapToObjects,
        setSnapToObjects,
        showMeasurements,
        setShowMeasurements,
        undo,
        redo,
        canUndo,
        canRedo,
        clearHistory,
        historyState,
        setHistoryState,
        width,
        height,
        getCoords,
        commitWalls,
        commitStructures,
        commitDoors,
        commitWindows,
        commitFurniture,
        handleDelete,
        handleCopy,
        handlePaste,
        handleCut,
        handleDeselect,
        handleDuplicate,
        handleSave,
        startDragRoom,
        startResizeRoom,
        startPan,
        stopPan,
        addStructure,
        startDragStructure,
        startResizeStructure,
        startDragWallHandle,
        selectWall,
        handleMouseMove,
        stopInteraction,
        handleCanvasClick,
        handleZoomIn,
        handleZoomOut,
        handleFitToView,
        handleExportSVG: () => { /* SVG export logic */ },
        handleExportPNG,
        handleExportPDF,
        handleBackgroundImageUpload,
        setTool,
        addRoom
    };
}
