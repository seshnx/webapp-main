// src/components/EDU/modules/EduCourses.jsx

import React, { useState, useEffect } from 'react';
import { 
    collection, query, getDocs, doc, updateDoc, addDoc, 
    deleteDoc, orderBy, where, serverTimestamp 
} from 'firebase/firestore';
import { 
    BookOpen, Plus, Search, Edit2, Trash2, Users, Clock, 
    Play, FileText, Award, X, Save, Upload 
} from 'lucide-react';
import { db, storage } from '../../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import EduCourseBuilder from './EduCourseBuilder';

export default function EduCourses({ schoolId, logAction }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showBuilder, setShowBuilder] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    useEffect(() => {
        if (!schoolId) return;
        loadCourses();
    }, [schoolId]);

    const loadCourses = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, `schools/${schoolId}/courses`),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const coursesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
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

    const handleEditCourse = (course) => {
        setEditingCourse(course);
        setShowBuilder(true);
    };

    const handleDeleteCourse = async (courseId) => {
        if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return;
        }

        try {
            // Delete course and all lessons
            const lessonsRef = collection(db, `schools/${schoolId}/courses/${courseId}/lessons`);
            const lessonsSnap = await getDocs(lessonsRef);
            
            // Delete all lessons
            const deletePromises = lessonsSnap.docs.map(lessonDoc => 
                deleteDoc(lessonDoc.ref)
            );
            await Promise.all(deletePromises);
            
            // Delete course
            await deleteDoc(doc(db, `schools/${schoolId}/courses/${courseId}`));
            
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
                    onChange={(e) => setSearchTerm(e.target.value)}
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

