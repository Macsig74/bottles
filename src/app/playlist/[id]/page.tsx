import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Music } from 'lucide-react'
import { SheetMusicSection } from '@/components/playlist/SheetMusicSection'

export default async function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: song } = await supabase
    .from('songs')
    .select('*, profiles(name)')
    .eq('id', id)
    .single()

  if (!song) notFound()

  const { data: sheetMusicList } = await supabase
    .from('sheet_music')
    .select('*, profiles(name)')
    .eq('song_id', id)
    .order('instrument', { ascending: true })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <Link href="/playlist" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} />
        Playlist
      </Link>

      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0">
            <Music size={24} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{song.title}</h1>
            <p className="text-zinc-400 text-lg">{song.artist}</p>
            {song.profiles && (
              <p className="text-zinc-500 text-sm mt-1">Added by {song.profiles.name}</p>
            )}
            {song.notes && (
              <p className="text-zinc-300 text-sm mt-3 bg-zinc-800 rounded-xl px-4 py-3">{song.notes}</p>
            )}
          </div>
        </div>
      </div>

      <SheetMusicSection
        songId={id}
        sheetMusicList={sheetMusicList ?? []}
        userId={user!.id}
      />
    </div>
  )
}
