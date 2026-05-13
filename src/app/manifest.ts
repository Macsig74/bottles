import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'The Bottles',
    short_name: 'Bottles',
    description: 'Gestion du groupe The Bottles',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#FBBF24',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
