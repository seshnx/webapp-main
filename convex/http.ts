import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated";

// Clerk webhook handler
const clerkWebhook = httpRouter({
  "user.created": httpAction(async (ctx, request) => {
    const payload = await request.json();

    // Extract user data from Clerk webhook
    const { id, email_addresses, username, first_name, last_name, image_url, email_verification } = payload.data;

    // Get primary email
    const primaryEmail = email_addresses?.find((e: any) => e.id === payload.data.primary_email_address_id)?.email_address;

    // Sync user to Convex
    await ctx.runMutation(api.users.syncUserFromClerk, {
      clerkId: id,
      email: primaryEmail || "",
      username: username || undefined,
      emailVerified: email_verification?.status === "verified" ||
                       email_addresses?.[0]?.verification?.status === "verified",
      firstName: first_name || undefined,
      lastName: last_name || undefined,
      imageUrl: image_url || undefined,
    });

    return new Response(null, { status: 200 });
  }),

  "user.updated": httpAction(async (ctx, request) => {
    const payload = await request.json();

    // Extract user data from Clerk webhook
    const { id, email_addresses, username, first_name, last_name, image_url, email_verification } = payload.data;

    // Get primary email
    const primaryEmail = email_addresses?.find((e: any) => e.id === payload.data.primary_email_address_id)?.email_address;

    // Sync user to Convex
    await ctx.runMutation(api.users.syncUserFromClerk, {
      clerkId: id,
      email: primaryEmail || "",
      username: username || undefined,
      emailVerified: email_verification?.status === "verified" ||
                       email_addresses?.[0]?.verification?.status === "verified",
      firstName: first_name || undefined,
      lastName: last_name || undefined,
      imageUrl: image_url || undefined,
    });

    return new Response(null, { status: 200 });
  }),

  "user.deleted": httpAction(async (ctx, request) => {
    const payload = await request.json();
    const { id } = payload.data;

    // Delete user from Convex (optional - you might want to keep the data)
    await ctx.runMutation(api.users.deleteUser, {
      clerkId: id,
    });

    return new Response(null, { status: 200 });
  }),
});

// Convex HTTP router for webhooks
export default httpRouter({
  clerkWebhookPath: clerkWebhook,
});
