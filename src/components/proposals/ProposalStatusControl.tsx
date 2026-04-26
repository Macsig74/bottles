'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface Props {
  proposalId: string
  currentStatus: string
}

export function ProposalStatusControl({ proposalId, currentStatus }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function updateStatus(status: 'open' | 'accepted' | 'rejected') {
    if (status === currentStatus) return
    setLoading(true)
    await supabase.from('music_proposals').update({ status }).eq('id', proposalId)
    setLoading(false)
    router.refresh()
  }

  const options: { value: 'open' | 'accepted' | 'rejected'; label: string; style: string }[] = [
    { value: 'open', label: 'En cours', style: 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30' },
    { value: 'accepted', label: 'Accepter', style: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' },
    { value: 'rejected', label: 'Refuser', style: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' },
  ]

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500">Admin :</span>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => updateStatus(opt.value)}
          disabled={loading || opt.value === currentStatus}
          className={`text-xs px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 ${opt.style} ${opt.value === currentStatus ? 'ring-2 ring-white/20' : ''}`}
        >
          {loading ? <Loader2 size={12} className="animate-spin inline" /> : opt.label}
        </button>
      ))}
    </div>
  )
}
