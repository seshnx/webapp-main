export interface Layout {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    name?: string;
    label?: string;
    rate?: number;
    panorama360Url?: string;
}

export interface Room {
    id: string;
    name?: string;
    layout: Layout;
    rate?: number;
    panorama360Url?: string;
}

export interface Structure {
    id: string;
    label?: string;
    layout: Layout;
}

export interface Wall {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke?: string;
    strokeWidth?: number;
}

export interface Door {
    id: string;
    type: 'door';
    x: number;
    y: number;
    width: number;
    height: number;
    subType?: string;
    direction?: string;
    rotation?: number;
}

export interface Window {
    id: string;
    type: 'window';
    x: number;
    y: number;
    width: number;
    height: number;
    subType?: string;
    rotation?: number;
}

export interface Furniture {
    id: string;
    type: 'furniture';
    x: number;
    y: number;
    width: number;
    height: number;
    subType?: string;
    rotation?: number;
}

export interface TextLabel {
    id: string;
    type: 'text';
    x: number;
    y: number;
    text: string;
    fontSize?: number;
    color?: string;
    bold?: boolean;
    selected?: boolean;
}

export interface Measurement {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    distance: string;
}

export interface CustomShape {
    id: string;
    type: 'circle' | 'polygon';
    cx?: number;
    cy?: number;
    r?: number;
    points?: { x: number; y: number }[] | string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

export interface LayerState {
    visible: boolean;
    locked: boolean;
}

export interface Layers {
    structures: LayerState;
    rooms: LayerState;
    walls: LayerState;
    doors: LayerState;
    windows: LayerState;
    furniture: LayerState;
    text: LayerState;
    measurements: LayerState;
    shapes?: LayerState;
}

export interface RoomTemplate {
    name: string;
    width: number;
    height: number;
    color: string;
}

export interface Point {
    x: number;
    y: number;
}

export interface ContextMenuPosition {
    x: number;
    y: number;
}

export interface ClipboardData {
    type: 'structure' | 'wall';
    data: Structure | Wall | Door | Window | Furniture;
}

export interface PanState {
    startX?: number;
    startY?: number;
}

export interface FloorplanEditorProps {
    rooms: Room[];
    walls?: Wall[];
    structures?: Structure[];
    onRoomClick?: (index: number) => void;
    onLayoutChange?: (roomId: string, layout: Layout) => void;
    onWallsChange?: (walls: Wall[]) => void;
    onStructuresChange?: (structures: Structure[]) => void;
}
