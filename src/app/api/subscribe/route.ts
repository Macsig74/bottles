import { NextRequest, NextResponse } from 'next/server'
import { createPushClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { subscription, userId } = await req.json()

    if (!subscription?.endpoint || !userId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = createPushClient()
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        endpoint: subscription.endpoint,
        user_id: userId,
        subscription,
      },
      { onConflict: 'endpoint' }
    )

    if (error) {
      console.error('Supabase push subscription error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Subscribe route error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
