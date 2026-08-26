import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import {
  X,
  Clock,
  User,
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle,
  Loader2,
  DoorClosed,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Room {
  id: string;
  name: string;
  capacity?: number;
}

interface KioskQuickBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  studioId: string;
  rooms: Room[];
  eduMode: boolean;
  selectedRoomId?: string;
}

export default function KioskQuickBookModal({
  isOpen,
  onClose,
  studioId,
  rooms,
  eduMode,
  selectedRoomId,
}: KioskQuickBookModalProps) {
  const [roomId, setRoomId] = useState<string>(
    selectedRoomId || (rooms.length > 0 ? rooms[0].id : '')
  );
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [purpose, setPurpose] = useState('');
  const [isClassBooking, setIsClassBooking] = useState(false);
  const [professorName, setProfessorName] = useState('');
  const [lessonPlan, setLessonPlan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const bookRoom = useMutation(api.sbookings.bookKioskRoom);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim()) {
      toast.error(eduMode ? 'Please enter student name' : 'Please enter your name');
      return;
    }

    if (!purpose.trim()) {
      toast.error('Please specify the session purpose / project');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Reserving room...');

    try {
      await bookRoom({
        studioId: studioId as any,
        roomId: roomId ? (roomId as any) : undefined,
        studentName: studentName.trim(),
        studentId: studentId.trim() || undefined,
        durationMinutes,
        purpose: purpose.trim(),
        isClassBooking,
        professorName: isClassBooking ? professorName.trim() : undefined,
        lessonPlan: isClassBooking ? lessonPlan.trim() : undefined,
      });

      toast.success('Room booked successfully!', { id: toastId });
      onClose();
    } catch (err: any) {
      console.error('Kiosk booking error:', err);
      toast.error(err.message || 'Failed to book room', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const DURATION_OPTIONS = [
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '3 hours', value: 180 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              {eduMode ? <GraduationCap size={22} /> : <DoorClosed size={22} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {eduMode ? 'Student Room Checkout' : 'Quick Walk-Up Booking'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {eduMode
                  ? 'Reserve studio lab time for course projects'
                  : 'Instant reservation for open studio rooms'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Room Selection */}
          {rooms.length > 1 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
                Select Room / Lab
              </label>
              <div className="grid grid-cols-2 gap-2">
                {rooms.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoomId(r.id)}
                    className={`p-3 rounded-xl border text-left text-sm font-medium transition-all ${
                      roomId === r.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{r.name}</div>
                    {r.capacity && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Capacity: {r.capacity} people
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Student / User Name & ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                {eduMode ? 'Student Name *' : 'Your Name *'}
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  required
                  placeholder={eduMode ? 'e.g. Alex Morgan' : 'Your Name'}
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                {eduMode ? 'Student ID / Badge #' : 'Contact / Phone'}
              </label>
              <input
                type="text"
                placeholder={eduMode ? 'e.g. STU-94821' : 'Phone or Email'}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <Clock size={14} className="text-blue-500" />
              Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDurationMinutes(opt.value)}
                  className={`py-2.5 px-3 rounded-xl border text-center text-sm font-semibold transition-all ${
                    durationMinutes === opt.value
                      ? 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Purpose / Project */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <BookOpen size={14} className="text-purple-500" />
              {eduMode ? 'Course / Assignment Purpose *' : 'Session Purpose *'}
            </label>
            <input
              type="text"
              required
              placeholder={
                eduMode
                  ? 'e.g. Mixing Assignment #3, Vocal Tracking Lab'
                  : 'e.g. Songwriting, Podcast Session, Rehearsal'
              }
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Optional Class Mode Toggle (for Faculty/Instructors) */}
          {eduMode && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={isClassBooking}
                  onChange={(e) => setIsClassBooking(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
                />
                <span>This is an Official Class / Lecture Session</span>
              </label>

              {isClassBooking && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Professor / Instructor Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Prof. Davis"
                      value={professorName}
                      onChange={(e) => setProfessorName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Lesson Topic / Plan
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Compression & Sidechaining"
                      value={lessonPlan}
                      onChange={(e) => setLessonPlan(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Reserving...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Confirm Reservation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
