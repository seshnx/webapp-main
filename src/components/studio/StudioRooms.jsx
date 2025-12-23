import React, { useState, useRef } from 'react';
import { 
    Plus, Edit2, Trash2, Users, DollarSign, Mic, 
    LayoutGrid, Save, Loader2, ChevronDown, ChevronUp,
    Copy, Map, List
} from 'lucide-react';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import EquipmentAutocomplete from '../shared/EquipmentAutocomplete';
import FloorplanEditor from './FloorplanEditor';
import Panorama360Viewer from './Panorama360Viewer';
import { useImageUpload } from '../../hooks/useImageUpload';
import { Image as ImageIcon, Upload, X } from 'lucide-react';

/**
 * StudioRooms - Complete room management interface
 */
export default function StudioRooms({ user, userData, onUpdate }) {
    const { t } = useLanguage();
    const [rooms, setRooms] = useState(userData?.rooms || []);
    const [walls, setWalls] = useState(userData?.floorplanWalls || []);
    const [structures, setStructures] = useState(userData?.floorplanStructures || []);
    const [editingRoom, setEditingRoom] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [saving, setSaving] = useState(false);
    const [expandedRoom, setExpandedRoom] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'floorplan'

    const emptyRoom = {
        name: '',
        description: '',
        rate: 50,
        capacity: 4,
        equipment: '',
        amenities: [],
        minBookingHours: 1,
        active: true,
        color: '#3B82F6',
        panorama360Url: null // 360-degree image URL
    };

    const handleSave = async (updatedRooms, updatedWalls = walls, updatedStructures = structures) => {
        if (!supabase) return;
        setSaving(true);
        const toastId = toast.loading('Saving rooms...');
        const userId = user?.id || user?.uid;
        
        try {
            await supabase
                .from('profiles')
                .update({ 
                    rooms: updatedRooms,
                    floorplan_walls: updatedWalls,
                    floorplan_structures: updatedStructures,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);
            
            setRooms(updatedRooms);
            setWalls(updatedWalls);
            setStructures(updatedStructures);
            toast.success('Rooms saved!', { id: toastId });
            if (onUpdate) onUpdate({ rooms: updatedRooms, floorplanWalls: updatedWalls, floorplanStructures: updatedStructures });
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    // Floorplan handlers
    const handleLayoutChange = (roomId, newLayout) => {
        const updatedRooms = rooms.map(r => 
            r.id === roomId ? { ...r, layout: newLayout } : r
        );
        setRooms(updatedRooms);
    };

    const handleWallsChange = async (newWalls) => {
        if (!supabase) return;
        setWalls(newWalls);
        const userId = user?.id || user?.uid;
        // Auto-save walls
        try {
            await supabase
                .from('profiles')
                .update({ floorplan_walls: newWalls, updated_at: new Date().toISOString() })
                .eq('id', userId);
        } catch (error) {
            console.error('Error saving walls:', error);
        }
    };

    const handleStructuresChange = async (newStructures) => {
        if (!supabase) return;
        setStructures(newStructures);
        const userId = user?.id || user?.uid;
        // Auto-save structures
        try {
            await supabase
                .from('profiles')
                .update({ floorplan_structures: newStructures, updated_at: new Date().toISOString() })
                .eq('id', userId);
        } catch (error) {
            console.error('Error saving structures:', error);
        }
    };

    const handleRoomClick = (roomIndex) => {
        if (roomIndex >= 0 && roomIndex < rooms.length) {
            handleEditRoom(roomIndex);
        }
    };

    const handleAddRoom = () => {
        setEditingRoom({ ...emptyRoom, name: `Room ${rooms.length + 1}` });
        setIsAdding(true);
    };

    const handleEditRoom = (index) => {
        setEditingRoom({ ...rooms[index] });
        setIsAdding(false);
        setExpandedRoom(index);
    };

    const handleSaveRoom = async () => {
        if (!editingRoom.name.trim()) {
            toast.error('Room name is required');
            return;
        }

        let updatedRooms;
        if (isAdding) {
            updatedRooms = [...rooms, editingRoom];
        } else {
            updatedRooms = rooms.map((r, i) => i === expandedRoom ? editingRoom : r);
        }

        await handleSave(updatedRooms);
        setEditingRoom(null);
        setIsAdding(false);
        setExpandedRoom(null);
    };

    const handleDeleteRoom = async (index) => {
        if (!confirm(`Delete "${rooms[index].name}"? This cannot be undone.`)) return;
        
        const updatedRooms = rooms.filter((_, i) => i !== index);
        await handleSave(updatedRooms);
    };

    const handleDuplicateRoom = async (index) => {
        const roomToCopy = { ...rooms[index], name: `${rooms[index].name} (Copy)` };
        const updatedRooms = [...rooms, roomToCopy];
        await handleSave(updatedRooms);
    };

    const handleCancelEdit = () => {
        setEditingRoom(null);
        setIsAdding(false);
        setExpandedRoom(null);
    };

    const ROOM_AMENITIES = [
        'Isolation Booth', 'Live Room', 'Control Room', 'Lounge Area',
        'Private Bathroom', 'Natural Light', 'Blackout Curtains', 
        'Video Feed', 'Climate Control', 'Sound Lock'
    ];

    // Prepare rooms with layout for floorplan
    const roomsWithLayout = rooms.map((room, index) => ({
        ...room,
        id: room.id || `room_${index}`,
        layout: room.layout || {
            x: 50 + (index % 3) * 200,
            y: 50 + Math.floor(index / 3) * 150,
            width: 180,
            height: 120,
            color: room.color || '#3B82F6'
        }
    }));

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <LayoutGrid className="text-brand-blue" size={24} />
                        Room Management
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Configure your studio rooms, rates, and equipment
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-1.5 ${
                                viewMode === 'list' 
                                    ? 'bg-white dark:bg-gray-700 shadow text-brand-blue' 
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <List size={16} /> List
                        </button>
                        <button
                            onClick={() => setViewMode('floorplan')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-1.5 ${
                                viewMode === 'floorplan' 
                                    ? 'bg-white dark:bg-gray-700 shadow text-brand-blue' 
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <Map size={16} /> Floorplan
                        </button>
                    </div>
                    <button
                        onClick={handleAddRoom}
                        disabled={isAdding || editingRoom}
                        className="bg-brand-blue text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <Plus size={18} /> Add Room
                    </button>
                </div>
            </div>

            {/* Add New Room Form */}
            {isAdding && editingRoom && (
                                    <RoomEditor
                                        room={editingRoom}
                                        setRoom={setEditingRoom}
                                        onSave={handleSaveRoom}
                                        onCancel={handleCancelEdit}
                                        saving={saving}
                                        isNew={true}
                                        roomAmenities={ROOM_AMENITIES}
                                        user={user}
                                    />
            )}

            {/* Floorplan View */}
            {viewMode === 'floorplan' && !isAdding && (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                    <FloorplanEditor
                        rooms={roomsWithLayout}
                        walls={walls}
                        structures={structures}
                        onRoomClick={handleRoomClick}
                        onLayoutChange={handleLayoutChange}
                        onWallsChange={handleWallsChange}
                        onStructuresChange={handleStructuresChange}
                    />
                    <div className="p-3 bg-gray-50 dark:bg-[#23262f] border-t dark:border-gray-700 text-xs text-gray-500">
                        <strong>Tips:</strong> Click a room to edit • Drag to reposition • Use corner handles to resize • Add walls to define boundaries
                    </div>
                </div>
            )}

            {/* Room List */}
            {viewMode === 'list' && (
            <div className="space-y-4">
                {rooms.length === 0 && !isAdding ? (
                    <div className="bg-white dark:bg-[#2c2e36] rounded-xl border-2 border-dashed dark:border-gray-700 p-12 text-center">
                        <LayoutGrid size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-bold dark:text-white mb-2">No Rooms Yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
                            Add your first room to start accepting bookings
                        </p>
                        <button
                            onClick={handleAddRoom}
                            className="bg-brand-blue text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition"
                        >
                            Add Your First Room
                        </button>
                    </div>
                ) : (
                    rooms.map((room, index) => (
                        <div key={index} className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden shadow-sm">
                            {/* Room Header */}
                            <div 
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-[#23262f] transition"
                                onClick={() => setExpandedRoom(expandedRoom === index ? null : index)}
                            >
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                                        style={{ backgroundColor: room.color || '#3B82F6' }}
                                    >
                                        {room.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold dark:text-white">{room.name}</h3>
                                            {room.active === false && (
                                                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            <span className="flex items-center gap-1">
                                                <DollarSign size={14} />
                                                ${room.rate}/hr
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users size={14} />
                                                {room.capacity} people
                                            </span>
                                            {room.equipment && (
                                                <span className="flex items-center gap-1">
                                                    <Mic size={14} />
                                                    {room.equipment.split(',').length} items
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDuplicateRoom(index); }}
                                        className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                        title="Duplicate"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEditRoom(index); }}
                                        className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteRoom(index); }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    {expandedRoom === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {/* Expanded Edit Form */}
                            {expandedRoom === index && editingRoom && (
                                <div className="border-t dark:border-gray-700">
                                    <RoomEditor
                                        room={editingRoom}
                                        setRoom={setEditingRoom}
                                        onSave={handleSaveRoom}
                                        onCancel={handleCancelEdit}
                                        saving={saving}
                                        isNew={false}
                                        roomAmenities={ROOM_AMENITIES}
                                        user={user}
                                    />
                                </div>
                            )}

                            {/* Collapsed Preview */}
                            {expandedRoom === index && !editingRoom && (
                                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-[#1f2128]">
                                    {room.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{room.description}</p>
                                    )}
                                    {room.equipment && (
                                        <div className="flex flex-wrap gap-2">
                                            {room.equipment.split(',').map((item, i) => (
                                                <span key={i} className="text-xs bg-white dark:bg-gray-800 border dark:border-gray-700 px-2 py-1 rounded">
                                                    {item.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            )}
        </div>
    );
}

/**
 * RoomEditor - Form for editing room details
 */
function RoomEditor({ room, setRoom, onSave, onCancel, saving, isNew, roomAmenities, user }) {
    const { uploadImage, uploading } = useImageUpload();
    const [show360Viewer, setShow360Viewer] = useState(false);
    const fileInputRef = useRef(null);

    const handleAmenityToggle = (amenity) => {
        const current = room.amenities || [];
        if (current.includes(amenity)) {
            setRoom({ ...room, amenities: current.filter(a => a !== amenity) });
        } else {
            setRoom({ ...room, amenities: [...current, amenity] });
        }
    };

    const handle360ImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type (equirectangular 360 images)
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a JPEG or PNG image');
            return;
        }

        // Validate file size (max 20MB for 360 images)
        if (file.size > 20 * 1024 * 1024) {
            toast.error('Image size must be less than 20MB');
            return;
        }

        const userId = user?.id || user?.uid || 'temp';
        const path = `studio-rooms/${userId}/360-images`;
        
        const toastId = toast.loading('Uploading 360° image...');
        
        try {
            const url = await uploadImage(file, path);
            if (url) {
                setRoom({ ...room, panorama360Url: url });
                toast.success('360° image uploaded successfully!', { id: toastId });
            } else {
                toast.error('Upload failed', { id: toastId });
            }
        } catch (error) {
            console.error('360 image upload error:', error);
            toast.error('Failed to upload image', { id: toastId });
        }
    };

    const handleRemove360Image = () => {
        setRoom({ ...room, panorama360Url: null });
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-[#1f2128] space-y-5">
            {isNew && (
                <h3 className="font-bold dark:text-white text-lg mb-4">Add New Room</h3>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Room Name *</label>
                    <input
                        className="w-full p-3 border rounded-xl dark:bg-[#2c2e36] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                        value={room.name}
                        onChange={e => setRoom({ ...room, name: e.target.value })}
                        placeholder="e.g. Studio A"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Room Color</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            className="w-12 h-12 rounded-lg border dark:border-gray-600 cursor-pointer"
                            value={room.color || '#3B82F6'}
                            onChange={e => setRoom({ ...room, color: e.target.value })}
                        />
                        <input
                            className="flex-1 p-3 border rounded-xl dark:bg-[#2c2e36] dark:border-gray-600 dark:text-white"
                            value={room.color || '#3B82F6'}
                            onChange={e => setRoom({ ...room, color: e.target.value })}
                            placeholder="#3B82F6"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                <textarea
                    className="w-full p-3 border rounded-xl dark:bg-[#2c2e36] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                    rows={2}
                    value={room.description || ''}
                    onChange={e => setRoom({ ...room, description: e.target.value })}
                    placeholder="Describe this room, its vibe, and what makes it special..."
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Hourly Rate ($)</label>
                    <input
                        type="number"
                        className="w-full p-3 border rounded-xl dark:bg-[#2c2e36] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                        value={room.rate}
                        onChange={e => setRoom({ ...room, rate: parseInt(e.target.value) || 0 })}
                        min={0}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Capacity</label>
                    <input
                        type="number"
                        className="w-full p-3 border rounded-xl dark:bg-[#2c2e36] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                        value={room.capacity}
                        onChange={e => setRoom({ ...room, capacity: parseInt(e.target.value) || 1 })}
                        min={1}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Min Hours</label>
                    <input
                        type="number"
                        className="w-full p-3 border rounded-xl dark:bg-[#2c2e36] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                        value={room.minBookingHours || 1}
                        onChange={e => setRoom({ ...room, minBookingHours: parseInt(e.target.value) || 1 })}
                        min={1}
                    />
                </div>
                <div className="flex items-end">
                    <label className="flex items-center gap-2 p-3 bg-white dark:bg-[#2c2e36] border dark:border-gray-600 rounded-xl cursor-pointer w-full">
                        <input
                            type="checkbox"
                            className="w-4 h-4 text-brand-blue"
                            checked={room.active !== false}
                            onChange={e => setRoom({ ...room, active: e.target.checked })}
                        />
                        <span className="text-sm font-medium dark:text-white">Active</span>
                    </label>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Equipment</label>
                <EquipmentAutocomplete
                    value={room.equipment || ''}
                    onChange={val => setRoom({ ...room, equipment: val })}
                    placeholder="Search and add equipment..."
                    multi={true}
                />
            </div>

            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Room Features</label>
                <div className="flex flex-wrap gap-2">
                    {roomAmenities.map(amenity => (
                        <button
                            key={amenity}
                            type="button"
                            onClick={() => handleAmenityToggle(amenity)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                                (room.amenities || []).includes(amenity)
                                    ? 'bg-brand-blue text-white border-brand-blue'
                                    : 'bg-white dark:bg-[#2c2e36] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-brand-blue'
                            }`}
                        >
                            {amenity}
                        </button>
                    ))}
                </div>
            </div>

            {/* 360° Image Section */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">360° Panorama Image</label>
                <div className="space-y-3">
                    {room.panorama360Url ? (
                        <div className="relative">
                            <Panorama360Viewer 
                                imageUrl={room.panorama360Url} 
                                title={room.name || 'Room View'}
                            />
                            <button
                                type="button"
                                onClick={handleRemove360Image}
                                className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition z-20"
                                title="Remove 360° image"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed dark:border-gray-600 rounded-xl p-8 text-center bg-white dark:bg-[#2c2e36]">
                            <ImageIcon size={48} className="mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Upload a 360° equirectangular panorama image
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handle360ImageUpload}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="px-4 py-2 bg-brand-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center gap-2 mx-auto disabled:opacity-50"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Upload 360° Image
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                Supports JPEG/PNG • Max 20MB • Equirectangular format recommended
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button
                    onClick={onCancel}
                    className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium transition"
                >
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-brand-blue text-white rounded-xl font-bold hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {isNew ? 'Add Room' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
