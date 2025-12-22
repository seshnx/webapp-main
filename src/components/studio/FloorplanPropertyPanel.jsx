import React from 'react';
import { X, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';
import { calculateArea, calculatePerimeter, formatMeasurement } from '../../utils/floorplanUtils';

/**
 * PropertyPanel - Displays and edits properties of selected objects
 */
export default function FloorplanPropertyPanel({
    selectedItem,
    onClose,
    onUpdate,
    scale = 10,
    unit = 'ft'
}) {
    if (!selectedItem) return null;

    const isRoom = selectedItem.layout && selectedItem.name;
    const isStructure = selectedItem.layout && selectedItem.label;
    const isWall = selectedItem.x1 !== undefined;
    const isDoor = selectedItem.type === 'door';
    const isWindow = selectedItem.type === 'window';
    const isFurniture = selectedItem.type === 'furniture';

    const layout = selectedItem.layout || {};
    const area = layout.width && layout.height ? calculateArea(layout.width, layout.height, scale) : null;
    const perimeter = layout.width && layout.height ? calculatePerimeter(layout.width, layout.height, scale) : null;

    const handleUpdate = (updates) => {
        onUpdate({ ...selectedItem, ...updates });
    };

    return (
        <div className="w-64 bg-white dark:bg-[#2c2e36] border-l dark:border-gray-700 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm dark:text-white">Properties</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Room Properties */}
            {isRoom && (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Name</label>
                        <input
                            type="text"
                            value={selectedItem.name || ''}
                            onChange={(e) => handleUpdate({ name: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Position</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                value={Math.round(layout.x || 0)}
                                onChange={(e) => handleUpdate({ layout: { ...layout, x: Number(e.target.value) } })}
                                className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                placeholder="X"
                            />
                            <input
                                type="number"
                                value={Math.round(layout.y || 0)}
                                onChange={(e) => handleUpdate({ layout: { ...layout, y: Number(e.target.value) } })}
                                className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                placeholder="Y"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Size</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <input
                                    type="number"
                                    value={Math.round(layout.width || 0)}
                                    onChange={(e) => handleUpdate({ layout: { ...layout, width: Number(e.target.value) } })}
                                    className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                    placeholder="Width"
                                />
                                <span className="text-xs text-gray-500">{formatMeasurement(layout.width || 0, scale, unit)}</span>
                            </div>
                            <div>
                                <input
                                    type="number"
                                    value={Math.round(layout.height || 0)}
                                    onChange={(e) => handleUpdate({ layout: { ...layout, height: Number(e.target.value) } })}
                                    className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                    placeholder="Height"
                                />
                                <span className="text-xs text-gray-500">{formatMeasurement(layout.height || 0, scale, unit)}</span>
                            </div>
                        </div>
                    </div>
                    {area && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Area</label>
                            <div className="p-2 bg-gray-50 dark:bg-[#1f2128] rounded text-sm">
                                {area.display}
                            </div>
                        </div>
                    )}
                    {perimeter && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Perimeter</label>
                            <div className="p-2 bg-gray-50 dark:bg-[#1f2128] rounded text-sm">
                                {perimeter.display}
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Color</label>
                        <input
                            type="color"
                            value={layout.color || '#3B82F6'}
                            onChange={(e) => handleUpdate({ layout: { ...layout, color: e.target.value } })}
                            className="w-full h-10 border rounded cursor-pointer"
                        />
                    </div>
                    {selectedItem.rotation !== undefined && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Rotation</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={selectedItem.rotation || 0}
                                    onChange={(e) => handleUpdate({ rotation: Number(e.target.value) })}
                                    className="flex-1 p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                    min="0"
                                    max="360"
                                />
                                <button
                                    onClick={() => handleUpdate({ rotation: ((selectedItem.rotation || 0) + 90) % 360 })}
                                    className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                    title="Rotate 90°"
                                >
                                    <RotateCw size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Structure Properties */}
            {isStructure && (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Label</label>
                        <input
                            type="text"
                            value={selectedItem.label || ''}
                            onChange={(e) => handleUpdate({ label: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Position</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                value={Math.round(layout.x || 0)}
                                onChange={(e) => handleUpdate({ layout: { ...layout, x: Number(e.target.value) } })}
                                className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                            />
                            <input
                                type="number"
                                value={Math.round(layout.y || 0)}
                                onChange={(e) => handleUpdate({ layout: { ...layout, y: Number(e.target.value) } })}
                                className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Size</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                value={Math.round(layout.width || 0)}
                                onChange={(e) => handleUpdate({ layout: { ...layout, width: Number(e.target.value) } })}
                                className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                            />
                            <input
                                type="number"
                                value={Math.round(layout.height || 0)}
                                onChange={(e) => handleUpdate({ layout: { ...layout, height: Number(e.target.value) } })}
                                className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Wall Properties */}
            {isWall && (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Start Point</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                value={Math.round(selectedItem.x1 || 0)}
                                onChange={(e) => handleUpdate({ x1: Number(e.target.value) })}
                                className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                            />
                            <input
                                type="number"
                                value={Math.round(selectedItem.y1 || 0)}
                                onChange={(e) => handleUpdate({ y1: Number(e.target.value) })}
                                className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">End Point</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                value={Math.round(selectedItem.x2 || 0)}
                                onChange={(e) => handleUpdate({ x2: Number(e.target.value) })}
                                className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                            />
                            <input
                                type="number"
                                value={Math.round(selectedItem.y2 || 0)}
                                onChange={(e) => handleUpdate({ y2: Number(e.target.value) })}
                                className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Length</label>
                        <div className="p-2 bg-gray-50 dark:bg-[#1f2128] rounded text-sm">
                            {formatMeasurement(
                                Math.sqrt(Math.pow((selectedItem.x2 || 0) - (selectedItem.x1 || 0), 2) + 
                                         Math.pow((selectedItem.y2 || 0) - (selectedItem.y1 || 0), 2)),
                                scale,
                                unit
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Thickness</label>
                        <input
                            type="number"
                            value={selectedItem.strokeWidth || 5}
                            onChange={(e) => handleUpdate({ strokeWidth: Number(e.target.value) })}
                            className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                            min="1"
                            max="20"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Color</label>
                        <input
                            type="color"
                            value={selectedItem.stroke || '#52525B'}
                            onChange={(e) => handleUpdate({ stroke: e.target.value })}
                            className="w-full h-10 border rounded cursor-pointer"
                        />
                    </div>
                </div>
            )}

            {/* Door/Window/Furniture Properties */}
            {(isDoor || isWindow || isFurniture) && (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Type</label>
                        <input
                            type="text"
                            value={selectedItem.subType || ''}
                            onChange={(e) => handleUpdate({ subType: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                            placeholder={isDoor ? 'Single, Double, Sliding...' : isWindow ? 'Standard, Bay...' : 'Chair, Table...'}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Position</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                value={Math.round(selectedItem.x || 0)}
                                onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
                                className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                            />
                            <input
                                type="number"
                                value={Math.round(selectedItem.y || 0)}
                                onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
                                className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                    </div>
                    {selectedItem.rotation !== undefined && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Rotation</label>
                            <input
                                type="number"
                                value={selectedItem.rotation || 0}
                                onChange={(e) => handleUpdate({ rotation: Number(e.target.value) })}
                                className="w-full p-2 border rounded dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                min="0"
                                max="360"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

