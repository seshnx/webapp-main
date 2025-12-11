// src/config/constants.js

export const BOOKING_THRESHOLD = 60;
// Note: In production, Stripe keys should be in environment variables
export const STRIPE_PUBLIC_KEY = "pk_test_TYooMQauvdEDq54NiTphI7jx"; 

export const ACCOUNT_TYPES = [
    "Talent", "Engineer", "Producer", "Composer", "Studio", "Technician", "Fan",
    "Student", "Instructor", "Label", "Agent" // Added Label & Agent for Distribution
];

// Talent sub-roles - displayed instead of "Talent" when selected
export const TALENT_SUBROLES = [
    "Singer",
    "Singer-Songwriter",
    "Lyricist",
    "Rapper",
    "Guitarist",
    "Bassist",
    "Drummer",
    "Keyboardist",
    "Pianist",
    "Violinist",
    "Cellist",
    "Saxophonist",
    "Trumpeter",
    "DJ",
    "Beatmaker",
    "Multi-Instrumentalist",
    "Session Musician",
    "Vocalist",
    "Backup Singer",
    "Band"
];

// Vocal-specific data for singers
export const VOCAL_RANGES = [
    "Soprano",
    "Mezzo-Soprano", 
    "Alto",
    "Countertenor",
    "Tenor",
    "Baritone",
    "Bass",
    "Not Applicable"
];

export const VOCAL_STYLES = [
    "Pop",
    "R&B/Soul",
    "Rock",
    "Jazz",
    "Classical/Opera",
    "Musical Theatre",
    "Gospel",
    "Country",
    "Hip Hop/Rap",
    "Electronic/EDM",
    "Folk/Acoustic",
    "Metal/Screaming",
    "Reggae",
    "Latin",
    "World Music"
];

// Service types for bookings - organized by role relevance
export const SERVICE_TYPES = {
    general: ["Session", "Lesson", "Consultation", "Rehearsal"],
    talent: ["Vocal Recording", "Feature Verse", "Background Vocals", "Vocal Topline", "Live Performance", "Session Work", "Demo Recording"],
    production: ["Mixing", "Mastering", "Beat Production", "Arrangement", "Sound Design"],
    studio: ["Studio Rental", "Equipment Rental", "Recording Session", "Mixing Session"]
};

// Availability status options
export const AVAILABILITY_STATUS = {
    AVAILABLE: { id: 'available', label: 'Available for Work', color: 'green' },
    BUSY: { id: 'busy', label: 'Busy - Limited Availability', color: 'yellow' },
    UNAVAILABLE: { id: 'unavailable', label: 'Not Available', color: 'red' },
    TOURING: { id: 'touring', label: 'On Tour', color: 'purple' }
};

// Helper function to get display role - shows subRole if available, otherwise shows accountType
export const getDisplayRole = (userData) => {
    if (!userData) return 'User';
    
    const activeRole = userData.activeProfileRole || userData.accountTypes?.[0];
    
    // If the active role is Talent and they have a subRole set, show the subRole
    if (activeRole === 'Talent' && userData.talentSubRole) {
        return userData.talentSubRole;
    }
    
    return activeRole || 'User';
};

export const SUBSCRIPTION_PLAN_KEYS = { FREE: 'FREE', BASIC: 'BASIC', PRO: 'PRO', STUDIO: 'STUDIO', LABEL: 'LABEL' };
export const SUBSCRIPTION_PLANS = [];
export const TOKEN_PACKAGES = [];

export const POPULAR_PLUGINS_LIST = [
    "Xfer Serum", "NI Massive", "Sylenth1", "FabFilter Pro-Q 3", "Valhalla VintageVerb", 
    "RC-20 Retro Color", "Omnisphere", "Kontakt", "Auto-Tune", "Soundtoys Decapitator", 
    "Waves CLA-2A", "SerumFX", "Vital", "Diva"
];

// --- DISTRIBUTION & DDEX STANDARDS (NEW) ---

export const RELEASE_TYPES = [
    { id: 'single', label: 'Single', maxTracks: 1 },
    { id: 'ep', label: 'EP', maxTracks: 6 },
    { id: 'album', label: 'Album', maxTracks: 100 }
];

