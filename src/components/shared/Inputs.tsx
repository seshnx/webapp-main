import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Item tag component props
 */
export interface ItemTagProps {
  /** Tag text */
  text: string;
  /** Remove handler */
  onRemove: () => void;
}

/**
 * Item Tag Component
 *
 * Displays a removable tag item.
 *
 * @param props - Item tag props
 * @returns Tag component
 */
export function ItemTag({ text, onRemove }: ItemTagProps): React.ReactElement {
  return (
    <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-sm px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">
      {text}
      <X size={12} className="cursor-pointer hover:text-red-500" onClick={onRemove} />
    </span>
  );
}

/**
 * Multi-select component props
 */
export interface MultiSelectProps {
  /** Label for the select */
  label: string;
  /** Field key for the form */
  fieldKey: string;
  /** Available options */
  options: string[];
  /** Initial selected values */
  initialValues?: string[];
  /** Change handler */
  onChange: (fieldKey: string, values: string[]) => void;
}

/**
 * Multi-Select Component
 *
 * Allows selecting multiple items from a dropdown list.
 *
 * @param props - Multi-select props
 * @returns Multi-select component
 */
export function MultiSelect({ label, fieldKey, options, initialValues, onChange }: MultiSelectProps): React.ReactElement {
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [list, setList] = useState<string[]>(initialValues || []);

  useEffect(() => { setList(initialValues || []) }, [initialValues]);

  const addItem = () => {
    if (selectedItem && !list.includes(selectedItem)) {
      const newList = [...list, selectedItem];
      setList(newList);
      onChange(fieldKey, newList);
      setSelectedItem('');
    }
  };

  const removeItem = (item: string) => {
    const newList = list.filter(i => i !== item);
    setList(newList);
    onChange(fieldKey, newList);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <select
          className="flex-1 p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
        >
          <option value="">Select...</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <button type="button" onClick={addItem} className="bg-brand-blue text-white px-3 rounded-lg text-sm">Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map(item => (
          <ItemTag key={item} text={item} onRemove={() => removeItem(item)} />
        ))}
      </div>
    </div>
  );
}

/**
 * Nested select component props
 */
export interface NestedSelectProps {
  /** Label for the select */
  label: string;
  /** Field key for the form */
  fieldKey: string;
  /** Nested data structure (category -> options) */
  data: Record<string, string[]>;
  /** Initial selected values */
  initialValues?: string[];
  /** Change handler */
  onChange: (fieldKey: string, values: string[]) => void;
}

/**
 * Nested Select Component
 *
 * Allows selecting items from a nested category/subcategory structure.
 *
 * @param props - Nested select props
 * @returns Nested select component
 */
export function NestedSelect({ label, fieldKey, data, initialValues, onChange }: NestedSelectProps): React.ReactElement {
  const [category, setCategory] = useState<string>('');
  const [subOption, setSubOption] = useState<string>('');
  const [list, setList] = useState<string[]>(initialValues || []);

  useEffect(() => { setList(initialValues || []) }, [initialValues]);

  const subOptions = data[category] || [];

  const addItem = () => {
    const item = category && subOption ? `${category} - ${subOption}` : '';
    if (item && !list.includes(item)) {
      const newList = [...list, item];
      setList(newList);
      onChange(fieldKey, newList);
      setSubOption('');
    }
  };

  const removeItem = (item: string) => {
    const newList = list.filter(i => i !== item);
    setList(newList);
    onChange(fieldKey, newList);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <select
          className="w-1/3 p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setSubOption(''); }}
        >
          <option value="">Category...</option>
          {Object.keys(data).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select
          className="w-1/3 p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
          value={subOption}
          onChange={(e) => setSubOption(e.target.value)}
          disabled={!category}
        >
          <option value="">Select...</option>
          {subOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <button type="button" onClick={addItem} className="bg-brand-blue text-white px-3 rounded-lg text-sm">Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map(item => (
          <ItemTag key={item} text={item} onRemove={() => removeItem(item)} />
        ))}
      </div>
    </div>
  );
}
