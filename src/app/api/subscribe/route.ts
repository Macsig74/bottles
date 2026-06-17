import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
      return NextResponse.json(
        { error: 'Subscription invalide — champs manquants' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('push_subscriptions').upsert({
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    }, { onConflict: 'endpoint' })

    if (error) throw error

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('Erreur subscribe:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
