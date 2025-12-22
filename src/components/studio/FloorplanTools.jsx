import React from 'react';
import {
    Move, Square, Circle, Triangle, Type, Ruler, DoorOpen, Window,
    Box, RotateCw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut,
    Maximize2, Download, FileText, Image as ImageIcon, Layers,
    Grid, Lock, Unlock, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';

/**
 * FloorplanTools - Toolbar component for floor plan editor
 */
export default function FloorplanTools({
    activeTool,
    setActiveTool,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onZoomIn,
    onZoomOut,
    onFitToView,
    onExportSVG,
    onExportPNG,
    onExportPDF,
    showGrid,
    toggleGrid,
    measurementUnit,
    setMeasurementUnit,
    scale,
    setScale,
    onBackgroundImageUpload,
    onAddRoomTemplate
}) {
    const tools = [
        { id: 'select', icon: Move, label: 'Select', group: 'basic' },
        { id: 'wall', icon: Square, label: 'Wall', group: 'basic' },
        { id: 'room', icon: Square, label: 'Room', group: 'basic' },
        { id: 'structure', icon: Box, label: 'Area', group: 'basic' },
        { id: 'door', icon: DoorOpen, label: 'Door', group: 'elements' },
        { id: 'window', icon: Window, label: 'Window', group: 'elements' },
        { id: 'furniture', icon: Box, label: 'Furniture', group: 'elements' },
        { id: 'measure', icon: Ruler, label: 'Measure', group: 'tools' },
        { id: 'text', icon: Type, label: 'Text', group: 'tools' },
        { id: 'circle', icon: Circle, label: 'Circle', group: 'shapes' },
        { id: 'polygon', icon: Triangle, label: 'Polygon', group: 'shapes' },
    ];

    return (
        <div className="flex flex-col gap-2 p-2 bg-white dark:bg-[#2c2e36] border-r dark:border-gray-700">
            {/* Undo/Redo */}
            <div className="flex gap-1 pb-2 border-b dark:border-gray-700">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    title="Undo (Ctrl+Z)"
                >
                    <RotateCw size={18} className="rotate-180" />
                </button>
                <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    title="Redo (Ctrl+Shift+Z)"
                >
                    <RotateCw size={18} />
                </button>
            </div>

            {/* Basic Tools */}
            <div className="space-y-1">
                <div className="text-xs font-bold text-gray-500 uppercase px-2 py-1">Basic</div>
                {tools.filter(t => t.group === 'basic').map(tool => {
                    const Icon = tool.icon;
                    return (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id)}
                            className={`w-full p-2 rounded flex items-center gap-2 text-sm transition ${
                                activeTool === tool.id
                                    ? 'bg-brand-blue text-white'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                            title={tool.label}
                        >
                            <Icon size={16} />
                            <span className="text-xs">{tool.label}</span>
                        </button>
                    );
                })}
                {/* Room Templates */}
                <div className="pt-2 border-t dark:border-gray-700">
                    <div className="text-xs font-bold text-gray-500 uppercase px-2 py-1">Templates</div>
                    <div className="space-y-1">
                        <button
                            onClick={() => {
                                // Add room from template
                                if (onAddRoomTemplate) {
                                    onAddRoomTemplate({ name: 'Control Room', width: 200, height: 150, color: '#3B82F6' });
                                }
                            }}
                            className="w-full p-1.5 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                            Control Room
                        </button>
                        <button
                            onClick={() => {
                                if (onAddRoomTemplate) {
                                    onAddRoomTemplate({ name: 'Live Room', width: 300, height: 250, color: '#10B981' });
                                }
                            }}
                            className="w-full p-1.5 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                            Live Room
                        </button>
                        <button
                            onClick={() => {
                                if (onAddRoomTemplate) {
                                    onAddRoomTemplate({ name: 'Isolation Booth', width: 120, height: 120, color: '#F59E0B' });
                                }
                            }}
                            className="w-full p-1.5 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                            Isolation Booth
                        </button>
                    </div>
                </div>
            </div>

            {/* Elements */}
            <div className="space-y-1 pt-2 border-t dark:border-gray-700">
                <div className="text-xs font-bold text-gray-500 uppercase px-2 py-1">Elements</div>
                {tools.filter(t => t.group === 'elements').map(tool => {
                    const Icon = tool.icon;
                    return (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id)}
                            className={`w-full p-2 rounded flex items-center gap-2 text-sm transition ${
                                activeTool === tool.id
                                    ? 'bg-brand-blue text-white'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                            title={tool.label}
                        >
                            <Icon size={16} />
                            <span className="text-xs">{tool.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tools */}
            <div className="space-y-1 pt-2 border-t dark:border-gray-700">
                <div className="text-xs font-bold text-gray-500 uppercase px-2 py-1">Tools</div>
                {tools.filter(t => t.group === 'tools').map(tool => {
                    const Icon = tool.icon;
                    return (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id)}
                            className={`w-full p-2 rounded flex items-center gap-2 text-sm transition ${
                                activeTool === tool.id
                                    ? 'bg-brand-blue text-white'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                            title={tool.label}
                        >
                            <Icon size={16} />
                            <span className="text-xs">{tool.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Shapes */}
            <div className="space-y-1 pt-2 border-t dark:border-gray-700">
                <div className="text-xs font-bold text-gray-500 uppercase px-2 py-1">Shapes</div>
                {tools.filter(t => t.group === 'shapes').map(tool => {
                    const Icon = tool.icon;
                    return (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id)}
                            className={`w-full p-2 rounded flex items-center gap-2 text-sm transition ${
                                activeTool === tool.id
                                    ? 'bg-brand-blue text-white'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                            title={tool.label}
                        >
                            <Icon size={16} />
                            <span className="text-xs">{tool.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Zoom Controls */}
            <div className="space-y-1 pt-2 border-t dark:border-gray-700">
                <div className="text-xs font-bold text-gray-500 uppercase px-2 py-1">View</div>
                <button
                    onClick={onZoomIn}
                    className="w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    title="Zoom In"
                >
                    <ZoomIn size={16} />
                </button>
                <button
                    onClick={onZoomOut}
                    className="w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    title="Zoom Out"
                >
                    <ZoomOut size={16} />
                </button>
                <button
                    onClick={onFitToView}
                    className="w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    title="Fit to View"
                >
                    <Maximize2 size={16} />
                </button>
                <button
                    onClick={toggleGrid}
                    className={`w-full p-2 rounded flex items-center gap-2 text-sm ${
                        showGrid
                            ? 'bg-brand-blue text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    title="Toggle Grid"
                >
                    <Grid size={16} />
                    <span className="text-xs">Grid</span>
                </button>
            </div>

            {/* Export */}
            <div className="space-y-1 pt-2 border-t dark:border-gray-700">
                <div className="text-xs font-bold text-gray-500 uppercase px-2 py-1">Export</div>
                <button
                    onClick={onExportSVG}
                    className="w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    title="Export SVG"
                >
                    <FileText size={16} />
                    <span className="text-xs">SVG</span>
                </button>
                <button
                    onClick={onExportPNG}
                    className="w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    title="Export PNG"
                >
                    <ImageIcon size={16} />
                    <span className="text-xs">PNG</span>
                </button>
                <button
                    onClick={onExportPDF}
                    className="w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    title="Export PDF"
                >
                    <FileText size={16} />
                    <span className="text-xs">PDF</span>
                </button>
            </div>

            {/* Background Image */}
            <div className="space-y-1 pt-2 border-t dark:border-gray-700">
                <div className="text-xs font-bold text-gray-500 uppercase px-2 py-1">Background</div>
                <label className="w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2 cursor-pointer">
                    <ImageIcon size={16} />
                    <span className="text-xs">Import Image</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                // This will be handled by parent
                                if (onBackgroundImageUpload) {
                                    onBackgroundImageUpload(e);
                                }
                            }
                        }}
                        className="hidden"
                    />
                </label>
            </div>

            {/* Scale Settings */}
            <div className="pt-2 border-t dark:border-gray-700">
                <div className="text-xs font-bold text-gray-500 uppercase px-2 py-1 mb-2">Scale</div>
                <select
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full p-1.5 text-xs rounded border dark:border-gray-600 dark:bg-[#1f2128] dark:text-white"
                >
                    <option value={10}>1px = 1ft</option>
                    <option value={20}>1px = 0.5ft</option>
                    <option value={5}>1px = 2ft</option>
                </select>
                <select
                    value={measurementUnit}
                    onChange={(e) => setMeasurementUnit(e.target.value)}
                    className="w-full p-1.5 text-xs rounded border dark:border-gray-600 dark:bg-[#1f2128] dark:text-white mt-2"
                >
                    <option value="ft">Feet</option>
                    <option value="m">Meters</option>
                </select>
            </div>
        </div>
    );
}

