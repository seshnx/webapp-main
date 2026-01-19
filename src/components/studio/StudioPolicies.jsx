import { useState } from 'react';
import { 
    FileText, Save, Loader2, DollarSign, Clock, AlertTriangle,
    Shield, ChevronDown, ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * StudioPolicies - Booking rules, pricing policies, and house rules
 */
export default function StudioPolicies({ user, userData, onUpdate }) {
    const [policies, setPolicies] = useState({
        // Booking Rules
        minBookingHours: userData?.policies?.minBookingHours ?? 2,
        maxBookingHours: userData?.policies?.maxBookingHours ?? 12,
        advanceBookingDays: userData?.policies?.advanceBookingDays ?? 14,
        minAdvanceHours: userData?.policies?.minAdvanceHours ?? 24,
        autoApprove: userData?.policies?.autoApprove ?? false,
        
        // Cancellation Policy
        cancellationPolicy: userData?.policies?.cancellationPolicy ?? 'moderate',
        cancellationNoticeHours: userData?.policies?.cancellationNoticeHours ?? 48,
        refundPercentage: userData?.policies?.refundPercentage ?? 50,
        
        // Pricing
        depositRequired: userData?.policies?.depositRequired ?? true,
        depositPercentage: userData?.policies?.depositPercentage ?? 25,
        peakHourMultiplier: userData?.policies?.peakHourMultiplier ?? 1.0,
        peakHoursStart: userData?.policies?.peakHoursStart ?? '',
        peakHoursEnd: userData?.policies?.peakHoursEnd ?? '',
        weekendMultiplier: userData?.policies?.weekendMultiplier ?? 1.0,
        
        // House Rules
        houseRules: userData?.policies?.houseRules ?? '',
        whatToExpect: userData?.policies?.whatToExpect ?? '',
        whatToBring: userData?.policies?.whatToBring ?? '',
        parkingInstructions: userData?.policies?.parkingInstructions ?? '',
        
        // Safety & Legal
        requiresWaiver: userData?.policies?.requiresWaiver ?? false,
        waiverText: userData?.policies?.waiverText ?? '',
        ageRequirement: userData?.policies?.ageRequirement ?? 18,
    });

    const [saving, setSaving] = useState(false);
    const [expandedSection, setExpandedSection] = useState('booking');

    const handleSave = async () => {
        if (!supabase) return;
        setSaving(true);
        const toastId = toast.loading('Saving policies...');
        const userId = user?.id || user?.uid;
        
        try {
            await supabase
                .from('profiles')
                .update({ 
                    policies: policies,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);
            
            toast.success('Policies saved!', { id: toastId });
            if (onUpdate) onUpdate({ policies });
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const updatePolicy = (key, value) => {
        setPolicies(prev => ({ ...prev, [key]: value }));
    };

    const CANCELLATION_POLICIES = [
        { id: 'flexible', label: 'Flexible', description: 'Full refund up to 24 hours before session', color: 'green' },
        { id: 'moderate', label: 'Moderate', description: '50% refund up to 48 hours before session', color: 'amber' },
        { id: 'strict', label: 'Strict', description: 'No refunds within 7 days of session', color: 'red' },
        { id: 'custom', label: 'Custom', description: 'Set your own cancellation terms', color: 'blue' },
    ];

    const Section = ({ id, title, icon: Icon, children }) => {
        const isExpanded = expandedSection === id;
        return (
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                <button
                    onClick={() => setExpandedSection(isExpanded ? null : id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#23262f] transition"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                            <Icon className="text-brand-blue" size={20} />
                        </div>
                        <h3 className="font-bold dark:text-white">{title}</h3>
                    </div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {isExpanded && (
                    <div className="p-4 pt-0 border-t dark:border-gray-700">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <FileText className="text-brand-blue" size={24} />
                        Policies & Rules
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Set booking rules, cancellation policies, and house rules
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

            {/* Booking Rules */}
            <Section id="booking" title="Booking Rules" icon={Clock}>
                <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Min Hours</label>
                            <input
                                type="number"
                                value={policies.minBookingHours}
                                onChange={(e) => updatePolicy('minBookingHours', parseInt(e.target.value) || 1)}
                                className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                min={1}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Max Hours</label>
                            <input
                                type="number"
                                value={policies.maxBookingHours}
                                onChange={(e) => updatePolicy('maxBookingHours', parseInt(e.target.value) || 12)}
                                className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                min={1}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Book Ahead (Days)</label>
                            <input
                                type="number"
                                value={policies.advanceBookingDays}
                                onChange={(e) => updatePolicy('advanceBookingDays', parseInt(e.target.value) || 7)}
                                className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                min={1}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Min Notice (Hrs)</label>
                            <input
                                type="number"
                                value={policies.minAdvanceHours}
                                onChange={(e) => updatePolicy('minAdvanceHours', parseInt(e.target.value) || 0)}
                                className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                min={0}
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#1f2128] p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <div className="font-medium dark:text-white">Auto-Approve Bookings</div>
                            <div className="text-sm text-gray-500">Automatically confirm bookings without manual approval</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={policies.autoApprove}
                                onChange={(e) => updatePolicy('autoApprove', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-blue"></div>
                        </label>
                    </div>
                </div>
            </Section>

            {/* Cancellation Policy */}
            <Section id="cancellation" title="Cancellation Policy" icon={AlertTriangle}>
                <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {CANCELLATION_POLICIES.map(policy => (
                            <button
                                key={policy.id}
                                onClick={() => updatePolicy('cancellationPolicy', policy.id)}
                                className={`p-4 rounded-xl border-2 text-left transition ${
                                    policies.cancellationPolicy === policy.id
                                        ? `border-${policy.color}-500 bg-${policy.color}-50 dark:bg-${policy.color}-900/20`
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className={`font-bold mb-1 ${policies.cancellationPolicy === policy.id ? `text-${policy.color}-700 dark:text-${policy.color}-400` : 'dark:text-white'}`}>
                                    {policy.label}
                                </div>
                                <div className="text-xs text-gray-500">{policy.description}</div>
                            </button>
                        ))}
                    </div>

                    {policies.cancellationPolicy === 'custom' && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Notice Required (Hours)</label>
                                <input
                                    type="number"
                                    value={policies.cancellationNoticeHours}
                                    onChange={(e) => updatePolicy('cancellationNoticeHours', parseInt(e.target.value) || 24)}
                                    className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                    min={0}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Refund Percentage</label>
                                <input
                                    type="number"
                                    value={policies.refundPercentage}
                                    onChange={(e) => updatePolicy('refundPercentage', parseInt(e.target.value) || 0)}
                                    className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                    min={0}
                                    max={100}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Section>

            {/* Pricing */}
            <Section id="pricing" title="Pricing & Deposits" icon={DollarSign}>
                <div className="space-y-6 pt-4">
                    {/* Deposit */}
                    <div className="bg-gray-50 dark:bg-[#1f2128] p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="font-medium dark:text-white">Require Deposit</div>
                                <div className="text-sm text-gray-500">Collect partial payment when booking</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={policies.depositRequired}
                                    onChange={(e) => updatePolicy('depositRequired', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                            </label>
                        </div>
                        {policies.depositRequired && (
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deposit Percentage</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        value={policies.depositPercentage}
                                        onChange={(e) => updatePolicy('depositPercentage', parseInt(e.target.value))}
                                        className="flex-1"
                                        min={10}
                                        max={100}
                                        step={5}
                                    />
                                    <span className="font-bold text-brand-blue w-14 text-right">{policies.depositPercentage}%</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Peak Pricing */}
                    <div>
                        <div className="font-medium dark:text-white mb-3">Peak Hour Pricing</div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Peak Start</label>
                                <input
                                    type="time"
                                    value={policies.peakHoursStart}
                                    onChange={(e) => updatePolicy('peakHoursStart', e.target.value)}
                                    className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Peak End</label>
                                <input
                                    type="time"
                                    value={policies.peakHoursEnd}
                                    onChange={(e) => updatePolicy('peakHoursEnd', e.target.value)}
                                    className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Rate Multiplier</label>
                                <input
                                    type="number"
                                    value={policies.peakHourMultiplier}
                                    onChange={(e) => updatePolicy('peakHourMultiplier', parseFloat(e.target.value) || 1)}
                                    className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Weekend Pricing */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Weekend Rate Multiplier</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                value={policies.weekendMultiplier}
                                onChange={(e) => updatePolicy('weekendMultiplier', parseFloat(e.target.value))}
                                className="flex-1"
                                min={1}
                                max={2}
                                step={0.1}
                            />
                            <span className="font-bold dark:text-white w-16 text-right">{policies.weekendMultiplier}x</span>
                        </div>
                        {policies.weekendMultiplier > 1 && (
                            <p className="text-xs text-gray-500 mt-1">
                                Saturday & Sunday bookings will be {Math.round((policies.weekendMultiplier - 1) * 100)}% more
                            </p>
                        )}
                    </div>
                </div>
            </Section>

            {/* House Rules */}
            <Section id="rules" title="House Rules & Info" icon={FileText}>
                <div className="space-y-4 pt-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Studio Rules</label>
                        <textarea
                            value={policies.houseRules}
                            onChange={(e) => updatePolicy('houseRules', e.target.value)}
                            className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                            rows={4}
                            placeholder="• No smoking inside the studio&#10;• Please arrive 10 minutes early&#10;• Clean up after your session"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">What to Expect</label>
                        <textarea
                            value={policies.whatToExpect}
                            onChange={(e) => updatePolicy('whatToExpect', e.target.value)}
                            className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                            rows={3}
                            placeholder="Describe what clients can expect when they arrive..."
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">What to Bring</label>
                            <textarea
                                value={policies.whatToBring}
                                onChange={(e) => updatePolicy('whatToBring', e.target.value)}
                                className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                rows={3}
                                placeholder="• Instrument cables&#10;• Lyrics/charts&#10;• Reference tracks"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Parking Instructions</label>
                            <textarea
                                value={policies.parkingInstructions}
                                onChange={(e) => updatePolicy('parkingInstructions', e.target.value)}
                                className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                rows={3}
                                placeholder="Describe parking situation and directions..."
                            />
                        </div>
                    </div>
                </div>
            </Section>

            {/* Legal */}
            <Section id="legal" title="Legal & Safety" icon={Shield}>
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Minimum Age Requirement</label>
                            <input
                                type="number"
                                value={policies.ageRequirement}
                                onChange={(e) => updatePolicy('ageRequirement', parseInt(e.target.value) || 0)}
                                className="w-32 p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                min={0}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-6">
                            {policies.ageRequirement > 0 
                                ? `Clients must be ${policies.ageRequirement}+ to book`
                                : 'No age restriction'}
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#1f2128] p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="font-medium dark:text-white">Require Liability Waiver</div>
                                <div className="text-sm text-gray-500">Clients must sign a waiver before booking</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={policies.requiresWaiver}
                                    onChange={(e) => updatePolicy('requiresWaiver', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                            </label>
                        </div>
                        {policies.requiresWaiver && (
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Waiver Text</label>
                                <textarea
                                    value={policies.waiverText}
                                    onChange={(e) => updatePolicy('waiverText', e.target.value)}
                                    className="w-full p-3 border rounded-xl dark:bg-[#2c2e36] dark:border-gray-600 dark:text-white font-mono text-sm"
                                    rows={6}
                                    placeholder="Enter your liability waiver text..."
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Section>
        </div>
    );
}
