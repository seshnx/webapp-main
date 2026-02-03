// src/config/constants.ts

import type {
  AccountType,
  TalentSubRole,
  ProfileField,
  ProfileSchemas,
  ServiceTypes
} from '../types';

// =====================================================
// BASIC CONSTANTS
// =====================================================

export const BOOKING_THRESHOLD: number = 60;

// Stripe public key from Vercel environment variables
export const STRIPE_PUBLIC_KEY: string =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export const ACCOUNT_TYPES: AccountType[] = [
  "Talent", "Engineer", "Producer", "Composer", "Studio", "Technician", "Fan",
  "Student", "EDUStaff", "EDUAdmin", "Intern", "Label", "Agent", "GAdmin"
];

// Talent sub-roles - displayed instead of "Talent" when selected
export const TALENT_SUBROLES: TalentSubRole[] = [
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

// Sub-roles that are vocal-focused
export const VOCAL_SUBROLES: string[] = ["Singer", "Singer-Songwriter", "Vocalist", "Backup Singer", "Rapper"];

// Sub-roles that are instrument-focused
export const INSTRUMENTALIST_SUBROLES: string[] = [
  "Guitarist", "Bassist", "Drummer", "Keyboardist", "Pianist", "Violinist", "Cellist",
  "Saxophonist", "Trumpeter", "Multi-Instrumentalist", "Session Musician"
];

// Sub-roles that are DJ/electronic-focused
export const DJ_SUBROLES: string[] = ["DJ", "Beatmaker"];

// Vocal-specific data for singers
export const VOCAL_RANGES: string[] = [
  "Soprano",
  "Mezzo-Soprano",
  "Alto",
  "Countertenor",
  "Tenor",
  "Baritone",
  "Bass",
  "Not Applicable"
];

export const VOCAL_STYLES: string[] = [
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

// Instrument-specific experience levels
export const PLAYING_EXPERIENCE: string[] = [
  "Beginner (0-2 years)",
  "Intermediate (2-5 years)",
  "Advanced (5-10 years)",
  "Professional (10+ years)",
  "Session Veteran (20+ years)"
];

// DJ-specific data
export const DJ_STYLES: string[] = [
  "Club/Dance",
  "Hip Hop",
  "House",
  "Techno",
  "Drum & Bass",
  "Dubstep",
  "Trance",
  "EDM/Festival",
  "Open Format",
  "Wedding/Corporate",
  "Turntablism/Scratch",
  "Radio"
];

// Producer-specific data
export const PRODUCTION_STYLES: string[] = [
  "Hip Hop/Trap",
  "Pop",
  "R&B",
  "Electronic/EDM",
  "Rock/Alternative",
  "Country",
  "Jazz",
  "Classical/Orchestral",
  "Film/TV Scoring",
  "Lo-Fi/Ambient",
  "Latin/Reggaeton",
  "Gospel/Christian"
];

// Engineer-specific data
export const ENGINEERING_SPECIALTIES: string[] = [
  "Tracking/Recording",
  "Mixing",
  "Mastering",
  "Live Sound/FOH",
  "Monitor Engineering",
  "Broadcast/Podcast",
  "Dolby Atmos/Spatial",
  "Restoration/Forensic",
  "Sound Design",
  "ADR/Dialogue"
];

// Service types for bookings
export const SERVICE_TYPES: ServiceTypes = {
  general: ["Session", "Lesson", "Consultation", "Rehearsal", "Collaboration"],
  talent: ["Vocal Recording", "Feature Verse", "Background Vocals", "Vocal Topline", "Live Performance", "Session Work", "Demo Recording"],
  instrumentalist: ["Session Recording", "Live Gig", "Tour Support", "Recording Session", "Overdubs", "Arrangement"],
  dj: ["Club Set", "Private Event", "Festival Set", "Radio Mix", "Corporate Event", "Wedding"],
  production: ["Beat Production", "Full Production", "Co-Production", "Remix", "Arrangement", "Sound Design", "Composition"],
  engineering: ["Mixing", "Mastering", "Tracking", "Editing", "Tuning/Comping", "Stem Mixing", "Atmos Mix"],
  studio: ["Studio Rental", "Equipment Rental", "Recording Session", "Mixing Session", "Rehearsal Space"],
  composer: ["Original Score", "Arrangement", "Orchestration", "Library Music", "Jingle/Commercial", "Songwriting"],
  tech: ["Equipment Repair", "Studio Wiring/Install", "Acoustic Calibration", "DAW/Computer Support", "Custom Mods"]
};

// Availability status options
export const AVAILABILITY_STATUS: Record<string, { id: string; label: string; color: string }> = {
  AVAILABLE: { id: 'available', label: 'Available for Work', color: 'green' },
  BUSY: { id: 'busy', label: 'Busy - Limited Availability', color: 'yellow' },
  UNAVAILABLE: { id: 'unavailable', label: 'Not Available', color: 'red' },
  TOURING: { id: 'touring', label: 'On Tour', color: 'purple' }
};

export const INSTRUMENT_DATA: Record<string, string[]> = {
  "Vocals": ["Soprano", "Tenor", "Baritone", "Bass", "Falsetto", "Rapping", "Beatboxing", "Growling"],
  "Guitars": ["Electric Guitar", "Acoustic Guitar", "Bass Guitar", "Classical/Nylon", "12-String Acoustic", "Upright Bass"],
  "Percussion": ["Drum Kit", "Electronic Drums", "Congas", "Bongos", "Djembe", "Cajon", "Timbales", "Tabla", "Marimba", "Vibraphone"],
  "Keys": ["Grand Piano", "Upright Piano", "Electric Piano", "Clavinet", "Hammond Organ", "Pipe Organ", "Synthesizer", "MIDI Controller", "Accordion"],
  "Strings": ["Violin", "Viola", "Cello", "Double Bass", "Harp", "Banjo", "Mandolin", "Ukulele", "Sitar", "Oud"],
  "Wind": ["Flute", "Clarinet", "Oboe", "Bassoon", "Saxophone", "Trumpet", "Trombone", "French Horn", "Tuba", "Harmonica", "Didgeridoo", "Bagpipes"]
};

export const GENRE_DATA: string[] = [
  "Rock", "Alternative", "Indie", "Metal", "Punk", "Pop", "Electronic", "House", "Techno", "Dubstep",
  "Hip Hop", "Rap", "Trap", "R&B", "Soul", "Funk", "Jazz", "Blues", "Country", "Folk", "Americana",
  "Bluegrass", "Classical", "Reggae", "Latin", "World", "Experimental"
];

export const AMENITIES_DATA: string[] = [
  "Wi-Fi", "Kitchen", "Lounge", "Private Parking", "Shower", "Sleep/Lodging", "Accessibility Ramps",
  "Video Feed", "Loading Dock", "Isolation Booth", "Live Room", "Grand Piano", "Tape Machine"
];

const NAME_FIELDS: ProfileField[] = [
  { key: "useRealName", label: "Use Primary Name?", type: "checkbox", isToggle: true },
  { key: "profileName", label: "Profile/Stage Name", type: "text" }
];

// Profile schemas
export const PROFILE_SCHEMAS: ProfileSchemas = {
  "Talent": [
    { key: "talentSubRole", label: "What best describes you?", type: "select", options: ["", ...TALENT_SUBROLES], isSubRole: true },
    { key: "profileName", label: "Artist / Stage Name", type: "text" },
    { key: "bio", label: "Biography", type: "textarea" },
    { key: "vocalRange", label: "Vocal Range", type: "select", options: ["", ...VOCAL_RANGES], showFor: VOCAL_SUBROLES },
    { key: "vocalStyles", label: "Vocal Styles", type: "multi_select", data: VOCAL_STYLES, showFor: VOCAL_SUBROLES },
    { key: "demoReelUrl", label: "Demo Reel / Sample Link", type: "text", placeholder: "YouTube, SoundCloud, or Spotify link" },
    { key: "primaryInstrument", label: "Primary Instrument", type: "text", showFor: INSTRUMENTALIST_SUBROLES },
    { key: "playingExperience", label: "Playing Experience", type: "select", options: ["", ...PLAYING_EXPERIENCE], showFor: INSTRUMENTALIST_SUBROLES },
    { key: "canReadMusic", label: "Sight Reading Ability", type: "select", options: ["", "None", "Lead Sheets/Charts", "Standard Notation", "Expert/Classically Trained"], showFor: INSTRUMENTALIST_SUBROLES },
    { key: "ownGear", label: "Own Professional Gear?", type: "select", options: ["", "Yes - Full Rig", "Yes - Basic Setup", "No - Need Backline"], showFor: INSTRUMENTALIST_SUBROLES },
    { key: "djStyles", label: "DJ Styles", type: "multi_select", data: DJ_STYLES, showFor: DJ_SUBROLES },
    { key: "djSetup", label: "DJ Setup", type: "select", options: ["", "CDJs/XDJs", "Turntables", "Controller", "Hybrid", "All of the Above"], showFor: DJ_SUBROLES },
    { key: "canProvidePa", label: "Can Provide PA/Sound?", type: "select", options: ["", "Yes - Full System", "Yes - Basic Setup", "No"], showFor: DJ_SUBROLES },
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
    { key: "amenities", label: "Amenities", type: "multi_select", data: AMENITIES_DATA },
    { key: "availabilityStatus", label: "Current Availability", type: "select", options: ["", "Open - Accepting Bookings", "Limited Availability", "Fully Booked", "Closed for Maintenance"] },
    { key: "hourlyRate", label: "Hourly Rate ($)", type: "number" },
    { key: "dayRate", label: "Day Rate ($)", type: "number" },
    { key: "virtualTourUrl", label: "Virtual Tour Link", type: "text", placeholder: "YouTube or 360° tour URL" },
    { key: "gearList", label: "Equipment List URL", type: "text" }
  ],
  "Engineer": [
    ...NAME_FIELDS,
    { key: "bio", label: "Bio", type: "textarea" },
    { key: "skills", label: "Specialties", type: "multi_select", data: ENGINEERING_SPECIALTIES },
    { key: "daw", label: "DAWs", type: "multi_select", data: ["Pro Tools", "Logic Pro", "Ableton", "FL Studio", "Cubase", "Reaper", "Studio One", "Luna"] },
    { key: "outboard", label: "Favorite Outboard Gear", type: "textarea" },
    { key: "credits", label: "Selected Credits", type: "textarea" },
    { key: "availabilityStatus", label: "Current Availability", type: "select", options: ["", "Available for Work", "Busy - Limited Availability", "Not Available", "On Location"] },
    { key: "hourlyRate", label: "Hourly Rate ($)", type: "number" },
    { key: "projectRate", label: "Per-Song/Project Rate ($)", type: "number" },
    { key: "sampleWorkUrl", label: "Sample Work / Reel Link", type: "text", placeholder: "SoundCloud, YouTube, or portfolio URL" },
    { key: "remoteWork", label: "Remote Mixing Available?", type: "select", options: ["Yes", "No"] },
    { key: "hasStudio", label: "Has Own Studio?", type: "select", options: ["Yes - Commercial", "Yes - Home Studio", "No - Freelance Only"] }
  ],
  "Producer": [
    ...NAME_FIELDS,
    { key: "bio", label: "Bio", type: "textarea" },
    { key: "genres", label: "Genres", type: "multi_select", data: GENRE_DATA },
    { key: "productionStyles", label: "Production Styles", type: "multi_select", data: PRODUCTION_STYLES },
    { key: "daw", label: "Primary DAW", type: "select", options: ["Pro Tools", "Logic Pro", "Ableton", "FL Studio", "Cubase", "Studio One", "Reason", "Bitwig"] },
    { key: "credits", label: "Discography / Credits", type: "textarea" },
    { key: "availabilityStatus", label: "Current Availability", type: "select", options: ["", "Available for Work", "Busy - Limited Availability", "Not Available", "In Studio"] },
    { key: "beatLeasePrice", label: "Beat Lease Price ($)", type: "number" },
    { key: "exclusivePrice", label: "Exclusive Beat Price ($)", type: "number" },
    { key: "customBeatPrice", label: "Custom Production Rate ($)", type: "number" },
    { key: "sampleWorkUrl", label: "Beat Catalog / Portfolio Link", type: "text", placeholder: "BeatStars, YouTube, or website URL" },
    { key: "acceptsCollabs", label: "Open to Collaborations?", type: "select", options: ["Yes", "Paid Only", "No"] }
  ],
  "Composer": [
    ...NAME_FIELDS,
    { key: "bio", label: "Bio", type: "textarea" },
    { key: "compType", label: "Type", type: "multi_select", options: ["Film/TV", "Game Audio", "Pop/Songwriting", "Classical/Orchestral", "Library Music", "Jingles"] },
    { key: "instruments", label: "Primary Instruments", type: "nested_select", data: INSTRUMENT_DATA },
    { key: "libraries", label: "Key Sample Libraries", type: "textarea" },
    { key: "credits", label: "Credits", type: "textarea" },
    { key: "availabilityStatus", label: "Current Availability", type: "select", options: ["", "Available for Work", "Busy - Limited Availability", "Not Available", "On Project"] },
    { key: "projectRate", label: "Project Rate ($/minute of music)", type: "number" },
    { key: "reelUrl", label: "Demo Reel / Portfolio Link", type: "text", placeholder: "Vimeo, YouTube, or portfolio URL" },
    { key: "canOrchestrate", label: "Orchestration Services?", type: "select", options: ["Yes", "No"] },
    { key: "turnaroundTime", label: "Typical Turnaround", type: "select", options: ["24-48 hours", "3-5 days", "1-2 weeks", "Project Dependent"] }
  ],
  "Technician": [
    ...NAME_FIELDS,
    { key: "bio", label: "Bio", type: "textarea" },
    { key: "skills", label: "Skills", type: "textarea" }
  ]
};

// Helper function to get display role
export const getDisplayRole = (userData: any): string => {
  if (!userData) return 'User';

  const activeRole = userData.activeProfileRole || userData.accountTypes?.[0];

  // If the active role is Talent and they have a subRole set, show the subRole
  if (activeRole === 'Talent' && userData.talentSubRole) {
    return userData.talentSubRole;
  }

  return activeRole || 'User';
};

export const SUBSCRIPTION_PLAN_KEYS = { FREE: 'FREE', BASIC: 'BASIC', PRO: 'PRO', STUDIO: 'STUDIO', LABEL: 'LABEL' } as const;
export const SUBSCRIPTION_PLANS: any[] = [];
export const TOKEN_PACKAGES: any[] = [];

export const POPULAR_PLUGINS_LIST: string[] = [
  "Xfer Serum", "NI Massive", "Sylenth1", "FabFilter Pro-Q 3", "Valhalla VintageVerb",
  "RC-20 Retro Color", "Omnisphere", "Kontakt", "Auto-Tune", "Soundtoys Decapitator",
  "Waves CLA-2A", "SerumFX", "Vital", "Diva"
];

// =====================================================
// DISTRIBUTION & DDEX STANDARDS
// =====================================================

export const RELEASE_TYPES: Array<{ id: string; label: string; maxTracks: number }> = [
  { id: 'single', label: 'Single', maxTracks: 1 },
  { id: 'ep', label: 'EP', maxTracks: 6 },
  { id: 'album', label: 'Album', maxTracks: 100 }
];

export const DISTRIBUTION_STORES: Array<{ id: string; name: string; icon: string }> = [
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

export const DDEX_GENRES: string[] = [
  "Alternative", "Blues", "Children's Music", "Christian & Gospel", "Classical",
  "Comedy", "Country", "Dance", "Electronic", "Fitness & Workout", "Folk",
  "Hip Hop/Rap", "Holiday", "Indie Pop", "Instrumental", "Jazz", "K-Pop",
  "Latin", "Metal", "New Age", "Pop", "R&B/Soul", "Reggae", "Rock",
  "Singer/Songwriter", "Soundtrack", "Spoken Word", "World"
];

export const ARTWORK_REQUIREMENTS: {
  minWidth: number;
  minHeight: number;
  aspectRatio: number;
  formats: string[];
  maxSizeMB: number;
} = {
  minWidth: 3000,
  minHeight: 3000,
  aspectRatio: 1,
  formats: ['image/jpeg', 'image/png'],
  maxSizeMB: 10
};

export const AUDIO_REQUIREMENTS: {
  format: string;
  bitDepth: number[];
  sampleRate: number[];
  maxSizeMB: number;
} = {
  format: 'audio/wav',
  bitDepth: [16, 24],
  sampleRate: [44100, 48000],
  maxSizeMB: 200
};

// =====================================================
// EDU CONSTANTS
// =====================================================

export const SCHOOL_PERMISSIONS: Array<{
  id: string;
  label: string;
  description: string;
}> = [
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

export const EDU_ROLES: string[] = ['EDUAdmin', 'EDUStaff', 'Student', 'Intern'];
export const EDU_ROLE_HIERARCHY: string[] = ['EDUAdmin', 'EDUStaff', 'Intern', 'Student'];
export const GLOBAL_ADMIN_ROLE: string = 'GAdmin';

export const EDU_PERMISSIONS: Record<string, string[]> = {
  'EDUAdmin': ['ALL'],
  'EDUStaff': [
    'manage_roster',
    'approve_hours',
    'grade_students',
    'post_announcements',
    'view_audit'
  ],
  'Intern': [],
  'Student': []
};

// =====================================================
// TECH & EQUIPMENT CONSTANTS
// =====================================================

export const SERVICE_CATALOGUE: Array<{ id: string; label: string }> = [
  { id: 'repair', label: 'Equipment Repair' },
  { id: 'wiring', label: 'Studio Wiring/Install' },
  { id: 'acoustics', label: 'Acoustic Calibration' },
  { id: 'computer', label: 'DAW/Computer Support' },
  { id: 'mods', label: 'Custom Mods' }
];

export const TECH_SPECIALTIES: string[] = [
  "Luthier (Guitar/Bass)", "Drum Tech", "Amp Tech (Tube)", "Amp Tech (Solid State)",
  "Studio Electrician", "Acoustician", "Piano Tuner/Tech", "Synth/Keyboard Tech",
  "Computer/IT Systems", "Soldering/Cabling", "Console Maintenance", "Live Sound Tech"
];

export const EQUIP_CATEGORIES: Array<{ id: string; label: string }> = [
  { id: 'audio_interfaces', label: 'Audio Interfaces' },
  { id: 'microphones', label: 'Microphones' },
  { id: 'preamps', label: 'Preamps & Channel Strips' },
  { id: 'mixing_consoles', label: 'Mixing Consoles & Mixers' },
  { id: 'monitors', label: 'Studio Monitors & Speakers' },
  { id: 'headphones', label: 'Headphones & IEMs' },
  { id: 'outboard_processing', label: 'Outboard Gear (Compressors, EQs)' },
  { id: 'effects_processors', label: 'Effects Processors & Reverbs' },
  { id: 'converters', label: 'AD/DA Converters & Clocks' },
  { id: 'electric_guitars', label: 'Electric Guitars' },
  { id: 'acoustic_guitars', label: 'Acoustic Guitars' },
  { id: 'bass_guitars', label: 'Bass Guitars' },
  { id: 'guitar_amps', label: 'Guitar & Bass Amplifiers' },
  { id: 'guitar_effects', label: 'Guitar Pedals & Effects' },
  { id: 'guitar_accessories', label: 'Guitar Accessories (Cases, Straps, Strings)' },
  { id: 'synthesizers', label: 'Synthesizers' },
  { id: 'keyboards', label: 'Keyboards & Workstations' },
  { id: 'midi_controllers', label: 'MIDI Controllers' },
  { id: 'pianos', label: 'Pianos (Digital & Acoustic)' },
  { id: 'organs', label: 'Organs' },
  { id: 'drum_kits', label: 'Drum Kits (Acoustic)' },
  { id: 'electronic_drums', label: 'Electronic Drums & Pads' },
  { id: 'cymbals', label: 'Cymbals' },
  { id: 'percussion', label: 'Percussion & Hand Drums' },
  { id: 'drum_machines', label: 'Drum Machines & Samplers' },
  { id: 'string_instruments', label: 'String Instruments (Violin, Cello, etc.)' },
  { id: 'wind_instruments', label: 'Wind & Brass Instruments' },
  { id: 'world_instruments', label: 'World & Ethnic Instruments' },
  { id: 'pa_speakers', label: 'PA Speakers & Subwoofers' },
  { id: 'power_amps', label: 'Power Amplifiers' },
  { id: 'live_mixers', label: 'Live Sound Mixers' },
  { id: 'wireless_systems', label: 'Wireless Microphone Systems' },
  { id: 'in_ear_monitors', label: 'In-Ear Monitor Systems' },
  { id: 'stage_gear', label: 'Stage Gear (DI Boxes, Snakes, Stands)' },
  { id: 'turntables', label: 'Turntables & DJ Decks' },
  { id: 'dj_controllers', label: 'DJ Controllers' },
  { id: 'dj_mixers', label: 'DJ Mixers' },
  { id: 'cdj_media_players', label: 'CDJs & Media Players' },
  { id: 'recorders', label: 'Recorders (Field, Multitrack)' },
  { id: 'tape_machines', label: 'Tape Machines & Reel-to-Reel' },
  { id: 'studio_furniture', label: 'Studio Furniture & Desks' },
  { id: 'acoustic_treatment', label: 'Acoustic Treatment & Panels' },
  { id: 'isolation', label: 'Isolation Booths & Shields' },
  { id: 'cables', label: 'Cables & Connectors' },
  { id: 'patchbays', label: 'Patchbays & Routing' },
  { id: 'stage_lighting', label: 'Stage Lighting' },
  { id: 'video_gear', label: 'Video & Streaming Gear' },
  { id: 'computers', label: 'Computers & Laptops (Music Production)' },
  { id: 'software_licenses', label: 'Software & Plugin Licenses' },
  { id: 'storage_drives', label: 'Storage & Hard Drives' },
  { id: 'stands_mounts', label: 'Stands & Mounts' },
  { id: 'cases_bags', label: 'Cases, Bags & Road Cases' },
  { id: 'power_conditioning', label: 'Power Conditioners & UPS' },
  { id: 'parts_components', label: 'Parts & Components' },
  { id: 'vintage_gear', label: 'Vintage & Collectible Gear' },
  { id: 'other', label: 'Other' }
];

// =====================================================
// MARKETPLACE CONSTANTS
// =====================================================

export const HIGH_VALUE_THRESHOLD: number = 500;

export const SAFE_EXCHANGE_REQUIREMENT: Record<string, string> = {
  OPTIONAL: 'optional',
  SELLER_REQUIRED: 'seller_required',
  REQUIRED: 'required'
};

export const SAFE_EXCHANGE_STATUS: Record<string, string> = {
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

export const SHIPPING_VERIFICATION_STATUS: Record<string, string> = {
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

export const SHIPPING_VERIFICATION_STEPS: Array<{
  key: string;
  label: string;
  description: string;
  role: string;
}> = [
  { key: 'packaging', label: 'Package Item', description: 'Seller photographs item & packaging', role: 'seller' },
  { key: 'dropoff', label: 'Drop Off', description: 'Seller photographs package at carrier', role: 'seller' },
  { key: 'transit', label: 'In Transit', description: 'Package in transit to buyer', role: 'system' },
  { key: 'pickup', label: 'Pick Up', description: 'Buyer photographs sealed package', role: 'buyer' },
  { key: 'unbox', label: 'Unbox & Verify', description: 'Buyer opens and verifies contents', role: 'buyer' },
  { key: 'complete', label: 'Complete', description: 'Transaction finalized', role: 'system' }
];

export const FULFILLMENT_METHOD: Record<string, string> = {
  LOCAL_PICKUP: 'local_pickup',
  SAFE_EXCHANGE: 'safe_exchange',
  SHIPPING: 'shipping'
};

export const SAFE_EXCHANGE_STEPS: Array<{
  key: string;
  label: string;
  description: string;
}> = [
  { key: 'intent', label: 'Purchase Intent', description: 'Buyer initiates purchase' },
  { key: 'hold', label: 'Payment Hold', description: 'Card hold placed in escrow' },
  { key: 'schedule', label: 'Schedule Meetup', description: 'Coordinate exchange date/location' },
  { key: 'seller_depart', label: 'Seller Departs', description: 'Seller uploads pre-departure photos' },
  { key: 'arrive', label: 'Safe Zone Arrival', description: 'Both parties arrive at safe location' },
  { key: 'inspect', label: 'Buyer Inspection', description: 'Buyer verifies item condition' },
  { key: 'approve', label: 'Dual Approval', description: 'Both parties confirm exchange' },
  { key: 'complete', label: 'Complete', description: 'Funds released to seller' }
];

export const SAFE_ZONE_RADIUS_METERS: number = 100;
export const PROXIMITY_THRESHOLD_METERS: number = 50;

export const SAFE_ZONE_TYPES: Array<{
  id: string;
  label: string;
  icon: string;
  priority: number;
}> = [
  { id: 'police_station', label: 'Police Station', icon: 'shield', priority: 1 },
  { id: 'fire_station', label: 'Fire Station', icon: 'flame', priority: 2 },
  { id: 'bank', label: 'Bank Lobby', icon: 'landmark', priority: 3 },
  { id: 'post_office', label: 'Post Office', icon: 'mail', priority: 4 },
  { id: 'city_hall', label: 'City Hall / Gov Building', icon: 'building', priority: 5 },
  { id: 'library', label: 'Public Library', icon: 'book', priority: 6 },
  { id: 'mall_security', label: 'Mall Security Office', icon: 'store', priority: 7 }
];

// =====================================================
// STUDIO OPS CONSTANTS
// =====================================================

export const CLIENT_TYPES: Array<{
  id: string;
  label: string;
  description: string;
  color: string;
}> = [
  { id: 'vip', label: 'VIP', description: 'High-value clients with frequent bookings', color: 'purple' },
  { id: 'regular', label: 'Regular', description: 'Standard clients', color: 'blue' },
  { id: 'prospect', label: 'Prospect', description: 'Potential clients not yet booked', color: 'yellow' },
  { id: 'inactive', label: 'Inactive', description: 'Clients who haven\'t booked in 6+ months', color: 'gray' }
];

export const STAFF_ROLES: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'engineer', label: 'Engineer', description: 'Audio engineer for recording/mixing sessions' },
  { id: 'assistant', label: 'Assistant', description: 'Studio assistant for setup and support' },
  { id: 'manager', label: 'Manager', description: 'Studio manager with administrative duties' },
  { id: 'intern', label: 'Intern', description: 'Intern learning studio operations' },
  { id: 'technician', label: 'Technician', description: 'Equipment technician for maintenance' },
  { id: 'producer', label: 'Producer', description: 'Music producer for creative direction' }
];

export const TALENT_NETWORK_ROLES: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'engineer', label: 'Engineer', description: 'Recording/mixing engineer' },
  { id: 'producer', label: 'Producer', description: 'Music producer' },
  { id: 'musician', label: 'Musician', description: 'Session musician' },
  { id: 'technician', label: 'Technician', description: 'Equipment technician' },
  { id: 'vocalist', label: 'Vocalist', description: 'Singer/vocalist' },
  { id: 'dj', label: 'DJ', description: 'DJ' }
];

export const TASK_PRIORITIES: Array<{
  id: string;
  label: string;
  description: string;
  color: string;
}> = [
  { id: 'low', label: 'Low', description: 'Nice to have, no urgency', color: 'gray' },
  { id: 'normal', label: 'Normal', description: 'Standard priority', color: 'blue' },
  { id: 'high', label: 'High', description: 'Important, should complete soon', color: 'orange' },
  { id: 'urgent', label: 'Urgent', description: 'Critical, immediate attention needed', color: 'red' }
];

export const TASK_STATUSES: Array<{
  id: string;
  label: string;
  description: string;
  color: string;
}> = [
  { id: 'todo', label: 'To Do', description: 'Not started', color: 'gray' },
  { id: 'in_progress', label: 'In Progress', description: 'Currently being worked on', color: 'blue' },
  { id: 'completed', label: 'Completed', description: 'Finished', color: 'green' },
  { id: 'cancelled', label: 'Cancelled', description: 'Cancelled and won\'t be completed', color: 'red' }
];

export const TASK_TYPES: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'one_time', label: 'One-Time', description: 'Single occurrence task' },
  { id: 'recurring', label: 'Recurring', description: 'Repeats on a schedule' },
  { id: 'template', label: 'Template', description: 'Reusable task template' }
];

