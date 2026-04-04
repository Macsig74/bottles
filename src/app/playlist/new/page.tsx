'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewSongPage() {
  const supabase = createClient()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase.from('songs').insert({
      title,
      artist,
      notes: notes || null,
      added_by: user.id,
    }).select().single()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/playlist/${data.id}`)
      router.refresh()
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24 sm:pb-8">
      <Link href="/playlist" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} />
        Retour
      </Link>

      <h1 className="text-2xl font-bold text-white mb-6">Ajouter un morceau</h1>

      <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Titre *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="Titre du morceau"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Artiste *</label>
          <input
            type="text"
            value={artist}
            onChange={e => setArtist(e.target.value)}
            required
            placeholder="Artiste ou groupe"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Tonalité, tempo, infos…"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? 'Ajout…' : 'Ajouter'}
        </button>
      </form>
    </div>
  )
}
