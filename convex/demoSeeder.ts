import { mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// LOCAL DEV DEMONSTRATION SEEDER & DATA MANAGER
// =============================================================================

export const seedDemoEnvironment = mutation({
  args: {
    currentClerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // 1. Create or retrieve Demo Users
    const demoProfiles = [
      {
        clerkId: "demo_marcus_producer",
        email: "marcus.vance@demo.seshnx.local",
        username: "marcusvance",
        displayName: "Marcus Vance",
        firstName: "Marcus",
        lastName: "Vance",
        profileName: "Marcus Vance",
        headline: "Platinum Producer & Multi-Instrumentalist",
        bio: "Billboard charting producer specializing in R&B, Trap Soul, and Atmospheric Pop. 10+ years session experience with custom sound design.",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80",
        location: "Los Angeles, CA",
        zipCode: "90028",
        accountTypes: ["Producer", "Engineer"],
        activeRole: "Producer",
        hourlyRate: 125,
        sessionRate: 500,
        skills: ["Production", "Sound Design", "Vocal Arrangement", "Pro Tools", "Logic Pro", "Ableton"],
        genres: ["R&B", "Trap", "Pop", "Soul"],
      },
      {
        clerkId: "demo_elena_vocalist",
        email: "elena.rostova@demo.seshnx.local",
        username: "elenarostova",
        displayName: "Elena Rostova",
        firstName: "Elena",
        lastName: "Rostova",
        profileName: "Elena Rostova",
        headline: "Session Vocalist, Songwriter & Topliner",
        bio: "Classically trained 4-octave vocalist & topliner. Featured on Spotify editorial playlists with over 5M streams. Available for lead & background arrangements.",
        avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80",
        location: "Nashville, TN",
        zipCode: "37203",
        accountTypes: ["Talent", "Producer"],
        activeRole: "Talent",
        talentSubRole: "Singer",
        vocalRange: "Soprano",
        hourlyRate: 95,
        sessionRate: 400,
        skills: ["Lead Vocals", "Harmonies", "Toplining", "Acoustic Guitar", "Melodyne"],
        genres: ["Indie Pop", "Acoustic", "EDM", "Cinematic"],
      },
      {
        clerkId: "demo_skyline_sound",
        email: "skyline.studios@demo.seshnx.local",
        username: "skylinesound",
        displayName: "Skyline Dolby Atmos Labs",
        firstName: "Skyline",
        lastName: "Studios",
        profileName: "Skyline Dolby Atmos Labs",
        headline: "World-Class Dolby Atmos & Hybrid Analog Facility",
        bio: "Premier recording and spatial audio post-production complex. Featuring an SSL Duality console, Genelec 7.1.4 immersive monitoring, and vintage mic lockers.",
        avatarUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&auto=format&fit=crop&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80",
        location: "Los Angeles, CA",
        zipCode: "90028",
        accountTypes: ["Studio"],
        activeRole: "Studio",
        hourlyRate: 150,
        skills: ["Dolby Atmos 7.1.4", "Mastering", "Vocal Tracking", "Analog Console"],
      },
      {
        clerkId: "demo_dave_mixing",
        email: "dave.chen@demo.seshnx.local",
        username: "davechenmix",
        displayName: "Dave Chen (Mix Engineer)",
        firstName: "Dave",
        lastName: "Chen",
        profileName: "Dave Chen",
        headline: "Grammy-Nominated Mixing & Stem Mastering Engineer",
        bio: "Specializing in punchy, radio-ready mixes with analog summing (Dangerous Music, Tube-Tech, Manley Massive Passive). Fast 48h turnaround.",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
        location: "Austin, TX",
        zipCode: "78701",
        accountTypes: ["Engineer"],
        activeRole: "Engineer",
        hourlyRate: 110,
        projectRate: 450,
        skills: ["Stem Mixing", "Analog Summing", "Vocal Tuning", "Mastering"],
        genres: ["Hip Hop", "Pop", "Rock", "Electronic"],
      },
    ];

    const userMap: Record<string, any> = {};

    for (const p of demoProfiles) {
      let existing = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", p.clerkId))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("users", {
          ...p,
          emailVerified: true,
          createdAt: now - 86400000 * 7,
          updatedAt: now,
          lastActiveAt: now,
        });
        existing = await ctx.db.get(id);
      }
      if (existing) {
        userMap[p.clerkId] = existing;
      }
    }

    // Determine current user context for bookings
    let currentConvexUser: any = null;
    if (args.currentClerkId) {
      currentConvexUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.currentClerkId!))
        .first();
    }
    const clientUser = currentConvexUser || userMap["demo_marcus_producer"];

    // 2. Seed Demo Studios & Rooms
    let skylineStudio = await ctx.db
      .query("studios")
      .withIndex("by_owner", (q) => q.eq("ownerId", userMap["demo_skyline_sound"]._id))
      .first();

    if (!skylineStudio) {
      const studioId = await ctx.db.insert("studios", {
        name: "Skyline Dolby Atmos Labs",
        ownerId: userMap["demo_skyline_sound"]._id,
        description: "Flagship 7.1.4 Dolby Atmos mix room with SSL Duality 48-channel analog console and private live tracking floor.",
        location: "Los Angeles, CA",
        city: "Los Angeles",
        state: "CA",
        zip: "90028",
        hourlyRate: 150,
        minHourlyRate: 125,
        maxHourlyRate: 200,
        currency: "USD",
        email: "sessions@skylinesound.local",
        phoneCell: "(323) 555-0199",
        website: "https://skylinesound.local",
        hours: "9:00 AM - 2:00 AM",
        amenities: ["Dolby Atmos 7.1.4", "SSL Duality", "Neumann U87 Lockers", "Private Lounge", "High-Speed Wi-Fi", "Kitchen", "Free Parking"],
        photos: [
          "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&auto=format&fit=crop&q=80"
        ],
        coordinates: { lat: 34.0928, lng: -118.3287 },
        isActive: true,
        requiresApproval: false,
        createdAt: now - 86400000 * 5,
        updatedAt: now,
      });

      skylineStudio = await ctx.db.get(studioId);

      // Create Studio Rooms
      await ctx.db.insert("rooms", {
        studioId,
        name: "Studio A • Atmos Mastering Suite",
        description: "Equipped with Genelec 8351B 7.1.4 surround, SSL Duality, and Manley tube mastering chain.",
        capacity: 8,
        hourlyRate: 150,
        amenities: ["Dolby Atmos", "SSL Console", "Vocal Booth"],
        isActive: true,
        createdAt: now,
      });

      await ctx.db.insert("rooms", {
        studioId,
        name: "Studio B • Production & Tracking",
        description: "Intimate control room with Apollo x8p, Universal Audio 1176LN pair, and acoustically isolated live booth.",
        capacity: 4,
        hourlyRate: 95,
        amenities: ["Apollo x8p", "Neumann Mic", "Iso Booth"],
        isActive: true,
        createdAt: now,
      });
    }

    // 3. Seed Demo Social Feed Posts
    const demoPosts = [
      {
        authorId: userMap["demo_marcus_producer"]._id,
        authorName: "Marcus Vance",
        authorPhoto: userMap["demo_marcus_producer"].avatarUrl,
        authorUsername: "marcusvance",
        role: "Producer",
        content: "Late night vocal chain shootout between the Sony C800G and vintage U67 on our new R&B project. The air frequencies on the C800G cut right through the 808s without harshness. What's your go-to vocal chain this year? 🎚️🎙️",
        mediaUrls: [
          "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80"
        ],
        mediaType: "image",
        hashtags: ["MusicProduction", "StudioFlow", "VocalChain", "RnB"],
        visibility: "public",
        engagement: {
          likesCount: 42,
          commentsCount: 14,
          repostsCount: 6,
          savesCount: 8,
        },
        createdAt: now - 3600000 * 2,
        updatedAt: now,
      },
      {
        authorId: userMap["demo_elena_vocalist"]._id,
        authorName: "Elena Rostova",
        authorPhoto: userMap["demo_elena_vocalist"].avatarUrl,
        authorUsername: "elenarostova",
        role: "Talent",
        content: "Just wrapped a 6-hour live vocal & piano arrangement session at Sunset Sound. That 1970s Neve preamp warmth gives acoustic tracks a three-dimensional depth you can't fake. Full stem preview coming soon! 🎹✨",
        mediaUrls: [
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80"
        ],
        mediaType: "image",
        hashtags: ["Vocalist", "SessionSinger", "Acoustic", "StudioLife"],
        visibility: "public",
        engagement: {
          likesCount: 88,
          commentsCount: 23,
          repostsCount: 12,
          savesCount: 15,
        },
        createdAt: now - 3600000 * 6,
        updatedAt: now,
      },
      {
        authorId: userMap["demo_dave_mixing"]._id,
        authorName: "Dave Chen",
        authorPhoto: userMap["demo_dave_mixing"].avatarUrl,
        authorUsername: "davechenmix",
        role: "Engineer",
        content: "Quick mix tip: Before reaching for heavy EQ compression on your lead vocals, try dynamic sidechain multiband ducking at 2.5kHz–3.5kHz against the synth pads. It creates an effortless pocket of clarity without thinning the instrument mix 🎧🔊",
        mediaUrls: [
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80"
        ],
        mediaType: "image",
        hashtags: ["MixingTips", "AudioEngineering", "ProTools", "Mastering"],
        visibility: "public",
        engagement: {
          likesCount: 67,
          commentsCount: 18,
          repostsCount: 9,
          savesCount: 11,
        },
        createdAt: now - 3600000 * 12,
        updatedAt: now,
      },
      {
        authorId: userMap["demo_elena_vocalist"]._id,
        authorName: "Elena Rostova",
        authorPhoto: userMap["demo_elena_vocalist"].avatarUrl,
        authorUsername: "elenarostova",
        role: "Talent",
        content: "Piano acoustic improvisation & harmony stacking warm-up before today's tracking session 🎹🎶",
        mediaUrls: [
          "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-playing-the-piano-41772-large.mp4"
        ],
        mediaType: "video",
        visibility: "public",
        engagement: {
          likesCount: 124,
          commentsCount: 31,
          repostsCount: 19,
          savesCount: 22,
        },
        createdAt: now - 3600000 * 4,
        updatedAt: now,
      },
    ];

    for (const post of demoPosts) {
      const existing = await ctx.db
        .query("posts")
        .withIndex("by_author", (q) => q.eq("authorId", post.authorId))
        .filter((q) => q.eq(q.field("content"), post.content))
        .first();

      if (!existing) {
        await ctx.db.insert("posts", post);
      }
    }

    // 4. Seed Demo Marketplace Gear Listings (marketItems)
    const demoGear = [
      {
        sellerId: userMap["demo_dave_mixing"].clerkId,
        title: "Neumann U87 Ai Large-Diaphragm Condenser Microphone",
        description: "Studio staple in mint condition. Includes original EA 87 shockmount, wooden jewelry box, and frequency plot chart. Kept in smoke-free climate-controlled locker.",
        category: "Gear",
        itemType: "Microphones",
        brand: "Neumann",
        model: "U87 Ai",
        price: 2850,
        currency: "USD",
        condition: "Excellent",
        images: [
          "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80"
        ],
        location: "Austin, TX",
        status: "available",
        createdAt: now - 86400000 * 2,
        updatedAt: now,
      },
      {
        sellerId: userMap["demo_marcus_producer"].clerkId,
        title: "Universal Audio Apollo x8p Heritage Edition Thunderbolt 3",
        description: "8 Unison preamps, HEXA Core DSP processing, pristine AD/DA conversion. Comes with original power supply and Thunderbolt cable.",
        category: "Gear",
        itemType: "Audio Interfaces",
        brand: "Universal Audio",
        model: "Apollo x8p",
        price: 2499,
        currency: "USD",
        condition: "Like New",
        images: [
          "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80"
        ],
        location: "Los Angeles, CA",
        status: "available",
        createdAt: now - 86400000 * 3,
        updatedAt: now,
      },
      {
        sellerId: userMap["demo_skyline_sound"].clerkId,
        title: "Yamaha HS8 Active Studio Monitors (Matched Pair)",
        description: "Pair of industry-standard 8-inch bi-amplified studio monitors with ultra-flat response. Flawless acoustic performance.",
        category: "Gear",
        itemType: "Monitors",
        brand: "Yamaha",
        model: "HS8 Pair",
        price: 699,
        currency: "USD",
        condition: "Good",
        images: [
          "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80"
        ],
        location: "Los Angeles, CA",
        status: "available",
        createdAt: now - 86400000 * 4,
        updatedAt: now,
      },
    ];

    for (const gear of demoGear) {
      const existing = await ctx.db
        .query("marketItems")
        .withIndex("by_seller", (q) => q.eq("sellerId", gear.sellerId))
        .filter((q) => q.eq(q.field("title"), gear.title))
        .first();

      if (!existing) {
        await ctx.db.insert("marketItems", gear);
      }
    }

    // 5. Seed Demo Bookings
    if (skylineStudio && clientUser) {
      const existingStudioBooking = await ctx.db
        .query("sbookings")
        .withIndex("by_studio", (q) => q.eq("studioId", skylineStudio!._id))
        .first();

      if (!existingStudioBooking) {
        await ctx.db.insert("sbookings", {
          id: `demo-sbooking-${now}`,
          studioId: skylineStudio._id,
          clientId: clientUser._id,
          serviceType: "Dolby Atmos 7.1.4 Mixing Session",
          date: new Date(now + 86400000 * 2).toISOString().split("T")[0],
          time: "14:00",
          duration: 4,
          status: "Confirmed",
          totalAmount: 600,
          depositAmount: 200,
          currency: "USD",
          paymentStatus: "DepositPaid",
          clientNotes: "Spatial audio mixdown for 3 lead singles on upcoming EP.",
          studioNotes: "Studio A room prepared. Engineer Dave assigned.",
          createdAt: now - 86400000,
          updatedAt: now,
        });

        await ctx.db.insert("sbookings", {
          id: `demo-sbooking-pending-${now}`,
          studioId: skylineStudio._id,
          clientId: userMap["demo_elena_vocalist"]._id,
          serviceType: "Vocal Recording & Arrangement",
          date: new Date(now + 86400000 * 4).toISOString().split("T")[0],
          time: "10:00",
          duration: 6,
          status: "Pending",
          totalAmount: 570,
          depositAmount: 150,
          currency: "USD",
          paymentStatus: "PendingPayment",
          clientNotes: "Live vocal tracking with acoustic piano booth.",
          createdAt: now - 3600000 * 4,
          updatedAt: now,
        });
      }

      // Talent booking
      const existingTalentBooking = await ctx.db
        .query("bookings")
        .withIndex("by_talent", (q) => q.eq("talentId", userMap["demo_dave_mixing"]._id))
        .first();

      if (!existingTalentBooking) {
        await ctx.db.insert("bookings", {
          talentId: userMap["demo_dave_mixing"]._id,
          clientId: clientUser._id,
          serviceType: "Full Album Stem Mix & Master",
          date: new Date(now + 86400000 * 5).toISOString().split("T")[0],
          time: "12:00",
          duration: 8,
          location: "Remote",
          offerAmount: 450,
          currency: "USD",
          status: "Accepted",
          paymentStatus: "Paid",
          clientNotes: "5 song R&B EP. Stems uploaded to SeshNx cloud folder.",
          talentNotes: "Confirmed turnaround within 48 hours with 2 revisions.",
          createdAt: now - 86400000 * 2,
          updatedAt: now,
        });
      }

      // 6. Seed Demo Tech Service Requests
      const demoServiceRequests = [
        {
          requesterId: clientUser.clerkId,
          requesterName: clientUser.displayName || "Skyline Labs",
          title: "Neumann U87 Vintage Capsule Sputter & Humidity Repair",
          category: "Tube & Amp Repair",
          equipmentBrand: "Neumann",
          equipmentModel: "U87 Ai",
          issueDescription: "Intermittent low-frequency sputter after 20 minutes of vocal recording. Suspected moisture accumulation or capsule cleaning needed.",
          location: "Austin, TX",
          budget: 350,
          urgency: "urgent_24h",
          logistics: "bench_dropoff",
          status: "open",
          proposalsCount: 2,
          createdAt: now - 3600000 * 5,
          updatedAt: now,
        },
        {
          requesterId: userMap["demo_skyline_sound"].clerkId,
          requesterName: "Skyline Dolby Atmos Labs",
          title: "Custom 96-Point TT Bantam Patchbay Normalled Rewiring",
          category: "Patchbay & Wiring",
          equipmentBrand: "Switchcraft",
          equipmentModel: "StudioPatch 9625",
          issueDescription: "Rewiring 8 outboard stereo compressors and 4 stereo EQ channels into half-normalled configuration with Mogami multi-pair cables.",
          location: "Austin, TX",
          budget: 600,
          urgency: "scheduled",
          logistics: "on_site",
          status: "open",
          proposalsCount: 1,
          createdAt: now - 3600000 * 12,
          updatedAt: now,
        },
        {
          requesterId: userMap["demo_dave_mixing"].clerkId,
          requesterName: "Dave Chen",
          title: "Genelec 8351B Room Dirac & GLM Acoustic Calibration",
          category: "Acoustics & Tuning",
          equipmentBrand: "Genelec",
          equipmentModel: "8351B SAM",
          issueDescription: "Control room phase alignment, subwoofer crossover calibration, and RT60 decay time verification.",
          location: "Austin, TX",
          budget: 450,
          urgency: "standard",
          logistics: "on_site",
          status: "open",
          proposalsCount: 3,
          createdAt: now - 86400000,
          updatedAt: now,
        }
      ];

      for (const req of demoServiceRequests) {
        const existing = await ctx.db
          .query("serviceRequests")
          .filter((q) => q.eq(q.field("title"), req.title))
          .first();
        if (!existing) {
          await ctx.db.insert("serviceRequests", req);
        }
      }
    }

    return { success: true, seededAt: now };
  },
});

