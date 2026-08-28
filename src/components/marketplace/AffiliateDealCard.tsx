import React from 'react';
import { ExternalLink, Tag, Sparkles, ShoppingBag } from 'lucide-react';
import { useTrackAdClick } from '../../hooks/useConvex';

export interface AffiliateGearDeal {
  _id: any;
  retailer: string; // "Sweetwater" | "Guitar Center" | "Reverb"
  title: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  productUrl: string;
  affiliateCode: string;
}

interface AffiliateDealCardProps {
  deal: AffiliateGearDeal;
}

export default function AffiliateDealCard({ deal }: AffiliateDealCardProps) {
  const trackClick = useTrackAdClick();

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deal._id) {
      trackClick({ type: 'affiliate_gear', id: deal._id.toString() }).catch((err) =>
        console.warn('Affiliate click logging:', err)
      );
    }

    // Build URL with affiliate tracking code appended
    try {
      const url = new URL(deal.productUrl);
      if (deal.affiliateCode) {
        url.searchParams.set('ref', deal.affiliateCode);
        url.searchParams.set('utm_source', 'seshnx');
        url.searchParams.set('utm_medium', 'affiliate_deal');
      }
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } catch {
      window.open(deal.productUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const discountPercent =
    deal.originalPrice && deal.originalPrice > deal.price
      ? Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)
      : null;

  return (
    <div
      onClick={handleBuyClick}
      className="bg-white dark:bg-dark-card rounded-3xl p-4 border border-purple-500/20 dark:border-purple-500/30 shadow-sm hover:shadow-lg hover:border-purple-500/50 transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
    >
      {/* Top Retailer & Discount Strip */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-brand-blue/15 to-purple-600/15 text-purple-600 dark:text-purple-300 border border-purple-500/20 flex items-center gap-1">
          <Sparkles size={10} /> {deal.retailer} Deal
        </span>

        {discountPercent && (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Image Thumbnail */}
      <div className="h-44 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800/60 mb-3 flex items-center justify-center p-2 relative">
        <img
          src={deal.imageUrl}
          alt={deal.title}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Product Details */}
      <div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
          {deal.brand} • {deal.category}
        </span>
        <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2 mt-0.5 group-hover:text-brand-blue transition">
          {deal.title}
        </h4>
      </div>

      {/* Pricing & Outbound Button */}
      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t dark:border-gray-800">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              ${deal.price.toFixed(2)}
            </span>
            {deal.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                ${deal.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-[9px] text-gray-400">Direct Retailer Link</span>
        </div>

        <button
          onClick={handleBuyClick}
          className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-brand-blue text-gray-800 hover:text-white dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-brand-blue dark:hover:text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
        >
          <span>Shop</span>
          <ExternalLink size={11} />
        </button>
      </div>
    </div>
  );
}
