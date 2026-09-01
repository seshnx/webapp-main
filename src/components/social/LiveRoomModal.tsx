import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Mic,
  MicOff,
  Hand,
  MessageSquare,
  Users,
  X,
  Volume2,
  Share2,
  DollarSign,
  Crown,
  Shield,
  Radio,
  Minimize2,
  Maximize2,
  ChevronUp,
  ChevronDown,
  UserPlus,
  UserMinus,
  Sparkles,
  Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from '../shared/UserAvatar';
import TipModal from './TipModal.tsx';
import AudioDeviceSettingsModal from './AudioDeviceSettingsModal';
import {
  useLiveRoom,
  useLiveRoomParticipants,
  useLiveRoomMessages,
  useJoinLiveRoom,
  useLeaveLiveRoom,
  useLiveRoomHeartbeat,
  useToggleLiveRoomMute,
  useRaiseLiveRoomHand,
  useLowerLiveRoomHand,
  useApproveLiveRoomSpeaker,
  useDemoteLiveRoomSpeaker,
  useSendLiveRoomMessage,
  useEndLiveRoom,
} from '../../hooks/useConvex';
import { useAuth } from '@clerk/react';
import { useLiveSpaceAudio } from '../../hooks/useLiveSpaceAudio';
import type { Id } from '../../../convex/_generated/dataModel';

interface LiveRoomModalProps {
  roomId: Id<'liveRooms'>;
  user: any;
  userSettings?: any;
  onClose: () => void;
}

