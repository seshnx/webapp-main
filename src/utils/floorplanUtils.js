/**
 * Floorplan utility functions for calculations and geometry
 */

// Calculate distance between two points
export const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// Calculate area of a rectangle
export const calculateArea = (width, height, scale = 1) => {
    const area = (width * height) / (scale * scale);
    return {
        sqft: area,
        sqm: area * 0.092903,
        display: `${area.toFixed(1)} sq ft (${(area * 0.092903).toFixed(1)} m²)`
    };
};

// Calculate perimeter
export const calculatePerimeter = (width, height, scale = 1) => {
    const perimeter = (2 * (width + height)) / scale;
    return {
        feet: perimeter,
        meters: perimeter * 0.3048,
        display: `${perimeter.toFixed(1)} ft (${(perimeter * 0.3048).toFixed(1)} m)`
    };
};

// Convert pixels to real-world units
export const pixelsToFeet = (pixels, scale = 1) => {
    return pixels / scale;
};

// Convert real-world units to pixels
export const feetToPixels = (feet, scale = 1) => {
    return feet * scale;
};

// Check if point is inside rectangle
export const pointInRect = (px, py, rx, ry, rw, rh) => {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
};

// Check if two rectangles overlap
export const rectsOverlap = (r1, r2) => {
    return !(r1.x + r1.width < r2.x || r2.x + r2.width < r1.x ||
             r1.y + r1.height < r2.y || r2.y + r2.height < r1.y);
};

// Get rectangle center
export const getRectCenter = (x, y, width, height) => {
    return {
        x: x + width / 2,
        y: y + height / 2
    };
};

// Rotate point around center
export const rotatePoint = (px, py, cx, cy, angle) => {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = px - cx;
    const dy = py - cy;
    return {
        x: cx + dx * cos - dy * sin,
        y: cy + dx * sin + dy * cos
    };
};

// Get bounding box of rotated rectangle
export const getRotatedBounds = (x, y, width, height, angle) => {
    const corners = [
        { x: x, y: y },
        { x: x + width, y: y },
        { x: x + width, y: y + height },
        { x: x, y: y + height }
    ];
    
    const center = getRectCenter(x, y, width, height);
    const rotated = corners.map(c => rotatePoint(c.x, c.y, center.x, center.y, angle));
    
    const xs = rotated.map(p => p.x);
    const ys = rotated.map(p => p.y);
    
    return {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys)
    };
};

// Snap point to grid
export const snapToGrid = (x, y, gridSize) => {
    return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize
    };
};

// Snap to nearest object
export const snapToObject = (x, y, objects, threshold = 10) => {
    let snapped = { x, y };
    let minDist = threshold;
    
    objects.forEach(obj => {
        const objX = obj.layout?.x || obj.x || 0;
        const objY = obj.layout?.y || obj.y || 0;
        const objW = obj.layout?.width || obj.width || 0;
        const objH = obj.layout?.height || obj.height || 0;
        
        // Check corners and edges
        const points = [
            { x: objX, y: objY }, // top-left
            { x: objX + objW, y: objY }, // top-right
            { x: objX + objW, y: objY + objH }, // bottom-right
            { x: objX, y: objY + objH }, // bottom-left
            { x: objX + objW / 2, y: objY }, // top-center
            { x: objX + objW, y: objY + objH / 2 }, // right-center
            { x: objX + objW / 2, y: objY + objH }, // bottom-center
            { x: objX, y: objY + objH / 2 }, // left-center
        ];
        
        points.forEach(point => {
            const dist = calculateDistance(x, y, point.x, point.y);
            if (dist < minDist) {
                minDist = dist;
                snapped = point;
            }
        });
    });
    
    return snapped;
};

// Format measurement for display
export const formatMeasurement = (pixels, scale = 1, unit = 'ft') => {
    const value = pixels / scale;
    if (unit === 'ft') {
        return `${value.toFixed(1)} ft`;
    } else if (unit === 'm') {
        return `${(value * 0.3048).toFixed(2)} m`;
    }
    return `${value.toFixed(1)}`;
};

// Export SVG to string
export const exportSVG = (svgElement, width, height) => {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    return { svgString, url, blob: svgBlob };
};

// Export to PNG
export const exportPNG = async (svgElement, width, height, scale = 2) => {
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve, reject) => {
        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                URL.revokeObjectURL(url);
                resolve(blob);
            }, 'image/png');
        };
        img.onerror = reject;
        img.src = url;
    });
};

// Generate room ID
export const generateId = (prefix = 'item') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

