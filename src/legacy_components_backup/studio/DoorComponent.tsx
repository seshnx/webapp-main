import React from 'react';
import { DoorOpen } from 'lucide-react';
import { rotatePoint } from '../../utils/floorplanUtils';

/**
 * Door data interface
 */
export interface DoorData {
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation?: number;
    subType?: string;
    direction?: 'left' | 'right';
    [key: string]: any;
}

/**
 * Props for DoorComponent component
 */
export interface DoorComponentProps {
    door: DoorData;
    isSelected?: boolean;
    onClick?: () => void;
    onMouseDown?: () => void;
}

/**
 * DoorComponent - Renders a door on the floor plan
 */
export default function DoorComponent({ door, isSelected = false, onClick, onMouseDown }: DoorComponentProps) {
    const { x, y, width = 30, height = 60, rotation = 0, subType = 'single', direction = 'left' } = door;

    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Door arc path (swinging door)
    const arcRadius = width;
    const arcStart = direction === 'left' ? 180 : 0;
    const arcEnd = direction === 'left' ? 90 : 270;

    // Rotate points if needed
    const getRotatedPoint = (px: number, py: number) => {
        if (rotation === 0) return { x: px, y: py };
        return rotatePoint(px, py, centerX, centerY, rotation);
    };

    const topLeft = getRotatedPoint(x, y);
    const topRight = getRotatedPoint(x + width, y);
    const bottomLeft = getRotatedPoint(x, y + height);
    const bottomRight = getRotatedPoint(x + width, y + height);

    return (
        <g
            onClick={onClick}
            onMouseDown={onMouseDown}
            cursor="pointer"
            style={{ filter: isSelected ? 'drop-shadow(0 0 3px #3D84ED)' : 'none' }}
        >
            {/* Door frame */}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill="none"
                stroke={isSelected ? '#3D84ED' : '#8B5CF6'}
                strokeWidth={isSelected ? 3 : 2}
                rx={2}
            />

            {/* Door panel */}
            <rect
                x={x + 2}
                y={y + 2}
                width={width - 4}
                height={height - 4}
                fill="#F3F4F6"
                stroke="#8B5CF6"
                strokeWidth={1}
            />

            {/* Door swing arc */}
            <path
                d={`M ${centerX} ${centerY} A ${arcRadius} ${arcRadius} 0 0 1 ${direction === 'left' ? x : x + width} ${y}`}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth={1}
                strokeDasharray="3,3"
                opacity="0.5"
            />

            {/* Door handle */}
            <circle
                cx={direction === 'left' ? x + width - 8 : x + 8}
                cy={y + height / 2}
                r={3}
                fill="#8B5CF6"
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
