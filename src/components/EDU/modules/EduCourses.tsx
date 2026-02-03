// src/components/EDU/modules/EduCourses.tsx

import React, { useState, useEffect } from 'react';
import {
    BookOpen, Plus, Search, Edit2, Trash2, Users, Clock,
    Play, FileText, Award, X, Save, Upload
} from 'lucide-react';
import EduCourseBuilder from './EduCourseBuilder';

/**
 * Course interface
 */
interface Course {
    id: string;
    title?: string;
    description?: string;
    lessonCount?: number;
    enrollmentCount?: number;
    duration?: string;
    prerequisites?: string[];
    createdAt?: string;
    created_at?: string;
    status?: string;
    [key: string]: any;
}

/**
 * EduCourses props
 */
export interface EduCoursesProps {
    schoolId?: string;
    logAction?: (action: string, details: any) => Promise<void> | void;
}

export default function EduCourses({ schoolId, logAction }: EduCoursesProps) {
    // TODO: Migrate to Neon/Convex - Supabase legacy code
    // @ts-ignore - supabase is global for legacy support
    const supabase = (window as any).supabase;

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showBuilder, setShowBuilder] = useState<boolean>(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    useEffect(() => {
        if (!schoolId) return;
        loadCourses();
    }, [schoolId]);

    const loadCourses = async () => {
        if (!schoolId || !supabase) return;
        setLoading(true);
        try {
            const { data: coursesData, error } = await supabase
                .from('courses')
                .select('*')
                .eq('school_id', schoolId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const coursesList = (coursesData || []).map((c: any) => ({
                id: c.id,
                ...c,
                createdAt: c.created_at
            }));
            setCourses(coursesList);
        } catch (error) {
            console.error('Error loading courses:', error);
        }
        setLoading(false);
    };

    const handleCreateCourse = () => {
        setEditingCourse(null);
        setShowBuilder(true);
    };

    const handleEditCourse = (course: Course) => {
        setEditingCourse(course);
        setShowBuilder(true);
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm('Are you sure you want to delete this course? This action cannot be undone.') || !supabase) {
            return;
        }

        try {
            // Delete all lessons first (if foreign key constraints allow, otherwise handled by CASCADE)
            const { error: lessonsError } = await supabase
                .from('lessons')
                .delete()
                .eq('course_id', courseId);

            if (lessonsError) {
                console.warn('Error deleting lessons (may be handled by CASCADE):', lessonsError);
            }

            // Delete course
            const { error: courseError } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseId)
                .eq('school_id', schoolId);

            if (courseError) throw courseError;

            if (logAction) {
                logAction('delete_course', { courseId });
            }

            loadCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Failed to delete course.');
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showBuilder) {
        return (
            <EduCourseBuilder
                schoolId={schoolId}
                course={editingCourse}
                onSave={() => {
                    setShowBuilder(false);
                    setEditingCourse(null);
                    loadCourses();
                }}
                onCancel={() => {
                    setShowBuilder(false);
                    setEditingCourse(null);
                }}
                logAction={logAction}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <BookOpen size={24} />
                        Courses
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Manage courses and learning materials
                    </p>
                </div>
                <button
                    onClick={handleCreateCourse}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                    <Plus size={18} />
                    New Course
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-800 dark:text-white"
                />
            </div>

            {/* Courses Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading courses...</p>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm ? 'No courses found matching your search.' : 'No courses yet. Create your first course!'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCourses.map(course => (
                        <div
                            key={course.id}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold dark:text-white mb-1">
                                        {course.title || 'Untitled Course'}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {course.description || 'No description'}
                                    </p>
                                </div>
                                <div className="flex gap-2 ml-2">
                                    <button
                                        onClick={() => handleEditCourse(course)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                        title="Edit course"
                                    >
                                        <Edit2 size={16} className="text-gray-600 dark:text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCourse(course.id)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        title="Delete course"
                                    >
                                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Play size={14} />
                                    <span>{course.lessonCount || 0} lessons</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users size={14} />
                                    <span>{course.enrollmentCount || 0} enrolled</span>
                                </div>
                                {course.duration && (
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} />
                                        <span>{course.duration}</span>
                                    </div>
                                )}
                            </div>

                            {course.prerequisites && course.prerequisites.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Prerequisites:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {course.prerequisites.map((prereq, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                                            >
                                                {prereq}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
