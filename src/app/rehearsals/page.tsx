import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import { SessionCard } from '@/components/rehearsals/SessionCard'

export default async function RehearsalsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: sessions }, { data: allSongs }] = await Promise.all([
    supabase.from('profiles').select('is_admin').eq('id', user.id).single(),
    supabase
      .from('rehearsal_sessions')
      .select('*, profiles(name), session_votes(user_id, can_attend, profiles(name, instrument)), rehearsal_songs(id, song_id, songs(id, title, artist))')
      .gte('proposed_date', new Date().toISOString())
      .order('proposed_date', { ascending: true }),
    supabase.from('songs').select('id, title, artist').order('title', { ascending: true }),
  ])

  const isAdmin = (profile as any)?.is_admin === true

  // Reshape rehearsal_songs.songs (can come as array from join)
  const reshapedSessions = (sessions ?? []).map((s: any) => ({
    ...s,
    rehearsal_songs: (s.rehearsal_songs ?? []).map((rs: any) => ({
      ...rs,
      songs: Array.isArray(rs.songs) ? rs.songs[0] : rs.songs,
    })),
  }))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Répétitions</h1>
        <Link
          href="/rehearsals/new"
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Proposer une date</span>
          <span className="sm:hidden">Proposer</span>
        </Link>
      </div>

      {reshapedSessions.length > 0 ? (
        <div className="space-y-4">
          {reshapedSessions.map((session: any) => (
            <SessionCard
              key={session.id}
              session={session}
              userId={user.id}
              isAdmin={isAdmin}
              allSongs={allSongs ?? []}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">Aucune répétition proposée.</p>
          <Link href="/rehearsals/new" className="text-amber-400 hover:underline mt-2 block">
            Proposer la première date
          </Link>
        </div>
      )}
    </div>
  )
}
