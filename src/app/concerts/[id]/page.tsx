import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, MapPin, FileText } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { SetlistManager } from '@/components/concerts/SetlistManager'
import { DeleteConcertButton } from '@/components/concerts/DeleteConcertButton'
import { EditConcertButton } from '@/components/concerts/EditConcertButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ConcertPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: concert }, { data: setlistRaw }, { data: allSongs }] = await Promise.all([
    supabase.from('concerts').select('*, profiles(name)').eq('id', id).single(),
    supabase
      .from('concert_setlist')
      .select('*, songs(id, title, artist)')
      .eq('concert_id', id)
      .order('position', { ascending: true }),
    supabase.from('songs').select('id, title, artist').order('position', { ascending: true }),
  ])

  if (!concert) notFound()

  const d = parseISO(concert.date)

  // Reshape setlist entries so songs is always an object (not array)
  const setlist = (setlistRaw ?? []).map((e: any) => ({
    ...e,
    songs: Array.isArray(e.songs) ? e.songs[0] : e.songs,
  }))

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
          Retour
        </Link>
        <div className="flex items-center gap-3">
          <EditConcertButton
            concertId={id}
            initialTitle={concert.title}
            initialDate={concert.date}
            initialLocation={concert.location}
            initialNotes={concert.notes}
          />
          <DeleteConcertButton concertId={id} />
        </div>
      </div>

      {/* Concert header */}
      <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 mb-6">
        <h1 className="text-2xl font-bold text-white mb-3">
          {concert.title ?? format(d, 'EEEE d MMMM yyyy', { locale: fr })}
        </h1>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-zinc-300 text-sm">
            <CalendarDays size={14} className="text-amber-400 shrink-0" />
            <span className="capitalize">
              {concert.title
                ? format(d, "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })
                : format(d, "HH'h'mm", { locale: fr })}
            </span>
          </div>
          {concert.location && (
            <div className="flex items-center gap-2 text-zinc-300 text-sm">
              <MapPin size={14} className="text-amber-400 shrink-0" />
              {concert.location}
            </div>
          )}
          {concert.notes && (
            <div className="flex items-start gap-2 text-zinc-300 text-sm mt-3 pt-3 border-t border-zinc-800">
              <FileText size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="whitespace-pre-wrap">{concert.notes}</p>
            </div>
          )}
        </div>

        {(concert as any).profiles?.name && (
          <p className="mt-3 text-xs text-zinc-500">
            Créé par {(concert as any).profiles.name}
          </p>
        )}
      </div>

      {/* Setlist */}
      <SetlistManager
        concertId={id}
        initialSetlist={setlist}
        allSongs={allSongs ?? []}
      />
    </div>
  )
}