export const DISTRIBUTION_STORES = [
    { id: 'spotify', name: 'Spotify', icon: 'spotify' },
    { id: 'apple', name: 'Apple Music', icon: 'apple' },
    { id: 'tiktok', name: 'TikTok / Resso', icon: 'music' },
    { id: 'instagram', name: 'Instagram & Facebook', icon: 'instagram' },
    { id: 'youtube', name: 'YouTube Music', icon: 'youtube' },
    { id: 'amazon', name: 'Amazon Music', icon: 'shopping-cart' },
    { id: 'tidal', name: 'Tidal', icon: 'music' },
    { id: 'deezer', name: 'Deezer', icon: 'music' },
    { id: 'soundcloud', name: 'SoundCloud', icon: 'cloud' }
];

// DDEX-Compliant Genre List (Simplified Subset)
export const DDEX_GENRES = [
    "Alternative", "Blues", "Children's Music", "Christian & Gospel", "Classical", 
    "Comedy", "Country", "Dance", "Electronic", "Fitness & Workout", "Folk", 
    "Hip Hop/Rap", "Holiday", "Indie Pop", "Instrumental", "Jazz", "K-Pop", 
    "Latin", "Metal", "New Age", "Pop", "R&B/Soul", "Reggae", "Rock", 
    "Singer/Songwriter", "Soundtrack", "Spoken Word", "World"
];

export const ARTWORK_REQUIREMENTS = {
    minWidth: 3000,
    minHeight: 3000,
    aspectRatio: 1, // 1:1 Square
    formats: ['image/jpeg', 'image/png'],
    maxSizeMB: 10
};

export const AUDIO_REQUIREMENTS = {
    format: 'audio/wav',
    bitDepth: [16, 24],
    sampleRate: [44100, 48000],
    maxSizeMB: 200 // Per track limit for upload
};

// --- EXISTING CONSTANTS BELOW ---

export const SCHOOL_PERMISSIONS = [
    { id: 'manage_roster', label: 'Manage Roster', description: 'Add, remove, or edit student details.' },
    { id: 'manage_enrollment', label: 'Admissions', description: 'Process applications and handle intake.' },
    { id: 'approve_hours', label: 'Approve Hours', description: 'Verify and approve internship time logs.' },
    { id: 'manage_partners', label: 'Manage Partners', description: 'Add or edit approved internship studios.' },
    { id: 'grade_students', label: 'Grading', description: 'Submit technical and soft-skill evaluations.' },
    { id: 'post_announcements', label: 'Announcements', description: 'Post news to the student dashboard.' },
    { id: 'manage_resources', label: 'Resource Rules', description: 'Set quotas and booking restrictions.' },
    { id: 'manage_staff', label: 'Manage Staff', description: 'Add new instructors and assign roles.' },
    { id: 'view_audit', label: 'View Audit Logs', description: 'See history of administrative actions.' },
    { id: 'edit_settings', label: 'School Settings', description: 'Change school name, address, and branding.' }
];

export const INSTRUMENT_DATA = { 
    "Vocals": ["Soprano", "Tenor", "Baritone", "Bass", "Falsetto", "Rapping", "Beatboxing", "Growling"], 
    "Guitars": ["Electric Guitar", "Acoustic Guitar", "Bass Guitar", "Classical/Nylon", "12-String Acoustic", "Upright Bass"],
    "Percussion": ["Drum Kit", "Electronic Drums", "Congas", "Bongos", "Djembe", "Cajon", "Timbales", "Tabla", "Marimba", "Vibraphone"], 
    "Keys": ["Grand Piano", "Upright Piano", "Electric Piano", "Clavinet", "Hammond Organ", "Pipe Organ", "Synthesizer", "MIDI Controller", "Accordion"], 
    "Strings": ["Violin", "Viola", "Cello", "Double Bass", "Harp", "Banjo", "Mandolin", "Ukulele", "Sitar", "Oud"],
    "Wind": ["Flute", "Clarinet", "Oboe", "Bassoon", "Saxophone", "Trumpet", "Trombone", "French Horn", "Tuba", "Harmonica", "Didgeridoo", "Bagpipes"]
};

