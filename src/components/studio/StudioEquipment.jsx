import { useState } from 'react';
import { 
    Mic, Speaker, Monitor, Server, Plus, Search, 
    Trash2, Edit2, Save, Loader2, X, 
    Package
} from 'lucide-react';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';
import EquipmentAutocomplete from '../shared/EquipmentAutocomplete';
import { EQUIP_CATEGORIES } from '../../config/constants';

/**
 * Map database category names to EQUIP_CATEGORIES IDs
 */
function mapCategoryToId(dbCategory) {
    if (!dbCategory) return 'other';
    
    const categoryLower = dbCategory.toLowerCase().trim();
    
    // Direct mappings from database category names to EQUIP_CATEGORIES IDs
    const categoryMap = {
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
        'outboard processing': 'outboard_processing',
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
 * StudioEquipment - Full equipment inventory management
 */
export default function StudioEquipment({ user, userData, onUpdate }) {
    const [equipment, setEquipment] = useState(userData?.studioEquipment || []);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const handleSave = async (updatedEquipment) => {
        if (!supabase) return;
        setSaving(true);
        const toastId = toast.loading('Saving equipment...');
        const userId = user?.id || user?.uid;
        
        try {
            await supabase
                .from('profiles')
                .update({ 
                    studio_equipment: updatedEquipment,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);
            
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

    const handleAddItem = async (newItem) => {
        const itemWithId = {
            ...newItem,
            id: Date.now().toString(),
            addedAt: new Date().toISOString()
        };
        await handleSave([...equipment, itemWithId]);
        setShowAddModal(false);
    };

    const handleUpdateItem = async (updatedItem) => {
        const updatedEquipment = equipment.map(item => 
            item.id === updatedItem.id ? updatedItem : item
        );
        await handleSave(updatedEquipment);
        setEditingItem(null);
    };

    const handleDeleteItem = async (itemId) => {
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
    const groupedEquipment = filteredEquipment.reduce((groups, item) => {
        const cat = item.category || 'Other';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(item);
        return groups;
    }, {});

    // Get unique categories
    const categories = [...new Set(equipment.map(item => item.category).filter(Boolean))];

    // Stats
    const totalItems = equipment.length;
    const totalValue = equipment.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);

    const getCategoryIcon = (category) => {
        const iconMap = {
            'microphones_and_input_transducers': Mic,
            'monitoring_and_playback': Speaker,
            'mixing_consoles_and_control': Monitor,
            'outboard_signal_processing': Server,
            'computer_audio_and_interfaces': Server,
        };
        return iconMap[category] || Package;
    };

    const getCategoryLabel = (categoryId) => {
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search equipment..."
                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
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
                    {Object.entries(groupedEquipment).map(([category, items]) => {
                        const CategoryIcon = getCategoryIcon(category);
                        return (
                            <div key={category} className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                                <div className="p-4 bg-gray-50 dark:bg-[#23262f] border-b dark:border-gray-700 flex items-center gap-3">
                                    <CategoryIcon className="text-brand-blue" size={20} />
                                    <h3 className="font-bold dark:text-white">{getCategoryLabel(category)}</h3>
                                    <span className="text-sm text-gray-500">({items.length})</span>
                                </div>
                                <div className="divide-y dark:divide-gray-700">
                                    {items.map(item => (
                                        <div 
                                            key={item.id}
                                            className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#23262f] transition"
                                        >
                                            {/* Item Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold dark:text-white">
                                                        {item.brand && <span className="text-gray-500 font-medium">{item.brand}</span>} {item.name || item.model}
                                                    </span>
                                                    {(item.quantity && item.quantity > 1) && (
                                                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded font-medium">
                                                            Qty: {item.quantity}
                                                        </span>
                                                    )}
                                                    {item.featured && (
                                                        <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {item.model && item.name !== item.model && <span>{item.model}</span>}
                                                    {item.serial && <span className="ml-2">S/N: {item.serial}</span>}
                                                </div>
                                                {item.notes && (
                                                    <div className="text-xs text-gray-400 mt-1">{item.notes}</div>
                                                )}
                                            </div>

                                            {/* Value */}
                                            {item.value && (
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                                        ${parseFloat(item.value).toLocaleString()}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setEditingItem(item)}
                                                    className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            {(showAddModal || editingItem) && (
                <EquipmentModal
                    item={editingItem}
                    onSave={editingItem ? handleUpdateItem : handleAddItem}
                    onClose={() => { setShowAddModal(false); setEditingItem(null); }}
                    saving={saving}
                />
            )}
        </div>
    );
}

/**
 * Equipment Add/Edit Modal
 */
function EquipmentModal({ item, onSave, onClose, saving }) {
    const [formData, setFormData] = useState(item || {
        name: '',
        brand: '',
        model: '',
        category: '',
        serial: '',
        value: '',
        notes: '',
        featured: false,
        quantity: 1
    });

    const handleSubmit = () => {
        if (!formData.name && !formData.model) {
            toast.error('Name or model is required');
            return;
        }
        onSave(formData);
    };

    const handleAutocompleteSelect = (selected) => {
        // Map database category to EQUIP_CATEGORIES ID
        const mappedCategory = mapCategoryToId(selected.category);
        
        setFormData(prev => ({
            ...prev,
            name: selected.name || prev.name,
            brand: selected.brand || prev.brand,
            model: selected.model || prev.model,
            category: mappedCategory // Use mapped category ID
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold dark:text-white">
                        {item ? 'Edit Equipment' : 'Add Equipment'}
                    </h3>
                    <button onClick={onClose}>
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    {/* Primary: Equipment Search */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                            Search Equipment Database
                            <span className="text-gray-400 font-normal ml-2">(Recommended)</span>
                        </label>
                        <EquipmentAutocomplete
                            onSelect={handleAutocompleteSelect}
                            placeholder="Search for equipment (e.g. U87, SSL, Fender Twin)..."
                            className="w-full"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Start typing to search from verified equipment database
                        </p>
                    </div>

                    <div className="border-t dark:border-gray-700 pt-4 space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                                Or enter manually:
                            </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Brand</label>
                                <input
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                    placeholder="e.g. Neumann"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Model *</label>
                                <input
                                    value={formData.model || formData.name}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value, name: e.target.value })}
                                    className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                    placeholder="e.g. U87"
                                />
                            </div>
                        </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Select category...</option>
                                {EQUIP_CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.quantity || 1}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                    className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                    placeholder="1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Serial Number</label>
                                <input
                                    value={formData.serial}
                                    onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                                    className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                    placeholder="Optional"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Value ($)</label>
                                <input
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                    placeholder="Estimated value"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                rows={2}
                                placeholder="Additional details..."
                            />
                        </div>

                        <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#1f2128] rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.featured}
                                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                className="w-4 h-4 text-brand-blue rounded"
                            />
                            <div>
                                <div className="font-medium dark:text-white text-sm">Featured Equipment</div>
                                <div className="text-xs text-gray-500">Highlight this item on your studio profile</div>
                            </div>
                        </label>
                    </div>
                </div>
                <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-6 py-2.5 bg-brand-blue text-white rounded-xl font-bold hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {item ? 'Update' : 'Add Item'}
                    </button>
                </div>
            </div>
        </div>
    );
}
