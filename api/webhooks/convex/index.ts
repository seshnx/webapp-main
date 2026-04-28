/**
 * Master Convex Webhook Handler
 * Routes all webhook events to appropriate handlers
 */

export async function GET(request: Request) {
  return Response.json({
    status: 'ok',
    service: 'convex-webhook',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, type, data } = body;

    console.log('[Convex Webhook] Received:', event || type);

    // Route based on event type
    const eventType = event || type;
    const category = eventType?.split('.')[0];

    switch (category) {
      case 'booking':
        console.log('[Convex Webhook] Processing booking event');
        break;
      case 'notification':
        console.log('[Convex Webhook] Processing notification event');
        break;
      case 'comment':
        console.log('[Convex Webhook] Processing comment event');
        break;
      case 'reaction':
        console.log('[Convex Webhook] Processing reaction event');
        break;
      default:
        console.log('[Convex Webhook] Unknown category:', category);
    }

    // TODO: Route to specific handlers and sync to Convex
    // For now, just acknowledge receipt

    return Response.json({
      success: true,
      event: eventType,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Convex Webhook] Error:', error);
    return Response.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
