// src/components/EDU/modules/EduCourseBuilder.jsx

import React, { useState, useEffect } from 'react';
import { 
    X, Save, Plus, Trash2, GripVertical, Upload, 
    Play, FileText, Clock, BookOpen 
} from 'lucide-react';
export default function EduCourseBuilder({ schoolId, course, onSave, onCancel, logAction }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        prerequisites: [],
        category: ''
    });
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newPrerequisite, setNewPrerequisite] = useState('');
    const [editingLesson, setEditingLesson] = useState(null);

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || '',
                description: course.description || '',
                duration: course.duration || '',
                prerequisites: course.prerequisites || [],
                category: course.category || ''
            });
            loadLessons();
        }
    }, [course]);

    const loadLessons = async () => {
        if (!course?.id || !supabase) return;
        try {
            const { data: lessonsData, error } = await supabase
                .from('lessons')
                .select('*')
                .eq('course_id', course.id)
                .order('order', { ascending: true });
            
            if (error) throw error;
            
            const lessonsList = (lessonsData || []).map(l => ({
                id: l.id,
                ...l,
                courseId: l.course_id
            }));
            setLessons(lessonsList);
        } catch (error) {
            console.error('Error loading lessons:', error);
        }
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            alert('Course title is required.');
            return;
        }

        if (!supabase || !schoolId) return;
        
        setLoading(true);
        try {
            const courseData = {
                school_id: schoolId,
                title: formData.title,
                description: formData.description || null,
                duration: formData.duration || null,
                prerequisites: formData.prerequisites || [],
                category: formData.category || null,
                lesson_count: lessons.length,
                updated_at: new Date().toISOString()
            };

            if (course) {
                // Update existing course
                const { error } = await supabase
                    .from('courses')
                    .update(courseData)
                    .eq('id', course.id)
                    .eq('school_id', schoolId);
                
                if (error) throw error;
                
                if (logAction) {
                    logAction('update_course', { courseId: course.id, title: formData.title });
                }
            } else {
                // Create new course
                courseData.created_at = new Date().toISOString();
                courseData.status = 'draft'; // Default status
                
                const { data: newCourse, error } = await supabase
                    .from('courses')
                    .insert(courseData)
                    .select()
                    .single();
                
                if (error) throw error;
                
                if (logAction) {
                    logAction('create_course', { courseId: newCourse.id, title: formData.title });
                }
            }

            onSave();
        } catch (error) {
            console.error('Error saving course:', error);
            alert('Failed to save course.');
        }
        setLoading(false);
    };

    const handleAddPrerequisite = () => {
        if (newPrerequisite.trim() && !formData.prerequisites.includes(newPrerequisite.trim())) {
            setFormData(prev => ({
                ...prev,
                prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
            }));
            setNewPrerequisite('');
        }
    };

    const handleRemovePrerequisite = (prereq) => {
        setFormData(prev => ({
            ...prev,
            prerequisites: prev.prerequisites.filter(p => p !== prereq)
        }));
    };

    const handleAddLesson = () => {
        const newLesson = {
            id: `temp-${Date.now()}`,
            title: 'New Lesson',
            description: '',
            type: 'video',
            content: '',
            order: lessons.length,
            duration: 0
        };
        setLessons([...lessons, newLesson]);
        setEditingLesson(newLesson.id);
    };

    const handleSaveLesson = async (lessonData) => {
        if (!course?.id || !supabase) {
            if (!course?.id) alert('Please save the course first before adding lessons.');
            return;
        }

        try {
            const lessonPayload = {
                course_id: course.id,
                title: lessonData.title,
                description: lessonData.description || null,
                type: lessonData.type || 'video',
                content: lessonData.content || null,
                order: lessonData.order || lessons.length,
                duration: lessonData.duration || 0,
                updated_at: new Date().toISOString()
            };

            if (lessonData.id.startsWith('temp-')) {
                lessonPayload.created_at = new Date().toISOString();
                const { error } = await supabase
                    .from('lessons')
                    .insert(lessonPayload);
                
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('lessons')
                    .update(lessonPayload)
                    .eq('id', lessonData.id)
                    .eq('course_id', course.id);
                
                if (error) throw error;
            }

            loadLessons();
            setEditingLesson(null);
        } catch (error) {
            console.error('Error saving lesson:', error);
            alert('Failed to save lesson.');
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!confirm('Delete this lesson?') || !supabase || !course?.id) return;
        
        if (lessonId.startsWith('temp-')) {
            setLessons(lessons.filter(l => l.id !== lessonId));
            return;
        }

        try {
            await supabase
                .from('lessons')
                .delete()
                .eq('id', lessonId)
                .eq('course_id', course.id);
            
            loadLessons();
        } catch (error) {
            console.error('Error deleting lesson:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold dark:text-white">
                    {course ? 'Edit Course' : 'Create New Course'}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Course'}
                    </button>
                </div>
            </div>

            {/* Course Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Course Title *
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Introduction to Music Production"
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
                        placeholder="Course description..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Duration
                        </label>
                        <input
                            type="text"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 8 weeks"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Category
                        </label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Production, Engineering"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prerequisites
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newPrerequisite}
                            onChange={(e) => setNewPrerequisite(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddPrerequisite()}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                            placeholder="Add prerequisite..."
                        />
                        <button
                            onClick={handleAddPrerequisite}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.prerequisites.map((prereq, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                            >
                                {prereq}
                                <button
                                    onClick={() => handleRemovePrerequisite(prereq)}
                                    className="hover:text-indigo-900 dark:hover:text-indigo-100"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lessons Section */}
            {course && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold dark:text-white">Lessons</h3>
                        <button
                            onClick={handleAddLesson}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <Plus size={18} />
                            Add Lesson
                        </button>
                    </div>

                    <div className="space-y-2">
                        {lessons.map((lesson, idx) => (
                            <div
                                key={lesson.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <GripVertical className="text-gray-400 cursor-move" size={18} />
                                <div className="flex-1">
                                    <p className="font-medium dark:text-white">{lesson.title || 'Untitled Lesson'}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {lesson.type} • {lesson.duration || 0} min
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingLesson(lesson.id)}
                                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                                    >
                                        <Edit2 size={16} className="text-gray-600 dark:text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteLesson(lesson.id)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                                    >
                                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {lessons.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                No lessons yet. Add your first lesson!
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

