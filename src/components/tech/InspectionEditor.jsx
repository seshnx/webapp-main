import React, { useState } from 'react';
import { Camera, Save, X, AlertCircle, Upload } from 'lucide-react';
import { InspectionSvg, DIAGRAM_TYPES } from './InspectionDiagrams';
import { useMediaUpload } from '../../hooks/useMediaUpload';

export default function InspectionEditor({ initialData, onSave, onCancel, type }) {
    const [gearType, setGearType] = useState(initialData?.gearType || 'guitar_electric');
    const [view, setView] = useState('front'); 
    const [markers, setMarkers] = useState(initialData?.markers || []);
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [photos, setPhotos] = useState(initialData?.photos || []);
    const [activeMarker, setActiveMarker] = useState(null); 
    const [markerLabel, setMarkerLabel] = useState('');
    const { uploadMedia, uploading } = useMediaUpload();

    const handleDiagramClick = (x, y) => {
        const newMarker = { x, y, view, id: Date.now(), label: '' };
        setMarkers([...markers, newMarker]);
        setActiveMarker(newMarker);
        setMarkerLabel('');
    };

    const saveMarkerLabel = () => {
        if (!activeMarker) return;
        setMarkers(markers.map(m => m.id === activeMarker.id ? { ...m, label: markerLabel } : m));
        setActiveMarker(null);
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const res = await uploadMedia(file, `inspections/${Date.now()}`);
        if (res) setPhotos(prev => [...prev, res]);
    };

    return (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden flex flex-col h-[80vh]">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#23262f]">
                <h3 className="font-bold dark:text-white flex items-center gap-2"><AlertCircle className={type === 'Pre' ? 'text-orange-500' : 'text-green-500'} size={20}/> {type}-Inspection Report</h3>
                <button onClick={onCancel}><X className="text-gray-500"/></button>
            </div>
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <div className="flex-1 bg-gray-100 dark:bg-black/40 relative flex flex-col items-center justify-center p-4">
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        <select className="p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-[#1f2128] text-sm font-bold dark:text-white shadow-sm" value={gearType} onChange={e => setGearType(e.target.value)}>{DIAGRAM_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
                        <div className="flex bg-white dark:bg-[#1f2128] rounded-lg border dark:border-gray-600 p-1 shadow-sm">{['front', 'back', 'sides'].map(v => (<button key={v} onClick={() => setView(v)} className={`px-3 py-1 text-xs font-bold rounded-md capitalize ${view === v ? 'bg-brand-blue text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{v}</button>))}</div>
                    </div>
                    <div className="w-full max-w-md h-full aspect-[3/4] bg-white dark:bg-[#1f2128] rounded-xl shadow-inner border dark:border-gray-700 relative">
                        <InspectionSvg type={gearType} view={view} markers={markers.filter(m => m.view === view)} onClick={handleDiagramClick} />
                        {activeMarker && (<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 bg-white dark:bg-[#2c2e36] p-4 rounded-xl shadow-2xl border border-brand-blue z-20 animate-in zoom-in-95"><h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Identify Issue</h4><input autoFocus className="w-full p-2 border rounded mb-2 text-sm dark:bg-black/20 dark:text-white" placeholder="e.g. Scratch" value={markerLabel} onChange={e => setMarkerLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveMarkerLabel()}/><div className="flex gap-2"><button onClick={() => { setMarkers(markers.filter(m => m.id !== activeMarker.id)); setActiveMarker(null); }} className="flex-1 bg-red-100 text-red-600 py-1 rounded text-xs font-bold">Delete</button><button onClick={saveMarkerLabel} className="flex-1 bg-brand-blue text-white py-1 rounded text-xs font-bold">Save</button></div></div>)}
                    </div>
                </div>
                <div className="w-full md:w-80 bg-white dark:bg-[#2c2e36] border-l dark:border-gray-700 flex flex-col">
                    <div className="p-4 flex-1 overflow-y-auto">
                        <div className="mb-6"><h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Damage Log</h4><div className="space-y-2">{markers.map((m, i) => (<div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-black/20 rounded border dark:border-gray-700"><span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{i+1}</span><div className="flex-1"><div className="text-sm font-bold dark:text-white">{m.label || 'Unlabeled'}</div><div className="text-[10px] text-gray-500 uppercase">{m.view} View</div></div><button onClick={() => setMarkers(markers.filter(mk => mk.id !== m.id))}><X size={14} className="text-gray-400 hover:text-red-500"/></button></div>))}</div></div>
                        <div className="mb-6"><label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Notes</label><textarea className="w-full p-3 border rounded-lg text-sm dark:bg-black/20 dark:border-gray-600 dark:text-white min-h-[100px]" placeholder="Overall condition..." value={notes} onChange={e => setNotes(e.target.value)}/></div>
                        <div><div className="flex justify-between items-center mb-2"><label className="text-xs font-bold text-gray-500 uppercase">Evidence Photos</label><label className="cursor-pointer text-brand-blue hover:text-blue-600"><Upload size={16}/><input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading}/></label></div><div className="grid grid-cols-3 gap-2">{photos.map((p, i) => (<div key={i} className="aspect-square rounded-lg overflow-hidden border dark:border-gray-600 relative group"><img src={p.url} className="w-full h-full object-cover"/><button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition"><X size={12}/></button></div>))}</div></div>
                    </div>
                    <div className="p-4 border-t dark:border-gray-700"><button onClick={() => onSave({ gearType, markers, notes, photos, timestamp: new Date().toISOString() })} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2"><Save size={18}/> Finalize Report</button></div>
                </div>
            </div>
        </div>
    );
}
