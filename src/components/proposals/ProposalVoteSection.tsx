'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react'

interface Vote {
  id: string
  user_id: string
  vote: 'yes' | 'no'
  reason: string | null
  profiles: { name: string } | null
}

interface Props {
  proposalId: string
  userId: string
  myVote: Vote | null
  yesVotes: Vote[]
  noVotes: Vote[]
  proposalStatus: string
}

export function ProposalVoteSection({ proposalId, userId, myVote, yesVotes, noVotes, proposalStatus }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [pendingVote, setPendingVote] = useState<'yes' | 'no' | null>(null)
  const [reason, setReason] = useState('')
  const [showReasonInput, setShowReasonInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isClosed = proposalStatus !== 'open'

  async function submitVote(vote: 'yes' | 'no', reasonText?: string) {
    setLoading(true)
    setError('')

    if (myVote) {
      // Update existing vote
      const { error: err } = await supabase
        .from('proposal_votes')
        .update({ vote, reason: reasonText ?? null })
        .eq('id', myVote.id)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      // Insert new vote
      const { error: err } = await supabase
        .from('proposal_votes')
        .insert({ proposal_id: proposalId, user_id: userId, vote, reason: reasonText ?? null })
      if (err) { setError(err.message); setLoading(false); return }
    }

    setLoading(false)
    setPendingVote(null)
    setShowReasonInput(false)
    setReason('')
    router.refresh()
  }

  async function handleVoteClick(vote: 'yes' | 'no') {
    if (isClosed) return
    if (vote === 'no') {
      setPendingVote('no')
      setShowReasonInput(true)
    } else {
      setPendingVote('yes')
      await submitVote('yes')
    }
  }

  async function handleNoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) { setError('Tu dois donner une raison pour voter non.'); return }
    await submitVote('no', reason.trim())
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
      <h2 className="font-semibold text-white mb-4">Votes</h2>

      {!isClosed && (
        <div className="mb-5">
          <p className="text-sm text-zinc-400 mb-3">
            {myVote ? 'Tu as déjà voté — tu peux changer ton vote.' : 'Donne ton avis sur ce morceau :'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleVoteClick('yes')}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                myVote?.vote === 'yes'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-emerald-500/20 hover:text-emerald-400 border border-zinc-700'
              }`}
            >
              {loading && pendingVote === 'yes' ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
              Oui ({yesVotes.length})
            </button>
            <button
              onClick={() => handleVoteClick('no')}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                myVote?.vote === 'no'
                  ? 'bg-red-500 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-red-500/20 hover:text-red-400 border border-zinc-700'
              }`}
            >
              {loading && pendingVote === 'no' ? <Loader2 size={14} className="animate-spin" /> : <ThumbsDown size={14} />}
              Non ({noVotes.length})
            </button>
          </div>

          {showReasonInput && (
            <form onSubmit={handleNoSubmit} className="mt-3 space-y-2">
              <label className="block text-sm text-zinc-400">
                Pourquoi tu votes non ? <span className="text-red-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Donne une raison..."
                rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500 transition-colors resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  {loading && <Loader2 size={13} className="animate-spin" />}
                  Confirmer non
                </button>
                <button
                  type="button"
                  onClick={() => { setShowReasonInput(false); setPendingVote(null); setReason('') }}
                  className="text-zinc-400 hover:text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          {error && (
            <p className="mt-2 text-red-400 text-sm">{error}</p>
          )}
        </div>
      )}

      {/* Vote results */}
      <div className="space-y-4">
        {yesVotes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <ThumbsUp size={12} /> Pour ({yesVotes.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {yesVotes.map(v => (
                <span key={v.id} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-lg">
                  {(v.profiles as any)?.name ?? 'Inconnu'}
                </span>
              ))}
            </div>
          </div>
        )}

        {noVotes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <ThumbsDown size={12} /> Contre ({noVotes.length})
            </div>
            <div className="space-y-2">
              {noVotes.map(v => (
                <div key={v.id} className="bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2">
                  <span className="text-red-400 text-xs font-medium">{(v.profiles as any)?.name ?? 'Inconnu'}</span>
                  {v.reason && (
                    <p className="text-zinc-400 text-sm mt-0.5">{v.reason}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {yesVotes.length === 0 && noVotes.length === 0 && (
          <p className="text-zinc-600 text-sm">Aucun vote pour l&apos;instant.</p>
        )}
      </div>
    </div>
  )
}
