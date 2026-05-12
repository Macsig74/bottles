'use client'

import { useState } from 'react'
import { X, Loader2, Check, Megaphone } from 'lucide-react'

const WEBHOOK_URL =
  'https://discord.com/api/webhooks/1503797405827727522/-XpLETno-1RewfPEmBnMVRUnpKAhSpnRe1foGr9uikDt3gvlupoa8UrWMfXSAQa2h30a'

type Category = 'bug' | 'suggestion' | 'autre'

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'bug', label: 'Bug', emoji: '🐛' },
  { value: 'suggestion', label: 'Suggestion', emoji: '💡' },
  { value: 'autre', label: 'Autre', emoji: '💬' },
]

export function FeedbackBanner({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<Category>('bug')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function handleOpen() {
    setOpen(true)
    setDone(false)
    setError('')
    setMessage('')
    setCategory('bug')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError('')

    const cat = CATEGORIES.find(c => c.value === category)!
    const body = {
      embeds: [
        {
          title: `${cat.emoji} Signalement — ${cat.label}`,
          description: message.trim(),
          color: category === 'bug' ? 0xe74c3c : category === 'suggestion' ? 0xf1c40f : 0x95a5a6,
          footer: { text: `Envoyé par ${userName}` },
          timestamp: new Date().toISOString(),
        },
      ],
    }

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      setDone(true)
      setMessage('')
    } catch {
      setError('Envoi échoué, réessaie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <Megaphone size={16} className="text-amber-400 shrink-0" />
          <p className="text-sm text-zinc-300 truncate">
            Une idée ou un bug ? Aide-nous à améliorer l'appli.
          </p>
        </div>
        <button
          onClick={handleOpen}
          className="shrink-0 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-zinc-900 px-3 py-1.5 rounded-lg transition-colors"
        >
          Faire un signalement
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Faire un signalement</h2>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            {done ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check size={24} className="text-emerald-400" />
                </div>
                <p className="text-white font-semibold">Merci pour ton retour !</p>
                <p className="text-sm text-zinc-400">Ton signalement a bien été envoyé.</p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Type</label>
                  <div className="flex gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm font-medium transition-colors ${
                          category === cat.value
                            ? 'bg-amber-400 border-amber-400 text-zinc-900'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                    placeholder={
                      category === 'bug'
                        ? 'Décris le bug : que s\'est-il passé ?'
                        : category === 'suggestion'
                        ? 'Quelle fonctionnalité aimerais-tu voir ?'
                        : 'Ton message…'
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                    autoFocus
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="flex-1 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                    Envoyer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