export const GENRE_DATA = [
    "Rock", "Alternative", "Indie", "Metal", "Punk", "Pop", "Electronic", "House", "Techno", "Dubstep", "Hip Hop", "Rap", "Trap", "R&B", "Soul", "Funk", "Jazz", "Blues", "Country", "Folk", "Americana", "Bluegrass", "Classical", "Reggae", "Latin", "World", "Experimental"
];

export const AMENITIES_DATA = ["Wi-Fi", "Kitchen", "Lounge", "Private Parking", "Shower", "Sleep/Lodging", "Accessibility Ramps", "Video Feed", "Loading Dock", "Isolation Booth", "Live Room", "Grand Piano", "Tape Machine"];

const NAME_FIELDS = [{ key: "useRealName", label: "Use Primary Name?", type: "checkbox", isToggle: true }, { key: "profileName", label: "Profile/Stage Name", type: "text" }];

export const PROFILE_SCHEMAS = {
  "Talent": [
    { key: "talentSubRole", label: "What best describes you?", type: "select", options: ["", ...TALENT_SUBROLES], isSubRole: true },
    { key: "profileName", label: "Artist / Stage Name", type: "text" }, 
    { key: "bio", label: "Biography", type: "textarea" },
    // Vocal-specific fields - shown for singers/vocalists
    { key: "vocalRange", label: "Vocal Range", type: "select", options: ["", ...VOCAL_RANGES], showFor: ["Singer", "Singer-Songwriter", "Vocalist", "Backup Singer", "Rapper"] },
    { key: "vocalStyles", label: "Vocal Styles", type: "multi_select", data: VOCAL_STYLES, showFor: ["Singer", "Singer-Songwriter", "Vocalist", "Backup Singer", "Rapper"] },
    { key: "demoReelUrl", label: "Demo Reel / Sample Link", type: "text", placeholder: "YouTube, SoundCloud, or Spotify link", showFor: ["Singer", "Singer-Songwriter", "Vocalist", "Backup Singer", "Rapper"] },
    { key: "instruments", label: "Instruments & Skills", type: "nested_select", data: INSTRUMENT_DATA },
    { key: "genres", label: "Primary Genres", type: "multi_select", data: GENRE_DATA },
    { key: "availabilityStatus", label: "Current Availability", type: "select", options: ["", "Available for Work", "Busy - Limited Availability", "Not Available", "On Tour"] },
    { key: "rates", label: "Booking/Feature Rate ($)", type: "number" },
    { key: "sessionRate", label: "Session Rate ($/hr)", type: "number" },
    { key: "dayRate", label: "Day Rate ($)", type: "number" },
    { key: "travelDist", label: "Max Travel (mi)", type: "number" },
    { key: "gearHighlights", label: "Key Gear (Instruments, Amps, etc.)", type: "textarea" },
    { key: "readingSkill", label: "Sight Reading", type: "select", options: ["None", "Charts/Lead Sheets", "Standard Notation", "Expert"] },
    { key: "remoteWork", label: "Remote Recording Capable?", type: "select", options: ["Yes", "No"] },
    { key: "website", label: "Official Website", type: "text" },
    { key: "label", label: "Record Label (Optional)", type: "text" },
    { key: "touring", label: "Currently Touring?", type: "select", options: ["Yes", "No"] }
  ],
  "Label": [
    { key: "profileName", label: "Label Name", type: "text" },
    { key: "bio", label: "Label Description / Mission", type: "textarea" },
    { key: "genres", label: "Focus Genres", type: "multi_select", data: GENRE_DATA },
    { key: "website", label: "Website", type: "text" },
    { key: "acceptingDemos", label: "Accepting Demos?", type: "select", options: ["Yes", "No"] }
  ],
  "Agent": [
    ...NAME_FIELDS,
    { key: "agencyName", label: "Agency Name", type: "text" },
    { key: "rosterSize", label: "Roster Size", type: "number" },
    { key: "territory", label: "Territory Focus", type: "text" }
  ],
  "Fan": [
    { key: "bio", label: "About Me", type: "textarea" },
    { key: "genres", label: "Favorite Genres", type: "multi_select", data: GENRE_DATA },
    { key: "lookingFor", label: "Interested In", type: "multi_select", data: ["Discovering Music", "Booking Talent", "Learning"] }
  ],
  "Studio": [
    ...NAME_FIELDS,
    { key: "profileName", label: "Studio Name", type: "text" },
    { key: "bio", label: "Description", type: "textarea" },
    { key: "address", label: "Address", type: "text" },
    { key: "hours", label: "Hours of Operation", type: "text" },
    { key: "dimensions", label: "Live Room Dimensions", type: "text" },
    { key: "parking", label: "Parking Situation", type: "text" },
    { key: "amenities", label: "Amenities", type: "multi_select", data: AMENITIES_DATA }
  ],
  "Engineer": [
    ...NAME_FIELDS,
    { key: "bio", label: "Bio", type: "textarea" },
    { key: "skills", label: "Specialties", type: "multi_select", data: ["Tracking", "Mixing", "Mastering", "Live Sound", "Broadcast", "Dolby Atmos", "Editing/Tuning"] },
    { key: "daw", label: "DAWs", type: "multi_select", data: ["Pro Tools", "Logic Pro", "Ableton", "FL Studio", "Cubase", "Reaper", "Studio One", "Luna"] },
    { key: "outboard", label: "Favorite Outboard Gear", type: "textarea" },
    { key: "credits", label: "Selected Credits", type: "textarea" }
  ],
  "Producer": [ 
    ...NAME_FIELDS,
    { key: "bio", label: "Bio", type: "textarea" }, 
    { key: "genres", label: "Genres", type: "multi_select", data: GENRE_DATA }, 
    { key: "daw", label: "Primary DAW", type: "select", options: ["Pro Tools", "Logic Pro", "Ableton", "FL Studio", "Cubase", "Studio One"] },
    { key: "credits", label: "Discography / Credits", type: "textarea" } 
  ],
  "Composer": [ 
    ...NAME_FIELDS,
    { key: "bio", label: "Bio", type: "textarea" }, 
    { key: "compType", label: "Type", type: "multi_select", options:["Film/TV","Game Audio","Pop/Songwriting","Classical/Orchestral", "Library Music", "Jingles"] },
    { key: "instruments", label: "Primary Instruments", type: "nested_select", data: INSTRUMENT_DATA }, 
    { key: "libraries", label: "Key Sample Libraries", type: "textarea" },
    { key: "credits", label: "Credits", type: "textarea" } 
  ],
  "Technician": [
    ...NAME_FIELDS,
    { key: "bio", label: "Bio", type: "textarea" },
    { key: "skills", label: "Skills", type: "textarea" }
  ]
};

