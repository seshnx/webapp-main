import React, { useState } from 'react';
import { 
  Building2, 
  Radio, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  QrCode, 
  Clock, 
  Mic2, 
  Sliders, 
  Volume2, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  UserCheck 
} from 'lucide-react';
import SeshNxLogo from '../../../assets/SeshNx-PNG cCropped white text.png';

interface StudioRoom {
  id: string;
  name: string;
  type: string;
  hourlyRate: number;
  gearHighlight: string;
  status: 'available' | 'occupied';
  activeSession?: {
    artist: string;
    engineer: string;
    project: string;
    startedAt: string;
    durationHours: number;
  };
}

const INITIAL_ROOMS: StudioRoom[] = [
  {
    id: 'room-a',
    name: 'Studio A • Live Tracking',
    type: 'Commercial Live Room (650 sq ft)',
    hourlyRate: 110,
    gearHighlight: 'SSL 4000E Console • Neumann U87 Ai • Pro Tools HDX • Burl Mothership',
    status: 'available'
  },
  {
    id: 'room-b',
    name: 'Studio B • Vocal Suite',
    type: 'Acoustic Vocal Booth (280 sq ft)',
    hourlyRate: 75,
    gearHighlight: 'Sony C800G • Avalon VT-737sp • Tube-Tech CL1B • Universal Audio Apollo x8p',
    status: 'occupied',
    activeSession: {
      artist: 'Aria Monroe',
      engineer: 'Marcus Cole (SeshNx Resident)',
      project: 'Single Vocal Master (IndieNx Advance Recoupment)',
      startedAt: '42 mins ago',
      durationHours: 3
    }
  },
  {
    id: 'room-c',
    name: 'Studio C • Dolby Atmos',
    type: 'Immersive Mastering Suite (520 sq ft)',
    hourlyRate: 135,
    gearHighlight: '7.1.4 Genelec SAM System • Grace Design m908 • Trinnov Room Correction',
    status: 'available'
  }
];

interface InteractiveStudioDemoProps {
  syncRoomId?: string;
  syncKioskStep?: number;
  onSyncChange?: (change: { selectedRoomId?: string; kioskStep?: number }) => void;
  isViewer?: boolean;
}

