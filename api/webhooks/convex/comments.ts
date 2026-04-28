/**
 * Convex Comment Sync Webhook
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, data } = body;

    console.log('[Convex Webhook] Comment event:', event);

    // TODO: Implement actual Convex sync when types are generated
    console.log('[Convex Webhook] Comment data:', data);

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
