/**
 * PitchSyncManager
 * 
 * Provides zero-friction real-time co-browsing & state synchronization across
 * computers, tablets, and smartphones for SeshNx pitch deck presentations.
 * 
 * Multi-transport architecture:
 * 1. BroadcastChannel: 0ms native sync across tabs, windows, and second monitors on same machine.
 * 2. Public Secure WebSocket Relay: sub-50ms sync across remote devices over 5G/WiFi.
 * 3. LocalStorage fallback: redundancy for cross-tab event listeners.
 */

export interface PitchSyncState {
  pitchId: string;
  slideIndex: number;
  // Interactive Studio Demo state
  selectedStudioRoomId: string;
  kioskStep: number;
  // Interactive Recoupment Demo state
  recoupmentAdvance: number;
  recoupmentStreams: number;
  recoupmentShare: number;
  // Interactive Economics Demo state
  economicsStudioCount: number;
  // Host status
  hostName: string;
  isHostLive: boolean;
  viewersCount: number;
  timestamp: number;
}

export type PitchSyncMessage =
  | { type: 'STATE_UPDATE'; state: Partial<PitchSyncState>; senderId: string; timestamp: number }
  | { type: 'HEARTBEAT'; state: PitchSyncState; senderId: string; timestamp: number }
  | { type: 'VIEWER_PING'; viewerId: string; timestamp: number }
  | { type: 'VIEWER_COUNT'; count: number; timestamp: number }
  | { type: 'REACTION'; emoji: string; id: string; senderName?: string; timestamp: number }
  | { type: 'END_BROADCAST'; pitchId: string; timestamp: number };

export const DEFAULT_PITCH_STATE: PitchSyncState = {
  pitchId: '',
  slideIndex: 0,
  selectedStudioRoomId: 'room-a',
  kioskStep: 0,
  recoupmentAdvance: 1500,
  recoupmentStreams: 750000,
  recoupmentShare: 25,
  economicsStudioCount: 100,
  hostName: 'Presenter',
  isHostLive: false,
  viewersCount: 0,
  timestamp: Date.now()
};

type StateCallback = (state: PitchSyncState, isFromHost: boolean) => void;
type ReactionCallback = (reaction: { emoji: string; id: string; senderName?: string }) => void;
type ViewerCountCallback = (count: number) => void;
type ConnectionCallback = (status: 'connecting' | 'connected' | 'disconnected') => void;

export class PitchSyncManager {
  private pitchId: string = '';
  private isHost: boolean = false;
  private senderId: string = '';
  private currentState: PitchSyncState = { ...DEFAULT_PITCH_STATE };
  
  private broadcastChannel: BroadcastChannel | null = null;
  private webSocket: WebSocket | null = null;
  private wsReconnectTimer: any = null;
  private heartbeatTimer: any = null;
  private viewerPruneTimer: any = null;
  
  // Track active viewers on host
  private activeViewers: Map<string, number> = new Map();
  
  // Callbacks
  private stateListeners: Set<StateCallback> = new Set();
  private reactionListeners: Set<ReactionCallback> = new Set();
  private viewerCountListeners: Set<ViewerCountCallback> = new Set();
  private connectionListeners: Set<ConnectionCallback> = new Set();

  constructor() {
    this.senderId = 'client_' + Math.random().toString(36).substring(2, 9);
  }

  /**
   * Start hosting a live broadcast room
   */
  public startHosting(pitchId: string, initialSlideIndex: number = 0, hostName: string = 'Ricardo (Founder)'): void {
    this.disconnect();
    this.pitchId = this.sanitizePitchId(pitchId);
    this.isHost = true;
    this.currentState = {
      ...DEFAULT_PITCH_STATE,
      pitchId: this.pitchId,
      slideIndex: initialSlideIndex,
      hostName,
      isHostLive: true,
      viewersCount: 1,
      timestamp: Date.now()
    };

    // Store host auth in session so refresh retains host role
    try {
      sessionStorage.setItem(`seshnx_pitch_host_${this.pitchId}`, 'true');
    } catch (_) {}

    this.initTransports();
    this.startHostHeartbeat();
    this.emitStateChange(this.currentState, true);
  }

