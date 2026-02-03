import React, { useState, useEffect } from 'react';
import {
  ChevronRight, ChevronLeft, CheckCircle, Wrench,
  Calendar, MapPin, DollarSign, Clock, AlertCircle,
  Package, Truck, Home, Video
} from 'lucide-react';
import { SERVICE_CATALOGUE, TECH_SPECIALTIES } from '../../config/constants';
import { createServiceRequest } from '../../config/neonQueries';
import EquipmentAutocomplete from '../shared/EquipmentAutocomplete';
import type { TechnicianProfile, ServiceRequest } from '../../config/neonQueries';
import type { UserData } from '../../types';

/**
 * Step configuration
 */
interface StepConfig {
  id: number;
  title: string;
  icon: typeof Wrench;
  description: string;
}

const STEPS: StepConfig[] = [
  { id: 1, title: 'Service Details', icon: Wrench, description: 'What do you need help with?' },
  { id: 2, title: 'Logistics', icon: MapPin, description: 'How should we handle the equipment?' },
  { id: 3, title: 'Budget & Timeline', icon: DollarSign, description: 'Set your budget and urgency' },
  { id: 4, title: 'Review', icon: CheckCircle, description: 'Review and submit your request' }
];

/**
 * Form data interface
 */
interface BookingFormData {
  // Step 1: Service Details
  category: string;
  equipmentName: string;
  equipmentBrand: string;
  equipmentModel: string;
  issueDescription: string;

  // Step 2: Logistics
  logistics: 'drop-off' | 'pickup' | 'on-site' | 'remote';
  location?: string;
  preferredDate?: string;

  // Step 3: Budget & Timeline
  budgetCap?: number;
  urgency: 'standard' | 'soon' | 'urgent';
  additionalNotes?: string;
}

/**
 * Props for TechBookingFlow component
 */
export interface TechBookingFlowProps {
  tech: TechnicianProfile;
  user?: any;
  userData?: UserData | null;
  onSuccess?: (request: ServiceRequest) => void;
  onCancel?: () => void;
}

/**
 * TechBookingFlow - Multi-step wizard for booking technician services
 *
 * Features:
 * - 4-step guided flow (Service Details → Logistics → Budget → Review)
 * - Equipment autocomplete from database
 * - Auto-save draft to localStorage
 * - Form validation
 * - Summary review before submission
 */
