import React from 'react';
import { Eye, EyeOff, Lock, Unlock, Layers, LucideIcon } from 'lucide-react';

/**
 * Layer data interface
 */
export interface LayerData {
    visible: boolean;
    locked: boolean;
    [key: string]: any;
}

/**
 * Layer configuration interface
 */
export interface LayerConfig {
    key: string;
    label: string;
    icon: LucideIcon;
}

/**
 * Props for FloorplanLayerPanel component
 */
export interface FloorplanLayerPanelProps {
    layers: Record<string, LayerData>;
    onLayerToggle: (layerKey: string) => void;
    onLayerLock: (layerKey: string) => void;
}

/**
 * FloorplanLayerPanel - Layer visibility and lock management
 */
export default function FloorplanLayerPanel({ layers, onLayerToggle, onLayerLock }: FloorplanLayerPanelProps) {
    const layerList: LayerConfig[] = [
        { key: 'structures', label: 'Structures', icon: Layers },
        { key: 'rooms', label: 'Rooms', icon: Layers },
        { key: 'walls', label: 'Walls', icon: Layers },
        { key: 'doors', label: 'Doors', icon: Layers },
        { key: 'windows', label: 'Windows', icon: Layers },
        { key: 'furniture', label: 'Furniture', icon: Layers },
        { key: 'text', label: 'Text Labels', icon: Layers },
        { key: 'measurements', label: 'Measurements', icon: Layers },
    ];

    return (
        <div className="w-48 bg-white dark:bg-[#2c2e36] border-l dark:border-gray-700 p-3">
            <h3 className="font-bold text-sm dark:text-white mb-3 flex items-center gap-2">
                <Layers size={16} />
                Layers
            </h3>
            <div className="space-y-1">
                {layerList.map(layer => {
                    const layerData = layers[layer.key] || { visible: true, locked: false };
                    const Icon = layer.icon;
                    return (
                        <div
                            key={layer.key}
                            className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            <div className="flex items-center gap-2 flex-1">
                                <button
                                    onClick={() => onLayerToggle(layer.key)}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    {layerData.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <span className="text-xs dark:text-white">{layer.label}</span>
                            </div>
                            <button
                                onClick={() => onLayerLock(layer.key)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                {layerData.locked ? <Lock size={14} /> : <Unlock size={14} />}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