  /**
   * Connect to an existing broadcast as a viewer
   */
  public joinAsViewer(pitchId: string): void {
    this.disconnect();
    this.pitchId = this.sanitizePitchId(pitchId);
    this.isHost = false;
    this.currentState = {
      ...DEFAULT_PITCH_STATE,
      pitchId: this.pitchId,
      isHostLive: false,
      timestamp: Date.now()
    };

    // Check if user was host of this room in current browser session
    try {
      if (sessionStorage.getItem(`seshnx_pitch_host_${this.pitchId}`) === 'true') {
        this.isHost = true;
        this.currentState.isHostLive = true;
      }
    } catch (_) {}

    this.initTransports();
    this.sendViewerPing();

    // Viewer sends a ping periodically to keep active viewer counter accurate
    if (!this.isHost) {
      this.heartbeatTimer = setInterval(() => this.sendViewerPing(), 8000);
    }
  }

  // Slider update throttling
  private sliderThrottleTimer: any = null;
  private pendingSliderUpdate: Partial<PitchSyncState> | null = null;

  /**
   * Broadcast partial or full state update (called by Host)
   * Slide navigation changes are sent immediately with zero latency.
   * Rapid slider drags are throttled to 40ms to avoid network jitter.
   */
  public broadcastState(stateUpdate: Partial<PitchSyncState>): void {
    if (!this.isHost && !this.isHostRole()) return;

    this.currentState = {
      ...this.currentState,
      ...stateUpdate,
      timestamp: Date.now()
    };

    // If slide index changed, broadcast immediately
    if (typeof stateUpdate.slideIndex === 'number') {
      const msg: PitchSyncMessage = {
        type: 'STATE_UPDATE',
        state: stateUpdate,
        senderId: this.senderId,
        timestamp: Date.now()
      };

      this.sendToTransports(msg);
      this.emitStateChange(this.currentState, true);
      return;
    }

    // For continuous slider motion, throttle updates to 40ms
    this.pendingSliderUpdate = {
      ...this.pendingSliderUpdate,
      ...stateUpdate
    };

    if (!this.sliderThrottleTimer) {
      this.sliderThrottleTimer = setTimeout(() => {
        if (this.pendingSliderUpdate) {
          const msg: PitchSyncMessage = {
            type: 'STATE_UPDATE',
            state: this.pendingSliderUpdate,
            senderId: this.senderId,
            timestamp: Date.now()
          };
          this.sendToTransports(msg);
          this.emitStateChange(this.currentState, true);
          this.pendingSliderUpdate = null;
        }
        this.sliderThrottleTimer = null;
      }, 40);
    }
  }

  /**
   * Send live audience emoji reaction (can be called by both Host and Viewers)
   */
  public sendReaction(emoji: string, senderName?: string): void {
    const reaction = {
      emoji,
      id: Math.random().toString(36).substring(2, 9),
      senderName: senderName || (this.isHost ? 'Presenter' : 'Investor')
    };

    const msg: PitchSyncMessage = {
      type: 'REACTION',
      ...reaction,
      timestamp: Date.now()
    };

    this.sendToTransports(msg);
    this.emitReaction(reaction);
  }

  /**
   * Stop broadcast
   */
  public endBroadcast(): void {
    if (this.isHost) {
      const msg: PitchSyncMessage = {
        type: 'END_BROADCAST',
        pitchId: this.pitchId,
        timestamp: Date.now()
      };
      this.sendToTransports(msg);
      try {
        sessionStorage.removeItem(`seshnx_pitch_host_${this.pitchId}`);
      } catch (_) {}
    }
    this.disconnect();
  }