export const SERVICE_CATALOGUE = [
    { id: 'repair', label: 'Equipment Repair' },
    { id: 'wiring', label: 'Studio Wiring/Install' },
    { id: 'acoustics', label: 'Acoustic Calibration' },
    { id: 'computer', label: 'DAW/Computer Support' },
    { id: 'mods', label: 'Custom Mods' },
];

export const TECH_SPECIALTIES = [
    "Luthier (Guitar/Bass)", "Drum Tech", "Amp Tech (Tube)", "Amp Tech (Solid State)",
    "Studio Electrician", "Acoustician", "Piano Tuner/Tech", "Synth/Keyboard Tech",
    "Computer/IT Systems", "Soldering/Cabling", "Console Maintenance", "Live Sound Tech"
];

export const EQUIP_CATEGORIES = [
    // Recording & Production
    { id: 'audio_interfaces', label: 'Audio Interfaces' },
    { id: 'microphones', label: 'Microphones' },
    { id: 'preamps', label: 'Preamps & Channel Strips' },
    { id: 'mixing_consoles', label: 'Mixing Consoles & Mixers' },
    { id: 'monitors', label: 'Studio Monitors & Speakers' },
    { id: 'headphones', label: 'Headphones & IEMs' },
    { id: 'outboard_processing', label: 'Outboard Gear (Compressors, EQs)' },
    { id: 'effects_processors', label: 'Effects Processors & Reverbs' },
    { id: 'converters', label: 'AD/DA Converters & Clocks' },
    
    // Instruments - Guitars & Bass
    { id: 'electric_guitars', label: 'Electric Guitars' },
    { id: 'acoustic_guitars', label: 'Acoustic Guitars' },
    { id: 'bass_guitars', label: 'Bass Guitars' },
    { id: 'guitar_amps', label: 'Guitar & Bass Amplifiers' },
    { id: 'guitar_effects', label: 'Guitar Pedals & Effects' },
    { id: 'guitar_accessories', label: 'Guitar Accessories (Cases, Straps, Strings)' },
    
    // Instruments - Keys & Synths
    { id: 'synthesizers', label: 'Synthesizers' },
    { id: 'keyboards', label: 'Keyboards & Workstations' },
    { id: 'midi_controllers', label: 'MIDI Controllers' },
    { id: 'pianos', label: 'Pianos (Digital & Acoustic)' },
    { id: 'organs', label: 'Organs' },
    
    // Instruments - Drums & Percussion
    { id: 'drum_kits', label: 'Drum Kits (Acoustic)' },
    { id: 'electronic_drums', label: 'Electronic Drums & Pads' },
    { id: 'cymbals', label: 'Cymbals' },
    { id: 'percussion', label: 'Percussion & Hand Drums' },
    { id: 'drum_machines', label: 'Drum Machines & Samplers' },
    
    // Instruments - Other
    { id: 'string_instruments', label: 'String Instruments (Violin, Cello, etc.)' },
    { id: 'wind_instruments', label: 'Wind & Brass Instruments' },
    { id: 'world_instruments', label: 'World & Ethnic Instruments' },
    
    // Live Sound & PA
    { id: 'pa_speakers', label: 'PA Speakers & Subwoofers' },
    { id: 'power_amps', label: 'Power Amplifiers' },
    { id: 'live_mixers', label: 'Live Sound Mixers' },
    { id: 'wireless_systems', label: 'Wireless Microphone Systems' },
    { id: 'in_ear_monitors', label: 'In-Ear Monitor Systems' },
    { id: 'stage_gear', label: 'Stage Gear (DI Boxes, Snakes, Stands)' },
    
    // DJ & Electronic
    { id: 'turntables', label: 'Turntables & DJ Decks' },
    { id: 'dj_controllers', label: 'DJ Controllers' },
    { id: 'dj_mixers', label: 'DJ Mixers' },
    { id: 'cdj_media_players', label: 'CDJs & Media Players' },
    
    // Recording Media & Storage
    { id: 'recorders', label: 'Recorders (Field, Multitrack)' },
    { id: 'tape_machines', label: 'Tape Machines & Reel-to-Reel' },
    
    // Studio Furniture & Acoustic
    { id: 'studio_furniture', label: 'Studio Furniture & Desks' },
    { id: 'acoustic_treatment', label: 'Acoustic Treatment & Panels' },
    { id: 'isolation', label: 'Isolation Booths & Shields' },
    
    // Cables & Connectivity
    { id: 'cables', label: 'Cables & Connectors' },
    { id: 'patchbays', label: 'Patchbays & Routing' },
    
    // Lighting & Video
    { id: 'stage_lighting', label: 'Stage Lighting' },
    { id: 'video_gear', label: 'Video & Streaming Gear' },
    
    // Computers & Software
    { id: 'computers', label: 'Computers & Laptops (Music Production)' },
    { id: 'software_licenses', label: 'Software & Plugin Licenses' },
    { id: 'storage_drives', label: 'Storage & Hard Drives' },
    
    // Accessories & Parts
    { id: 'stands_mounts', label: 'Stands & Mounts' },
    { id: 'cases_bags', label: 'Cases, Bags & Road Cases' },
    { id: 'power_conditioning', label: 'Power Conditioners & UPS' },
    { id: 'parts_components', label: 'Parts & Components' },
    
    // Vintage & Collectible
    { id: 'vintage_gear', label: 'Vintage & Collectible Gear' },
    
    // Other
    { id: 'other', label: 'Other' }
];

