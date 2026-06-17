import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createPushClient } from '@/lib/supabase/admin'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(req: Request) {
  const supabase = createPushClient()
  const { data: rows, error: dbError } = await supabase
    .from('push_subscriptions')
    .select('subscription')

  if (dbError) {
    console.error('Erreur lecture push_subscriptions:', dbError)
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: 'Aucun abonné' }, { status: 400 })
  }

  let title = 'The Bottles'
  let body = 'Nouvelle notification'
  let url = '/'
  try {
    const data = await req.json()
    if (data.title) title = data.title
    if (data.body) body = data.body
    if (data.url) url = data.url
  } catch {
    // pas de body JSON → valeurs par défaut
  }

  const payload = JSON.stringify({ title, body, url })

  const results = await Promise.allSettled(
    rows.map(row =>
      webpush.sendNotification(row.subscription as webpush.PushSubscription, payload)
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  if (failed) console.error(`${failed} push(es) échoué(s)`)

  return NextResponse.json({ sent, failed })
}
