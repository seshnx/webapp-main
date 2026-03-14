import React from 'react';

/**
 * Wall interface for floor plan
 */
interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  strokeWidth?: number;
}

/**
 * Structure interface for floor plan
 */
interface Structure {
  id: string;
  label?: string;
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
  };
}

/**
 * Room interface for floor plan
 */
interface Room {
  id: string;
  name: string;
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
  };
}

interface FloorplanViewerProps {
  walls: Wall[];
  structures: Structure[];
  rooms: Room[];
  currentRoomId?: string; // For "You Are Here" marker
  roomStatuses: Record<string, 'available' | 'in_use'>; // Real-time status
  scale?: number;
}

/**
 * Read-only floor plan viewer for kiosk display
 * Renders SVG floorplan with status indicators and "You Are Here" marker
 */
export default function FloorplanViewer({
  walls,
  structures,
  rooms,
  currentRoomId,
  roomStatuses,
  scale = 1,
}: FloorplanViewerProps) {
  // Calculate the bounding box of all elements to fit the view
  const calculateBounds = () => {
    const allX = [];
    const allY = [];

    rooms.forEach((room) => {
      allX.push(room.layout.x, room.layout.x + room.layout.width);
      allY.push(room.layout.y, room.layout.y + room.layout.height);
    });

    structures.forEach((struct) => {
      allX.push(struct.layout.x, struct.layout.x + struct.layout.width);
      allY.push(struct.layout.y, struct.layout.y + struct.layout.height);
    });

    walls.forEach((wall) => {
      allX.push(wall.x1, wall.x2);
      allY.push(wall.y1, wall.y2);
    });

    if (allX.length === 0 || allY.length === 0) {
      return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
    }

    const padding = 50;
    return {
      minX: Math.min(...allX) - padding,
      minY: Math.min(...allY) - padding,
      maxX: Math.max(...allX) + padding,
      maxY: Math.max(...allY) + padding,
    };
  };

  const bounds = calculateBounds();
  const viewBox = `${bounds.minX} ${bounds.minY} ${bounds.maxX - bounds.minX} ${
    bounds.maxY - bounds.minY
  }`;

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-full bg-gray-50 dark:bg-gray-900 rounded-lg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Render Walls */}
      {walls.map((wall) => (
        <line
          key={wall.id}
          x1={wall.x1}
          y1={wall.y1}
          x2={wall.x2}
          y2={wall.y2}
          stroke="#374151"
          strokeWidth={wall.strokeWidth || 4}
          strokeLinecap="round"
        />
      ))}

      {/* Render Structures */}
      {structures.map((structure) => (
        <g key={structure.id}>
          <rect
            x={structure.layout.x}
            y={structure.layout.y}
            width={structure.layout.width}
            height={structure.layout.height}
            fill={structure.layout.color || '#94a3b8'}
            fillOpacity={0.1}
            stroke={structure.layout.color || '#94a3b8'}
            strokeWidth={2}
            rx={4}
          />
          {structure.label && (
            <text
              x={structure.layout.x + structure.layout.width / 2}
              y={structure.layout.y + structure.layout.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-semibold fill-gray-700 dark:fill-gray-300"
            >
              {structure.label}
            </text>
          )}
        </g>
      ))}

      {/* Render Rooms with Status Colors */}
      {rooms.map((room) => {
        const status = roomStatuses[room.id];
        const isCurrentRoom = room.id === currentRoomId;

        return (
          <g key={room.id}>
            {/* Room rectangle */}
            <rect
              x={room.layout.x}
              y={room.layout.y}
              width={room.layout.width}
              height={room.layout.height}
              fill={
                isCurrentRoom
                  ? '#3B82F6'
                  : status === 'in_use'
                  ? '#EF4444'
                  : room.layout.color || '#10B981'
              }
              fillOpacity={
                isCurrentRoom ? 0.3 : status === 'in_use' ? 0.2 : 0.1
              }
              stroke={room.layout.color || '#10B981'}
              strokeWidth={2}
              rx={4}
            />

            {/* Room label */}
            <text
              x={room.layout.x + room.layout.width / 2}
              y={room.layout.y + room.layout.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-semibold fill-gray-900 dark:fill-gray-100"
            >
              {room.name}
            </text>

            {/* Status badge */}
            {status && (
              <text
                x={room.layout.x + room.layout.width / 2}
                y={room.layout.y + room.layout.height / 2 + 20}
                textAnchor="middle"
                className="text-xs font-bold"
                fill={status === 'in_use' ? '#EF4444' : '#10B981'}
              >
                {status === 'in_use' ? 'IN USE' : 'AVAILABLE'}
              </text>
            )}

            {/* "You Are Here" pulsing marker */}
            {isCurrentRoom && (
              <>
                <circle
                  cx={room.layout.x + room.layout.width / 2}
                  cy={room.layout.y + room.layout.height / 2}
                  r={20}
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  className="animate-ping"
                />
                <circle
                  cx={room.layout.x + room.layout.width / 2}
                  cy={room.layout.y + room.layout.height / 2}
                  r={10}
                  fill="#3B82F6"
                />
              </>
            )}
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${bounds.minX + 20}, ${bounds.maxY - 80})`}>
        <rect x="0" y="0" width="140" height="70" fill="white" fillOpacity={0.9} rx={4} />
        <text x="10" y="15" className="text-xs font-bold fill-gray-700">
          Legend
        </text>

        <circle cx="15" cy="30" r={6} fill="#10B981" fillOpacity={0.3} stroke="#10B981" />
        <text x="28" y="34" className="text-xs fill-gray-600">Available</text>

        <circle cx="15" cy="45" r={6} fill="#EF4444" fillOpacity={0.3} stroke="#EF4444" />
        <text x="28" y="49" className="text-xs fill-gray-600">In Use</text>

        <circle cx="15" cy="60" r={6} fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" />
        <text x="28" y="64" className="text-xs fill-gray-600">You Are Here</text>
      </g>
    </svg>
  );
}
