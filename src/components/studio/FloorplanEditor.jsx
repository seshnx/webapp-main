import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Edit, Move, Trash2, Plus, CornerUpLeft, CornerDownRight, Zap, BoxSelect, GripHorizontal, Copy, Clipboard, Scissors, Image as ImageIcon, RotateCw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, Maximize2, Ruler, Type, Circle, Triangle } from 'lucide-react';
import Panorama360Viewer from './Panorama360Viewer';
import FloorplanTools from './FloorplanTools';
import FloorplanPropertyPanel from './FloorplanPropertyPanel';
import FloorplanContextMenu from './FloorplanContextMenu';
import FloorplanLayerPanel from './FloorplanLayerPanel';
import DoorComponent from './DoorComponent';
import WindowComponent from './WindowComponent';
import FurnitureComponent from './FurnitureComponent';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { calculateDistance, calculateArea, calculatePerimeter, formatMeasurement, exportSVG, exportPNG, snapToGrid, snapToObject, generateId } from '../../utils/floorplanUtils';
import toast from 'react-hot-toast';

const SNAP_GRID = 10; // Snap movement to 10px grid

// --- GEOMETRY HELPERS ---

// Calculate distance from point (px,py) to line segment (x1,y1)-(x2,y2)
const getDistanceToLineSegment = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
  
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    
    if (len_sq !== 0) param = dot / len_sq;
  
    let xx, yy;
  
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
  
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * FloorplanEditor component for editing studio room layout via interactive SVG.
 */
