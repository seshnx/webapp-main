import { useState } from 'react';
import { 
    Settings, Save, Loader2, Home, MapPin, Mail,
    Wifi, Shield, EyeOff
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import AddressAutocomplete from '../shared/AddressAutocomplete';
import { AMENITIES_DATA } from '../../config/constants';

const settingsSchema = z.object({
    studioName: z.string().min(3, "Studio name is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    studioDescription: z.string().max(1000).optional(),
    email: z.string().email().optional().or(z.literal('')),
    phoneCell: z.string().optional(),
    phoneLand: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    hours: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    hideAddress: z.boolean().optional(),
});

/**
 * StudioSettings - Basic studio information and contact settings
 */
export default function StudioSettings({ user, userData, onUpdate }) {
    const [saving, setSaving] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isDirty }
    } = useForm({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            studioName: userData?.studioName || userData?.profileName || '',
            address: userData?.address || '',
            city: userData?.city || '',
            state: userData?.state || '',
            zip: userData?.zip || '',
            lat: userData?.lat,
            lng: userData?.lng,
            studioDescription: userData?.studioDescription || '',
            email: userData?.email || '',
            phoneCell: userData?.phoneCell || '',
            phoneLand: userData?.phoneLand || '',
            website: userData?.website || '',
            hours: userData?.hours || '',
            amenities: userData?.amenities || [],
            hideAddress: userData?.hideAddress || false,
        }
    });

    const watchedAmenities = watch("amenities");
    const watchHideAddress = watch("hideAddress");

    const toggleAmenity = (amenity) => {
        const current = watchedAmenities || [];
        if (current.includes(amenity)) {
            setValue('amenities', current.filter(a => a !== amenity), { shouldDirty: true });
        } else {
            setValue('amenities', [...current, amenity], { shouldDirty: true });
        }
    };

    const onSubmit = async (data) => {
        if (!supabase) return;
        setSaving(true);
        const toastId = toast.loading('Saving settings...');

        try {
            const userId = user?.id || user?.uid;
            await supabase
                .from('profiles')
                .update({
                    studio_name: data.studioName,
                    profile_name: data.studioName,
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    zip: data.zip,
                    lat: data.lat,
                    lng: data.lng,
                    studio_description: data.studioDescription,
                    email: data.email,
                    phone_cell: data.phoneCell,
                    phone_land: data.phoneLand,
                    website: data.website,
                    hours: data.hours,
                    amenities: data.amenities,
                    hide_address: data.hideAddress,
                    is_studio: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);
            
            if (error) throw error;
            
            toast.success("Settings saved!", { id: toastId });
            if (onUpdate) onUpdate(data);
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Failed to save settings.", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const inputClass = (error) => `w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white transition-all focus:ring-2 focus:ring-brand-blue outline-none ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200'}`;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Settings className="text-brand-blue" size={24} />
                        Studio Settings
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Basic information and contact details
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={saving || !isDirty}
                    className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition ${
                        saving || !isDirty
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-brand-blue text-white hover:bg-blue-600'
                    }`}
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            {/* Basic Info */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700">
                <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                    <Home size={18} className="text-brand-blue" />
                    General Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Studio Name *</label>
                        <input {...register("studioName")} className={inputClass(errors.studioName)} placeholder="Your Studio Name" />
                        {errors.studioName && <p className="text-red-500 text-xs mt-1">{errors.studioName.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                        <textarea 
                            {...register("studioDescription")} 
                            rows={3} 
                            className={inputClass(errors.studioDescription)} 
                            placeholder="Describe your studio, the vibe, and what makes it special..."
                        />
                    </div>
                </div>
            </div>

            {/* Location */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700">
                <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-brand-blue" />
                    Location
                </h3>
                
                {/* Privacy Toggle */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 mb-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            {...register("hideAddress")}
                            className="w-5 h-5 mt-0.5 text-brand-blue rounded"
                        />
                        <div>
                            <div className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                <Shield size={16} className="text-brand-blue" />
                                Private Home Studio Mode
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Your exact address will be hidden from the public map. It will only be revealed after you approve a booking request.
                            </p>
                        </div>
                    </label>
                </div>

                <div className="space-y-4">
                    <Controller
                        control={control}
                        name="address"
                        render={({ field: { onChange, value } }) => (
                            <AddressAutocomplete
                                label="Street Address"
                                value={value || ''}
                                onChange={onChange}
                                onSelect={(addressData) => {
                                    if (addressData.lat) setValue('lat', addressData.lat);
                                    if (addressData.lng) setValue('lng', addressData.lng);
                                    if (addressData.city) setValue('city', addressData.city, { shouldDirty: true });
                                    if (addressData.state) setValue('state', addressData.state, { shouldDirty: true });
                                    if (addressData.zip) setValue('zip', addressData.zip, { shouldDirty: true });
                                }}
                                placeholder="Start typing your address..."
                                error={errors.address?.message}
                                required
                            />
                        )}
                    />
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">City</label>
                            <input {...register("city")} className={inputClass()} placeholder="City" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">State</label>
                            <input {...register("state")} className={inputClass()} placeholder="State" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">ZIP</label>
                            <input {...register("zip")} className={inputClass()} placeholder="ZIP Code" />
                        </div>
                    </div>
                </div>

                {watchHideAddress && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                        <EyeOff size={16} />
                        <span>Address will be hidden until booking approval</span>
                    </div>
                )}
            </div>

            {/* Contact */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700">
                <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                    <Mail size={18} className="text-brand-blue" />
                    Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email</label>
                        <input {...register("email")} type="email" className={inputClass(errors.email)} placeholder="studio@email.com" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Website</label>
                        <input {...register("website")} className={inputClass(errors.website)} placeholder="https://yourstudio.com" />
                        {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Cell Phone</label>
                        <input {...register("phoneCell")} className={inputClass()} placeholder="(555) 123-4567" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Landline</label>
                        <input {...register("phoneLand")} className={inputClass()} placeholder="(555) 123-4567" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Hours of Operation</label>
                        <input {...register("hours")} className={inputClass()} placeholder="e.g. Mon-Fri 9AM-10PM, Sat-Sun 10AM-8PM" />
                    </div>
                </div>
            </div>

            {/* Amenities */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700">
                <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                    <Wifi size={18} className="text-brand-blue" />
                    Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                    {AMENITIES_DATA.map(amenity => (
                        <button
                            key={amenity}
                            type="button"
                            onClick={() => toggleAmenity(amenity)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                                watchedAmenities?.includes(amenity)
                                    ? "bg-brand-blue text-white border-brand-blue shadow-md"
                                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                        >
                            {amenity}
                        </button>
                    ))}
                </div>
            </div>

            {/* Save Button (Bottom) */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving || !isDirty}
                    className={`px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition shadow-lg ${
                        saving || !isDirty
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-brand-blue text-white hover:bg-blue-600 hover:scale-[1.01]'
                    }`}
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Settings
                </button>
            </div>
        </form>
    );
}