export default function InteractiveStudioDemo({
  syncRoomId,
  syncKioskStep,
  onSyncChange,
  isViewer = false
}: InteractiveStudioDemoProps = {}): JSX.Element {
  const [rooms, setRooms] = useState<StudioRoom[]>(INITIAL_ROOMS);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(syncRoomId || 'room-a');
  const [kioskStep, setKioskStep] = useState<number>(syncKioskStep || 0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Sync with incoming host updates
  React.useEffect(() => {
    if (syncRoomId && syncRoomId !== selectedRoomId) {
      setSelectedRoomId(syncRoomId);
    }
  }, [syncRoomId]);

  React.useEffect(() => {
    if (typeof syncKioskStep === 'number' && syncKioskStep !== kioskStep) {
      setKioskStep(syncKioskStep);
    }
  }, [syncKioskStep]);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    if (!isViewer && onSyncChange) {
      onSyncChange({ selectedRoomId: roomId });
    }
  };

  const handleSimulateKioskCheckIn = () => {
    setIsSimulating(true);
    setKioskStep(1);
    if (!isViewer && onSyncChange) {
      onSyncChange({ kioskStep: 1 });
    }

    setTimeout(() => {
      setKioskStep(2); // QR Code Verified
      if (!isViewer && onSyncChange) onSyncChange({ kioskStep: 2 });
      setTimeout(() => {
        setKioskStep(3); // Agreement Signed & Smart Lock Disengaged
        if (!isViewer && onSyncChange) onSyncChange({ kioskStep: 3 });
        setTimeout(() => {
          setKioskStep(4); // Session Live
          if (!isViewer && onSyncChange) onSyncChange({ kioskStep: 4 });
          setRooms(prev => prev.map(r => {
            if (r.id === selectedRoomId) {
              return {
                ...r,
                status: 'occupied',
                activeSession: {
                  artist: 'Devon Carter',
                  engineer: 'Certified Resident Engineer',
                  project: 'EP Session #2 • Direct to SeshNx Cloud',
                  startedAt: 'Just now',
                  durationHours: 4
                }
              };
            }
            return r;
          }));
          setIsSimulating(false);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  const handleReset = () => {
    setRooms(INITIAL_ROOMS);
    setKioskStep(0);
    setIsSimulating(false);
  };

  const toggleRoomStatus = (roomId: string) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const nextStatus = r.status === 'available' ? 'occupied' : 'available';
        return {
          ...r,
          status: nextStatus,
          activeSession: nextStatus === 'occupied' ? {
            artist: 'Guest Artist',
            engineer: 'Staff Engineer',
            project: 'Tracking Session',
            startedAt: 'Just now',
            durationHours: 2
          } : undefined
        };
      }
      return r;
    }));
  };

  return (
    <div className="w-full bg-[#1f2128] border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-2xl text-white">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-gray-700">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-brand-blue/10 text-brand-blue border border-brand-blue/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <img src={SeshNxLogo} alt="SeshNx" className="h-6 w-auto object-contain brightness-110" />
              <h4 className="font-bold text-xl sm:text-2xl text-white">Facility ERP & Walk-Up Kiosk</h4>
              <span className="px-3 py-1 text-xs font-mono rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                LIVE FACILITY SIMULATOR
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
              Interactive spatial room layout synced in real-time with subsidized hardware tablet kiosks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-gray-200 bg-[#2c2e36] hover:bg-gray-700 border border-gray-600 rounded-xl transition-all shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset State
          </button>
        </div>
      </div>

      {/* Main interactive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Spatial Room Layout (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#2c2e36] border border-gray-700 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-mono uppercase tracking-wider text-gray-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-ping" />
              Facility Floorplan • Level 1 Real-Time Telemetry
            </div>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-300 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500" /> Vacant
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-500/30 border border-red-500" /> On-Air
              </span>
            </div>
          </div>

          {/* SVG Floorplan Viewport */}
          <div className="relative w-full aspect-[16/10] min-h-[360px] bg-[#1a1d21] rounded-xl border border-gray-700 p-5 flex flex-col justify-between">
            {/* Grid background lines */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to right, #3D84ED 1px, transparent 1px), linear-gradient(to bottom, #3D84ED 1px, transparent 1px)',
                backgroundSize: '32px 32px'
              }}
            />

            {/* Top Row Rooms: Studio A & Studio B */}
            <div className="grid grid-cols-2 gap-5 relative z-10 flex-1 mb-5">
              {/* Room A Card in CAD */}
              <button
                type="button"
                onClick={() => handleSelectRoom('room-a')}
                className={`relative p-5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedRoomId === 'room-a' 
                    ? 'border-brand-blue shadow-[0_0_25px_rgba(61,132,237,0.35)] bg-brand-blue/20' 
                    : 'border-gray-700 bg-[#1f2128]/85 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-brand-blue uppercase tracking-wider font-bold">Suite 101</span>
                    <h5 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2 mt-0.5">
                      <Mic2 className="w-4 h-4 text-brand-blue" />
                      Studio A • Live Tracking
                    </h5>
                  </div>
                  <div className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 font-bold ${
                    rooms[0].status === 'available'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  }`}>
                    {rooms[0].status === 'available' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {rooms[0].status === 'available' ? 'VACANT' : 'ON-AIR'}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
                  <span className="font-mono text-white font-black text-base">${rooms[0].hourlyRate}/hr</span>
                  <span className="text-xs sm:text-sm text-gray-400">SSL 4000E • 650 sq ft</span>
                </div>
              </button>

              {/* Room B Card in CAD */}
              <button
                type="button"
                onClick={() => handleSelectRoom('room-b')}
                className={`relative p-5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedRoomId === 'room-b' 
                    ? 'border-brand-blue shadow-[0_0_25px_rgba(61,132,237,0.35)] bg-brand-blue/20' 
                    : 'border-gray-700 bg-[#1f2128]/85 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-purple-400 uppercase tracking-wider font-bold">Suite 102</span>
                    <h5 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2 mt-0.5">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      Studio B • Vocal Suite
                    </h5>
                  </div>
                  <div className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 font-bold ${
                    rooms[1].status === 'available'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  }`}>
                    {rooms[1].status === 'available' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {rooms[1].status === 'available' ? 'VACANT' : 'ON-AIR'}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
                  <span className="font-mono text-white font-black text-base">${rooms[1].hourlyRate}/hr</span>
                  <span className="text-xs sm:text-sm text-gray-400">Sony C800G • 280 sq ft</span>
                </div>
              </button>
            </div>

            {/* Bottom Row: Studio C & Kiosk Lobby */}
            <div className="grid grid-cols-3 gap-5 relative z-10">
              {/* Room C Card in CAD */}
              <button
                type="button"
                onClick={() => handleSelectRoom('room-c')}
                className={`col-span-2 relative p-5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedRoomId === 'room-c' 
                    ? 'border-brand-blue shadow-[0_0_25px_rgba(61,132,237,0.35)] bg-brand-blue/20' 
                    : 'border-gray-700 bg-[#1f2128]/85 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">Suite 103</span>
                    <h5 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2 mt-0.5">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      Studio C • Atmos Suite
                    </h5>
                  </div>
                  <div className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 font-bold ${
                    rooms[2].status === 'available'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  }`}>
                    {rooms[2].status === 'available' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {rooms[2].status === 'available' ? 'VACANT' : 'ON-AIR'}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
                  <span className="font-mono text-white font-black text-base">${rooms[2].hourlyRate}/hr</span>
                  <span className="text-xs sm:text-sm text-gray-400">7.1.4 Genelec Atmos • 520 sq ft</span>
                </div>
              </button>

              {/* Central Walk-Up Tablet Kiosk station */}
              <div className="relative p-4 rounded-xl border border-brand-blue/40 bg-brand-blue/15 flex flex-col items-center justify-center text-center shadow-md">
                <div className="p-2.5 rounded-full bg-brand-blue/20 text-brand-blue mb-1.5 animate-pulse">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-white">Kiosk Station #1</span>
                <span className="text-xs text-brand-blue font-mono font-semibold">Subsidized Tablet ($150)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-300 border-t border-gray-700/80 pt-4">
            <span>Click any room box above to inspect specs or simulate access</span>
            <button
              onClick={() => toggleRoomStatus(selectedRoomId)}
              className="text-brand-blue hover:underline font-semibold"
            >
              Toggle {selectedRoom.name} Status Manually
            </button>
          </div>
        </div>

        {/* Right Column: Selected Room Details & Kiosk Simulation (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#2c2e36] border border-gray-700 rounded-2xl p-6">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-700">
              <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-gray-300 font-bold">Room Telemetry</span>
              <span className={`px-3 py-1 text-xs sm:text-sm font-mono rounded font-bold ${
                selectedRoom.status === 'available'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {selectedRoom.status === 'available' ? 'AVAILABLE NOW' : 'ACTIVE SESSION'}
              </span>
            </div>

            <div className="my-5 space-y-4">
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-white">{selectedRoom.name}</h4>
                <p className="text-sm text-gray-300 mt-0.5">{selectedRoom.type}</p>
              </div>

              <div className="p-4 sm:p-5 bg-[#1f2128] border border-gray-700 rounded-xl space-y-2.5 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span className="text-gray-400">Hourly Rate:</span>
                  <span className="font-mono font-bold text-emerald-400">${selectedRoom.hourlyRate}.00 / hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lock Relay:</span>
                  <span className="font-mono text-brand-blue font-bold">
                    {selectedRoom.status === 'available' ? 'Secured (Smart Lock Armed)' : 'Authorized Access Active'}
                  </span>
                </div>
                <div className="pt-1">
                  <span className="text-gray-400 block mb-1 font-medium">Signal Chain:</span>
                  <span className="text-gray-200 font-mono text-xs sm:text-sm leading-relaxed block bg-[#1a1d21] p-2.5 rounded-lg border border-gray-700">
                    {selectedRoom.gearHighlight}
                  </span>
                </div>
              </div>

              {/* Active Session Info or Empty State */}
              {selectedRoom.activeSession ? (
                <div className="p-4 sm:p-5 bg-red-950/30 border border-red-500/40 rounded-xl text-sm space-y-2">
                  <div className="flex items-center gap-2 text-red-400 font-bold">
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>Live Tracking Lineage</span>
                  </div>
                  <div className="text-gray-200">
                    <span className="text-gray-400">Artist:</span> {selectedRoom.activeSession.artist}
                  </div>
                  <div className="text-gray-200">
                    <span className="text-gray-400">Engineer:</span> {selectedRoom.activeSession.engineer}
                  </div>
                  <div className="text-gray-200">
                    <span className="text-gray-400">Focus:</span> {selectedRoom.activeSession.project}
                  </div>
                  <div className="text-emerald-400 text-xs sm:text-sm font-mono pt-1 font-semibold">
                    ✓ Cloud session stems syncing directly to SeshNx Vault
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 bg-emerald-950/25 border border-emerald-500/35 rounded-xl text-sm space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ready for Walk-Up Check-In</span>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    No active booking. Walk-up artist can scan QR at tablet kiosk to unlock room instantly.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Kiosk Workflow Interactive Simulator */}
          <div className="border-t border-gray-700 pt-5 mt-2">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-brand-blue" />
                Trojan Horse Kiosk Simulation
              </span>
              {kioskStep > 0 && (
                <span className="text-xs sm:text-sm font-mono text-brand-blue font-bold">
                  Step {kioskStep} of 4
                </span>
              )}
            </div>

            {/* Interactive simulation progression */}
            {kioskStep > 0 && (
              <div className="mb-4 space-y-2.5">
                <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 border transition-all ${
                  kioskStep >= 1 ? 'bg-brand-blue/20 border-brand-blue text-white font-medium' : 'bg-[#1f2128] border-gray-700 text-gray-400'
                }`}>
                  <UserCheck className="w-4 h-4 text-brand-blue shrink-0" />
                  <span>1. Artist Scans SeshNx QR Pass on Subsidized Tablet</span>
                </div>
                <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 border transition-all ${
                  kioskStep >= 2 ? 'bg-brand-blue/20 border-brand-blue text-white font-medium' : 'bg-[#1f2128] border-gray-700 text-gray-400'
                }`}>
                  <Clock className="w-4 h-4 text-brand-blue shrink-0" />
                  <span>2. Digital Session Liability & Split Sheet Pre-Signed</span>
                </div>
                <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 border transition-all ${
                  kioskStep >= 3 ? 'bg-purple-500/20 border-purple-500 text-white font-medium' : 'bg-[#1f2128] border-gray-700 text-gray-400'
                }`}>
                  <Unlock className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>3. Hardware Relay Unlocked • Resident Engineer Paged</span>
                </div>
                {kioskStep >= 4 && (
                  <div className="p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-medium">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>4. Session Live • 5% GMV Fee & Cloud Stems Captured!</span>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              disabled={isSimulating}
              onClick={handleSimulateKioskCheckIn}
              className={`w-full py-3.5 sm:py-4 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                isSimulating 
                  ? 'bg-brand-blue/50 cursor-wait text-gray-200' 
                  : 'bg-gradient-to-r from-brand-blue to-brand-dark-accent hover:from-blue-500 hover:to-blue-600 text-white shadow-brand-blue/30'
              }`}
            >
              {isSimulating ? (
                <>Processing Hardware Kiosk Protocol...</>
              ) : (
                <>
                  <span>Simulate Walk-Up Kiosk Check-In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2.5">
              Demonstrating the $150 hardware subsidy converting offline studios into SeshNx software nodes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
