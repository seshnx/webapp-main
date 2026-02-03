import React, { useState } from 'react';
import {
    Mic, Speaker, Monitor, Server, Plus, Search,
    Trash2, Edit2, Loader2, X,
    Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import EquipmentAutocomplete from '../shared/EquipmentAutocomplete';
import { EQUIP_CATEGORIES } from '../../config/constants';

/**
 * Map database category names to EQUIP_CATEGORIES IDs
 */
function mapCategoryToId(dbCategory: string | undefined): string {
    if (!dbCategory) return 'other';

    const categoryLower = dbCategory.toLowerCase().trim();

    // Direct mappings from database category names to EQUIP_CATEGORIES IDs
    const categoryMap: Record<string, string> = {
        // Recording & Production
        'microphones': 'microphones',
        'microphones & transducers': 'microphones',
        'audio interfaces': 'audio_interfaces',
        'preamps': 'preamps',
        'preamps & channel strips': 'preamps',
        'mixing consoles': 'mixing_consoles',
        'mixers & consoles': 'mixing_consoles',
        'mixing consoles & mixers': 'mixing_consoles',
        'studio monitors': 'monitors',
        'monitors': 'monitors',
        'headphones': 'headphones',
        'outboard gear': 'outboard_processing',
        'outboard processing': 'outbound_processing',
        'effects processors': 'effects_processors',
        'converters': 'converters',
        'ad/da converters': 'converters',
        'recording devices': 'recorders',
        'recorders': 'recorders',

        // Instruments
        'electric guitars': 'electric_guitars',
        'acoustic guitars': 'acoustic_guitars',
        'bass guitars': 'bass_guitars',
        'guitar amps': 'guitar_amps',
        'guitar & bass amplifiers': 'guitar_amps',
        'guitar effects': 'guitar_effects',
        'guitar pedals': 'guitar_effects',
        'synthesizers': 'synthesizers',
        'keyboards': 'keyboards',
        'midi controllers': 'midi_controllers',
        'pianos': 'pianos',
        'drum kits': 'drum_kits',
        'electronic drums': 'electronic_drums',
        'drum machines': 'drum_machines',
        'string instruments': 'string_instruments',
        'wind instruments': 'wind_instruments',

        // Live Sound
        'pa speakers': 'pa_speakers',
        'power amps': 'power_amps',
        'live mixers': 'live_mixers',
        'wireless systems': 'wireless_systems',
        'in ear monitors': 'in_ear_monitors',
        'stage gear': 'stage_gear',

        // DJ
        'turntables': 'turntables',
        'dj controllers': 'dj_controllers',
        'dj mixers': 'dj_mixers',

        // Other
        'cables': 'cables',
        'patchbays': 'patchbays',
        'acoustic treatment': 'acoustic_treatment',
        'studio furniture': 'studio_furniture',
        'computers': 'computers',
        'software licenses': 'software_licenses',
        'storage drives': 'storage_drives',
        'stands & mounts': 'stands_mounts',
        'cases & bags': 'cases_bags',
        'vintage gear': 'vintage_gear'
    };

    // Try exact match first
    if (categoryMap[categoryLower]) {
        return categoryMap[categoryLower];
    }

    // Try partial matches
    for (const [key, value] of Object.entries(categoryMap)) {
        if (categoryLower.includes(key) || key.includes(categoryLower)) {
            return value;
        }
    }

    // Try to find by label match in EQUIP_CATEGORIES
    const matched = EQUIP_CATEGORIES.find(cat =>
        cat.label.toLowerCase() === categoryLower ||
        cat.label.toLowerCase().includes(categoryLower) ||
        categoryLower.includes(cat.label.toLowerCase())
    );

    if (matched) {
        return matched.id;
    }

    // Default to 'other' if no match found
    return 'other';
}

/**
 * Equipment item interface
 */
interface EquipmentItem {
    id: string;
    name: string;
    brand?: string;
    model?: string;
    category?: string;
    serial?: string;
    year?: number;
    condition?: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
    value?: string | number;
    featured?: boolean;
    notes?: string;
    addedAt?: string;
    quantity?: number;
    [key: string]: any;
}

/**
 * StudioEquipment props
 */
export interface StudioEquipmentProps {
    user?: any;
    userData?: any;
    onUpdate?: (data: { studioEquipment?: EquipmentItem[] }) => void;
}

/**
 * StudioEquipment - Full equipment inventory management
 */
export default function StudioEquipment({ user, userData, onUpdate }: StudioEquipmentProps) {
    const [equipment, setEquipment] = useState<EquipmentItem[]>(userData?.studioEquipment || []);
    const [saving, setSaving] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);

    const handleSave = async (updatedEquipment: EquipmentItem[]) => {
        setSaving(true);
        const toastId = toast.loading('Saving equipment...');
        const userId = userData?.id || user?.id || user?.uid;

        try {
            const response = await fetch(`/api/studio-ops/profiles/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studioEquipment: updatedEquipment })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save');
            }

            setEquipment(updatedEquipment);
            toast.success('Equipment saved!', { id: toastId });
            if (onUpdate) onUpdate({ studioEquipment: updatedEquipment });
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const handleAddItem = async (newItem: EquipmentItem) => {
        const itemWithId: EquipmentItem = {
            ...newItem,
            id: Date.now().toString(),
            addedAt: new Date().toISOString()
        };
        await handleSave([...equipment, itemWithId]);
        setShowAddModal(false);
    };

    const handleUpdateItem = async (updatedItem: EquipmentItem) => {
        const updatedEquipment = equipment.map(item =>
            item.id === updatedItem.id ? updatedItem : item
        );
        await handleSave(updatedEquipment);
        setEditingItem(null);
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Remove this item from inventory?')) return;
        const updatedEquipment = equipment.filter(item => item.id !== itemId);
        await handleSave(updatedEquipment);
    };

    // Filter equipment
    const filteredEquipment = equipment.filter(item => {
        const matchesSearch = !searchTerm ||
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.model?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Group by category
    const groupedEquipment = filteredEquipment.reduce((groups: Record<string, EquipmentItem[]>, item) => {
        const cat = item.category || 'Other';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(item);
        return groups;
    }, {});

    // Get unique categories
    const categories = [...new Set(equipment.map(item => item.category).filter(Boolean))];

    // Stats
    const totalItems = equipment.length;
    const totalValue = equipment.reduce((sum: number, item) => sum + (parseFloat(String(item.value)) || 0), 0);

    const getCategoryIcon = (category: string): any => {
        const iconMap: Record<string, any> = {
            'microphones_and_input_transducers': Mic,
            'monitoring_and_playback': Speaker,
            'mixing_consoles_and_control': Monitor,
            'outboard_signal_processing': Server,
            'computer_audio_and_interfaces': Server,
        };
        return iconMap[category] || Package;
    };

    const getCategoryLabel = (categoryId: string): string => {
        const cat = EQUIP_CATEGORIES.find(c => c.id === categoryId);
        return cat?.label || categoryId;
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Package className="text-brand-blue" size={24} />
                        Equipment Inventory
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage your studio gear and equipment
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-brand-blue text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition flex items-center gap-2"
                >
                    <Plus size={18} /> Add Equipment
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#2c2e36] p-4 rounded-xl border dark:border-gray-700">
                    <div className="text-2xl font-bold dark:text-white">{totalItems}</div>
                    <div className="text-sm text-gray-500">Total Items</div>
                </div>
                <div className="bg-white dark:bg-[#2c2e36] p-4 rounded-xl border dark:border-gray-700">
                    <div className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Est. Value</div>
                </div>
                <div className="bg-white dark:bg-[#2c2e36] p-4 rounded-xl border dark:border-gray-700">
                    <div className="text-2xl font-bold dark:text-white">{categories.length}</div>
                    <div className="text-sm text-gray-500">Categories</div>
                </div>
                <div className="bg-white dark:bg-[#2c2e36] p-4 rounded-xl border dark:border-gray-700">
                    <div className="text-2xl font-bold text-brand-blue">
                        {equipment.filter(e => e.featured).length}
                    </div>
                    <div className="text-sm text-gray-500">Featured Items</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-[#2c2e36] p-4 rounded-xl border dark:border-gray-700">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        placeholder="Search equipment..."
                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2.5 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                >
                    <option value="all">All Categories</option>
                    {EQUIP_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                </select>
            </div>

            {/* Equipment List */}
            {filteredEquipment.length === 0 ? (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border-2 border-dashed dark:border-gray-700 p-12 text-center">
                    <Package size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-bold dark:text-white mb-2">No Equipment Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {searchTerm || categoryFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Add your studio equipment to showcase your gear'}
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-brand-blue text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition"
                    >
                        Add Your First Item
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedEquipment).map(([category, items]) => (
                        <div key={category} className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                            {/* Category Header */}
                            <div className="p-4 bg-gray-50 dark:bg-[#1f2128] border-b dark:border-gray-700 flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center text-brand-blue">
                                    {React.createElement(getCategoryIcon(category), { size: 20 })}
                                </div>
                                <div>
                                    <h3 className="font-bold dark:text-white">{getCategoryLabel(category)}</h3>
                                    <p className="text-xs text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>

                            {/* Equipment Items */}
                            <div className="divide-y dark:divide-gray-700">
                                {items.map((item) => (
                                    <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#23262f] transition">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold dark:text-white">{item.name}</h4>
                                                    {item.featured && (
                                                        <span className="text-xs bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full">Featured</span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                    {item.brand && item.model && (
                                                        <div>{item.brand} - {item.model}</div>
                                                    )}
                                                    {item.brand && !item.model && <div>{item.brand}</div>}
                                                    {item.serial && <div className="text-xs">SN: {item.serial}</div>}
                                                    {item.year && <div className="text-xs">Year: {item.year}</div>}
                                                    {item.condition && (
                                                        <div className="text-xs capitalize">
                                                            Condition: <span className={`font-medium ${
                                                                item.condition === 'new' || item.condition === 'excellent' ? 'text-green-600 dark:text-green-400' :
                                                                item.condition === 'good' ? 'text-blue-600 dark:text-blue-400' :
                                                                'text-yellow-600 dark:text-yellow-400'
                                                            }`}>{item.condition}</span>
                                                        </div>
                                                    )}
                                                    {item.quantity && item.quantity > 1 && (
                                                        <div className="text-xs">Quantity: {item.quantity}</div>
                                                    )}
                                                    {item.value && (
                                                        <div className="text-xs">Value: ${item.value}</div>
                                                    )}
                                                    {item.notes && (
                                                        <div className="text-xs text-gray-500 line-clamp-1">{item.notes}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditingItem(item)}
                                                    className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {(showAddModal || editingItem) && (
                <EquipmentModal
                    item={editingItem}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingItem(null);
                    }}
                    onSave={editingItem ? handleUpdateItem : handleAddItem}
                />
            )}
        </div>
    );
}

/**
 * EquipmentModal props
 */
interface EquipmentModalProps {
    item: EquipmentItem | null;
    onClose: () => void;
    onSave: (item: EquipmentItem) => void | Promise<void>;
}

/**
 * EquipmentModal - Modal for adding/editing equipment
 */
function EquipmentModal({ item, onClose, onSave }: EquipmentModalProps) {
    const [formData, setFormData] = useState<EquipmentItem>(
        item || {
            name: '',
            brand: '',
            model: '',
            category: '',
            condition: 'good',
            featured: false,
            quantity: 1
        }
    );
    const [saving, setSaving] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof EquipmentItem, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-xl font-bold dark:text-white">
                        {item ? 'Edit Equipment' : 'Add Equipment'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                    >
                        <X size={20} className="dark:text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Equipment Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white"
                                placeholder="e.g. Neumann U87"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Brand
                            </label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => handleChange('brand', e.target.value)}
                                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white"
                                placeholder="e.g. Neumann"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Model
                            </label>
                            <input
                                type="text"
                                value={formData.model}
                                onChange={(e) => handleChange('model', e.target.value)}
                                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white"
                                placeholder="e.g. U87 Ai"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Category
                            </label>
                            <EquipmentAutocomplete
                                value={formData.category}
                                onChange={(value) => handleChange('category', value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Condition
                            </label>
                            <select
                                value={formData.condition}
                                onChange={(e) => handleChange('condition', e.target.value)}
                                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white"
                            >
                                <option value="new">New</option>
                                <option value="excellent">Excellent</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="poor">Poor</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Value ($)
                            </label>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={(e) => handleChange('value', e.target.value)}
                                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Quantity
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Serial Number
                            </label>
                            <input
                                type="text"
                                value={formData.serial}
                                onChange={(e) => handleChange('serial', e.target.value)}
                                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white"
                                placeholder="Optional"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Year
                            </label>
                            <input
                                type="number"
                                value={formData.year || ''}
                                onChange={(e) => handleChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white"
                                placeholder="e.g. 2020"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="featured"
                                checked={formData.featured}
                                onChange={(e) => handleChange('featured', e.target.checked)}
                                className="mr-2"
                            />
                            <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Featured Item
                            </label>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Notes
                            </label>
                            <textarea
                                rows={3}
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white"
                                placeholder="Additional details..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                            {saving ? 'Saving...' : item ? 'Save Changes' : 'Add Equipment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
