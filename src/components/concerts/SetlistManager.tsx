'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Music, Search, X } from 'lucide-react'

type Song = { id: string; title: string; artist: string }
type SetlistEntry = { id: string; song_id: string; position: number; songs: Song }

interface Props {
  concertId: string
  initialSetlist: SetlistEntry[]
  allSongs: Song[]
}

export function SetlistManager({ concertId, initialSetlist, allSongs }: Props) {
  const supabase = createClient()
  const router = useRouter()

  const [setlist, setSetlist] = useState<SetlistEntry[]>(initialSetlist)
  const [showPicker, setShowPicker] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const setlistIds = new Set(setlist.map(e => e.song_id))
  const available = allSongs.filter(s =>
    !setlistIds.has(s.id) &&
    (s.title.toLowerCase().includes(search.toLowerCase()) ||
     s.artist.toLowerCase().includes(search.toLowerCase()))
  )

  async function addSong(song: Song) {
    setLoading(song.id)
    const position = setlist.length
    const { data, error } = await supabase
      .from('concert_setlist')
      .insert({ concert_id: concertId, song_id: song.id, position })
      .select()
      .single()

    if (!error && data) {
      setSetlist(prev => [...prev, { ...data, songs: song }])
    }
    setLoading(null)
  }

  async function removeSong(entryId: string) {
    setLoading(entryId)
    const { error } = await supabase
      .from('concert_setlist')
      .delete()
      .eq('id', entryId)

    if (!error) {
      setSetlist(prev => prev.filter(e => e.id !== entryId))
    }
    setLoading(null)
  }

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800">
      <div className="flex items-center justify-between p-5 border-b border-zinc-800">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Music size={16} className="text-amber-400" />
          Setlist <span className="text-zinc-500 font-normal text-sm">({setlist.length} morceaux)</span>
        </h2>
        <button
          onClick={() => { setShowPicker(true); setSearch('') }}
          className="flex items-center gap-1.5 text-sm bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={14} />
          Ajouter
        </button>
      </div>

      {/* Setlist */}
      {setlist.length === 0 ? (
        <div className="p-8 text-center text-zinc-500 text-sm">
          Aucun morceau dans la setlist.{' '}
          <button
            onClick={() => { setShowPicker(true); setSearch('') }}
            className="text-amber-400 hover:underline"
          >
            Ajouter depuis la playlist →
          </button>
        </div>
      ) : (
        <ol className="divide-y divide-zinc-800">
          {setlist
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((entry, idx) => (
              <li key={entry.id} className="flex items-center gap-4 px-5 py-3">
                <span className="text-zinc-600 text-sm font-mono w-5 text-right shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{entry.songs.title}</div>
                  <div className="text-xs text-zinc-400 truncate">{entry.songs.artist}</div>
                </div>
                <button
                  onClick={() => removeSong(entry.id)}
                  disabled={loading === entry.id}
                  className="shrink-0 text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-40"
                  title="Retirer de la setlist"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
        </ol>
      )}

      {/* Song picker modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md max-h-[70vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
              <h3 className="font-semibold text-white">Ajouter depuis la playlist</h3>
              <button
                onClick={() => setShowPicker(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2">
                <Search size={14} className="text-zinc-500 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un morceau…"
                  className="bg-transparent text-white placeholder-zinc-500 text-sm flex-1 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {available.length === 0 ? (
                <p className="p-6 text-center text-zinc-500 text-sm">
                  {search ? 'Aucun résultat.' : 'Tous les morceaux sont déjà dans la setlist.'}
                </p>
              ) : (
                <ul className="divide-y divide-zinc-800">
                  {available.map(song => (
                    <li key={song.id}>
                      <button
                        onClick={() => addSong(song)}
                        disabled={loading === song.id}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left disabled:opacity-50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{song.title}</div>
                          <div className="text-xs text-zinc-400 truncate">{song.artist}</div>
                        </div>
                        <Plus size={14} className="text-zinc-500 shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
