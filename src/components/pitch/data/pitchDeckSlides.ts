export interface PitchSlide {
  id: string;
  number: number;
  category: string;
  title: string;
  subtitle: string;
  badge?: string;
  hasInteractiveDemo?: 'studio' | 'recoupment' | 'economics';
  bullets?: { title: string; desc: string; iconName?: string }[];
  metrics?: { label: string; value: string; subtext: string }[];
  presenterNotes: string[];
}

export const PITCH_DECK_SLIDES: PitchSlide[] = [
  {
    id: 'title',
    number: 1,
    category: 'EXECUTIVE OVERVIEW',
    title: 'SeshNx',
    subtitle: 'The Vertically Integrated Operating System for Artists, Producers, Songwriters, Session Musicians, Studios & Labels',
    badge: 'Pre-Seed / Early Seed SAFE • $500K – $1M',
    presenterNotes: [
      'Hook: "We are Amalia Media LLC doing business as SeshNx, and we are solving the single largest operational bottleneck in music creation."',
      'Introduce yourself as Ricardo Herrera-Delgado, Founder & CEO.',
      'Core premise: "SeshNx is not just an artist-to-studio booking tool. It is the connective operating system for the entire music creation pipeline: Artist to Artist, Artist to Producer, Artist to Songwriter, Artist to Composer, Artist to Session Musician, and Artist to Label."'
    ]
  },
  {
    id: 'problem',
    number: 2,
    category: 'THE MARKET PAIN',
    title: 'The Point-Solution Collapse',
    subtitle: '40M+ independent creators and 50,000+ recording studios are paralyzed by tool sprawl',
    bullets: [
      {
        title: 'Tool Fragmentation & Subscription Fatigue',
        desc: 'Artists, beatmakers, and session players run a business-of-one juggling Calendly, Venmo, Dropbox, Discord, and Splice, paying $200–$400/mo across disconnected software.'
      },
      {
        title: 'Uncredited Contributors & Disputed Splits',
        desc: 'Songwriters, session instrumentalists, and beat producers lose billions annually because split sheets are scribbled on loose paper or forgotten, leading to disputed royalties and black box pools.'
      },
      {
        title: 'Zero Studio-to-Release Integration',
        desc: 'Files recorded in studios have zero lineage connecting to digital distribution, leading to lost master rights, delayed payouts, and uncollected publishing revenue.'
      }
    ],
    metrics: [
      { label: 'Apps Per Creator', value: '8 – 10', subtext: 'Disconnected subscriptions' },
      { label: 'Lost Billable Time', value: '40%', subtext: 'Spent on admin overhead' },
      { label: 'Uncollected Royalties', value: '$2.5B+', subtext: 'Lost to metadata & split errors' }
    ],
    presenterNotes: [
      'Emphasize the human reality: "Making a record takes a village. An artist hires a beatmaker, brings in a session guitarist, co-writes with a lyricist, books a studio, and releases through an indie label. Today, every single handoff in that pipeline is broken."',
      'Studio owners hate Calendly because it does not understand room rates, equipment lockers, or engineer rosters.',
      'Ask the investor: "Imagine if Shopify, Slack, DocuSign, and Stripe were all separate tabs that required manual copy-pasting—that is music production today."'
    ]
  },
  {
    id: 'solution',
    number: 3,
    category: 'THE UNIFIED PLATFORM',
    title: 'SeshNx: One Cohesive Creative OS',
    subtitle: 'Consolidating creation, operations, legal contracts, and distribution into a single Progressive Web App',
    bullets: [
      {
        title: 'Full-Spectrum Creator Pipeline',
        desc: 'Direct collaboration pipelines connecting Artists ↔ Producers, Songwriters, Composers, Session Musicians, and Labels with live stem sync and talent discovery broadcasts.'
      },
      {
        title: 'Physical Studio Operations (ERP)',
        desc: 'Interactive multi-room spatial mapping, multi-room calendars, equipment inventory tracking, and on-premise tablet Kiosks with smart-lock security.'
      },
      {
        title: 'Legal Contracts & Split Sheets',
        desc: 'Automated digital recording agreements, producer points, session musician work-for-hire releases, and instant Stripe Connect split payouts.'
      },
      {
        title: 'Distribution & IndieNx Flagship',
        desc: 'White-label release ingestion (P-Line/C-Line customization) plus an in-house incubator label for unrepresented free agents.'
      }
    ],
    metrics: [
      { label: 'Platform Speed', value: '< 20ms', subtext: 'Convex WebSockets reactive' },
      { label: 'Integrated Modules', value: '7', subtext: 'Replacing 10+ point apps' },
      { label: 'Zero Data Silos', value: '100%', subtext: 'Unified database state' }
    ],
    presenterNotes: [
      'Point out that SeshNx is not an unproven wireframe—it is fully coded in React, TypeScript, and Convex.',
      'Emphasize vertical integration: the beat made by the producer, the chords played by the session musician, and the stems recorded in the studio flow directly into the release builder, which feeds the royalty engine.',
      'Transition to the next slide to show live interactive proof.'
    ]
  },
  {
    id: 'product',
    number: 4,
    category: 'LIVE OPERATIONAL ENGINE',
    title: 'The Studio Operations Suite',
    subtitle: 'Interactive spatial facility mapping, multi-room scheduling, and walk-up tablet Kiosk check-ins',
    hasInteractiveDemo: 'studio',
    presenterNotes: [
      'THIS IS YOUR "SHOW, DON\'T TELL" MOMENT.',
      'Direct the investor\'s attention to the interactive studio facility layout widget on the slide.',
      'Click between the Live Room, Vocal Booth, and Mastering Suite to show real-time hourly rates, room capacity, and active status.',
      'Explain: "This is running on our real production code right now in the browser. Studio owners can visually manage their physical facility, track gear rosters, and deploy on-site tablet kiosks."'
    ]
  },
  {
    id: 'gtm',
    number: 5,
    category: 'GO-TO-MARKET STRATEGY',
    title: 'The B2B Trojan Horse Wedge',
    subtitle: 'We don\'t acquire retail listeners at $50 CAC. We acquire commercial studios that bring 100+ creators for free.',
    bullets: [
      {
        title: '1. Acquire the Studio Hub ($49–$199/mo SaaS)',
        desc: 'We target commercial and boutique recording facilities in key music hubs (Atlanta, LA, Nashville, Miami) using founder-led outreach.'
      },
      {
        title: '2. The $150 Kiosk Tablet Subsidy',
        desc: 'We provide partner studios a free 10-inch Android/iPad front-desk check-in tablet pre-installed with SeshNx Kiosk Mode. ($15k total cost for 100 studios).'
      },
      {
        title: '3. Captive Creator Acquisition ($0 CAC)',
        desc: 'Every recording artist, producer, songwriter, session musician, and engineer who enters that studio checks in on the SeshNx kiosk, instantly creating an account on the collaborative network.'
      },
      {
        title: '4. Full-Pipeline Network Effects',
        desc: 'Once onboarded, creators hire session players, lease beats from producers, draft split sheets, and distribute releases via IndieNx with zero platform leakage.'
      }
    ],
    metrics: [
      { label: 'Per-Studio Multiplier', value: '100+', subtext: 'Creators brought per studio/mo' },
      { label: 'Hardware Subsidy', value: '$150', subtext: 'One-time cost per facility' },
      { label: 'Effective Creator CAC', value: '< $1.50', subtext: 'Versus $40–$60 industry avg' }
    ],
    presenterNotes: [
      'Highlight the mathematical efficiency of this model. B2C music apps die because user acquisition on Meta/TikTok is $40–$60.',
      'Our customer acquisition cost is subsidized by the studio owner who uses our software to run their business.',
      'For just $15,000 in wholesale tablets, 100 studios become dedicated SeshNx onboarding portals.'
    ]
  },
  {
    id: 'secret-weapon',
    number: 6,
    category: 'CLOSED-LOOP FINTECH',
    title: 'Studio Advance Recoupment & IndieNx',
    subtitle: 'The high-margin financial engine connecting physical studio time directly with streaming royalties',
    hasInteractiveDemo: 'recoupment',
    presenterNotes: [
      'Explain the interactive recoupment calculator on the slide.',
      'Show how a $1,500 studio advance is paid directly to the partner studio, the track drops on Spotify, and streaming royalties automatically pay off the balance before flipping to an 85/15 net split.',
      'Emphasize negative working capital and zero churn: "The artist cannot leave the platform while their advance is recouping, and the money is 100% spent inside our studio ecosystem."'
    ]
  },
  {
    id: 'business-model',
    number: 7,
    category: 'BUSINESS MODEL & UNIT ECONOMICS',
    title: 'Tri-Factor Revenue Engine',
    subtitle: 'High-margin B2B SaaS recurring revenue combined with GMV marketplace spread and distribution fintech',
    hasInteractiveDemo: 'economics',
    presenterNotes: [
      'Walk through the 3 revenue streams: SaaS subscriptions ($49–$199/mo), 3–5% booking spread, and 15% distribution royalty take.',
      'Use the interactive slider to show how scaling from 25 to 150 studios generates over $1.5M in annualized platform volume.',
      'Point out that SeshNx has software margins (80%+ gross margin on SaaS).'
    ]
  },
  {
    id: 'market',
    number: 8,
    category: 'MARKET OPPORTUNITY',
    title: '$15.5B Serviceable Addressable Market',
    subtitle: 'Positioned at the convergence of the $205B creator economy and the global music industry',
    bullets: [
      {
        title: '$7.2B — Music Production & Business Management SaaS (NAICS 513210)',
        desc: 'Studio ERP, booking management, cloud stem storage, contract tools, and label roster administration.'
      },
      {
        title: '$4.3B — Audio Engineering Education & LMS Licensing (NAICS 611310)',
        desc: 'Accredited audio academy licensing, student seat compliance, and intern hour-tracking.'
      },
      {
        title: '$4.0B+ — Studio Operations, Gear Marketplaces & Sound Libraries',
        desc: 'Physical room bookings, technician hardware repair workbench, and SeshFx digital assets.'
      }
    ],
    metrics: [
      { label: 'Total Creator TAM', value: '$250B+', subtext: 'Growing to $1.3T by 2033' },
      { label: 'Serviceable Market', value: '$15.5B', subtext: 'Direct software & commerce' },
      { label: 'Near-Term SOM', value: '$350M–$500M', subtext: '5%–10% prosumer studios' }
    ],
    presenterNotes: [
      'Cite our North American Industry Classification System (NAICS) data.',
      'Show that we don\'t need 50% of the market to build a $50M business—capturing just 0.2% of the SAM yields over $30M in ARR.',
      'Emphasize that the market is growing rapidly with independent artists representing the fastest-growing sector of music revenues.'
    ]
  },
  {
    id: 'competition',
    number: 9,
    category: 'COMPETITIVE ADVANTAGE',
    title: 'Single-Purpose Apps Cannot Compete',
    subtitle: 'Competitors solve narrow point problems; SeshNx controls the entire end-to-end workflow',
    bullets: [
      {
        title: 'Versus EngineEars (Remote Mixing Marketplace)',
        desc: 'EngineEars is strictly a remote gig marketplace for audio mixing. It has zero physical facility management, no multi-room booking or walk-up kiosks, no live creator community spaces, and no hardware gear servicing.'
      },
      {
        title: 'Versus BeatStars & SoundBetter (Isolated Gig Hubs)',
        desc: 'Single-role platforms isolate beat leasing or freelance hires into one-off transactions. SeshNx bridges the beatmaker, session player, songwriter, recording studio, and label into one continuous ecosystem.'
      },
      {
        title: 'Versus DistroKid / TuneCore (Dumb Aggregators)',
        desc: 'Traditional distributors are dumb delivery pipes. They have zero studio booking, no split contract drafting, no session musician credit capture, and zero advance recoupment infrastructure.'
      }
    ],
    metrics: [
      { label: 'Cross-Module Moat', value: '7 Modules', subtext: 'Unbroken data continuity' },
      { label: 'Physical + Digital', value: 'Complete', subtext: 'Only platform bridging both' },
      { label: 'Switching Cost', value: 'High', subtext: 'Entire studio ops hosted on SNX' }
    ],
    presenterNotes: [
      'Address the marketplace comparison head-on: "EngineEars, BeatStars, and SoundBetter only serve one isolated role. SeshNx is the entire creative pipeline—from beatmaker and session musician to recording studio and DSP distribution."'
    ]
  },
  {
    id: 'vision',
    number: 10,
    category: 'THE 10-YEAR MASTER PLAN',
    title: 'Data-Driven Physical Expansion',
    subtitle: 'Converting software telemetry into mathematically de-risked physical real estate and hardware',
    bullets: [
      {
        title: 'Phase 4: SeshNx Flagship Studios & Resident Engineers',
        desc: 'Using platform booking heatmaps and unfulfilled session searches to open first-party recording studios staffed by SeshNx-certified engineers with guaranteed Day-1 client volume.'
      },
      {
        title: 'Phase 5: Subsidized Hardware & Equipment Deficit Take-Rate',
        desc: 'Aggregating platform gear rosters and search queries to identify missing pro equipment in specific metros. SeshNx manufactures and subsidizes proprietary hardware into partner facilities in exchange for an elevated platform take-rate (12%–15% vs 5%).'
      },
      {
        title: 'Phase 6: SeshNx University (SNXU)',
        desc: 'Accredited degree-granting media arts campuses training students on proprietary SeshNx hardware and software to staff commercial facilities.'
      }
    ],
    metrics: [
      { label: 'Phases 1–3', value: 'Software ARR', subtext: 'Funded by Seed capital' },
      { label: 'Phases 4–6', value: 'Physical Moat', subtext: 'Funded by internal balance sheet' },
      { label: 'Long-Term Vision', value: 'Conglomerate', subtext: 'Vertically integrated media giant' }
    ],
    presenterNotes: [
      'REASSURE THE INVESTOR: "To be 100% clear, this Seed check is NOT being spent on real estate or hardware. The Seed capital is 100% focused on software ARR breakeven in Phases 1–3."',
      '"Phases 4–6 represent our 10-year horizon, where our software data gives us an unfair monopoly to expand into physical infrastructure out of cash flow."',
      'Explain Phase 5 hardware strategy: "We don\'t manufacture gear on a hunch. Our telemetry shows exact regional equipment deficits. We place subsidized proprietary hardware into those rooms with zero CapEx for the studio owner, and take an elevated 12–15% cut on every session booked with that gear."'
    ]
  },
  {
    id: 'ask',
    number: 11,
    category: 'THE SEED ROUND & MILESTONES',
    title: '$500K – $1M Pre-Seed / Early Seed',
    subtitle: '18-to-24 month runway to reach 100–150 studios, $1.5M in platform volume, and cash-flow breakeven',
    bullets: [
      {
        title: 'Product & Distribution Ingestion (30% | $300k)',
        desc: 'Scaling Convex core to 100k active sessions, mobile PWA packaging, and white-label distribution API ingestion.'
      },
      {
        title: 'B2B Studio Onboarding & GTM (25% | $250k)',
        desc: 'Onboarding the first 100 commercial recording studios in Atlanta, LA, Nashville, and Miami via the $150 tablet subsidy program.'
      },
      {
        title: 'Creator Marketing & IndieNx Virality (22% | $220k)',
        desc: 'Pre-save campaigns, producer showcase mixers, and free-agent acquisition.'
      },
      {
        title: 'Runway Buffer & Founder Discipline (23% | $230k)',
        desc: '18-to-24 month capital runway buffer, SAFE legal costs, and CEO compensation capped strictly at California statutory minimum wage (~$35k/yr) to direct >90% of funds into growth.'
      }
    ],
    metrics: [
      { label: 'Partner Studios', value: '100 – 150', subtext: 'Target at 18 months' },
      { label: 'Annualized GMV', value: '$1.5M+', subtext: 'Processed booking volume' },
      { label: 'Operational Breakeven', value: 'Phase 3', subtext: 'Self-sustaining cash flow' }
    ],
    presenterNotes: [
      'Proactively address capital efficiency and founder alignment: "To demonstrate total commitment and fiscal discipline, my CEO compensation is capped strictly at California statutory minimum wage (~$35,000/yr). Over 90% of every dollar you invest goes directly into product velocity, studio hardware subsidies, and scaling our ARR engine."',
      'Close with conviction: "We have built the product. We have solved the unit economics with our B2B Trojan horse. This $500K–$1M SAFE gives us an 18-to-24 month runway to onboard 100 studios and reach operational breakeven."',
      'Open the floor for questions and offer to run a live demonstration of any module in the app.'
    ]
  }
];
