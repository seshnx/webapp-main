import React from 'react';

export const DIAGRAM_TYPES = [
    { id: 'guitar_electric', label: 'Electric Guitar' },
    { id: 'guitar_acoustic', label: 'Acoustic Guitar' },
    { id: 'amp_head', label: 'Amplifier Head' },
    { id: 'amp_combo', label: 'Combo Amp' },
    { id: 'keyboard', label: 'Keyboard/Synth' },
    { id: 'rack_unit', label: 'Rack Gear (1U/2U)' },
    { id: 'pedal', label: 'Pedal/Stompbox' }
];

export const InspectionSvg = ({ type, view, onClick, markers = [] }) => {
    const renderMarkers = () => markers.map((m, i) => (
        <g key={i} transform={`translate(${m.x}, ${m.y})`}>
            <circle r="6" fill="#ef4444" stroke="white" strokeWidth="2" className="drop-shadow-md"/>
            <text y="-10" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">{i + 1}</text>
        </g>
    ));

    const commonProps = {
        width: "100%", height: "400", viewBox: "0 0 300 400", className: "w-full h-full cursor-crosshair touch-none select-none",
        onClick: (e) => {
            const rect = e.target.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (300 / rect.width);
            const y = (e.clientY - rect.top) * (400 / rect.height);
            onClick(x, y);
        }
    };

    const paths = {
        guitar_electric: {
            front: <path d="M150,20 C140,20 135,25 135,40 L135,100 C110,110 90,140 90,170 C90,190 100,200 110,210 C100,220 90,240 90,270 C90,330 110,360 150,360 C190,360 210,330 210,270 C210,240 200,220 190,210 C200,200 210,190 210,170 C210,140 190,110 165,100 L165,40 C165,25 160,20 150,20 Z" fill="#e5e7eb" stroke="#374151" strokeWidth="2"/>,
            back: <path d="M150,20 C140,20 135,25 135,40 L135,100 C110,110 90,140 90,170 C90,190 100,200 110,210 C100,220 90,240 90,270 C90,330 110,360 150,360 C190,360 210,330 210,270 C210,240 200,220 190,210 C200,200 210,190 210,170 C210,140 190,110 165,100 L165,40 C165,25 160,20 150,20 Z" fill="#d1d5db" stroke="#374151" strokeWidth="2" strokeDasharray="5,5"/>,
        },
        amp_combo: {
            front: <rect x="50" y="50" width="200" height="250" rx="5" fill="#e5e7eb" stroke="#374151" strokeWidth="2"/>,
            back: <g><rect x="50" y="50" width="200" height="250" rx="5" fill="#d1d5db" stroke="#374151" strokeWidth="2"/><rect x="70" y="200" width="160" height="80" fill="#9ca3af" opacity="0.5"/></g>
        }
    };

    const GenericBox = () => (<rect x="50" y="50" width="200" height="300" rx="10" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="2" strokeDasharray="4"/>);
    const content = paths[type]?.[view] || <GenericBox />;

    return (<svg {...commonProps}>{content}{renderMarkers()}</svg>);
};