// --- HIGH-VALUE MARKETPLACE / SAFE EXCHANGE CONSTANTS ---

export const HIGH_VALUE_THRESHOLD = 500; // Items over $500 require escrow hold

// Safe Exchange requirement levels
export const SAFE_EXCHANGE_REQUIREMENT = {
    OPTIONAL: 'optional',       // Under $500, buyer can choose
    SELLER_REQUIRED: 'seller_required', // Seller enabled "require for all listings"
    REQUIRED: 'required'        // Over $500, always required with escrow
};

export const SAFE_EXCHANGE_STATUS = {
    INTENT_CREATED: 'intent_created',
    HOLD_PLACED: 'hold_placed',
    SELLER_NOTIFIED: 'seller_notified',
    MEETUP_SCHEDULED: 'meetup_scheduled',
    SELLER_EN_ROUTE: 'seller_en_route',
    BUYER_EN_ROUTE: 'buyer_en_route',
    AT_SAFE_ZONE: 'at_safe_zone',
    SELLER_PHOTOS_UPLOADED: 'seller_photos_uploaded',
    BUYER_INSPECTING: 'buyer_inspecting',
    BUYER_PHOTOS_UPLOADED: 'buyer_photos_uploaded',
    PENDING_DUAL_APPROVAL: 'pending_dual_approval',
    SELLER_APPROVED: 'seller_approved',
    BUYER_APPROVED: 'buyer_approved',
    COMPLETED: 'completed',
    DISPUTED: 'disputed',
    CANCELLED: 'cancelled'
};

