import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Mic, Volume2, Sliders, Music, Headphones, Radio,
  Sparkles, Check, Play, RefreshCw, AlertCircle, ShieldCheck
} from 'lucide-react';

interface AudioDeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
  selectedAudioInput: string;
  selectedAudioOutput: string;
  changeAudioInput: (deviceId: string) => Promise<void>;
  changeAudioOutput: (deviceId: string) => Promise<void>;
  studioAudioMode: boolean;
  toggleStudioAudioMode: () => Promise<void>;
  speakingVolume: number;
  inputGain: number;
  setInputGain: (gain: number) => void;
  isMonitoring: boolean;
  setIsMonitoring: (monitoring: boolean) => void;
  testSound: () => void;
  refreshAudioDevices: () => Promise<void>;
}

export default function AudioDeviceSettingsModal({
  isOpen,
  onClose,
  audioInputs,
  audioOutputs,
  selectedAudioInput,
  selectedAudioOutput,
  changeAudioInput,
  changeAudioOutput,
  studioAudioMode,
  toggleStudioAudioMode,
  speakingVolume,
  inputGain,
  setInputGain,
  isMonitoring,
  setIsMonitoring,
  testSound,
  refreshAudioDevices,
}: AudioDeviceSettingsModalProps) {
  const [isTestingSound, setIsTestingSound] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleTestSound = () => {
    setIsTestingSound(true);
    testSound();
    setTimeout(() => setIsTestingSound(false), 500);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAudioDevices();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  return createPortal(
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 cursor-pointer"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-white max-h-[90vh] cursor-default"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-800/80 bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-blue/20 text-brand-blue flex items-center justify-center border border-brand-blue/30">
                <Sliders size={20} />
              </div>
              <div>
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  Audio & Interface Settings
                  <span className="text-[10px] font-bold bg-brand-blue/20 text-blue-300 px-2 py-0.5 rounded-full border border-brand-blue/30">
                    PRO AUDIO
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  Configure hardware audio interfaces, monitors, and studio quality
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition"
              aria-label="Close audio settings"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            {/* 1. Pro Studio Audio Mode Toggle */}
            <div className={`p-4 rounded-2xl border transition ${
              studioAudioMode
                ? 'bg-blue-950/30 border-brand-blue/40'
                : 'bg-gray-800/40 border-gray-800'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Music size={16} className={studioAudioMode ? 'text-brand-blue' : 'text-gray-400'} />
                    <span className="font-bold text-sm text-white">
                      Studio High-Fidelity Mode (Raw Audio)
                    </span>
                    {studioAudioMode && (
                      <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        48kHz STEREO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Disables browser voice compression and noise gating. Sends uncolored full-frequency sound directly from your audio interface for studio XLR mics & live instruments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleStudioAudioMode}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 flex items-center ${
                    studioAudioMode ? 'bg-brand-blue' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition duration-200 ease-in-out ${
                      studioAudioMode ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 2. Audio Input / Interface Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Mic size={14} className="text-brand-blue" />
                  Audio Input Device (Microphone / Interface)
                </label>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-[11px] text-brand-blue hover:underline flex items-center gap-1 transition disabled:opacity-50 font-semibold"
                  title="Rescan connected audio devices"
                >
                  <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                  Rescan
                </button>
              </div>

              <select
                value={selectedAudioInput}
                onChange={(e) => changeAudioInput(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-brand-blue transition"
              >
                <option value="default">Default System Audio Input</option>
                {audioInputs.map((device, idx) => (
                  <option key={device.deviceId || idx} value={device.deviceId}>
                    {device.label || `Audio Interface / Input ${idx + 1}`}
                  </option>
                ))}
              </select>

              {/* Live VU Meter */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Input Level & Signal</span>
                  <span className="font-mono text-brand-blue font-bold">{speakingVolume}%</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full p-0.5 flex gap-0.5 overflow-hidden border border-gray-700/60">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const stepThreshold = (i / 24) * 100;
                    const isActive = speakingVolume >= stepThreshold;
                    const isPeak = i >= 20;
                    const isMid = i >= 14 && i < 20;

                    let colorClass = 'bg-emerald-500';
                    if (isPeak) colorClass = 'bg-red-500';
                    else if (isMid) colorClass = 'bg-amber-400';

                    return (
                      <div
                        key={i}
                        className={`flex-1 h-full rounded-sm transition-colors duration-75 ${
                          isActive ? colorClass : 'bg-gray-700/30'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Input Gain Slider */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Software Gain</span>
                  <span className="font-mono text-white">{Math.round(inputGain * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={inputGain}
                  onChange={(e) => setInputGain(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                />
              </div>

              {/* Direct Monitoring Toggle */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Headphones size={14} className="text-gray-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Mic Monitoring (Loopback)</div>
                    <div className="text-[10px] text-gray-400">Hear your input signal in your headphones</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMonitoring(!isMonitoring)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    isMonitoring ? 'bg-brand-blue text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {isMonitoring ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* 3. Audio Output Device (Monitors / Headphones) */}
            <div className="space-y-3 pt-4 border-t border-gray-800">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Volume2 size={14} className="text-brand-blue" />
                Audio Output Device (Speakers / Monitors)
              </label>

              <div className="flex gap-2">
                <select
                  value={selectedAudioOutput}
                  onChange={(e) => changeAudioOutput(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-brand-blue transition"
                >
                  <option value="default">Default System Audio Output</option>
                  {audioOutputs.map((device, idx) => (
                    <option key={device.deviceId || idx} value={device.deviceId}>
                      {device.label || `Studio Monitor / Output ${idx + 1}`}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleTestSound}
                  disabled={isTestingSound}
                  className="px-3.5 py-2.5 bg-gray-800 hover:bg-gray-700 text-blue-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border border-gray-700"
                  title="Play audio test cue"
                >
                  <Play size={13} className={isTestingSound ? 'text-emerald-400 animate-ping' : ''} />
                  Test
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800 bg-gray-900/80 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Done & Return to Space
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
