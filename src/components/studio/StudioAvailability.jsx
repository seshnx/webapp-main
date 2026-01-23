import { useState } from 'react';
import { 
    Clock, Calendar, Save, Loader2, Plus, Trash2, 
    Moon, Sun, AlertCircle, X, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = [
    { id: 'sunday', label: 'Sunday', short: 'Sun' },
    { id: 'monday', label: 'Monday', short: 'Mon' },
    { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { id: 'thursday', label: 'Thursday', short: 'Thu' },
    { id: 'friday', label: 'Friday', short: 'Fri' },
    { id: 'saturday', label: 'Saturday', short: 'Sat' },
];

const DEFAULT_HOURS = {
    sunday: { closed: true, open: '10:00', close: '18:00' },
    monday: { closed: false, open: '09:00', close: '22:00' },
    tuesday: { closed: false, open: '09:00', close: '22:00' },
    wednesday: { closed: false, open: '09:00', close: '22:00' },
    thursday: { closed: false, open: '09:00', close: '22:00' },
    friday: { closed: false, open: '09:00', close: '23:00' },
    saturday: { closed: false, open: '10:00', close: '23:00' },
};

/**
 * StudioAvailability - Operating hours and blackout dates management
 */
export default function StudioAvailability({ user, userData, onUpdate }) {
    const [hours, setHours] = useState(userData?.operatingHours || DEFAULT_HOURS);
    const [blackoutDates, setBlackoutDates] = useState(userData?.blackoutDates || []);
    const [saving, setSaving] = useState(false);
    const [newBlackout, setNewBlackout] = useState({ start: '', end: '', reason: '' });
    const [showAddBlackout, setShowAddBlackout] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const toastId = toast.loading('Saving availability...');
        const userId = userData?.id || user?.id || user?.uid;

        try {
            const response = await fetch(`/api/studio-ops/profiles/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operatingHours: hours,
                    blackoutDates: blackoutDates
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save');
            }

            toast.success('Availability saved!', { id: toastId });
            if (onUpdate) onUpdate({ operatingHours: hours, blackoutDates });
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const updateDayHours = (dayId, field, value) => {
        setHours(prev => ({
            ...prev,
            [dayId]: { ...prev[dayId], [field]: value }
        }));
    };

    const toggleDayClosed = (dayId) => {
        setHours(prev => ({
            ...prev,
            [dayId]: { ...prev[dayId], closed: !prev[dayId]?.closed }
        }));
    };

    const copyToAllWeekdays = (dayId) => {
        const sourceHours = hours[dayId];
        const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        
        setHours(prev => {
            const newHours = { ...prev };
            weekdays.forEach(day => {
                newHours[day] = { ...sourceHours };
            });
            return newHours;
        });
        toast.success('Copied to all weekdays');
    };

    const addBlackoutDate = () => {
        if (!newBlackout.start) {
            toast.error('Start date is required');
            return;
        }
        
        const blackout = {
            id: Date.now().toString(),
            start: newBlackout.start,
            end: newBlackout.end || newBlackout.start,
            reason: newBlackout.reason || 'Blocked'
        };
        
        setBlackoutDates([...blackoutDates, blackout]);
        setNewBlackout({ start: '', end: '', reason: '' });
        setShowAddBlackout(false);
    };

    const removeBlackoutDate = (id) => {
        setBlackoutDates(blackoutDates.filter(b => b.id !== id));
    };

    const formatTime = (time) => {
        if (!time) return '';
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${m} ${ampm}`;
    };

    // Calculate total weekly hours
    const totalWeeklyHours = DAYS_OF_WEEK.reduce((total, day) => {
        const dayHours = hours[day.id];
        if (dayHours?.closed) return total;
        
        const [openH, openM] = (dayHours?.open || '09:00').split(':').map(Number);
        const [closeH, closeM] = (dayHours?.close || '17:00').split(':').map(Number);
        const openMinutes = openH * 60 + openM;
        const closeMinutes = closeH * 60 + closeM;
        
        return total + Math.max(0, (closeMinutes - openMinutes) / 60);
    }, 0);

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Clock className="text-brand-blue" size={24} />
                        Availability & Hours
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Set your operating hours and manage blackout dates
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-brand-blue text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            {/* Weekly Summary */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold mb-1">Weekly Availability</h3>
                        <p className="text-indigo-100">
                            {DAYS_OF_WEEK.filter(d => !hours[d.id]?.closed).length} days open • {Math.round(totalWeeklyHours)} hours/week
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold">{Math.round(totalWeeklyHours)}</div>
                        <div className="text-sm text-indigo-100">hours</div>
                    </div>
                </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-[#23262f]">
                    <h3 className="font-bold dark:text-white flex items-center gap-2">
                        <Sun size={18} className="text-amber-500" />
                        Operating Hours
                    </h3>
                </div>
                <div className="divide-y dark:divide-gray-700">
                    {DAYS_OF_WEEK.map(day => {
                        const dayHours = hours[day.id] || { closed: false, open: '09:00', close: '17:00' };
                        
                        return (
                            <div 
                                key={day.id}
                                className={`p-4 flex items-center gap-4 ${dayHours.closed ? 'bg-gray-50 dark:bg-[#1f2128]' : ''}`}
                            >
                                <div className="w-28">
                                    <span className={`font-medium ${dayHours.closed ? 'text-gray-400' : 'dark:text-white'}`}>
                                        {day.label}
                                    </span>
                                </div>
                                
                                <button
                                    onClick={() => toggleDayClosed(day.id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                        dayHours.closed 
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400' 
                                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    }`}
                                >
                                    {dayHours.closed ? 'Closed' : 'Open'}
                                </button>

                                {!dayHours.closed && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="time"
                                                value={dayHours.open || '09:00'}
                                                onChange={(e) => updateDayHours(day.id, 'open', e.target.value)}
                                                className="p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                            />
                                            <span className="text-gray-400">to</span>
                                            <input
                                                type="time"
                                                value={dayHours.close || '17:00'}
                                                onChange={(e) => updateDayHours(day.id, 'close', e.target.value)}
                                                className="p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                            />
                                        </div>
                                        
                                        <span className="text-sm text-gray-400 hidden md:inline">
                                            {formatTime(dayHours.open)} – {formatTime(dayHours.close)}
                                        </span>
                                        
                                        <button
                                            onClick={() => copyToAllWeekdays(day.id)}
                                            className="ml-auto p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                            title="Copy to all weekdays"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Blackout Dates */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-[#23262f] flex justify-between items-center">
                    <h3 className="font-bold dark:text-white flex items-center gap-2">
                        <Moon size={18} className="text-indigo-500" />
                        Blackout Dates
                    </h3>
                    <button
                        onClick={() => setShowAddBlackout(!showAddBlackout)}
                        className="text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition flex items-center gap-1"
                    >
                        <Plus size={16} /> Add Blackout
                    </button>
                </div>
                
                {/* Add Blackout Form */}
                {showAddBlackout && (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border-b dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Start Date *</label>
                                <input
                                    type="date"
                                    value={newBlackout.start}
                                    onChange={(e) => setNewBlackout({ ...newBlackout, start: e.target.value })}
                                    className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">End Date</label>
                                <input
                                    type="date"
                                    value={newBlackout.end}
                                    onChange={(e) => setNewBlackout({ ...newBlackout, end: e.target.value })}
                                    className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                    min={newBlackout.start}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Reason</label>
                                <input
                                    type="text"
                                    value={newBlackout.reason}
                                    onChange={(e) => setNewBlackout({ ...newBlackout, reason: e.target.value })}
                                    placeholder="e.g. Holiday, Maintenance"
                                    className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={addBlackoutDate}
                                    className="flex-1 p-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => setShowAddBlackout(false)}
                                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Blackout List */}
                <div className="p-4">
                    {blackoutDates.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Moon size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No blackout dates scheduled</p>
                            <p className="text-xs">Add dates when your studio is unavailable</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {blackoutDates.sort((a, b) => new Date(a.start) - new Date(b.start)).map(blackout => (
                                <div 
                                    key={blackout.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1f2128] rounded-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                            <Calendar className="text-indigo-600 dark:text-indigo-400" size={18} />
                                        </div>
                                        <div>
                                            <div className="font-medium dark:text-white text-sm">
                                                {new Date(blackout.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                {blackout.end !== blackout.start && (
                                                    <> – {new Date(blackout.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">{blackout.reason}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeBlackoutDate(blackout.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex gap-3">
                    <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                    <div className="text-sm">
                        <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">Availability Tips</p>
                        <ul className="text-amber-700 dark:text-amber-400 space-y-1">
                            <li>• Operating hours determine when clients can book sessions</li>
                            <li>• Use blackout dates for holidays, maintenance, or personal time</li>
                            <li>• Individual room availability can be set in the Rooms section</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
