/**
 * Dynamic Booking Form Component
 *
 * Renders a form based on MongoDB schema definitions.
 * Allows studios to customize booking forms without code changes.
 */

import React, { useState, useEffect } from 'react';
import { useFormSchema } from '../../hooks/useBooking';
import * as Sentry from '@sentry/react';
import type { FormFieldDefinition } from '../../types/mongodb';

interface DynamicBookingFormProps {
  studioId: string;
  bookingId?: string;
  onSubmit?: (responses: Record<string, any>) => Promise<void>;
  submitLabel?: string;
}

/**
 * Dynamic form component that renders based on MongoDB schema
 */
export default function DynamicBookingForm({
  studioId,
  bookingId,
  onSubmit,
  submitLabel = 'Submit Booking Details'
}: DynamicBookingFormProps) {
  const { schema, loading, error, submitResponse, mongoDbAvailable } = useFormSchema(studioId);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Reset responses when schema changes
  useEffect(() => {
    if (schema) {
      const initialValues: Record<string, any> = {};
      schema.fields.forEach((field: FormFieldDefinition) => {
        if (field.fieldType === 'checkbox') {
          initialValues[field.id] = [];
        }
      });
      setResponses(initialValues);
    }
  }, [schema]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateField = (field: FormFieldDefinition, value: any): string | null => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      const { minLength, maxLength, min, max, pattern } = field.validation;

      if (typeof value === 'string' || Array.isArray(value)) {
        if (minLength && value.length < minLength) {
          return `${field.label} must be at least ${minLength} characters`;
        }
        if (maxLength && value.length > maxLength) {
          return `${field.label} must be no more than ${maxLength} characters`;
        }
      }

      if (typeof value === 'number') {
        if (min !== undefined && value < min) {
          return `${field.label} must be at least ${min}`;
        }
        if (max !== undefined && value > max) {
          return `${field.label} must be no more than ${max}`;
        }
      }

      if (pattern && typeof value === 'string') {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          return `${field.label} format is invalid`;
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors({});

    // Validate all fields
    const errors: Record<string, string> = {};
    if (schema) {
      schema.fields.forEach((field: FormFieldDefinition) => {
        const error = validateField(field, responses[field.id]);
        if (error) {
          errors[field.id] = error;
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(responses);
      } else if (bookingId && schema) {
        await submitResponse(bookingId, responses, 'user');
      }

      Sentry.captureMessage('Dynamic form submitted', 'info', {
        tags: { component: 'DynamicBookingForm' },
        extra: { studioId, bookingId, fieldCount: Object.keys(responses).length }
      });
    } catch (err) {
      console.error('Failed to submit form:', err);
      Sentry.captureException(err, {
        tags: { component: 'DynamicBookingForm' },
        extra: { studioId, bookingId }
      });
      setValidationErrors({ form: 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mongoDbAvailable) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-center">
          Custom booking forms are not available.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-center">Loading form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <p className="text-red-600 text-center">Failed to load form</p>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-center">No form configured for this studio</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold dark:text-white">{schema.schemaName}</h2>
      {schema.description && (
        <p className="text-gray-600 dark:text-gray-400">{schema.description}</p>
      )}

      {validationErrors.form && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{validationErrors.form}</p>
        </div>
      )}

      {schema.fields
        .sort((a: FormFieldDefinition, b: FormFieldDefinition) => a.order - b.order)
        .map((field: FormFieldDefinition) => (
          <FormField
            key={field.id}
            field={field}
            value={responses[field.id] || ''}
            onChange={(value) => handleFieldChange(field.id, value)}
            error={validationErrors[field.id]}
          />
        ))}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-brand-blue hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
      >
        {isSubmitting ? 'Submitting...' : submitLabel}
      </button>
    </form>
  );
}

/**
 * Individual form field renderer
 */
function FormField({
  field,
  value,
  onChange,
  error,
}: {
  field: FormFieldDefinition;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}) {
  const commonProps = {
    className: `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue dark:bg-[#1f2128] dark:text-white ${
      error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
    }`,
  };

  return (
    <div>
      <label className="block font-medium mb-2 dark:text-white">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {field.fieldType === 'text' && (
        <input
          type="text"
          {...commonProps}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.fieldType === 'textarea' && (
        <textarea
          {...commonProps}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      )}

      {field.fieldType === 'email' && (
        <input
          type="email"
          {...commonProps}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.fieldType === 'phone' && (
        <input
          type="tel"
          {...commonProps}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.fieldType === 'number' && (
        <input
          type="number"
          {...commonProps}
          value={value}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : '')}
          min={field.validation?.min}
          max={field.validation?.max}
        />
      )}

      {field.fieldType === 'date' && (
        <input
          type="date"
          {...commonProps}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.fieldType === 'time' && (
        <input
          type="time"
          {...commonProps}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.fieldType === 'select' && (
        <select {...commonProps} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select an option</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.fieldType === 'radio' && (
        <div className="space-y-2">
          {field.options?.map((opt) => (
            <label key={opt.value} className="flex items-center dark:text-white">
              <input
                type="radio"
                name={field.id}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => onChange(e.target.value)}
                className="w-4 h-4 mr-2"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {field.fieldType === 'checkbox' && (
        <div className="space-y-2">
          {field.options?.map((opt) => (
            <label key={opt.value} className="flex items-center dark:text-white">
              <input
                type="checkbox"
                value={opt.value}
                checked={(value || []).includes(opt.value)}
                onChange={(e) => {
                  const newValue = e.target.checked
                    ? [...(value || []), opt.value]
                    : (value || []).filter((v: string) => v !== opt.value);
                  onChange(newValue);
                }}
                className="w-4 h-4 mr-2"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {field.fieldType === 'file' && (
        <input
          type="file"
          {...commonProps}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onChange(file.name);
            }
          }}
        />
      )}

      {field.helpText && (
        <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