export default function TechBookingFlow({ tech, user, userData, onSuccess, onCancel }: TechBookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<BookingFormData>({
    category: SERVICE_CATALOGUE[0].label,
    equipmentName: '',
    equipmentBrand: '',
    equipmentModel: '',
    issueDescription: '',
    logistics: 'drop-off',
    urgency: 'standard'
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save draft to localStorage
  useEffect(() => {
    const draft = localStorage.getItem(`techBookingDraft_${tech.user_id}`);
    if (draft) {
      try {
        const savedData = JSON.parse(draft);
        setFormData(savedData);
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, [tech.user_id]);

  useEffect(() => {
    localStorage.setItem(`techBookingDraft_${tech.user_id}`, JSON.stringify(formData));
  }, [formData, tech.user_id]);

  const updateFormData = <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error for this field when user updates it
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.equipmentName.trim()) newErrors.equipmentName = 'Equipment name is required';
      if (!formData.issueDescription.trim()) newErrors.issueDescription = 'Issue description is required';
    }

    if (step === 2) {
      if (formData.logistics === 'on-site' && !formData.location?.trim()) {
        newErrors.location = 'Location is required for on-site service';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    try {
      const userId = user?.id || user?.uid;
      if (!userId) throw new Error('User not authenticated');

      const requestData = {
        requester_id: userId,
        tech_id: tech.user_id,
        title: `${formData.category} - ${formData.equipmentName}`,
        description: formData.additionalNotes || formData.issueDescription,
        service_category: formData.category,
        equipment_name: formData.equipmentName,
        equipment_brand: formData.equipmentBrand || undefined,
        equipment_model: formData.equipmentModel || undefined,
        issue_description: formData.issueDescription,
        logistics: getLogisticsLabel(formData.logistics),
        preferred_date: formData.preferredDate || undefined,
        budget_cap: formData.budgetCap,
        priority: formData.urgency === 'urgent' ? 'Urgent' : formData.urgency === 'soon' ? 'High' : 'Normal',
        status: 'Open'
      };

      const request = await createServiceRequest(requestData);

      // Clear draft on successful submission
      localStorage.removeItem(`techBookingDraft_${tech.user_id}`);

      // Clear any form errors
      setErrors({});

      onSuccess?.(request);
    } catch (error) {
      console.error('Error creating service request:', error);
      setErrors({ submit: 'Failed to submit request. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getLogisticsLabel = (logistics: string): string => {
    const labels: Record<string, string> = {
      'drop-off': 'Drop-off',
      'pickup': 'Pickup',
      'on-site': 'On-site',
      'remote': 'Remote/Online'
    };
    return labels[logistics] || logistics;
  };

  const getLogisticsIcon = (logistics: string) => {
    switch (logistics) {
      case 'drop-off': return Package;
      case 'pickup': return Truck;
      case 'on-site': return Home;
      case 'remote': return Video;
      default: return Package;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const badges: Record<string, string> = {
      'standard': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'soon': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'urgent': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    };
    return badges[urgency] || badges['standard'];
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in">
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const IconComponent = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                      ${isCompleted ? 'bg-green-500 text-white' : ''}
                      ${isCurrent ? 'bg-orange-500 text-white ring-4 ring-orange-100 dark:ring-orange-900/30' : ''}
                      ${!isCompleted && !isCurrent ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : ''}
                    `}
                  >
                    {isCompleted ? <CheckCircle size={18} /> : <IconComponent size={18} />}
                  </div>
                  <div className={`text-xs font-medium mt-2 text-center ${
                    isCurrent ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 mt-4 transition-all ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {STEPS[currentStep - 1].description}
        </p>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 md:p-8 shadow-sm">
        {currentStep === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h3 className="text-xl font-bold dark:text-white">Service Details</h3>

            {/* Service Category */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Service Category *
              </label>
              <select
                className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.category}
                onChange={e => updateFormData('category', e.target.value)}
              >
                {SERVICE_CATALOGUE.map(cat => (
                  <option key={cat.id} value={cat.label}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Equipment Name */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Equipment Name *
              </label>
              <EquipmentAutocomplete
                value={formData.equipmentName}
                onChange={(value) => updateFormData('equipmentName', value)}
                placeholder="e.g., SM58 Microphone, Fender Stratocaster"
                className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
              {errors.equipmentName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.equipmentName}
                </p>
              )}
            </div>

            {/* Brand & Model */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                  Brand
                </label>
                <input
                  type="text"
                  className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g., Shure"
                  value={formData.equipmentBrand}
                  onChange={e => updateFormData('equipmentBrand', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                  Model
                </label>
                <input
                  type="text"
                  className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g., SM58"
                  value={formData.equipmentModel}
                  onChange={e => updateFormData('equipmentModel', e.target.value)}
                />
              </div>
            </div>

            {/* Issue Description */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Issue Description *
              </label>
              <textarea
                className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                rows={4}
                placeholder="Describe the issue you're experiencing..."
                value={formData.issueDescription}
                onChange={e => updateFormData('issueDescription', e.target.value)}
              />
              {errors.issueDescription && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.issueDescription}
                </p>
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h3 className="text-xl font-bold dark:text-white">Logistics</h3>

            {/* Logistics Options */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 block">
                How should we handle the equipment?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { id: 'drop-off', label: 'Drop-off', desc: 'You bring equipment to tech', icon: Package },
                  { id: 'pickup', label: 'Pickup', desc: 'Tech picks up from you', icon: Truck },
                  { id: 'on-site', label: 'On-site', desc: 'Tech comes to your location', icon: Home },
                  { id: 'remote', label: 'Remote', desc: 'Online consultation/support', icon: Video }
                ] as const).map(option => {
                  const IconComponent = option.icon;
                  const isSelected = formData.logistics === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateFormData('logistics', option.id)}
                      className={`
                        p-4 rounded-lg border-2 text-left transition-all
                        ${isSelected
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent size={18} className={isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500'} />
                        <span className={`font-bold ${isSelected ? 'text-orange-700 dark:text-orange-300' : 'dark:text-gray-300'}`}>
                          {option.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location (for on-site) */}
            {formData.logistics === 'on-site' && (
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                  Service Location *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Enter your address or location"
                  value={formData.location || ''}
                  onChange={e => updateFormData('location', e.target.value)}
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.location}
                  </p>
                )}
              </div>
            )}

            {/* Preferred Date */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Preferred Date (Optional)
              </label>
              <input
                type="date"
                className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.preferredDate || ''}
                onChange={e => updateFormData('preferredDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h3 className="text-xl font-bold dark:text-white">Budget & Timeline</h3>

            {/* Budget Cap */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Budget Cap (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="number"
                  className="w-full pl-10 p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Enter maximum budget"
                  value={formData.budgetCap || ''}
                  onChange={e => updateFormData('budgetCap', e.target.value ? Number(e.target.value) : undefined)}
                  min="0"
                  step="10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Technicians can see your budget range</p>
            </div>

            {/* Urgency */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 block">
                How soon do you need this done?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: 'standard', label: 'Standard', desc: 'No rush', days: '5-7 days' },
                  { id: 'soon', label: 'Soon', desc: 'Need it quickly', days: '2-3 days' },
                  { id: 'urgent', label: 'Urgent', desc: 'Emergency', days: 'ASAP' }
                ] as const).map(option => {
                  const isSelected = formData.urgency === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateFormData('urgency', option.id)}
                      className={`
                        p-4 rounded-lg border-2 text-center transition-all
                        ${isSelected
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                    >
                      <div className={`font-bold mb-1 ${isSelected ? 'text-orange-700 dark:text-orange-300' : 'dark:text-gray-300'}`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                      <div className={`text-xs font-bold mt-2 ${isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>
                        {option.days}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Additional Notes (Optional)
              </label>
              <textarea
                className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                rows={3}
                placeholder="Any other information the technician should know..."
                value={formData.additionalNotes || ''}
                onChange={e => updateFormData('additionalNotes', e.target.value)}
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <h3 className="text-xl font-bold dark:text-white">Review Your Request</h3>

            {/* Technician Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold dark:text-white mb-2">Technician</h4>
              <div className="flex items-center gap-3">
                {tech.profile_photo && (
                  <img src={tech.profile_photo} alt={tech.display_name} className="w-12 h-12 rounded-full object-cover" />
                )}
                <div>
                  <div className="font-bold dark:text-white">{tech.display_name}</div>
                  {tech.specialties && tech.specialties.length > 0 && (
                    <div className="text-sm text-gray-500">{tech.specialties.slice(0, 2).join(', ')}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold dark:text-white mb-3">Service Details</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Category</dt>
                  <dd className="font-medium dark:text-gray-300">{formData.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Equipment</dt>
                  <dd className="font-medium dark:text-gray-300">
                    {formData.equipmentName}
                    {(formData.equipmentBrand || formData.equipmentModel) && (
                      <span className="text-gray-400 ml-1">
                        ({formData.equipmentBrand} {formData.equipmentModel})
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Issue</dt>
                  <dd className="font-medium dark:text-gray-300 max-w-md text-right">{formData.issueDescription}</dd>
                </div>
              </dl>
            </div>

            {/* Logistics */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold dark:text-white mb-3">Logistics</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Method</dt>
                  <dd className={`font-medium px-2 py-1 rounded-lg ${getUrgencyBadge(formData.urgency)}`}>
                    {getLogisticsLabel(formData.logistics)}
                  </dd>
                </div>
                {formData.location && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Location</dt>
                    <dd className="font-medium dark:text-gray-300">{formData.location}</dd>
                  </div>
                )}
                {formData.preferredDate && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Preferred Date</dt>
                    <dd className="font-medium dark:text-gray-300">{new Date(formData.preferredDate).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Budget & Urgency */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold dark:text-white mb-3">Budget & Timeline</h4>
              <dl className="space-y-2 text-sm">
                {formData.budgetCap && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Budget Cap</dt>
                    <dd className="font-bold text-green-600 dark:text-green-400">${formData.budgetCap}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Urgency</dt>
                  <dd className={`font-medium px-2 py-1 rounded-lg text-xs ${getUrgencyBadge(formData.urgency)}`}>
                    {formData.urgency.toUpperCase()}
                  </dd>
                </div>
              </dl>
            </div>

            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {errors.submit}
              </div>
            )}

            <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 p-3 rounded-lg text-sm">
              By clicking "Post Request", your service request will be sent to {tech.display_name}. They will review and respond within their typical response time.
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition disabled:opacity-50"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={submitting}
              className="px-6 py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>

        {currentStep < 4 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition shadow-sm"
          >
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Posting...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Post Request
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
