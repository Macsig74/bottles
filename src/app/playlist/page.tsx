import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Music } from 'lucide-react'

export default async function PlaylistPage() {
  const supabase = await createClient()

  const { data: songs } = await supabase
    .from('songs')
    .select('*, profiles(name), sheet_music(instrument)')
    .order('title', { ascending: true })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Playlist</h1>
        <Link
          href="/playlist/new"
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} />
          Ajouter un morceau
        </Link>
      </div>

      {songs && songs.length > 0 ? (
        <div className="space-y-2">
          {songs.map((song: any) => {
            const instruments = [...new Set<string>(song.sheet_music?.map((s: any) => s.instrument as string) ?? [])]
            return (
              <Link
                key={song.id}
                href={`/playlist/${song.id}`}
                className="flex items-center justify-between bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl px-5 py-4 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center shrink-0">
                    <Music size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{song.title}</div>
                    <div className="text-sm text-zinc-400">{song.artist}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {instruments.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {instruments.slice(0, 3).map((inst: string) => (
                        <span
                          key={inst}
                          className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full"
                        >
                          {inst}
                        </span>
                      ))}
                      {instruments.length > 3 && (
                        <span className="text-xs text-zinc-500">+{instruments.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">Aucun morceau pour l'instant.</p>
          <Link href="/playlist/new" className="text-amber-400 hover:underline mt-2 block">
            Ajouter le premier morceau →
          </Link>
        </div>
      )}
    </div>
  )
}
