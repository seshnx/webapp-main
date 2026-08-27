import { useEffect, useRef, useState, useCallback } from 'react';
import { useLiveRoomSignals, useSendLiveRoomSignal } from './useConvex';
import type { Id } from '../../convex/_generated/dataModel';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

const STORAGE_INPUT_KEY = 'seshnx_audio_input_device';
const STORAGE_OUTPUT_KEY = 'seshnx_audio_output_device';
const STORAGE_STUDIO_MODE_KEY = 'seshnx_studio_audio_mode';

interface UseLiveSpaceAudioProps {
  roomId: Id<'liveRooms'>;
  currentClerkId: string;
  isSpeaker: boolean;
  isMuted: boolean;
  participants: Array<{ clerkId: string; role: string }>;
}

export function useLiveSpaceAudio({
  roomId,
  currentClerkId,
  isSpeaker,
  isMuted,
  participants,
}: UseLiveSpaceAudioProps) {
  const [localAudioStream, setLocalAudioStream] = useState<MediaStream | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingVolume, setSpeakingVolume] = useState(0); // 0 to 100
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Audio Device Manager State
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>(() => {
    return localStorage.getItem(STORAGE_INPUT_KEY) || 'default';
  });
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>(() => {
    return localStorage.getItem(STORAGE_OUTPUT_KEY) || 'default';
  });
  const [studioAudioMode, setStudioAudioMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_STUDIO_MODE_KEY) === 'true';
  });
  const [inputGain, setInputGain] = useState<number>(1.0); // 0.0 to 2.0
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteAudioElements = useRef<Map<string, HTMLAudioElement>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const monitorNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const processedSignals = useRef<Set<string>>(new Set());

  const sendSignalMutation = useSendLiveRoomSignal();
  const incomingSignals = useLiveRoomSignals(roomId, currentClerkId);

  // Enumerate all available audio input/output devices
  const refreshAudioDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((d) => d.kind === 'audioinput');
      const outputs = devices.filter((d) => d.kind === 'audiooutput');

      setAudioInputs(inputs);
      setAudioOutputs(outputs);

      // Validate selected devices exist
      if (selectedAudioInput !== 'default' && !inputs.some((d) => d.deviceId === selectedAudioInput)) {
        if (inputs.length > 0) setSelectedAudioInput(inputs[0].deviceId);
      }
      if (selectedAudioOutput !== 'default' && !outputs.some((d) => d.deviceId === selectedAudioOutput)) {
        if (outputs.length > 0) setSelectedAudioOutput(outputs[0].deviceId);
      }
    } catch (e) {
      console.warn('Error enumerating audio devices:', e);
    }
  }, [selectedAudioInput, selectedAudioOutput]);

  // Listen for device changes (e.g. plugging in Scarlett/Apollo interface or USB headset)
  useEffect(() => {
    refreshAudioDevices();
    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', refreshAudioDevices);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', refreshAudioDevices);
      };
    }
  }, [refreshAudioDevices]);

  // Create stream constraints based on selected device and pro studio mode
  const getAudioConstraints = useCallback((): MediaTrackConstraints => {
    const base: MediaTrackConstraints = {};

    if (selectedAudioInput && selectedAudioInput !== 'default') {
      base.deviceId = { exact: selectedAudioInput };
    }

    if (studioAudioMode) {
      // Pro Studio Mode: Raw full-frequency audio for XLR/Interfaces/Instruments
      return {
        ...base,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: { ideal: 2 },
        sampleRate: { ideal: 48000 },
        sampleSize: { ideal: 16 },
      };
    }

    // Voice Communication Mode: Standard WebRTC AEC/NS
    return {
      ...base,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: { ideal: 1 },
      sampleRate: { ideal: 48000 },
    };
  }, [selectedAudioInput, studioAudioMode]);

  // 1. Manage local microphone stream for speakers
  useEffect(() => {
    let active = true;

    async function initMicrophone() {
      if (!isSpeaker) {
        if (localAudioStream) {
          localAudioStream.getTracks().forEach((t) => t.stop());
          setLocalAudioStream(null);
        }
        return;
      }

      try {
        const constraints = getAudioConstraints();
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: constraints,
          video: false,
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        // Apply initial mute state
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !isMuted;
        });

        setLocalAudioStream(stream);
        setPermissionError(null);
        refreshAudioDevices();

        // Setup AudioContext with GainNode & AnalyserNode
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;

            const source = ctx.createMediaStreamSource(stream);
            
            // Gain control
            const gainNode = ctx.createGain();
            gainNode.gain.value = inputGain;
            gainNodeRef.current = gainNode;

            // Direct Monitor Node
            const monitorNode = ctx.createGain();
            monitorNode.gain.value = isMonitoring ? 1.0 : 0.0;
            monitorNodeRef.current = monitorNode;

            // Analyser for volume metering
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.4;
            analyserRef.current = analyser;

            source.connect(gainNode);
            gainNode.connect(analyser);
            gainNode.connect(monitorNode);
            monitorNode.connect(ctx.destination);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const analyzeAudio = () => {
              if (!analyserRef.current || !active) return;
              analyserRef.current.getByteFrequencyData(dataArray);

              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              const average = sum / bufferLength;
              const normalizedVolume = Math.min(100, Math.round((average / 128) * 100));

              setSpeakingVolume(normalizedVolume);
              setIsSpeaking(normalizedVolume > 8 && !isMuted);

              animationFrameRef.current = requestAnimationFrame(analyzeAudio);
            };

            analyzeAudio();
          }
        } catch (audioErr) {
          console.warn('AudioContext volume meter setup failed:', audioErr);
        }
      } catch (err: any) {
        console.error('Microphone access error:', err);
        setPermissionError(err.message || 'Microphone access denied');
      }
    }

    initMicrophone();

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isSpeaker, selectedAudioInput, studioAudioMode]);

  // Handle Input Gain changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = inputGain;
    }
  }, [inputGain]);

  // Handle Direct Monitoring changes
  useEffect(() => {
    if (monitorNodeRef.current) {
      monitorNodeRef.current.gain.value = isMonitoring ? 1.0 : 0.0;
    }
  }, [isMonitoring]);

  // 2. Handle mute/unmute state changes
  useEffect(() => {
    if (localAudioStream) {
      localAudioStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
      if (isMuted) {
        setIsSpeaking(false);
        setSpeakingVolume(0);
      }
    }
  }, [isMuted, localAudioStream]);

  // 3. Helper to create or get PeerConnection
  const getOrCreatePeerConnection = useCallback(
    (targetClerkId: string): RTCPeerConnection => {
      let pc = peerConnections.current.get(targetClerkId);
      if (!pc || pc.connectionState === 'closed') {
        pc = new RTCPeerConnection(ICE_SERVERS);

        // Add local audio tracks if we are a speaker
        if (localAudioStream) {
          localAudioStream.getAudioTracks().forEach((track) => {
            pc!.addTrack(track, localAudioStream);
          });
        }

        // Send local ICE candidates via Convex
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            sendSignalMutation({
              roomId,
              senderClerkId: currentClerkId,
              targetClerkId,
              type: 'ice-candidate',
              payload: JSON.stringify(event.candidate),
            }).catch(() => {});
          }
        };

        // Handle incoming remote audio tracks
        pc.ontrack = (event) => {
          const remoteStream = event.streams[0] || new MediaStream([event.track]);
          let audioEl = remoteAudioElements.current.get(targetClerkId);
          if (!audioEl) {
            audioEl = document.createElement('audio');
            audioEl.autoplay = true;
            audioEl.id = `live-space-audio-${targetClerkId}`;
            document.body.appendChild(audioEl);
            remoteAudioElements.current.set(targetClerkId, audioEl);
          }
          audioEl.srcObject = remoteStream;

          // Apply selected audio output sink if supported
          if (selectedAudioOutput && selectedAudioOutput !== 'default' && (audioEl as any).setSinkId) {
            (audioEl as any).setSinkId(selectedAudioOutput).catch((err: any) => {
              console.warn('Failed to set audio sink ID:', err);
            });
          }

          audioEl.play().catch(() => {});
        };

        peerConnections.current.set(targetClerkId, pc);
      }
      return pc;
    },
    [localAudioStream, roomId, currentClerkId, sendSignalMutation, selectedAudioOutput]
  );

  // 4. Switch audio input device without dropping peers
  const changeAudioInput = useCallback(
    async (deviceId: string) => {
      setSelectedAudioInput(deviceId);
      localStorage.setItem(STORAGE_INPUT_KEY, deviceId);

      if (!isSpeaker) return;

      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            ...getAudioConstraints(),
            deviceId: deviceId !== 'default' ? { exact: deviceId } : undefined,
          },
          video: false,
        });

        const newAudioTrack = newStream.getAudioTracks()[0];
        if (newAudioTrack) {
          newAudioTrack.enabled = !isMuted;

          // Seamlessly hot-swap track across all existing WebRTC connections
          peerConnections.current.forEach((pc) => {
            pc.getSenders().forEach((sender) => {
              if (sender.track && sender.track.kind === 'audio') {
                sender.replaceTrack(newAudioTrack).catch(console.error);
              }
            });
          });

          // Stop old track
          if (localAudioStream) {
            localAudioStream.getTracks().forEach((t) => t.stop());
          }
          setLocalAudioStream(newStream);
        }
      } catch (err) {
        console.error('Error switching audio input interface:', err);
      }
    },
    [isSpeaker, isMuted, getAudioConstraints, localAudioStream]
  );

  // 5. Switch audio output device (e.g. Scarlett Out, Headphone Out, Studio Monitors)
  const changeAudioOutput = useCallback(
    async (deviceId: string) => {
      setSelectedAudioOutput(deviceId);
      localStorage.setItem(STORAGE_OUTPUT_KEY, deviceId);

      remoteAudioElements.current.forEach((audioEl) => {
        if ((audioEl as any).setSinkId) {
          (audioEl as any).setSinkId(deviceId !== 'default' ? deviceId : '').catch((err: any) => {
            console.warn('Failed to route audio to selected device:', err);
          });
        }
      });
    },
    []
  );

  // 6. Toggle Pro Studio Audio Mode (48kHz Uncompressed / Zero Voice Gating)
  const toggleStudioAudioMode = useCallback(async () => {
    const nextMode = !studioAudioMode;
    setStudioAudioMode(nextMode);
    localStorage.setItem(STORAGE_STUDIO_MODE_KEY, String(nextMode));
  }, [studioAudioMode]);

  // 7. Output test chime for audio interface / monitor testing
  const testSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.warn('Audio test chime failed:', e);
    }
  }, []);

  // 8. Initiate WebRTC Offers to all other participants when speaker stream is ready
  useEffect(() => {
    if (!isSpeaker || !localAudioStream || !participants) return;

    participants.forEach(async (p) => {
      if (p.clerkId === currentClerkId) return;

      try {
        const pc = getOrCreatePeerConnection(p.clerkId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        await sendSignalMutation({
          roomId,
          senderClerkId: currentClerkId,
          targetClerkId: p.clerkId,
          type: 'offer',
          payload: JSON.stringify(offer),
        });
      } catch (err) {
        console.warn(`WebRTC offer creation failed for ${p.clerkId}:`, err);
      }
    });
  }, [isSpeaker, localAudioStream, participants, currentClerkId, roomId, getOrCreatePeerConnection, sendSignalMutation]);

  // 9. Process incoming WebRTC signals
  useEffect(() => {
    if (!incomingSignals) return;

    incomingSignals.forEach(async (sig: any) => {
      const signalId = `${sig._id || sig.createdAt}-${sig.senderClerkId}-${sig.type}`;
      if (processedSignals.current.has(signalId)) return;
      processedSignals.current.add(signalId);

      const senderId = sig.senderClerkId;
      const pc = getOrCreatePeerConnection(senderId);

      try {
        if (sig.type === 'offer') {
          const offer = JSON.parse(sig.payload);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          await sendSignalMutation({
            roomId,
            senderClerkId: currentClerkId,
            targetClerkId: senderId,
            type: 'answer',
            payload: JSON.stringify(answer),
          });
        } else if (sig.type === 'answer') {
          const answer = JSON.parse(sig.payload);
          if (pc.signalingState !== 'stable') {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          }
        } else if (sig.type === 'ice-candidate') {
          const candidate = JSON.parse(sig.payload);
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }
      } catch (err) {
        console.warn(`Failed to process WebRTC signal (${sig.type}) from ${senderId}:`, err);
      }
    });
  }, [incomingSignals, getOrCreatePeerConnection, currentClerkId, roomId, sendSignalMutation]);

  // 10. Cleanup on unmount or room leave
  useEffect(() => {
    return () => {
      if (localAudioStream) {
        localAudioStream.getTracks().forEach((t) => t.stop());
      }
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();

      remoteAudioElements.current.forEach((el) => {
        el.srcObject = null;
        el.remove();
      });
      remoteAudioElements.current.clear();
    };
  }, []);

  return {
    localAudioStream,
    isSpeaking,
    speakingVolume,
    permissionError,
    // Device manager features
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
  };
}