// Shipping Verification Status (for shipped items)
export const SHIPPING_VERIFICATION_STATUS = {
    PENDING_SHIPMENT: 'pending_shipment',
    SELLER_PACKAGING_PHOTOS: 'seller_packaging_photos',
    SELLER_DROPOFF_PHOTOS: 'seller_dropoff_photos',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    BUYER_PICKUP_PHOTOS: 'buyer_pickup_photos',
    BUYER_UNBOXING_PHOTOS: 'buyer_unboxing_photos',
    BUYER_VERIFIED: 'buyer_verified',
    COMPLETED: 'completed',
    DISPUTED: 'disputed'
};

export const SHIPPING_VERIFICATION_STEPS = [
    { key: 'packaging', label: 'Package Item', description: 'Seller photographs item & packaging', role: 'seller' },
    { key: 'dropoff', label: 'Drop Off', description: 'Seller photographs package at carrier', role: 'seller' },
    { key: 'transit', label: 'In Transit', description: 'Package in transit to buyer', role: 'system' },
    { key: 'pickup', label: 'Pick Up', description: 'Buyer photographs sealed package', role: 'buyer' },
    { key: 'unbox', label: 'Unbox & Verify', description: 'Buyer opens and verifies contents', role: 'buyer' },
    { key: 'complete', label: 'Complete', description: 'Transaction finalized', role: 'system' }
];

// Fulfillment methods
export const FULFILLMENT_METHOD = {
    LOCAL_PICKUP: 'local_pickup',
    SAFE_EXCHANGE: 'safe_exchange',
    SHIPPING: 'shipping'
};

export const SAFE_EXCHANGE_STEPS = [
    { key: 'intent', label: 'Purchase Intent', description: 'Buyer initiates purchase' },
    { key: 'hold', label: 'Payment Hold', description: 'Card hold placed in escrow' },
    { key: 'schedule', label: 'Schedule Meetup', description: 'Coordinate exchange date/location' },
    { key: 'seller_depart', label: 'Seller Departs', description: 'Seller uploads pre-departure photos' },
    { key: 'arrive', label: 'Safe Zone Arrival', description: 'Both parties arrive at safe location' },
    { key: 'inspect', label: 'Buyer Inspection', description: 'Buyer verifies item condition' },
    { key: 'approve', label: 'Dual Approval', description: 'Both parties confirm exchange' },
    { key: 'complete', label: 'Complete', description: 'Funds released to seller' }
];

// GPS fence radius in meters for safe zone verification
export const SAFE_ZONE_RADIUS_METERS = 100;

// Distance threshold for buyer/seller proximity (meters)
export const PROXIMITY_THRESHOLD_METERS = 50;

// Pre-defined safe exchange locations (expandable via admin)
export const SAFE_ZONE_TYPES = [
    { id: 'police_station', label: 'Police Station', icon: 'shield', priority: 1 },
    { id: 'fire_station', label: 'Fire Station', icon: 'flame', priority: 2 },
    { id: 'bank', label: 'Bank Lobby', icon: 'landmark', priority: 3 },
    { id: 'post_office', label: 'Post Office', icon: 'mail', priority: 4 },
    { id: 'city_hall', label: 'City Hall / Gov Building', icon: 'building', priority: 5 },
    { id: 'library', label: 'Public Library', icon: 'book', priority: 6 },
    { id: 'mall_security', label: 'Mall Security Office', icon: 'store', priority: 7 }
];