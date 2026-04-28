/**
 * Convex Booking Sync Webhook
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, data } = body;

    console.log('[Convex Webhook] Booking event:', event);

    // TODO: Implement actual Convex sync when types are generated
    // For now, just log the event
    console.log('[Convex Webhook] Booking data:', data);

    return Response.json({ success: true, event });
  } catch (error) {
    console.error('[Convex Webhook] Error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}
