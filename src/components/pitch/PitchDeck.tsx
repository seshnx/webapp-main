import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  Minimize, 
  Printer, 
  FileText, 
  Grid, 
  Sparkles, 
  CheckCircle2, 
  X,
  Radio,
  Share2
} from 'lucide-react';
import { PITCH_DECK_SLIDES, PitchSlide } from './data/pitchDeckSlides';
import InteractiveStudioDemo from './demo/InteractiveStudioDemo';
import InteractiveRecoupmentDemo from './demo/InteractiveRecoupmentDemo';
import InteractiveEconomicsDemo from './demo/InteractiveEconomicsDemo';
import { pitchSyncManager, PitchSyncState } from './sync/pitchSyncManager';
import LiveBroadcastModal from './sync/LiveBroadcastModal';
import ViewerLiveHeader from './sync/ViewerLiveHeader';
import LiveReactionsOverlay from './sync/LiveReactionsOverlay';
import SeshNxLogo from '../../assets/SeshNx-PNG cCropped white text.png';
import AmaliaMediaLogo from '../../assets/AmaliaMediaLLc logo.png';

export default function PitchDeck(): JSX.Element {
  const { pitchId: routePitchId } = useParams<{ pitchId?: string }>();
  const navigate = useNavigate();

  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Live broadcast synchronization state
  const [activePitchId, setActivePitchId] = useState<string>(routePitchId || '');
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isHostLive, setIsHostLive] = useState<boolean>(false);
  const [viewersCount, setViewersCount] = useState<number>(1);
  const [syncDemos, setSyncDemos] = useState<boolean>(true);
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [isFreeRoam, setIsFreeRoam] = useState<boolean>(false);
  const [hostSlideIndex, setHostSlideIndex] = useState<number>(0);
  const [syncState, setSyncState] = useState<Partial<PitchSyncState>>({
    selectedStudioRoomId: 'room-a',
    kioskStep: 0,
    recoupmentAdvance: 1500,
    recoupmentStreams: 750000,
    recoupmentShare: 25,
    economicsStudioCount: 100
  });

  const totalSlides = PITCH_DECK_SLIDES.length;
  const currentSlide: PitchSlide = PITCH_DECK_SLIDES[currentSlideIndex];

  // Navigation debounce & pacing lock (avoids rapid-fire page flipping)
  const PAGE_TRANSITION_COOLDOWN_MS = 380;
  const lastSlideChangeTimeRef = React.useRef<number>(0);
  const viewerSlideTimerRef = React.useRef<any>(null);
  const [isPageTransitioning, setIsPageTransitioning] = useState<boolean>(false);

  // Initialize room synchronization
  useEffect(() => {
    const targetRoom = routePitchId || activePitchId;
    if (!targetRoom) {
      setIsBroadcasting(false);
      setIsHost(false);
      return;
    }

    setActivePitchId(targetRoom);
    let isSessionHost = false;
    try {
      isSessionHost = sessionStorage.getItem(`seshnx_pitch_host_${targetRoom}`) === 'true';
    } catch (_) {}

    if (isSessionHost) {
      setIsHost(true);
      setIsBroadcasting(true);
      setIsHostLive(true);
      pitchSyncManager.startHosting(targetRoom, currentSlideIndex);
    } else {
      setIsHost(false);
      pitchSyncManager.joinAsViewer(targetRoom);
    }

    const unsubState = pitchSyncManager.onStateChange((state) => {
      setHostSlideIndex(state.slideIndex);
      setIsHostLive(state.isHostLive);
      setSyncState((prev) => ({ ...prev, ...state }));

      // If viewer and not free-roaming, smoothly transition to presenter slide with debounce smoothing
      if (!pitchSyncManager.getIsHost() && !isFreeRoam) {
        if (viewerSlideTimerRef.current) {
          clearTimeout(viewerSlideTimerRef.current);
        }
        viewerSlideTimerRef.current = setTimeout(() => {
          setCurrentSlideIndex(state.slideIndex);
        }, 100);
      }
    });

    const unsubViewers = pitchSyncManager.onViewerCountChange((count) => {
      setViewersCount(count);
    });

    return () => {
      unsubState();
      unsubViewers();
      if (viewerSlideTimerRef.current) {
        clearTimeout(viewerSlideTimerRef.current);
      }
    };
  }, [routePitchId, isFreeRoam]);

  const handleNext = useCallback(() => {
    const now = Date.now();
    if (now - lastSlideChangeTimeRef.current < PAGE_TRANSITION_COOLDOWN_MS) {
      return; // Absorb rapid clicks / key bounces
    }
    lastSlideChangeTimeRef.current = now;
    setIsPageTransitioning(true);
    setTimeout(() => setIsPageTransitioning(false), PAGE_TRANSITION_COOLDOWN_MS);

    setCurrentSlideIndex((prev) => {
      const next = prev < totalSlides - 1 ? prev + 1 : prev;
      if (isHost && isBroadcasting) {
        pitchSyncManager.broadcastState({ slideIndex: next });
      }
      return next;
    });
  }, [totalSlides, isHost, isBroadcasting]);

  const handlePrev = useCallback(() => {
    const now = Date.now();
    if (now - lastSlideChangeTimeRef.current < PAGE_TRANSITION_COOLDOWN_MS) {
      return; // Absorb rapid clicks / key bounces
    }
    lastSlideChangeTimeRef.current = now;
    setIsPageTransitioning(true);
    setTimeout(() => setIsPageTransitioning(false), PAGE_TRANSITION_COOLDOWN_MS);

    setCurrentSlideIndex((prev) => {
      const prevIdx = prev > 0 ? prev - 1 : prev;
      if (isHost && isBroadcasting) {
        pitchSyncManager.broadcastState({ slideIndex: prevIdx });
      }
      return prevIdx;
    });
  }, [isHost, isBroadcasting]);

  const handleSelectSlide = (idx: number) => {
    const now = Date.now();
    if (now - lastSlideChangeTimeRef.current < PAGE_TRANSITION_COOLDOWN_MS) {
      return;
    }
    lastSlideChangeTimeRef.current = now;
    setIsPageTransitioning(true);
    setTimeout(() => setIsPageTransitioning(false), PAGE_TRANSITION_COOLDOWN_MS);

    setCurrentSlideIndex(idx);
    setShowThumbnails(false);
    if (isHost && isBroadcasting) {
      pitchSyncManager.broadcastState({ slideIndex: idx });
    }
  };

  const handleStartBroadcast = (roomId: string) => {
    const cleanId = roomId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'seed';
    setActivePitchId(cleanId);
    setIsHost(true);
    setIsBroadcasting(true);
    setIsHostLive(true);
    pitchSyncManager.startHosting(cleanId, currentSlideIndex);
    navigate(`/pitch/${cleanId}`, { replace: true });
  };

  const handleStopBroadcast = () => {
    pitchSyncManager.endBroadcast();
    setIsBroadcasting(false);
    setIsHost(false);
    setIsHostLive(false);
    setActivePitchId('');
    navigate('/pitch', { replace: true });
  };

  const handleClaimHostRole = () => {
    if (!activePitchId) return;
    setIsHost(true);
    setIsBroadcasting(true);
    setIsHostLive(true);
    pitchSyncManager.setIsHost(true);
  };

  const handleStudioSyncChange = (change: { selectedRoomId?: string; kioskStep?: number }) => {
    if (isHost && isBroadcasting && syncDemos) {
      pitchSyncManager.broadcastState({
        selectedStudioRoomId: change.selectedRoomId,
        kioskStep: change.kioskStep
      });
    }
  };

  const handleRecoupmentSyncChange = (change: { advanceAmount?: number; streamVolume?: number; recoupmentShare?: number }) => {
    if (isHost && isBroadcasting && syncDemos) {
      pitchSyncManager.broadcastState({
        recoupmentAdvance: change.advanceAmount,
        recoupmentStreams: change.streamVolume,
        recoupmentShare: change.recoupmentShare
      });
    }
  };

  const handleEconomicsSyncChange = (change: { studioCount: number }) => {
    if (isHost && isBroadcasting && syncDemos) {
      pitchSyncManager.broadcastState({
        economicsStudioCount: change.studioCount
      });
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handlePrintPdf = useCallback(() => {
    // If currently in fullscreen mode, exit fullscreen first as browsers block print dialogs in fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        setTimeout(() => {
          window.print();
        }, 300);
      }).catch(() => {
        window.print();
      });
    } else {
      window.print();
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }

      // Ignore rapid auto-repeat key events when holding down keys
      if (e.repeat) {
        e.preventDefault();
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowNotes((prev) => !prev);
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setShowThumbnails((prev) => !prev);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handlePrintPdf();
      } else if (e.key === 'Escape') {
        setShowThumbnails(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handlePrintPdf]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="pitch-viewport min-h-screen bg-[#1a1d21] text-white flex flex-col justify-between selection:bg-brand-blue selection:text-white font-sans antialiased overflow-x-hidden">
      {/* ========================================================================= */}
      {/* DYNAMIC VIEWPORT SCALING & 16:9 PRINT STYLES                              */}
      {/* ========================================================================= */}
      <style>{`
        .pitch-viewport {
          font-size: clamp(14px, 0.85vw + 4px, 18px);
        }
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          *, *:before, *:after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body, #root, #root > div, .pitch-viewport {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            overflow-x: visible !important;
            overflow-y: visible !important;
            background-color: #1a1d21 !important;
            color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }
          .no-print,
          header.no-print,
          footer.no-print,
          aside.no-print {
            display: none !important;
          }
          .print-container {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #1a1d21 !important;
          }
          .print-slide-page {
            display: block !important;
            position: relative !important;
            page-break-before: auto !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            width: 100vw !important;
            height: calc(100vh - 1px) !important;
            max-height: calc(100vh - 1px) !important;
            box-sizing: border-box !important;
            padding: 1.6rem 2.6rem !important;
            background-color: #1f2128 !important;
            color: #ffffff !important;
            overflow: hidden !important;
          }
          .print-slide-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          /* Interactive Demos in Print: Enforce 2-column side-by-side landscape layout */
          .print-demo-scaler {
            zoom: 0.74 !important;
            transform-origin: top center !important;
            margin-bottom: 0 !important;
            width: 100% !important;
          }
          @supports not (zoom: 0.74) {
            .print-demo-scaler {
              transform: scale(0.74) !important;
              transform-origin: top center !important;
              margin-bottom: -90px !important;
              width: 100% !important;
            }
          }
          .print-demo-scaler .grid-cols-1.lg\:grid-cols-12,
          .print-demo-scaler .lg\:grid-cols-12 {
            display: grid !important;
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
            gap: 1.25rem !important;
          }
          .print-demo-scaler .lg\:col-span-7 {
            grid-column: span 7 / span 7 !important;
          }
          .print-demo-scaler .lg\:col-span-5 {
            grid-column: span 5 / span 5 !important;
          }
          .print-demo-scaler button {
            display: flex !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          .print-demo-scaler > div {
            padding: 1.25rem 1.5rem !important;
          }
          /* Print Typography & Component Sizing Overrides (Crisp, High-Legibility) */
          .print-slide-page h2 {
            font-size: 2rem !important;
            line-height: 1.2 !important;
          }
          .print-slide-page p.slide-subtitle {
            font-size: 1.05rem !important;
            line-height: 1.35 !important;
          }
          .print-card-bullet {
            padding: 1rem 1.15rem !important;
            border-radius: 0.75rem !important;
          }
          .print-card-bullet h4 {
            font-size: 0.95rem !important;
            line-height: 1.3 !important;
            margin-bottom: 0.35rem !important;
          }
          .print-card-bullet p {
            font-size: 0.85rem !important;
            line-height: 1.4 !important;
          }
          .print-card-metric {
            padding: 0.85rem 1rem !important;
            border-radius: 0.75rem !important;
          }
          .print-card-metric .metric-label {
            font-size: 0.75rem !important;
            letter-spacing: 0.05em !important;
            margin-bottom: 0.25rem !important;
          }
          .print-card-metric span.text-2xl,
          .print-card-metric span.text-xl,
          .print-card-metric .metric-value {
            font-size: 1.75rem !important;
            line-height: 1.1 !important;
          }
          .print-card-metric .metric-subtext {
            font-size: 0.8rem !important;
            margin-top: 0.25rem !important;
          }
        }
        @media screen {
          .print-container {
            display: none;
          }
        }
      `}</style>

      {/* Real-Time Viewer Status Banner */}
      {activePitchId && !isHost && (
        <ViewerLiveHeader
          pitchId={activePitchId}
          hostName={syncState.hostName || 'Presenter'}
          isHostLive={isHostLive}
          viewersCount={viewersCount}
          hostSlideIndex={hostSlideIndex}
          currentViewerSlideIndex={currentSlideIndex}
          isFreeRoam={isFreeRoam}
          onToggleFreeRoam={() => setIsFreeRoam((prev) => !prev)}
          onJumpToHost={() => {
            setCurrentSlideIndex(hostSlideIndex);
            setIsFreeRoam(false);
          }}
          onClaimHostRole={handleClaimHostRole}
        />
      )}

      {/* ========================================================================= */}
      {/* PERSISTENT PRESENTATION TOOLBAR HEADER                                    */}
      {/* ========================================================================= */}
      <header className="no-print sticky top-0 z-40 bg-[#1f2128]/95 backdrop-blur-md border-b border-gray-700/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
        {/* Brand & Category Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={SeshNxLogo} 
              alt="SeshNx Logo" 
              className="h-8 sm:h-9 w-auto object-contain brightness-110"
            />
            <span className="text-xs font-mono font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue px-2.5 py-1 rounded border border-brand-blue/30">
              PITCH DECK
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-gray-700">
            <span className="px-3 py-1 rounded-full text-xs font-mono tracking-wider font-semibold uppercase bg-brand-blue/10 text-brand-blue border border-brand-blue/30">
              {currentSlide.category}
            </span>
            {currentSlide.badge && (
              <span className="hidden md:inline px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                {currentSlide.badge}
              </span>
            )}
          </div>
        </div>

        {/* Progress & Slide Counter */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 bg-[#2c2e36] border border-gray-700 rounded-lg px-3.5 py-1.5 font-mono text-xs sm:text-sm">
            <span className="text-white font-bold">
              {String(currentSlideIndex + 1).padStart(2, '0')}
            </span>
            <span className="text-gray-500">/</span>
            <span className="text-gray-400">{String(totalSlides).padStart(2, '0')}</span>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              disabled={currentSlideIndex === 0 || isPageTransitioning}
              className="p-2 rounded-lg bg-[#2c2e36] hover:bg-gray-700 border border-gray-700 text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Previous Slide (ArrowLeft)"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentSlideIndex === totalSlides - 1 || isPageTransitioning}
              className="p-2 rounded-lg bg-[#2c2e36] hover:bg-gray-700 border border-gray-700 text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Next Slide (ArrowRight / Space)"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Presenter Controls Toggle */}
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-gray-700">
            {/* Live Broadcast Trigger */}
            <button
              onClick={() => setShowBroadcastModal(true)}
              className={`p-2 sm:px-3 sm:py-2 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
                isBroadcasting
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                  : 'bg-[#2c2e36] text-gray-300 border-gray-700 hover:border-brand-blue hover:text-white'
              }`}
              title="Broadcast Presentation Room"
            >
              <Radio className={`w-4 h-4 ${isBroadcasting ? 'animate-pulse text-red-500' : 'text-brand-blue'}`} />
              <span className="hidden sm:inline font-medium">
                {isBroadcasting ? `Live (${viewersCount})` : 'Go Live'}
              </span>
            </button>

            <button
              onClick={() => setShowThumbnails((prev) => !prev)}
              className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
                showThumbnails
                  ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/30'
                  : 'bg-[#2c2e36] text-gray-300 border-gray-700 hover:bg-gray-700'
              }`}
              title="Slide Index (G)"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden lg:inline text-xs font-medium">Index</span>
            </button>

            {/* Notes Button: Only visible to Host or when in standalone deck */}
            {(isHost || !activePitchId) && (
              <button
                onClick={() => setShowNotes((prev) => !prev)}
                className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
                  showNotes
                    ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/30'
                    : 'bg-[#2c2e36] text-gray-300 border-gray-700 hover:bg-gray-700'
                }`}
                title="Presenter Notes (N)"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden lg:inline text-xs font-medium">Notes</span>
              </button>
            )}

            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-lg bg-[#2c2e36] hover:bg-gray-700 border border-gray-700 text-gray-300 transition-all"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            <button
              onClick={handlePrintPdf}
              className="px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-dark-accent hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-brand-blue/25 transition-all"
              title="Export 16:9 Landscape PDF (P)"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Progress Line Bar */}
      <div className="no-print w-full h-1.5 bg-gray-800 relative">
        <div 
          className="h-full bg-gradient-to-r from-brand-blue via-brand-dark-accent to-social-pink transition-all duration-300"
          style={{ width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
        />
      </div>

      {/* ========================================================================= */}
      {/* SCREEN SLIDE VIEWPORT (EXPANSIVE & FLUID)                                  */}
      {/* ========================================================================= */}
      <main className="no-print flex-1 flex flex-col justify-center items-center py-6 sm:py-10 px-4 sm:px-8 lg:px-12 xl:px-16 w-full max-w-[1700px] mx-auto min-h-[calc(100vh-115px)] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, y: 14, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.995 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="w-full flex flex-col justify-center"
          >
            {/* Title / Intro Slide (Slide 1) */}
            {currentSlide.id === 'title' ? (
              <div className="flex flex-col items-center justify-center text-center py-8 sm:py-16 md:py-20 px-4 max-w-5xl mx-auto w-full">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 sm:mb-8 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-blue/15 border border-brand-blue/40 text-brand-blue text-xs sm:text-sm font-mono uppercase tracking-widest shadow-lg shadow-brand-blue/20 font-bold"
                >
                  <Sparkles className="w-4 h-4" />
                  {currentSlide.badge}
                </motion.div>

                {/* SeshNx Hero Logo */}
                <div className="flex flex-col items-center mb-6 sm:mb-8">
                  <img 
                    src={SeshNxLogo} 
                    alt="SeshNx" 
                    className="h-20 sm:h-28 md:h-36 lg:h-44 w-auto object-contain drop-shadow-[0_16px_40px_rgba(61,132,237,0.45)]"
                  />
                </div>

                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-200 max-w-4xl leading-relaxed mb-8 sm:mb-12 font-light">
                  {currentSlide.subtitle}
                </p>

                {/* Amalia Media LLC Corporate Card */}
                <div className="p-6 sm:p-8 rounded-2xl bg-[#2c2e36] border border-gray-700 shadow-2xl max-w-lg w-full text-center flex flex-col items-center">
                  <img 
                    src={AmaliaMediaLogo} 
                    alt="Amalia Media LLC Logo" 
                    className="h-12 sm:h-16 w-auto object-contain mb-4 rounded-xl brightness-105"
                  />
                  <span className="text-xs sm:text-sm font-mono text-gray-400 uppercase tracking-wider block mb-1">
                    Confidential Investor Presentation
                  </span>
                  <p className="text-base sm:text-lg text-white font-bold">
                    Amalia Media LLC
                  </p>
                  <p className="text-xs sm:text-sm text-brand-blue font-mono font-medium mt-1">
                    Founder & CEO: Ricardo Herrera-Delgado
                  </p>
                </div>

                <div className="mt-8 sm:mt-12 flex flex-wrap justify-center items-center gap-3 text-xs sm:text-sm text-gray-400 font-mono">
                  <span>Use [ → ] Arrow Keys or [ Space ] to navigate</span>
                  <span>•</span>
                  <span>Press [ N ] for Notes</span>
                  <span>•</span>
                  <span>Press [ P ] for PDF</span>
                </div>
              </div>
            ) : (
              /* Standard Slides */
              <div className="space-y-6 sm:space-y-8 w-full">
                {/* Slide Top Headline */}
                <div className="border-b border-gray-700/80 pb-4 sm:pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-mono tracking-widest text-brand-blue uppercase font-bold">
                      {currentSlide.category}
                    </span>
                    <span className="text-xs sm:text-sm font-mono text-gray-400">
                      Slide {String(currentSlide.number).padStart(2, '0')} of {totalSlides}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
                    {currentSlide.title}
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mt-2 font-light leading-relaxed max-w-6xl">
                    {currentSlide.subtitle}
                  </p>
                </div>

                {/* Interactive Demo Injection */}
                {currentSlide.hasInteractiveDemo === 'studio' && (
                  <div className="w-full">
                    <InteractiveStudioDemo 
                      syncRoomId={syncState.selectedStudioRoomId}
                      syncKioskStep={syncState.kioskStep}
                      onSyncChange={handleStudioSyncChange}
                      isViewer={Boolean(activePitchId && !isHost && !isFreeRoam)}
                    />
                  </div>
                )}

                {currentSlide.hasInteractiveDemo === 'recoupment' && (
                  <div className="w-full">
                    <InteractiveRecoupmentDemo 
                      syncAdvance={syncState.recoupmentAdvance}
                      syncStreams={syncState.recoupmentStreams}
                      syncShare={syncState.recoupmentShare}
                      onSyncChange={handleRecoupmentSyncChange}
                      isViewer={Boolean(activePitchId && !isHost && !isFreeRoam)}
                    />
                  </div>
                )}

                {currentSlide.hasInteractiveDemo === 'economics' && (
                  <div className="w-full">
                    <InteractiveEconomicsDemo 
                      syncStudioCount={syncState.economicsStudioCount}
                      onSyncChange={handleEconomicsSyncChange}
                      isViewer={Boolean(activePitchId && !isHost && !isFreeRoam)}
                    />
                  </div>
                )}

                {/* Bullets List (if any) */}
                {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                  <div className={`grid grid-cols-1 ${currentSlide.bullets.length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} gap-5 lg:gap-6`}>
                    {currentSlide.bullets.map((bullet, idx) => (
                      <div
                        key={idx}
                        className="p-6 lg:p-8 rounded-2xl bg-[#2c2e36] border border-gray-700 hover:border-brand-blue/50 transition-all flex flex-col justify-between shadow-lg"
                      >
                        <div>
                          <div className="flex items-start gap-3 mb-3 text-brand-blue">
                            <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6 shrink-0 mt-0.5" />
                            <h4 className="font-bold text-base sm:text-lg lg:text-xl text-white leading-snug">
                              {bullet.title}
                            </h4>
                          </div>
                          <p className="text-sm sm:text-base lg:text-lg text-gray-300 leading-relaxed pl-8">
                            {bullet.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Highlight Metrics (if any) */}
                {currentSlide.metrics && currentSlide.metrics.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6 mt-6">
                    {currentSlide.metrics.map((metric, idx) => (
                      <div
                        key={idx}
                        className="p-6 lg:p-8 rounded-2xl bg-[#2c2e36] border border-gray-700 flex flex-col items-center text-center shadow-lg"
                      >
                        <span className="text-xs sm:text-sm lg:text-base font-mono uppercase tracking-wider text-gray-400 mb-2 font-semibold">
                          {metric.label}
                        </span>
                        <span className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-emerald-400">
                          {metric.value}
                        </span>
                        <span className="text-xs sm:text-sm lg:text-base text-gray-300 mt-2 font-medium">
                          {metric.subtext}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Co-Branded Closing Banner on Slide 11 */}
                {currentSlide.id === 'ask' && (
                  <div className="mt-6 p-6 rounded-2xl bg-[#2c2e36] border border-gray-700 flex flex-wrap items-center justify-between gap-6 shadow-xl">
                    <div className="flex items-center gap-5">
                      <img 
                        src={AmaliaMediaLogo} 
                        alt="Amalia Media LLC" 
                        className="h-10 sm:h-12 w-auto object-contain rounded-lg"
                      />
                      <div className="h-8 w-px bg-gray-700 hidden sm:block" />
                      <img 
                        src={SeshNxLogo} 
                        alt="SeshNx" 
                        className="h-8 sm:h-9 w-auto object-contain"
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-sm sm:text-base text-gray-200 block font-medium">Ready to lead or participate in this SAFE round?</span>
                      <span className="text-sm sm:text-lg text-brand-blue font-mono font-bold">Amalia Media LLC • $500K – $1.0M Allocation</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ========================================================================= */}
      {/* PRESENTER NOTES DRAWER (PRESS 'N' TO TOGGLE)                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="no-print fixed bottom-0 left-0 right-0 z-50 bg-[#1f2128]/98 border-t border-brand-blue/40 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="max-w-[1700px] mx-auto px-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-700 mb-4">
                <div className="flex items-center gap-2 text-brand-blue font-mono text-sm uppercase tracking-wider font-bold">
                  <FileText className="w-5 h-5" />
                  <span>Presenter Notes • Slide {currentSlide.number} Speaking Script</span>
                </div>
                <button
                  onClick={() => setShowNotes(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {currentSlide.presenterNotes.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm sm:text-base text-gray-200">
                    <span className="text-brand-blue font-mono font-bold shrink-0 text-base">#{idx + 1}</span>
                    <p className="leading-relaxed font-sans">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* THUMBNAIL SLIDE PICKER DRAWER (PRESS 'G' TO TOGGLE)                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showThumbnails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="no-print fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-6 flex flex-col justify-center items-center"
          >
            <div className="max-w-6xl w-full bg-[#1f2128] border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[85vh]">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-700">
                <div className="flex items-center gap-2.5">
                  <Grid className="w-5 h-5 text-brand-blue" />
                  <h3 className="font-bold text-white text-lg">Slide Navigator</h3>
                  <span className="text-xs sm:text-sm text-gray-400 font-mono">Select any slide to jump</span>
                </div>
                <button
                  onClick={() => setShowThumbnails(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {PITCH_DECK_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => handleSelectSlide(idx)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-32 ${
                      currentSlideIndex === idx
                        ? 'bg-brand-blue/20 border-brand-blue shadow-lg shadow-brand-blue/30'
                        : 'bg-[#2c2e36] border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center text-xs font-mono text-gray-400 mb-1.5">
                        <span>SLIDE {String(slide.number).padStart(2, '0')}</span>
                        {slide.hasInteractiveDemo && (
                          <span className="text-brand-blue font-bold">• DEMO</span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">{slide.title}</h4>
                    </div>
                    <span className="text-xs text-gray-400 uppercase font-mono tracking-wider line-clamp-1">
                      {slide.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* SCREEN FOOTER                                                            */}
      {/* ========================================================================= */}
      <footer className="no-print border-t border-gray-700/80 px-4 sm:px-8 py-3 bg-[#1f2128]/95 text-xs sm:text-sm text-gray-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img 
            src={AmaliaMediaLogo} 
            alt="Amalia Media LLC" 
            className="h-5 sm:h-6 w-auto object-contain rounded"
          />
          <span className="font-mono text-white font-medium">Amalia Media LLC</span>
          <span className="text-gray-600">•</span>
          <img 
            src={SeshNxLogo} 
            alt="SeshNx" 
            className="h-4 sm:h-5 w-auto object-contain"
          />
          <span className="text-xs text-gray-400 hidden sm:inline">Pre-Seed / Early Seed Pitch Deck</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
          <span>Shortcuts: [← / →] Navigate</span>
          <span>[N] Presenter Notes</span>
          <span>[G] Slide Grid</span>
          <span>[F] Fullscreen</span>
          <span>[P] Print PDF</span>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* COMPLETE 11-SLIDE SEQUENTIAL CONTAINER (FOR 16:9 PDF EXPORT)             */}
      {/* ========================================================================= */}
      <div className="print-container">
        {PITCH_DECK_SLIDES.map((slide) => (
          <div key={`print-${slide.id}`} className="print-slide-page">
            {slide.id === 'title' ? (
              /* Title / Cover Slide in Print */
              <div className="flex flex-col items-center justify-center text-center py-8 px-6 h-full">
                <div className="mb-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-blue/15 border border-brand-blue/40 text-brand-blue text-sm font-mono uppercase tracking-widest font-bold">
                  <Sparkles className="w-4 h-4" />
                  {slide.badge}
                </div>
                <img src={SeshNxLogo} alt="SeshNx" className="h-24 w-auto object-contain mb-8" />
                <p className="text-2xl text-gray-200 max-w-3xl leading-relaxed mb-8 font-light">
                  {slide.subtitle}
                </p>
                <div className="p-6 rounded-2xl bg-[#2c2e36] border border-gray-700 shadow-xl max-w-md w-full text-center flex flex-col items-center">
                  <img src={AmaliaMediaLogo} alt="Amalia Media LLC" className="h-14 w-auto object-contain mb-3 rounded-xl" />
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block mb-1">
                    Confidential Investor Presentation
                  </span>
                  <p className="text-base text-white font-bold">Amalia Media LLC</p>
                  <p className="text-sm text-brand-blue font-mono font-medium mt-1">Founder & CEO: Ricardo Herrera-Delgado</p>
                  <p className="text-sm text-brand-blue font-mono font-medium mt-1">Email: ricardohd1991@gmail.com</p>
                  <p className="text-sm text-brand-blue font-mono font-medium mt-1">Phone Number: 310 346-7626</p>
                </div>
              </div>
            ) : (
              /* Content Slide in Print */
              <div className="flex flex-col justify-between h-full">
                {/* Header */}
                <div className="border-b border-gray-700 pb-3 mb-4">
                  <div className="flex justify-between items-center text-xs font-mono text-brand-blue mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <img src={SeshNxLogo} alt="SeshNx" className="h-6 w-auto object-contain" />
                      <span className="text-gray-600 font-bold">|</span>
                      <span className="text-brand-blue font-bold uppercase tracking-wider text-xs">{slide.category}</span>
                    </div>
                    <div className="text-gray-400 text-xs font-mono">
                      <span>SLIDE {String(slide.number).padStart(2, '0')} / {totalSlides}</span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-white leading-tight">{slide.title}</h2>
                  <p className="slide-subtitle text-base text-gray-300 mt-1 leading-normal">{slide.subtitle}</p>
                </div>

                {/* Slide Body (Demos or Bullets + Metrics) */}
                <div className="flex-1 flex flex-col justify-center my-auto">
                  {/* ============================================================= */}
                  {/* PRINT STATIC DATA PRESENTATION 1: STUDIO OPERATIONS (SLIDE 4)   */}
                  {/* ============================================================= */}
                  {slide.hasInteractiveDemo === 'studio' && (
                    <div className="space-y-4">
                      {/* 3-Room Spatial Facility Breakdown */}
                      <div className="grid grid-cols-3 gap-3.5">
                        <div className="p-3.5 rounded-xl bg-[#2c2e36] border border-brand-blue/50">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-mono text-brand-blue font-bold">SUITE 101 • LIVE ROOM</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">ARMED</span>
                          </div>
                          <h4 className="font-extrabold text-sm text-white mb-0.5">Studio A • Live Tracking</h4>
                          <p className="text-[11px] text-gray-400 font-mono mb-2">SSL 4000E • Neumann U87 Ai • HDX • Burl Mothership (650 sq ft)</p>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-700 text-xs font-mono">
                            <span className="text-gray-400">Hourly Rate:</span>
                            <span className="text-emerald-400 font-bold text-sm">$110.00 / hr</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#2c2e36] border border-purple-500/40">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-mono text-purple-400 font-bold">SUITE 102 • VOCAL BOOTH</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">ON-AIR</span>
                          </div>
                          <h4 className="font-extrabold text-sm text-white mb-0.5">Studio B • Vocal Suite</h4>
                          <p className="text-[11px] text-gray-400 font-mono mb-2">Sony C800G • Avalon VT-737sp • Tube-Tech CL1B (280 sq ft)</p>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-700 text-xs font-mono">
                            <span className="text-gray-400">Hourly Rate:</span>
                            <span className="text-emerald-400 font-bold text-sm">$75.00 / hr</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#2c2e36] border border-emerald-500/40">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-mono text-emerald-400 font-bold">SUITE 103 • DOLBY ATMOS</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">ARMED</span>
                          </div>
                          <h4 className="font-extrabold text-sm text-white mb-0.5">Studio C • Atmos Suite</h4>
                          <p className="text-[11px] text-gray-400 font-mono mb-2">7.1.4 Genelec SAM System • Grace Design m908 (520 sq ft)</p>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-700 text-xs font-mono">
                            <span className="text-gray-400">Hourly Rate:</span>
                            <span className="text-emerald-400 font-bold text-sm">$135.00 / hr</span>
                          </div>
                        </div>
                      </div>

                      {/* Autonomous Kiosk Protocol Card */}
                      <div className="p-3.5 rounded-xl bg-[#23262d] border border-gray-700">
                        <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-gray-700/80">
                          <span className="text-xs font-mono text-brand-blue font-bold uppercase tracking-wider">
                            Trojan Horse On-Premise Kiosk Protocol ($150 Subsidized Hardware Node)
                          </span>
                          <span className="text-xs font-mono text-emerald-400 font-semibold">100% Autonomous • Zero Staff Required</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="p-2.5 rounded-lg bg-[#1a1d21] border border-gray-700/70">
                            <span className="text-[10px] font-mono text-brand-blue font-bold block mb-1">PHASE 1: QR ONBOARDING</span>
                            <p className="text-xs text-gray-200 font-medium">Scan QR Pass on tablet</p>
                            <span className="text-[11px] text-gray-400 font-mono mt-0.5 block">&lt; 5 sec account creation</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#1a1d21] border border-gray-700/70">
                            <span className="text-[10px] font-mono text-brand-blue font-bold block mb-1">PHASE 2: LEGAL SPLITS</span>
                            <p className="text-xs text-gray-200 font-medium">Liability & Split Sheet signed</p>
                            <span className="text-[11px] text-gray-400 font-mono mt-0.5 block">100% metadata compliance</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#1a1d21] border border-gray-700/70">
                            <span className="text-[10px] font-mono text-purple-400 font-bold block mb-1">PHASE 3: RELAY UNLOCK</span>
                            <p className="text-xs text-gray-200 font-medium">Smart lock disengages</p>
                            <span className="text-[11px] text-gray-400 font-mono mt-0.5 block">&lt; 200ms IoT relay signal</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#1a1d21] border border-gray-700/70">
                            <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">PHASE 4: VAULT CAPTURE</span>
                            <p className="text-xs text-gray-200 font-medium">Session Live & 5% GMV fee</p>
                            <span className="text-[11px] text-gray-400 font-mono mt-0.5 block">Cloud stems sync to Vault</span>
                          </div>
                        </div>
                      </div>

                      {/* Operational Metrics */}
                      <div className="grid grid-cols-3 gap-3.5">
                        <div className="p-3 rounded-xl bg-[#2c2e36] border border-gray-700 text-center">
                          <span className="text-[11px] font-mono text-gray-400 uppercase block mb-0.5">Hardware Subsidy Cost</span>
                          <span className="text-xl font-mono font-bold text-brand-blue block">$150 / Facility</span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">Commercial 10-inch tablet node</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#2c2e36] border border-gray-700 text-center">
                          <span className="text-[11px] font-mono text-gray-400 uppercase block mb-0.5">Subsidy Payback Window</span>
                          <span className="text-xl font-mono font-bold text-emerald-400 block">&lt; 7 Days</span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">Repaid by first 30 hrs of bookings</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#2c2e36] border border-gray-700 text-center">
                          <span className="text-[11px] font-mono text-gray-400 uppercase block mb-0.5">Admin Overhead Reduction</span>
                          <span className="text-xl font-mono font-bold text-brand-blue block">-90% Front Desk</span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">Eliminates paper logging & split disputes</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================= */}
                  {/* PRINT STATIC DATA PRESENTATION 2: RECOUPMENT FINTECH (SLIDE 6)  */}
                  {/* ============================================================= */}
                  {slide.hasInteractiveDemo === 'recoupment' && (
                    <div className="space-y-4">
                      {/* Baseline Advance Terms & Waterfall Progress */}
                      <div className="grid grid-cols-12 gap-3.5">
                        {/* Left: Advance Terms (5 cols) */}
                        <div className="col-span-5 p-4 rounded-xl bg-[#2c2e36] border border-gray-700 flex flex-col justify-between">
                          <span className="text-xs font-mono text-brand-blue font-bold uppercase tracking-wider block mb-2 pb-1.5 border-b border-gray-700">
                            Advance Baseline Parameters
                          </span>
                          <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Studio Time Advance:</span>
                              <span className="text-white font-bold">$1,500.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Blended DSP Royalty:</span>
                              <span className="text-gray-200 font-bold">$0.0035 / stream</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Recoupment Allocation:</span>
                              <span className="text-emerald-400 font-bold">25% of gross</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-700/80">
                              <span className="text-gray-400">Breakeven Volume:</span>
                              <span className="text-brand-blue font-bold">1,714,286 streams</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-snug mt-3 pt-2 border-t border-gray-700/80">
                            Direct advance issued to partner studio. 100% liquidated from streaming royalties with zero artist personal liability.
                          </p>
                        </div>

                        {/* Right: Revenue Distribution Table at 750k streams (7 cols) */}
                        <div className="col-span-7 p-4 rounded-xl bg-[#23262d] border border-brand-blue/40 flex flex-col justify-between">
                          <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-gray-700">
                            <span className="text-xs font-mono text-brand-blue font-bold uppercase tracking-wider">
                              Waterfall Financial Breakdown @ 750K Streams
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                              44% RECOUPED
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5 text-xs font-mono mb-2">
                            <div className="p-2 rounded bg-[#1a1d21] border border-gray-700">
                              <span className="text-gray-400 block text-[10px]">GROSS DSP ROYALTIES</span>
                              <span className="text-base font-bold text-white">$2,625.00</span>
                              <span className="text-[10px] text-gray-500 block">750,000 streams × $0.0035</span>
                            </div>
                            <div className="p-2 rounded bg-[#1a1d21] border border-gray-700">
                              <span className="text-gray-400 block text-[10px]">INDIENX PLATFORM TAKE (10%)</span>
                              <span className="text-base font-bold text-brand-blue">$262.50</span>
                              <span className="text-[10px] text-gray-500 block">Distribution fee</span>
                            </div>
                            <div className="p-2 rounded bg-[#1a1d21] border border-gray-700">
                              <span className="text-gray-400 block text-[10px]">ADVANCE RECOUPED (25%)</span>
                              <span className="text-base font-bold text-emerald-400">$656.25</span>
                              <span className="text-[10px] text-gray-500 block">$843.75 balance remaining</span>
                            </div>
                            <div className="p-2 rounded bg-[#1a1d21] border border-gray-700">
                              <span className="text-gray-400 block text-[10px]">ARTIST NET CASH PAYOUT</span>
                              <span className="text-base font-bold text-emerald-300">$1,706.25</span>
                              <span className="text-[10px] text-gray-500 block">Stripe Connect liquid deposit</span>
                            </div>
                          </div>

                          <div className="w-full bg-[#1a1d21] rounded-full h-2.5 overflow-hidden border border-gray-700">
                            <div className="bg-gradient-to-r from-brand-blue to-emerald-400 h-full rounded-full" style={{ width: '44%' }} />
                          </div>
                        </div>
                      </div>

                      {/* Closed-Loop Fintech Metrics */}
                      <div className="grid grid-cols-3 gap-3.5">
                        <div className="p-3 rounded-xl bg-[#2c2e36] border border-gray-700 text-center">
                          <span className="text-[11px] font-mono text-gray-400 uppercase block mb-0.5">Negative Working Capital</span>
                          <span className="text-xl font-mono font-bold text-brand-blue block">100% Closed-Loop</span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">Capital spent strictly inside studio network</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#2c2e36] border border-gray-700 text-center">
                          <span className="text-[11px] font-mono text-gray-400 uppercase block mb-0.5">Customer Retention</span>
                          <span className="text-xl font-mono font-bold text-emerald-400 block">Zero Churn</span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">Contractually bound until fully recouped</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#2c2e36] border border-gray-700 text-center">
                          <span className="text-[11px] font-mono text-gray-400 uppercase block mb-0.5">Evergreen Take Rate</span>
                          <span className="text-xl font-mono font-bold text-brand-blue block">10% Perpetual</span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">Post-recoupment ongoing distribution fee</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================= */}
                  {/* PRINT STATIC DATA PRESENTATION 3: REVENUE ENGINE (SLIDE 7)      */}
                  {/* ============================================================= */}
                  {slide.hasInteractiveDemo === 'economics' && (
                    <div className="space-y-4">
                      {/* Studio Node Unit Economics & Milestone Growth Table */}
                      <div className="grid grid-cols-12 gap-3.5">
                        {/* Left: Per Studio Unit Model (4 cols) */}
                        <div className="col-span-4 p-4 rounded-xl bg-[#2c2e36] border border-gray-700 flex flex-col justify-between">
                          <span className="text-xs font-mono text-brand-blue font-bold uppercase tracking-wider block mb-2 pb-1.5 border-b border-gray-700">
                            Per-Studio Node Unit Model
                          </span>
                          <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Tablet Hardware:</span>
                              <span className="text-white font-bold">$150 one-time</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Core SaaS License:</span>
                              <span className="text-brand-blue font-bold">$149/mo ($1,788/yr)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Avg Billable GMV:</span>
                              <span className="text-gray-200 font-bold">$12,000 / mo</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">5% GMV Take Rate:</span>
                              <span className="text-emerald-400 font-bold">$600/mo ($7,200/yr)</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-700/80">
                              <span className="text-gray-400">Annual Value / Node:</span>
                              <span className="text-white font-black text-sm">$8,988 / yr</span>
                            </div>
                          </div>
                          <div className="mt-3 p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-[11px] text-emerald-300 font-mono">
                            ✓ LTV / CAC &gt; 25x • Repaid in &lt; 7 days
                          </div>
                        </div>

                        {/* Right: Multi-Stage Milestone Table (8 cols) */}
                        <div className="col-span-8 p-4 rounded-xl bg-[#23262d] border border-brand-blue/40 flex flex-col justify-between">
                          <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-gray-700">
                            <span className="text-xs font-mono text-brand-blue font-bold uppercase tracking-wider">
                              ARR Scaling Milestones Matrix (SaaS + GMV + Distribution)
                            </span>
                            <span className="text-xs font-mono text-gray-400">NAICS 513210</span>
                          </div>

                          <table className="w-full text-left text-xs font-mono">
                            <thead>
                              <tr className="border-b border-gray-700 text-gray-400 text-[11px]">
                                <th className="pb-1.5 font-medium">REVENUE STREAM</th>
                                <th className="pb-1.5 font-medium text-center">25 STUDIOS (BETA)</th>
                                <th className="pb-1.5 font-medium text-center text-brand-blue font-bold">100 STUDIOS (SEED)</th>
                                <th className="pb-1.5 font-medium text-center text-emerald-400 font-bold">250 STUDIOS (SERIES A)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 text-gray-200">
                              <tr>
                                <td className="py-2 text-gray-300">Core SaaS Subscriptions ($149/mo)</td>
                                <td className="py-2 text-center text-gray-400">$44,700 / yr</td>
                                <td className="py-2 text-center text-white font-bold">$178,800 / yr</td>
                                <td className="py-2 text-center text-emerald-300">$447,000 / yr</td>
                              </tr>
                              <tr>
                                <td className="py-2 text-gray-300">5% Studio Booking GMV Spread</td>
                                <td className="py-2 text-center text-gray-400">$180,000 / yr</td>
                                <td className="py-2 text-center text-white font-bold">$720,000 / yr</td>
                                <td className="py-2 text-center text-emerald-300">$1,800,000 / yr</td>
                              </tr>
                              <tr>
                                <td className="py-2 text-gray-300">IndieNx Distribution / Advance Take</td>
                                <td className="py-2 text-center text-gray-400">$45,000 / yr</td>
                                <td className="py-2 text-center text-white font-bold">$180,000 / yr</td>
                                <td className="py-2 text-center text-emerald-300">$450,000 / yr</td>
                              </tr>
                              <tr className="bg-brand-blue/10 font-bold text-white">
                                <td className="py-2 pl-2 text-brand-blue uppercase">Total Blended Run-Rate ARR</td>
                                <td className="py-2 text-center text-gray-300">$269,700 / yr</td>
                                <td className="py-2 text-center text-brand-blue text-sm font-black">$1,078,800 / yr</td>
                                <td className="py-2 text-center text-emerald-400 text-sm font-black">$2,697,000 / yr</td>
                              </tr>
                              <tr className="text-gray-400 text-[11px]">
                                <td className="py-1.5 pl-2">Processed Platform GMV Flow</td>
                                <td className="py-1.5 text-center">$3.6M / yr</td>
                                <td className="py-1.5 text-center font-bold text-gray-200">$14.4M / yr</td>
                                <td className="py-1.5 text-center font-bold text-emerald-400">$36.0M / yr</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Financial Milestones */}
                      <div className="grid grid-cols-3 gap-3.5">
                        <div className="p-3 rounded-xl bg-[#2c2e36] border border-gray-700 text-center">
                          <span className="text-[11px] font-mono text-gray-400 uppercase block mb-0.5">Seed Run-Rate ARR Target</span>
                          <span className="text-xl font-mono font-bold text-brand-blue block">$1,078,800</span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">Target at 100 partner studios</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#2c2e36] border border-gray-700 text-center">
                          <span className="text-[11px] font-mono text-gray-400 uppercase block mb-0.5">Hardware Subsidy Deployment</span>
                          <span className="text-xl font-mono font-bold text-emerald-400 block">$15,000 Total</span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">100 tablets @ $150 unlocks $14.4M GMV</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#2c2e36] border border-gray-700 text-center">
                          <span className="text-[11px] font-mono text-gray-400 uppercase block mb-0.5">Operational Breakeven</span>
                          <span className="text-xl font-mono font-bold text-brand-blue block">45 Studios</span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">Phase 3 cash-flow self-sustaining</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bullets */}
                  {slide.bullets && (
                    <div className={`grid ${slide.bullets.length === 4 ? 'grid-cols-4' : 'grid-cols-3'} gap-4 mb-5`}>
                      {slide.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="print-card-bullet rounded-xl bg-[#2c2e36] border border-gray-700">
                          <h4 className="font-bold text-white mb-1.5 leading-snug">{b.title}</h4>
                          <p className="text-gray-300 leading-relaxed">{b.desc}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Metrics */}
                  {slide.metrics && (
                    <div className="grid grid-cols-3 gap-4">
                      {slide.metrics.map((m, mIdx) => (
                        <div key={mIdx} className="print-card-metric rounded-xl bg-[#2c2e36] border border-gray-700 text-center">
                          <span className="metric-label text-gray-400 uppercase block font-mono font-medium">{m.label}</span>
                          <span className="metric-value font-mono font-bold text-brand-blue block">{m.value}</span>
                          <span className="metric-subtext text-gray-400 block font-sans">{m.subtext}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Print Footer */}
                <div className="pt-3 border-t border-gray-700 flex justify-between items-center text-xs font-mono text-gray-400">
                  <div className="flex items-center gap-2">
                    <img src={AmaliaMediaLogo} alt="Amalia Media LLC" className="h-4 w-auto object-contain" />
                    <span>Amalia Media LLC • SeshNx Creative OS</span>
                  </div>
                  <span>Confidential Investor Deck • $500K–$1M SAFE</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Live Broadcast Host Management Modal */}
      <LiveBroadcastModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        pitchId={activePitchId || 'amalia-seed'}
        isBroadcasting={isBroadcasting}
        viewersCount={viewersCount}
        syncDemos={syncDemos}
        onToggleSyncDemos={() => setSyncDemos((prev) => !prev)}
        onStartBroadcast={handleStartBroadcast}
        onStopBroadcast={handleStopBroadcast}
      />

      {/* Live Audience Reactions Floating Overlay */}
      <LiveReactionsOverlay isLive={Boolean(activePitchId || isBroadcasting)} />
    </div>
  );
}
