import React, { useState } from 'react';
import { Radio, Users, Plus, Mic, Sparkles, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from '../shared/UserAvatar';
import LiveRoomModal from './LiveRoomModal.tsx';
import CreateLiveSpaceModal from './CreateLiveSpaceModal.tsx';
import { useLiveRooms } from '../../hooks/useConvex';
import type { Id } from '../../../convex/_generated/dataModel';

interface LiveSpacesBarProps {
  user?: any;
  userSettings?: any;
}

export default function LiveSpacesBar({ user, userSettings }: LiveSpacesBarProps) {
  const [activeRoomId, setActiveRoomId] = useState<Id<'liveRooms'> | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (userSettings?.social?.enableLiveSpaces === false) {
    return null;
  }

  const dbLiveRooms = useLiveRooms() || [];

  const handleRoomCreated = (roomId: Id<'liveRooms'>) => {
    setActiveRoomId(roomId);
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-purple-950/30 via-gray-900/40 to-blue-950/30 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-purple-800/25 shadow-lg shadow-purple-950/10 transition-all duration-300">
      {/* Header Bar (Clickable to Toggle Collapse) */}
      <div className="flex items-center justify-between">
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2.5 cursor-pointer select-none group flex-1 mr-2"
        >
          <div className="relative flex items-center justify-center">
            {dbLiveRooms.length > 0 && (
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute" />
            )}
            <div className={`w-2.5 h-2.5 rounded-full ${dbLiveRooms.length > 0 ? 'bg-red-500' : 'bg-gray-500'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 group-hover:text-purple-400 transition">
                <Radio size={16} className={dbLiveRooms.length > 0 ? 'text-red-500' : 'text-gray-400'} />
                Live Audio Spaces
              </h3>
              {dbLiveRooms.length > 0 ? (
                <span className="text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                  {dbLiveRooms.length} LIVE
                </span>
              ) : (
                <span className="text-[10px] font-semibold bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                  0 Active
                </span>
              )}
              <span className="text-gray-400 group-hover:text-white transition-transform duration-200">
                {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:block">
              {isCollapsed
                ? 'Click to expand live discussions and spaces'
                : 'Drop in, listen to music discussions, or start your own space'}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-brand-blue text-white rounded-xl text-xs font-bold hover:opacity-90 transition shadow-md shadow-purple-600/20 shrink-0"
        >
          <Plus size={14} /> Start Space
        </button>
      </div>

      {/* Collapsible Active Live Rooms Grid */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 14 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {dbLiveRooms.length === 0 ? (
              <div className="text-center py-6 px-4 bg-gray-900/30 rounded-xl border border-dashed border-gray-800 text-xs text-gray-400 flex flex-col items-center gap-1.5">
                <div className="p-2.5 bg-gray-800/80 rounded-full text-purple-400 mb-1">
                  <Mic size={18} />
                </div>
                <p className="font-semibold text-gray-300">No live spaces active right now</p>
                <p className="text-[11px] text-gray-500">
                  Click <strong className="text-purple-400">Start Space</strong> above to host a live audio session!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {dbLiveRooms.map((room: any) => (
                  <motion.div
                    key={room._id}
                    whileHover={{ scale: 1.015, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-purple-500/20 dark:border-purple-500/30 shadow-md hover:shadow-purple-500/10 cursor-pointer flex flex-col justify-between transition group relative overflow-hidden"
                    onClick={() => setActiveRoomId(room._id)}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -z-10 group-hover:bg-purple-500/20 transition" />

                    <div>
                      {/* Status Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="bg-red-500/15 text-red-500 border border-red-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                          <Users size={12} className="text-purple-400" /> {room.listenersCount || 1}
                        </span>
                      </div>

                      {/* Topic / Category Tag */}
                      <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md inline-block mb-1.5">
                        {room.category || 'General Audio'}
                      </span>

                      {/* Space Title */}
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-purple-400 transition">
                        {room.title}
                      </h4>

                      {room.description && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                          {room.description}
                        </p>
                      )}
                    </div>

                    {/* Host Footer */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800/80">
                      <div className="flex items-center gap-2">
                        <UserAvatar src={room.hostPhoto} name={room.hostName} size="xs" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                            {room.hostName}
                          </span>
                          <span className="text-[9px] text-gray-400 uppercase tracking-wider">Host</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-purple-400 font-semibold group-hover:translate-x-0.5 transition">
                        <span>Join</span>
                        <Volume2 size={12} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Space Modal */}
      <CreateLiveSpaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        user={user}
        onRoomCreated={handleRoomCreated}
      />

      {/* Active Live Room Modal */}
      {activeRoomId && (
        <LiveRoomModal
          roomId={activeRoomId}
          user={user}
          userSettings={userSettings}
          onClose={() => setActiveRoomId(null)}
        />
      )}
    </div>
  );
}
