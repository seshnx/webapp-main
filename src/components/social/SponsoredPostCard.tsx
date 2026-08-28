import React, { useEffect, useRef } from 'react';
import { Sparkles, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTrackAdImpression, useTrackAdClick } from '../../hooks/useConvex';
import UserAvatar from '../shared/UserAvatar';

export interface SponsoredPost {
  _id: any;
  title: string;
  content: string;
  mediaUrl?: string;
  sponsorName: string;
  sponsorLogo?: string;
  sponsorUrl: string;
  ctaText: string;
  category?: string;
}

interface SponsoredPostCardProps {
  ad: SponsoredPost;
}

export default function SponsoredPostCard({ ad }: SponsoredPostCardProps) {
  const trackImpression = useTrackAdImpression();
  const trackClick = useTrackAdClick();
  const hasTrackedImpression = useRef(false);

  useEffect(() => {
    if (!hasTrackedImpression.current && ad._id) {
      hasTrackedImpression.current = true;
      trackImpression({ adId: ad._id }).catch((e) =>
        console.warn('Impression logging:', e)
      );
    }
  }, [ad._id, trackImpression]);

  const handleCtaClick = () => {
    if (ad._id) {
      trackClick({ type: 'sponsored_post', id: ad._id.toString() }).catch((e) =>
        console.warn('Click logging:', e)
      );
    }
    window.open(ad.sponsorUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white/95 dark:bg-dark-card/95 backdrop-blur-md rounded-3xl p-5 border border-purple-500/20 dark:border-purple-500/30 shadow-md shadow-purple-950/5 relative overflow-hidden transition hover:border-purple-500/40">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <UserAvatar
              src={ad.sponsorLogo}
              name={ad.sponsorName}
              size="md"
            />
            <div className="absolute -bottom-1 -right-1 bg-brand-blue text-white rounded-full p-0.5 border border-white dark:border-gray-900">
              <ShieldCheck size={10} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                {ad.sponsorName}
              </h4>
              <span className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-600 dark:text-purple-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1">
                <Sparkles size={10} /> Sponsored
              </span>
            </div>
            <span className="text-[11px] text-gray-400">Promoted Partner</span>
          </div>
        </div>

        <button
          onClick={handleCtaClick}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-blue to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 shrink-0"
        >
          <span>{ad.ctaText || 'Learn More'}</span>
          <ExternalLink size={12} />
        </button>
      </div>

      {/* Post Headline & Body Content */}
      <div className="space-y-2 mb-4">
        {ad.title && (
          <h3 className="font-black text-sm sm:text-base text-gray-900 dark:text-white">
            {ad.title}
          </h3>
        )}
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
          {ad.content}
        </p>
      </div>

      {/* Media Display */}
      {ad.mediaUrl && (
        <div
          onClick={handleCtaClick}
          className="rounded-2xl overflow-hidden mb-3 border dark:border-gray-700/60 max-h-96 bg-black/5 dark:bg-black/20 cursor-pointer group relative"
        >
          <img
            src={ad.mediaUrl}
            alt={ad.title || 'Sponsored media'}
            className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <span className="text-white text-xs font-bold flex items-center gap-1.5">
              <span>Visit Partner Website</span>
              <ExternalLink size={12} />
            </span>
          </div>
        </div>
      )}

      {/* Bottom Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t dark:border-gray-800">
        <span>Verified Audio Partner</span>
        <button
          onClick={handleCtaClick}
          className="text-brand-blue font-bold hover:underline flex items-center gap-1"
        >
          <span>{new URL(ad.sponsorUrl).hostname.replace('www.', '')}</span>
          <ExternalLink size={10} />
        </button>
      </div>
    </div>
  );
}
