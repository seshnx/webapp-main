import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ExternalLink, ShieldCheck, Play, Volume2, VolumeX, Globe } from 'lucide-react';
import { useTrackAdImpression, useTrackAdClick } from '../../hooks/useConvex';
import UserAvatar from '../shared/UserAvatar';

export interface SponsoredShort {
  _id: any;
  title: string;
  content: string;
  mediaUrl?: string;
  videoUrl?: string;
  sponsorName: string;
  sponsorLogo?: string;
  sponsorUrl: string;
  ctaText: string;
  category?: string;
}

interface SponsoredReelCardProps {
  ad: SponsoredShort;
}

export default function SponsoredReelCard({ ad }: SponsoredReelCardProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Auto-play muted by default
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackImpression = useTrackAdImpression();
  const trackClick = useTrackAdClick();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current && ad._id) {
      hasTracked.current = true;
      trackImpression({ adId: ad._id }).catch((e) => console.warn('Ad impression error:', e));
    }
  }, [ad._id, trackImpression]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleCtaClick = () => {
    if (ad._id) {
      trackClick({ type: 'sponsored_post', id: ad._id.toString() }).catch((e) =>
        console.warn('Ad click error:', e)
      );
    }
    window.open(ad.sponsorUrl || 'https://seshnx.com', '_blank', 'noopener,noreferrer');
  };

  const videoSource = ad.videoUrl || ad.mediaUrl || 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-playing-the-piano-41772-large.mp4';

  return (
    <div className="relative w-full h-[75vh] bg-black rounded-3xl overflow-hidden shadow-2xl border-2 border-brand-blue/40 flex items-center justify-center">
      {/* Video Content */}
      <video
        ref={videoRef}
        src={videoSource}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
      />

      {/* Play/Pause Overlay Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
          <div className="p-4 rounded-full bg-black/60 text-white backdrop-blur-md">
            <Play size={36} fill="white" />
          </div>
        </div>
      )}

      {/* Top Banner Badges */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-brand-blue/30 text-white">
          <div className="w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center text-white text-[10px] font-bold">
            <Sparkles size={11} />
          </div>
          <span className="text-xs font-black text-brand-blue">SPONSORED</span>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Right Side Action Strip */}
      <div className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-4">
        {/* Sponsor Avatar */}
        <div className="relative cursor-pointer" onClick={handleCtaClick}>
          <div className="p-0.5 bg-gradient-to-tr from-brand-blue to-blue-400 rounded-full">
            <UserAvatar src={ad.sponsorLogo} name={ad.sponsorName} size="md" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-brand-blue text-white rounded-full p-0.5 border border-white">
            <ShieldCheck size={10} />
          </div>
        </div>

        {/* External Visit Button */}
        <button
          onClick={handleCtaClick}
          className="p-3 rounded-full bg-brand-blue text-white hover:bg-blue-600 transition shadow-lg shadow-blue-500/30"
          title="Visit Sponsor"
        >
          <Globe size={20} />
        </button>
      </div>

      {/* Bottom Sponsor Info & CTA Button */}
      <div className="absolute bottom-4 left-4 right-16 z-20 text-white space-y-2.5 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <h3
            className="font-black text-sm hover:underline cursor-pointer flex items-center gap-1.5 text-white drop-shadow"
            onClick={handleCtaClick}
          >
            <span>{ad.sponsorName}</span>
          </h3>
          <span className="text-[10px] bg-brand-blue text-white px-2 py-0.5 rounded-full font-bold">
            Featured Partner
          </span>
        </div>

        {ad.title && (
          <h4 className="text-xs font-bold text-gray-100 drop-shadow line-clamp-1">{ad.title}</h4>
        )}

        <p className="text-xs text-gray-200 line-clamp-2 drop-shadow leading-relaxed">{ad.content}</p>

        {/* CTA Link Button */}
        <div className="pt-1 pointer-events-auto">
          <button
            onClick={handleCtaClick}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-blue to-blue-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/40 hover:brightness-110 transition active:scale-[0.98]"
          >
            <span>{ad.ctaText || 'Learn More ↗'}</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
