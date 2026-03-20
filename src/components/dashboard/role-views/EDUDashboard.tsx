/**
 * EDU Dashboard View
 *
 * Role-specific dashboard for EDU users (Staff, Admin, Students)
 * that reuses existing EDU dashboard components.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Users, Calendar } from 'lucide-react';
import type { DashboardProps, EDUDashboardData } from '../../../types/dashboard';
import { StatsCard } from '../widgets/StatsCard';
import { useClassesBySchool, useEnrollmentsByStudent, useUnreadEduAnnouncements, useStudentByUserId, useStaffByUserId } from '../../../hooks/useConvex';

interface EDUDashboardProps extends DashboardProps {
  eduRole?: 'EDUAdmin' | 'EDUStaff' | 'Student' | 'Intern';
  className?: string;
}

export function EDUDashboard({ userData, eduRole, className = '' }: EDUDashboardProps) {
  // Determine the EDU role from userData if not provided
  const role = eduRole || (userData?.accountTypes?.find(t =>
    t.startsWith('EDU') || t === 'Student' || t === 'Intern'
  ) as any) || 'Student';

  // Get school ID from userData
  const schoolId = userData?.schoolId;

  // Fetch real data from Convex
  const { data: classes } = useClassesBySchool(schoolId, 'active');

  // For students, get their enrollments
  const isStudent = role === 'Student' || role === 'Intern';
  const { data: studentProfile } = useStudentByUserId(userData?.userId || '');
  const { data: enrollments } = useEnrollmentsByStudent(studentProfile?._id, 'active');

  // For staff, get staff profile and unread announcements
  const { data: staffProfile } = useStaffByUserId(userData?.userId || '');
  const userType = isStudent ? 'student' : 'staff';
  const { data: unreadAnnouncements } = useUnreadEduAnnouncements(
    userData?.userId || '',
    schoolId,
    userType
  );

  // Calculate real dashboard data
  const data: EDUDashboardData = useMemo(() => {
    // Get today's classes (classes scheduled for today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingClasses = (classes || [])
      .filter(cls => {
        const classDate = new Date(cls.startTime);
        return classDate >= today && classDate < tomorrow;
      })
      .map(cls => ({
        id: cls._id,
        courseName: cls.name,
        startTime: new Date(cls.startTime),
        enrolled: cls.enrolledCount || 0
      }))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 5);

    // Active courses count
    const activeCourses = isStudent
      ? (enrollments || []).length
      : (classes || []).filter(c => c.status === 'active').length;

    // Enrolled students (for staff) or 0 for students
    const enrolledStudents = isStudent
      ? 0
      : (classes || []).reduce((sum, cls) => sum + (cls.enrolledCount || 0), 0);

    // Assignments/announcements pending
    const assignmentsPending = (unreadAnnouncements || []).length;

    return {
      activeCourses,
      enrolledStudents,
      upcomingClasses,
      assignmentsPending
    };
  }, [classes, enrollments, unreadAnnouncements, isStudent, role]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* EDU Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Education Dashboard</h2>
            <p className="text-purple-100">
              {role === 'Student' && 'Track your learning progress'}
              {role === 'EDUStaff' && 'Manage your courses and students'}
              {role === 'EDUAdmin' && 'Administer education programs'}
              {role === 'Intern' && 'Intern portal and resources'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Courses"
          value={data.activeCourses}
          icon={BookOpen}
          color="purple"
        />
        {role !== 'Student' && (
          <StatsCard
            title="Enrolled Students"
            value={data.enrolledStudents}
            icon={Users}
            color="blue"
          />
        )}
        <StatsCard
          title="Upcoming Classes"
          value={data.upcomingClasses.length}
          icon={Calendar}
          color="green"
        />
        <StatsCard
          title={role === 'Student' ? 'Pending Assignments' : 'To Grade'}
          value={data.assignmentsPending}
          icon={BookOpen}
          color="amber"
        />
      </div>

      {/* Upcoming Classes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Today's Classes
        </h3>
        {data.upcomingClasses.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No classes scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.upcomingClasses.map(cls => (
              <div
                key={cls.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-base">
                    {cls.courseName}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {cls.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {role !== 'Student' && ` • ${cls.enrolled} students`}
                  </p>
                </div>
                <button className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Link to Full EDU Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              Access Full Education Portal
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
              View all courses, assignments, and resources
            </p>
          </div>
          <button className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
            Go to EDU Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
