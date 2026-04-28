import React from 'react';

/**
 * Window data interface
 */
export interface WindowData {
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation?: number;
    subType?: string;
    [key: string]: any;
}

/**
 * Props for WindowComponent component
 */
export interface WindowComponentProps {
    window: WindowData;
    isSelected?: boolean;
    onClick?: () => void;
    onMouseDown?: () => void;
}

/**
 * WindowComponent - Renders a window on the floor plan
 */
export default function WindowComponent({ window, isSelected = false, onClick, onMouseDown }: WindowComponentProps) {
    const { x, y, width = 40, height = 60, rotation = 0, subType = 'standard' } = window;

    return (
        <g
            onClick={onClick}
            onMouseDown={onMouseDown}
            cursor="pointer"
            style={{ filter: isSelected ? 'drop-shadow(0 0 3px #3D84ED)' : 'none' }}
        >
            {/* Window frame */}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill="#E0F2FE"
                stroke={isSelected ? '#3D84ED' : '#0EA5E9'}
                strokeWidth={isSelected ? 3 : 2}
                rx={2}
                opacity="0.7"
            />

            {/* Window panes */}
            <line
                x1={x + width / 2}
                y1={y}
                x2={x + width / 2}
                y2={y + height}
                stroke="#0EA5E9"
                strokeWidth={1}
            />
            <line
                x1={x}
                y1={y + height / 2}
                x2={x + width}
                y2={y + height / 2}
                stroke="#0EA5E9"
                strokeWidth={1}
            />

            {/* Selection indicator */}
            {isSelected && (
                <rect
                    x={x - 4}
                    y={y - 4}
                    width={width + 8}
                    height={height + 8}
                    fill="none"
                    stroke="#3D84ED"
                    strokeWidth={2}
                    strokeDasharray="5,5"
                />
            )}
        </g>
    );
}
