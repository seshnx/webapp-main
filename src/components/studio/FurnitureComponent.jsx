import React from 'react';
import { Box, Sofa, Chair, Table, Bed } from 'lucide-react';

/**
 * FurnitureComponent - Renders furniture on the floor plan
 */
export default function FurnitureComponent({ furniture, isSelected, onClick, onMouseDown }) {
    const { x, y, width = 40, height = 40, rotation = 0, subType = 'box' } = furniture;
    
    const icons = {
        box: Box,
        sofa: Sofa,
        chair: Chair,
        table: Table,
        bed: Bed,
    };
    
    const Icon = icons[subType] || Box;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    return (
        <g
            onClick={onClick}
            onMouseDown={onMouseDown}
            cursor="pointer"
            transform={`translate(${centerX}, ${centerY}) rotate(${rotation}) translate(${-centerX}, ${-centerY})`}
            style={{ filter: isSelected ? 'drop-shadow(0 0 3px #3D84ED)' : 'none' }}
        >
            {/* Furniture shape */}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill="#FEF3C7"
                stroke={isSelected ? '#3D84ED' : '#F59E0B'}
                strokeWidth={isSelected ? 3 : 2}
                rx={4}
            />
            
            {/* Icon */}
            <foreignObject x={x + width / 2 - 12} y={y + height / 2 - 12} width={24} height={24}>
                <div className="flex items-center justify-center w-full h-full">
                    <Icon size={20} className="text-amber-600" />
                </div>
            </foreignObject>
            
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

