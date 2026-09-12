import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPendingEquipmentSubmissions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const submissions = await ctx.db
      .query("equipmentSubmissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(limit);

    return submissions;
  },
});

export const createEquipmentSubmission = mutation({
  args: {
    brand: v.string(),
    model: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    specs: v.string(),
    submittedBy: v.string(),
    submitterName: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.submittedBy || args.submittedBy.trim() === "") {
      throw new Error("Authentication required to submit equipment");
    }

    const submissionId = await ctx.db.insert("equipmentSubmissions", {
      brand: args.brand.trim(),
      model: args.model.trim(),
      category: args.category,
      subcategory: args.subcategory?.trim(),
      specs: args.specs.trim(),
      submittedBy: args.submittedBy,
      submitterName: args.submitterName,
      status: "pending",
      votes: {
        yes: [],
        fake: [],
        duplicate: [],
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return submissionId;
  },
});

export const voteEquipmentSubmission = mutation({
  args: {
    submissionId: v.id("equipmentSubmissions"),
    voteType: v.union(v.literal("yes"), v.literal("fake"), v.literal("duplicate")),
    voterId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.voterId || args.voterId.trim() === "") {
      throw new Error("Authentication required to vote");
    }

    const item = await ctx.db.get(args.submissionId);
    if (!item) {
      throw new Error("Submission not found");
    }

    if (item.status !== "pending") {
      throw new Error("Voting is closed on this submission");
    }

    if (item.submittedBy === args.voterId) {
      throw new Error("Cannot vote on your own equipment submission");
    }

    const votes = item.votes || { yes: [], fake: [], duplicate: [] };
    const allVoters = [...votes.yes, ...votes.fake, ...votes.duplicate];
    if (allVoters.includes(args.voterId)) {
      throw new Error("You have already voted on this submission");
    }

    const updatedVotes = {
      ...votes,
      [args.voteType]: [...(votes[args.voteType] || []), args.voterId],
    };

    let newStatus = "pending";
    const YES_THRESHOLD = 3;
    const REJECT_THRESHOLD = 3;

    if (updatedVotes.yes.length >= YES_THRESHOLD) {
      newStatus = "approved";
    } else if (
      updatedVotes.fake.length >= REJECT_THRESHOLD ||
      updatedVotes.duplicate.length >= REJECT_THRESHOLD
    ) {
      newStatus = "rejected";
    }

    await ctx.db.patch(args.submissionId, {
      votes: updatedVotes,
      status: newStatus,
      updatedAt: Date.now(),
    });

    // If approved, notify the submitter
    if (newStatus === "approved") {
      const submitterUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", item.submittedBy))
        .first();

      if (submitterUser) {
        await ctx.db.insert("notifications", {
          userId: submitterUser._id,
          type: "gear_submission_approved",
          title: "Gear Submission Approved!",
          message: `Your equipment submission for ${item.brand} ${item.model} has been verified and added to the community database.`,
          actorId: submitterUser._id,
          actorName: "SeshNx Community Verification",
          targetId: args.submissionId.toString(),
          targetType: "equipment",
          read: false,
          createdAt: Date.now(),
        });
      }
    }

    return { success: true, status: newStatus };
  },
});
