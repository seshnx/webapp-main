import React, { useState, useEffect } from 'react';
import { Copy, Plus, Edit2, Trash2, X, Clock, DollarSign, Package, Check, Sparkles } from 'lucide-react';

/**
 * BookingTemplates - Manage and use booking templates
 * Phase 2: Advanced booking features
 */
export default function BookingTemplates({ user, userData, onCreateBooking }) {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        durationHours: 2,
        basePrice: 100,
        rooms: [],
        equipmentPackages: [],
        addOnServices: [],
        isActive: true
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/studio-ops/booking-templates?studioId=${userData?.id}`);
            const data = await response.json();

            if (data.success) {
                setTemplates(data.data);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/studio-ops/booking-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    studioId: userData?.id
                })
            });

            const data = await response.json();

            if (data.success) {
                setTemplates([...templates, data.data]);
                setShowAddModal(false);
                resetForm();
            } else {
                alert(`Error: ${data.error || 'Failed to create template'}`);
            }
        } catch (error) {
            console.error('Error creating template:', error);
            alert('Failed to create template. Please try again.');
        }
    };

    const handleUpdateTemplate = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/studio-ops/booking-templates/${selectedTemplate.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setTemplates(templates.map(t => t.id === selectedTemplate.id ? data.data : t));
                setShowEditModal(false);
                setSelectedTemplate(null);
                resetForm();
            } else {
                alert(`Error: ${data.error || 'Failed to update template'}`);
            }
        } catch (error) {
            console.error('Error updating template:', error);
            alert('Failed to update template. Please try again.');
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        const template = templates.find(t => t.id === templateId);

        if (template.usage_count > 0) {
            alert(`This template has been used ${template.usage_count} time(s). Please deactivate it instead of deleting.`);
            return;
        }

        if (!confirm(`Are you sure you want to delete "${template.name}"?`)) return;

        try {
            const response = await fetch(`/api/studio-ops/booking-templates/${templateId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setTemplates(templates.filter(t => t.id !== templateId));
            } else {
                alert(`Error: ${data.error || 'Failed to delete template'}`);
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Failed to delete template. Please try again.');
        }
    };

    const handleToggleActive = async (template) => {
        try {
            const response = await fetch(`/api/studio-ops/booking-templates/${template.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !template.is_active })
            });

            const data = await response.json();

            if (data.success) {
                setTemplates(templates.map(t => t.id === template.id ? data.data : t));
            }
        } catch (error) {
            console.error('Error toggling template:', error);
        }
    };

    const handleUseTemplate = async (template) => {
        if (onCreateBooking) {
            onCreateBooking(template);
        } else {
            // Default: create booking from template
            try {
                const response = await fetch(`/api/studio-ops/booking-templates/${template.id}/use`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studioId: userData?.id,
                        clientId: null, // Will need to be filled
                        date: new Date().toISOString().split('T')[0],
                        startTime: '10:00'
                    })
                });

                const data = await response.json();

                if (data.success) {
                    alert(`Booking created from "${template.name}" template!`);
                } else {
                    alert(`Error: ${data.error || 'Failed to create booking'}`);
                }
            } catch (error) {
                console.error('Error using template:', error);
            }
        }
    };

    const openEditModal = (template) => {
        setSelectedTemplate(template);
        setFormData({
            name: template.name,
            description: template.description || '',
            durationHours: template.duration_hours,
            basePrice: template.base_price,
            rooms: template.rooms || [],
            equipmentPackages: template.equipment_packages || [],
            addOnServices: template.add_on_services || [],
            isActive: template.is_active
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            durationHours: 2,
            basePrice: 100,
            rooms: [],
            equipmentPackages: [],
            addOnServices: [],
            isActive: true
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white">
                                <Sparkles size={20} />
                            </div>
                            Booking Templates
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Create reusable booking packages for quick scheduling
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                    >
                        <Plus size={18} />
                        New Template
                    </button>
                </div>
            </div>

            {/* Templates List */}
            {loading ? (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8 text-center text-gray-600 dark:text-gray-400">
                    Loading templates...
                </div>
            ) : templates.length === 0 ? (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8 text-center text-gray-600 dark:text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Copy size={32} className="text-gray-400" />
                    </div>
                    <p className="font-semibold mb-2">No booking templates yet</p>
                    <p className="text-sm">Create templates to speed up your booking process</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className={`bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-5 transition-all ${
                                !template.is_active ? 'opacity-60' : ''
                            }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold dark:text-white">{template.name}</h3>
                                        {!template.is_active && (
                                            <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    {template.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                            {template.description}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleToggleActive(template)}
                                    className={`p-2 rounded-lg transition-colors ${
                                        template.is_active
                                            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                    title={template.is_active ? 'Active' : 'Inactive'}
                                >
                                    <Check size={18} />
                                </button>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Clock size={16} />
                                    {template.duration_hours} hour{template.duration_hours !== 1 ? 's' : ''}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                                    <DollarSign size={16} />
                                    {formatCurrency(template.base_price)}
                                </div>
                                {template.usage_count > 0 && (
                                    <div className="text-xs text-gray-500 dark:text-gray-500">
                                        Used {template.usage_count} time{template.usage_count !== 1 ? 's' : ''}
                                    </div>
                                )}
                                {(template.rooms?.length > 0 || template.equipment_packages?.length > 0 || template.add_on_services?.length > 0) && (
                                    <div className="text-xs text-gray-500 dark:text-gray-500">
                                        {template.rooms?.length > 0 && `${template.rooms.length} room(s)`}
                                        {template.rooms?.length > 0 && template.equipment_packages?.length > 0 && ' • '}
                                        {template.equipment_packages?.length > 0 && `${template.equipment_packages.length} equipment package(s)`}
                                        {(template.rooms?.length > 0 || template.equipment_packages?.length > 0) && template.add_on_services?.length > 0 && ' • '}
                                        {template.add_on_services?.length > 0 && `${template.add_on_services.length} add-on(s)`}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-3 border-t dark:border-gray-700">
                                <button
                                    onClick={() => handleUseTemplate(template)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors"
                                >
                                    <Copy size={16} />
                                    Use
                                </button>
                                <button
                                    onClick={() => openEditModal(template)}
                                    className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                    title="Edit template"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteTemplate(template.id)}
                                    className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                    title="Delete template"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Template Modal */}
            {showAddModal && (
                <TemplateFormModal
                    mode="add"
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleCreateTemplate}
                    onClose={() => {
                        setShowAddModal(false);
                        resetForm();
                    }}
                />
            )}

            {/* Edit Template Modal */}
            {showEditModal && selectedTemplate && (
                <TemplateFormModal
                    mode="edit"
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleUpdateTemplate}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedTemplate(null);
                        resetForm();
                    }}
                />
            )}
        </div>
    );
}

/**
 * Template Form Modal Component
 */
function TemplateFormModal({ mode, formData, setFormData, onSubmit, onClose }) {
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!formData.durationHours || formData.durationHours <= 0) {
            newErrors.durationHours = 'Duration must be greater than 0';
        }
        if (!formData.basePrice || formData.basePrice < 0) {
            newErrors.basePrice = 'Price must be 0 or greater';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(e);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-xl font-bold dark:text-white">
                        {mode === 'add' ? 'Create Booking Template' : 'Edit Booking Template'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                        <X size={20} className="dark:text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Template Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 ${
                                errors.name ? 'border-red-500' : 'dark:border-gray-600'
                            }`}
                            placeholder="e.g., 4-Hour Recording Session"
                        />
                        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            rows="2"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500"
                            placeholder="Brief description of this template"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Duration (hours) *
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                min="0.5"
                                value={formData.durationHours}
                                onChange={(e) => setFormData({ ...formData, durationHours: parseFloat(e.target.value) })}
                                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 ${
                                    errors.durationHours ? 'border-red-500' : 'dark:border-gray-600'
                                }`}
                            />
                            {errors.durationHours && <p className="text-sm text-red-600 mt-1">{errors.durationHours}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Base Price ($) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.basePrice}
                                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 ${
                                    errors.basePrice ? 'border-red-500' : 'dark:border-gray-600'
                                }`}
                            />
                            {errors.basePrice && <p className="text-sm text-red-600 mt-1">{errors.basePrice}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t dark:border-gray-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Active template
                            </span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                        >
                            {mode === 'add' ? 'Create Template' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
