import { NextRequest, NextResponse } from 'next/server'
import type { PushSubscription } from 'web-push'
import { saveSubscription } from '@/lib/pushSubscriptions'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PushSubscription

    if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
      return NextResponse.json(
        { error: 'Subscription invalide — champs manquants' },
        { status: 400 }
      )
    }

    saveSubscription(body)
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
