'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function ClientDate({
  iso,
  fmt,
  locale,
  className,
}: {
  iso: string
  fmt: string
  locale?: boolean
  className?: string
}) {
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    setLabel(format(new Date(iso), fmt, locale ? { locale: fr } : undefined))
  }, [iso, fmt, locale])

  return <span className={className}>{label ?? '…'}</span>
}
