import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/api';
import { Id } from '@convex/dataModel';
import {
    X, Save, Plus, Trash2, GripVertical, Upload,
    Play, FileText, Clock, BookOpen, Edit2
} from 'lucide-react';

/**
 * Course interface
 */
interface Course {
    id?: string;
    title?: string;
    description?: string;
    duration?: string;
    prerequisites?: string[];
    category?: string;
    status?: string;
    [key: string]: any;
}

/**
 * Lesson interface
 */
interface Lesson {
    id: string;
    title?: string;
    description?: string;
    type?: string;
    content?: string;
    duration?: number;
    order?: number;
    course_id?: string;
    courseId?: string;
    [key: string]: any;
}

/**
 * Course form data interface
 */
interface CourseFormData {
    title: string;
    description: string;
    duration: string;
    prerequisites: string[];
    category: string;
}

/**
 * EduCourseBuilder props
 */
export interface EduCourseBuilderProps {
    schoolId?: string;
    course?: Course | null;
    onSave?: () => void;
    onCancel?: () => void;
    logAction?: (action: string, details: any) => Promise<void> | void;
}
export default function EduCourseBuilder({ schoolId, course, onSave, onCancel, logAction }: EduCourseBuilderProps) {
    const [formData, setFormData] = useState<CourseFormData>({
        title: '',
        description: '',
        duration: '',
        prerequisites: [],
        category: ''
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [newPrerequisite, setNewPrerequisite] = useState<string>('');
    const [editingLesson, setEditingLesson] = useState<string | null>(null);

    // Convex Queries
    const lessonsData = useQuery(api.edu.getLessonsByClass,
        course?.id ? { classId: course.id as Id<"classes"> } : "skip"
    );

    // Convex Mutations
    const addClass = useMutation(api.edu.createClass);
    const patchClass = useMutation(api.edu.updateClass);
    const addLesson = useMutation(api.edu.createLesson);
    const patchLesson = useMutation(api.edu.updateLesson);
    const removeLesson = useMutation(api.edu.deleteLesson);

    const lessons: Lesson[] = useMemo(() => {
        if (!lessonsData) return [];
        return lessonsData.map(l => ({
            id: l._id,
            ...l,
            courseId: l.classId
        }));
    }, [lessonsData]);

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || '',
                description: course.description || '',
                duration: course.duration || '',
                prerequisites: course.prerequisites || [],
                category: course.category || ''
            });
        }
    }, [course]);

    const handleSave = async () => {
        if (!formData.title.trim()) {
            alert('Course title is required.');
            return;
        }

        if (!schoolId) return;

        setLoading(true);
        try {
            if (course?.id) {
                // Update existing course (class)
                await patchClass({
                    classId: course.id as Id<"classes">,
                    name: formData.title,
                    description: formData.description,
                    // duration/category might not be in class schema, let's assume they are or ignore for now
                });

                if (logAction) {
                    logAction('update_course', { courseId: course.id, title: formData.title });
                }
            } else {
                // Create new course (class)
                const classId = await addClass({
                    schoolId: schoolId as Id<"schools">,
                    name: formData.title,
                    code: `C-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
                    description: formData.description,
                    instructorId: 'placeholder-instructor' as Id<"users">, // Needs real ID
                    isActive: true
                });

                if (logAction) {
                    logAction('create_course', { courseId: classId, title: formData.title });
                }
            }

            onSave?.();
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

    const handleRemovePrerequisite = (prereq: string) => {
        setFormData(prev => ({
            ...prev,
            prerequisites: prev.prerequisites.filter(p => p !== prereq)
        }));
    };

    const handleAddLesson = () => {
        // In this UI, adding a lesson usually requires a prompt or immediate create
        // Let's mock a quick addition
        const title = prompt("Lesson Title:");
        if (!title || !course?.id) return;

        addLesson({
            classId: course.id as Id<"classes">,
            title,
            type: 'video',
            order: lessons.length
        });
    };

    const handleSaveLesson = async (lessonData: Lesson) => {
        if (!course?.id) {
            alert('Please save the course first before adding lessons.');
            return;
        }

        try {
            if (lessonData.id.startsWith('temp-')) {
                await addLesson({
                    classId: course.id as Id<"classes">,
                    title: lessonData.title || 'New Lesson',
                    description: lessonData.description,
                    type: lessonData.type || 'video',
                    content: lessonData.content,
                    order: lessonData.order || lessons.length,
                    duration: lessonData.duration
                });
            } else {
                await patchLesson({
                    lessonId: lessonData.id as Id<"lessons">,
                    title: lessonData.title,
                    description: lessonData.description,
                    type: lessonData.type,
                    content: lessonData.content,
                    order: lessonData.order,
                    duration: lessonData.duration
                });
            }
            setEditingLesson(null);
        } catch (error) {
            console.error('Error saving lesson:', error);
            alert('Failed to save lesson.');
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm('Delete this lesson?') || !course?.id) return;

        try {
            await removeLesson({ lessonId: lessonId as Id<"lessons"> });
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
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
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, duration: e.target.value })}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, category: e.target.value })}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPrerequisite(e.target.value)}
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
