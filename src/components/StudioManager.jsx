import React, { useState } from 'react';
import { Home, MapPin, Wifi, Layout, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { useForm, useFieldArray, Controller } from 'react-hook-form'; // Added Controller
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AMENITIES_DATA } from '../config/constants';
import toast from 'react-hot-toast';
import EquipmentAutocomplete from './shared/EquipmentAutocomplete';
import AddressAutocomplete from './shared/AddressAutocomplete';

const studioSchema = z.object({
    studioName: z.string().min(3, "Studio name is required"),
    address: z.string().min(5, "Address is required"),
    description: z.string().max(1000).optional(),
    rules: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    rooms: z.array(z.object({
        name: z.string().min(1, "Room name required"),
        rate: z.number().min(0),
        capacity: z.number().min(1),
        equipment: z.string().optional() 
    })).optional()
});

export default function StudioManager({ user, userData }) {
    const [saving, setSaving] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isDirty }
    } = useForm({
        resolver: zodResolver(studioSchema),
        defaultValues: {
            studioName: userData?.studioName || '',
            address: userData?.address || '',
            description: userData?.studioDescription || '',
            rules: userData?.studioRules || '',
            amenities: userData?.amenities || [],
            rooms: userData?.rooms || [{ name: 'Main Room', rate: 50, capacity: 5, equipment: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "rooms"
    });

    const watchedAmenities = watch("amenities");

    const toggleAmenity = (amenity) => {
        const current = watchedAmenities || [];
        if (current.includes(amenity)) {
            setValue('amenities', current.filter(a => a !== amenity), { shouldDirty: true });
        } else {
            setValue('amenities', [...current, amenity], { shouldDirty: true });
        }
    };

    const onSubmit = async (data) => {
        setSaving(true);
        const toastId = toast.loading('Saving Studio Settings...');

        try {
            const userRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles/main`);
            await updateDoc(userRef, {
                studioName: data.studioName,
                address: data.address,
                studioDescription: data.description,
                studioRules: data.rules,
                amenities: data.amenities,
                rooms: data.rooms,
                isStudio: true 
            });
            toast.success("Studio Settings Saved!", { id: toastId });
        } catch (error) {
            console.error("Studio update failed", error);
            toast.error("Failed to save settings.", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const inputClass = (error) => twMerge(
        "w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:text-white transition-all focus:ring-2 focus:ring-brand-blue outline-none",
        error ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-200 dark:border-gray-700"
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2">
                <Home className="text-brand-blue"/> Studio Manager
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Basic Info Card */}
                <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold dark:text-white mb-4">General Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Studio Name</label>
                            <input {...register("studioName")} className={inputClass(errors.studioName)} />
                            {errors.studioName && <p className="text-red-500 text-xs mt-1">{errors.studioName.message}</p>}
                        </div>
                        <div>
                            <Controller
                                control={control}
                                name="address"
                                render={({ field: { onChange, value } }) => (
                                    <AddressAutocomplete
                                        label="Location Address"
                                        value={value || ''}
                                        onChange={onChange}
                                        onSelect={(addressData) => {
                                            // Store additional location data if needed
                                            if (addressData.lat && addressData.lng) {
                                                setValue('lat', addressData.lat);
                                                setValue('lng', addressData.lng);
                                            }
                                            if (addressData.city) setValue('city', addressData.city);
                                            if (addressData.state) setValue('state', addressData.state);
                                            if (addressData.zip) setValue('zip', addressData.zip);
                                        }}
                                        placeholder="Start typing your studio address..."
                                        error={errors.address?.message}
                                        required
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                        <textarea {...register("description")} rows="3" className={inputClass(errors.description)} placeholder="Describe the vibe and gear..." />
                    </div>
                </div>

                {/* Amenities */}
                <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2"><Wifi size={20}/> Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                        {AMENITIES_DATA.map(amenity => (
                            <button
                                key={amenity}
                                type="button"
                                onClick={() => toggleAmenity(amenity)}
                                className={clsx(
                                    "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                                    watchedAmenities?.includes(amenity)
                                        ? "bg-brand-blue text-white border-brand-blue shadow-md"
                                        : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                )}
                            >
                                {amenity}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Room Management */}
                <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold dark:text-white flex items-center gap-2"><Layout size={20}/> Rooms & Rates</h3>
                        <button 
                            type="button" 
                            onClick={() => append({ name: 'New Room', rate: 0, capacity: 1, equipment: '' })}
                            className="text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-bold hover:bg-green-200 transition flex items-center gap-1"
                        >
                            <Plus size={16}/> Add Room
                        </button>
                    </div>

                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="bg-gray-50 dark:bg-[#1f2128] p-4 rounded-xl border dark:border-gray-600 relative group">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Room Name</label>
                                        <input {...register(`rooms.${index}.name`)} className={inputClass(errors.rooms?.[index]?.name)} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Hourly Rate ($)</label>
                                        <input type="number" {...register(`rooms.${index}.rate`, { valueAsNumber: true })} className={inputClass(errors.rooms?.[index]?.rate)} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Capacity</label>
                                        <input type="number" {...register(`rooms.${index}.capacity`, { valueAsNumber: true })} className={inputClass(errors.rooms?.[index]?.capacity)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Equipment (Comma separated)</label>
                                    {/* FIX: Replaced simple input with Controller + EquipmentAutocomplete */}
                                    <Controller
                                        control={control}
                                        name={`rooms.${index}.equipment`}
                                        render={({ field: { onChange, value } }) => (
                                            <EquipmentAutocomplete
                                                value={value || ''}
                                                onChange={onChange}
                                                placeholder="Console, Monitors, Mics..."
                                                multi={true}
                                            />
                                        )}
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => remove(index)}
                                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        ))}
                        {fields.length === 0 && <p className="text-center text-gray-400 py-4 italic">No rooms listed.</p>}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={saving || !isDirty}
                        className={clsx(
                            "px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all shadow-xl",
                            saving || !isDirty 
                                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed" 
                                : "bg-brand-blue text-white hover:bg-blue-600 hover:scale-[1.01]"
                        )}
                    >
                        {saving ? <Loader2 className="animate-spin" size={24}/> : <><Save size={24}/> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
