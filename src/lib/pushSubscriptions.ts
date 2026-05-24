import type { PushSubscription } from 'web-push'

/**
 * TODO: migrer vers une vraie table Supabase `push_subscriptions`
 * pour que les subscriptions survivent aux redémarrages du serveur.
 * Pour l'instant, stockage en mémoire (suffit pour dev/test).
 */
const subscriptions: Map<string, PushSubscription> = new Map()

export function saveSubscription(sub: PushSubscription): void {
  subscriptions.set(sub.endpoint, sub)
}

export function removeSubscription(endpoint: string): void {
  subscriptions.delete(endpoint)
}

export function getAllSubscriptions(): PushSubscription[] {
  return Array.from(subscriptions.values())
}
