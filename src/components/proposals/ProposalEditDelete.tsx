'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Trash2, Loader2, X, Check } from 'lucide-react'

interface Props {
  proposalId: string
  proposedBy: string
  userId: string
  isAdmin: boolean
  currentTitle: string
  currentArtist: string
  currentNotes: string | null
  currentYoutubeUrl: string | null
}

export function ProposalEditDelete({
  proposalId,
  proposedBy,
  userId,
  isAdmin,
  currentTitle,
  currentArtist,
  currentNotes,
  currentYoutubeUrl,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'idle' | 'edit' | 'delete'>('idle')
  const [title, setTitle] = useState(currentTitle)
  const [artist, setArtist] = useState(currentArtist)
  const [notes, setNotes] = useState(currentNotes ?? '')
  const [youtubeUrl, setYoutubeUrl] = useState(currentYoutubeUrl ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canAct = isAdmin || proposedBy === userId

  if (!canAct) return null

  async function handleSave() {
    if (!title.trim() || !artist.trim()) { setError('Titre et artiste obligatoires.'); return }
    setLoading(true)
    setError('')
    const { error: err } = await supabase
      .from('music_proposals')
      .update({
        title: title.trim(),
        artist: artist.trim(),
        notes: notes.trim() || null,
        youtube_url: youtubeUrl.trim() || null,
      })
      .eq('id', proposalId)
    setLoading(false)
    if (err) { setError(err.message); return }
    setMode('idle')
    router.refresh()
  }

  async function handleDelete() {
    setLoading(true)
    await supabase.from('music_proposals').delete().eq('id', proposalId)
    router.push('/proposals')
  }

  if (mode === 'edit') {
    return (
      <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-medium">Modifier la proposition</span>
          <button onClick={() => setMode('idle')} className="text-zinc-500 hover:text-white">
            <X size={15} />
          </button>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Titre *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Artiste *</label>
          <input
            type="text"
            value={artist}
            onChange={e => setArtist(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors resize-none"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Lien YouTube</label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('idle')}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-amber-400 hover:bg-amber-300 text-zinc-900 text-sm font-semibold py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Enregistrer
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'delete') {
    return (
      <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
        <p className="text-sm text-white font-semibold">Supprimer cette proposition ?</p>
        <p className="text-xs text-zinc-400">Cette action est irréversible.</p>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('idle')}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-400 text-white text-sm font-semibold py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Supprimer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-2">
      <button
        onClick={() => setMode('edit')}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition-colors px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700"
      >
        <Pencil size={13} />
        Modifier
      </button>
      <button
        onClick={() => setMode('delete')}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-400 transition-colors px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700"
      >
        <Trash2 size={13} />
        Supprimer
      </button>
    </div>
  )
}
