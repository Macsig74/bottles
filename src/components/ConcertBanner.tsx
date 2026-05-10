import { Music2 } from 'lucide-react'
import { format, differenceInDays, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

const CONCERT_DATES = [
  '2026-05-30',
  '2026-10-31',
  '2026-12-05',
  '2027-06-20',
]

export function ConcertBanner() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const next = CONCERT_DATES
    .map(d => parseISO(d))
    .find(d => d >= today)

  if (!next) return null

  const days = differenceInDays(next, today)
  const label = format(next, 'd MMMM yyyy', { locale: fr })

  return (
    <div className="sticky top-16 z-40 bg-amber-400 text-zinc-900 px-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold">
      <Music2 size={15} />
      Prochain concert : {label}
      {days === 0 ? (
        <span className="ml-1 font-bold">— c&apos;est aujourd&apos;hui !</span>
      ) : (
        <span className="ml-1 opacity-70">— dans {days} jour{days > 1 ? 's' : ''}</span>
      )}
    </div>
  )
}
