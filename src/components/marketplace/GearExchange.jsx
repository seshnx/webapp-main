import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Search, Plus, Camera, DollarSign, X, CheckCircle, AlertTriangle, Loader2,
  MapPin, Shield, Lock, Truck, CreditCard, Info, Package, Star, MessageCircle,
  Send, Clock, BadgeCheck, ShoppingCart, ArrowRight, Grid, List as ListIcon,
  SlidersHorizontal, ChevronDown, Sparkles, Filter, ExternalLink, RefreshCw,
  Heart, Share2, Tag, Check, Eye, Copy, ArrowUpRight, CheckCheck, FileText,
  Upload, Trash2, Box, Sparkle, HelpCircle, ArrowLeft, ChevronRight
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useTransactionMutations } from '../../services/marketplaceService';
import { useUpload } from '../../hooks/useUpload';
import UserAvatar from '../shared/UserAvatar';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import SafeExchangeTransaction from './SafeExchangeTransaction';
import ShippingVerification from './ShippingVerification';

// =============================================================================
// CATEGORIES & CONSTANTS
// =============================================================================

const GEAR_CATEGORIES = [
  { id: 'all', label: 'All Gear', icon: '🎧' },
  { id: 'Microphones', label: 'Microphones', icon: '🎙️' },
  { id: 'Audio Interfaces', label: 'Interfaces', icon: '🎛️' },
  { id: 'Studio Monitors', label: 'Monitors & Headphones', icon: '🔊' },
  { id: 'Preamps & Outboard', label: 'Preamps & Outboard', icon: '🎚️' },
  { id: 'Synthesizers & Keyboards', label: 'Synths & Keys', icon: '🎹' },
  { id: 'Guitars & Pedals', label: 'Guitars & FX', icon: '🎸' },
  { id: 'Software & Plugins', label: 'Software & Plugins', icon: '💻' },
];

const POPULAR_BRANDS = [
  'Neumann', 'Universal Audio', 'Yamaha', 'Shure', 'Solid State Logic',
  'Genelec', 'Moog', 'Focusrite', 'AKG', 'Roland', 'Sennheiser'
];

