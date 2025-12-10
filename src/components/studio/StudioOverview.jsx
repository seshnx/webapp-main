import { 
    Home, MapPin, DollarSign, Users, Calendar, 
    AlertCircle, CheckCircle, Star
} from 'lucide-react';

/**
 * StudioOverview - Dashboard view for studio stats and quick actions
 */
export default function StudioOverview({ userData, stats, onNavigate }) {
    const studioName = userData?.studioName || userData?.profileName || 'My Studio';
    const rooms = userData?.rooms || [];
    const amenities = userData?.amenities || [];
    
    // Calculate stats
    const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
    const avgRate = rooms.length > 0 
        ? Math.round(rooms.reduce((sum, r) => sum + (r.rate || 0), 0) / rooms.length) 
        : 0;

    const quickStats = [
        { 
            label: 'Active Rooms', 
            value: rooms.length, 
            icon: <Home size={20} />, 
            color: 'blue',
            onClick: () => onNavigate('rooms')
        },
        { 
            label: 'Total Capacity', 
            value: `${totalCapacity} ppl`, 
            icon: <Users size={20} />, 
            color: 'green' 
        },
        { 
            label: 'Avg. Rate', 
            value: `$${avgRate}/hr`, 
            icon: <DollarSign size={20} />, 
            color: 'purple' 
        },
        { 
            label: 'Amenities', 
            value: amenities.length, 
            icon: <Star size={20} />, 
            color: 'amber' 
        },
    ];

    const pendingBookings = stats?.pendingBookings || 0;

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Studio Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Home size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{studioName}</h1>
                            <p className="text-blue-100 text-sm flex items-center gap-1">
                                <MapPin size={14} />
                                {userData?.city && userData?.state 
                                    ? `${userData.city}, ${userData.state}` 
                                    : 'Location not set'}
                            </p>
                        </div>
                    </div>
                    {userData?.studioDescription && (
                        <p className="text-blue-100 text-sm mt-4 max-w-2xl line-clamp-2">
                            {userData.studioDescription}
                        </p>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickStats.map((stat, i) => (
                    <button
                        key={i}
                        onClick={stat.onClick}
                        className={`bg-white dark:bg-[#2c2e36] p-5 rounded-xl border dark:border-gray-700 shadow-sm text-left transition-all ${stat.onClick ? 'hover:shadow-md hover:border-brand-blue cursor-pointer' : ''}`}
                    >
                        <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400 mb-3`}>
                            {stat.icon}
                        </div>
                        <div className="text-2xl font-bold dark:text-white">{stat.value}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium tracking-wide">
                            {stat.label}
                        </div>
                    </button>
                ))}
            </div>

            {/* Alerts & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Actions */}
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-[#23262f]">
                        <h3 className="font-bold dark:text-white flex items-center gap-2">
                            <AlertCircle size={18} className="text-amber-500" />
                            Pending Actions
                        </h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {pendingBookings > 0 ? (
                            <button 
                                onClick={() => onNavigate('bookings')}
                                className="w-full flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-amber-600" size={18} />
                                    <span className="text-sm font-medium dark:text-amber-300">
                                        {pendingBookings} Pending Booking{pendingBookings > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <span className="text-xs text-amber-600 font-bold">Review →</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <CheckCircle className="text-green-600" size={18} />
                                <span className="text-sm text-green-700 dark:text-green-300">All caught up!</span>
                            </div>
                        )}

                        {!userData?.studioDescription && (
                            <button 
                                onClick={() => onNavigate('settings')}
                                className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                            >
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Add studio description</span>
                                <span className="text-xs text-blue-600 font-bold">Setup →</span>
                            </button>
                        )}

                        {rooms.length === 0 && (
                            <button 
                                onClick={() => onNavigate('rooms')}
                                className="w-full flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
                            >
                                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Add your first room</span>
                                <span className="text-xs text-purple-600 font-bold">Add →</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Room Summary */}
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-[#23262f] flex justify-between items-center">
                        <h3 className="font-bold dark:text-white flex items-center gap-2">
                            <Home size={18} className="text-brand-blue" />
                            Rooms
                        </h3>
                        <button 
                            onClick={() => onNavigate('rooms')}
                            className="text-xs text-brand-blue font-bold hover:underline"
                        >
                            Manage →
                        </button>
                    </div>
                    <div className="p-4">
                        {rooms.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                <Home size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No rooms configured yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {rooms.slice(0, 4).map((room, i) => (
                                    <div 
                                        key={i}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1f2128] rounded-lg"
                                    >
                                        <div>
                                            <div className="font-medium dark:text-white text-sm">{room.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {room.capacity} people • {room.equipment ? room.equipment.split(',').length : 0} gear items
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-green-600 dark:text-green-400">${room.rate}/hr</div>
                                        </div>
                                    </div>
                                ))}
                                {rooms.length > 4 && (
                                    <p className="text-xs text-center text-gray-400 pt-2">
                                        +{rooms.length - 4} more rooms
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Amenities Preview */}
            {amenities.length > 0 && (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-5">
                    <h3 className="font-bold dark:text-white mb-3 flex items-center gap-2">
                        <Star size={18} className="text-amber-500" />
                        Studio Amenities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {amenities.map((amenity, i) => (
                            <span 
                                key={i}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                            >
                                {amenity}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