export const SHIFT_STATUSES: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'scheduled', label: 'Scheduled', description: 'Upcoming shift' },
  { id: 'in_progress', label: 'In Progress', description: 'Currently working' },
  { id: 'completed', label: 'Completed', description: 'Finished shift' },
  { id: 'missed', label: 'Missed', description: 'Staff didn\'t show up' },
  { id: 'cancelled', label: 'Cancelled', description: 'Shift cancelled' }
];

export const MAINTENANCE_TYPES: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'calibration', label: 'Calibration', description: 'Equipment calibration and tuning' },
  { id: 'repair', label: 'Repair', description: 'Fixing broken equipment' },
  { id: 'inspection', label: 'Inspection', description: 'Routine inspection check' },
  { id: 'cleaning', label: 'Cleaning', description: 'Cleaning and maintenance' },
  { id: 'upgrade', label: 'Upgrade', description: 'Equipment upgrade or modification' },
  { id: 'replacement', label: 'Replacement', description: 'Replacing worn parts' }
];

export const MAINTENANCE_STATUSES: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'scheduled', label: 'Scheduled', description: 'Upcoming maintenance' },
  { id: 'in_progress', label: 'In Progress', description: 'Currently being serviced' },
  { id: 'completed', label: 'Completed', description: 'Maintenance finished' },
  { id: 'cancelled', label: 'Cancelled', description: 'Maintenance cancelled' },
  { id: 'overdue', label: 'Overdue', description: 'Past due date, needs attention' }
];