export default function LiveRoomModal({
  roomId,
  user,
  userSettings,
  onClose,
}: LiveRoomModalProps) {
  const { userId: authClerkId } = useAuth();
  const clerkId = authClerkId || user?.id || user?.uid || user?.clerkId || '';
  
  const [chatMessage, setChatMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [selectedTipUser, setSelectedTipUser] = useState<any>(null);
  const [showAudienceChat, setShowAudienceChat] = useState(true);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const room = useLiveRoom(roomId);
  const participants = useLiveRoomParticipants(roomId) || [];
  const messages = useLiveRoomMessages(roomId) || [];

  const joinRoomMutation = useJoinLiveRoom();
  const leaveRoomMutation = useLeaveLiveRoom();
  const heartbeatMutation = useLiveRoomHeartbeat();
  const toggleMuteMutation = useToggleLiveRoomMute();
  const raiseHandMutation = useRaiseLiveRoomHand();
  const lowerHandMutation = useLowerLiveRoomHand();
  const approveSpeakerMutation = useApproveLiveRoomSpeaker();
  const demoteSpeakerMutation = useDemoteLiveRoomSpeaker();
  const sendMessageMutation = useSendLiveRoomMessage();
  const endRoomMutation = useEndLiveRoom();

  // Current participant data
  const currentParticipant = participants.find((p) => p.clerkId === clerkId);
  const isHost = currentParticipant?.role === 'host' || room?.hostId === user?._id;
  const isSpeaker = currentParticipant?.role === 'speaker' || isHost;
  const isMuted = currentParticipant?.isMuted ?? (userSettings?.social?.autoMuteMicOnJoin !== false);
  const hasHandRaised = currentParticipant?.handRaised ?? false;

  useEffect(() => {
    console.log(
      `%c[LiveRoomModal] Room State Changed%c: roomId=${roomId}, clerkId=${clerkId}, role=${currentParticipant?.role || 'pending'}, isSpeaker=${isSpeaker}, isMuted=${isMuted}, participantsCount=${participants.length}`,
      'background: #2563eb; color: #fff; padding: 2px 5px; border-radius: 3px; font-weight: bold;',
      'color: #93c5fd;'
    );
  }, [roomId, clerkId, currentParticipant?.role, isSpeaker, isMuted, participants.length]);

  // Real WebRTC Audio Hook with Device & Interface Manager
  const {
    isSpeaking,
    speakingVolume,
    remoteSpeakingUsers,
    permissionError,
    audioInputs,
    audioOutputs,
    selectedAudioInput,
    selectedAudioOutput,
    changeAudioInput,
    changeAudioOutput,
    studioAudioMode,
    toggleStudioAudioMode,
    inputGain,
    setInputGain,
    isMonitoring,
    setIsMonitoring,
    testSound,
    refreshAudioDevices,
  } = useLiveSpaceAudio({
    roomId,
    currentClerkId: clerkId,
    isSpeaker,
    isMuted,
    participants,
  });

  // 1. Join room on mount, leave on unmount
  useEffect(() => {
    if (!clerkId || !roomId) return;
    console.log(`%c[LiveRoomModal] Joining room ${roomId} as ${clerkId}`, 'color: #34d399; font-weight: bold;');

    joinRoomMutation({
      roomId,
      clerkId,
      autoMute: userSettings?.social?.autoMuteMicOnJoin !== false,
    }).catch((err) => console.warn('[LiveRoomModal] Join room error:', err));

    return () => {
      console.log(`%c[LiveRoomModal] Leaving room ${roomId}`, 'color: #f87171; font-weight: bold;');
      leaveRoomMutation({
        roomId,
        clerkId,
      }).catch(() => {});
    };
  }, [roomId, clerkId]);

  // 2. Heartbeat interval every 30 seconds
  useEffect(() => {
    if (!clerkId || !roomId) return;

    const interval = setInterval(() => {
      heartbeatMutation({
        roomId,
        clerkId,
      }).catch(() => {});
    }, 30_000);

    return () => clearInterval(interval);
  }, [roomId, clerkId]);

  // 3. Auto-scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Handle Send Chat
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatMessage.trim() || !clerkId) return;

    const text = chatMessage.trim();
    setChatMessage('');
    try {
      await sendMessageMutation({
        roomId,
        clerkId,
        text,
      });
    } catch (err) {
      console.warn('Failed to send room chat:', err);
    }
  };

  // Handle Mute Toggle
  const handleToggleMute = async () => {
    if (!clerkId) return;
    try {
      await toggleMuteMutation({
        roomId,
        clerkId,
        isMuted: !isMuted,
      });
    } catch (err) {
      console.warn('Toggle mute error:', err);
    }
  };

  // Handle Hand Raise Toggle
  const handleToggleHand = async () => {
    if (!clerkId) return;
    try {
      if (hasHandRaised) {
        await lowerHandMutation({ roomId, clerkId });
      } else {
        await raiseHandMutation({ roomId, clerkId });
      }
    } catch (err) {
      console.warn('Hand raise error:', err);
    }
  };

  // Handle Host Ending Space
  const handleEndRoom = async () => {
    if (window.confirm('Are you sure you want to end this Live Space for everyone?')) {
      try {
        await endRoomMutation({ roomId });
        onClose();
      } catch (err) {
        console.warn('End room error:', err);
      }
    }
  };

  // Speakers & Listeners Lists
  const speakers = participants.filter((p) => p.role === 'host' || p.role === 'speaker');
  const listeners = participants.filter((p) => p.role === 'listener');
  const handRaisers = listeners.filter((p) => p.handRaised);

  // If room was ended by host or inactive, prompt close
  if (room && !room.isLive) {
    if (typeof document === 'undefined') return null;
    return createPortal(
      <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 max-w-sm w-full text-center text-white shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
            <Radio size={24} />
          </div>
          <h3 className="font-bold text-base mb-1">Live Space Ended</h3>
          <p className="text-xs text-gray-400 mb-5">
            This live audio session has concluded or timed out due to inactivity.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition"
          >
            Back to Feed
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // Minimized Floating Audio Dock
  if (isMinimized) {
    if (typeof document === 'undefined') return null;
    return createPortal(
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-24 right-4 sm:bottom-6 sm:right-24 z-[99990] bg-gray-900/95 backdrop-blur-xl border border-brand-blue/30 text-white rounded-2xl p-3 shadow-2xl flex items-center gap-3 w-80 sm:w-96"
      >
        <div className="relative">
          <UserAvatar src={room?.hostPhoto} name={room?.hostName || 'Host'} size="sm" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black bg-red-500 text-white px-1.5 py-0.2 rounded-full">
              LIVE
            </span>
            <span className="text-xs font-bold truncate">{room?.title || 'Live Space'}</span>
          </div>
          <p className="text-[10px] text-gray-400 truncate">
            {speakers.length} speakers • {participants.length} listening
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {isSpeaker && (
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl text-xs transition ${
                isMuted ? 'bg-gray-800 text-gray-400' : 'bg-emerald-500 text-white'
              }`}
            >
              {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
          )}

          <button
            onClick={() => setIsMinimized(false)}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition"
            title="Maximize"
          >
            <Maximize2 size={14} />
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition"
            title="Leave"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>,
      document.body
    );
  }

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-4xl h-[92vh] sm:h-[88vh] bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950 text-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-brand-blue/20 flex flex-col justify-between relative overflow-hidden"
        >
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-brand-blue/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Top Header */}
          <div className="flex items-start justify-between border-b border-gray-800 pb-3 sm:pb-4 gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE SPACE
                </span>
                <span className="text-[10px] font-semibold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-md">
                  {room?.category || 'Audio Session'}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Users size={12} className="text-brand-blue" /> {participants.length} in space
                </span>
              </div>
              <h3 className="font-bold text-base sm:text-lg text-white truncate">{room?.title}</h3>
              {room?.description && (
                <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{room.description}</p>
              )}
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition"
                title="Minimize Space"
              >
                <Minimize2 size={16} />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Main Stage & Chat Container */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 my-3 sm:my-4 overflow-hidden min-h-0">
            {/* Stage Left (Speakers & Audience) */}
            <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-1">
              {/* Host & Speakers Stage */}
              <div className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800/80">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Mic size={14} className="text-emerald-400" /> Stage Speakers ({speakers.length})
                  </h4>
                  {isSpeaker && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Mic Active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
                  {speakers.map((spk) => {
                    const isSpkSpeaking =
                      spk.clerkId === clerkId
                        ? isSpeaking
                        : (remoteSpeakingUsers[spk.clerkId] ?? false);
                    return (
                      <div key={spk._id} className="flex flex-col items-center gap-1.5 relative group">
                        <div
                          className={`relative p-1 rounded-full transition-all duration-200 ${
                            isSpkSpeaking
                              ? 'ring-4 ring-emerald-500 shadow-lg shadow-emerald-500/30'
                              : 'ring-2 ring-brand-blue/40'
                          }`}
                        >
                          <UserAvatar src={spk.avatarUrl} name={spk.name} size="lg" />

                          {/* Host Crown */}
                          {spk.role === 'host' && (
                            <div className="absolute -top-1 -right-1 bg-amber-500 text-black p-1 rounded-full shadow-md">
                              <Crown size={10} />
                            </div>
                          )}

                          {/* Mic Indicator Badge */}
                          <div
                            className={`absolute bottom-0 right-0 p-1 rounded-full text-white shadow-md ${
                              spk.isMuted ? 'bg-gray-700' : 'bg-emerald-500'
                            }`}
                          >
                            {spk.isMuted ? <MicOff size={10} /> : <Mic size={10} />}
                          </div>
                        </div>

                        <span className="text-xs font-semibold text-center truncate w-24 text-gray-200">
                          {spk.name}
                        </span>

                        <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">
                          {spk.role === 'host' ? 'Host' : 'Speaker'}
                        </span>

                        {/* Host Demote Button */}
                        {isHost && spk.role === 'speaker' && (
                          <button
                            onClick={() =>
                              demoteSpeakerMutation({
                                roomId,
                                targetClerkId: spk.clerkId,
                              })
                            }
                            className="hidden group-hover:flex items-center gap-1 text-[9px] text-rose-400 hover:text-rose-300 font-semibold mt-0.5"
                          >
                            <UserMinus size={10} /> Move to Listeners
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hand-Raise Approval Queue (Host View) */}
              {isHost && handRaisers.length > 0 && (
                <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-3.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Hand size={14} className="text-amber-400" />
                      Speaking Requests ({handRaisers.length})
                    </h5>
                  </div>

                  <div className="space-y-2">
                    {handRaisers.map((hr) => (
                      <div
                        key={hr._id}
                        className="flex items-center justify-between bg-gray-900/80 rounded-xl p-2 px-3 border border-purple-500/20"
                      >
                        <div className="flex items-center gap-2">
                          <UserAvatar src={hr.avatarUrl} name={hr.name} size="xs" />
                          <span className="text-xs font-semibold text-gray-200">{hr.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              approveSpeakerMutation({
                                roomId,
                                targetClerkId: hr.clerkId,
                              })
                            }
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                          >
                            <UserPlus size={12} /> Make Speaker
                          </button>
                          <button
                            onClick={() =>
                              lowerHandMutation({
                                roomId,
                                clerkId: hr.clerkId,
                              })
                            }
                            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 text-[11px] font-semibold rounded-lg transition"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audience / Listeners Section */}
              <div className="bg-gray-900/40 rounded-2xl p-4 border border-gray-800/60 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={14} /> Audience Listeners ({listeners.length})
                  </h4>
                </div>

                {listeners.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-500">
                    No listeners in the audience yet. Share the space to invite peers!
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {listeners.map((lst) => (
                      <div key={lst._id} className="flex flex-col items-center gap-1 relative">
                        <div className="relative">
                          <UserAvatar src={lst.avatarUrl} name={lst.name} size="md" />
                          {lst.handRaised && (
                            <div className="absolute -top-1 -right-1 bg-amber-500 text-black p-1 rounded-full animate-bounce shadow-md">
                              <Hand size={10} />
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-center truncate w-16 text-gray-300">
                          {lst.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stage Right: Real-Time Live Audience Chat */}
            <div className="bg-gray-950/80 rounded-2xl p-3.5 border border-gray-800 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800 mb-2">
                <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-purple-400" /> Space Chat ({messages.length})
                </h4>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px]">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-500 italic">
                    Say hello to the audience! Messages are real-time.
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m._id} className="text-xs flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-purple-400">{m.senderName}:</span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-200 pl-1 break-words">{m.text}</p>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 mt-3 pt-2.5 border-t border-gray-800">
                <input
                  type="text"
                  placeholder="Send a message to live audience..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  maxLength={160}
                  className="flex-1 bg-gray-900 border border-gray-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition"
                />
                <button
                  type="submit"
                  disabled={!chatMessage.trim()}
                  className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Send size={12} />
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-800 gap-2 flex-wrap">
            {/* Left: Mic / Hand / Audio Settings controls */}
            <div className="flex items-center gap-2">
              {isSpeaker ? (
                <button
                  onClick={handleToggleMute}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition ${
                    isMuted
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-emerald-500 text-white shadow-emerald-500/20'
                  }`}
                >
                  {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                  <span>{isMuted ? 'Muted' : 'Speaking'}</span>
                </button>
              ) : (
                <button
                  onClick={handleToggleHand}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition ${
                    hasHandRaised
                      ? 'bg-amber-500 text-black shadow-amber-500/20'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Hand size={16} />
                  <span>{hasHandRaised ? 'Hand Raised' : 'Request to Speak'}</span>
                </button>
              )}

              {/* Audio Interface & Settings Manager Button */}
              <button
                onClick={() => setIsAudioSettingsOpen(true)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs shadow-md transition border ${
                  studioAudioMode
                    ? 'bg-purple-950/60 border-purple-500/40 text-purple-300 hover:bg-purple-900/60'
                    : 'bg-gray-800 border-gray-700/60 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                title="Audio Interfaces, Inputs, Outputs & Studio Mode"
              >
                <Volume2 size={15} />
                <span className="hidden sm:inline">Audio Settings</span>
                {studioAudioMode && (
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" title="Pro Studio Audio Active" />
                )}
              </button>
            </div>

            {/* Right: Tip & Leave / End */}
            <div className="flex items-center gap-2">
              {/* Tip Creator Button */}
              <button
                onClick={() => {
                  setSelectedTipUser({
                    userId: room?.hostId,
                    name: room?.hostName,
                    avatar: room?.hostPhoto,
                  });
                  setIsTipModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                <DollarSign size={15} />
                <span>Tip Host</span>
              </button>

              {/* Leave or End Button */}
              {isHost ? (
                <button
                  onClick={handleEndRoom}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-red-600/20"
                >
                  End Space
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white font-bold rounded-xl text-xs transition"
                >
                  Leave Space
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tip Modal */}
        {isTipModalOpen && selectedTipUser && (
          <TipModal
            creatorName={selectedTipUser.name || 'Host'}
            creatorPhoto={selectedTipUser.avatar}
            creatorUserId={selectedTipUser.userId}
            currentUser={user}
            onClose={() => setIsTipModalOpen(false)}
          />
        )}

        {/* Audio Interface & Device Settings Modal */}
        {isAudioSettingsOpen && (
          <AudioDeviceSettingsModal
            isOpen={isAudioSettingsOpen}
            onClose={() => setIsAudioSettingsOpen(false)}
            audioInputs={audioInputs}
            audioOutputs={audioOutputs}
            selectedAudioInput={selectedAudioInput}
            selectedAudioOutput={selectedAudioOutput}
            changeAudioInput={changeAudioInput}
            changeAudioOutput={changeAudioOutput}
            studioAudioMode={studioAudioMode}
            toggleStudioAudioMode={toggleStudioAudioMode}
            speakingVolume={speakingVolume}
            inputGain={inputGain}
            setInputGain={setInputGain}
            isMonitoring={isMonitoring}
            setIsMonitoring={setIsMonitoring}
            testSound={testSound}
            refreshAudioDevices={refreshAudioDevices}
          />
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
