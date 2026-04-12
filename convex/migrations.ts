import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { generateSlug, validateSlug } from "./utils/slugs";
import { v } from "convex/values";

// Query to get all studios without slugs
export const getStudiosWithoutSlugs = query({
  handler: async (ctx) => {
    const studios = await ctx.db.query("studios")
      .withIndex("by_slug", q => q.eq("slug", undefined))
      .collect();

    return studios.map(studio => ({
      _id: studio._id,
      name: studio.name,
      ownerId: studio.ownerId,
    }));
  },
});

// Mutation to backfill slugs for existing studios
export const backfillStudioSlugs = mutation({
  handler: async (ctx) => {
    const studios = await ctx.db.query("studios")
      .withIndex("by_slug", q => q.eq("slug", undefined))
      .collect();

    let processedCount = 0;
    let skippedCount = 0;

    for (const studio of studios) {
      try {
        // Generate slug from name
        let slug = generateSlug(studio.name);

        // Check for uniqueness (try up to 5 times with random suffix)
        let attempts = 0;
        let isUnique = false;

        while (!isUnique && attempts < 5) {
          const existing = await ctx.db
            .query("studios")
            .withIndex("by_slug", q => q.eq("slug", slug))
            .first();

          if (!existing || existing._id === studio._id) {
            isUnique = true;
          } else {
            // Add random suffix and try again
            slug = slug.substring(0, 35) + "-" + Math.random().toString(36).substring(2, 6);
            attempts++;
          }
        }

        // Update the studio with the new slug
        await ctx.db.patch(studio._id, {
          slug: slug,
          updatedAt: Date.now(),
        });

        processedCount++;
      } catch (error) {
        console.error(`Failed to backfill slug for studio ${studio._id}:`, error);
        skippedCount++;
      }
    }

    return {
      processedCount,
      skippedCount,
      totalStudios: studios.length,
    };
  },
});

// Test slug generation
export const testSlugGeneration = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const slug = generateSlug(name);
    const validation = validateSlug(slug);

    // Check if slug already exists in the database
    const existing = await ctx.db
      .query("studios")
      .withIndex("by_slug", q => q.eq("slug", slug))
      .first();

    return {
      original: name,
      generated: slug,
      validation,
      exists: !!existing,
    };
  },
});