export const INVENTORY_UNITS: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'each', label: 'Each', description: 'Individual items' },
  { id: 'box', label: 'Box', description: 'Boxed items' },
  { id: 'pack', label: 'Pack', description: 'Packaged items' },
  { id: 'set', label: 'Set', description: 'Item sets' },
  { id: 'hours', label: 'Hours', description: 'Hour-based services' },
  { id: 'sqft', label: 'Sq Ft', description: 'Square footage materials' },
  { id: 'kg', label: 'Kg', description: 'Kilogram weight' },
  { id: 'liters', label: 'Liters', description: 'Liquid volume' },
  { id: 'roll', label: 'Roll', description: 'Rolls of tape, cable, etc.' }
];

export const INVENTORY_TRANSACTION_TYPES: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'add', label: 'Add', description: 'Adding stock (purchase, donation)' },
  { id: 'remove', label: 'Remove', description: 'Removing stock (usage, loss)' },
  { id: 'transfer', label: 'Transfer', description: 'Moving between locations' },
  { id: 'adjust', label: 'Adjust', description: 'Manual correction' }
];

export const BOOKING_SOURCES: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'web', label: 'Website', description: 'Booked through website' },
  { id: 'app', label: 'Mobile App', description: 'Booked through mobile app' },
  { id: 'phone', label: 'Phone', description: 'Called in' },
  { id: 'email', label: 'Email', description: 'Emailed request' },
  { id: 'walk_in', label: 'Walk-In', description: 'In-person request' },
  { id: 'referral', label: 'Referral', description: 'Referred by another client' }
];

