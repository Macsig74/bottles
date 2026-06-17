import { createClient } from '@supabase/supabase-js'

// Client sans RLS (anon key) — utilisé côté serveur pour les routes API push
// push_subscriptions a RLS désactivé donc l'anon key suffit
export function createPushClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
