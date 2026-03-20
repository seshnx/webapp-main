import { mutation } from "./_generated/server";
import { v } from "convex/values";

// =====================================================
// BOOKING MIGRATIONS
// =====================================================

/**
 * Migrate studios from Neon to Convex
 */
export const migrateStudios = mutation({
  args: {
    studios: v.array(v.object({
      id: v.string(),
      owner_id: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      location: v.optional(v.string()),
      photos: v.optional(v.array(v.string())),
      logo_url: v.optional(v.string()),
      hourly_rate: v.optional(v.number()),
      currency: v.optional(v.string()),
      is_active: v.boolean(),
      created_at: v.number(),
      updated_at: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const studio of args.studios) {
      try {
        // Find owner by clerk ID
        const owner = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", studio.owner_id))
          .first();

        if (!owner) {
          results.errors.push(`Studio ${studio.id}: Owner not found`);
          results.skipped++;
          continue;
        }

        // Check if studio already exists
        const existing = await ctx.db
          .query("studios")
          .withIndex("by_owner", (q) => q.eq("ownerId", owner._id))
          .first();

        if (existing) {
          // Update existing studio
          await ctx.db.patch(existing._id, {
            name: studio.name,
            description: studio.description,
            location: studio.location,
            photos: studio.photos,
            logoUrl: studio.logo_url,
            hourlyRate: studio.hourly_rate,
            currency: studio.currency,
            isActive: studio.is_active,
            updatedAt: studio.updated_at,
          });
          results.updated++;
        } else {
          // Insert new studio
          await ctx.db.insert("studios", {
            ownerId: owner._id,
            name: studio.name,
            description: studio.description,
            location: studio.location,
            photos: studio.photos,
            logoUrl: studio.logo_url,
            hourlyRate: studio.hourly_rate,
            currency: studio.currency,
            isActive: studio.is_active,
            createdAt: studio.created_at,
            updatedAt: studio.updated_at,
          });
          results.migrated++;
        }
      } catch (error) {
        results.errors.push(`Studio ${studio.id}: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

/**
 * Migrate rooms from Neon to Convex
 */
export const migrateRooms = mutation({
  args: {
    rooms: v.array(v.object({
      id: v.string(),
      studio_id: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      capacity: v.optional(v.number()),
      hourly_rate: v.optional(v.number()),
      amenities: v.optional(v.array(v.string())),
      is_active: v.boolean(),
      created_at: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const room of args.rooms) {
      try {
        // Find studio
        const studio = await ctx.db
          .query("studios")
          .filter((q) => q.eq(q.field("studioId"), room.studio_id))
          .first();

        if (!studio) {
          results.errors.push(`Room ${room.id}: Studio not found`);
          results.skipped++;
          continue;
        }

        // Check if room already exists
        const existing = await ctx.db
          .query("rooms")
          .withIndex("by_studio", (q) => q.eq("studioId", studio._id))
          .first();

        if (existing) {
          // Update existing room
          await ctx.db.patch(existing._id, {
            name: room.name,
            description: room.description,
            capacity: room.capacity,
            hourlyRate: room.hourly_rate,
            amenities: room.amenities,
            isActive: room.is_active,
          });
          results.updated++;
        } else {
          // Insert new room
          await ctx.db.insert("rooms", {
            studioId: studio._id,
            name: room.name,
            description: room.description,
            capacity: room.capacity,
            hourlyRate: room.hourly_rate,
            amenities: room.amenities,
            isActive: room.is_active,
            createdAt: room.created_at,
          });
          results.migrated++;
        }
      } catch (error) {
        results.errors.push(`Room ${room.id}: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

/**
 * Migrate bookings from Neon + MongoDB to Convex
 */
export const migrateBookings = mutation({
  args: {
    bookings: v.array(v.object({
      id: v.string(),
      studio_id: v.string(),
      room_id: v.optional(v.string()),
      client_id: v.string(),
      service_type: v.optional(v.string()),
      date: v.optional(v.string()),
      time: v.optional(v.string()),
      duration: v.optional(v.number()),
      status: v.string(),
      offer_amount: v.optional(v.number()),
      final_amount: v.optional(v.number()),
      currency: v.optional(v.string()),
      is_class_booking: v.optional(v.boolean()),
      class_name: v.optional(v.string()),
      professor_name: v.optional(v.string()),
      lesson_plan: v.optional(v.string()),
      message: v.optional(v.string()),
      client_notes: v.optional(v.string()),
      studio_notes: v.optional(v.string()),
      metadata: v.optional(v.any()),
      created_at: v.number(),
      updated_at: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const booking of args.bookings) {
      try {
        // Find studio and client
        const studio = await ctx.db
          .query("studios")
          .filter((q) => q.eq(q.field("studioId"), booking.studio_id))
          .first();

        const client = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", booking.client_id))
          .first();

        if (!studio || !client) {
          results.errors.push(`Booking ${booking.id}: Studio or client not found`);
          results.skipped++;
          continue;
        }

        // Find room if specified
        let roomId = undefined;
        if (booking.room_id) {
          const room = await ctx.db
            .query("rooms")
            .filter((q) => q.eq(q.field("roomId"), booking.room_id))
            .first();
          roomId = room?._id;
        }

        // Check if booking already exists
        const existing = await ctx.db
          .query("bookings")
          .withIndex("by_id", (q) => q.eq("id", booking.id))
          .first();

        if (existing) {
          // Update existing booking
          await ctx.db.patch(existing._id, {
            studioId: studio._id,
            roomId,
            clientId: client._id,
            serviceType: booking.service_type,
            date: booking.date,
            time: booking.time,
            duration: booking.duration,
            status: booking.status,
            offerAmount: booking.offer_amount,
            finalAmount: booking.final_amount,
            currency: booking.currency,
            isClassBooking: booking.is_class_booking,
            className: booking.class_name,
            professorName: booking.professor_name,
            lessonPlan: booking.lesson_plan,
            message: booking.message,
            clientNotes: booking.client_notes,
            studioNotes: booking.studio_notes,
            metadata: booking.metadata,
            updatedAt: booking.updated_at,
          });
          results.updated++;
        } else {
          // Insert new booking
          await ctx.db.insert("bookings", {
            id: booking.id,
            studioId: studio._id,
            roomId,
            clientId: client._id,
            serviceType: booking.service_type,
            date: booking.date,
            time: booking.time,
            duration: booking.duration,
            status: booking.status,
            offerAmount: booking.offer_amount,
            finalAmount: booking.final_amount,
            currency: booking.currency,
            isClassBooking: booking.is_class_booking,
            className: booking.class_name,
            professorName: booking.professor_name,
            lessonPlan: booking.lesson_plan,
            message: booking.message,
            clientNotes: booking.client_notes,
            studioNotes: booking.studio_notes,
            metadata: booking.metadata,
            createdAt: booking.created_at,
            updatedAt: booking.updated_at,
          });
          results.migrated++;
        }
      } catch (error) {
        results.errors.push(`Booking ${booking.id}: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

/**
 * Migrate booking payments from Neon to Convex
 */
export const migrateBookingPayments = mutation({
  args: {
    payments: v.array(v.object({
      id: v.string(),
      booking_id: v.string(),
      amount: v.number(),
      currency: v.string(),
      status: v.string(),
      payment_method_id: v.optional(v.string()),
      stripe_payment_intent_id: v.optional(v.string()),
      created_at: v.number(),
      completed_at: v.optional(v.number()),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const payment of args.payments) {
      try {
        // Find booking
        const booking = await ctx.db
          .query("bookings")
          .withIndex("by_id", (q) => q.eq("id", payment.booking_id))
          .first();

        if (!booking) {
          results.errors.push(`Payment: Booking ${payment.booking_id} not found`);
          results.skipped++;
          continue;
        }

        // Insert payment
        await ctx.db.insert("bookingPayments", {
          bookingId: booking._id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethodId: payment.payment_method_id,
          stripePaymentIntentId: payment.stripe_payment_intent_id,
          createdAt: payment.created_at,
          completedAt: payment.completed_at,
        });

        results.migrated++;
      } catch (error) {
        results.errors.push(`Payment: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

// =====================================================
// SCHOOL/EDU MIGRATIONS
// =====================================================

/**
 * Migrate schools from Neon to Convex
 */
export const migrateSchools = mutation({
  args: {
    schools: v.array(v.object({
      id: v.string(),
      name: v.string(),
      code: v.string(),
      description: v.optional(v.string()),
      logo_url: v.optional(v.string()),
      location: v.optional(v.string()),
      admin_id: v.string(),
      staff_ids: v.optional(v.array(v.string())),
      is_active: v.boolean(),
      settings: v.optional(v.any()),
      created_at: v.number(),
      updated_at: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const school of args.schools) {
      try {
        // Find admin by clerk ID
        const admin = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", school.admin_id))
          .first();

        if (!admin) {
          results.errors.push(`School ${school.id}: Admin not found`);
          results.skipped++;
          continue;
        }

        // Find staff IDs
        const staffIds = [];
        if (school.staff_ids) {
          for (const staffClerkId of school.staff_ids) {
            const staff = await ctx.db
              .query("users")
              .withIndex("by_clerk_id", (q) => q.eq("clerkId", staffClerkId))
              .first();
            if (staff) staffIds.push(staff._id);
          }
        }

        // Check if school already exists
        const existing = await ctx.db
          .query("schools")
          .withIndex("by_code", (q) => q.eq("code", school.code))
          .first();

        if (existing) {
          // Update existing school
          await ctx.db.patch(existing._id, {
            name: school.name,
            description: school.description,
            logoUrl: school.logo_url,
            location: school.location,
            adminId: admin._id,
            staffIds,
            isActive: school.is_active,
            settings: school.settings,
            updatedAt: school.updated_at,
          });
          results.updated++;
        } else {
          // Insert new school
          await ctx.db.insert("schools", {
            name: school.name,
            code: school.code,
            description: school.description,
            logoUrl: school.logo_url,
            location: school.location,
            adminId: admin._id,
            staffIds,
            isActive: school.is_active,
            settings: school.settings,
            createdAt: school.created_at,
            updatedAt: school.updated_at,
          });
          results.migrated++;
        }
      } catch (error) {
        results.errors.push(`School ${school.id}: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

/**
 * Migrate students from Neon to Convex
 */
export const migrateStudents = mutation({
  args: {
    students: v.array(v.object({
      user_id: v.string(),
      school_id: v.string(),
      student_id: v.string(),
      major: v.optional(v.string()),
      year: v.optional(v.number()),
      gpa: v.optional(v.number()),
      is_active: v.boolean(),
      enrolled_at: v.number(),
      expected_graduation: v.optional(v.number()),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const student of args.students) {
      try {
        // Find user and school
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", student.user_id))
          .first();

        const school = await ctx.db
          .query("schools")
          .filter((q) => q.eq(q.field("schoolId"), student.school_id))
          .first();

        if (!user || !school) {
          results.errors.push(`Student: User or school not found`);
          results.skipped++;
          continue;
        }

        // Check if student already exists
        const existing = await ctx.db
          .query("students")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();

        if (existing) {
          // Update existing student
          await ctx.db.patch(existing._id, {
            schoolId: school._id,
            studentId: student.student_id,
            major: student.major,
            year: student.year,
            gpa: student.gpa,
            isActive: student.is_active,
            enrolledAt: student.enrolled_at,
            expectedGraduation: student.expected_graduation,
          });
          results.updated++;
        } else {
          // Insert new student
          await ctx.db.insert("students", {
            userId: user._id,
            schoolId: school._id,
            studentId: student.student_id,
            major: student.major,
            year: student.year,
            gpa: student.gpa,
            isActive: student.is_active,
            enrolledAt: student.enrolled_at,
            expectedGraduation: student.expected_graduation,
          });
          results.migrated++;
        }
      } catch (error) {
        results.errors.push(`Student: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

/**
 * Migrate staff from Neon to Convex
 */
export const migrateStaff = mutation({
  args: {
    staff: v.array(v.object({
      user_id: v.string(),
      school_id: v.string(),
      staff_id: v.string(),
      role: v.string(),
      department: v.optional(v.string()),
      title: v.optional(v.string()),
      is_active: v.boolean(),
      hired_at: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const staffMember of args.staff) {
      try {
        // Find user and school
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", staffMember.user_id))
          .first();

        const school = await ctx.db
          .query("schools")
          .filter((q) => q.eq(q.field("schoolId"), staffMember.school_id))
          .first();

        if (!user || !school) {
          results.errors.push(`Staff: User or school not found`);
          results.skipped++;
          continue;
        }

        // Check if staff already exists
        const existing = await ctx.db
          .query("staff")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();

        if (existing) {
          // Update existing staff
          await ctx.db.patch(existing._id, {
            schoolId: school._id,
            staffId: staffMember.staff_id,
            role: staffMember.role,
            department: staffMember.department,
            title: staffMember.title,
            isActive: staffMember.is_active,
            hiredAt: staffMember.hired_at,
          });
          results.updated++;
        } else {
          // Insert new staff
          await ctx.db.insert("staff", {
            userId: user._id,
            schoolId: school._id,
            staffId: staffMember.staff_id,
            role: staffMember.role,
            department: staffMember.department,
            title: staffMember.title,
            isActive: staffMember.is_active,
            hiredAt: staffMember.hired_at,
          });
          results.migrated++;
        }
      } catch (error) {
        results.errors.push(`Staff: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

// =====================================================
// MARKETPLACE MIGRATIONS
// =====================================================

/**
 * Migrate market items from Neon to Convex
 */
export const migrateMarketItems = mutation({
  args: {
    items: v.array(v.object({
      id: v.string(),
      seller_id: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      category: v.string(),
      price: v.number(),
      currency: v.string(),
      condition: v.optional(v.string()),
      images: v.optional(v.array(v.string())),
      location: v.optional(v.string()),
      status: v.string(),
      shipping_available: v.optional(v.boolean()),
      shipping_cost: v.optional(v.number()),
      created_at: v.number(),
      updated_at: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const item of args.items) {
      try {
        // Find seller
        const seller = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", item.seller_id))
          .first();

        if (!seller) {
          results.errors.push(`Market item ${item.id}: Seller not found`);
          results.skipped++;
          continue;
        }

        // Insert market item
        await ctx.db.insert("marketItems", {
          sellerId: seller._id,
          title: item.title,
          description: item.description,
          category: item.category,
          price: item.price,
          currency: item.currency,
          condition: item.condition,
          images: item.images,
          location: item.location,
          status: item.status,
          shippingAvailable: item.shipping_available,
          shippingCost: item.shipping_cost,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        });

        results.migrated++;
      } catch (error) {
        results.errors.push(`Market item ${item.id}: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

// =====================================================
// LABEL MIGRATIONS
// =====================================================

/**
 * Migrate labels from Neon to Convex
 */
export const migrateLabels = mutation({
  args: {
    labels: v.array(v.object({
      id: v.string(),
      owner_id: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      logo_url: v.optional(v.string()),
      location: v.optional(v.string()),
      website: v.optional(v.string()),
      is_active: v.boolean(),
      created_at: v.number(),
      updated_at: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const label of args.labels) {
      try {
        // Find owner
        const owner = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", label.owner_id))
          .first();

        if (!owner) {
          results.errors.push(`Label ${label.id}: Owner not found`);
          results.skipped++;
          continue;
        }

        // Insert label
        await ctx.db.insert("labels", {
          ownerId: owner._id,
          name: label.name,
          description: label.description,
          logoUrl: label.logo_url,
          location: label.location,
          website: label.website,
          isActive: label.is_active,
          createdAt: label.created_at,
          updatedAt: label.updated_at,
        });

        results.migrated++;
      } catch (error) {
        results.errors.push(`Label ${label.id}: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

/**
 * Migrate label roster from Neon to Convex
 */
export const migrateLabelRoster = mutation({
  args: {
    roster: v.array(v.object({
      label_id: v.string(),
      artist_id: v.string(),
      role: v.string(),
      status: v.string(),
      contract_start: v.number(),
      contract_end: v.optional(v.number()),
      created_at: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const entry of args.roster) {
      try {
        // Find label and artist
        const label = await ctx.db
          .query("labels")
          .filter((q) => q.eq(q.field("labelId"), entry.label_id))
          .first();

        const artist = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", entry.artist_id))
          .first();

        if (!label || !artist) {
          results.errors.push(`Label roster: Label or artist not found`);
          results.skipped++;
          continue;
        }

        // Insert roster entry
        await ctx.db.insert("labelRoster", {
          labelId: label._id,
          artistId: artist._id,
          role: entry.role,
          status: entry.status,
          contractStart: entry.contract_start,
          contractEnd: entry.contract_end,
          createdAt: entry.created_at,
        });

        results.migrated++;
      } catch (error) {
        results.errors.push(`Label roster: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

// =====================================================
// BROADCAST MIGRATIONS
// =====================================================

/**
 * Migrate broadcasts from MongoDB to Convex
 */
export const migrateBroadcasts = mutation({
  args: {
    broadcasts: v.array(v.object({
      _id: v.string(),
      senderId: v.string(),
      senderName: v.string(),
      senderPhoto: v.optional(v.string()),
      targetId: v.optional(v.string()),
      targetName: v.optional(v.string()),
      serviceType: v.string(),
      offerAmount: v.optional(v.number()),
      date: v.optional(v.string()),
      time: v.optional(v.string()),
      duration: v.optional(v.number()),
      requirements: v.optional(v.array(v.string())),
      location: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
      })),
      locationName: v.optional(v.string()),
      status: v.string(),
      timestamp: v.number(),
      createdAt: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const broadcast of args.broadcasts) {
      try {
        // Find sender
        const sender = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", broadcast.senderId))
          .first();

        if (!sender) {
          results.errors.push(`Broadcast: Sender ${broadcast.senderId} not found`);
          results.skipped++;
          continue;
        }

        // Find target if specified
        let targetId = undefined;
        if (broadcast.targetId) {
          const target = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", broadcast.targetId))
            .first();
          targetId = target?._id;
        }

        // Insert broadcast
        await ctx.db.insert("broadcasts", {
          senderId: sender._id,
          senderName: broadcast.senderName,
          senderPhoto: broadcast.senderPhoto || sender.avatarUrl,
          targetId,
          targetName: broadcast.targetName,
          serviceType: broadcast.serviceType,
          offerAmount: broadcast.offerAmount,
          date: broadcast.date,
          time: broadcast.time,
          duration: broadcast.duration,
          requirements: broadcast.requirements,
          location: broadcast.location,
          locationName: broadcast.locationName,
          status: broadcast.status,
          type: "Broadcast",
          timestamp: broadcast.timestamp,
          createdAt: broadcast.createdAt,
          updatedAt: Date.now(),
        });

        results.migrated++;
      } catch (error) {
        results.errors.push(`Broadcast: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

// =====================================================
// NOTIFICATION MIGRATIONS
// =====================================================

/**
 * Migrate notifications from Neon to Convex
 */
export const migrateNotifications = mutation({
  args: {
    notifications: v.array(v.object({
      id: v.string(),
      user_id: v.string(),
      type: v.string(),
      title: v.string(),
      message: v.string(),
      actor_id: v.optional(v.string()),
      actor_name: v.optional(v.string()),
      actor_photo: v.optional(v.string()),
      target_id: v.optional(v.string()),
      target_type: v.optional(v.string()),
      metadata: v.optional(v.any()),
      read: v.boolean(),
      read_at: v.optional(v.number()),
      created_at: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const notification of args.notifications) {
      try {
        // Find user
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", notification.user_id))
          .first();

        if (!user) {
          results.errors.push(`Notification: User ${notification.user_id} not found`);
          results.skipped++;
          continue;
        }

        // Find actor if specified
        let actorId = undefined;
        if (notification.actor_id) {
          const actor = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", notification.actor_id))
            .first();
          actorId = actor?._id;
        }

        // Insert notification
        await ctx.db.insert("notifications", {
          userId: user._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          actorId,
          actorName: notification.actor_name,
          actorPhoto: notification.actor_photo,
          targetId: notification.target_id,
          targetType: notification.target_type,
          metadata: notification.metadata,
          read: notification.read,
          readAt: notification.read_at,
          createdAt: notification.created_at,
        });

        results.migrated++;
      } catch (error) {
        results.errors.push(`Notification: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});