export const BOOKING_PAYMENT_TYPES: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'deposit', label: 'Deposit', description: 'Initial deposit to hold booking' },
  { id: 'partial', label: 'Partial', description: 'Partial payment milestone' },
  { id: 'full', label: 'Full', description: 'Full payment' },
  { id: 'refund', label: 'Refund', description: 'Refund (full or partial)' }
];

export const BOOKING_PAYMENT_STATUSES: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'pending', label: 'Pending', description: 'Payment awaiting action' },
  { id: 'processing', label: 'Processing', description: 'Payment being processed' },
  { id: 'completed', label: 'Completed', description: 'Payment successful' },
  { id: 'failed', label: 'Failed', description: 'Payment failed' },
  { id: 'refunded', label: 'Refunded', description: 'Refund processed' }
];

export const FACILITY_AREAS: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'live_room', label: 'Live Room', description: 'Main recording/performance space' },
  { id: 'control_room', label: 'Control Room', description: 'Mixing/control room' },
  { id: 'lounge', label: 'Lounge', description: 'Client waiting area' },
  { id: 'restroom', label: 'Restroom', description: 'Bathroom facilities' },
  { id: 'parking', label: 'Parking', description: 'Parking area' },
  { id: 'exterior', label: 'Exterior', description: 'Building exterior' },
  { id: 'other', label: 'Other', description: 'Other areas' }
];

