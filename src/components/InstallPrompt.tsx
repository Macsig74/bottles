'use client'

import { useEffect, useState } from 'react'
import { X, Share, Download } from 'lucide-react'

type Platform = 'ios' | 'android' | null

export function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Already installed as PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    if (isStandalone) return

    // Already dismissed
    if (localStorage.getItem('pwa-prompt-dismissed')) return

    const ua = navigator.userAgent

    // iOS Safari detection
    const isIOS = /iPhone|iPad|iPod/.test(ua)
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua)
    if (isIOS && isSafari) {
      setPlatform('ios')
      setVisible(true)
      return
    }

    // Android / Chrome — beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setPlatform('android')
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem('pwa-prompt-dismissed', '1')
    setVisible(false)
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    else dismiss()
    setDeferredPrompt(null)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            {platform === 'ios'
              ? <Share size={18} className="text-amber-400" />
              : <Download size={18} className="text-amber-400" />
            }
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Installer l'appli</p>

            {platform === 'ios' ? (
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Appuie sur{' '}
                <span className="inline-flex items-center gap-0.5 text-white font-medium">
                  <Share size={11} className="inline" /> Partager
                </span>
                {' '}puis <span className="text-white font-medium">"Sur l'écran d'accueil"</span> pour accéder à l'appli comme une vraie app.
              </p>
            ) : (
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Installe The Bottles sur ton téléphone pour y accéder directement depuis l'écran d'accueil.
              </p>
            )}

            {platform === 'android' && (
              <button
                onClick={install}
                className="mt-3 w-full bg-amber-400 hover:bg-amber-300 text-zinc-900 text-xs font-semibold py-2 rounded-xl transition-colors"
              >
                Installer
              </button>
            )}
          </div>

          {/* Close */}
          <button
            onClick={dismiss}
            className="text-zinc-500 hover:text-white transition-colors p-0.5 shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
