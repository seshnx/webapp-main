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

/**
 * Zod schema for studio settings validation
 */
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
    // Kiosk settings
    kioskModeEnabled: z.boolean().optional(),
    kioskEduMode: z.boolean().optional(),
    kioskAuthorizedNetworks: z.string().optional(),
    kioskNetworkName: z.string().optional(),
});

/**
 * Type inferred from zod schema
 */
type StudioSettingsFormData = z.infer<typeof settingsSchema>;

/**
 * Address data from autocomplete
 */
interface AddressData {
    lat?: number;
    lng?: number;
    city?: string;
    state?: string;
    zip?: string;
    address?: string;
    [key: string]: any;
}

/**
 * StudioSettings component props
 */
export interface StudioSettingsProps {
    user?: any;
    userData?: any;
    onUpdate?: (data: Partial<StudioSettingsFormData>) => void;
}

/**
 * StudioSettings - Basic studio information and contact settings
 */
export default function StudioSettings({ user, userData, onUpdate }: StudioSettingsProps) {
    const [saving, setSaving] = useState<boolean>(false);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isDirty }
    } = useForm<StudioSettingsFormData>({
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
            kioskModeEnabled: userData?.kiosk_mode_enabled || false,
            kioskEduMode: userData?.kiosk_edu_mode || false,
            kioskAuthorizedNetworks: userData?.kiosk_authorized_networks || '',
            kioskNetworkName: userData?.kiosk_network_name || '',
        }
    });

    const watchedAmenities = watch("amenities");
    const watchHideAddress = watch("hideAddress");

    const toggleAmenity = (amenity: string): void => {
        const current = watchedAmenities || [];
        if (current.includes(amenity)) {
            setValue('amenities', current.filter(a => a !== amenity), { shouldDirty: true });
        } else {
            setValue('amenities', [...current, amenity], { shouldDirty: true });
        }
    };

    const onSubmit = async (data: StudioSettingsFormData): Promise<void> => {
        setSaving(true);
        const toastId = toast.loading('Saving settings...');
        const userId = userData?.id || user?.id || user?.uid;

        try {
            const response = await fetch(`/api/studio-ops/profiles/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studioName: data.studioName,
                    profileName: data.studioName,
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    zip: data.zip,
                    lat: data.lat,
                    lng: data.lng,
                    studioDescription: data.studioDescription,
                    email: data.email,
                    phoneCell: data.phoneCell,
                    phoneLand: data.phoneLand,
                    website: data.website,
                    hours: data.hours,
                    amenities: data.amenities,
                    hideAddress: data.hideAddress,
                    kiosk_mode_enabled: data.kioskModeEnabled,
                    kiosk_edu_mode: data.kioskEduMode,
                    kiosk_authorized_networks: data.kioskAuthorizedNetworks,
                    kiosk_network_name: data.kioskNetworkName,
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save');
            }

            toast.success("Settings saved!", { id: toastId });
            if (onUpdate) onUpdate(data);
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Failed to save settings.", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const inputClass = (error?: any): string =>
        `w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white transition-all focus:ring-2 focus:ring-brand-blue outline-none ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200'}`;

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
                        {errors.studioName && <p className="text-red-500 text-xs mt-1">{errors.studioName.message as string}</p>}
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
                                onSelect={(addressData: AddressData) => {
                                    if (addressData.lat) setValue('lat', addressData.lat);
                                    if (addressData.lng) setValue('lng', addressData.lng);
                                    if (addressData.city) setValue('city', addressData.city, { shouldDirty: true });
                                    if (addressData.state) setValue('state', addressData.state, { shouldDirty: true });
                                    if (addressData.zip) setValue('zip', addressData.zip, { shouldDirty: true });
                                }}
                                placeholder="Start typing your address..."
                                error={errors.address?.message as string}
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
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Website</label>
                        <input {...register("website")} className={inputClass(errors.website)} placeholder="https://yourstudio.com" />
                        {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message as string}</p>}
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

            {/* Kiosk Mode Settings */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700">
                <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                    <Settings size={18} className="text-brand-blue" />
                    Kiosk Mode Settings
                </h3>

                {/* Enable Kiosk Mode */}
                <div className="mb-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            {...register("kioskModeEnabled")}
                            className="w-5 h-5 text-brand-blue rounded"
                        />
                        <div>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                Enable Kiosk Mode
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                                Display live booking status and floor plan on lobby/room displays
                            </p>
                        </div>
                    </label>
                </div>

                {/* EDU Mode */}
                {(userData?.accountType === 'EDUAdmin' || userData?.accountType === 'EDUStaff') && (
                    <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                {...register("kioskEduMode")}
                                className="w-5 h-5 text-brand-blue rounded"
                            />
                            <div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    Campus Mode
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                    Show class schedules instead of commercial bookings
                                </p>
                            </div>
                        </label>
                    </div>
                )}

                {/* Authorized Networks */}
                <div className="mb-6">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                        Authorized Wi-Fi Networks (CIDR notation)
                    </label>
                    <textarea
                        {...register("kioskAuthorizedNetworks")}
                        className={inputClass()}
                        placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                        rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Enter one network per line in CIDR notation (e.g., 192.168.1.0/24). Kiosk will auto-unlock when connected to these networks.
                    </p>
                </div>

                {/* Network Name */}
                <div className="mb-6">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                        Network Name (Optional)
                    </label>
                    <input
                        {...register("kioskNetworkName")}
                        className={inputClass()}
                        placeholder="Studio Lobby Wi-Fi"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Display name for authorized network (shown in kiosk footer)
                    </p>
                </div>

                {/* Kiosk URL Display */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Kiosk Display URL
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                        <code className="flex-1 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg text-sm border dark:border-gray-600">
                            {typeof window !== 'undefined' ? `${window.location.origin}/kiosk/${userData?.id || ''}` : '/kiosk/[studio-id]'}
                        </code>
                        <button
                            type="button"
                            onClick={() => {
                                const url = typeof window !== 'undefined' ? `${window.location.origin}/kiosk/${userData?.id || ''}` : '';
                                navigator.clipboard.writeText(url);
                                toast.success('URL copied to clipboard');
                            }}
                            className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                            Copy
                        </button>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-600 flex items-center gap-4">
                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-500 text-center">QR Code</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                QR Code
                            </p>
                            <p className="text-xs text-gray-500">
                                Display this QR code in your lobby for easy kiosk access on mobile devices
                            </p>
                        </div>
                    </div>
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
