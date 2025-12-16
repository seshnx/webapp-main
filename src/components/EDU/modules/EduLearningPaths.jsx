// src/components/EDU/modules/EduLearningPaths.jsx

import React, { useState, useEffect } from 'react';
import { 
    GraduationCap, Plus, Search, Edit2, Trash2, Users, 
    Award, Target, BookOpen, X, Save 
} from 'lucide-react';
import { supabase } from '../../../config/supabase';

export default function EduLearningPaths({ schoolId, logAction }) {
    const [paths, setPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingPath, setEditingPath] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courses: [],
        badges: [],
        skills: [],
        mentorshipEnabled: false
    });
    const [availableCourses, setAvailableCourses] = useState([]);

    useEffect(() => {
        if (!schoolId) return;
        loadPaths();
        loadCourses();
    }, [schoolId]);

    const loadPaths = async () => {
        if (!schoolId || !supabase) return;
        setLoading(true);
        try {
            const { data: pathsData, error } = await supabase
                .from('learning_paths')
                .select('*')
                .eq('school_id', schoolId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            const pathsList = (pathsData || []).map(p => ({
                id: p.id,
                ...p,
                createdAt: p.created_at,
                mentorshipEnabled: p.mentorship_enabled || false
            }));
            setPaths(pathsList);
        } catch (error) {
            console.error('Error loading learning paths:', error);
        }
        setLoading(false);
    };

    const loadCourses = async () => {
        if (!schoolId || !supabase) return;
        try {
            const { data: coursesData, error } = await supabase
                .from('courses')
                .select('id, title')
                .eq('school_id', schoolId)
                .order('title', { ascending: true });
            
            if (error) throw error;
            
            const coursesList = (coursesData || []).map(c => ({
                id: c.id,
                title: c.title
            }));
            setAvailableCourses(coursesList);
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    };

    const handleCreatePath = () => {
        setFormData({
            title: '',
            description: '',
            courses: [],
            badges: [],
            skills: [],
            mentorshipEnabled: false
        });
        setEditingPath(null);
        setShowForm(true);
    };

    const handleEditPath = (path) => {
        setFormData({
            title: path.title || '',
            description: path.description || '',
            courses: path.courses || [],
            badges: path.badges || [],
            skills: path.skills || [],
            mentorshipEnabled: path.mentorshipEnabled || false
        });
        setEditingPath(path);
        setShowForm(true);
    };

    const handleSavePath = async () => {
        if (!formData.title.trim() || !supabase || !schoolId) {
            if (!formData.title.trim()) alert('Path title is required.');
            return;
        }

        setLoading(true);
        try {
            const pathData = {
                school_id: schoolId,
                title: formData.title,
                description: formData.description || null,
                courses: formData.courses || [],
                badges: formData.badges || [],
                skills: formData.skills || [],
                mentorship_enabled: formData.mentorshipEnabled || false,
                updated_at: new Date().toISOString()
            };

            if (editingPath) {
                const { error } = await supabase
                    .from('learning_paths')
                    .update(pathData)
                    .eq('id', editingPath.id)
                    .eq('school_id', schoolId);
                
                if (error) throw error;
                
                if (logAction) {
                    logAction('update_learning_path', { pathId: editingPath.id, title: formData.title });
                }
            } else {
                pathData.created_at = new Date().toISOString();
                const { data: newPath, error } = await supabase
                    .from('learning_paths')
                    .insert(pathData)
                    .select()
                    .single();
                
                if (error) throw error;
                
                if (logAction) {
                    logAction('create_learning_path', { pathId: newPath.id, title: formData.title });
                }
            }

            setShowForm(false);
            setEditingPath(null);
            loadPaths();
        } catch (error) {
            console.error('Error saving learning path:', error);
            alert('Failed to save learning path.');
        }
        setLoading(false);
    };

    const handleDeletePath = async (pathId) => {
        if (!confirm('Are you sure you want to delete this learning path?') || !supabase) {
            return;
        }

        try {
            const { error } = await supabase
                .from('learning_paths')
                .delete()
                .eq('id', pathId)
                .eq('school_id', schoolId);
            
            if (error) throw error;
            
            if (logAction) {
                logAction('delete_learning_path', { pathId });
            }
            loadPaths();
        } catch (error) {
            console.error('Error deleting learning path:', error);
            alert('Failed to delete learning path.');
        }
    };

    const toggleCourse = (courseId) => {
        setFormData(prev => ({
            ...prev,
            courses: prev.courses.includes(courseId)
                ? prev.courses.filter(id => id !== courseId)
                : [...prev.courses, courseId]
        }));
    };

    const addBadge = () => {
        const badgeName = prompt('Enter badge name:');
        if (badgeName && !formData.badges.includes(badgeName)) {
            setFormData(prev => ({
                ...prev,
                badges: [...prev.badges, badgeName]
            }));
        }
    };

    const removeBadge = (badge) => {
        setFormData(prev => ({
            ...prev,
            badges: prev.badges.filter(b => b !== badge)
        }));
    };

    const addSkill = () => {
        const skillName = prompt('Enter skill name:');
        if (skillName && !formData.skills.includes(skillName)) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, skillName]
            }));
        }
    };

    const removeSkill = (skill) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }));
    };

    const filteredPaths = paths.filter(path =>
        path.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        path.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showForm) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold dark:text-white">
                        {editingPath ? 'Edit Learning Path' : 'Create Learning Path'}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setShowForm(false);
                                setEditingPath(null);
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSavePath}
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Path'}
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Path Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Advanced Music Production Track"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                            placeholder="Learning path description..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Courses
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                            {availableCourses.map(course => (
                                <label
                                    key={course.id}
                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.courses.includes(course.id)}
                                        onChange={() => toggleCourse(course.id)}
                                        className="rounded"
                                    />
                                    <span className="dark:text-white">{course.title}</span>
                                </label>
                            ))}
                            {availableCourses.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    No courses available. Create courses first.
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Badges
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.badges.map((badge, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm"
                                >
                                    <Award size={14} />
                                    {badge}
                                    <button
                                        onClick={() => removeBadge(badge)}
                                        className="hover:text-yellow-900 dark:hover:text-yellow-100"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={addBadge}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            + Add Badge
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Skills
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.skills.map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                                >
                                    <Target size={14} />
                                    {skill}
                                    <button
                                        onClick={() => removeSkill(skill)}
                                        className="hover:text-blue-900 dark:hover:text-blue-100"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={addSkill}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            + Add Skill
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="mentorship"
                            checked={formData.mentorshipEnabled}
                            onChange={(e) => setFormData({ ...formData, mentorshipEnabled: e.target.checked })}
                            className="rounded"
                        />
                        <label htmlFor="mentorship" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Enable Mentorship Matching
                        </label>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <GraduationCap size={24} />
                        Learning Paths
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Create structured learning programs with courses, badges, and mentorship
                    </p>
                </div>
                <button
                    onClick={handleCreatePath}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                    <Plus size={18} />
                    New Path
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search learning paths..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-800 dark:text-white"
                />
            </div>

            {/* Paths Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading learning paths...</p>
                </div>
            ) : filteredPaths.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm ? 'No paths found matching your search.' : 'No learning paths yet. Create your first path!'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPaths.map(path => (
                        <div
                            key={path.id}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold dark:text-white mb-1">
                                        {path.title || 'Untitled Path'}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {path.description || 'No description'}
                                    </p>
                                </div>
                                <div className="flex gap-2 ml-2">
                                    <button
                                        onClick={() => handleEditPath(path)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                        title="Edit path"
                                    >
                                        <Edit2 size={16} className="text-gray-600 dark:text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDeletePath(path.id)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        title="Delete path"
                                    >
                                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <BookOpen size={14} />
                                    <span>{path.courses?.length || 0} courses</span>
                                </div>
                                {path.badges && path.badges.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Award size={14} />
                                        <span>{path.badges.length} badges</span>
                                    </div>
                                )}
                                {path.mentorshipEnabled && (
                                    <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                                        <Users size={14} />
                                        <span>Mentorship Enabled</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

