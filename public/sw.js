const CACHE = 'bottles-v1'
const OFFLINE = '/'

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add(OFFLINE)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match(OFFLINE)))
  }
})

// ── Push notifications ────────────────────────────────────────────────────────

self.addEventListener('push', e => {
  if (!e.data) return

  let payload
  try {
    payload = e.data.json()
  } catch {
    payload = { title: 'The Bottles', body: e.data.text(), url: '/' }
  }

  const {
    title = 'The Bottles',
    body = '',
    url = '/',
    icon = '/icon-192.png',
    badge = '/icon-192.png',
  } = payload

  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data: { url },
      vibrate: [200, 100, 200],
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url ?? '/'

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Si l'app est déjà ouverte, on focus l'onglet
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      // Sinon on ouvre une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})