const CONDITIONS = [
  { id: 'all', label: 'Any Condition' },
  { id: 'Mint', label: 'Mint (Like New)', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
  { id: 'Excellent', label: 'Excellent', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
  { id: 'Good', label: 'Good (Minor wear)', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
  { id: 'Fair', label: 'Fair (Functional)', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'featured', label: 'Featured & Hot Deals' },
];

const POPULAR_SEARCH_CHIPS = [
  'Neumann U87', 'Apollo x8p', 'Yamaha HS8', 'SSL Fusion', 'Moog Subsequent 37', 'Shure SM7B'
];

// Mandatory 6-angle chassis photos for Section 1
const CHASSIS_ANGLES = [
  { id: 'front', label: 'Front Angle', hint: 'Full direct frontal face view' },
  { id: 'back', label: 'Back / Rear', hint: 'Back panel, connections & labels' },
  { id: 'top', label: 'Top Surface', hint: 'Top casing & upper controls' },
  { id: 'bottom', label: 'Bottom Base', hint: 'Base plate, feet & serial tag' },
  { id: 'left', label: 'Left Side', hint: 'Left chassis profile & vents' },
  { id: 'right', label: 'Right Side', hint: 'Right chassis profile & vents' },
];

// Category-adaptive photo requirements (Section 2) & condition checklists
export const CATEGORY_PHOTO_SPECS = {
  'Microphones': {
    recommendedDetails: [
      { id: 'capsule_grille', label: 'Capsule & Mesh Grille', required: true, hint: 'Close-up of front grille and diaphragm mesh integrity' },
      { id: 'xlr_base', label: 'XLR Connector Pins & Base', required: true, hint: 'Gold pins and clean connector threading' },
      { id: 'switches', label: 'Polar / Pad / Filter Switches', allowNA: true, hint: 'Pattern switches, roll-off, or pad switches' },
      { id: 'serial_plate', label: 'Serial Plate & Model Stamp', allowNA: true, hint: 'Manufacturer sticker, engraved serial, or origin label' },
    ],
    checks: [
      { id: 'capsule_intact', label: 'Diaphragm & mesh grille intact (no dents or moisture damage)' },
      { id: 'xlr_clean', label: 'XLR connector pins clean, firm, and corrosion-free' },
      { id: 'switches_work', label: 'Pad / roll-off / polar switches smooth & functional', allowNA: true },
      { id: 'noise_floor', label: 'Tested for low self-noise & crystal-clear audio signal' },
      { id: 'phantom_power', label: '48V Phantom power or bias voltage tested and working', allowNA: true },
    ]
  },
  'Audio Interfaces': {
    recommendedDetails: [
      { id: 'front_panel', label: 'Front Knobs & Metering LEDs', required: true, hint: 'Gain pots, monitor knob, headphone volume, and LED meters' },
      { id: 'rear_io', label: 'Rear I/O Terminals & Jacks', required: true, hint: 'Line outs, combo jacks, ADAT optical, S/PDIF' },
      { id: 'usb_port', label: 'Host Port (USB-C / TB / FireWire)', required: true, hint: 'Firm socket showing zero damage or play' },
      { id: 'serial_label', label: 'Serial Label & Voltage Tag', allowNA: true, hint: 'Model stamp, serial label, and MAC address' },
    ],
    checks: [
      { id: 'preamps_clean', label: 'Preamps & gain pots noise-free throughout sweep' },
      { id: 'digital_sync', label: 'Thunderbolt / USB host connectivity recognized without dropouts' },
      { id: 'phantom_power', label: '48V Phantom power active and delivers stable voltage' },
      { id: 'outputs_clean', label: 'Main monitor & headphone outputs balanced and crackle-free' },
    ]
  },
  'Synthesizers & Keyboards': {
    recommendedDetails: [
      { id: 'keybed', label: 'Full Keybed & Key Action', allowNA: true, hint: 'Show all keys level and uniform (or mark N/A for desktop/rack)' },
      { id: 'encoders_faders', label: 'Rotary Encoders, Pots & Faders', required: true, hint: 'Pitch/mod wheels, sliders, and rotary pots' },
      { id: 'display_lit', label: 'Display Screen / OLED / LEDs', allowNA: true, hint: 'Powered-on display showing pixel integrity' },
      { id: 'rear_midi', label: 'Rear Audio, MIDI & Power Jacks', required: true, hint: '1/4" stereo outs, 5-pin MIDI DIN, USB' },
    ],
    checks: [
      { id: 'keybed_responsive', label: 'All keys, velocity sensitivity, and aftertouch respond evenly', allowNA: true },
      { id: 'controls_pots', label: 'All rotary encoders, pitch/mod wheels, and buttons functional' },
      { id: 'display_lit', label: 'OLED / LCD screen backlit with 100% pixel integrity', allowNA: true },
      { id: 'midi_audio', label: 'Audio outs and MIDI DIN / USB ports tested' },
      { id: 'presets_save', label: 'Internal battery / flash memory holds user patches' },
    ]
  },
  'Studio Monitors': {
    recommendedDetails: [
      { id: 'tweeter', label: 'Tweeter Dome Close-Up', allowNA: true, hint: 'Check for pushed-in silk/ribbon/metal dome' },
      { id: 'woofer', label: 'Woofer Cone & Rubber Surround', required: true, hint: 'Check for creased cones, voice-coil rub, or dry rot' },
      { id: 'amp_plate', label: 'Rear Amp Plate & Controls', allowNA: true, hint: 'Heatsink, volume pots, acoustic DIP switches, XLR/TRS inputs' },
      { id: 'serial_tag', label: 'Serial Numbers & Factory Match', allowNA: true, hint: 'Matching serial numbers if selling a pair' },
    ],
    checks: [
      { id: 'cones_intact', label: 'Tweeter domes and woofer cones free of dents or voice coil rubbing' },
      { id: 'surround_supple', label: 'Rubber surrounds supple with zero cracking or dry rot' },
      { id: 'amps_quiet', label: 'Internal amplifiers quiet at idle (no hum, buzz, or excessive hiss)', allowNA: true },
      { id: 'room_eq', label: 'Room correction DIP switches / volume knobs work properly', allowNA: true },
    ]
  },
  'Preamps & Outboard': {
    recommendedDetails: [
      { id: 'faceplate', label: 'Faceplate Controls & Pots', required: true, hint: 'Stepped switches, gain attenuators, bypass switches' },
      { id: 'rear_audio', label: 'Rear Audio Connections', required: true, hint: 'Balanced XLR in/out, barrier strips, TRS sidechain' },
      { id: 'meters', label: 'VU Meters / Gain Reduction LEDs', allowNA: true, hint: 'Illuminated VU needle or LED ladder' },
      { id: 'power_voltage', label: 'Power Input & Voltage Selector', required: true, hint: 'IEC socket, fuse cap, voltage toggle (115V/230V)' },
    ],
    checks: [
      { id: 'pots_attenuators', label: 'All potentiometers, stepped switches, and faders scratch-free' },
      { id: 'vu_meters', label: 'VU meters or LED ladders illuminate and react smoothly', allowNA: true },
      { id: 'audio_path', label: 'Tested for clean distortion-free audio path and proper headroom' },
      { id: 'power_verified', label: 'Internal transformer or power supply verified stable' },
    ]
  },
  'Guitars & Pedals': {
    recommendedDetails: [
      { id: 'action_neck', label: 'String Action & Fretboard / Neck', allowNA: true, hint: 'Side profile showing neck relief, string action, and fret wear' },
      { id: 'bridge_saddles', label: 'Bridge Plate & Saddles', allowNA: true, hint: 'Saddles, intonation screws, tremolo block' },
      { id: 'pickups_controls', label: 'Pickups & Footswitches / Pots', required: true, hint: 'Pickups, pots, selector switch, or stomp switch' },
      { id: 'jacks_plate', label: 'Input/Output Jacks & Power Socket', required: true, hint: '1/4" phone jacks, 9V DC barrel connector' },
    ],
    checks: [
      { id: 'switches_clean', label: 'Footswitches, toggles, and pots noise-free when engaged' },
      { id: 'jacks_tight', label: '1/4" input and output jacks firm with no intermittent dropouts' },
      { id: 'power_tested', label: 'DC power jack (and 9V battery terminal if applicable) tested', allowNA: true },
      { id: 'fretwork_straight', label: 'Neck straight, truss rod turns, zero dead frets', allowNA: true },
    ]
  },
  'Software & Plugins': {
    recommendedDetails: [
      { id: 'license_proof', label: 'License Account Proof', required: true, hint: 'Account dashboard screenshot showing registered product' },
      { id: 'transfer_eligibility', label: 'Transfer Eligibility Proof', required: true, hint: 'Confirmation from developer that license is eligible for transfer' },
    ],
    checks: [
      { id: 'transfer_eligible', label: 'License verified transfer-eligible with manufacturer' },
      { id: 'ilok_ready', label: 'iLok / authorization ready for transfer upon purchase' },
    ]
  },
  'Default': {
    recommendedDetails: [
      { id: 'controls', label: 'Main Physical Controls', required: true, hint: 'Buttons, switches, or knobs' },
      { id: 'terminals', label: 'Connections & Terminals', required: true, hint: 'All input and output ports' },
      { id: 'serial_plate', label: 'Serial & Rating Plate', allowNA: true, hint: 'Model stamp or manufacturer plate' },
    ],
    checks: [
      { id: 'fully_operational', label: 'Tested and 100% operational' },
      { id: 'clean_signal', label: 'Audio / data signal clean and without intermittent dropouts' },
      { id: 'physical_good', label: 'Cosmetic and physical integrity matches description' },
    ]
  }
};

const ACCESSORY_SLOTS = [
  { id: 'box', label: 'Original Box & Packaging', hint: 'Factory box, styrofoam inserts, or carrying case' },
  { id: 'power', label: 'Power Supply & Cabling', hint: 'OEM power brick, IEC power cord, or connection cables' },
  { id: 'accessories', label: 'Shockmount / Case / Stand', hint: 'Original clip, shockmount, case candy, or manuals' },
];

export function getTrackingUrl(carrier, trackingNumber) {
  if (!carrier || !trackingNumber) return null;
  const c = carrier.toLowerCase();
  if (c.includes('usps')) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`;
  if (c.includes('ups')) return `https://www.ups.com/track?tracknum=${encodeURIComponent(trackingNumber)}`;
  if (c.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`;
  if (c.includes('dhl')) return `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(trackingNumber)}`;
  return null;
}

// =============================================================================
// MAIN GEAR EXCHANGE COMPONENT (DARK GREEN / EMERALD ACCENTS)
// =============================================================================

export default function GearExchange({ user, userData, setActiveTab, openChat }) {
  const clerkId = user?.id || user?.uid || userData?.clerkId || '';

  // Main Navigation Tabs: 'browse' | 'purchases' | 'sales'
  const [activeMainTab, setActiveMainTab] = useState('browse');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [shippingFilter, setShippingFilter] = useState('all'); // 'all' | 'shipping_only' | 'local_pickup_only' | 'free_shipping'
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modals & Active Selections
  const [selectedItem, setSelectedItem] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [activeEscrowTxId, setActiveEscrowTxId] = useState(null);
  const [escrowMode, setEscrowMode] = useState(null); // 'safe_exchange' | 'shipping' | null
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [escrowTargetItem, setEscrowTargetItem] = useState(null);

  // Tracking Modal for Sales Orders
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingTxTarget, setTrackingTxTarget] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Query live Convex marketplace engine
  const searchFilterArgs = useMemo(() => ({
    searchQuery: debouncedQuery || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    brand: selectedBrand !== 'all' ? selectedBrand : undefined,
    condition: selectedCondition !== 'all' ? selectedCondition : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    verifiedOnly: verifiedOnly ? true : undefined,
    shippingFilter: shippingFilter !== 'all' ? shippingFilter : undefined,
    sortBy,
    limit: 60,
  }), [debouncedQuery, selectedCategory, selectedBrand, selectedCondition, minPrice, maxPrice, verifiedOnly, shippingFilter, sortBy]);

  const items = useQuery(api.marketplace.searchMarketItems, searchFilterArgs) || [];
  const meta = useQuery(api.marketplace.getMarketplaceMeta, {}) || {
    totalItems: 0,
    categoryCounts: {},
    brands: [],
    minPrice: 0,
    maxPrice: 5000,
  };

  // Queries for User Transactions & Listings (Zero dummy data)
  const myPurchases = useQuery(api.marketplace.getTransactionsByBuyer, clerkId ? { buyerId: clerkId } : "skip") || [];
  const mySalesOrders = useQuery(api.marketplace.getTransactionsBySeller, clerkId ? { sellerId: clerkId } : "skip") || [];
  const mySalesListings = useQuery(api.marketplace.getMarketItemsBySeller, clerkId ? { sellerId: clerkId } : "skip") || [];

  // Mutations
  const createItemMutation = useMutation(api.marketplace.createMarketItem);
  const deleteItemMutation = useMutation(api.marketplace.deleteMarketItem);
  const createOfferMutation = useMutation(api.marketplace.createMarketOffer);
  const { addTracking, acceptOffer, rejectOffer, complete, cancel } = useTransactionMutations();

  const resetFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedCondition('all');
    setMinPrice('');
    setMaxPrice('');
    setVerifiedOnly(false);
    setShippingFilter('all');
    setSortBy('newest');
    toast.success('Filters cleared');
  };

  const handleMakeOffer = async () => {
    if (!selectedItem || !offerAmount || isNaN(Number(offerAmount))) {
      toast.error('Please enter a valid offer amount');
      return;
    }

    try {
      await createOfferMutation({
        itemId: selectedItem._id,
        buyerId: clerkId,
        offerAmount: Number(offerAmount),
        message: offerMessage || undefined,
      });
      toast.success('Offer submitted securely to seller!');
      setShowOfferModal(false);
      setOfferAmount('');
      setOfferMessage('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit offer');
    }
  };

  const handleUpdateTracking = async (transactionId, trackingNumber, carrier) => {
    try {
      await addTracking({
        transactionId,
        trackingNumber,
        carrier,
        trackingUrl: getTrackingUrl(carrier, trackingNumber),
      });
      toast.success(`Tracking updated via ${carrier}!`);
      setShowTrackingModal(false);
      setTrackingTxTarget(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update tracking');
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedBrand !== 'all') count++;
    if (selectedCondition !== 'all') count++;
    if (shippingFilter !== 'all') count++;
    if (minPrice || maxPrice) count++;
    if (verifiedOnly) count++;
    return count;
  }, [selectedCategory, selectedBrand, selectedCondition, shippingFilter, minPrice, maxPrice, verifiedOnly]);

  // Sidebar Filter Section Component
  const renderFilterSections = () => (
    <>
      {/* Category Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Categories</h4>
        <div className="space-y-1">
          {GEAR_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = cat.id === 'all'
              ? meta.totalItems
              : (meta.categoryCounts[cat.id] || 0);

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </span>
                {count > 0 && (
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-emerald-150' : 'text-gray-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Verified Condition Toggle */}
      <div className="space-y-2 pt-2 border-t dark:border-gray-800">
        <label className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 cursor-pointer group hover:border-emerald-500/40 transition">
          <div className="flex items-center gap-2">
            <BadgeCheck size={16} className="text-emerald-500" />
            <span className="text-xs font-bold dark:text-gray-200">Verified Condition Only</span>
          </div>
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Fulfillment / Shipping Filter */}
      <div className="space-y-2 pt-2 border-t dark:border-gray-800">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Fulfillment & Delivery</h4>
        <div className="space-y-1">
          {[
            { id: 'all', label: 'All Listings' },
            { id: 'local_pickup_only', label: '🤝 Local Pickup Only' },
            { id: 'shipping_only', label: '🚚 Shipped to Door' },
            { id: 'free_shipping', label: '✨ Free Shipping' },
          ].map((mode) => (
            <label
              key={mode.id}
              className="flex items-center gap-2.5 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
            >
              <input
                type="radio"
                name="fulfillment"
                checked={shippingFilter === mode.id}
                onChange={() => setShippingFilter(mode.id)}
                className="text-emerald-600 focus:ring-emerald-500 dark:bg-gray-800"
              />
              <span className={shippingFilter === mode.id ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''}>
                {mode.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2 pt-2 border-t dark:border-gray-800">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Popular Brands</h4>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedBrand('all')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedBrand === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {POPULAR_BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(selectedBrand === brand ? 'all' : brand)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedBrand === brand
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Condition Filter */}
      <div className="space-y-2 pt-2 border-t dark:border-gray-800">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Condition</h4>
        <div className="space-y-1">
          {CONDITIONS.map((cond) => (
            <label
              key={cond.id}
              className="flex items-center gap-2.5 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
            >
              <input
                type="radio"
                name="condition"
                checked={selectedCondition === cond.id}
                onChange={() => setSelectedCondition(cond.id)}
                className="text-emerald-600 focus:ring-emerald-500 dark:bg-gray-800"
              />
              <span>{cond.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2 pt-2 border-t dark:border-gray-800">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Price Range</h4>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2 text-xs text-gray-400">$</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl pl-6 pr-2 py-1.5 text-xs dark:text-white"
            />
          </div>
          <span className="text-gray-400 text-xs">to</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2 text-xs text-gray-400">$</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl pl-6 pr-2 py-1.5 text-xs dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Safe Exchange Trust Badge */}
      <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs mb-1">
          <Shield size={14} />
          <span>SeshNx Safe Escrow</span>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
          Funds are held securely until the gear arrives and you inspect it. Zero fraud tolerance.
        </p>
      </div>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Banner & Action Header */}
      <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full">
                SeshNx Audio Exchange
              </span>
              <span className="text-xs text-gray-400 font-medium">
                • Verified Gear Condition & Escrow
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black dark:text-white">
              Studio Gear & Audio Marketplace
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Buy and sell verified pro audio hardware, microphones, synthesizers, and studio monitors with full escrow protection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEscrowModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-[#252830] dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm transition shrink-0"
              title="Escrow & Safe Exchange Protection"
            >
              <Shield size={18} className="text-emerald-500" />
              <span className="hidden sm:inline">Escrow & Verification</span>
            </button>
            <button
              onClick={() => setShowListModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] shrink-0"
            >
              <Plus size={18} />
              <span>List Gear for Sale</span>
            </button>
          </div>
        </div>

        {/* Top Exchange Navigation Tabs (Browse, My Purchases, My Sales) */}
        <div className="flex items-center gap-2 mt-6 border-b dark:border-gray-800 pb-3">
          <button
            onClick={() => setActiveMainTab('browse')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMainTab === 'browse'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Grid size={15} />
            <span>Browse Gear</span>
          </button>

          <button
            onClick={() => setActiveMainTab('purchases')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMainTab === 'purchases'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Package size={15} />
            <span>My Purchases</span>
            {myPurchases.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                activeMainTab === 'purchases' ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
              }`}>
                {myPurchases.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveMainTab('sales')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMainTab === 'sales'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Tag size={15} />
            <span>My Sales</span>
            {(mySalesOrders.length + mySalesListings.length) > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                activeMainTab === 'sales' ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
              }`}>
                {mySalesOrders.length + mySalesListings.length}
              </span>
            )}
          </button>
        </div>

        {/* Global Search Bar (Only shown in Browse Tab) */}
        {activeMainTab === 'browse' && (
          <div className="mt-4 relative">
            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-gray-100 dark:bg-[#252830] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold transition shrink-0 relative shadow-xs"
                title="Open Filters"
              >
                <Filter size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 text-gray-400 dark:text-gray-500" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gear by name, brand, model, or specs (e.g. Neumann U87, Apollo x8p, Moog, SSL)..."
                  className="w-full bg-gray-50 dark:bg-[#252830] border border-gray-200 dark:border-gray-700 rounded-2xl pl-12 pr-10 py-3.5 text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Search Chips */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide py-1">
              <span className="text-xs font-bold text-gray-400 shrink-0">Trending:</span>
              {POPULAR_SEARCH_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setSearchQuery(chip)}
                  className={`text-xs px-3 py-1 rounded-xl whitespace-nowrap font-medium transition-all ${
                    searchQuery === chip
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-750'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          TAB CONTENT: MY PURCHASES
         ========================================================================= */}
      {activeMainTab === 'purchases' && (
        <MyPurchasesView
          purchases={myPurchases}
          onOpenShipping={(txId) => {
            setActiveEscrowTxId(txId);
            setEscrowMode('shipping');
          }}
          onOpenSafeExchange={(txId) => {
            setActiveEscrowTxId(txId);
            setEscrowMode('safe_exchange');
          }}
          onComplete={async (txId) => {
            try {
              await complete({ transactionId: txId });
              toast.success('Escrow released and transaction completed!');
            } catch (err) {
              console.error(err);
              toast.error('Failed to complete transaction');
            }
          }}
          onOpenChat={openChat}
          onExplore={() => setActiveMainTab('browse')}
        />
      )}

      {/* =========================================================================
          TAB CONTENT: MY SALES
         ========================================================================= */}
      {activeMainTab === 'sales' && (
        <MySalesView
          orders={mySalesOrders}
          listings={mySalesListings}
          onOpenTracking={(tx) => {
            setTrackingTxTarget(tx);
            setShowTrackingModal(true);
          }}
          onOpenShippingVerification={(txId) => {
            setActiveEscrowTxId(txId);
            setEscrowMode('shipping');
          }}
          onAcceptOffer={async (txId) => {
            try {
              await acceptOffer({ transactionId: txId });
              toast.success('Offer accepted! Buyer notified to fund escrow.');
            } catch (err) {
              console.error(err);
              toast.error('Failed to accept offer');
            }
          }}
          onRejectOffer={async (txId) => {
            try {
              await rejectOffer({ transactionId: txId, reason: 'Declined by seller' });
              toast.success('Offer declined');
            } catch (err) {
              console.error(err);
              toast.error('Failed to reject offer');
            }
          }}
          onDeleteListing={async (itemId) => {
            if (window.confirm('Are you sure you want to remove this listing?')) {
              try {
                await deleteItemMutation({ itemId });
                toast.success('Listing removed');
              } catch (err) {
                console.error(err);
                toast.error('Failed to remove listing');
              }
            }
          }}
          onOpenChat={openChat}
          onListNew={() => setShowListModal(true)}
        />
      )}

      {/* =========================================================================
          TAB CONTENT: BROWSE GEAR
         ========================================================================= */}
      {activeMainTab === 'browse' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Filter Sidebar */}
          <div className="hidden lg:block space-y-5">
            <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-5 space-y-6 shadow-xs sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-sm dark:text-white">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {renderFilterSections()}
            </div>
          </div>

          {/* Right Product Grid Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Controls Header */}
            <div className="bg-white dark:bg-[#1f2128] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition border border-gray-200 dark:border-gray-700 relative shadow-xs"
                >
                  <SlidersHorizontal size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <span className="font-bold text-sm dark:text-white">
                  {items.length} {items.length === 1 ? 'Item' : 'Items'} Found
                </span>
                {debouncedQuery && (
                  <span className="text-xs text-gray-400">
                    for "{debouncedQuery}"
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-semibold dark:text-white focus:outline-none"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Grid size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <ListIcon size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            {items.length === 0 ? (
              <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-12 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Search size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold dark:text-white">No gear matches your search</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                    Try adjusting your keywords, broadening the category filter, or clearing price limits.
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <GearCard
                    key={item._id}
                    item={item}
                    onSelect={() => setSelectedItem(item)}
                    onMakeOffer={() => {
                      setSelectedItem(item);
                      setOfferAmount(item.price.toString());
                      setShowOfferModal(true);
                    }}
                    onBuyNow={() => {
                      setEscrowTargetItem(item);
                      setShowEscrowModal(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <GearListItem
                    key={item._id}
                    item={item}
                    onSelect={() => setSelectedItem(item)}
                    onMakeOffer={() => {
                      setSelectedItem(item);
                      setOfferAmount(item.price.toString());
                      setShowOfferModal(true);
                    }}
                    onBuyNow={() => {
                      setEscrowTargetItem(item);
                      setShowEscrowModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-80 max-w-[85vw] bg-white dark:bg-[#1f2128] h-full p-6 overflow-y-auto space-y-6 z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-emerald-600" />
                  <span className="font-bold text-base dark:text-white">Filter Gear</span>
                </div>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              {renderFilterSections()}

              <div className="pt-4 border-t dark:border-gray-800 flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 rounded-xl border dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Apply ({items.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onMakeOffer={() => {
              setOfferAmount(selectedItem.price.toString());
              setShowOfferModal(true);
            }}
            onBuyNow={() => {
              setEscrowTargetItem(selectedItem);
              setShowEscrowModal(true);
            }}
            onContactSeller={() => {
              if (selectedItem.sellerId) {
                openChat?.(selectedItem.sellerId);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Make Offer Modal */}
      <AnimatePresence>
        {showOfferModal && selectedItem && (
          <MakeOfferModal
            item={selectedItem}
            offerAmount={offerAmount}
            setOfferAmount={setOfferAmount}
            offerMessage={offerMessage}
            setOfferMessage={setOfferMessage}
            onSubmit={handleMakeOffer}
            onClose={() => setShowOfferModal(false)}
          />
        )}
      </AnimatePresence>

      {/* List Gear for Sale Modal (With 3-Section Photo Verification & Dynamic Checklist) */}
      <AnimatePresence>
        {showListModal && (
          <ListGearModal
            clerkId={clerkId}
            onClose={() => setShowListModal(false)}
            createItem={createItemMutation}
          />
        )}
      </AnimatePresence>

      {/* Escrow Option Chooser Modal */}
      <AnimatePresence>
        {showEscrowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#1f2128] rounded-3xl max-w-lg w-full border border-gray-200 dark:border-gray-800 p-6 space-y-5 shadow-2xl relative">
              <button
                onClick={() => { setShowEscrowModal(false); setEscrowTargetItem(null); }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-400">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black dark:text-white">SeshNx Escrow Protection</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {escrowTargetItem ? `Purchasing: ${escrowTargetItem.title}` : 'Choose an exchange verification method'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    const txId = escrowTargetItem?._id || 'tx_safe_' + Date.now();
                    setActiveEscrowTxId(txId);
                    setEscrowMode('safe_exchange');
                    setShowEscrowModal(false);
                  }}
                  className="w-full text-left p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 bg-gray-50 dark:bg-gray-800/50 hover:bg-emerald-50/20 transition group"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <MapPin className="text-emerald-500" size={18} />
                    <span className="font-bold text-sm dark:text-white group-hover:text-emerald-600 transition">
                      In-Person Safe Exchange Meetup
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-7">
                    Meet at verified GPS safe zones (police stations, banks) with camera inspection & immediate escrow release.
                  </p>
                </button>

                <button
                  onClick={() => {
                    const txId = escrowTargetItem?._id || 'tx_ship_' + Date.now();
                    setActiveEscrowTxId(txId);
                    setEscrowMode('shipping');
                    setShowEscrowModal(false);
                  }}
                  className="w-full text-left p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 bg-gray-50 dark:bg-gray-800/50 hover:bg-emerald-50/20 transition group"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Truck className="text-emerald-500" size={18} />
                    <span className="font-bold text-sm dark:text-white group-hover:text-emerald-600 transition">
                      Tracked Inspected Shipping
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-7">
                    Carrier tracking verification with packaging photo evidence and unboxing inspection workflow.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Safe Exchange Transaction Modal */}
      {activeEscrowTxId && escrowMode === 'safe_exchange' && (
        <SafeExchangeTransaction
          transactionId={activeEscrowTxId}
          user={user}
          userData={userData}
          onClose={() => {
            setActiveEscrowTxId(null);
            setEscrowMode(null);
          }}
          onComplete={() => {
            toast.success('Safe Exchange completed successfully!');
            setActiveEscrowTxId(null);
            setEscrowMode(null);
          }}
          onMessage={openChat}
        />
      )}

      {/* Shipping Verification Modal */}
      {activeEscrowTxId && escrowMode === 'shipping' && (
        <ShippingVerification
          transactionId={activeEscrowTxId}
          user={user}
          userData={userData}
          onClose={() => {
            setActiveEscrowTxId(null);
            setEscrowMode(null);
          }}
          onComplete={() => {
            toast.success('Shipping verification logged successfully!');
            setActiveEscrowTxId(null);
            setEscrowMode(null);
          }}
          onMessage={openChat}
        />
      )}

      {/* Shipping Tracking Update Modal */}
      <AnimatePresence>
        {showTrackingModal && trackingTxTarget && (
          <AddTrackingModal
            transaction={trackingTxTarget}
            onClose={() => {
              setShowTrackingModal(false);
              setTrackingTxTarget(null);
            }}
            onUpdateTracking={handleUpdateTracking}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: MY PURCHASES VIEW (ZERO DUMMY DATA)
// =============================================================================

function MyPurchasesView({ purchases, onOpenShipping, onOpenSafeExchange, onComplete, onOpenChat, onExplore }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyTracking = (trackingNum, id) => {
    navigator.clipboard.writeText(trackingNum);
    setCopiedId(id);
    toast.success('Tracking number copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!purchases || purchases.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-12 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <Package size={28} />
        </div>
        <div>
          <h3 className="text-lg font-bold dark:text-white">No Purchases Yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1">
            When you purchase studio gear or submit escrow offers through SeshNx, your tracked shipments and delivery inspection portals will appear here.
          </p>
        </div>
        <button
          onClick={onExplore}
          className="px-6 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition"
        >
          Explore Audio Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black dark:text-white flex items-center gap-2">
          <Package size={20} className="text-emerald-600" />
          <span>My Purchased Gear & Orders ({purchases.length})</span>
        </h2>
      </div>

      <div className="space-y-4">
        {purchases.map((tx) => {
          const carrier = tx.carrier || 'USPS';
          const trackingNumber = tx.trackingNumber;
          const trackingUrl = tx.trackingUrl || getTrackingUrl(carrier, trackingNumber);
          const isShipped = tx.status === 'shipped' || tx.shippingStatus === 'in_transit' || tx.status === 'completed';
          const isDelivered = tx.status === 'completed' || tx.shippingStatus === 'delivered';

          return (
            <div
              key={tx._id}
              className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-5"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl">
                    <Truck size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">Order #{tx._id.slice(-6).toUpperCase()}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : isShipped
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}>
                        {tx.status?.toUpperCase() || 'IN PROGRESS'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Purchased on {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 text-right">
                  <span className="text-xs text-gray-400">Escrow Total:</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    ${tx.amount?.toLocaleString()} {tx.currency || 'USD'}
                  </span>
                </div>
              </div>

              {/* Live Shipping & Carrier Tracking Card */}
              <div className="bg-gray-50 dark:bg-[#252830] rounded-2xl p-4 border border-gray-200/80 dark:border-gray-700/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                      {carrier}
                    </span>
                    {trackingNumber ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold dark:text-white">
                          {trackingNumber}
                        </span>
                        <button
                          onClick={() => handleCopyTracking(trackingNumber, tx._id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                          title="Copy tracking number"
                        >
                          {copiedId === tx._id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-500 font-medium">
                        Awaiting tracking update from seller
                      </span>
                    )}
                  </div>

                  {trackingUrl && (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <span>Track on {carrier}</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                {/* 4-Step Visual Tracking Timeline */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <div className="space-y-1">
                    <div className="h-1.5 rounded-full bg-emerald-500" />
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">1. Escrow Funded</p>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-1.5 rounded-full ${isShipped || isDelivered ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    <p className={`text-[10px] font-bold ${isShipped || isDelivered ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      2. Packaged
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-1.5 rounded-full ${isShipped || isDelivered ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    <p className={`text-[10px] font-bold ${isShipped || isDelivered ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      3. In Transit
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-1.5 rounded-full ${isDelivered ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    <p className={`text-[10px] font-bold ${isDelivered ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      4. Delivered & Inspected
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenShipping(tx._id)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Camera size={14} />
                    <span>Inspect Delivery Photos</span>
                  </button>

                  <button
                    onClick={() => onOpenChat?.(tx.sellerId)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <MessageCircle size={14} />
                    <span>Chat with Seller</span>
                  </button>
                </div>

                {!isDelivered && (
                  <button
                    onClick={() => onComplete(tx._id)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    Confirm Delivery & Release Escrow
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: MY SALES VIEW (ZERO DUMMY DATA)
// =============================================================================

function MySalesView({
  orders,
  listings,
  onOpenTracking,
  onOpenShippingVerification,
  onAcceptOffer,
  onRejectOffer,
  onDeleteListing,
  onOpenChat,
  onListNew
}) {
  const [salesSubTab, setSalesSubTab] = useState('orders'); // 'orders' | 'listings'

  return (
    <div className="space-y-6">
      {/* Sales Sub Navigation */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b dark:border-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSalesSubTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              salesSubTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            Orders & Offers ({orders.length})
          </button>
          <button
            onClick={() => setSalesSubTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              salesSubTab === 'listings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            Active Listings ({listings.length})
          </button>
        </div>

        <button
          onClick={onListNew}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-xs"
        >
          <Plus size={14} />
          <span>Post Gear for Sale</span>
        </button>
      </div>

      {/* SUBTAB: ORDERS & OFFERS */}
      {salesSubTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Truck size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold dark:text-white">No Sales Orders Yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                  When other producers make offers or purchase your gear through escrow, their orders and tracking actions will appear here.
                </p>
              </div>
            </div>
          ) : (
            orders.map((tx) => {
              const isPending = tx.status === 'pending';
              const carrier = tx.carrier || 'USPS';
              const hasTracking = Boolean(tx.trackingNumber);

              return (
                <div
                  key={tx._id}
                  className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b dark:border-gray-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">Order #{tx._id.slice(-6).toUpperCase()}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {tx.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Placed on {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1 text-right">
                      <span className="text-xs text-gray-400">Order Amount:</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        ${tx.amount?.toLocaleString()} {tx.currency || 'USD'}
                      </span>
                    </div>
                  </div>

                  {/* Tracking status row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gray-50 dark:bg-[#252830] rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-emerald-500" />
                      <span className="text-xs font-bold dark:text-white">Shipping Tracking:</span>
                      {hasTracking ? (
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {carrier} • {tx.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-500 font-medium">No tracking number entered</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenTracking(tx)}
                        className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700 text-xs font-bold dark:text-white hover:bg-gray-50 transition shadow-xs"
                      >
                        {hasTracking ? 'Update Tracking' : 'Add Carrier & Tracking #'}
                      </button>
                      <button
                        onClick={() => onOpenShippingVerification(tx._id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 transition"
                      >
                        Pre-Shipment Photo Log
                      </button>
                    </div>
                  </div>

                  {/* Actions for offers */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => onOpenChat?.(tx.buyerId)}
                      className="px-4 py-2 rounded-xl border dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-1.5"
                    >
                      <MessageCircle size={14} />
                      <span>Chat with Buyer</span>
                    </button>

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRejectOffer(tx._id)}
                          className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                        >
                          Decline Offer
                        </button>
                        <button
                          onClick={() => onAcceptOffer(tx._id)}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                        >
                          Accept Offer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SUBTAB: ACTIVE LISTINGS */}
      {salesSubTab === 'listings' && (
        <div className="space-y-4">
          {listings.length === 0 ? (
            <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Tag size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold dark:text-white">No Gear Listed</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                  List your studio microphones, outboard preamps, audio interfaces, and pedals with 3-tier condition verification.
                </p>
              </div>
              <button
                onClick={onListNew}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition"
              >
                Create First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((item) => (
                <div
                  key={item._id}
                  className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs space-y-3 p-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {item.isConditionVerified && (
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase shadow-xs">
                          <BadgeCheck size={13} />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mb-1">
                        <span>{item.category}</span>
                        <span>{item.condition || 'Excellent'}</span>
                      </div>
                      <h4 className="font-bold text-sm dark:text-white line-clamp-1">{item.title}</h4>
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        ${item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t dark:border-gray-800">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Eye size={12} />
                      <span>{item.viewCount || 0} views</span>
                    </div>
                    <button
                      onClick={() => onDeleteListing(item._id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                      title="Remove Listing"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS: GEAR CARD (GRID VIEW)
// =============================================================================

function GearCard({ item, onSelect, onMakeOffer, onBuyNow }) {
  const [imageIndex, setImageIndex] = useState(0);
  const images = item.images && item.images.length > 0
    ? item.images
    : ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group"
    >
      <div>
        {/* Photo Container */}
        <div
          onClick={onSelect}
          className="relative aspect-4/3 bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer"
        >
          <img
            src={images[imageIndex]}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Condition Tag */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-white">
              {item.condition || 'Excellent'}
            </span>
          </div>

          {/* Verified Condition Badge */}
          {item.isConditionVerified && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-full bg-emerald-600/90 text-white shadow-md flex items-center gap-1 text-[10px] font-black uppercase backdrop-blur-md" title="Verified Authentic & Inspected Condition">
                <BadgeCheck size={13} />
                <span>Verified</span>
              </span>
            </div>
          )}

          {/* Brand Tag */}
          {item.brand && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 backdrop-blur-md shadow-xs">
                {item.brand}
              </span>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={onSelect}
              className="font-bold text-sm dark:text-white line-clamp-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
            >
              {item.title}
            </h3>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                ${item.price.toLocaleString()}
              </span>
              <span className="text-[11px] text-gray-400">
                + $0 Escrow
              </span>
            </div>

            {(!item.shippingAvailable && item.localPickup) || item.shippingCarrier === 'Local Pickup Only' ? (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400 shrink-0 border border-amber-300 dark:border-amber-800/60">
                🤝 Local Pickup Only
              </span>
            ) : item.shippingCost === 0 ? (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 shrink-0">
                ✨ Free Shipping
              </span>
            ) : item.shippingCost ? (
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 shrink-0">
                +${item.shippingCost} Ship
              </span>
            ) : null}
          </div>

          {/* Seller Snapshot */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-800">
            <div className="flex items-center gap-1.5 truncate">
              <UserAvatar src={item.sellerAvatar} name={item.sellerName} size="xs" />
              <span className="truncate">{item.sellerName || 'Verified Studio'}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
              <MapPin size={11} />
              <span>{item.location || 'Austin, TX'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <button
          onClick={onMakeOffer}
          className="w-full py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          Make Offer
        </button>
        <button
          onClick={onSelect}
          className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
}

// =============================================================================
// SUB-COMPONENTS: GEAR LIST ITEM (LIST VIEW)
// =============================================================================

function GearListItem({ item, onSelect, onMakeOffer, onBuyNow }) {
  const images = item.images && item.images.length > 0
    ? item.images
    : ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80'];

  return (
    <div className="bg-white dark:bg-[#1f2128] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs hover:border-emerald-500/40 transition">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <img
          src={images[0]}
          alt={item.title}
          onClick={onSelect}
          className="w-20 h-20 rounded-xl object-cover cursor-pointer shrink-0"
        />
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
              {item.condition || 'Excellent'}
            </span>
            {item.isConditionVerified && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                <BadgeCheck size={11} /> Verified
              </span>
            )}
            {item.brand && (
              <span className="text-xs font-bold text-gray-400">{item.brand}</span>
            )}
          </div>
          <h3
            onClick={onSelect}
            className="font-bold text-sm dark:text-white truncate cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            {item.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {item.location || 'Austin, TX'}
            </span>
            <span>• Seller: {item.sellerName || 'Verified Studio'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 dark:border-gray-800">
        <div className="text-left sm:text-right">
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            ${item.price.toLocaleString()}
          </span>
          <div className="flex sm:justify-end items-center gap-1.5 mt-0.5">
            {(!item.shippingAvailable && item.localPickup) || item.shippingCarrier === 'Local Pickup Only' ? (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60">
                🤝 Local Pickup Only
              </span>
            ) : item.shippingCost === 0 ? (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400">
                ✨ Free Shipping
              </span>
            ) : (
              <p className="text-[10px] text-gray-400">Escrow Protected</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onMakeOffer}
            className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Make Offer
          </button>
          <button
            onClick={onSelect}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS: ITEM DETAIL MODAL (WITH VERIFIED INSPECTION BREAKDOWN)
// =============================================================================

function ItemDetailModal({ item, onClose, onMakeOffer, onBuyNow, onContactSeller }) {
  const [activePhoto, setActivePhoto] = useState(0);

  const images = item.images && item.images.length > 0
    ? item.images
    : ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80'];

  const escrowFee = Math.round(item.price * 0.01 * 100) / 100;
  const checklist = item.conditionChecklist || {};

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-[#1f2128] rounded-3xl max-w-4xl w-full border border-gray-200 dark:border-gray-800 overflow-hidden shadow-2xl relative my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Photos Area */}
          <div className="bg-gray-100 dark:bg-gray-900 p-6 flex flex-col justify-between">
            <div className="aspect-square rounded-2xl overflow-hidden bg-black/10 relative">
              <img
                src={images[activePhoto] || images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {item.isConditionVerified && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black uppercase shadow-lg backdrop-blur-md">
                  <BadgeCheck size={15} />
                  <span>Verified Condition</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      activePhoto === i ? 'border-emerald-600' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Area */}
          <div className="p-6 space-y-5 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">
                    {item.condition || 'Excellent'}
                  </span>
                  <span className="text-xs text-gray-400 font-bold">{item.category}</span>
                </div>
                <h2 className="text-xl font-black dark:text-white leading-snug">
                  {item.title}
                </h2>
                {item.brand && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                    Brand: {item.brand} {item.model ? `• Model: ${item.model}` : ''}
                  </p>
                )}
              </div>

              {/* Price Box */}
              <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-500">Listing Price</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ${item.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t dark:border-gray-700">
                  <span>1% SeshNx Safe Escrow Protection</span>
                  <span>${escrowFee}</span>
                </div>
              </div>

              {/* Verified Condition Inspection Guarantee Box */}
              {item.isConditionVerified && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-xs">
                    <BadgeCheck size={16} />
                    <span>SeshNx Condition Inspection Passed</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                    {Object.keys(checklist).length > 0 ? (
                      Object.entries(checklist).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2 text-[11px]">
                          <Check size={13} className="text-emerald-500 shrink-0" />
                          <span className="capitalize">{key.replace(/_/g, ' ')}: {val === true ? 'Verified Normal' : String(val)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Inspected via 6-point chassis photography & operational verification.
                      </p>
                    )}
                  </div>
                  {item.conditionNotes && (
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 italic pt-1 border-t border-emerald-100 dark:border-emerald-900/40">
                      Seller notes: "{item.conditionNotes}"
                    </p>
                  )}
                </div>
              )}

              {/* Description */}
              {item.description && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Item Description</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-h-28 overflow-y-auto">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Shipping & Fulfillment */}
              {(!item.shippingAvailable && item.localPickup) || item.shippingCarrier === 'Local Pickup Only' ? (
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between font-black text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🤝</span>
                      <span className="text-sm font-black">Local Pickup Only</span>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-black">
                      No Shipping Fees
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                    This gear is designated for in-person local handoff in <strong>{item.location || 'Local Area'}</strong>. SeshNx escrow holds payment safely until you meet in person, inspect the gear, and confirm it matches the verified condition report.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300 pt-1.5 border-t border-amber-200/60 dark:border-amber-900/40">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin size={11} /> {item.location || 'Local Area'}
                    </span>
                    <span>• {item.handlingTime || 'By appointment'}</span>
                    <span>• In-Person Testing Allowed</span>
                  </div>

                  {item.shippingNotes && (
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 text-[11px] text-gray-700 dark:text-gray-300 border border-amber-200/50 dark:border-amber-900/30">
                      <span className="font-bold text-amber-800 dark:text-amber-300">Pickup Notes: </span>
                      {item.shippingNotes}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold dark:text-white">
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-200">
                      <Truck size={15} className="text-emerald-500" />
                      <span>Shipping & Fulfillment</span>
                    </div>
                    {item.shippingCost === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">
                        FREE Shipping
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">
                        +${item.shippingCost} Shipping
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    {item.shippingCarrier && (
                      <span className="px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold">
                        {item.shippingCarrier}
                      </span>
                    )}
                    {item.handlingTime && (
                      <span>• Ships in {item.handlingTime}</span>
                    )}
                    {item.requireSignature && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• Signature Required</span>
                    )}
                    {item.shippingInsuranceIncluded && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• Insured</span>
                    )}
                    {item.localPickup && (
                      <span className="text-blue-500 font-semibold">• Local Pickup also available in {item.location || 'Local area'}</span>
                    )}
                  </div>

                  {item.shippingNotes && (
                    <p className="text-[10px] text-gray-500 italic pt-1 border-t dark:border-gray-750">
                      Packing: {item.shippingNotes}
                    </p>
                  )}
                </div>
              )}

              {/* Seller info */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-xs">
                <div className="flex items-center gap-2">
                  <UserAvatar src={item.sellerAvatar} name={item.sellerName} size="sm" />
                  <div>
                    <p className="font-bold dark:text-white">{item.sellerName || 'Verified Studio'}</p>
                    <p className="text-[11px] text-gray-400">{item.location || 'Austin, TX'}</p>
                  </div>
                </div>
                <button
                  onClick={onContactSeller}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 hover:bg-emerald-100 transition"
                >
                  <MessageCircle size={13} /> Chat
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t dark:border-gray-800">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onMakeOffer}
                  className="py-3 rounded-2xl border border-gray-200 dark:border-gray-700 font-bold text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Make an Offer
                </button>
                <button
                  onClick={onBuyNow}
                  className="py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-md shadow-emerald-600/25"
                >
                  Buy via Escrow
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS: MAKE OFFER MODAL
// =============================================================================

function MakeOfferModal({ item, offerAmount, setOfferAmount, offerMessage, setOfferMessage, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-[#1f2128] rounded-3xl max-w-md w-full border border-gray-200 dark:border-gray-800 p-6 space-y-5 shadow-2xl relative"
      >
        <div className="flex items-center justify-between pb-3 border-b dark:border-gray-800">
          <h3 className="text-lg font-bold dark:text-white">Make an Offer</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-400">Target Gear</p>
          <p className="text-sm font-bold dark:text-white">{item.title}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Listed for: ${item.price.toLocaleString()}</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Your Offer Amount ($ USD)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold">$</span>
            <input
              type="number"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              placeholder={item.price.toString()}
              className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl pl-8 pr-4 py-2.5 text-base font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Message for Seller (Optional)
          </label>
          <textarea
            value={offerMessage}
            onChange={(e) => setOfferMessage(e.target.value)}
            placeholder="I can pick it up today / Ready to checkout..."
            rows={3}
            className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl p-3 text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={onClose}
            className="py-2.5 rounded-xl border dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs"
          >
            Submit Offer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS: ADD TRACKING NUMBER MODAL
// =============================================================================

function AddTrackingModal({ transaction, onClose, onUpdateTracking }) {
  const [carrier, setCarrier] = useState(transaction.carrier || 'USPS');
  const [trackingNumber, setTrackingNumber] = useState(transaction.trackingNumber || '');
  const [submitting, setSubmitting] = useState(false);

  const CARRIERS = ['USPS', 'UPS', 'FedEx', 'DHL', 'Local Pickup / Hand Delivery', 'Other Courier'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error('Please enter a valid tracking number');
      return;
    }

    setSubmitting(true);
    try {
      await onUpdateTracking(transaction._id, trackingNumber.trim(), carrier);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-[#1f2128] rounded-3xl max-w-md w-full border border-gray-200 dark:border-gray-800 p-6 space-y-5 shadow-2xl relative"
      >
        <div className="flex items-center justify-between pb-3 border-b dark:border-gray-800">
          <h3 className="text-base font-bold dark:text-white flex items-center gap-2">
            <Truck size={18} className="text-emerald-500" />
            Add Shipping Tracking
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Carrier</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CARRIERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Tracking Number *</label>
            <input
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. 9400 1000 0000 0000 0000 00"
              className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            Adding carrier tracking transitions the order to In Transit and enables automated delivery tracking for the buyer.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 rounded-xl border dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs flex items-center justify-center gap-1.5"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              <span>Save & Update</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS: UPGRADED LIST GEAR MODAL (WITH 6-STEP WIZARD & SHIPPING)
// =============================================================================

function ListGearModal({ clerkId, onClose, createItem }) {
  // Stepper state (1 to 6)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Basic info & Pricing
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Microphones');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('Excellent');
  const [location, setLocation] = useState('Austin, TX');
  const [description, setDescription] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 2: Section 1 - Mandatory 6-angle chassis photos
  const [chassisPhotos, setChassisPhotos] = useState({});

  // Step 3: Section 2 - Category details & Damage Inspection
  const [detailPhotos, setDetailPhotos] = useState({});
  const [notOnUnitFlags, setNotOnUnitFlags] = useState({});
  const [hasNoDamage, setHasNoDamage] = useState(true);
  const [damagePhotos, setDamagePhotos] = useState([]);
  const [damageDescription, setDamageDescription] = useState('');

  // Step 4: Section 3 - Functional checklist & Optional accessories
  const [conditionChecklist, setConditionChecklist] = useState({});
  const [conditionNotes, setConditionNotes] = useState('');
  const [isConditionVerified, setIsConditionVerified] = useState(true);
  const [accessoryPhotos, setAccessoryPhotos] = useState({});

  // Step 5: Shipping & Delivery Options
  const [shippingMode, setShippingMode] = useState('both'); // 'both', 'shipping_only', 'pickup_only'
  const [shippingCostType, setShippingCostType] = useState('flat_rate'); // 'flat_rate', 'free'
  const [shippingCost, setShippingCost] = useState('25');
  const [shippingCarrier, setShippingCarrier] = useState('UPS Ground');
  const [handlingTime, setHandlingTime] = useState('1-2 business days');
  const [packageWeight, setPackageWeight] = useState('');
  const [packageDimensions, setPackageDimensions] = useState('');
  const [requireSignature, setRequireSignature] = useState(true);
  const [shippingInsuranceIncluded, setShippingInsuranceIncluded] = useState(true);
  const [shippingNotes, setShippingNotes] = useState('');

  // Local Pickup Specific Details
  const [pickupLocation, setPickupLocation] = useState(location || 'Austin, TX');
  const [pickupSchedule, setPickupSchedule] = useState('Flexible / Weekdays after 5pm & Weekends');
  const [testingOnSite, setTestingOnSite] = useState(true);
  const [safeZoneSpot, setSafeZoneSpot] = useState('Public Studio Lobby or Bank');
  const [pickupNotes, setPickupNotes] = useState('');

  // Image Upload Hook
  const { uploadMedia, uploading } = useUpload('marketplace-media');

  // Category specs lookup
  const currentCategorySpec = useMemo(() => {
    return CATEGORY_PHOTO_SPECS[category] || CATEGORY_PHOTO_SPECS['Default'];
  }, [category]);

  const stepsList = [
    { id: 1, label: 'Basics & Price', icon: Tag, title: 'Basic Info & Pricing' },
    { id: 2, label: 'Chassis Photos', icon: Camera, title: '6-Point Chassis Photos' },
    { id: 3, label: 'Components', icon: AlertTriangle, title: 'Category Details & Damage' },
    { id: 4, label: 'Function & Extras', icon: BadgeCheck, title: 'Checklist & Accessories' },
    { id: 5, label: 'Shipping', icon: Truck, title: 'Shipping & Delivery Options' },
    { id: 6, label: 'Review & Publish', icon: Sparkles, title: 'Review & Publish' },
  ];

  // Handle chassis photo upload
  const handleChassisUpload = async (angleId, file) => {
    if (!file) return;
    try {
      const result = await uploadMedia(file, `gear_verification/${clerkId}/chassis`);
      if (result?.url) {
        setChassisPhotos(prev => ({ ...prev, [angleId]: result.url }));
        toast.success(`Captured ${angleId} angle!`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload angle photo');
    }
  };

  // Handle detail photo upload
  const handleDetailUpload = async (detailId, file) => {
    if (!file) return;
    try {
      const result = await uploadMedia(file, `gear_verification/${clerkId}/details`);
      if (result?.url) {
        setDetailPhotos(prev => ({ ...prev, [detailId]: result.url }));
        setNotOnUnitFlags(prev => ({ ...prev, [detailId]: false }));
        toast.success('Captured detail photo!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload detail photo');
    }
  };

  // Handle accessory photo upload
  const handleAccessoryUpload = async (accId, file) => {
    if (!file) return;
    try {
      const result = await uploadMedia(file, `gear_verification/${clerkId}/accessories`);
      if (result?.url) {
        setAccessoryPhotos(prev => ({ ...prev, [accId]: result.url }));
        toast.success('Captured accessory photo!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload accessory photo');
    }
  };

  // Handle damage photo upload
  const handleDamageUpload = async (file) => {
    if (!file) return;
    try {
      const result = await uploadMedia(file, `gear_verification/${clerkId}/damage`);
      if (result?.url) {
        setDamagePhotos(prev => [...prev, result.url]);
        setHasNoDamage(false);
        toast.success('Added damage inspection photo');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload damage photo');
    }
  };

  const handleToggleNotOnUnit = (detailId) => {
    setNotOnUnitFlags(prev => {
      const nextVal = !prev[detailId];
      if (nextVal) {
        setDetailPhotos(p => {
          const copy = { ...p };
          delete copy[detailId];
          return copy;
        });
      }
      return { ...prev, [detailId]: nextVal };
    });
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (!title.trim()) {
        toast.error('Please enter a listing title');
        return false;
      }
      if (!price || isNaN(Number(price)) || Number(price) <= 0) {
        toast.error('Please enter a valid listing price');
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      const count = Object.keys(chassisPhotos).length;
      if (count < 6) {
        toast(`Uploaded ${count}/6 chassis angles. All 6 angles earn the Verified badge!`, { icon: '📸' });
      }
      return true;
    }
    if (currentStep === 5) {
      if (shippingMode === 'pickup_only') {
        if (!pickupLocation.trim() && !location.trim()) {
          toast.error('Please enter a pickup neighborhood/city');
          return false;
        }
      } else if (shippingCostType === 'flat_rate') {
        if (!shippingCost || isNaN(Number(shippingCost)) || Number(shippingCost) < 0) {
          toast.error('Please enter a valid flat rate shipping price (or choose Free Shipping)');
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title || !price || isNaN(Number(price))) {
      toast.error('Please enter a valid title and price');
      setCurrentStep(1);
      return;
    }

    // Compile all uploaded image URLs into flat array for general preview
    const allImages = [
      ...Object.values(chassisPhotos),
      ...Object.values(detailPhotos),
      ...damagePhotos,
      ...Object.values(accessoryPhotos),
    ].filter(Boolean);

    if (allImages.length === 0) {
      allImages.push('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80');
    }

    const isPickupOnly = shippingMode === 'pickup_only';
    const shippingAvailable = !isPickupOnly;
    const localPickup = shippingMode !== 'shipping_only';
    const finalShippingCost = shippingAvailable
      ? (shippingCostType === 'free' ? 0 : Number(shippingCost) || 0)
      : 0;

    const fullShippingNotes = isPickupOnly
      ? [
          `Local Pickup in ${pickupLocation || location || 'Local Area'}`,
          testingOnSite ? 'On-site testing equipment provided' : '',
          safeZoneSpot ? `Preferred safe meetup spot: ${safeZoneSpot}` : '',
          pickupSchedule ? `Hours: ${pickupSchedule}` : '',
          pickupNotes || shippingNotes,
        ].filter(Boolean).join(' • ')
      : shippingNotes;

    setSubmitting(true);
    try {
      await createItem({
        sellerId: clerkId,
        title,
        category,
        brand: brand || undefined,
        model: model || undefined,
        price: Number(price),
        condition,
        location: isPickupOnly ? (pickupLocation || location || 'Austin, TX') : (location || 'Austin, TX'),
        description: description || undefined,
        images: allImages,
        currency: 'USD',
        negotiable,
        isConditionVerified,
        verificationBadge: isConditionVerified ? 'Verified Authentic & Inspected' : undefined,
        conditionCategory: category,
        conditionNotes: conditionNotes || undefined,
        conditionChecklist: isConditionVerified ? conditionChecklist : undefined,
        verificationPhotos: {
          chassis: chassisPhotos,
          details: detailPhotos,
          notOnUnit: notOnUnitFlags,
          hasNoDamage,
          damagePhotos,
          damageDescription: damageDescription || undefined,
          accessories: accessoryPhotos,
        },
        // Shipping details
        shippingAvailable,
        shippingCost: finalShippingCost,
        localPickup,
        shippingCarrier: isPickupOnly ? 'Local Pickup Only' : (shippingAvailable ? shippingCarrier : undefined),
        handlingTime: isPickupOnly ? (pickupSchedule || 'Local pickup by appointment') : (shippingAvailable ? handlingTime : undefined),
        packageDimensions: !isPickupOnly ? (packageDimensions || undefined) : undefined,
        packageWeight: !isPickupOnly ? (packageWeight || undefined) : undefined,
        dimensions: packageDimensions || undefined,
        weight: packageWeight || undefined,
        shippingInsuranceIncluded: shippingAvailable ? shippingInsuranceIncluded : undefined,
        requireSignature: shippingAvailable ? requireSignature : undefined,
        shippingNotes: fullShippingNotes || undefined,
      });

      toast.success('Gear listing published with Verified Condition & Shipping!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const chassisCount = Object.keys(chassisPhotos).length;
  const detailCount = Object.keys(detailPhotos).length;
  const notOnUnitCount = Object.values(notOnUnitFlags).filter(Boolean).length;
  const totalUploadedPhotos = [
    ...Object.values(chassisPhotos),
    ...Object.values(detailPhotos),
    ...damagePhotos,
    ...Object.values(accessoryPhotos),
  ].filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-[#1c1e24] rounded-3xl max-w-3xl w-full border border-gray-200 dark:border-gray-800 shadow-2xl my-6 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Step Header & Close */}
        <div className="p-5 sm:p-6 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <Tag size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black dark:text-white flex items-center gap-2">
                  <span>List Gear for Sale</span>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400">
                    Step {currentStep} of 6
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stepsList[currentStep - 1]?.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stepper Navigation Pills */}
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {stepsList.map((st) => {
              const IconComponent = st.icon;
              const isCurrent = currentStep === st.id;
              const isPast = currentStep > st.id;

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    if (st.id < currentStep || validateCurrentStep()) {
                      setCurrentStep(st.id);
                    }
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition text-center ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : isPast
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                      : 'bg-gray-100 dark:bg-gray-800/60 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/60'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isPast ? (
                      <Check size={12} className="stroke-[3]" />
                    ) : (
                      <IconComponent size={12} />
                    )}
                    <span className="text-[10px] font-black hidden md:inline">
                      {st.short || st.label}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold mt-0.5 md:hidden">
                    {st.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Body (Scrollable with dedicated spacious cards) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* =================================================================
              STEP 1: BASIC INFO & PRICING
             ================================================================= */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-4"
            >
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white">
                  1. Identification & Price
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Provide clear title, category, and pricing for studio buyers.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Listing Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Neumann U87 Ai Large-Diaphragm Condenser Microphone"
                  className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl px-4 py-3 text-xs font-semibold dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setConditionChecklist({});
                      setDetailPhotos({});
                      setNotOnUnitFlags({});
                    }}
                    className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl px-3.5 py-3 text-xs font-bold dark:text-white outline-none"
                  >
                    {GEAR_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Condition Grade *</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl px-3.5 py-3 text-xs font-bold dark:text-white outline-none"
                  >
                    {CONDITIONS.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Neumann"
                    className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl px-3.5 py-2.5 text-xs dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Model</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. U87 Ai"
                    className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl px-3.5 py-2.5 text-xs dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Listing Price ($ USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-black text-gray-400">$</span>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="2500"
                      className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl pl-8 pr-3.5 py-2.5 text-xs font-black text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border dark:border-gray-750">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold dark:text-gray-200">Accept Best Offers</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={negotiable}
                    onChange={(e) => setNegotiable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Location (City, State)</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Austin, TX"
                    className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl px-3.5 py-2.5 text-xs dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Overview / Usage History</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Smoke-free studio use, original capsule, kept in pelican case..."
                    className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl p-3 text-xs dark:text-white outline-none resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* =================================================================
              STEP 2: MANDATORY 6-POINT CHASSIS PHOTOS
             ================================================================= */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">
                    2. Mandatory 6-Point Chassis Photos
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Capture all 6 external angles to certify complete cosmetic casing integrity.
                  </p>
                </div>
                <span className={`text-xs font-black px-3 py-1 rounded-full ${
                  chassisCount === 6
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400'
                }`}>
                  {chassisCount}/6 Angles Uploaded
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CHASSIS_ANGLES.map((angle) => {
                  const photoUrl = chassisPhotos[angle.id];

                  return (
                    <div
                      key={angle.id}
                      className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-850/50 flex flex-col justify-between space-y-2.5"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold dark:text-white">{angle.label}</span>
                          {photoUrl ? (
                            <CheckCircle size={15} className="text-emerald-500" />
                          ) : (
                            <span className="text-[10px] text-amber-500 font-extrabold">* Required</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{angle.hint}</p>
                      </div>

                      {photoUrl ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-black/10 border dark:border-gray-700">
                          <img src={photoUrl} alt={angle.label} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setChassisPhotos(prev => {
                              const copy = { ...prev };
                              delete copy[angle.id];
                              return copy;
                            })}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-black/90 transition"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 bg-white dark:bg-gray-800 cursor-pointer transition text-xs font-bold text-gray-600 dark:text-gray-300">
                          <Camera size={14} className="text-emerald-500" />
                          <span>Snap / Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleChassisUpload(angle.id, e.target.files?.[0])}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
                <Shield size={16} className="shrink-0 text-emerald-600" />
                <span>
                  6-point chassis photos protect you against unfounded damage claims during shipping and safe escrow releases.
                </span>
              </div>
            </motion.div>
          )}

          {/* =================================================================
              STEP 3: CATEGORY DETAILS & DAMAGE INSPECTION
             ================================================================= */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-4"
            >
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white">
                  3. Category Close-Ups & Damage Inspection
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Inspecting components for <span className="font-bold text-emerald-600 dark:text-emerald-400">{category}</span>. If a feature isn't on your model (e.g. no pad switch), click "Not on Unit".
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentCategorySpec.recommendedDetails.map((slot) => {
                  const photoUrl = detailPhotos[slot.id];
                  const isNotOnUnit = notOnUnitFlags[slot.id];

                  return (
                    <div
                      key={slot.id}
                      className={`p-3.5 rounded-2xl border transition ${
                        isNotOnUnit
                          ? 'border-gray-200 dark:border-gray-800 bg-gray-100/70 dark:bg-gray-850/40 opacity-70'
                          : 'border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-850/50'
                      } space-y-2`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold dark:text-white">{slot.label}</span>
                            {photoUrl && <CheckCircle size={14} className="text-emerald-500" />}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{slot.hint}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleNotOnUnit(slot.id)}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition shrink-0 ${
                            isNotOnUnit
                              ? 'bg-amber-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                          }`}
                        >
                          {isNotOnUnit ? '✓ Not on Unit' : 'Not on Unit'}
                        </button>
                      </div>

                      {!isNotOnUnit && (
                        photoUrl ? (
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/10 border dark:border-gray-700">
                            <img src={photoUrl} alt={slot.label} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setDetailPhotos(prev => {
                                const copy = { ...prev };
                                delete copy[slot.id];
                                return copy;
                              })}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-black/90 transition"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 bg-white dark:bg-gray-800 cursor-pointer transition text-xs font-bold text-gray-600 dark:text-gray-300">
                            <Camera size={14} className="text-emerald-500" />
                            <span>Capture Detail Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => handleDetailUpload(slot.id, e.target.files?.[0])}
                              className="hidden"
                            />
                          </label>
                        )
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Damage Inspection Subsection */}
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-black dark:text-white flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-amber-500" />
                      <span>Cosmetic Wear & Damage Inspection</span>
                    </h5>
                    <p className="text-[10px] text-gray-400">
                      Disclose any dings, scratches, or wear upfront to guarantee zero buyer disputes.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasNoDamage}
                      onChange={(e) => {
                        setHasNoDamage(e.target.checked);
                        if (e.target.checked) {
                          setDamagePhotos([]);
                          setDamageDescription('');
                        }
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                      Inspected Pristine (No Damage)
                    </span>
                  </label>
                </div>

                {!hasNoDamage && (
                  <div className="space-y-3 pt-3 border-t dark:border-gray-700">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                        Damage Details & Location
                      </label>
                      <input
                        type="text"
                        value={damageDescription}
                        onChange={(e) => setDamageDescription(e.target.value)}
                        placeholder="e.g. Minor 2mm rack rash near top mounting screw; electronics untouched."
                        className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                        Close-up Damage Photos
                      </label>
                      <div className="flex flex-wrap gap-2 items-center">
                        {damagePhotos.map((url, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/10 border dark:border-gray-700">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setDamagePhotos(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-emerald-500 transition bg-white dark:bg-gray-800">
                          <Plus size={16} />
                          <span className="text-[9px] font-bold">Add Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleDamageUpload(e.target.files?.[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* =================================================================
              STEP 4: OPERATIONAL CHECKLIST & OPTIONAL ACCESSORIES
             ================================================================= */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-4"
            >
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white">
                  4. Operational Condition Checklist & Accessories
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Confirm functional operational health and add included original accessories.
                </p>
              </div>

              {/* Operational Checklist */}
              <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BadgeCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                      Operational Benchmarks ({category})
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isConditionVerified}
                      onChange={(e) => setIsConditionVerified(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Certify Operational</span>
                  </label>
                </div>

                {isConditionVerified && (
                  <div className="space-y-2 pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentCategorySpec.checks.map((chk) => (
                        <label
                          key={chk.id}
                          className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-gray-800/80 border dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:border-emerald-500 transition"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(conditionChecklist[chk.id])}
                            onChange={(e) => setConditionChecklist(prev => ({
                              ...prev,
                              [chk.id]: e.target.checked
                            }))}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                          <span>{chk.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="pt-2">
                      <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                        Seller Inspection Notes
                      </label>
                      <input
                        type="text"
                        value={conditionNotes}
                        onChange={(e) => setConditionNotes(e.target.value)}
                        placeholder="e.g. Tested on Apollo x8p preamps with zero hiss, original serial verified."
                        className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Optional Accessories */}
              <div className="space-y-3 pt-2">
                <div>
                  <h5 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Optional Inclusions & Accessories
                  </h5>
                  <p className="text-[10px] text-gray-400">
                    Items with original packaging, power supplies, or shockmounts fetch up to 25% higher resale prices.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ACCESSORY_SLOTS.map((slot) => {
                    const photoUrl = accessoryPhotos[slot.id];

                    return (
                      <div
                        key={slot.id}
                        className="p-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-850/50 space-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold dark:text-white">{slot.label}</span>
                          <p className="text-[10px] text-gray-400">{slot.hint}</p>
                        </div>

                        {photoUrl ? (
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/10 border dark:border-gray-700">
                            <img src={photoUrl} alt={slot.label} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setAccessoryPhotos(prev => {
                                const copy = { ...prev };
                                delete copy[slot.id];
                                return copy;
                              })}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-black/90 transition"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 bg-white dark:bg-gray-800 cursor-pointer transition text-xs font-semibold text-gray-500 dark:text-gray-400">
                            <Upload size={13} />
                            <span>Add (Optional)</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => handleAccessoryUpload(slot.id, e.target.files?.[0])}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* =================================================================
              STEP 5: SHIPPING & DELIVERY OPTIONS (NEW DEDICATED STEP)
             ================================================================= */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-4"
            >
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Truck className="text-emerald-500" size={18} />
                  <span>5. Shipping & Delivery Options</span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Configure fulfillment methods, carrier preferences, handling time, and package specifications.
                </p>
              </div>

              {/* Delivery Availability Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Fulfillment Method *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'both', label: 'Shipping & Local Pickup', desc: 'Nationwide shipping or local handoff', icon: '📦' },
                    { id: 'shipping_only', label: 'Shipping Only', desc: 'Direct insured courier delivery', icon: '🚚' },
                    { id: 'pickup_only', label: 'Local Pickup Only', desc: 'Ideal for large/heavy studio equipment', icon: '🤝' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setShippingMode(mode.id)}
                      className={`p-3.5 rounded-2xl text-left border transition ${
                        shippingMode === mode.id
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-850/50 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{mode.icon}</div>
                      <div className="text-xs font-black dark:text-white">{mode.label}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {shippingMode !== 'pickup_only' && (
                <div className="space-y-4 pt-2 border-t dark:border-gray-800">
                  {/* Shipping Cost Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Shipping Rate Pricing *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setShippingCostType('flat_rate')}
                        className={`p-3.5 rounded-2xl text-left border transition ${
                          shippingCostType === 'flat_rate'
                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                            : 'border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-850/50 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black dark:text-white">Buyer Pays Flat Rate</span>
                          <DollarSign size={15} className="text-emerald-500" />
                        </div>
                        <p className="text-[10px] text-gray-400">Fixed shipping rate added to buyer checkout</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShippingCostType('free');
                          setShippingCost('0');
                        }}
                        className={`p-3.5 rounded-2xl text-left border transition ${
                          shippingCostType === 'free'
                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                            : 'border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-850/50 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black dark:text-white">Free Shipping</span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400">
                            Fast Resale
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400">Seller covers shipping (attracts 40% more buyers)</p>
                      </button>
                    </div>

                    {shippingCostType === 'flat_rate' && (
                      <div className="pt-2 flex items-center gap-3">
                        <div className="relative w-44">
                          <span className="absolute left-3.5 top-2.5 text-xs font-black text-gray-400">$</span>
                          <input
                            type="number"
                            value={shippingCost}
                            onChange={(e) => setShippingCost(e.target.value)}
                            placeholder="25"
                            className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl pl-8 pr-3.5 py-2 text-xs font-black text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Estimated nationwide ground rate
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Preferred Carrier & Handling Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Preferred Carrier
                      </label>
                      <select
                        value={shippingCarrier}
                        onChange={(e) => setShippingCarrier(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl px-3.5 py-2.5 text-xs font-bold dark:text-white outline-none"
                      >
                        <option value="UPS Ground">UPS Ground</option>
                        <option value="USPS Priority Mail">USPS Priority Mail</option>
                        <option value="FedEx Home Delivery">FedEx Home Delivery</option>
                        <option value="DHL Express">DHL Express</option>
                        <option value="Freight / White Glove">Freight / White Glove</option>
                        <option value="Seller Choice (Any Reliable)">Seller Choice (Any Reliable)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Estimated Handling Time
                      </label>
                      <select
                        value={handlingTime}
                        onChange={(e) => setHandlingTime(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl px-3.5 py-2.5 text-xs font-bold dark:text-white outline-none"
                      >
                        <option value="Same business day">Same business day</option>
                        <option value="1 business day">1 business day</option>
                        <option value="1-2 business days">1-2 business days</option>
                        <option value="2-3 business days">2-3 business days</option>
                        <option value="3-5 business days">3-5 business days</option>
                      </select>
                    </div>
                  </div>

                  {/* Weight & Dimensions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Package Weight (approx.)
                      </label>
                      <input
                        type="text"
                        value={packageWeight}
                        onChange={(e) => setPackageWeight(e.target.value)}
                        placeholder="e.g. 8.5 lbs (with box)"
                        className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl px-3.5 py-2 text-xs dark:text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Box Dimensions (L x W x H in)
                      </label>
                      <input
                        type="text"
                        value={packageDimensions}
                        onChange={(e) => setPackageDimensions(e.target.value)}
                        placeholder="e.g. 18 x 12 x 6 in"
                        className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl px-3.5 py-2 text-xs dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Delivery Safeguards */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-850/60 border dark:border-gray-800 space-y-3">
                    <span className="text-xs font-black uppercase text-gray-700 dark:text-gray-300">
                      Security & Delivery Safeguards
                    </span>

                    <div className="space-y-2.5">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CheckCheck size={16} className="text-emerald-500" />
                          <div>
                            <p className="text-xs font-bold dark:text-white">Require Direct Signature</p>
                            <p className="text-[10px] text-gray-400">Recipient must sign in person (prevents porch theft)</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={requireSignature}
                          onChange={(e) => setRequireSignature(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer pt-2 border-t dark:border-gray-750">
                        <div className="flex items-center gap-2">
                          <Shield size={16} className="text-emerald-500" />
                          <div>
                            <p className="text-xs font-bold dark:text-white">Full Declared Value Insurance</p>
                            <p className="text-[10px] text-gray-400">Carrier package insured up to full purchase price</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={shippingInsuranceIncluded}
                          onChange={(e) => setShippingInsuranceIncluded(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Packaging Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Packing & Shipping Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={shippingNotes}
                      onChange={(e) => setShippingNotes(e.target.value)}
                      placeholder="e.g. Double-boxed in heavy corrugated cardboard with 2 inches of bubble wrap on all sides."
                      className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl px-3.5 py-2 text-xs dark:text-white outline-none"
                    />
                  </div>

                  {/* Optional Local Pickup details when mode is both */}
                  {shippingMode === 'both' && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <span>🤝 Local Pickup Option Also Enabled</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          placeholder="Pickup Neighborhood (e.g. Austin, TX)"
                          className="bg-white dark:bg-gray-800 border dark:border-gray-750 rounded-xl px-3 py-1.5 text-xs dark:text-white outline-none"
                        />
                        <input
                          type="text"
                          value={pickupSchedule}
                          onChange={(e) => setPickupSchedule(e.target.value)}
                          placeholder="Pickup Hours (e.g. Flexible by appointment)"
                          className="bg-white dark:bg-gray-800 border dark:border-gray-750 rounded-xl px-3 py-1.5 text-xs dark:text-white outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DEDICATED LOCAL PICKUP ONLY CONFIGURATION */}
              {shippingMode === 'pickup_only' && (
                <div className="space-y-4 pt-2 border-t dark:border-gray-800">
                  {/* Local Pickup Alert Banner */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start gap-3 text-xs">
                    <div className="p-2 rounded-xl bg-amber-500/20 shrink-0 text-amber-600 dark:text-amber-400 font-bold text-base">
                      🤝
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-amber-900 dark:text-amber-200">
                        Local Pickup Only Listing
                      </p>
                      <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/80">
                        Buyers will not be charged any shipping fees. You and the buyer will coordinate an in-person exchange. Payments remain 100% escrow-protected until the buyer inspects and approves the gear during meetup.
                      </p>
                    </div>
                  </div>

                  {/* Pickup Neighborhood / Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                      <span>Pickup City, Neighborhood or ZIP *</span>
                      <span className="text-[10px] text-gray-400 font-normal">Shown publicly to local buyers</span>
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={pickupLocation}
                        onChange={(e) => {
                          setPickupLocation(e.target.value);
                          if (!location || location === 'Austin, TX') {
                            setLocation(e.target.value);
                          }
                        }}
                        placeholder="e.g. East Austin, TX 78702 or Downtown Recording Arts District"
                        className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Safe Meetup Spot Preset Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Suggested Safe Exchange Spot
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { title: 'Commercial Studio / Facility Lobby', desc: 'Secure indoor staffed space' },
                        { title: 'Police Dept Safe Exchange Zone', desc: 'Monitored 24/7 with CCTV' },
                        { title: 'Local Music Store / Guitar Center', desc: 'Neutral audio testing ground' },
                        { title: 'Bank Lobby / Well-lit Public Plaza', desc: 'High visibility and secure' },
                      ].map((spot) => (
                        <button
                          key={spot.title}
                          type="button"
                          onClick={() => setSafeZoneSpot(spot.title)}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            safeZoneSpot === spot.title
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                              : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/40 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <p className="text-xs font-bold leading-tight">{spot.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{spot.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hardware Testing Option */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-850/60 border dark:border-gray-800 space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <BadgeCheck size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold dark:text-white">Allow Hardware Testing On-Site</p>
                          <p className="text-[10px] text-gray-400">
                            Power outlet or audio interface available so the buyer can verify functional condition
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={testingOnSite}
                        onChange={(e) => setTestingOnSite(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Pickup Availability Schedule & Instructions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Pickup Availability / Hours
                      </label>
                      <input
                        type="text"
                        value={pickupSchedule}
                        onChange={(e) => setPickupSchedule(e.target.value)}
                        placeholder="e.g. Weekdays after 6pm, Weekends anytime"
                        className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl px-3.5 py-2 text-xs dark:text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Pickup / Parking Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        value={pickupNotes}
                        onChange={(e) => setPickupNotes(e.target.value)}
                        placeholder="e.g. Free visitor parking in rear, freight elevator available"
                        className="w-full bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-2xl px-3.5 py-2 text-xs dark:text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* =================================================================
              STEP 6: REVIEW & PUBLISH (PREVIEW SUMMARY)
             ================================================================= */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-4"
            >
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="text-emerald-500" size={18} />
                  <span>6. Review & Publish Listing</span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Confirm your gear inspection specs, photos, and shipping policy before publishing.
                </p>
              </div>

              {/* Preview Card */}
              <div className="p-4 sm:p-5 rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-850/50 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Photo thumbnail */}
                  <div className="w-full sm:w-36 h-36 rounded-2xl overflow-hidden bg-black/10 border dark:border-gray-700 relative shrink-0">
                    <img
                      src={
                        chassisPhotos['front'] ||
                        Object.values(chassisPhotos)[0] ||
                        Object.values(detailPhotos)[0] ||
                        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80'
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[9px] font-black">
                      {totalUploadedPhotos} Photos
                    </div>
                  </div>

                  {/* Summary specs */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400">
                        {condition}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">{category}</span>
                    </div>

                    <h3 className="text-base font-black dark:text-white leading-tight">
                      {title || 'Untitled Gear Listing'}
                    </h3>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {brand && <span className="font-bold">{brand} </span>}
                      {model && <span>{model} • </span>}
                      <span>{location}</span>
                    </div>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ${Number(price || 0).toLocaleString()}
                      </span>
                      {shippingMode === 'pickup_only' ? (
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-300 dark:border-amber-800/50">
                          🤝 Local Pickup Only
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                          {shippingCostType === 'free' ? '+ Free Shipping' : `+ $${shippingCost || 0} Shipping`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inspection & Shipping Summary Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t dark:border-gray-800 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-750">
                    <span className="text-[10px] text-gray-400 block">6-Point Chassis</span>
                    <span className={`font-black ${chassisCount === 6 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                      {chassisCount}/6 Angles
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-750">
                    <span className="text-[10px] text-gray-400 block">Details / Not on Unit</span>
                    <span className="font-black dark:text-white">
                      {detailCount} pics • {notOnUnitCount} N/A
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-750">
                    <span className="text-[10px] text-gray-400 block">Damage Status</span>
                    <span className={`font-black ${hasNoDamage ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                      {hasNoDamage ? 'Pristine' : `${damagePhotos.length} Flaw Photos`}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-750">
                    <span className="text-[10px] text-gray-400 block">Shipping Method</span>
                    <span className={`font-black ${shippingMode === 'pickup_only' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {shippingMode === 'pickup_only' ? '🤝 Local Pickup Only' : shippingCarrier}
                    </span>
                  </div>
                </div>

                {/* Shipping or Local Pickup safeguards badge */}
                {shippingMode === 'pickup_only' ? (
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 pt-1">
                    <span>Pickup: {pickupLocation || location}</span>
                    <span>• {safeZoneSpot}</span>
                    <span>• Testing: {testingOnSite ? 'On-site audio test ready' : 'Visual inspection'}</span>
                    <span>• {pickupSchedule}</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 pt-1">
                    <span>Handling: {handlingTime}</span>
                    {requireSignature && <span>• Direct Signature</span>}
                    {shippingInsuranceIncluded && <span>• Full Insurance</span>}
                    {packageWeight && <span>• {packageWeight}</span>}
                    {shippingMode === 'both' && <span>• Local Pickup Also Available</span>}
                  </div>
                )}
              </div>

              {/* Seller Guarantee Notice */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
                <BadgeCheck size={20} className="shrink-0 text-emerald-600" />
                <p>
                  Listing with multi-angle verification qualifies this item for the <strong>Verified Condition Badge</strong> and automated escrow payouts upon delivery.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 flex items-center justify-between gap-3">
          {/* Back / Cancel Button */}
          {currentStep === 1 ? (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl border dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}

          {/* Step Progress Counter */}
          <div className="hidden sm:flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((st) => (
              <span
                key={st}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentStep === st
                    ? 'w-6 bg-emerald-600'
                    : currentStep > st
                    ? 'bg-emerald-400'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Next / Submit Button */}
          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition"
            >
              <span>Next: {stepsList[currentStep]?.label}</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || uploading}
              className="flex items-center gap-2 px-7 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition disabled:opacity-50"
            >
              {submitting || uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Publishing Listing...</span>
                </>
              ) : (
                <>
                  <BadgeCheck size={16} />
                  <span>Publish Verified Listing</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

