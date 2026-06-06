'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ThumbsUp, ThumbsDown, CheckCircle, XCircle, Circle, Loader2 } from 'lucide-react'

interface Vote { user_id: string; vote: 'yes' | 'no' }

interface Proposal {
  id: string
  title: string
  artist: string
  status: string
  profiles: { name: string } | null
  proposal_votes: Vote[]
}

interface Props {
  proposal: Proposal
  userId: string
}

const statusLabel: Record<string, string> = {
  open: 'En cours',
  accepted: 'Accepté',
  rejected: 'Refusé',
}

const statusStyle: Record<string, string> = {
  open: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  accepted: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'accepted') return <CheckCircle size={12} />
  if (status === 'rejected') return <XCircle size={12} />
  return <Circle size={12} />
}

export function ProposalCard({ proposal, userId }: Props) {
  const supabase = createClient()

  const [votes, setVotes] = useState<Vote[]>(proposal.proposal_votes)
  const [loading, setLoading] = useState(false)

  const myVote = votes.find(v => v.user_id === userId)
  const yes = votes.filter(v => v.vote === 'yes').length
  const no = votes.filter(v => v.vote === 'no').length
  const isClosed = proposal.status !== 'open'

  async function handleVote(e: React.MouseEvent, vote: 'yes' | 'no') {
    e.preventDefault()
    e.stopPropagation()
    if (isClosed || loading) return

    setLoading(true)

    // Optimistic update
    if (myVote) {
      if (myVote.vote === vote) {
        // toggle off
        setVotes(prev => prev.filter(v => v.user_id !== userId))
        await supabase.from('proposal_votes').delete()
          .eq('proposal_id', proposal.id).eq('user_id', userId)
      } else {
        setVotes(prev => prev.map(v => v.user_id === userId ? { ...v, vote } : v))
        await supabase.from('proposal_votes').update({ vote })
          .eq('proposal_id', proposal.id).eq('user_id', userId)
      }
    } else {
      setVotes(prev => [...prev, { user_id: userId, vote }])
      await supabase.from('proposal_votes').insert({
        proposal_id: proposal.id,
        user_id: userId,
        vote,
      })
    }

    setLoading(false)
  }

  return (
    <li>
      <Link
        href={`/proposals/${proposal.id}`}
        className="block bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-white truncate">{proposal.title}</div>
            <div className="text-sm text-zinc-400">{proposal.artist}</div>
            <div className="text-xs text-zinc-500 mt-1">
              Proposé par {(proposal.profiles as any)?.name ?? 'inconnu'}
            </div>
          </div>
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg shrink-0 ${statusStyle[proposal.status]}`}>
            <StatusIcon status={proposal.status} />
            {statusLabel[proposal.status]}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-3">
          {/* Vote yes */}
          <button
            onClick={(e) => handleVote(e, 'yes')}
            disabled={isClosed || loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 ${
              myVote?.vote === 'yes'
                ? 'bg-emerald-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-emerald-900/40 hover:text-emerald-400 border border-zinc-700'
            }`}
          >
            {loading && myVote?.vote !== 'no'
              ? <Loader2 size={13} className="animate-spin" />
              : <ThumbsUp size={13} />}
            {yes}
          </button>

          {/* Vote no */}
          <button
            onClick={(e) => handleVote(e, 'no')}
            disabled={isClosed || loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 ${
              myVote?.vote === 'no'
                ? 'bg-red-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-red-900/40 hover:text-red-400 border border-zinc-700'
            }`}
          >
            {loading && myVote?.vote !== 'yes'
              ? <Loader2 size={13} className="animate-spin" />
              : <ThumbsDown size={13} />}
            {no}
          </button>

          <span className="text-xs text-zinc-600 ml-auto">Voir détails →</span>
        </div>
      </Link>
    </li>
  )
}
