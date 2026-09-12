import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// TECH SERVICE REQUESTS QUERIES & MUTATIONS
// =============================================================================

export const getOpenServiceRequests = query({
  args: {
    searchQuery: v.optional(v.string()),
    category: v.optional(v.string()),
    urgency: v.optional(v.string()),
    location: v.optional(v.string()),
    minBudget: v.optional(v.number()),
    maxBudget: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let requests: any[] = [];

    if (args.searchQuery && args.searchQuery.trim().length > 0) {
      // Use Convex Full-Text Search
      const searchTerms = args.searchQuery.trim();
      let searchQ = ctx.db
        .query("serviceRequests")
        .withSearchIndex("search_services", (q) => {
          let builder = q.search("title", searchTerms);
          if (args.category && args.category !== 'all') {
            builder = builder.eq("category", args.category);
          }
          if (args.urgency && args.urgency !== 'all') {
            builder = builder.eq("urgency", args.urgency);
          }
          return builder;
        });

      requests = await searchQ.take(args.limit || 50);
      requests = requests.filter(r => r.status === 'open');
    } else {
      let q = ctx.db
        .query("serviceRequests")
        .withIndex("by_created")
        .filter((q) => q.eq(q.field("status"), "open"));

      requests = await q.collect();
    }

    // Category filter
    if (args.category && args.category !== 'all') {
      requests = requests.filter(r => r.category?.toLowerCase() === args.category!.toLowerCase());
    }

    // Urgency filter
    if (args.urgency && args.urgency !== 'all') {
      requests = requests.filter(r => r.urgency === args.urgency);
    }

    // Budget range
    if (args.minBudget !== undefined) {
      requests = requests.filter(r => r.budget >= args.minBudget!);
    }
    if (args.maxBudget !== undefined) {
      requests = requests.filter(r => r.budget <= args.maxBudget!);
    }

    // Location filter
    if (args.location) {
      requests = requests.filter(r =>
        r.location?.toLowerCase().includes(args.location!.toLowerCase())
      );
    }

    // Sort newest first
    requests.sort((a, b) => b.createdAt - a.createdAt);

    if (args.limit) {
      requests = requests.slice(0, args.limit);
    }

    return requests;
  },
});

export const getTechniciansDirectory = query({
  args: {
    specialty: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
    maxRate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Bound query rather than loading unbounded table into memory
    const limit = args.limit || 50;
    const allUsers = await ctx.db.query("users").take(200);

    // Filter users who have Technician or Engineer in accountTypes
    let techs = allUsers.filter((u) => {
      const types = u.accountTypes || [];
      return types.includes("Technician") || types.includes("Engineer");
    });

    // Specialty filter
    if (args.specialty && args.specialty !== 'all') {
      const spec = args.specialty.toLowerCase();
      techs = techs.filter((t) => {
        const skills = (t.skills || []).map(s => s.toLowerCase());
        const subRoles = (t.subRoles || []).map(r => r.toLowerCase());
        return skills.some(s => s.includes(spec)) || subRoles.some(r => r.includes(spec)) || t.bio?.toLowerCase().includes(spec);
      });
    }

    // Search query filter
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      techs = techs.filter((t) => {
        const name = `${t.firstName || ''} ${t.lastName || ''} ${t.displayName || ''} ${t.profileName || ''}`.toLowerCase();
        const bio = (t.bio || '').toLowerCase();
        const skills = (t.skills || []).join(' ').toLowerCase();
        return name.includes(query) || bio.includes(query) || skills.includes(query);
      });
    }

    // Max hourly rate filter
    if (args.maxRate) {
      techs = techs.filter((t) => (t.hourlyRate || t.rates || 0) <= args.maxRate!);
    }

    if (limit) {
      techs = techs.slice(0, limit);
    }

    return techs.map((t) => ({
      _id: t._id,
      clerkId: t.clerkId,
      name: t.displayName || t.profileName || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Audio Tech',
      avatarUrl: t.avatarUrl || null,
      headline: t.headline || '',
      location: t.location || t.address || '',
      hourlyRate: t.hourlyRate || t.rates || 0,
      skills: t.skills || [],
      bio: t.bio || '',
      availabilityStatus: t.availabilityStatus || 'available',
    }));
  },
});

