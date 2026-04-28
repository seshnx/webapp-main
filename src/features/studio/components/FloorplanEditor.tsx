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
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useKeyboardShortcuts, commonShortcuts } from '@/hooks/useKeyboardShortcuts';
import { calculateDistance, calculateArea, formatMeasurement, exportSVG, exportPNG, snapToGrid, snapToObject, generateId } from '@/utils/floorplanUtils';
import toast from 'react-hot-toast';

const SNAP_GRID = 10; // Snap movement to 10px grid

import type { Layout, Room, Structure, Wall, Door, Window, Furniture, TextLabel, Measurement, CustomShape, LayerState, Layers, RoomTemplate, Point, ContextMenuPosition, ClipboardData, PanState, FloorplanEditorProps } from '@/types/floorplan';
import { useFloorplanState } from '../hooks/useFloorplanState';

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

    const state = useFloorplanState({
        rooms,
        walls: propWalls,
        structures: propStructures,
        onRoomClick,
        onLayoutChange,
        onWallsChange,
        onStructuresChange
    });

    // Destructure for the JSX below
    const {
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
        handleExportSVG,
        handleBackgroundImageUpload,
        setTool,
        addRoom
    } = state;

    // --- RENDER SUB-COMPONENTS ---

    const WallSegment = ({ wall }: { wall: Wall }) => {
        const isPreview = wall.id === 'preview';
        const isSelected = activeWallId === wall.id;
        const distance = calculateDistance(wall.x1, wall.y1, wall.x2, wall.y2);
        const measurementText = formatMeasurement(distance, scale, measurementUnit);
        const midX = (wall.x1 + wall.x2) / 2;
        const midY = (wall.y1 + wall.y2) / 2;

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
                {/* Measurement label */}
                {showMeasurements && !isPreview && (
                    <text
                        x={midX}
                        y={midY - 10}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#6B7280"
                        className="pointer-events-none select-none dark:fill-gray-400"
                        style={{ textShadow: '0 0 3px white, 0 0 3px white' }}
                    >
                        {measurementText}
                    </text>
                )}
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
                showMeasurements={showMeasurements}
                toggleMeasurements={() => setShowMeasurements(!showMeasurements)}
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
