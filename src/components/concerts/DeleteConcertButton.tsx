'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

export function DeleteConcertButton({ concertId }: { concertId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await supabase.from('concerts').delete().eq('id', concertId)
    router.push('/')
    router.refresh()
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">Supprimer ?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50"
        >
          Oui
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-sm text-zinc-500 hover:text-white transition-colors"
        >
          Non
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition-colors text-sm"
    >
      <Trash2 size={14} />
      Supprimer
    </button>
  )
}