export const clearDemoEnvironment = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Delete demo users
    const demoUsers = await ctx.db
      .query("users")
      .filter((q) =>
        q.or(
          q.eq(q.field("clerkId"), "demo_marcus_producer"),
          q.eq(q.field("clerkId"), "demo_elena_vocalist"),
          q.eq(q.field("clerkId"), "demo_skyline_sound"),
          q.eq(q.field("clerkId"), "demo_dave_mixing")
        )
      )
      .collect();

    for (const u of demoUsers) {
      // Delete user's posts
      const posts = await ctx.db
        .query("posts")
        .withIndex("by_author", (q) => q.eq("authorId", u._id))
        .collect();
      for (const p of posts) await ctx.db.delete(p._id);

      // Delete user's studios and rooms
      const studios = await ctx.db
        .query("studios")
        .withIndex("by_owner", (q) => q.eq("ownerId", u._id))
        .collect();
      for (const s of studios) {
        const rooms = await ctx.db
          .query("rooms")
          .withIndex("by_studio", (q) => q.eq("studioId", s._id))
          .collect();
        for (const r of rooms) await ctx.db.delete(r._id);

        const sbookings = await ctx.db
          .query("sbookings")
          .withIndex("by_studio", (q) => q.eq("studioId", s._id))
          .collect();
        for (const b of sbookings) await ctx.db.delete(b._id);

        await ctx.db.delete(s._id);
      }

      // Delete user's talent bookings
      const bookings = await ctx.db
        .query("bookings")
        .withIndex("by_talent", (q) => q.eq("talentId", u._id))
        .collect();
      for (const b of bookings) await ctx.db.delete(b._id);

      // Delete user's market items
      const items = await ctx.db
        .query("marketItems")
        .withIndex("by_seller", (q) => q.eq("sellerId", u.clerkId))
        .collect();
      for (const item of items) await ctx.db.delete(item._id);

      // Delete user's service requests
      const requests = await ctx.db
        .query("serviceRequests")
        .filter((q) => q.eq(q.field("requesterId"), u.clerkId))
        .collect();
      for (const req of requests) await ctx.db.delete(req._id);

      await ctx.db.delete(u._id);
    }

    return { success: true };
  },
});
