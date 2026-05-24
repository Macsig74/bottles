'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Send } from 'lucide-react'

// Convertit la clé VAPID base64url → Uint8Array
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const array = Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
  return array.buffer as ArrayBuffer
}

type SubscriptionState = 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed' | 'loading'

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
}

export function PushNotificationManager() {
  const [state, setState] = useState<SubscriptionState>('loading')
  const [sendStatus, setSendStatus] = useState<string>('')
  const [ios, setIos] = useState(false)
  const [standalone, setStandalone] = useState(false)

  useEffect(() => {
    setIos(isIos())
    setStandalone(isStandalone())

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported')
      return
    }

    if (Notification.permission === 'denied') {
      setState('denied')
      return
    }

    // Vérifie si déjà abonné
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setState(sub ? 'subscribed' : 'unsubscribed')
      })
    })
  }, [])

  async function subscribe() {
    setState('loading')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState('denied')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })

      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })

      if (!res.ok) throw new Error('Échec enregistrement serveur')

      setState('subscribed')
    } catch (err) {
      console.error('Erreur abonnement push:', err)
      setState('unsubscribed')
    }
  }

  async function sendTest() {
    setSendStatus('Envoi…')
    try {
      const res = await fetch('/api/send-notification', { method: 'POST' })
      const data = await res.json() as { sent?: number; failed?: number; error?: string }
      if (!res.ok) {
        setSendStatus(data.error ?? 'Erreur')
      } else {
        setSendStatus(`✅ Envoyée (${data.sent} ok, ${data.failed} échec)`)
      }
    } catch {
      setSendStatus('❌ Erreur réseau')
    }
    setTimeout(() => setSendStatus(''), 4000)
  }

  // iOS pas en standalone → avertissement
  if (ios && !standalone) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-start gap-3">
        <Bell size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-zinc-400">
          <span className="font-medium text-white">Notifications push</span>
          <br />
          Sur iOS, installe l&apos;app sur ton écran d&apos;accueil via Safari{' '}
          <span className="text-zinc-500">(Partager → Sur l&apos;écran d&apos;accueil)</span>{' '}
          pour activer les notifications.
        </div>
      </div>
    )
  }

  if (state === 'unsupported') {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 text-sm text-zinc-500">
        <BellOff size={16} />
        Notifications non supportées sur ce navigateur.
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 text-sm text-zinc-500">
        <BellOff size={16} />
        Notifications bloquées. Autorise-les dans les réglages du navigateur.
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm">
        <Bell size={16} className={state === 'subscribed' ? 'text-amber-400' : 'text-zinc-500'} />
        <span className={state === 'subscribed' ? 'text-white' : 'text-zinc-400'}>
          {state === 'subscribed' ? 'Notifications activées' : 'Notifications désactivées'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {sendStatus && (
          <span className="text-xs text-zinc-400">{sendStatus}</span>
        )}

        {state === 'subscribed' ? (
          <button
            onClick={sendTest}
            className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors"
          >
            <Send size={12} />
            Tester
          </button>
        ) : (
          <button
            onClick={subscribe}
            disabled={state === 'loading'}
            className="inline-flex items-center gap-1.5 border border-zinc-700 hover:border-amber-400 text-zinc-400 hover:text-amber-400 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Bell size={12} />
            {state === 'loading' ? 'Chargement…' : 'Activer'}
          </button>
        )}
      </div>
    </div>
  )
}
