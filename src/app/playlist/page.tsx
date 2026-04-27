import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import { PlaylistClient } from '@/components/playlist/PlaylistClient'

export default async function PlaylistPage() {
  const supabase = await createClient()

  const { data: songs } = await supabase
    .from('songs')
    .select('*, sheet_music(instrument)')
    .order('position', { ascending: true, nullsFirst: false })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Playlist</h1>
        <Link
          href="/playlist/new"
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} />
          Ajouter
        </Link>
      </div>

      <PlaylistClient initialSongs={songs ?? []} />
    </div>
  )
}
