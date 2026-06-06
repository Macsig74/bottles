'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Music, Plus, Trash2, Search, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface Song { id: string; title: string; artist: string }
interface RehearsalSong { id: string; song_id: string; songs: Song }

interface Props {
  sessionId: string
  initialSongs: RehearsalSong[]
  allSongs: Song[]
}

export function RehearsalSongPicker({ sessionId, initialSongs, allSongs }: Props) {
  const supabase = createClient()

  const [songs, setSongs] = useState<RehearsalSong[]>(initialSongs)
  const [open, setOpen] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [query, setQuery] = useState('')
  const [removing, setRemoving] = useState<string | null>(null)
  const [adding, setAdding] = useState<string | null>(null)

  const alreadyAdded = new Set(songs.map(s => s.song_id))
  const filtered = allSongs.filter(s =>
    !alreadyAdded.has(s.id) &&
    (s.title.toLowerCase().includes(query.toLowerCase()) ||
     s.artist.toLowerCase().includes(query.toLowerCase()))
  )

  async function addSong(song: Song) {
    setAdding(song.id)
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('rehearsal_songs')
      .insert({ session_id: sessionId, song_id: song.id, added_by: user?.id ?? null, position: songs.length })
      .select('id, song_id, songs(id, title, artist)')
      .single()

    if (!error && data) {
      const entry = { ...data, songs: Array.isArray(data.songs) ? data.songs[0] : data.songs } as RehearsalSong
      setSongs(prev => [...prev, entry])
    }
    setAdding(null)
    setQuery('')
  }

  async function removeSong(entry: RehearsalSong) {
    setRemoving(entry.id)
    await supabase.from('rehearsal_songs').delete().eq('id', entry.id)
    setSongs(prev => prev.filter(s => s.id !== entry.id))
    setRemoving(null)
  }

  return (
    <div className="mt-3 border-t border-zinc-800 pt-3">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors w-full"
      >
        <Music size={13} className="text-amber-400" />
        <span className="font-medium">Morceaux à travailler</span>
        <span className="text-zinc-600 ml-1">({songs.length})</span>
        <span className="ml-auto">
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {open && (
        <div className="mt-2 space-y-1.5">
          {/* Song list */}
          {songs.map(entry => (
            <div key={entry.id} className="flex items-center gap-2 bg-zinc-800/60 rounded-xl px-3 py-2">
              <Music size={12} className="text-amber-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white truncate block">{entry.songs?.title}</span>
                <span className="text-xs text-zinc-500">{entry.songs?.artist}</span>
              </div>
              <button
                onClick={() => removeSong(entry)}
                disabled={removing === entry.id}
                className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"
              >
                {removing === entry.id
                  ? <Loader2 size={13} className="animate-spin" />
                  : <Trash2 size={13} />}
              </button>
            </div>
          ))}

          {songs.length === 0 && !showPicker && (
            <p className="text-xs text-zinc-600 px-1">Aucun morceau ajouté.</p>
          )}

          {/* Add button */}
          {!showPicker ? (
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-amber-400 transition-colors mt-1 px-1"
            >
              <Plus size={13} /> Ajouter un morceau
            </button>
          ) : (
            <div className="mt-2 bg-zinc-900 border border-zinc-700 rounded-xl p-2">
              {/* Search */}
              <div className="relative mb-2">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Rechercher…"
                  autoFocus
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-8 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="max-h-40 overflow-y-auto space-y-0.5">
                {filtered.length === 0 && (
                  <p className="text-xs text-zinc-600 px-2 py-1">
                    {query ? 'Aucun résultat.' : 'Tous les morceaux sont déjà ajoutés.'}
                  </p>
                )}
                {filtered.map(song => (
                  <button
                    key={song.id}
                    onClick={() => addSong(song)}
                    disabled={adding === song.id}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-700 transition-colors text-left disabled:opacity-50"
                  >
                    {adding === song.id
                      ? <Loader2 size={12} className="text-amber-400 animate-spin shrink-0" />
                      : <Plus size={12} className="text-amber-400 shrink-0" />}
                    <div className="min-w-0">
                      <div className="text-sm text-white truncate">{song.title}</div>
                      <div className="text-xs text-zinc-500">{song.artist}</div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setShowPicker(false); setQuery('') }}
                className="mt-2 text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
              >
                <X size={11} /> Fermer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