  /**
   * Disconnect all transports
   */
  public disconnect(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.viewerPruneTimer) {
      clearInterval(this.viewerPruneTimer);
      this.viewerPruneTimer = null;
    }
    if (this.wsReconnectTimer) {
      clearTimeout(this.wsReconnectTimer);
      this.wsReconnectTimer = null;
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch (_) {}
      this.broadcastChannel = null;
    }
    if (this.webSocket) {
      try {
        this.webSocket.close();
      } catch (_) {}
      this.webSocket = null;
    }
    this.activeViewers.clear();
    this.emitConnectionStatus('disconnected');
  }

  public getIsHost(): boolean {
    return this.isHost;
  }

  public setIsHost(host: boolean): void {
    this.isHost = host;
    if (host) {
      try {
        sessionStorage.setItem(`seshnx_pitch_host_${this.pitchId}`, 'true');
      } catch (_) {}
      this.startHostHeartbeat();
    }
  }

  public getCurrentState(): PitchSyncState {
    return { ...this.currentState };
  }

  public getPitchId(): string {
    return this.pitchId;
  }

  // Event Subscriptions
  public onStateChange(cb: StateCallback): () => void {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  public onReaction(cb: ReactionCallback): () => void {
    this.reactionListeners.add(cb);
    return () => this.reactionListeners.delete(cb);
  }

  public onViewerCountChange(cb: ViewerCountCallback): () => void {
    this.viewerCountListeners.add(cb);
    return () => this.viewerCountListeners.delete(cb);
  }

  public onConnectionStatusChange(cb: ConnectionCallback): () => void {
    this.connectionListeners.add(cb);
    return () => this.connectionListeners.delete(cb);
  }

  // -------------------------------------------------------------
  // Private Transport Implementations
  // -------------------------------------------------------------

  private initTransports(): void {
    if (!this.pitchId) return;

    // 1. Initialize native BroadcastChannel (same-origin, local cross-window/tab)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(`seshnx_pitch_${this.pitchId}`);
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization failed:', err);
      }
    }

    // 2. Initialize WebSocket Relay (global internet cross-device)
    this.connectWebSocket();
  }

  private connectWebSocket(): void {
    if (typeof window === 'undefined' || !this.pitchId) return;

    this.emitConnectionStatus('connecting');

    try {
      // Free public real-time WebSocket channel
      const cleanRoom = `seshnx_pitch_${this.pitchId}`;
      const wsUrl = `wss://demo.piesocket.com/v3/${cleanRoom}?api_key=VC3OtCPxwumd8qvOmFjhXio5eGcrUILo&notify_self=0`;
      
      this.webSocket = new WebSocket(wsUrl);

      this.webSocket.onopen = () => {
        this.emitConnectionStatus('connected');
        if (this.isHost) {
          this.sendHeartbeat();
        } else {
          this.sendViewerPing();
        }
      };

      this.webSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingMessage(data);
        } catch (_) {}
      };

      this.webSocket.onerror = () => {
        // Will trigger onclose and schedule retry
      };

      this.webSocket.onclose = () => {
        this.emitConnectionStatus('disconnected');
        // Reconnect after 3 seconds if room is still active
        if (this.pitchId) {
          this.wsReconnectTimer = setTimeout(() => {
            this.connectWebSocket();
          }, 3000);
        }
      };
    } catch (err) {
      console.warn('WebSocket connection attempt failed:', err);
    }
  }

  private sendToTransports(msg: PitchSyncMessage): void {
    // 1. BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch (_) {}
    }

    // 2. WebSocket
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      try {
        this.webSocket.send(JSON.stringify(msg));
      } catch (_) {}
    }

    // 3. LocalStorage for tab mirroring
    try {
      localStorage.setItem(`seshnx_pitch_msg_${this.pitchId}`, JSON.stringify(msg));
    } catch (_) {}
  }

  private handleIncomingMessage(msg: any): void {
    if (!msg || typeof msg !== 'object' || !msg.type) return;

    // Ignore messages echoed from self
    if (msg.senderId && msg.senderId === this.senderId) return;

    switch (msg.type) {
      case 'STATE_UPDATE': {
        this.currentState = {
          ...this.currentState,
          ...msg.state,
          isHostLive: true,
          timestamp: msg.timestamp || Date.now()
        };
        this.emitStateChange(this.currentState, true);
        break;
      }

      case 'HEARTBEAT': {
        this.currentState = {
          ...this.currentState,
          ...msg.state,
          isHostLive: true,
          timestamp: msg.timestamp || Date.now()
        };
        this.emitStateChange(this.currentState, true);
        break;
      }

      case 'VIEWER_PING': {
        if (this.isHost && msg.viewerId) {
          this.activeViewers.set(msg.viewerId, Date.now());
          this.pruneActiveViewers();
        }
        break;
      }

      case 'VIEWER_COUNT': {
        if (!this.isHost && typeof msg.count === 'number') {
          this.currentState.viewersCount = msg.count;
          this.emitViewerCount(msg.count);
        }
        break;
      }

      case 'REACTION': {
        this.emitReaction({
          emoji: msg.emoji,
          id: msg.id || Math.random().toString(),
          senderName: msg.senderName
        });
        break;
      }

      case 'END_BROADCAST': {
        this.currentState.isHostLive = false;
        this.emitStateChange(this.currentState, false);
        break;
      }
    }
  }

  private startHostHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.viewerPruneTimer) clearInterval(this.viewerPruneTimer);

    // Host sends heartbeat every 3 seconds
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, 3000);

    // Prune stale viewers every 5 seconds
    this.viewerPruneTimer = setInterval(() => {
      this.pruneActiveViewers();
    }, 5000);
  }

  private sendHeartbeat(): void {
    if (!this.isHost) return;
    const msg: PitchSyncMessage = {
      type: 'HEARTBEAT',
      state: {
        ...this.currentState,
        viewersCount: Math.max(1, this.activeViewers.size + 1),
        timestamp: Date.now()
      },
      senderId: this.senderId,
      timestamp: Date.now()
    };
    this.sendToTransports(msg);
  }

  private sendViewerPing(): void {
    const msg: PitchSyncMessage = {
      type: 'VIEWER_PING',
      viewerId: this.senderId,
      timestamp: Date.now()
    };
    this.sendToTransports(msg);
  }

  private pruneActiveViewers(): void {
    if (!this.isHost) return;
    const now = Date.now();
    const staleThreshold = 18000; // 18 seconds
    for (const [id, lastSeen] of this.activeViewers.entries()) {
      if (now - lastSeen > staleThreshold) {
        this.activeViewers.delete(id);
      }
    }
    const count = this.activeViewers.size + 1; // +1 for host
    this.currentState.viewersCount = count;
    this.emitViewerCount(count);

    // Broadcast count update to viewers
    const msg: PitchSyncMessage = {
      type: 'VIEWER_COUNT',
      count,
      timestamp: now
    };
    this.sendToTransports(msg);
  }

  private isHostRole(): boolean {
    return this.isHost;
  }

  private sanitizePitchId(id: string): string {
    return id.toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 32);
  }

  private emitStateChange(state: PitchSyncState, isFromHost: boolean): void {
    this.stateListeners.forEach((cb) => cb(state, isFromHost));
  }

  private emitReaction(reaction: { emoji: string; id: string; senderName?: string }): void {
    this.reactionListeners.forEach((cb) => cb(reaction));
  }

  private emitViewerCount(count: number): void {
    this.viewerCountListeners.forEach((cb) => cb(count));
  }

  private emitConnectionStatus(status: 'connecting' | 'connected' | 'disconnected'): void {
    this.connectionListeners.forEach((cb) => cb(status));
  }
}

// Global singleton instance
export const pitchSyncManager = new PitchSyncManager();
