import React, { useState, useEffect } from 'react';
import {
  UserCog, MapPin, DollarSign, Clock, CheckCircle,
  Save, Wrench, Building2, Calendar, Briefcase
} from 'lucide-react';
import { TECH_SPECIALTIES, SERVICE_CATALOGUE } from '../../config/constants';
import { getTechnicianProfile, updateTechnicianProfile, type TechnicianProfile } from '../../config/neonQueries';
import type { UserData } from '../../types';

/**
 * Props for TechBusinessProfile component
 */
export interface TechBusinessProfileProps {
  user?: any;
  userData?: UserData | null;
}

/**
 * TechBusinessProfile - Enhanced business profile editor for technicians
 *
 * Features:
 * - Availability status toggle
 * - Service radius (miles)
 * - Hourly rate
 * - Specialties multi-select
 * - Location (city, state, zip)
 * - Business policies (cancellation, payment terms)
 * - Skills and certifications
 */
export default function TechBusinessProfile({ user, userData }: TechBusinessProfileProps) {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState({
    display_name: '',
    specialties: [] as string[],
    hourly_rate: '',
    location: {
      city: '',
      state: '',
      zip: ''
    },
    service_radius: '50',
    availability_status: 'Available' as 'Available' | 'Busy' | 'Unavailable',
    bio: '',
    skills: '',
    business_policies: {
      cancellation_policy: '',
      payment_terms: '',
      response_time: ''
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = user?.id || user?.uid;
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getTechnicianProfile(userId);
        setProfile(data);

        // Populate form with existing data
        if (data) {
          setFormData({
            display_name: data.display_name || '',
            specialties: data.specialties || [],
            hourly_rate: data.hourly_rate?.toString() || '',
            location: {
              city: data.location?.city || '',
              state: data.location?.state || '',
              zip: data.location?.zip || ''
            },
            service_radius: data.service_radius?.toString() || '50',
            availability_status: data.availability_status || 'Available',
            bio: data.bio || '',
            skills: '', // Not in database, keeping empty
            business_policies: {
              cancellation_policy: '', // Not in database, keeping empty
              payment_terms: '',
              response_time: ''
            }
          });
        }
      } catch (error) {
        console.error('Error fetching technician profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id, user?.uid]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const userId = user?.id || user?.uid;
      if (!userId) throw new Error('User not authenticated');

      const updates = {
        display_name: formData.display_name || undefined,
        specialties: formData.specialties.length > 0 ? formData.specialties : undefined,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
        location: {
          city: formData.location.city,
          state: formData.location.state,
          zip: formData.location.zip
        },
        service_radius: parseInt(formData.service_radius),
        availability_status: formData.availability_status,
        bio: formData.bio || undefined
      };

      await updateTechnicianProfile(userId, updates);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const updateFormData = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateLocation = <K extends keyof typeof formData.location>(key: K, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [key]: value }
    }));
  };

  const updatePolicies = <K extends keyof typeof formData.business_policies>(key: K, value: string) => {
    setFormData(prev => ({
      ...prev,
      business_policies: { ...prev.business_policies, [key]: value }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <UserCog className="text-brand-blue" />
            Business Profile Settings
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage your technician profile and business information
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} />
          Profile updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
          <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
            <UserCog size={18} className="text-gray-400" />
            Basic Information
          </h3>

          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Display Name
              </label>
              <input
                type="text"
                className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                placeholder="Your business or display name"
                value={formData.display_name}
                onChange={e => updateFormData('display_name', e.target.value)}
              />
            </div>

            {/* Availability Status */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Availability Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Available', 'Busy', 'Unavailable'] as const).map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateFormData('availability_status', status)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition
                      ${formData.availability_status === status
                        ? status === 'Available' ? 'bg-green-500 text-white'
                          : status === 'Busy' ? 'bg-yellow-500 text-white'
                          : 'bg-gray-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Professional Bio
              </label>
              <textarea
                className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                rows={4}
                placeholder="Describe your experience, expertise, and what makes you unique..."
                value={formData.bio}
                onChange={e => updateFormData('bio', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Services & Pricing */}
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
          <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
            <Briefcase size={18} className="text-gray-400" />
            Services & Pricing
          </h3>

          <div className="space-y-4">
            {/* Hourly Rate */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                <DollarSign size={16} />
                Hourly Rate
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="number"
                  className="w-full pl-10 p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                  placeholder="75.00"
                  value={formData.hourly_rate}
                  onChange={e => updateFormData('hourly_rate', e.target.value)}
                  min="0"
                  step="5"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Set $0 or leave blank for quote-based pricing</p>
            </div>

            {/* Service Radius */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                <MapPin size={16} />
                Service Radius
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={formData.service_radius}
                  onChange={e => updateFormData('service_radius', e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm font-bold dark:text-white min-w-[60px] text-right">
                  {formData.service_radius} miles
                </span>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Skills & Certifications
              </label>
              <input
                type="text"
                className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                placeholder="e.g., Audio Engineering, Pro Tools Certification, Soldering"
                value={formData.skills}
                onChange={e => updateFormData('skills', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated list of skills</p>
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 lg:col-span-2">
          <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
            <Wrench size={18} className="text-gray-400" />
            Specialties
          </h3>
          <p className="text-sm text-gray-500 mb-4">Select all specialties that apply to your services</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {TECH_SPECIALTIES.map(specialty => (
              <button
                key={specialty}
                type="button"
                onClick={() => toggleSpecialty(specialty)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition text-left
                  ${formData.specialties.includes(specialty)
                    ? 'bg-brand-blue text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
          <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-gray-400" />
            Service Location
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                City
              </label>
              <input
                type="text"
                className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                placeholder="e.g., Los Angeles"
                value={formData.location.city}
                onChange={e => updateLocation('city', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                State
              </label>
              <input
                type="text"
                className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                placeholder="e.g., CA"
                value={formData.location.state}
                onChange={e => updateLocation('state', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                ZIP Code
              </label>
              <input
                type="text"
                className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                placeholder="e.g., 90001"
                value={formData.location.zip}
                onChange={e => updateLocation('zip', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Business Policies */}
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
          <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            Business Policies
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Cancellation Policy
              </label>
              <textarea
                className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                rows={2}
                placeholder="e.g., 24-hour notice required for cancellations"
                value={formData.business_policies.cancellation_policy}
                onChange={e => updatePolicies('cancellation_policy', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Payment Terms
              </label>
              <textarea
                className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                rows={2}
                placeholder="e.g., 50% deposit upfront, balance upon completion"
                value={formData.business_policies.payment_terms}
                onChange={e => updatePolicies('payment_terms', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                <Clock size={16} />
                Typical Response Time
              </label>
              <input
                type="text"
                className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                placeholder="e.g., Within 24 hours"
                value={formData.business_policies.response_time}
                onChange={e => updatePolicies('response_time', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Preview Card */}
      <div className="bg-gradient-to-r from-brand-blue to-blue-600 rounded-xl p-6 text-white">
        <h3 className="font-bold mb-4">Profile Preview</h3>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <UserCog size={32} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg">{formData.display_name || 'Your Name'}</h4>
              <div className="text-white/80 text-sm mb-2">
                {formData.location.city && formData.location.state
                  ? `${formData.location.city}, ${formData.location.state}`
                  : 'Location not set'}
              </div>
              {formData.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.specialties.slice(0, 3).map((specialty, i) => (
                    <span key={i} className="text-xs bg-white/20 px-2 py-0.5 rounded">
                      {specialty}
                    </span>
                  ))}
                  {formData.specialties.length > 3 && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                      +{formData.specialties.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              {formData.hourly_rate && (
                <div className="text-2xl font-bold">${formData.hourly_rate}/hr</div>
              )}
              <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                formData.availability_status === 'Available' ? 'bg-green-400 text-green-900' :
                formData.availability_status === 'Busy' ? 'bg-yellow-400 text-yellow-900' :
                'bg-gray-400 text-gray-900'
              }`}>
                {formData.availability_status}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
