import { Guitar, Drum, Mic2, Music, Volume2, Piano, Settings } from 'lucide-react'
import type { LucideProps } from 'lucide-react'

type IconProps = { size?: number }

// Les paths headstock + manche sont identiques à l'icône lucide Guitar
const HEADSTOCK = 'M20.1 2.3a1 1 0 0 0-1.4 0l-1.114 1.114A2 2 0 0 0 17 4.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 17.828 7h1.344a2 2 0 0 0 1.414-.586L21.7 5.3a1 1 0 0 0 0-1.4z'
const NECK = 'm11.9 12.1 4.514-4.514'
const STRAP = 'm6 16 2 2'
const SVG_PROPS = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

// Corps type Les Paul — solid, arrondi, pas de rosace
function ElectricGuitarIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...SVG_PROPS}>
      <path d={HEADSTOCK} />
      <path d={NECK} />
      <path d={STRAP} />
      {/* body solid Les Paul */}
      <path d="M8.23 9.85C8 8 10 7 12 8.5C14 10 14 13 13 15C12 17 10.5 18 10 18C8.5 21 7 23 5 22C2.5 21 1.5 18.5 2.5 16C3.5 13.5 6.5 12.5 7.5 11C8 10.5 8 10 8.23 9.85Z" />
      {/* pickup */}
      <line x1="9" y1="15.5" x2="12.5" y2="14" />
    </svg>
  )
}

// Corps type Precision Bass — corne supérieure caractéristique, pas de rosace
function BassGuitarIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...SVG_PROPS}>
      <path d={HEADSTOCK} />
      <path d={NECK} />
      <path d={STRAP} />
      {/* body with upper horn toward headstock */}
      <path d="M8.23 9.85L11 7.5C13 6.5 15 8 14 11L13.5 12C14 15 13 19 11 21C9 23 5 22.5 3 20.5C1 18.5 1.5 15.5 3.5 13.5C5.5 11.5 7 10.5 8.23 9.85Z" />
    </svg>
  )
}

type IconComponent = React.ComponentType<LucideProps> | React.ComponentType<IconProps>

const map: Record<string, IconComponent> = {
  batterie: Drum,
  drums: Drum,
  drum: Drum,
  chant: Mic2,
  vocals: Mic2,
  voix: Mic2,
  guitare: Guitar,
  guitar: Guitar,
  electrique: ElectricGuitarIcon,
  electric: ElectricGuitarIcon,
  basse: BassGuitarIcon,
  bass: BassGuitarIcon,
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
  const Icon = (map[key] ?? Music) as React.ComponentType<{ size?: number }>
  return <Icon size={size} />
}