export const FACILITY_TASK_TYPES: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'cleaning', label: 'Cleaning', description: 'Routine cleaning tasks' },
  { id: 'repair', label: 'Repair', description: 'Fixing broken items' },
  { id: 'inspection', label: 'Inspection', description: 'Safety/quality inspections' },
  { id: 'upgrade', label: 'Upgrade', description: 'Improvements and renovations' },
  { id: 'replacement', label: 'Replacement', description: 'Replacing fixtures/equipment' },
  { id: 'renovation', label: 'Renovation', description: 'Major remodeling work' }
];

export const WAITLIST_STATUSES: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'pending', label: 'Pending', description: 'Waiting for opening' },
  { id: 'notified', label: 'Notified', description: 'Client was notified of availability' },
  { id: 'accepted', label: 'Accepted', description: 'Client accepted the booking' },
  { id: 'expired', label: 'Expired', description: 'Waitlist request expired' },
  { id: 'cancelled', label: 'Cancelled', description: 'Cancelled by client or studio' }
];

export const STAFF_AVAILABILITY_STATUS: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'active', label: 'Active', description: 'Available for assignments' },
  { id: 'inactive', label: 'Inactive', description: 'Not currently employed' },
  { id: 'on_leave', label: 'On Leave', description: 'Temporarily unavailable' }
];