export default function FloorplanEditor({ rooms, walls: propWalls, structures: propStructures, onRoomClick, onLayoutChange, onWallsChange, onStructuresChange }) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    
    // --- INTERACTION STATE ---
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false); // 'br', 'bl', 'tr', 'tl', 't', 'r', 'b', 'l'
    const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

    // Selection State
    const [activeRoomId, setActiveRoomId] = useState(null);
    const [activeStructureId, setActiveStructureId] = useState(null);
    const [activeWallId, setActiveWallId] = useState(null);
    const [activeDoorId, setActiveDoorId] = useState(null);
    const [activeWindowId, setActiveWindowId] = useState(null);
    const [activeFurnitureId, setActiveFurnitureId] = useState(null);
    const [selectedItems, setSelectedItems] = useState(new Set()); // Multi-select
    const [draggingWallHandle, setDraggingWallHandle] = useState(null);
    const [viewing360Room, setViewing360Room] = useState(null);
    const [contextMenu, setContextMenu] = useState(null); // { x, y }
    const [showPropertyPanel, setShowPropertyPanel] = useState(false);
    
    // --- DATA STATE ---
    const [walls, setWalls] = useState(propWalls || []); 
    const [structures, setStructures] = useState(propStructures || []); 
    const [doors, setDoors] = useState([]);
    const [windows, setWindows] = useState([]);
    const [furniture, setFurniture] = useState([]);
    const [textLabels, setTextLabels] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [clipboard, setClipboard] = useState(null); 
    const [customShapes, setCustomShapes] = useState([]); // circles, polygons, etc.
    const [layers, setLayers] = useState({
        structures: { visible: true, locked: false },
        rooms: { visible: true, locked: false },
        walls: { visible: true, locked: false },
        doors: { visible: true, locked: false },
        windows: { visible: true, locked: false },
        furniture: { visible: true, locked: false },
        text: { visible: true, locked: false },
        measurements: { visible: true, locked: false }
    });
    const [roomTemplates, setRoomTemplates] = useState([
        { name: 'Control Room', width: 200, height: 150, color: '#3B82F6' },
        { name: 'Live Room', width: 300, height: 250, color: '#10B981' },
        { name: 'Isolation Booth', width: 120, height: 120, color: '#F59E0B' },
        { name: 'Lounge', width: 250, height: 200, color: '#8B5CF6' }
    ]);
    
    // --- TOOLS STATE ---
    const [activeTool, setActiveTool] = useState('select');
    const [wallStartPoint, setWallStartPoint] = useState(null);
    const [measureStartPoint, setMeasureStartPoint] = useState(null);
    const [currentMeasurement, setCurrentMeasurement] = useState(null);
    
    // --- VIEW STATE ---
    const [zoom, setZoom] = useState(1);
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 });
    const [showGrid, setShowGrid] = useState(true);
    const [gridSize, setGridSize] = useState(SNAP_GRID);
    const [scale, setScale] = useState(10); // pixels per foot
    const [measurementUnit, setMeasurementUnit] = useState('ft');
    const [snapToObjects, setSnapToObjects] = useState(true);
    
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
    const getCoords = (e, applyZoom = true) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        
        const rect = svgRef.current.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        let x = (clientX - rect.left) / (applyZoom ? zoom : 1) - panOffset.x;
        let y = (clientY - rect.top) / (applyZoom ? zoom : 1) - panOffset.y;
        
        // Snap to grid
        const snapped = snapToGrid(x, y, gridSize);
        
        // Snap to objects if enabled
        if (snapToObjects && activeTool === 'select') {
            const allObjects = [...rooms, ...structures, ...walls.map(w => ({ x: w.x1, y: w.y1, width: w.x2 - w.x1, height: w.y2 - w.y1 }))];
            return snapToObject(snapped.x, snapped.y, allObjects, 10);
        }
        
        return snapped;
    };

    // --- PERSISTENCE HELPERS ---
    const commitWalls = (newWalls, saveToHistory = true) => {
        setWalls(newWalls);
        onWallsChange(newWalls);
        if (saveToHistory) {
            setHistoryState({ ...floorplanState, walls: newWalls });
        }
    };

    const commitStructures = (newStructures, saveToHistory = true) => {
        setStructures(newStructures);
        onStructuresChange(newStructures);
        if (saveToHistory) {
            setHistoryState({ ...floorplanState, structures: newStructures });
        }
    };

    const commitDoors = (newDoors, saveToHistory = true) => {
        setDoors(newDoors);
        if (saveToHistory) {
            setHistoryState({ ...floorplanState, doors: newDoors });
        }
    };

    const commitWindows = (newWindows, saveToHistory = true) => {
        setWindows(newWindows);
        if (saveToHistory) {
            setHistoryState({ ...floorplanState, windows: newWindows });
        }
    };

    const commitFurniture = (newFurniture, saveToHistory = true) => {
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
            const newStruct = {
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
            const newWall = {
                ...clipboard.data,
                id: `wall_${Date.now()}`,
                x1: clipboard.data.x1 + offset,
                y1: clipboard.data.y1 + offset,
                x2: clipboard.data.x2 + offset,
                y2: clipboard.data.y2 + offset
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
        const handleKeyDown = (e) => {
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
    
    const startDragRoom = useCallback((e, room) => {
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

    const startResizeRoom = useCallback((e, room, direction) => {
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

    const startPan = useCallback((e) => {
        if (activeTool === 'select' && (e.button === 1 || e.ctrlKey || e.metaKey || e.space)) {
            e.preventDefault();
            setIsPanning({ startX: e.clientX, startY: e.clientY });
        }
    }, [activeTool]);

    const stopPan = useCallback(() => {
        setIsPanning(false);
    }, []);

    // --- STRUCTURE HANDLERS (Visual Only Rooms) ---

    const addStructure = () => {
        const newStruct = {
            id: `struct_${Date.now()}`,
            label: 'Lobby / Area',
            layout: { x: 100, y: 100, width: 150, height: 100, color: '#94a3b8' } // Slate 400
        };
        commitStructures([...structures, newStruct]);
        setActiveTool('select'); // Reset tool
    };

    const startDragStructure = useCallback((e, struct) => {
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

    const startResizeStructure = useCallback((e, struct, direction) => {
        e.preventDefault();
        e.stopPropagation();
        
        setActiveStructureId(struct.id);
        setActiveRoomId(null);
        setActiveWallId(null);
        setIsDragging(false);
        setIsResizing(direction);
    }, []);

    // --- WALL HANDLERS ---

    const startDragWallHandle = useCallback((e, wallId, point) => {
        if (activeTool !== 'select') return;
        e.preventDefault();
        e.stopPropagation();
        setDraggingWallHandle({ id: wallId, point });
        setActiveRoomId(null);
        setActiveStructureId(null);
        setActiveWallId(wallId);
    }, [activeTool]);

    const selectWall = (e, wallId) => {
        if (activeTool !== 'select') return;
        e.stopPropagation();
        setActiveWallId(wallId);
        setActiveRoomId(null);
        setActiveStructureId(null);
    };

    // --- GLOBAL MOVE HANDLER ---

    const handleMouseMove = useCallback((e) => {
        if (!svgRef.current) return;
        const { x, y } = getCoords(e); // Snapped coords
        
        // 1. WALL DRAWING PREVIEW
        if (activeTool === 'wall' && wallStartPoint) {
            const previewWall = { 
                id: 'preview', 
                x1: wallStartPoint.x, y1: wallStartPoint.y, 
                x2: x, y2: y 
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
                if (room) onLayoutChange(activeRoomId, { ...room.layout, ...newPos });
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
        if (isResizing) {
            if (activeRoomId) {
                const room = rooms.find(r => r.id === activeRoomId);
                if (room) {
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
        if (isPanning && (e.buttons === 1 || e.touches)) {
            const deltaX = e.movementX || (e.touches ? e.touches[0].clientX - (isPanning.startX || 0) : 0);
            const deltaY = e.movementY || (e.touches ? e.touches[0].clientY - (isPanning.startY || 0) : 0);
            setPanOffset(prev => ({
                x: prev.x + deltaX / zoom,
                y: prev.y + deltaY / zoom
            }));
            if (e.touches) {
                setIsPanning({ ...isPanning, startX: e.touches[0].clientX, startY: e.touches[0].clientY });
            }
        }
        
    }, [activeRoomId, activeStructureId, isDragging, isResizing, draggingWallHandle, cursorOffset, rooms, onLayoutChange, activeTool, wallStartPoint]);

    const stopInteraction = useCallback(() => {
        // Commit changes on mouse up
        if (isDragging || isResizing) {
            if (activeStructureId) {
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
        if (draggingWallHandle) {
            onWallsChange(walls);
            setHistoryState({ ...floorplanState, walls });
        }

        setIsDragging(false);
        setIsResizing(false);
        setDraggingWallHandle(null);
    }, [isDragging, isResizing, draggingWallHandle, activeStructureId, activeDoorId, activeWindowId, activeFurnitureId, structures, walls, doors, windows, furniture, onStructuresChange, onWallsChange, floorplanState, setHistoryState]);
    
    // --- CANVAS CLICK HANDLER ---
    const handleCanvasClick = useCallback((e) => {
        if (isDragging || isResizing || isPanning) return;
        
        const { x, y } = getCoords(e);

        // WALL TOOL
        if (activeTool === 'wall') {
            e.stopPropagation();
        if (!wallStartPoint) {
            setWallStartPoint({ x, y });
        } else {
            const newWall = {
                    id: generateId('wall'),
                x1: wallStartPoint.x, y1: wallStartPoint.y,
                x2: x, y2: y,
                stroke: '#52525B', strokeWidth: 5
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
                const newMeasurement = {
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
            const newDoor = {
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
            const newWindow = {
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
            const newFurniture = {
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
            const newLabel = {
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
            const newCircle = {
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

        // POLYGON TOOL (simplified - click to add points, double-click to finish)
        if (activeTool === 'polygon') {
            e.stopPropagation();
            // Polygon creation would need state to track points
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
    }, [activeTool, wallStartPoint, measureStartPoint, isDragging, isResizing, isPanning, walls, doors, windows, furniture, scale, measurementUnit]);

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
    const handleBackgroundImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setBackgroundImage(event.target.result);
            toast.success('Background image loaded');
        };
        reader.readAsDataURL(file);
    };

    // --- TEXT LABEL HANDLERS ---
    const handleTextLabelUpdate = (labelId, updates) => {
        setTextLabels(prev => prev.map(l => l.id === labelId ? { ...l, ...updates } : l));
    };

    // --- CUSTOM SHAPES ---
    const addCircle = (x, y) => {
        const newCircle = {
            id: generateId('circle'),
            type: 'circle',
            cx: x,
            cy: y,
            r: 30,
            fill: '#3B82F6',
            stroke: '#1E40AF',
            strokeWidth: 2
        };
        // Add to a shapes array (would need to be added to state)
        toast.success('Circle added');
    };

    const addPolygon = (points) => {
        const newPolygon = {
            id: generateId('polygon'),
            type: 'polygon',
            points: points,
            fill: '#3B82F6',
            stroke: '#1E40AF',
            strokeWidth: 2
        };
        // Add to shapes array
        toast.success('Polygon added');
    };

    // --- TOOLBAR HANDLERS ---
    const setTool = (tool) => {
        setActiveTool(tool);
        setWallStartPoint(null);
        setMeasureStartPoint(null);
        setCurrentMeasurement(null);
        if (tool === 'structure') addStructure();
        else if (tool === 'room') addRoom();
        else if (tool === 'door') {
            // Door placement will be handled on click
        } else if (tool === 'window') {
            // Window placement will be handled on click
        } else if (tool === 'furniture') {
            // Furniture placement will be handled on click
        } else {
            setWalls(prev => prev.filter(w => w.id !== 'preview')); // Clean preview
        }
    };

    const addRoom = (template = null) => {
        const baseRoom = template || {
            name: `Room ${rooms.length + 1}`,
            width: 150,
            height: 120,
            color: '#3B82F6'
        };
        
        const newRoom = {
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
        const updatedRooms = [...rooms, newRoom];
        onLayoutChange(newRoom.id, newRoom.layout);
        setHistoryState({ ...floorplanState });
    };

    // Collision detection
    const checkCollision = (newItem, existingItems) => {
        return existingItems.some(item => {
            const itemRect = item.layout || { x: item.x, y: item.y, width: item.width, height: item.height };
            const newRect = newItem.layout || { x: newItem.x, y: newItem.y, width: newItem.width, height: newItem.height };
            
            return !(newRect.x + newRect.width < itemRect.x ||
                     itemRect.x + itemRect.width < newRect.x ||
                     newRect.y + newRect.height < itemRect.y ||
                     itemRect.y + itemRect.height < newRect.y);
        });
    };

    // Auto-align helper
    const autoAlign = (item, allItems, threshold = 10) => {
        const itemRect = item.layout || { x: item.x, y: item.y, width: item.width, height: item.height };
        let aligned = { ...itemRect };

        allItems.forEach(other => {
            if (other.id === item.id) return;
            const otherRect = other.layout || { x: other.x, y: other.y, width: other.width, height: other.height };

            // Align to top
            if (Math.abs(itemRect.y - otherRect.y) < threshold) {
                aligned.y = otherRect.y;
            }
            // Align to bottom
            if (Math.abs((itemRect.y + itemRect.height) - (otherRect.y + otherRect.height)) < threshold) {
                aligned.y = (otherRect.y + otherRect.height) - itemRect.height;
            }
            // Align to left
            if (Math.abs(itemRect.x - otherRect.x) < threshold) {
                aligned.x = otherRect.x;
            }
            // Align to right
            if (Math.abs((itemRect.x + itemRect.width) - (otherRect.x + otherRect.width)) < threshold) {
                aligned.x = (otherRect.x + otherRect.width) - itemRect.width;
            }
        });

        return aligned;
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
    
    const WallSegment = ({ wall }) => {
        const isPreview = wall.id === 'preview';
        const isSelected = activeWallId === wall.id;
        return (
            <g onClick={(e) => selectWall(e, wall.id)} cursor="pointer">
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
                            fill="white" stroke="#52525B" strokeWidth="2" 
                            className="cursor-move hover:fill-brand-blue"
                            onMouseDown={(e) => startDragWallHandle(e, wall.id, 'start')}
                        />
                        {/* End Handle */}
                        <circle 
                            cx={wall.x2} cy={wall.y2} r={6} 
                            fill="white" stroke="#52525B" strokeWidth="2" 
                            className="cursor-move hover:fill-brand-blue"
                            onMouseDown={(e) => startDragWallHandle(e, wall.id, 'end')}
                        />
                    </>
                )}
            </g>
        );
    };

    // Generic Shape Renderer (Used for Rooms and Structures)
    const LayoutShape = ({ data, isStructure = false, onClick }) => {
        const { layout, name, rate, label } = data;
        const isActive = isStructure ? activeStructureId === data.id : activeRoomId === data.id;
        
        // Calculate area for display
        const area = layout.width && layout.height ? calculateArea(layout.width, layout.height, scale) : null;
        
        // Determine rounding based on wall locking
        const checkCornerLocked = (cx, cy) => {
            const THRESHOLD = 12; 
            return walls.some(w => getDistanceToLineSegment(cx, cy, w.x1, w.y1, w.x2, w.y2) < THRESHOLD);
        };

        const tlSharp = checkCornerLocked(layout.x, layout.y);
        const trSharp = checkCornerLocked(layout.x + layout.width, layout.y);
        const brSharp = checkCornerLocked(layout.x + layout.width, layout.y + layout.height);
        const blSharp = checkCornerLocked(layout.x, layout.y + layout.height);

        const r = 8; 
        const pathD = [
            `M ${layout.x + (tlSharp?0:r)} ${layout.y}`,
            `L ${layout.x + layout.width - (trSharp?0:r)} ${layout.y}`,
            `Q ${layout.x + layout.width} ${layout.y} ${layout.x + layout.width} ${layout.y + (trSharp?0:r)}`,
            `L ${layout.x + layout.width} ${layout.y + layout.height - (brSharp?0:r)}`,
            `Q ${layout.x + layout.width} ${layout.y + layout.height} ${layout.x + layout.width - (brSharp?0:r)} ${layout.y + layout.height}`,
            `L ${layout.x + (blSharp?0:r)} ${layout.y + layout.height}`,
            `Q ${layout.x} ${layout.y + layout.height} ${layout.x} ${layout.y + layout.height - (blSharp?0:r)}`,
            `L ${layout.x} ${layout.y + (tlSharp?0:r)}`,
            `Q ${layout.x} ${layout.y} ${layout.x + (tlSharp?0:r)} ${layout.y}`,
            `Z`
        ].join(' ');

        return (
            <g 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    onClick(data, e); 
                }} 
                cursor="pointer" 
                style={{ filter: isActive ? `drop-shadow(0 0 5px ${layout.color})` : 'none' }}
                pointerEvents={activeTool !== 'select' ? 'none' : 'auto'}
            >
                <path 
                    d={pathD}
                    fill={layout.color} 
                    opacity={isStructure ? "0.5" : "0.8"} 
                    stroke={layout.color}
                    strokeWidth="4"
                    strokeDasharray={isStructure ? "5,5" : "0"}
                    onMouseDown={(e) => isStructure ? startDragStructure(e, data) : startDragRoom(e, data)}
                    onTouchStart={(e) => isStructure ? startDragStructure(e, data) : startDragRoom(e, data)}
                    style={{ cursor: isResizing ? 'default' : 'grab' }}
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
                        <tspan x={layout.x + layout.width / 2} dy="1.2em" fontSize="10" opacity="0.8">
                            {area.sqft.toFixed(0)} sq ft
                        </tspan>
                    )}
                </text>
                
                {/* 360° Image Indicator */}
                {!isStructure && data.panorama360Url && (
                    <g transform={`translate(${layout.x + layout.width - 20}, ${layout.y + 5})`}>
                        <circle cx="0" cy="0" r="8" fill="#10B981" opacity="0.9" />
                        <text x="0" y="3" fontSize="8" fill="white" textAnchor="middle" style={{ pointerEvents: 'none' }}>360</text>
                    </g>
                )}
                
                {/* Multi-handle Resize Handles */}
                {isActive && (
                    <>
                        {/* Corner Handles */}
                        <rect x={layout.x - 5} y={layout.y - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth="2" cursor="nwse-resize" onMouseDown={(e) => isStructure ? startResizeStructure(e, data, 'tl') : startResizeRoom(e, data, 'tl')} />
                        <rect x={layout.x + layout.width - 5} y={layout.y - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth="2" cursor="nesw-resize" onMouseDown={(e) => isStructure ? startResizeStructure(e, data, 'tr') : startResizeRoom(e, data, 'tr')} />
                        <rect x={layout.x + layout.width - 5} y={layout.y + layout.height - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth="2" cursor="nwse-resize" onMouseDown={(e) => isStructure ? startResizeStructure(e, data, 'br') : startResizeRoom(e, data, 'br')} />
                        <rect x={layout.x - 5} y={layout.y + layout.height - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth="2" cursor="nesw-resize" onMouseDown={(e) => isStructure ? startResizeStructure(e, data, 'bl') : startResizeRoom(e, data, 'bl')} />
                        
                        {/* Edge Handles */}
                        <rect x={layout.x + layout.width / 2 - 5} y={layout.y - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth="2" cursor="ns-resize" onMouseDown={(e) => isStructure ? startResizeStructure(e, data, 't') : startResizeRoom(e, data, 't')} />
                        <rect x={layout.x + layout.width - 5} y={layout.y + layout.height / 2 - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth="2" cursor="ew-resize" onMouseDown={(e) => isStructure ? startResizeStructure(e, data, 'r') : startResizeRoom(e, data, 'r')} />
                        <rect x={layout.x + layout.width / 2 - 5} y={layout.y + layout.height - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth="2" cursor="ns-resize" onMouseDown={(e) => isStructure ? startResizeStructure(e, data, 'b') : startResizeRoom(e, data, 'b')} />
                        <rect x={layout.x - 5} y={layout.y + layout.height / 2 - 5} width="10" height="10" fill="white" stroke="#3D84ED" strokeWidth="2" cursor="ew-resize" onMouseDown={(e) => isStructure ? startResizeStructure(e, data, 'l') : startResizeRoom(e, data, 'l')} />
                    </>
                )}
            </g>
        );
    };

    // Get selected item for property panel
    const getSelectedItem = () => {
        if (activeRoomId) return rooms.find(r => r.id === activeRoomId);
        if (activeStructureId) return structures.find(s => s.id === activeStructureId);
        if (activeWallId) return walls.find(w => w.id === activeWallId);
        if (activeDoorId) return doors.find(d => d.id === activeDoorId);
        if (activeWindowId) return windows.find(w => w.id === activeWindowId);
        if (activeFurnitureId) return furniture.find(f => f.id === activeFurnitureId);
        return null;
    };

    const handlePropertyUpdate = (updates) => {
        const item = getSelectedItem();
        if (!item) return;

        if (activeRoomId) {
            const updated = { ...item, ...updates };
            onLayoutChange(activeRoomId, updated.layout || item.layout);
        } else if (activeStructureId) {
            commitStructures(structures.map(s => s.id === activeStructureId ? { ...s, ...updates } : s));
        } else if (activeWallId) {
            commitWalls(walls.map(w => w.id === activeWallId ? { ...w, ...updates } : w));
        } else if (activeDoorId) {
            commitDoors(doors.map(d => d.id === activeDoorId ? { ...d, ...updates } : d));
        } else if (activeWindowId) {
            commitWindows(windows.map(w => w.id === activeWindowId ? { ...w, ...updates } : w));
        } else if (activeFurnitureId) {
            commitFurniture(furniture.map(f => f.id === activeFurnitureId ? { ...f, ...updates } : f));
        }
    };

    const handleLayerToggle = (layerKey) => {
        setLayers(prev => ({
            ...prev,
            [layerKey]: { ...prev[layerKey], visible: !prev[layerKey]?.visible }
        }));
    };

    const handleLayerLock = (layerKey) => {
        setLayers(prev => ({
            ...prev,
            [layerKey]: { ...prev[layerKey], locked: !prev[layerKey]?.locked }
        }));
    };

    const handleContextMenuAction = (action) => {
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
                if (item.layout || item.x !== undefined) {
                    const currentRotation = item.rotation || 0;
                    handlePropertyUpdate({ rotation: (currentRotation + 90) % 360 });
                }
                break;
            case 'flipH':
                // Flip horizontal logic
                break;
            case 'flipV':
                // Flip vertical logic
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
                    style={{ cursor: activeTool === 'wall' || activeTool === 'measure' ? 'crosshair' : isPanning ? 'grabbing' : 'default' }}
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
                    onMouseMove={handleMouseMove}
                    onMouseUp={(e) => { stopInteraction(); stopPan(); }}
                    onTouchMove={handleMouseMove}
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
                            onClick={(r) => {
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
                                    onRoomClick(rooms.findIndex(rm => rm.id === r.id));
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
                    {layers.windows?.visible !== false && windows.map((window) => (
                        <WindowComponent
                            key={window.id}
                            window={window}
                            isSelected={activeWindowId === window.id}
                            onClick={() => {
                                setActiveWindowId(window.id);
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
                                    setActiveWindowId(window.id);
                                    setIsDragging(true);
                                    const { x, y } = getCoords(e);
                                    setCursorOffset({ x: x - window.x, y: y - window.y });
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
                                    y={label.y - label.fontSize - 5}
                                    width={label.text.length * (label.fontSize * 0.6) + 10}
                                    height={label.fontSize + 10}
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
                                    points={shape.points.map(p => `${p.x},${p.y}`).join(' ')}
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
                        canRotate={!!getSelectedItem()?.layout}
                        canFlip={!!getSelectedItem()?.layout}
                        isLocked={false}
                    />
                )}

                {/* Property Panel */}
                {showPropertyPanel && getSelectedItem() && (
                    <FloorplanPropertyPanel
                        selectedItem={getSelectedItem()}
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
