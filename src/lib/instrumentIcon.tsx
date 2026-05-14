import { Guitar, Drum, Mic2, Music, Volume2, Piano, Settings, Zap } from 'lucide-react'
import type { LucideProps } from 'lucide-react'

const map: Record<string, React.ComponentType<LucideProps>> = {
  batterie: Drum,
  drums: Drum,
  drum: Drum,
  chant: Mic2,
  vocals: Mic2,
  voix: Mic2,
  guitare: Guitar,
  guitar: Guitar,
  electrique: Zap,
  electric: Zap,
  basse: Music,
  bass: Music,
  piano: Piano,
  clavier: Piano,
  keys: Piano,
  sono: Volume2,
  son: Volume2,
  sound: Volume2,
  admin: Settings,
}

export function InstrumentIcon({
  instrument,
  size = 14,
  ...props
}: { instrument: string | null | undefined; size?: number } & Omit<LucideProps, 'size'>) {
  const key = (instrument ?? '').toLowerCase().trim()
  const Icon = map[key] ?? Music
  return <Icon size={size} {...props} />
}