export const TALENT_AVAILABILITY_STATUS: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'available', label: 'Available', description: 'Available for bookings' },
  { id: 'busy', label: 'Busy', description: 'Currently booked/working' },
  { id: 'unavailable', label: 'Unavailable', description: 'Not available' },
  { id: 'touring', label: 'On Tour', description: 'Currently touring' }
];

export const CLIENT_ENGAGEMENT_TIERS: Array<{
  id: string;
  label: string;
  minBookings: number;
  maxBookings?: number;
  description: string;
}> = [
  { id: 'new', label: 'New', minBookings: 0, description: 'No bookings yet' },
  { id: 'occasional', label: 'Occasional', minBookings: 1, maxBookings: 3, description: '1-3 bookings' },
  { id: 'regular', label: 'Regular', minBookings: 4, maxBookings: 10, description: '4-10 bookings' },
  { id: 'vip', label: 'VIP', minBookings: 11, description: '11+ bookings' }
];

export const CLIENT_TAGS: string[] = [
  'Recording Artist',
  'Producer',
  'Band',
  'Solo Artist',
  'Label',
  'Podcaster',
  'Voiceover',
  'Film/TV',
  'Corporate',
  'Wedding/Events',
  'Student',
  'Hobbyist',
  'Professional',
  'Referral',
  'Repeat Customer',
  'High-Value'
];

