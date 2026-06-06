'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Music, ChevronDown, ChevronUp } from 'lucide-react'

interface Song { id: string; title: string; artist: string }
interface Props {
  songs: Song[]
  sessionId: string
}

export function NextRehearsalSongs({ songs, sessionId }: Props) {
  const [open, setOpen] = useState(false)

  if (songs.length === 0) {
    return (
      <p className="text-zinc-500 text-sm">
        Aucun morceau planifié.{' '}
        <Link href="/rehearsals" className="text-amber-400 hover:underline">
          Ajouter →
        </Link>
      </p>
    )
  }

  const preview = songs.slice(0, 3)
  const rest = songs.slice(3)

  return (
    <div>
      <ul className="space-y-2">
        {preview.map(song => (
          <li key={song.id}>
            <Link
              href={`/playlist/${song.id}`}
              className="flex items-center gap-3 hover:bg-zinc-800 rounded-xl p-2.5 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                <Music size={13} className="text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-white text-sm truncate">{song.title}</div>
                <div className="text-xs text-zinc-400">{song.artist}</div>
              </div>
            </Link>
          </li>
        ))}

        {open && rest.map(song => (
          <li key={song.id}>
            <Link
              href={`/playlist/${song.id}`}
              className="flex items-center gap-3 hover:bg-zinc-800 rounded-xl p-2.5 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                <Music size={13} className="text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-white text-sm truncate">{song.title}</div>
                <div className="text-xs text-zinc-400">{song.artist}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {rest.length > 0 && (
        <button
          onClick={() => setOpen(v => !v)}
          className="mt-3 flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition-colors"
        >
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {open ? 'Réduire' : `Voir ${rest.length} de plus`}
        </button>
      )}
    </div>
  )
}
