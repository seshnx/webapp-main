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
  participants: Array<{ clerkId: string; role: string; name?: string }>;
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
  const [remoteSpeakingUsers, setRemoteSpeakingUsers] = useState<Record<string, boolean>>({});
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

  // WebRTC refs
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteAudioElements = useRef<Map<string, HTMLAudioElement>>(new Map());
  const candidateQueues = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const isMakingOffer = useRef<Map<string, boolean>>(new Map());
  const isIgnoringOffer = useRef<Map<string, boolean>>(new Map());
  const processedSignals = useRef<Set<string>>(new Set());

  // Audio Processing Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const monitorNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const remoteAnalysersRef = useRef<Map<string, { ctx: AudioContext; analyser: AnalyserNode }>>(new Map());

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

  // Listen for device changes
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

    return {
      ...base,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: { ideal: 1 },
      sampleRate: { ideal: 48000 },
    };
  }, [selectedAudioInput, studioAudioMode]);

  // Attach or replace audio track in a peer connection
  const syncLocalTrackToPeer = useCallback(
    (pc: RTCPeerConnection, stream: MediaStream | null) => {
      const audioTrack = stream ? stream.getAudioTracks()[0] : null;
      const senders = pc.getSenders();
      const audioSender = senders.find((s) => s.track?.kind === 'audio' || s.track === null);

      if (audioTrack) {
        if (audioSender) {
          if (audioSender.track !== audioTrack) {
            audioSender.replaceTrack(audioTrack).catch((err) => {
              console.warn('Error replacing audio track:', err);
            });
          }
        } else {
          try {
            pc.addTrack(audioTrack, stream!);
          } catch (err) {
            console.warn('Error adding track to peer:', err);
          }
        }
      } else {
        if (audioSender && audioSender.track) {
          audioSender.replaceTrack(null).catch(() => {});
        }
      }
    },
    []
  );

  // Helper to create or get PeerConnection with Perfect Negotiation
  const getOrCreatePeerConnection = useCallback(
    (targetClerkId: string): RTCPeerConnection => {
      let pc = peerConnections.current.get(targetClerkId);
      if (pc && pc.connectionState !== 'closed') {
        return pc;
      }

      pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnections.current.set(targetClerkId, pc);

      // Polite peer if our clerkId is lexicographically greater
      const isPolite = currentClerkId.localeCompare(targetClerkId) > 0;

      // Sync existing local track if available
      syncLocalTrackToPeer(pc, localAudioStream);

      // Handle ICE Candidates
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

      // Perfect Negotiation: On Negotiation Needed
      pc.onnegotiationneeded = async () => {
        try {
          isMakingOffer.current.set(targetClerkId, true);
          await pc!.setLocalDescription();
          if (pc!.localDescription) {
            await sendSignalMutation({
              roomId,
              senderClerkId: currentClerkId,
              targetClerkId,
              type: 'offer',
              payload: JSON.stringify(pc!.localDescription),
            });
          }
        } catch (err) {
          console.warn(`Negotiation error with ${targetClerkId}:`, err);
        } finally {
          isMakingOffer.current.set(targetClerkId, false);
        }
      };

      // Handle incoming remote audio tracks
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0] || new MediaStream([event.track]);
        let audioEl = remoteAudioElements.current.get(targetClerkId);
        if (!audioEl) {
          audioEl = document.createElement('audio');
          audioEl.autoplay = true;
          (audioEl as any).playsInline = true;
          audioEl.id = `live-space-audio-${targetClerkId}`;
          document.body.appendChild(audioEl);
          remoteAudioElements.current.set(targetClerkId, audioEl);
        }
        audioEl.srcObject = remoteStream;

        if (selectedAudioOutput && selectedAudioOutput !== 'default' && (audioEl as any).setSinkId) {
          (audioEl as any).setSinkId(selectedAudioOutput).catch((err: any) => {
            console.warn('Failed to set audio sink ID:', err);
          });
        }

        audioEl.play().catch((playErr) => {
          console.warn(`Autoplay blocked for ${targetClerkId}:`, playErr);
        });

        // Setup remote volume analyzer for visual speaking indicator
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const source = ctx.createMediaStreamSource(remoteStream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            remoteAnalysersRef.current.set(targetClerkId, { ctx, analyser });

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkRemoteAudio = () => {
              if (!peerConnections.current.has(targetClerkId)) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              const isRemSpeaking = avg > 8;

              setRemoteSpeakingUsers((prev) => {
                if (prev[targetClerkId] === isRemSpeaking) return prev;
                return { ...prev, [targetClerkId]: isRemSpeaking };
              });

              requestAnimationFrame(checkRemoteAudio);
            };
            checkRemoteAudio();
          }
        } catch (e) {
          console.warn('Remote audio analyzer setup failed:', e);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc!.connectionState === 'failed') {
          pc!.restartIce();
        }
      };

      return pc;
    },
    [currentClerkId, localAudioStream, roomId, selectedAudioOutput, sendSignalMutation, syncLocalTrackToPeer]
  );

  // 1. Manage local microphone stream for speakers
  useEffect(() => {
    let active = true;

    async function initMicrophone() {
      if (!isSpeaker) {
        if (localAudioStream) {
          localAudioStream.getTracks().forEach((t) => t.stop());
          setLocalAudioStream(null);
        }
        setIsSpeaking(false);
        setSpeakingVolume(0);
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

            const gainNode = ctx.createGain();
            gainNode.gain.value = inputGain;
            gainNodeRef.current = gainNode;

            const monitorNode = ctx.createGain();
            monitorNode.gain.value = isMonitoring ? 1.0 : 0.0;
            monitorNodeRef.current = monitorNode;

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
  }, [isSpeaker, selectedAudioInput, studioAudioMode, getAudioConstraints, refreshAudioDevices]);

  // 2. Propagate local audio stream changes to all existing peer connections immediately
  useEffect(() => {
    peerConnections.current.forEach((pc) => {
      syncLocalTrackToPeer(pc, localAudioStream);
    });
  }, [localAudioStream, syncLocalTrackToPeer]);

  // 3. Handle mute/unmute state changes
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

  // 4. Handle Input Gain changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = inputGain;
    }
  }, [inputGain]);

  // 5. Handle Direct Monitoring changes
  useEffect(() => {
    if (monitorNodeRef.current) {
      monitorNodeRef.current.gain.value = isMonitoring ? 1.0 : 0.0;
    }
  }, [isMonitoring]);

  // 6. Synchronize PeerConnections for all participants in room
  useEffect(() => {
    if (!participants || !currentClerkId) return;

    const currentParticipantClerks = new Set(participants.map((p) => p.clerkId));

    // Ensure connection exists for all other participants
    participants.forEach((p) => {
      if (p.clerkId === currentClerkId) return;
      const pc = getOrCreatePeerConnection(p.clerkId);
      syncLocalTrackToPeer(pc, localAudioStream);
    });

    // Cleanup disconnected participants
    peerConnections.current.forEach((pc, clerkId) => {
      if (!currentParticipantClerks.has(clerkId)) {
        pc.close();
        peerConnections.current.delete(clerkId);
        isMakingOffer.current.delete(clerkId);
        isIgnoringOffer.current.delete(clerkId);
        candidateQueues.current.delete(clerkId);

        const el = remoteAudioElements.current.get(clerkId);
        if (el) {
          el.srcObject = null;
          el.remove();
          remoteAudioElements.current.delete(clerkId);
        }

        const remCtx = remoteAnalysersRef.current.get(clerkId);
        if (remCtx) {
          remCtx.ctx.close().catch(() => {});
          remoteAnalysersRef.current.delete(clerkId);
        }

        setRemoteSpeakingUsers((prev) => {
          const next = { ...prev };
          delete next[clerkId];
          return next;
        });
      }
    });
  }, [participants, currentClerkId, getOrCreatePeerConnection, localAudioStream, syncLocalTrackToPeer]);

  // 7. Process incoming WebRTC signals with Perfect Negotiation & Candidate Queueing
  useEffect(() => {
    if (!incomingSignals) return;

    incomingSignals.forEach(async (sig: any) => {
      const signalId = `${sig._id || sig.createdAt}-${sig.senderClerkId}-${sig.type}`;
      if (processedSignals.current.has(signalId)) return;
      processedSignals.current.add(signalId);

      const senderId = sig.senderClerkId;
      if (senderId === currentClerkId) return;

      const pc = getOrCreatePeerConnection(senderId);
      const isPolite = currentClerkId.localeCompare(senderId) > 0;

      try {
        if (sig.type === 'offer') {
          const offer = JSON.parse(sig.payload);
          const offerCollision =
            isMakingOffer.current.get(senderId) || pc.signalingState !== 'stable';

          isIgnoringOffer.current.set(senderId, !isPolite && offerCollision);
          if (isIgnoringOffer.current.get(senderId)) {
            console.log(`[WebRTC] Glare collision: Impolite peer ignoring offer from ${senderId}`);
            return;
          }

          if (offerCollision && isPolite) {
            console.log(`[WebRTC] Glare collision: Polite peer rolling back for ${senderId}`);
            await pc.setLocalDescription({ type: 'rollback' });
          }

          await pc.setRemoteDescription(new RTCSessionDescription(offer));

          // Drain queued ICE candidates
          const queued = candidateQueues.current.get(senderId) || [];
          for (const cand of queued) {
            await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
          }
          candidateQueues.current.delete(senderId);

          // Create & send answer
          await pc.setLocalDescription();
          if (pc.localDescription) {
            await sendSignalMutation({
              roomId,
              senderClerkId: currentClerkId,
              targetClerkId: senderId,
              type: 'answer',
              payload: JSON.stringify(pc.localDescription),
            });
          }
        } else if (sig.type === 'answer') {
          const answer = JSON.parse(sig.payload);
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));

            // Drain queued ICE candidates
            const queued = candidateQueues.current.get(senderId) || [];
            for (const cand of queued) {
              await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
            }
            candidateQueues.current.delete(senderId);
          }
        } else if (sig.type === 'ice-candidate') {
          const candidate = JSON.parse(sig.payload);
          if (!candidate) return;

          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((err) => {
              if (!isIgnoringOffer.current.get(senderId)) {
                console.warn(`ICE candidate error for ${senderId}:`, err);
              }
            });
          } else {
            // Queue candidate until remote description is set
            if (!candidateQueues.current.has(senderId)) {
              candidateQueues.current.set(senderId, []);
            }
            candidateQueues.current.get(senderId)!.push(candidate);
          }
        }
      } catch (err) {
        console.warn(`Failed to process WebRTC signal (${sig.type}) from ${senderId}:`, err);
      }
    });
  }, [incomingSignals, currentClerkId, getOrCreatePeerConnection, roomId, sendSignalMutation]);

  // 8. Device management helpers
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

          peerConnections.current.forEach((pc) => {
            syncLocalTrackToPeer(pc, newStream);
          });

          if (localAudioStream) {
            localAudioStream.getTracks().forEach((t) => t.stop());
          }
          setLocalAudioStream(newStream);
        }
      } catch (err) {
        console.error('Error switching audio input interface:', err);
      }
    },
    [isSpeaker, isMuted, getAudioConstraints, localAudioStream, syncLocalTrackToPeer]
  );

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

  const toggleStudioAudioMode = useCallback(async () => {
    const nextMode = !studioAudioMode;
    setStudioAudioMode(nextMode);
    localStorage.setItem(STORAGE_STUDIO_MODE_KEY, String(nextMode));
  }, [studioAudioMode]);

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

  // 9. Cleanup on unmount or room leave
  useEffect(() => {
    return () => {
      if (localAudioStream) {
        localAudioStream.getTracks().forEach((t) => t.stop());
      }
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      candidateQueues.current.clear();
      isMakingOffer.current.clear();
      isIgnoringOffer.current.clear();

      remoteAudioElements.current.forEach((el) => {
        el.srcObject = null;
        el.remove();
      });
      remoteAudioElements.current.clear();

      remoteAnalysersRef.current.forEach((ctxObj) => {
        ctxObj.ctx.close().catch(() => {});
      });
      remoteAnalysersRef.current.clear();
    };
  }, []);

  return {
    localAudioStream,
    isSpeaking,
    speakingVolume,
    remoteSpeakingUsers,
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

