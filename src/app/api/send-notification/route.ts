import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(req: Request) {
  const supabase = createAdminClient()
  const { data: rows, error: dbError } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')

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
    rows.map(async (row) => {
      const sub = {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth },
      }
      try {
        await webpush.sendNotification(sub, payload)
      } catch (err: unknown) {
        const webPushErr = err as { statusCode?: number }
        if (webPushErr.statusCode === 410 || webPushErr.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', row.endpoint)
        }
        throw err
      }
    })
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return NextResponse.json({ sent, failed })
}
