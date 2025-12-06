import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Edit, Move, Trash2, Plus, CornerUpLeft, CornerDownRight, Zap, BoxSelect, GripHorizontal, Copy, Clipboard, Scissors } from 'lucide-react';

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
    
    // --- INTERACTION STATE ---
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false); // 'br' for bottom-right, etc.
    const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });

    // Selection State
    const [activeRoomId, setActiveRoomId] = useState(null);
    const [activeStructureId, setActiveStructureId] = useState(null);
    const [activeWallId, setActiveWallId] = useState(null); // Added for wall selection
    const [draggingWallHandle, setDraggingWallHandle] = useState(null); // { id: wallId, point: 'start'|'end' }
    
    // --- DATA STATE (Synced with Props) ---
    // We use local state for immediate UI feedback during drag, but sync with props on idle
    const [walls, setWalls] = useState(propWalls || []); 
    const [structures, setStructures] = useState(propStructures || []); 
    const [clipboard, setClipboard] = useState(null); 
    
    // --- TOOLS STATE ---
    const [activeTool, setActiveTool] = useState('select'); // 'select', 'wall', 'structure'
    const [wallStartPoint, setWallStartPoint] = useState(null);

    const width = 800; // Fixed canvas width
    const height = 600; // Fixed canvas height

    // Sync props to state when they change externally (e.g. initial load)
    useEffect(() => { setWalls(propWalls || []); }, [propWalls]);
    useEffect(() => { setStructures(propStructures || []); }, [propStructures]);

    // Utility function to get position relative to the SVG container
    const getCoords = (e) => {
        const rect = svgRef.current.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;

        // Handle touch events
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        // Snap to grid
        return {
            x: Math.round(x / SNAP_GRID) * SNAP_GRID,
            y: Math.round(y / SNAP_GRID) * SNAP_GRID
        };
    };

    // --- PERSISTENCE HELPERS ---
    const commitWalls = (newWalls) => {
        setWalls(newWalls);
        onWallsChange(newWalls);
    };

    const commitStructures = (newStructures) => {
        setStructures(newStructures);
        onStructuresChange(newStructures);
    };

    // --- CLIPBOARD & EDITING ACTIONS ---

    const handleDelete = useCallback(() => {
        if (activeStructureId) {
            const newStructs = structures.filter(s => s.id !== activeStructureId);
            commitStructures(newStructs);
            setActiveStructureId(null);
        } else if (activeWallId) {
            const newWalls = walls.filter(w => w.id !== activeWallId);
            commitWalls(newWalls);
            setActiveWallId(null);
        }
    }, [activeStructureId, activeWallId, structures, walls]);

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
            // Delete
            if (e.key === 'Delete' || e.key === 'Backspace') {
                handleDelete();
            }
            // Copy (Ctrl+C / Cmd+C)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault(); // Prevent browser copy
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
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleDelete, handleCopy, handlePaste, handleCut]);


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
        setIsDragging(false);
        setIsResizing(direction);
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

        // 3. DRAGGING (Room or Structure)
        if (isDragging) {
            const newPos = { x: x - cursorOffset.x, y: y - cursorOffset.y };
            
            if (activeRoomId) {
                const room = rooms.find(r => r.id === activeRoomId);
                if (room) onLayoutChange(activeRoomId, { ...room.layout, ...newPos });
            } else if (activeStructureId) {
                // Update local state for smooth drag
                setStructures(prev => prev.map(s => s.id === activeStructureId ? { ...s, layout: { ...s.layout, ...newPos } } : s));
            }
        }
        
        // 4. RESIZING (Room or Structure)
        if (isResizing === 'br') {
            if (activeRoomId) {
                const room = rooms.find(r => r.id === activeRoomId);
                if (room) {
                    const newDims = {
                        width: Math.max(SNAP_GRID, x - room.layout.x),
                        height: Math.max(SNAP_GRID, y - room.layout.y)
                    };
                    onLayoutChange(activeRoomId, { ...room.layout, ...newDims });
                }
            } else if (activeStructureId) {
                setStructures(prev => prev.map(s => {
                    if (s.id !== activeStructureId) return s;
                    return {
                        ...s,
                        layout: {
                            ...s.layout,
                            width: Math.max(SNAP_GRID, x - s.layout.x),
                            height: Math.max(SNAP_GRID, y - s.layout.y)
                        }
                    };
                }));
            }
        }
        
    }, [activeRoomId, activeStructureId, isDragging, isResizing, draggingWallHandle, cursorOffset, rooms, onLayoutChange, activeTool, wallStartPoint]);

    const stopInteraction = useCallback(() => {
        // Commit changes on mouse up
        if (isDragging || isResizing) {
            if (activeStructureId) {
                // We need to commit the current state of structures back to parent
                // Since handleMouseMove updated local state, 'structures' is current
                onStructuresChange(structures); 
            }
        }
        if (draggingWallHandle) {
            // Commit wall changes
            onWallsChange(walls);
        }

        setIsDragging(false);
        setIsResizing(false);
        setDraggingWallHandle(null);
        // Note: We don't clear selection here to keep the UI "active"
    }, [isDragging, isResizing, draggingWallHandle, activeStructureId, structures, walls, onStructuresChange, onWallsChange]);
    
    // --- WALL DRAWING CLICK ---
    const handleCanvasClick = useCallback((e) => {
        if (activeTool !== 'wall') {
            // Deselect if clicking empty space
            if(!isDragging && !isResizing) {
                setActiveRoomId(null);
                setActiveStructureId(null);
                setActiveWallId(null);
            }
            return;
        }

        e.stopPropagation();
        const { x, y } = getCoords(e);

        if (!wallStartPoint) {
            setWallStartPoint({ x, y });
        } else {
            const newWall = {
                id: `wall_${Date.now()}`,
                x1: wallStartPoint.x, y1: wallStartPoint.y,
                x2: x, y2: y,
                stroke: '#52525B', strokeWidth: 5
            };
            
            // Clean preview and add new wall, then COMMIT
            const updatedWalls = [...walls.filter(w => w.id !== 'preview'), newWall];
            commitWalls(updatedWalls);
            
            setWallStartPoint(null);
            // Don't reset tool, allow chaining walls
        }
    }, [activeTool, wallStartPoint, isDragging, isResizing, walls]);

    // --- TOOLBAR HANDLERS ---
    const setTool = (tool) => {
        setActiveTool(tool);
        setWallStartPoint(null);
        if (tool === 'structure') addStructure();
        else setWalls(prev => prev.filter(w => w.id !== 'preview')); // Clean preview
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
                onClick={(e) => { e.stopPropagation(); onClick(data); }} 
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
                </text>
                
                {/* Resize Handle */}
                {isActive && (
                    <rect
                        x={layout.x + layout.width - 10} y={layout.y + layout.height - 10} 
                        width="20" height="20" fill="white" stroke="black" strokeWidth="2" rx="4" cursor="nwse-resize"
                        onMouseDown={(e) => isStructure ? startResizeStructure(e, data, 'br') : startResizeRoom(e, data, 'br')}
                        onTouchStart={(e) => isStructure ? startResizeStructure(e, data, 'br') : startResizeRoom(e, data, 'br')}
                    />
                )}
            </g>
        );
    };

    return (
        <div className="flex flex-col h-[650px]">
            {/* Control Bar */}
            <div className='p-3 border-b dark:border-gray-700 flex justify-between items-center bg-white dark:bg-[#2c2e36] rounded-t-xl'>
                <div className='flex gap-4 text-sm text-gray-500 font-medium'>
                    <button onClick={handleCopy} disabled={!activeStructureId && !activeWallId} className='hover:text-brand-blue disabled:opacity-50 flex items-center gap-1'><Copy size={14}/> Copy</button>
                    <button onClick={handlePaste} disabled={!clipboard} className='hover:text-brand-blue disabled:opacity-50 flex items-center gap-1'><Clipboard size={14}/> Paste</button>
                    <button onClick={handleCut} disabled={!activeStructureId && !activeWallId} className='hover:text-brand-blue disabled:opacity-50 flex items-center gap-1'><Scissors size={14}/> Cut</button>
                    <button onClick={handleDelete} disabled={!activeStructureId && !activeWallId} className='hover:text-red-500 disabled:opacity-50 flex items-center gap-1'><Trash2 size={14}/> Delete</button>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTool === 'structure' ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
                        onClick={() => setTool('structure')}
                    >
                        <BoxSelect size={16}/> Add Lobby / Area
                    </button>
                    
                    <button 
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTool === 'wall' ? 'bg-red-500 text-white shadow-lg' : 'bg-brand-blue text-white hover:bg-blue-600'}`}
                        onClick={() => setTool(activeTool === 'wall' ? 'select' : 'wall')}
                    >
                        <Zap size={16}/> {activeTool === 'wall' ? (wallStartPoint ? 'Finish Wall' : 'Drawing Mode') : 'Add Wall'}
                    </button>
                </div>
            </div>
            
            {/* SVG Canvas */}
            <div 
                className="flex-1 overflow-auto bg-gray-50 dark:bg-[#1f2128] rounded-b-xl border-x border-b dark:border-gray-700 relative"
                style={{ cursor: activeTool === 'wall' ? 'crosshair' : 'default' }}
                tabIndex={0} // Make div focusable for keyboard events
                onKeyDown={(e) => {
                    // Re-implement here if window listener isn't preferred, 
                    // but window listener in useEffect is usually better for hotkeys
                }}
            >
                <svg 
                    ref={svgRef}
                    width={width} height={height} 
                    className="w-full h-full shadow-inner focus:outline-none"
                    viewBox={`0 0 ${width} ${height}`}
                    // Events
                    onMouseMove={handleMouseMove}
                    onMouseUp={stopInteraction}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={stopInteraction}
                    onClick={handleCanvasClick}
                >
                    {/* Grid */}
                    <pattern id="smallGrid" width={SNAP_GRID} height={SNAP_GRID} patternUnits="userSpaceOnUse">
                        <path d={`M ${SNAP_GRID} 0 L 0 0 0 ${SNAP_GRID}`} fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#smallGrid)" />
                    
                    {/* Layer 1: Structures (Lobbies) */}
                    {structures.map((struct) => (
                        <LayoutShape key={struct.id} data={struct} isStructure={true} onClick={() => setActiveStructureId(struct.id)} />
                    ))}

                    {/* Layer 2: Functional Rooms */}
                    {rooms.map((room) => (
                        <LayoutShape key={room.id} data={room} onClick={(r) => onRoomClick(rooms.findIndex(rm => rm.id === r.id))} />
                    ))}
                    
                    {/* Layer 3: Walls */}
                    {walls.map((wall) => (
                        <WallSegment key={wall.id} wall={wall} />
                    ))}

                    <text x="10" y="20" fontSize="10" fill="#9CA3AF">Grid: {SNAP_GRID}px | {walls.length} Walls</text>
                </svg>
                
                {/* Context Info Overlay */}
                {activeStructureId && (
                    <div className="absolute bottom-4 right-4 bg-white dark:bg-dark-card p-2 rounded shadow border dark:border-gray-600 text-xs flex gap-2">
                        <input 
                            className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none dark:text-white"
                            value={structures.find(s => s.id === activeStructureId)?.label}
                            onChange={(e) => {
                                const newLabel = e.target.value;
                                setStructures(prev => {
                                    const updated = prev.map(s => s.id === activeStructureId ? { ...s, label: newLabel } : s);
                                    return updated;
                                });
                            }}
                            onBlur={() => commitStructures(structures)} // Commit on blur
                        />
                        <button onClick={handleDelete} className="text-red-500 hover:bg-red-50 rounded p-1"><Trash2 size={14}/></button>
                    </div>
                )}
            </div>
        </div>
    );
}