export const getServiceRequestById = query({
  args: { requestId: v.id("serviceRequests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.requestId);
  },
});

export const createServiceRequest = mutation({
  args: {
    requesterId: v.string(),
    title: v.string(),
    category: v.string(),
    equipmentBrand: v.optional(v.string()),
    equipmentModel: v.optional(v.string()),
    issueDescription: v.string(),
    location: v.string(),
    budget: v.number(),
    urgency: v.string(),
    logistics: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.requesterId))
      .first();

    const requestId = await ctx.db.insert("serviceRequests", {
      requesterId: args.requesterId,
      requesterName: user?.displayName || user?.profileName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Studio Owner',
      requesterAvatar: user?.avatarUrl || undefined,
      title: args.title,
      category: args.category,
      equipmentBrand: args.equipmentBrand,
      equipmentModel: args.equipmentModel,
      issueDescription: args.issueDescription,
      location: args.location,
      budget: args.budget,
      urgency: args.urgency,
      logistics: args.logistics,
      status: "open",
      proposalsCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return requestId;
  },
});

export const expressInterestInJob = mutation({
  args: {
    requestId: v.id("serviceRequests"),
    techId: v.string(),
    message: v.optional(v.string()),
    proposedRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.techId || args.techId.trim() === "") {
      throw new Error("Unauthorized: Valid technician ID required");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Service request not found");

    if (request.status !== "open") {
      throw new Error("Proposals can only be submitted for open service requests");
    }

    if (request.requesterId === args.techId) {
      throw new Error("Cannot submit a proposal for your own service request");
    }

    const techUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.techId))
      .first();

    const techName = techUser?.displayName || techUser?.profileName || `${techUser?.firstName || ''} ${techUser?.lastName || ''}`.trim() || "Technician";

    const newProposal = {
      techId: args.techId,
      techName,
      techAvatar: techUser?.avatarUrl || undefined,
      message: args.message,
      proposedRate: args.proposedRate,
      createdAt: Date.now(),
    };

    const existingProposals = request.proposals || [];
    const proposals = [...existingProposals.filter(p => p.techId !== args.techId), newProposal];

    await ctx.db.patch(args.requestId, {
      proposals,
      proposalsCount: proposals.length,
      updatedAt: Date.now(),
    });

    // Notify the requester
    const requester = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", request.requesterId))
      .first();

    if (requester) {
      await ctx.db.insert("notifications", {
        userId: requester._id,
        type: "tech_proposal",
        title: "New Repair Proposal Received",
        message: `${techName} submitted a proposal for: ${request.title}`,
        actorId: techUser?._id || requester._id,
        actorName: techName,
        actorPhoto: techUser?.avatarUrl,
        targetId: args.requestId.toString(),
        targetType: "service_request",
        read: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const getMyServiceRequests = query({
  args: { requesterId: v.string() },
  handler: async (ctx, args) => {
    if (!args.requesterId) return [];
    const requests = await ctx.db
      .query("serviceRequests")
      .withIndex("by_requester", (q) => q.eq("requesterId", args.requesterId))
      .collect();

    requests.sort((a, b) => b.createdAt - a.createdAt);
    return requests;
  },
});

export const getMyAssignedJobs = query({
  args: { techId: v.string() },
  handler: async (ctx, args) => {
    if (!args.techId) return [];
    const requests = await ctx.db
      .query("serviceRequests")
      .filter((q) => q.eq(q.field("assignedTechId"), args.techId))
      .collect();

    requests.sort((a, b) => b.createdAt - a.createdAt);
    return requests;
  },
});

export const getTechMetrics = query({
  args: { techId: v.string() },
  handler: async (ctx, args) => {
    const openTickets = await ctx.db
      .query("serviceRequests")
      .filter((q) => q.eq(q.field("status"), "open"))
      .collect();

    const myJobs = args.techId
      ? await ctx.db
          .query("serviceRequests")
          .filter((q) => q.eq(q.field("assignedTechId"), args.techId))
          .collect()
      : [];

    const activeJobs = myJobs.filter((j) => j.status === "in_progress" || j.status === "assigned");
    const completedJobs = myJobs.filter((j) => j.status === "completed");
    const totalEarned = completedJobs.reduce((sum, j) => sum + (j.budget || 0), 0);

    return {
      openMarketTickets: openTickets.length,
      activeJobsCount: activeJobs.length,
      completedJobsCount: completedJobs.length,
      totalEarned,
      rating: null,
      responseRate: null,
    };
  },
});

export const updateServiceRequestStatus = mutation({
  args: {
    requestId: v.id("serviceRequests"),
    status: v.string(),
    actorId: v.string(),
    assignedTechId: v.optional(v.string()),
    assignedTechName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.actorId || args.actorId.trim() === "") {
      throw new Error("Unauthorized: Actor ID required");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Service request not found");
    }

    // Authorization: Actor must be the original requester, currently assigned tech, or newly assigned tech
    const isRequester = request.requesterId === args.actorId;
    const isAssignedTech = request.assignedTechId === args.actorId;
    const isNewTech = args.assignedTechId === args.actorId;

    if (!isRequester && !isAssignedTech && !isNewTech) {
      throw new Error("Unauthorized: You do not have permission to update this service request");
    }

    const patchData: any = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.assignedTechId) patchData.assignedTechId = args.assignedTechId;
    if (args.assignedTechName) patchData.assignedTechName = args.assignedTechName;

    await ctx.db.patch(args.requestId, patchData);

    // Notify the other party about status change
    const otherPartyClerkId = isRequester ? (request.assignedTechId || args.assignedTechId) : request.requesterId;
    if (otherPartyClerkId) {
      const recipient = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", otherPartyClerkId))
        .first();

      const actor = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.actorId))
        .first();

      const actorName = actor?.displayName || actor?.profileName || `${actor?.firstName || ''} ${actor?.lastName || ''}`.trim() || (isRequester ? "Requester" : "Technician");

      if (recipient) {
        await ctx.db.insert("notifications", {
          userId: recipient._id,
          type: "tech_status_update",
          title: "Service Request Status Updated",
          message: `${actorName} updated status to '${args.status}' for: ${request.title}`,
          actorId: actor?._id || recipient._id,
          actorName,
          actorPhoto: actor?.avatarUrl,
          targetId: args.requestId.toString(),
          targetType: "service_request",
          read: false,
          createdAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

export const addRepairLog = mutation({
  args: {
    requestId: v.id("serviceRequests"),
    text: v.string(),
    isPrivate: v.boolean(),
    imageUrl: v.optional(v.string()),
    actorId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.actorId || args.actorId.trim() === "") {
      throw new Error("Unauthorized: Actor ID required");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Service request not found");
    }

    const isRequester = request.requesterId === args.actorId;
    const isAssignedTech = request.assignedTechId === args.actorId;

    if (!isRequester && !isAssignedTech) {
      throw new Error("Unauthorized: Only the ticket requester or assigned technician can add repair logs");
    }

    const actor = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.actorId))
      .first();

    const authorName = actor?.displayName || actor?.profileName || `${actor?.firstName || ''} ${actor?.lastName || ''}`.trim() || (isRequester ? "Requester" : "Technician");

    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      authorId: args.actorId,
      authorName,
      text: args.text,
      isPrivate: args.isPrivate,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
    };

    const existingLogs = request.repairLogs || [];
    const updatedLogs = [...existingLogs, newLog];

    await ctx.db.patch(args.requestId, {
      repairLogs: updatedLogs,
      updatedAt: Date.now(),
    });

    // Notify the other party if log is not marked private
    if (!args.isPrivate) {
      const otherPartyClerkId = isRequester ? request.assignedTechId : request.requesterId;
      if (otherPartyClerkId) {
        const recipient = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", otherPartyClerkId))
          .first();

        if (recipient) {
          await ctx.db.insert("notifications", {
            userId: recipient._id,
            type: "tech_repair_log",
            title: "New Repair Log Entry",
            message: `${authorName} added a log update on: ${request.title}`,
            actorId: actor?._id || recipient._id,
            actorName,
            actorPhoto: actor?.avatarUrl,
            targetId: args.requestId.toString(),
            targetType: "service_request",
            read: false,
            createdAt: Date.now(),
          });
        }
      }
    }

    return { success: true, log: newLog };
  },
});

export const saveInspection = mutation({
  args: {
    requestId: v.id("serviceRequests"),
    type: v.string(), // "Pre" | "Post"
    data: v.any(),
    actorId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.actorId || args.actorId.trim() === "") {
      throw new Error("Unauthorized: Actor ID required");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Service request not found");

    const isRequester = request.requesterId === args.actorId;
    const isAssignedTech = request.assignedTechId === args.actorId;
    if (!isRequester && !isAssignedTech) {
      throw new Error("Unauthorized: Only assigned technician or requester can save inspections");
    }

    const patchData: any = { updatedAt: Date.now() };
    if (args.type === "Pre") {
      patchData.preInspection = args.data;
    } else {
      patchData.postInspection = args.data;
    }

    await ctx.db.patch(args.requestId, patchData);
    return { success: true };
  },
});

