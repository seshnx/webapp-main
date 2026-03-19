import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

// Clerk webhook handler — processes POST /clerk-webhook
const handleClerkWebhook = httpAction(async (ctx, request) => {
  const payload = await request.json();
  const eventType: string = payload.type;

  const {
    id,
    email_addresses,
    username,
    first_name,
    last_name,
    image_url,
    email_verification,
  } = payload.data || {};

  // Get primary email
  const primaryEmail = email_addresses?.find(
    (e: any) => e.id === payload.data?.primary_email_address_id
  )?.email_address;

  if (eventType === "user.created" || eventType === "user.updated") {
    await ctx.runMutation(api.users.syncUserFromClerk, {
      clerkId: id,
      email: primaryEmail || "",
      username: username || undefined,
      emailVerified:
        email_verification?.status === "verified" ||
        email_addresses?.[0]?.verification?.status === "verified",
      firstName: first_name || undefined,
      lastName: last_name || undefined,
      imageUrl: image_url || undefined,
    });
  } else if (eventType === "user.deleted") {
    await ctx.runMutation(api.users.deleteUser, { clerkId: id });
  }

  return new Response(null, { status: 200 });
});

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

export default http;
