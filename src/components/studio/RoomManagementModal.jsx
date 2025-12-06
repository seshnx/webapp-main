import React, { useState } from 'react';
import { Search, Plus, X, Loader2, Trash2 } from 'lucide-react';
// REPLACE HOOK IMPORT WITH COMPONENT IMPORT
import EquipmentAutocomplete from '../shared/EquipmentAutocomplete';

export default function RoomManagementModal({ room, equipment, setRoom, setEquipment, onClose, onSave, onDelete, isNew }) {
    
    // Handler for the new Autocomplete component
    const handleGearSelect = (item) => {
        const newItem = {
            category: item.category || 'Custom',
            subCategory: item.subCategory || 'Other',
            model: item.name,
            brand: item.brand || 'Unknown'
        };
        setEquipment([...equipment, newItem]);
    };
    
    const removeEquipment = (index) => {
        setEquipment(equipment.filter((_, i) => i !== index));
    };
    
    // Group by category for display
    const groupedInventory = equipment.reduce((acc, item) => {
        const cat = item.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold dark:text-white">{room.name || "New Room"} Setup</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400"><X size={20} /></button>
                </div>
                <div className="p-5 space-y-5">
                    {/* ... (Basic Info inputs remain unchanged) ... */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2"><label className="text-sm font-medium text-gray-500">Room Name</label><input className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={room.name} onChange={e => setRoom({ ...room, name: e.target.value })} /></div>
                        <div><label className="text-sm font-medium text-gray-500">Hourly Rate ($)</label><input type="number" className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={room.rate} onChange={e => setRoom({ ...room, rate: parseInt(e.target.value) || 0 })} /></div>
                    </div>
                    <div><label className="text-sm font-medium text-gray-500">Description</label><textarea className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" rows="2" value={room.description} onChange={e => setRoom({ ...room, description: e.target.value })} /></div>
                    <div className="flex items-center"><input type="checkbox" id="room-active" className="h-4 w-4 text-blue-600 border-gray-300 rounded" checked={room.active} onChange={e => setRoom({ ...room, active: e.target.checked })} /><label htmlFor="room-active" className="ml-2 text-sm font-medium dark:text-gray-200">Active / Available for Booking</label></div>
                    
                    <div>
                        <label className="text-sm font-medium text-gray-500">Floorplan Color</label>
                        <input type="color" className="w-full h-8 mt-1 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={room.layout?.color || '#10b981'} onChange={e => setRoom({ ...room, layout: { ...room.layout, color: e.target.value } })} />
                    </div>
                    
                    <h4 className="font-bold pt-3 dark:text-white border-t dark:border-gray-700">Room Inventory</h4>
                    
                    {/* NEW: Reusable Component */}
                    <div className="relative">
                        <label className="text-xs text-gray-500 mb-1 block uppercase font-bold">Add Equipment</label>
                        <EquipmentAutocomplete 
                            placeholder="Type gear name to add to inventory..."
                            onSelect={handleGearSelect}
                        />
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-[#1f2128] rounded-lg p-4 border dark:border-gray-700 min-h-[100px]">
                        {Object.keys(groupedInventory).length === 0 ? <div className="text-center text-gray-400 text-sm py-4">No equipment added.</div> : 
                           Object.keys(groupedInventory).map(cat => (
                               <div key={cat} className="mb-3 last:mb-0">
                                   <h6 className="text-xs font-bold text-blue-600 uppercase mb-1">{cat}</h6>
                                   <div className="flex flex-wrap gap-2">
                                       {groupedInventory[cat].map((item, i) => {
                                           // Find actual index in main array to delete correctly
                                           const origIndex = equipment.indexOf(item);
                                           return (
                                               <span key={i} className="flex items-center gap-1 bg-white dark:bg-dark-card border dark:border-gray-600 px-2 py-1 rounded text-xs dark:text-white shadow-sm">
                                                   <span className="text-gray-500 font-semibold">{item.brand !== 'Unknown' ? item.brand : ''}</span> {item.model}
                                                   <X size={12} className="cursor-pointer hover:text-red-500 ml-1" onClick={() => removeEquipment(origIndex)} />
                                               </span>
                                           );
                                       })}
                                   </div>
                               </div>
                           ))
                        }
                    </div>
                </div>
                <div className="p-4 border-t dark:border-gray-700 flex justify-between">
                    {!isNew && <button onClick={onDelete} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded text-sm flex items-center gap-1">
                        <Trash2 size={16}/> Delete Room
                    </button>}
                    <button onClick={onSave} className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
