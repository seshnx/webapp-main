// src/config/constants.js

export const BOOKING_THRESHOLD = 60;
// Note: In production, Stripe keys should be in environment variables
export const STRIPE_PUBLIC_KEY = "pk_test_TYooMQauvdEDq54NiTphI7jx"; 

export const ACCOUNT_TYPES = [
    "Artist", "Musician", "Engineer", "Producer", "Composer", "Studio", "Technician", "Fan",
    "Student", "Instructor", "Label", "Agent" // Added Label & Agent for Distribution
];

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
  "Artist": [
    { key: "profileName", label: "Artist / Band Name", type: "text" }, 
    { key: "bio", label: "Artist Bio", type: "textarea" },
    { key: "genres", label: "Primary Genres", type: "multi_select", data: GENRE_DATA },
    { key: "rates", label: "Booking/Feature Rate ($)", type: "number" },
    { key: "website", label: "Official Website", type: "text" },
    { key: "label", label: "Record Label (Optional)", type: "text" },
    { key: "touring", label: "Currently Touring?", type: "select", options: ["Yes", "No"] }
  ],
  "Label": [ // NEW SCHEMA
    { key: "profileName", label: "Label Name", type: "text" },
    { key: "bio", label: "Label Description / Mission", type: "textarea" },
    { key: "genres", label: "Focus Genres", type: "multi_select", data: GENRE_DATA },
    { key: "website", label: "Website", type: "text" },
    { key: "acceptingDemos", label: "Accepting Demos?", type: "select", options: ["Yes", "No"] }
  ],
  "Agent": [ // NEW SCHEMA
    ...NAME_FIELDS,
    { key: "agencyName", label: "Agency Name", type: "text" },
    { key: "rosterSize", label: "Roster Size", type: "number" },
    { key: "territory", label: "Territory Focus", type: "text" }
  ],
  "Musician": [
    ...NAME_FIELDS,
    { key: "bio", label: "Biography", type: "textarea" },
    { key: "instruments", label: "Instruments & Skills", type: "nested_select", data: INSTRUMENT_DATA },
    { key: "genres", label: "Genres", type: "multi_select", data: GENRE_DATA },
    { key: "rates", label: "Session Rate ($/hr)", type: "number" },
    { key: "dayRate", label: "Day Rate ($)", type: "number" },
    { key: "travelDist", label: "Max Travel (mi)", type: "number" },
    { key: "gearHighlights", label: "Key Gear (Guitars, Amps, etc.)", type: "textarea" },
    { key: "readingSkill", label: "Sight Reading", type: "select", options: ["None", "Charts/Lead Sheets", "Standard Notation", "Expert"] },
    { key: "remoteWork", label: "Remote Recording Capable?", type: "select", options: ["Yes", "No"] }
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
    { id: 'computer_audio_and_interfaces', label: 'Computer Audio & Interfaces' },
    { id: 'microphones_and_input_transducers', label: 'Microphones' },
    { id: 'mixing_consoles_and_control', label: 'Mixing Consoles' },
    { id: 'monitoring_and_playback', label: 'Monitoring & Playback' },
    { id: 'outboard_signal_processing', label: 'Outboard Gear' }
];