export const COMMUNICATION_TYPES: Array<{
  id: string;
  label: string;
  icon: string;
  description: string;
}> = [
  { id: 'email', label: 'Email', icon: 'mail', description: 'Email correspondence' },
  { id: 'message', label: 'Message', icon: 'message-square', description: 'In-app message' },
  { id: 'note', label: 'Note', icon: 'file-text', description: 'Internal note' },
  { id: 'call', label: 'Call', icon: 'phone', description: 'Phone call' },
  { id: 'meeting', label: 'Meeting', icon: 'users', description: 'In-person meeting' }
];

export const PAY_RATE_TYPES: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'hourly', label: 'Hourly', description: 'Paid by hour worked' },
  { id: 'per_session', label: 'Per Session', description: 'Flat rate per session/booking' },
  { id: 'percentage', label: 'Percentage', description: 'Percentage of booking revenue' },
  { id: 'salary', label: 'Salary', description: 'Fixed salary (exempt)' }
];

export const RECURRING_FREQUENCIES: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  { id: 'daily', label: 'Daily', description: 'Every day' },
  { id: 'weekly', label: 'Weekly', description: 'Every week' },
  { id: 'biweekly', label: 'Bi-Weekly', description: 'Every two weeks' },
  { id: 'monthly', label: 'Monthly', description: 'Every month' },
  { id: 'quarterly', label: 'Quarterly', description: 'Every three months' },
  { id: 'yearly', label: 'Yearly', description: 'Every year' }
];

export const DAYS_OF_WEEK: string[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const TIME_SLOT_TYPES: Array<{
  id: string;
  label: string;
  hours?: string;
  description?: string;
}> = [
  { id: 'morning', label: 'Morning', hours: '6:00-12:00' },
  { id: 'afternoon', label: 'Afternoon', hours: '12:00-18:00' },
  { id: 'evening', label: 'Evening', hours: '18:00-24:00' },
  { id: 'custom', label: 'Custom', description: 'Custom time range' },
  { id: 'all_day', label: 'All Day', description: 'Entire day blocked' }
];
