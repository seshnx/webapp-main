/**
 * Convex Notification Sync Webhook
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data } = body;

    console.log('[Convex Webhook] Notification event:', event);

    // TODO: Implement actual Convex sync when types are generated
    console.log('[Convex Webhook] Notification data:', data);

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('[Convex Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}
